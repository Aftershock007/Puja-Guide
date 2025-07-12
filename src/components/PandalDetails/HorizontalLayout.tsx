import { memo } from 'react'
import { Text, View } from 'react-native'
import DescriptionSection, { type DescriptionState } from './DescriptionSection'
import ImageCarousel from './ImageCarousel'
import RatingSection from './RatingSection'

interface HorizontalLayoutProps {
	clubname: string
	description?: string
	rating?: number
	images: string[]
	imageWidth: number
	imageHeight: number
	currentImageIndex: number
	onImageIndexChange: (index: number) => void
	onImageContainerLayout: (width: number) => void
	descriptionState: DescriptionState
	onShowMore: () => void
	onShowMoreAgain: () => void
	onShowLess: () => void
	isLayoutTransitioning?: boolean
}

const HorizontalLayout = memo<HorizontalLayoutProps>(
	({
		clubname,
		description,
		rating,
		images,
		imageWidth,
		imageHeight,
		currentImageIndex,
		onImageIndexChange,
		onImageContainerLayout,
		descriptionState,
		onShowMore,
		onShowMoreAgain,
		onShowLess,
		isLayoutTransitioning = false
	}) => {
		return (
			<View className="h-48 flex-row overflow-hidden rounded-2xl bg-white">
				<View
					className="relative w-2/5"
					onLayout={(e) => onImageContainerLayout(e.nativeEvent.layout.width)}
				>
					<ImageCarousel
						currentImageIndex={currentImageIndex}
						height={imageHeight}
						images={images}
						onImageIndexChange={onImageIndexChange}
						paginationPosition="bottom-right"
						showPagination={images.length > 1}
						width={imageWidth}
					/>
				</View>
				<View className="flex-1 justify-center bg-black p-6">
					<Text className="mb-3 font-bold text-white text-xl leading-tight">
						{clubname}
					</Text>
					{description && (
						<DescriptionSection
							description={description}
							isLayoutTransitioning={isLayoutTransitioning}
							onShowLess={onShowLess}
							onShowMore={onShowMore}
							onShowMoreAgain={onShowMoreAgain}
							state={descriptionState}
						/>
					)}
					<RatingSection rating={rating} />
				</View>
			</View>
		)
	}
)

HorizontalLayout.displayName = 'HorizontalLayout'

export default HorizontalLayout
