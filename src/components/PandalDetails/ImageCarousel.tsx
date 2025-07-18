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

		const safeCurrentIndex = useMemo(() => {
			return Math.min(currentImageIndex, Math.max(0, images.length - 1))
		}, [currentImageIndex, images.length])

		useEffect(() => {
			if (currentImageIndex >= images.length && images.length > 0) {
				onImageIndexChange(0)
			}
		}, [images.length, currentImageIndex, onImageIndexChange])

		const onScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const contentOffsetX = event.nativeEvent.contentOffset.x
				const newIndex = Math.round(contentOffsetX / width)

				const boundedIndex = Math.min(Math.max(0, newIndex), images.length - 1)

				if (boundedIndex !== safeCurrentIndex && boundedIndex < images.length) {
					onImageIndexChange(boundedIndex)
				}
			},
			[width, safeCurrentIndex, onImageIndexChange, images.length]
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

			const positionClass =
				paginationPosition === 'bottom-center'
					? 'absolute bottom-9 left-0 right-0 flex-row justify-center z-10'
					: 'absolute right-3 bottom-6 left-0 flex-row justify-end z-10'

			return (
				<View className={positionClass}>
					{images.map((imageUrl, index) => (
						<PaginationDot
							imageUrl={imageUrl}
							isActive={index === safeCurrentIndex}
							key={`dot-${imageUrl}-${index}`}
						/>
					))}
				</View>
			)
		}, [images, safeCurrentIndex, showPagination, paginationPosition])

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
