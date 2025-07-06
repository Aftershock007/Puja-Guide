import { FlatList, Image, Text, View } from 'react-native'
import StarRating from '../Maps/StarRating'

export default function VerticalLayout({
	pandal,
	currentImageIndex,
	onVerticalScroll,
	onImageContainerLayout,
	renderDescription,
	screenWidth,
	paddingHorizontal
}) {
	// Early return if pandal is not available
	if (!pandal) {
		return (
			<View className="overflow-hidden rounded-2xl bg-white">
				<View className="flex-col">
					<View className="relative h-60 items-center justify-center bg-gray-200">
						<Text className="text-gray-500">Loading...</Text>
					</View>
					<View className="bg-black px-5 pt-2 pb-4">
						<Text className="text-white">Loading content...</Text>
					</View>
				</View>
			</View>
		)
	}

	return (
		<View className="overflow-hidden rounded-2xl bg-white">
			<View className="flex-col">
				<View className="relative h-60" onLayout={onImageContainerLayout}>
					{pandal?.images?.length > 1 ? (
						<>
							<FlatList
								data={pandal.images}
								decelerationRate="fast"
								getItemLayout={(_, index) => ({
									length: screenWidth - paddingHorizontal,
									offset: (screenWidth - paddingHorizontal) * index,
									index
								})}
								horizontal
								keyExtractor={(_, index) => `image-${index}`}
								onScroll={onVerticalScroll}
								pagingEnabled
								removeClippedSubviews={false}
								renderItem={({ item }) => (
									<Image
										resizeMode="cover"
										source={{ uri: item }}
										style={{
											width: screenWidth - paddingHorizontal,
											height: 240
										}}
									/>
								)}
								scrollEventThrottle={16}
								showsHorizontalScrollIndicator={false}
								snapToAlignment="start"
							/>
							<View className="absolute right-3 bottom-3 flex-row">
								{pandal.images?.map((_, index) => (
									<View
										className={`mx-1 h-2 w-2 rounded-full ${
											index === currentImageIndex ? 'bg-white' : 'bg-white/50'
										}`}
										key={index}
									/>
								))}
							</View>
						</>
					) : pandal?.images?.[0] ? (
						<Image
							className="h-full w-full"
							resizeMode="cover"
							source={{ uri: pandal.images[0] }}
						/>
					) : (
						<View className="h-full w-full items-center justify-center bg-gray-200">
							<Text className="text-gray-500">No image available</Text>
						</View>
					)}
					<View className="absolute right-0 bottom-0 left-0 p-6">
						<Text className="font-bold text-2xl text-white leading-tight">
							{pandal?.title || 'Untitled'}
						</Text>
					</View>
				</View>
				{/* Black Section with Description and Rating */}
				<View className="bg-black px-5 pt-2 pb-4">
					{renderDescription?.()}
					<View className="flex-row items-center gap-2">
						<StarRating rating={pandal?.rating || 0} />
						<Text className="font-semibold text-sm text-white">
							{pandal?.rating?.toFixed(1) || '0.0'}
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
