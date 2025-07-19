import { memo, useMemo } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import type { Pandals } from '@/types/dbTypes'
import { findNearestPandals, formatDistance } from '@/utils/distanceUtils'

interface NearestPandalsProps {
	currentPandal: Pandals
	allPandals: Pandals[]
	onPandalPress?: (pandal: Pandals) => void
	limit?: number
}

const NearestPandals = memo<NearestPandalsProps>(
	({ currentPandal, allPandals, onPandalPress, limit = 10 }) => {
		const nearestPandals = useMemo(() => {
			if (!allPandals || allPandals.length === 0) {
				return []
			}

			const validPandals = allPandals.filter(
				(pandal) =>
					pandal.latitude !== null &&
					pandal.longitude !== null &&
					typeof pandal.latitude === 'number' &&
					typeof pandal.longitude === 'number'
			)

			return findNearestPandals(currentPandal, validPandals, limit)
		}, [currentPandal, allPandals, limit])

		if (!(currentPandal.latitude && currentPandal.longitude)) {
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
						Location not available for this pandal
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
			<View className="mx-3 mb-3 h-[200px]">
				<Text className="mb-2 ml-[2px] font-bold text-[13.5px]">
					Nearest Pandals:
				</Text>
				<ScrollView
					contentContainerStyle={{ paddingBottom: 10 }}
					nestedScrollEnabled={true}
					showsVerticalScrollIndicator={false}
					style={{ maxHeight: 300 }}
				>
					{nearestPandals.map((pandal) => (
						<TouchableOpacity
							activeOpacity={0.7}
							className="mb-2"
							key={pandal.id}
							onPress={() => onPandalPress?.(pandal)}
						>
							<View
								className="flex-row items-center justify-between rounded-lg bg-white px-3 py-[6px]"
								style={{
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 1 },
									shadowOpacity: 0.05,
									shadowRadius: 3,
									elevation: 2
								}}
							>
								<View className="mr-2 flex-1">
									<Text
										className="font-semibold text-[12px] text-gray-800"
										numberOfLines={1}
									>
										{pandal.clubname}
									</Text>
									{pandal.address && (
										<Text
											className="mt-0.5 text-[10px] text-gray-600"
											numberOfLines={1}
										>
											{pandal.address}
										</Text>
									)}
									{pandal.theme && (
										<Text
											className="mt-0.5 text-[9px] text-gray-500"
											numberOfLines={1}
										>
											Theme: {pandal.theme}
										</Text>
									)}
								</View>
								<View className="flex-row items-center">
									{pandal.rating && pandal.rating > 0 && (
										<View className="mr-2 flex-row items-center">
											<Text className="mr-1 text-[#FFD700] text-[10px]">★</Text>
											<Text className="text-[10px] text-gray-700">
												{pandal.rating.toFixed(1)}
											</Text>
										</View>
									)}
									<View
										className="rounded-full bg-blue-100 px-2 py-1"
										style={{
											shadowColor: '#3B82F6',
											shadowOffset: { width: 0, height: 1 },
											shadowOpacity: 0.1,
											shadowRadius: 2
										}}
									>
										<Text className="font-bold text-[10px] text-blue-700">
											{formatDistance(pandal.distance)}
										</Text>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		)
	}
)

NearestPandals.displayName = 'NearestPandals'

export default NearestPandals
