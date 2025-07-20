import { useRef, useState } from 'react'
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

	const pandals = usePandalStore((state) => state.pandals)
	const selectedPandal = usePandalStore((state) => state.selectedPandal)
	const loading = usePandalStore((state) => state.loading)
	const error = usePandalStore((state) => state.error)
	const setSelectedPandal = usePandalStore((state) => state.setSelectedPandal)
	const retryFetch = usePandalStore((state) => state.retryFetch)

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
	}

	const handleRetry = () => {
		if (supabase) {
			retryFetch(supabase)
		}
	}

	if (loading && pandals.length === 0) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator color="black" size="large" />
				<Text style={{ marginTop: 10 }}>Loading pandals...</Text>
			</View>
		)
	}

	if (error && pandals.length === 0) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20
				}}
			>
				<Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
					Failed to load pandals: {error}
				</Text>
				<TouchableOpacity
					onPress={handleRetry}
					style={{
						backgroundColor: '#007AFF',
						paddingHorizontal: 20,
						paddingVertical: 10,
						borderRadius: 8
					}}
				>
					<Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
				</TouchableOpacity>
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
				{pandals.map((pandal: Pandals) => (
					<CustomMarker
						key={pandal.id}
						{...pandal}
						onPress={() => handleMarkerPress(pandal)}
					/>
				))}
			</MapView>

			{loading && pandals.length > 0 && (
				<View
					style={{
						position: 'absolute',
						top: 50,
						right: 20,
						backgroundColor: 'rgba(0,0,0,0.7)',
						padding: 8,
						borderRadius: 20
					}}
				>
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
