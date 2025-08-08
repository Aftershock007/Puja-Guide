import { memo, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import PandalCard from '@/components/PandalCard/PandalCard'
import { useLocationDistanceTracker } from '@/hooks/useLocationDistanceTracker'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useVisitedStore } from '@/stores/visitedStore'
import type { Pandals } from '@/types/dbTypes'

interface NearestPandalsProps {
	currentPandal: Pandals
	allPandals: Pandals[]
	onPandalPress?: (pandal: Pandals) => void
	limit?: number
}

const NearestPandals = memo<NearestPandalsProps>(
	({ currentPandal, allPandals, onPandalPress, limit = 10 }) => {
		const favorites = useFavoritesStore((state) => state.favorites)
		const visited = useVisitedStore((state) => state.visited)

		const {
			pandalsWithDistance,
			userLocation,
			locationPermission,
			isLoadingLocation,
			locationError
		} = useLocationDistanceTracker(allPandals, 120_000) // Update every 2 minutes

		const nearestPandals = useMemo(() => {
			if (!userLocation || pandalsWithDistance.length === 0) {
				return []
			}

			const validPandals = pandalsWithDistance.filter(
				(pandal) => pandal.id !== currentPandal.id && pandal.distance > 0
			)

			return validPandals
				.sort((a, b) => a.distance - b.distance)
				.slice(0, limit)
		}, [pandalsWithDistance, currentPandal.id, limit, userLocation])

		if (isLoadingLocation && !userLocation) {
			return (
				<View
					className="mx-3 mb-3 rounded-xl bg-gray-100 p-4"
					style={{
						shadowColor: '#000',
						shadowOffset: { width: -4, height: -4 },
						shadowOpacity: 0.12,
						shadowRadius: 8,
						elevation: 6,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.8)'
					}}
				>
					<Text className="mb-2 font-bold text-[13.5px] text-black">
						Nearest Pandals:
					</Text>
					<Text className="text-[12px] text-gray-500 italic">
						Getting your location...
					</Text>
				</View>
			)
		}

		if (!(locationPermission || isLoadingLocation)) {
			return (
				<View
					className="mx-3 mb-3 rounded-xl bg-gray-100 p-4"
					style={{
						shadowColor: '#000',
						shadowOffset: { width: -4, height: -4 },
						shadowOpacity: 0.12,
						shadowRadius: 8,
						elevation: 6,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.8)'
					}}
				>
					<Text className="mb-2 font-bold text-[13.5px] text-black">
						Nearest Pandals:
					</Text>
					<Text className="text-[12px] text-gray-500 italic">
						Location permission needed to show nearest pandals
					</Text>
				</View>
			)
		}

		if (locationError) {
			return (
				<View
					className="mx-3 mb-3 rounded-xl bg-gray-100 p-4"
					style={{
						shadowColor: '#000',
						shadowOffset: { width: -4, height: -4 },
						shadowOpacity: 0.12,
						shadowRadius: 8,
						elevation: 6,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.8)'
					}}
				>
					<Text className="mb-2 font-bold text-[13.5px] text-black">
						Nearest Pandals:
					</Text>
					<Text className="text-[12px] text-gray-500 italic">
						Unable to get location
					</Text>
				</View>
			)
		}

		if (nearestPandals.length === 0) {
			return (
				<View
					className="mx-3 mb-3 rounded-xl bg-gray-100 p-4"
					style={{
						shadowColor: '#000',
						shadowOffset: { width: -4, height: -4 },
						shadowOpacity: 0.12,
						shadowRadius: 8,
						elevation: 6,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.8)'
					}}
				>
					<Text className="mb-2 font-bold text-[13.5px]">Nearest Pandals:</Text>
					<Text className="text-[12px] italic">No nearby pandals found</Text>
				</View>
			)
		}

		return (
			<View className="mx-3 mb-3">
				<View className="mb-3 flex-row items-center justify-between">
					<Text className="ml-[2px] font-bold text-[13.5px]">
						Nearest Pandals:
					</Text>
					{isLoadingLocation && (
						<View className="flex-row items-center">
							<View className="mr-1 h-2 w-2 rounded-full bg-blue-500" />
							<Text className="text-[10px] text-gray-500">Updating...</Text>
						</View>
					)}
				</View>
				<View style={{ height: 180 }}>
					<ScrollView
						nestedScrollEnabled={true}
						showsVerticalScrollIndicator={false}
						style={{ flex: 1 }}
					>
						{nearestPandals.map((pandal) => {
							const isFavorited = favorites.has(pandal.id)
							const isVisited = visited.has(pandal.id)

							return (
								<PandalCard
									className="mb-2"
									isFavorited={isFavorited}
									isVisited={isVisited}
									key={pandal.id}
									onPress={onPandalPress || (() => {})}
									pandal={pandal}
									userLocation={userLocation}
								/>
							)
						})}
					</ScrollView>
				</View>
			</View>
		)
	}
)

NearestPandals.displayName = 'NearestPandals'

export default NearestPandals
