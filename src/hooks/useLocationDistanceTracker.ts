import {
	Accuracy,
	getCurrentPositionAsync,
	getForegroundPermissionsAsync,
	requestForegroundPermissionsAsync
} from 'expo-location'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Pandals } from '@/types/dbTypes'
import { calculateDistance, formatDistance } from '@/utils/distanceUtils'

interface UserLocation {
	latitude: number
	longitude: number
}

export interface PandalWithDistance extends Pandals {
	distance: number
	formattedDistance: string
}

export function useLocationDistanceTracker(
	pandals: Pandals[],
	updateInterval = 60_000
) {
	const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
	const [locationPermission, setLocationPermission] = useState(false)
	const [isLoadingLocation, setIsLoadingLocation] = useState(false)
	const [locationError, setLocationError] = useState<string | null>(null)

	const requestLocationPermission = useCallback(async () => {
		try {
			const { status } = await requestForegroundPermissionsAsync()
			const granted = status === 'granted'
			setLocationPermission(granted)
			return granted
		} catch {
			setLocationError('Failed to request location permission')
			return false
		}
	}, [])

	const getCurrentLocation = useCallback(async () => {
		try {
			setIsLoadingLocation(true)
			setLocationError(null)

			const { status } = await getForegroundPermissionsAsync()
			if (status !== 'granted') {
				const hasPermission = await requestLocationPermission()
				if (!hasPermission) {
					setLocationError('Location permission denied')
					return null
				}
			} else {
				setLocationPermission(true)
			}

			const location = await getCurrentPositionAsync({
				accuracy: Accuracy.Balanced,
				timeInterval: 5000,
				distanceInterval: 10
			})

			const newLocation = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude
			}

			setUserLocation(newLocation)
			setLocationError(null)
			return newLocation
		} catch {
			setLocationError('Failed to get current location')
			return null
		} finally {
			setIsLoadingLocation(false)
		}
	}, [requestLocationPermission])

	const refreshLocation = useCallback(() => {
		getCurrentLocation()
	}, [getCurrentLocation])

	const pandalsWithDistance = useMemo(() => {
		if (!(userLocation && pandals) || pandals.length === 0) {
			return pandals.map((pandal) => ({
				...pandal,
				distance: 0,
				formattedDistance: 'Unknown'
			}))
		}

		const validPandals = pandals.filter(
			(pandal) =>
				pandal.latitude !== null &&
				pandal.longitude !== null &&
				typeof pandal.latitude === 'number' &&
				typeof pandal.longitude === 'number'
		)

		return validPandals
			.map((pandal) => {
				const distance = calculateDistance(
					userLocation.latitude,
					userLocation.longitude,
					pandal.latitude,
					pandal.longitude
				)

				return {
					...pandal,
					distance,
					formattedDistance: formatDistance(distance)
				}
			})
			.sort((a, b) => a.distance - b.distance)
	}, [userLocation, pandals])

	useEffect(() => {
		getCurrentLocation()
	}, [getCurrentLocation])

	useEffect(() => {
		if (!locationPermission) {
			return
		}

		const interval = setInterval(() => {
			getCurrentLocation()
		}, updateInterval)

		return () => clearInterval(interval)
	}, [getCurrentLocation, locationPermission, updateInterval])

	return {
		pandalsWithDistance,
		userLocation,
		locationPermission,
		isLoadingLocation,
		locationError,
		refreshLocation
	}
}
