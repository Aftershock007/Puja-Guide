import { useUser } from '@clerk/clerk-expo'
import { MaterialIcons } from '@expo/vector-icons'
import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Marker, type MarkerPressEvent } from 'react-native-maps'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useVisitedStore } from '@/stores/visitedStore'
import type { Pandals } from '@/types/dbTypes'
import StarRating from '../PandalDetails/StarRating'

interface CustomMarkerProps extends Pandals {
	onPress?: () => void
}

const CustomMarker = memo<CustomMarkerProps>(({ onPress, ...pandal }) => {
	const { user } = useUser()
	const visited = useVisitedStore((state) => state.visited)
	const favorites = useFavoritesStore((state) => state.favorites)

	if (!(pandal?.latitude && pandal?.longitude)) {
		return null
	}

	const validRating = Math.max(0, Math.min(5, pandal.rating || 0))
	const truncateTitle = (title: string, maxLength: number): string =>
		title?.length > maxLength
			? `${title.slice(0, maxLength).trimEnd()}...`
			: title
	const displayTitle = truncateTitle(pandal.clubname, 15)

	const isVisited = user?.id ? visited.has(pandal.id) : false
	const isFavorited = user?.id ? favorites.has(pandal.id) : false

	const markerBgClass = isVisited ? 'bg-gray-700 opacity-50' : 'bg-black'
	const arrowColorClass = isVisited
		? 'border-t-gray-700 opacity-50'
		: 'border-t-black'

	const handlePress = (event: MarkerPressEvent) => {
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
			<TouchableOpacity className="z-50">
				<View
					className="relative"
					style={{
						paddingLeft: isFavorited ? 8 : 0,
						paddingTop: isFavorited ? 8 : 0
					}}
				>
					{isFavorited && (
						<View className="absolute top-0 left-0 z-20 rounded-full bg-white p-1">
							<MaterialIcons color="red" name="favorite" size={14} />
						</View>
					)}
					<View className="items-center">
						<View
							className={`min-h-[36px] max-w-[150px] gap-0.5 rounded-xl px-2.5 py-1.5 ${markerBgClass}`}
						>
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
						<View
							className={`h-0 w-0 self-center border-t-[10px] border-r-[10px] border-r-transparent border-l-[10px] border-l-transparent ${arrowColorClass}`}
						/>
					</View>
				</View>
			</TouchableOpacity>
		</Marker>
	)
})

CustomMarker.displayName = 'CustomMarker'

export default CustomMarker
