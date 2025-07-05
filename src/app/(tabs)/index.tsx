import { useRef, useState } from 'react'
import { View } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import CustomMarker from '@/components/Maps/CustomMarker'
import PandalDetails from '@/components/Maps/PandalDetails'
import pandals from '../../assets/data/pandals.json' with { type: 'json' }

interface Pandal {
	id: string
	latitude: number
	longitude: number
	title: string
	description: string
	rating: number
	images: string[]
}

interface PandalDetailsRef {
	closeSheet: () => void
}

const INITIAL_REGION = {
	latitude: 22.686_497,
	longitude: 88.434_997,
	latitudeDelta: 0.0922,
	longitudeDelta: 0.0421
}

export default function HomeScreen() {
	const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null)
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
	const pandalDetailsRef = useRef<PandalDetailsRef>(null)

	const handleMarkerPress = (pandal: Pandal) => {
		setSelectedPandal(pandal)
		setIsBottomSheetVisible(true)
	}

	const handleBottomSheetClose = () => {
		setIsBottomSheetVisible(false)
		setSelectedPandal(null)
	}

	const handleMapPress = () => {
		if (isBottomSheetVisible) {
			pandalDetailsRef.current?.closeSheet()
		}
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
