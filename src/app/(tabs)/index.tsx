import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import CustomMarker from '@/components/Maps/CustomMarker'
import PandalDetails from '@/components/Maps/PandalDetails'
import { supabase } from '@/lib/supabase'
import type { Pandals } from '@/types/types'

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
	const [pandals, setPandals] = useState<Pandals[]>([])
	const [selectedPandal, setSelectedPandal] = useState<Pandals | null>(null)
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const pandalDetailsRef = useRef<PandalDetailsRef>(null)
	const markerPressedRef = useRef(false)

	useEffect(() => {
		const fetchPandals = async () => {
			try {
				setLoading(true)
				setError(null)

				const { data, error: supabaseError } = await supabase
					.from('pandals')
					.select('*')

				if (supabaseError) {
					setError('Failed to fetch pandals')
					return
				}
				if (data) {
					setPandals(data)
				} else {
					setPandals([])
				}
			} catch {
				setError('Failed to fetch pandals')
			} finally {
				setLoading(false)
			}
		}

		fetchPandals()
	}, [])

	const handleMarkerPress = (pandal: Pandal) => {
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

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator color="black" size="large" />
				<Text style={{ marginTop: 10 }}>Loading pandals...</Text>
			</View>
		)
	}

	if (error) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
				<Text
					onPress={() => window.location.reload()}
					style={{ color: 'blue' }}
				>
					Tap to retry
				</Text>
			</View>
		)
	}

	return (
		<View style={{ flex: 1 }}>
			<MapView
				initialRegion={INITIAL_REGION}
				onPress={handleMapPress}
				provider={PROVIDER_GOOGLE}
				showsMyLocationButton
				showsUserLocation
				style={{ width: '100%', height: '91.3%' }}
			>
				{pandals.map((pandal: Pandal) => (
					<CustomMarker
						key={pandal.id}
						{...pandal}
						onPress={() => handleMarkerPress(pandal)}
					/>
				))}
			</MapView>
			{selectedPandal && (
				<PandalDetails
					isVisible={isBottomSheetVisible}
					onClose={handleBottomSheetClose}
					pandal={selectedPandal}
					ref={pandalDetailsRef}
				/>
			)}
		</View>
	)
}
