import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Marker } from 'react-native-maps'
import type { Pandals } from '@/types/dbTypes'
import StarRating from '../PandalDetails/StarRating'

interface CustomMarkerProps extends Pandals {
	onPress?: () => void
}

const CustomMarker = memo<CustomMarkerProps>(({ onPress, ...pandal }) => {
	if (!(pandal?.latitude && pandal?.longitude)) {
		return null
	}

	const validRating = Math.max(0, Math.min(5, pandal.rating || 0))
	const truncateTitle = (title: string, maxLength: number): string =>
		title?.length > maxLength
			? `${title.slice(0, maxLength).trimEnd()}...`
			: title
	const displayTitle = truncateTitle(pandal.clubname, 15)

	const handlePress = (event: any) => {
		event.stopPropagation?.()
		onPress?.()
	}

	return (
		<Marker
			coordinate={{
				latitude: pandal.latitude,
				longitude: pandal.longitude
			}}
			key={pandal.id}
			onPress={handlePress}
		>
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={handlePress}
				style={{ zIndex: 1000 }}
			>
				<View className="items-center">
					<View className="min-h-[36px] max-w-[150px] gap-0.5 rounded-xl bg-black px-3 py-2">
						<Text className="text-white">{displayTitle}</Text>
						<View className="flex-row items-center justify-start gap-1">
							<StarRating rating={validRating} />
							<Text
								adjustsFontSizeToFit={true}
								className="mb-[1px] text-center font-bold text-white text-xs"
								minimumFontScale={0.8}
								numberOfLines={1}
							>
								{`(${validRating.toFixed(1)})`}
							</Text>
						</View>
					</View>
					<View className="-mt-0.5 h-0 w-0 self-center border-t-[10px] border-t-black border-r-[10px] border-r-transparent border-l-[10px] border-l-transparent" />
				</View>
			</TouchableOpacity>
		</Marker>
	)
})

CustomMarker.displayName = 'CustomMarker'

export default CustomMarker
