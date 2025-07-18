import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import CustomMarker from '@/components/Maps/CustomMarker'
import PandalDetails from '@/components/PandalDetails/PandalDetails'
import useSupabase from '@/lib/supabase'
import { fetchPandals } from '@/service/fetchPandalService'
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
	const [selectedPandal, setSelectedPandal] = useState<Pandals | null>(null)
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
	const pandalDetailsRef = useRef<PandalDetailsRef>(null)
	const markerPressedRef = useRef(false)
	const supabase = useSupabase()

	const {
		data: pandals,
		isLoading,
		error
	} = useQuery({
		queryKey: ['pandals'],
		queryFn: () => fetchPandals(supabase)
	})

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
		setTimeout(() => {
			setSelectedPandal(newPandal)
		}, 0)
	}

	if (isLoading) {
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
				{(pandals || []).map((pandal: Pandals) => (
					<CustomMarker
						key={pandal.id}
						{...pandal}
						onPress={() => handleMarkerPress(pandal)}
					/>
				))}
			</MapView>
			{selectedPandal && (
				<PandalDetails
					allPandals={pandals || []}
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
