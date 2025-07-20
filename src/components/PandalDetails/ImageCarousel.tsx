import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import {
	FlatList,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	View
} from 'react-native'
import OptimizedImage from './OptimizedImage'
import PaginationDot from './PaginationDot'

interface ImageCarouselProps {
	images: string[]
	width: number
	height: number
	currentImageIndex: number
	onImageIndexChange?: (index: number) => void
	showPagination?: boolean
}

const ImageCarousel = memo<ImageCarouselProps>(
	({
		images,
		width,
		height,
		currentImageIndex,
		onImageIndexChange,
		showPagination = true
	}) => {
		const flatListRef = useRef<FlatList>(null)

		const safeCurrentIndex = useMemo(() => {
			return Math.min(currentImageIndex, Math.max(0, images.length - 1))
		}, [currentImageIndex, images.length])

		useEffect(() => {
			if (
				showPagination &&
				currentImageIndex >= images.length &&
				images.length > 0 &&
				onImageIndexChange
			) {
				onImageIndexChange(0)
			}
		}, [images.length, currentImageIndex, onImageIndexChange, showPagination])

		const onScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const contentOffsetX = event.nativeEvent.contentOffset.x
				const newIndex = Math.round(contentOffsetX / width)

				const boundedIndex = Math.min(Math.max(0, newIndex), images.length - 1)

				if (
					showPagination &&
					boundedIndex !== safeCurrentIndex &&
					boundedIndex < images.length &&
					onImageIndexChange
				) {
					onImageIndexChange(boundedIndex)
				}
			},
			[
				width,
				safeCurrentIndex,
				onImageIndexChange,
				images.length,
				showPagination
			]
		)

		const renderImage = useCallback(
			({ item }: { item: string }) => (
				<OptimizedImage height={height} uri={item} width={width} />
			),
			[width, height]
		)

		const flatListProps = useMemo(
			() => ({
				data: images,
				horizontal: true,
				pagingEnabled: true,
				showsHorizontalScrollIndicator: false,
				decelerationRate: 'fast' as const,
				removeClippedSubviews: false,
				maxToRenderPerBatch: 2,
				windowSize: 3,
				initialNumToRender: 1,
				updateCellsBatchingPeriod: 50,
				scrollEventThrottle: 32,
				snapToAlignment: 'start' as const,
				keyExtractor: (item: string, index: number) => `${item}-${index}`,
				onScroll,
				getItemLayout: (_: unknown, index: number) => ({
					length: width,
					offset: width * index,
					index
				}),
				renderItem: renderImage
			}),
			[images, width, onScroll, renderImage]
		)

		const renderPaginationDots = useCallback(() => {
			if (images.length <= 1 || !showPagination) {
				return null
			}

			return (
				<View className="absolute right-4 bottom-10 left-0 z-10 flex-row justify-end">
					{images.map((imageUrl, index) => (
						<View
							className={`mx-1 h-2 w-2 rounded-full ${index === safeCurrentIndex ? 'bg-white' : 'bg-white/50'}`}
							key={`dot-${imageUrl}`}
						/>
					))}
				</View>
			)
		}, [images, safeCurrentIndex, showPagination])

		if (images.length === 0) {
			return null
		}

		if (images.length === 1) {
			return (
				<View className="relative" style={{ width, height }}>
					<OptimizedImage height={height} uri={images[0]} width={width} />
				</View>
			)
		}

		return (
			<View className="relative" style={{ width, height }}>
				<FlatList ref={flatListRef} {...flatListProps} />
				{renderPaginationDots()}
			</View>
		)
	}
)

ImageCarousel.displayName = 'ImageCarousel'

export default ImageCarousel
