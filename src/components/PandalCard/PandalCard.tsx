import { Ionicons } from '@expo/vector-icons'
import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import type { PandalWithDistance } from '@/hooks/useLocationDistanceTracker'
import type { Pandals } from '@/types/dbTypes'

interface PandalCardProps {
	pandal: PandalWithDistance | Pandals
	onPress: (pandal: Pandals) => void
	isFavorited: boolean
	isVisited: boolean
	userLocation?: { latitude: number; longitude: number } | null
	className?: string
}

const PandalCard = memo<PandalCardProps>(
	({
		pandal,
		onPress,
		isFavorited,
		isVisited,
		userLocation,
		className = ''
	}) => {
		const pandalWithDistance = pandal as PandalWithDistance
		const hasDistance =
			userLocation && 'distance' in pandal && pandalWithDistance.distance > 0

		return (
			<TouchableOpacity
				activeOpacity={0.7}
				className={className}
				onPress={() => onPress(pandal)}
			>
				<View className="android:elevation-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
					<View className="mb-1 flex-row items-center">
						{pandal.clubname && (
							<Text
								className="flex-1 pr-2 font-semibold text-[14px] text-black"
								numberOfLines={1}
							>
								{pandal.clubname}
							</Text>
						)}
						<View className="flex-row items-center gap-2">
							<View className="flex-row gap-1">
								{isFavorited && (
									<View className="rounded-full bg-red-100 px-2 py-1">
										<Text className="font-bold text-[8px] text-red-700">
											FAVORITE
										</Text>
									</View>
								)}
								{isVisited && (
									<View className="rounded-full bg-green-100 px-2 py-1">
										<Text className="font-bold text-[8px] text-green-700">
											VISITED
										</Text>
									</View>
								)}
							</View>
							<View className="w-4" />
						</View>
					</View>
					<View className="mb-1 flex-row items-center">
						{pandal.address && (
							<Text
								className="flex-1 pr-2 text-[11px] text-gray-600"
								numberOfLines={1}
							>
								{pandal.address}
							</Text>
						)}
						<View className="flex-row items-center gap-2">
							{pandal.rating && pandal.rating > 0 && (
								<View className="flex-row items-center">
									<Text className="mr-1 text-[#FFD700] text-[12px]">★</Text>
									<Text className="font-medium text-[12px] text-gray-700">
										{pandal.rating.toFixed(1)}
									</Text>
									{pandal.number_of_ratings && pandal.number_of_ratings > 0 && (
										<Text className="ml-1 text-[9px] text-gray-500">
											({pandal.number_of_ratings})
										</Text>
									)}
								</View>
							)}
							{hasDistance && (
								<View className="mt-[0.3px] rounded-full bg-blue-100 px-2 py-1">
									<Text className="font-bold text-[9px] text-blue-700">
										{pandalWithDistance.formattedDistance}
									</Text>
								</View>
							)}
							<Ionicons color="#9CA3AF" name="chevron-forward" size={16} />
						</View>
					</View>
					{pandal.theme && (
						<Text className="mb-1 text-[10px] text-gray-500" numberOfLines={1}>
							{pandal.theme}
						</Text>
					)}
				</View>
			</TouchableOpacity>
		)
	}
)

PandalCard.displayName = 'PandalCard'

export default PandalCard
