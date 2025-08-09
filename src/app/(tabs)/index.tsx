import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import CustomMarker from '@/components/Maps/CustomMarker'
import PandalDetails from '@/components/PandalDetails/PandalDetails'
import useSupabase from '@/lib/supabase'
import { usePandalStore } from '@/stores/pandalStore'
import type { Pandals } from '@/types/dbTypes'

interface PandalDetailsRef {
	closeSheet: () => void
}

const INITIAL_REGION = {
	latitude: 22.686_497,
	longitude: 88.434_997,
	latitudeDelta: 0.1,
	longitudeDelta: 0.1
}

export default function HomeScreen() {
	const supabase = useSupabase()
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
	const pandalDetailsRef = useRef<PandalDetailsRef>(null)
	const markerPressedRef = useRef(false)
	const mapRef = useRef<MapView>(null)

	const pandals = usePandalStore((state) => state.pandals)
	const selectedPandal = usePandalStore((state) => state.selectedPandal)
	const loading = usePandalStore((state) => state.loading)
	const error = usePandalStore((state) => state.error)
	const setSelectedPandal = usePandalStore((state) => state.setSelectedPandal)
	const retryFetch = usePandalStore((state) => state.retryFetch)

	// Automatically show bottom sheet and focus map when a pandal is selected from another tab
	useEffect(() => {
		if (selectedPandal && !isBottomSheetVisible) {
			setIsBottomSheetVisible(true)

			// Focus map camera on the selected pandal
			if (
				mapRef.current &&
				selectedPandal.latitude &&
				selectedPandal.longitude
			) {
				mapRef.current.animateToRegion(
					{
						latitude: selectedPandal.latitude,
						longitude: selectedPandal.longitude,
						latitudeDelta: 0.04,
						longitudeDelta: 0.04
					},
					1000
				) // 1 second animation
			}
		}
	}, [selectedPandal, isBottomSheetVisible])

	const handleMarkerPress = (pandal: Pandals) => {
		markerPressedRef.current = true
		setSelectedPandal(pandal)
		setIsBottomSheetVisible(true)
		setTimeout(() => {
			markerPressedRef.current = false
		}, 100)
	}

	const handleBottomSheetClose = () => {
		setIsBottomSheetVisible(false)
		setSelectedPandal(null)
	}

	const handleMapPress = () => {
		if (!markerPressedRef.current && isBottomSheetVisible) {
			pandalDetailsRef.current?.closeSheet()
		}
	}

	const handlePandalNavigate = (newPandal: Pandals) => {
		setSelectedPandal(newPandal)

		// Focus map camera on the new pandal
		if (mapRef.current && newPandal.latitude && newPandal.longitude) {
			mapRef.current.animateToRegion(
				{
					latitude: newPandal.latitude,
					longitude: newPandal.longitude,
					latitudeDelta: 0.04,
					longitudeDelta: 0.04
				},
				1000
			) // 1 second animation
		}
	}

	const handleRetry = () => {
		if (supabase) {
			retryFetch(supabase)
		}
	}

	if (loading && pandals.length === 0) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator color="black" size="small" />
				<Text className="mt-2.5">Loading pandals...</Text>
			</View>
		)
	}

	if (error && pandals.length === 0) {
		return (
			<View className="flex-1 items-center justify-center p-5">
				<Text className="mb-5 text-center text-base">
					Failed to load pandals: {error}
				</Text>
				<TouchableOpacity
					className="rounded-lg bg-blue-500 px-5 py-2.5"
					onPress={handleRetry}
				>
					<Text className="font-bold text-white">Retry</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View className="flex-1">
			<MapView
				className="w-full"
				initialRegion={INITIAL_REGION}
				onPress={handleMapPress}
				provider={PROVIDER_GOOGLE}
				ref={mapRef}
				showsMyLocationButton
				showsUserLocation
				style={{ height: '91.3%' }}
			>
				{pandals.map((pandal: Pandals) => (
					<CustomMarker
						key={pandal.id}
						{...pandal}
						onPress={() => handleMarkerPress(pandal)}
					/>
				))}
			</MapView>

			{loading && pandals.length > 0 && (
				<View className="absolute top-12 right-5 rounded-3xl bg-black/70 p-2">
					<ActivityIndicator color="white" size="small" />
				</View>
			)}

			{selectedPandal && (
				<PandalDetails
					allPandals={pandals}
					isVisible={isBottomSheetVisible}
					onClose={handleBottomSheetClose}
					onPandalNavigate={handlePandalNavigate}
					pandal={selectedPandal}
					ref={pandalDetailsRef}
				/>
			)}
		</View>
	)
}
