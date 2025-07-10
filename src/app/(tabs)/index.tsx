import { useQuery } from '@tanstack/react-query'
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

const fetchPandals = async () => {
	const { data, error } = await supabase.from('pandals').select('*')
	if (error) {
		throw error
	}
	return data
}

export default function HomeScreen() {
	const [selectedPandal, setSelectedPandal] = useState<Pandals | null>(null)
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
	const pandalDetailsRef = useRef<PandalDetailsRef>(null)
	const markerPressedRef = useRef(false)

	const {
		data: pandals,
		isLoading,
		error
	} = useQuery({
		queryKey: ['pandals'],
		queryFn: () => fetchPandals()
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
					isVisible={isBottomSheetVisible}
					onClose={handleBottomSheetClose}
					pandal={selectedPandal}
					ref={pandalDetailsRef}
				/>
			)}
		</View>
	)
}
