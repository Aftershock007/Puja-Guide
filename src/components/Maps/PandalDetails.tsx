import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState
} from 'react'
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	FlatList,
	Image,
	InteractionManager,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Text,
	View
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import type { Pandals } from '@/types/types'
import { truncateText } from '@/utils/truncateText'
import StarRating from './StarRating'

const SCREEN_WIDTH = Dimensions.get('window').width
const PADDING_HORIZONTAL = 35
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING_HORIZONTAL

// Enhanced image cache with better memory management
const imageCache = new Map<
	string,
	{
		loaded: boolean
		error: boolean
		timestamp: number
		prefetched: boolean
	}
>()

// Cache cleanup - remove old entries periodically
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const cleanupCache = () => {
	const now = Date.now()
	for (const [key, value] of imageCache.entries()) {
		if (now - value.timestamp > CACHE_TTL) {
			imageCache.delete(key)
		}
	}
}

// Optimized preloading with better error handling and batching
const preloadImage = (uri: string): Promise<void> => {
	return new Promise((resolve) => {
		const cached = imageCache.get(uri)
		if (cached?.prefetched) {
			resolve()
			return
		}

		Image.prefetch(uri)
			.then(() => {
				imageCache.set(uri, {
					loaded: true,
					error: false,
					timestamp: Date.now(),
					prefetched: true
				})
				resolve()
			})
			.catch(() => {
				imageCache.set(uri, {
					loaded: false,
					error: true,
					timestamp: Date.now(),
					prefetched: true
				})
				resolve() // Don't reject, just mark as error
			})
	})
}

// Batch preload images for better performance
const preloadImages = async (urls: string[]): Promise<void> => {
	// Preload first 3 images immediately, rest after a delay
	const priorityUrls = urls.slice(0, 3)
	const backgroundUrls = urls.slice(3)

	await Promise.allSettled(priorityUrls.map(preloadImage))

	// Preload remaining images with delay to not block UI
	if (backgroundUrls.length > 0) {
		setTimeout(() => {
			Promise.allSettled(backgroundUrls.map(preloadImage))
		}, 100)
	}
}

interface PandalDetailsProps {
	pandal: Pandals
	isVisible: boolean
	onClose: () => void
}

export interface PandalDetailsRef {
	closeSheet: () => void
}

const LoadingOverlay = memo(() => (
	<View className="absolute top-0 right-0 bottom-10 left-0 items-center justify-center">
		<ActivityIndicator color="black" size="small" />
	</View>
))

const PaginationDot = memo<{ isActive: boolean; imageUrl: string }>(
	({ isActive, imageUrl }) => (
		<View
			className={`mx-1 h-2 w-2 rounded-full ${isActive ? 'bg-white' : 'bg-white/50'}`}
			key={`dot-${imageUrl}`}
		/>
	)
)

// Optimized image component with better caching and loading states
const OptimizedImage = memo<{
	uri: string
	width: number
	height: number
	onLoadStart?: () => void
	onLoadEnd?: () => void
}>(({ uri, width, height, onLoadStart, onLoadEnd }) => {
	const [isLoading, setIsLoading] = useState(() => {
		const cached = imageCache.get(uri)
		return !cached?.loaded
	})

	const handleLoadStart = useCallback(() => {
		setIsLoading(true)
		onLoadStart?.()
	}, [onLoadStart])

	const handleLoad = useCallback(() => {
		imageCache.set(uri, {
			loaded: true,
			error: false,
			timestamp: Date.now(),
			prefetched: true
		})
		setIsLoading(false)
		onLoadEnd?.()
	}, [uri, onLoadEnd])

	const handleError = useCallback(() => {
		imageCache.set(uri, {
			loaded: false,
			error: true,
			timestamp: Date.now(),
			prefetched: true
		})
		setIsLoading(false)
		onLoadEnd?.()
	}, [uri, onLoadEnd])

	return (
		<View className="relative" style={{ width, height }}>
			<Image
				fadeDuration={150}
				onError={handleError}
				onLoad={handleLoad}
				onLoadStart={handleLoadStart}
				resizeMode="cover"
				shouldRasterizeIOS={true}
				source={{ uri, cache: 'force-cache' }}
				style={{ width, height }}
			/>
			{isLoading && <LoadingOverlay />}
		</View>
	)
})

const PandalDetails = forwardRef<PandalDetailsRef, PandalDetailsProps>(
	({ pandal, isVisible, onClose }, ref) => {
		const bottomSheetRef = useRef<BottomSheet>(null)
		const snapPoints = useMemo(() => ['35%', '60%', '80%'], [])
		const fadeAnim = useRef(new Animated.Value(1)).current
		const flatListRef = useRef<FlatList>(null)

		// Simplified state management
		const [state, setState] = useState({
			currentImageIndex: 0,
			imageContainerWidth: 0,
			currentSnapIndex: 1,
			forceHorizontalLayout: false,
			isLayoutTransitioning: false
		})

		// Track loading images for better UX
		const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

		const computedValues = useMemo(() => {
			const isVerticalLayout =
				state.currentSnapIndex >= 2 && !state.forceHorizontalLayout
			const isDescriptionExpanded = state.currentSnapIndex === 2
			const isDescriptionExpandedMore = state.currentSnapIndex === 3
			const imageWidth = isVerticalLayout
				? state.imageContainerWidth || AVAILABLE_WIDTH
				: state.imageContainerWidth || AVAILABLE_WIDTH * 0.4
			return {
				isVerticalLayout,
				isDescriptionExpanded,
				isDescriptionExpandedMore,
				imageWidth
			}
		}, [
			state.currentSnapIndex,
			state.forceHorizontalLayout,
			state.imageContainerWidth
		])

		const imageDimensions = useMemo(
			() => ({
				vertical: { width: AVAILABLE_WIDTH, height: 240 },
				horizontal: { width: computedValues.imageWidth, height: 200 }
			}),
			[computedValues.imageWidth]
		)

		useImperativeHandle(
			ref,
			() => ({
				closeSheet: () => bottomSheetRef.current?.close()
			}),
			[]
		)

		// Optimized image preloading
		useEffect(() => {
			if (pandal?.images && isVisible) {
				// Cleanup cache periodically
				cleanupCache()

				InteractionManager.runAfterInteractions(() => {
					preloadImages(pandal.images || [])
				})
			}
		}, [pandal?.images, isVisible])

		const updateState = useCallback((updates: Partial<typeof state>) => {
			setState((prev) => ({ ...prev, ...updates }))
		}, [])

		// Simplified layout transition without unnecessary fading
		const animateToIndex = useCallback(
			(targetIndex: number) => {
				const currentIsVertical =
					state.currentSnapIndex >= 2 && !state.forceHorizontalLayout
				const targetIsVertical =
					targetIndex >= 2 && !state.forceHorizontalLayout

				if (currentIsVertical !== targetIsVertical) {
					updateState({ isLayoutTransitioning: true })

					// Quick fade with shorter duration
					Animated.timing(fadeAnim, {
						toValue: 0.3,
						duration: 100,
						useNativeDriver: true
					}).start(() => {
						updateState({
							currentSnapIndex: targetIndex,
							imageContainerWidth: 0
						})
						bottomSheetRef.current?.snapToIndex(targetIndex)

						// Fade back in quickly
						Animated.timing(fadeAnim, {
							toValue: 1,
							duration: 150,
							useNativeDriver: true
						}).start(() => {
							updateState({ isLayoutTransitioning: false })
						})
					})
				} else {
					bottomSheetRef.current?.snapToIndex(targetIndex)
					updateState({ currentSnapIndex: targetIndex })
				}
			},
			[
				fadeAnim,
				updateState,
				state.currentSnapIndex,
				state.forceHorizontalLayout
			]
		)

		const handleSheetChanges = useCallback(
			(index: number) => {
				if (state.isLayoutTransitioning) {
					return
				}

				const newIsVerticalLayout = index >= 2 && !state.forceHorizontalLayout
				const oldIsVerticalLayout =
					state.currentSnapIndex >= 2 && !state.forceHorizontalLayout

				if (index === -1) {
					onClose()
					return
				}

				if (newIsVerticalLayout !== oldIsVerticalLayout) {
					updateState({ isLayoutTransitioning: true })

					Animated.timing(fadeAnim, {
						toValue: 0.3,
						duration: 80,
						useNativeDriver: true
					}).start(() => {
						updateState({
							currentSnapIndex: index,
							imageContainerWidth: 0,
							forceHorizontalLayout:
								index < 2 ? false : state.forceHorizontalLayout
						})

						Animated.timing(fadeAnim, {
							toValue: 1,
							duration: 120,
							useNativeDriver: true
						}).start(() => {
							updateState({ isLayoutTransitioning: false })
						})
					})
				} else {
					updateState({
						currentSnapIndex: index,
						forceHorizontalLayout:
							index < 2 ? false : state.forceHorizontalLayout
					})
				}
			},
			[
				state.currentSnapIndex,
				state.forceHorizontalLayout,
				state.isLayoutTransitioning,
				onClose,
				updateState,
				fadeAnim
			]
		)

		useEffect(() => {
			if (isVisible) {
				InteractionManager.runAfterInteractions(() => {
					bottomSheetRef.current?.expand()
					setState({
						currentImageIndex: 0,
						imageContainerWidth: 0,
						currentSnapIndex: 1,
						forceHorizontalLayout: false,
						isLayoutTransitioning: false
					})
					fadeAnim.setValue(1)
				})
			} else {
				bottomSheetRef.current?.close()
			}
		}, [isVisible, fadeAnim])

		const handleShowMore = useCallback(
			() => animateToIndex(2),
			[animateToIndex]
		)
		const handleShowMoreAgain = useCallback(
			() => animateToIndex(3),
			[animateToIndex]
		)
		const handleShowLess = useCallback(() => {
			updateState({ forceHorizontalLayout: true, imageContainerWidth: 0 })
			setTimeout(() => animateToIndex(1), 10)
		}, [animateToIndex, updateState])

		// Optimized scroll handlers
		const onScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const contentOffsetX = event.nativeEvent.contentOffset.x
				const currentIndex = Math.round(
					contentOffsetX / computedValues.imageWidth
				)
				if (currentIndex !== state.currentImageIndex) {
					updateState({ currentImageIndex: currentIndex })
				}
			},
			[computedValues.imageWidth, state.currentImageIndex, updateState]
		)

		const onVerticalScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const contentOffsetX = event.nativeEvent.contentOffset.x
				const currentIndex = Math.round(contentOffsetX / AVAILABLE_WIDTH)
				if (currentIndex !== state.currentImageIndex) {
					updateState({ currentImageIndex: currentIndex })
				}
			},
			[state.currentImageIndex, updateState]
		)

		// Track image loading states
		const handleImageLoadStart = useCallback((uri: string) => {
			setLoadingImages((prev) => new Set(prev).add(uri))
		}, [])

		const handleImageLoadEnd = useCallback((uri: string) => {
			setLoadingImages((prev) => {
				const newSet = new Set(prev)
				newSet.delete(uri)
				return newSet
			})
		}, [])

		const renderOptimizedImage = useCallback(
			(item: string, width: number, height: number) => (
				<OptimizedImage
					height={height}
					onLoadEnd={() => handleImageLoadEnd(item)}
					onLoadStart={() => handleImageLoadStart(item)}
					uri={item}
					width={width}
				/>
			),
			[handleImageLoadStart, handleImageLoadEnd]
		)

		const renderPaginationDots = useCallback(() => {
			if ((pandal.images || []).length <= 1) {
				return null
			}

			return (
				<View className="absolute right-3 bottom-2 left-0 flex-row justify-end">
					{(pandal.images || []).map((imageUrl, index) => (
						<PaginationDot
							imageUrl={imageUrl}
							isActive={index === state.currentImageIndex}
							key={`dot-${imageUrl}`}
						/>
					))}
				</View>
			)
		}, [pandal.images, state.currentImageIndex])

		const processedDescription = useMemo(() => {
			const { description } = pandal
			if (!description) {
				return
			}

			const getDescriptionText = () => {
				if (computedValues.isDescriptionExpandedMore) {
					return description
				}
				if (computedValues.isDescriptionExpanded) {
					return description.length > 130
						? `${truncateText(description, 130)}...`
						: description
				}
				return description.length > 60
					? `${truncateText(description, 60)}...`
					: description
			}

			const needsActionButton = () => {
				if (computedValues.isDescriptionExpandedMore) {
					return true
				}
				if (computedValues.isDescriptionExpanded) {
					return description.length > 130
				}
				return description.length > 60
			}

			const getActionText = () => {
				if (!needsActionButton()) {
					return ''
				}
				if (computedValues.isDescriptionExpandedMore) {
					return ' Show less'
				}
				if (computedValues.isDescriptionExpanded) {
					return ' Show more'
				}
				return ' Show more'
			}

			const getActionHandler = () => {
				if (computedValues.isDescriptionExpandedMore) {
					return handleShowLess
				}
				if (computedValues.isDescriptionExpanded) {
					return handleShowMoreAgain
				}
				return handleShowMore
			}

			return {
				text: getDescriptionText(),
				actionText: getActionText(),
				actionHandler: getActionHandler()
			}
		}, [
			pandal,
			computedValues,
			handleShowLess,
			handleShowMoreAgain,
			handleShowMore
		])

		// Optimized FlatList configuration
		const flatListProps = useMemo(() => {
			const dimensions = computedValues.isVerticalLayout
				? imageDimensions.vertical
				: imageDimensions.horizontal

			return {
				data: pandal.images,
				horizontal: true,
				pagingEnabled: true,
				showsHorizontalScrollIndicator: false,
				decelerationRate: 'fast' as const,
				removeClippedSubviews: false, // Keep false for better image caching
				maxToRenderPerBatch: 2, // Reduced for better performance
				windowSize: 3, // Reduced window size
				initialNumToRender: 1,
				updateCellsBatchingPeriod: 50,
				scrollEventThrottle: 32, // Increased for smoother scrolling
				snapToAlignment: 'start' as const,
				keyExtractor: (item: string) => item,
				onScroll: computedValues.isVerticalLayout ? onVerticalScroll : onScroll,
				getItemLayout: (_: unknown, index: number) => ({
					length: dimensions.width,
					offset: dimensions.width * index,
					index
				}),
				renderItem: ({ item }: { item: string }) =>
					renderOptimizedImage(item, dimensions.width, dimensions.height)
			}
		}, [
			computedValues.isVerticalLayout,
			imageDimensions,
			pandal.images,
			onVerticalScroll,
			onScroll,
			renderOptimizedImage
		])

		const renderDescription = useCallback(
			() => (
				<View className="mb-4">
					<Text className="text-sm text-white leading-relaxed">
						{processedDescription?.text}
						<Text
							className="font-medium text-blue-400"
							disabled={state.isLayoutTransitioning}
							onPress={processedDescription?.actionHandler}
						>
							{processedDescription?.actionText}
						</Text>
					</Text>
				</View>
			),
			[processedDescription, state.isLayoutTransitioning]
		)

		const renderRatingSection = useCallback(
			() => (
				<View className="flex-row items-center gap-2">
					{pandal.rating && (
						<>
							<StarRating rating={pandal.rating} />
							<Text className="font-semibold text-sm text-white">
								{pandal.rating.toFixed(1)}
							</Text>
						</>
					)}
				</View>
			),
			[pandal.rating]
		)

		const renderVerticalLayout = useCallback(
			() => (
				<View className="overflow-hidden rounded-2xl bg-white">
					<View className="flex-col">
						<View
							className="relative h-60"
							onLayout={(e) =>
								updateState({ imageContainerWidth: e.nativeEvent.layout.width })
							}
						>
							{(pandal.images || []).length > 1 ? (
								<>
									<FlatList ref={flatListRef} {...flatListProps} />
									<View className="absolute right-3 bottom-3 flex-row">
										{(pandal.images || []).map((imageUrl, index) => (
											<PaginationDot
												imageUrl={imageUrl}
												isActive={index === state.currentImageIndex}
												key={`vertical-dot-${imageUrl}`}
											/>
										))}
									</View>
								</>
							) : (
								renderOptimizedImage(
									(pandal.images || [])[0],
									imageDimensions.vertical.width,
									imageDimensions.vertical.height
								)
							)}
							<View className="absolute right-0 bottom-0 left-0 p-4">
								<Text className="font-bold text-2xl text-white leading-tight">
									{pandal.clubname}
								</Text>
							</View>
						</View>
						<View className="bg-black px-5 pt-2 pb-4">
							{renderDescription()}
							{renderRatingSection()}
						</View>
					</View>
				</View>
			),
			[
				pandal,
				flatListProps,
				imageDimensions,
				renderOptimizedImage,
				state.currentImageIndex,
				updateState,
				renderDescription,
				renderRatingSection
			]
		)

		const renderHorizontalLayout = useCallback(
			() => (
				<View className="h-48 flex-row overflow-hidden rounded-2xl bg-white">
					<View
						className="relative w-2/5"
						onLayout={(e) =>
							updateState({ imageContainerWidth: e.nativeEvent.layout.width })
						}
					>
						{(pandal.images || []).length > 1 ? (
							<>
								<FlatList ref={flatListRef} {...flatListProps} />
								{renderPaginationDots()}
							</>
						) : (
							renderOptimizedImage(
								(pandal.images || [])[0],
								imageDimensions.horizontal.width,
								imageDimensions.horizontal.height
							)
						)}
					</View>
					<View className="flex-1 justify-center bg-black p-6">
						<Text className="mb-3 font-bold text-white text-xl leading-tight">
							{pandal.clubname}
						</Text>
						{renderDescription()}
						{renderRatingSection()}
					</View>
				</View>
			),
			[
				pandal,
				flatListProps,
				imageDimensions,
				renderOptimizedImage,
				renderPaginationDots,
				updateState,
				renderDescription,
				renderRatingSection
			]
		)

		if (!isVisible) return null

		const hasLoadingImages = loadingImages.size > 0
		const showMainContent = !state.isLayoutTransitioning

		return (
			<GestureHandlerRootView
				className="absolute inset-0"
				style={{ pointerEvents: 'box-none' }}
			>
				<BottomSheet
					enablePanDownToClose={true}
					index={1}
					onChange={handleSheetChanges}
					ref={bottomSheetRef}
					snapPoints={snapPoints}
				>
					<BottomSheetView className="flex-1 px-5">
						{showMainContent ? (
							<Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
								{computedValues.isVerticalLayout
									? renderVerticalLayout()
									: renderHorizontalLayout()}
							</Animated.View>
						) : (
							<View className="min-h-[200px] flex-1 items-center justify-center">
								<ActivityIndicator size="small" />
								<Text className="mt-3 text-black text-sm">Loading...</Text>
							</View>
						)}
					</BottomSheetView>
				</BottomSheet>
			</GestureHandlerRootView>
		)
	}
)

PandalDetails.displayName = 'PandalDetails'

export default memo(PandalDetails)
