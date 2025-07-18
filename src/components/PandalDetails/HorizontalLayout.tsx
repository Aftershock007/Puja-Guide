import { memo, useMemo } from 'react'
import { Text, View } from 'react-native'
import type { Pandals } from '@/types/dbTypes'
import ImageCarousel from './ImageCarousel'
import RatingSection from './RatingSection'
import StarRatingPicker from './StarRatingPicker'

interface HorizontalLayoutProps {
	pandal: Pandals
	imageWidth: number
	imageHeight: number
	currentImageIndex: number
	onImageIndexChange: (index: number) => void
	onImageContainerLayout: (width: number) => void
}

const HorizontalLayout = memo<HorizontalLayoutProps>(
	({ pandal, imageWidth, imageHeight, onImageContainerLayout }) => {
		const { clubname, description, rating, images } = pandal

		const safeImages = images || []
		const safeRating = rating || 0

		const displayImages = useMemo(() => {
			return safeImages.length > 0 ? [safeImages[0]] : []
		}, [safeImages])

		return (
			<View className="relative h-[190px] overflow-hidden rounded-2xl bg-gray-100">
				<View
					className="relative w-[47%]"
					onLayout={(e) => onImageContainerLayout(e.nativeEvent.layout.width)}
				>
					<ImageCarousel
						currentImageIndex={0}
						height={imageHeight}
						images={displayImages}
						onImageIndexChange={() => {}}
						paginationPosition="bottom-right"
						showPagination={false}
						width={imageWidth}
					/>
				</View>
				<View
					className="absolute top-2 right-2 bottom-2 rounded-xl bg-gray-100 px-3 py-2"
					style={{
						left: '42%',
						shadowColor: '#000',
						shadowOffset: { width: -4, height: -4 },
						shadowOpacity: 0.15,
						shadowRadius: 8,
						elevation: 8,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.8)',
						zIndex: 10
					}}
				>
					<View
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							borderRadius: 12,
							shadowColor: '#000',
							shadowOffset: { width: 4, height: 4 },
							shadowOpacity: 0.1,
							shadowRadius: 6,
							backgroundColor: 'transparent'
						}}
					/>
					<View className="flex-1 justify-center">
						{clubname && (
							<Text className="mb-2 font-bold text-xl" numberOfLines={1}>
								{clubname}
							</Text>
						)}
						{safeRating > 0 && (
							<View className="mb-2">
								<RatingSection rating={safeRating} />
							</View>
						)}
						{description && (
							<View className="mb-1.5">
								<Text className="text-[10px]" numberOfLines={3}>
									{description}
								</Text>
							</View>
						)}
						<View
							className="mx-0.5 my-2 h-[1.5px]"
							style={{
								backgroundColor: '#e5e7eb',
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: 0.1,
								shadowRadius: 1,
								borderTopWidth: 0.5,
								borderTopColor: 'rgba(255, 255, 255, 0.8)'
							}}
						/>
						<View className="items-center">
							<Text className="mb-1 font-bold text-[12px]">
								Rate this pandal:
							</Text>
							<StarRatingPicker starSize={28} />
						</View>
					</View>
				</View>
			</View>
		)
	}
)

HorizontalLayout.displayName = 'HorizontalLayout'

export default HorizontalLayout
