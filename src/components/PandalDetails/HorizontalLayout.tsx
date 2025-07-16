import { memo } from 'react'
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
	({
		pandal,
		imageWidth,
		imageHeight,
		currentImageIndex,
		onImageIndexChange,
		onImageContainerLayout
	}) => {
		const {
			clubname = '',
			theme = '',
			artistname = '',
			rating = 0,
			images = []
		} = pandal

		return (
			<View className="h-[190px] flex-row overflow-hidden rounded-2xl bg-white">
				<View
					className="relative w-2/5"
					onLayout={(e) => onImageContainerLayout(e.nativeEvent.layout.width)}
				>
					<ImageCarousel
						currentImageIndex={currentImageIndex}
						height={imageHeight}
						images={images || []}
						onImageIndexChange={onImageIndexChange}
						paginationPosition="bottom-right"
						showPagination={(images || []).length > 1}
						width={imageWidth}
					/>
				</View>
				<View className="flex-1 justify-center bg-black px-4">
					{clubname && (
						<Text className="mb-1.5 font-bold text-2xl text-white">
							{clubname}
						</Text>
					)}
					{rating && (
						<View className="mb-1.5">
							<RatingSection rating={rating || 0} />
						</View>
					)}
					{theme && (
						<View className="mb-1.5 flex flex-row items-start">
							<Text className="mr-1 font-bold text-[14px] text-white">
								Theme:
							</Text>
							<Text className="mt-[1.8px] flex-1 text-[12px] text-white">
								{theme}
							</Text>
						</View>
					)}
					{artistname && (
						<View className="mb-1.5 flex flex-row items-start">
							<Text className="mr-1 font-bold text-[14px] text-white">
								Artist:
							</Text>
							<Text className="mt-[1.6px] flex-1 text-[12px] text-white">
								{artistname}
							</Text>
						</View>
					)}
					<View className="my-2 h-[1px] bg-white" />
					<View className="items-center">
						<Text className="mr-1 mb-1 font-bold text-[14px] text-white">
							Rate this pandal:
						</Text>
						<StarRatingPicker starSize={27} />
					</View>
				</View>
			</View>
		)
	}
)

HorizontalLayout.displayName = 'HorizontalLayout'

export default HorizontalLayout
