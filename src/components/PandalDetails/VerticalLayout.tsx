import { memo } from 'react'
import { Text, View } from 'react-native'
import DescriptionSection, { type DescriptionState } from './DescriptionSection'
import ImageCarousel from './ImageCarousel'
import RatingSection from './RatingSection'

interface VerticalLayoutProps {
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

const VerticalLayout = memo<VerticalLayoutProps>(
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
			<View className="overflow-hidden rounded-2xl bg-white">
				<View className="flex-col">
					<View
						className="relative h-60"
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
						<View className="absolute right-0 bottom-0 left-0 p-4">
							<Text className="font-bold text-2xl text-white leading-tight">
								{clubname}
							</Text>
						</View>
					</View>
					<View className="bg-black px-5 pt-2 pb-4">
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
			</View>
		)
	}
)

VerticalLayout.displayName = 'VerticalLayout'

export default VerticalLayout
