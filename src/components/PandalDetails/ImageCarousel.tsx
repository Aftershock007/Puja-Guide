import { memo, useCallback, useMemo, useRef } from 'react'
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
	onImageIndexChange: (index: number) => void
	showPagination?: boolean
	paginationPosition?: 'bottom-right' | 'bottom-center'
}

const ImageCarousel = memo<ImageCarouselProps>(
	({
		images,
		width,
		height,
		currentImageIndex,
		onImageIndexChange,
		showPagination = true,
		paginationPosition
	}) => {
		const flatListRef = useRef<FlatList>(null)

		const onScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const contentOffsetX = event.nativeEvent.contentOffset.x
				const currentIndex = Math.round(contentOffsetX / width)
				if (currentIndex !== currentImageIndex) {
					onImageIndexChange(currentIndex)
				}
			},
			[width, currentImageIndex, onImageIndexChange]
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
				keyExtractor: (item: string) => item,
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

			const positionClass =
				paginationPosition === 'bottom-center'
					? 'absolute bottom-12 left-0 right-3 flex-row justify-end'
					: 'absolute right-3 bottom-6 left-0 flex-row justify-end'

			return (
				<View className={positionClass}>
					{images.map((imageUrl, index) => (
						<PaginationDot
							imageUrl={imageUrl}
							isActive={index === currentImageIndex}
							key={`dot-${imageUrl}`}
						/>
					))}
				</View>
			)
		}, [images, currentImageIndex, showPagination, paginationPosition])

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
