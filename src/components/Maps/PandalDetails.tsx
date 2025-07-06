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
import StarRating from './StarRating'

const TRAILING_PUNCTUATION_REGEX = /[.,!?;:]+$/
const SCREEN_WIDTH = Dimensions.get('window').width
const PADDING_HORIZONTAL = 35
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING_HORIZONTAL

const imageCache = new Map<string, { loaded: boolean; error: boolean }>()

const preloadImage = (uri: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (imageCache.has(uri)) {
			resolve()
			return
		}
		Image.prefetch(uri)
			.then(() => {
				imageCache.set(uri, { loaded: true, error: false })
				resolve()
			})
			.catch(() => {
				imageCache.set(uri, { loaded: false, error: true })
				reject()
			})
	})
}

interface Pandal {
	id: string
	latitude: number
	longitude: number
	title: string
	description: string
	rating: number
	images: string[]
}

interface PandalDetailsProps {
	pandal: Pandal
	isVisible: boolean
	onClose: () => void
}

export interface PandalDetailsRef {
	closeSheet: () => void
}

const LoadingOverlay = memo(() => (
	<View className="absolute inset-0 items-center justify-center rounded-lg bg-white/80">
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

const ImageWithLoader = memo<{
	item: string
	width: number
	height: number
	isLoading: boolean
	onLoad: (url: string) => void
	onError: (url: string) => void
}>(({ item, width, height, isLoading, onLoad, onError }) => (
	<View className="relative" style={{ width, height }}>
		<Image
			className={isLoading ? 'opacity-30' : 'opacity-100'}
			onError={() => onError(item)}
			onLoad={() => onLoad(item)}
			resizeMode="cover"
			source={{ uri: item, cache: 'force-cache' }}
			style={{ width, height }}
		/>
		{isLoading && <LoadingOverlay />}
	</View>
))

const PandalDetails = forwardRef<PandalDetailsRef, PandalDetailsProps>(
	({ pandal, isVisible, onClose }, ref) => {
		const bottomSheetRef = useRef<BottomSheet>(null)
		const snapPoints = useMemo(() => ['35%', '60%', '80%'], [])
		const fadeAnim = useRef(new Animated.Value(1)).current
		const flatListRef = useRef<FlatList>(null)

		const [state, setState] = useState({
			currentImageIndex: 0,
			imageContainerWidth: 0,
			currentSnapIndex: 1,
			isLoading: false,
			forceHorizontalLayout: false,
			isTransitioning: false
		})

		const [imageLoadingStates, setImageLoadingStates] = useState<
			Record<string, boolean>
		>({})

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

		useEffect(() => {
			if (pandal?.images && isVisible) {
				InteractionManager.runAfterInteractions(() => {
					for (const imageUrl of pandal.images) {
						preloadImage(imageUrl).catch(() => {
							// Preload errors
						})
					}
				})
				const loadingStates: Record<string, boolean> = {}
				for (const imageUrl of pandal.images) {
					const cached = imageCache.get(imageUrl)
					loadingStates[imageUrl] = !cached?.loaded
				}
				setImageLoadingStates(loadingStates)
			}
		}, [pandal?.images, isVisible])

		const handleImageLoad = useCallback((imageUrl: string) => {
			imageCache.set(imageUrl, { loaded: true, error: false })
			setImageLoadingStates((prev) => ({ ...prev, [imageUrl]: false }))
		}, [])

		const handleImageError = useCallback((imageUrl: string) => {
			imageCache.set(imageUrl, { loaded: false, error: true })
			setImageLoadingStates((prev) => ({ ...prev, [imageUrl]: false }))
		}, [])

		const updateState = useCallback((updates: Partial<typeof state>) => {
			setState((prev) => ({ ...prev, ...updates }))
		}, [])

		const animateToIndex = useCallback(
			(targetIndex: number, callback?: () => void) => {
				updateState({ isLoading: true })
				requestAnimationFrame(() => {
					setTimeout(() => {
						Animated.timing(fadeAnim, {
							toValue: 0.7,
							duration: 200,
							useNativeDriver: true
						}).start(() => {
							bottomSheetRef.current?.snapToIndex(targetIndex)
							Animated.timing(fadeAnim, {
								toValue: 1,
								duration: 300,
								useNativeDriver: true
							}).start(() => {
								updateState({ isLoading: false })
								callback?.()
							})
						})
					}, 50)
				})
			},
			[fadeAnim, updateState]
		)

		const handleSheetChanges = useCallback(
			(index: number) => {
				const newIsVerticalLayout = index >= 2 && !state.forceHorizontalLayout
				const oldIsVerticalLayout =
					state.currentSnapIndex >= 2 && !state.forceHorizontalLayout
				const updates: Partial<typeof state> = {
					isTransitioning: true,
					currentSnapIndex: index
				}
				if (newIsVerticalLayout !== oldIsVerticalLayout) {
					updates.imageContainerWidth = 0
					const resetLoadingStates: Record<string, boolean> = {}
					for (const imageUrl of pandal.images) {
						const cached = imageCache.get(imageUrl)
						resetLoadingStates[imageUrl] = !cached?.loaded
					}
					setImageLoadingStates(resetLoadingStates)
				}
				if (index < 2) {
					updates.forceHorizontalLayout = false
				}
				if (index === -1) {
					onClose()
				}
				updateState(updates)
				setTimeout(() => updateState({ isTransitioning: false }), 300)
			},
			[
				state.currentSnapIndex,
				state.forceHorizontalLayout,
				pandal.images,
				onClose,
				updateState
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
						isLoading: false,
						forceHorizontalLayout: false,
						isTransitioning: false
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
			updateState({
				forceHorizontalLayout: true,
				imageContainerWidth: 0
			})
			const resetLoadingStates: Record<string, boolean> = {}
			for (const imageUrl of pandal.images) {
				const cached = imageCache.get(imageUrl)
				resetLoadingStates[imageUrl] = !cached?.loaded
			}
			setImageLoadingStates(resetLoadingStates)
			animateToIndex(1)
		}, [animateToIndex, pandal.images, updateState])

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

		const renderImageWithLoader = useCallback(
			(item: string, width: number, height: number) => {
				const isImageLoading = imageLoadingStates[item] || state.isTransitioning
				return (
					<ImageWithLoader
						height={height}
						isLoading={isImageLoading}
						item={item}
						onError={handleImageError}
						onLoad={handleImageLoad}
						width={width}
					/>
				)
			},
			[
				imageLoadingStates,
				state.isTransitioning,
				handleImageLoad,
				handleImageError
			]
		)

		const renderPaginationDots = useCallback(() => {
			if (pandal.images.length <= 1) {
				return null
			}
			return (
				<View className="absolute right-3 bottom-2 left-0 flex-row justify-end">
					{pandal.images.map((imageUrl, index) => (
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
			const sliceTextAtWordBoundary = (
				text: string,
				maxLength: number
			): string => {
				if (text.length <= maxLength) {
					return text
				}
				let sliced = text.slice(0, maxLength)
				const lastSpaceIndex = sliced.lastIndexOf(' ')
				if (lastSpaceIndex > 0) {
					sliced = sliced.slice(0, lastSpaceIndex)
				}
				return sliced.trim().replace(TRAILING_PUNCTUATION_REGEX, '')
			}

			const getDescriptionText = () => {
				if (computedValues.isDescriptionExpandedMore) {
					return description
				}
				if (computedValues.isDescriptionExpanded) {
					return description.length > 130
						? `${sliceTextAtWordBoundary(description, 130)}...`
						: description
				}
				return description.length > 60
					? `${sliceTextAtWordBoundary(description, 60)}...`
					: description
			}

			const getActionText = () => {
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
				removeClippedSubviews: true,
				maxToRenderPerBatch: 3,
				windowSize: 5,
				initialNumToRender: 2,
				updateCellsBatchingPeriod: 100,
				getItemLayout: (_: unknown, index: number) => ({
					length: dimensions.width,
					offset: dimensions.width * index,
					index
				}),
				keyExtractor: (item: string) => item,
				onScroll: computedValues.isVerticalLayout ? onVerticalScroll : onScroll,
				scrollEventThrottle: 16,
				snapToAlignment: 'start' as const,
				renderItem: ({ item }: { item: string }) =>
					renderImageWithLoader(item, dimensions.width, dimensions.height)
			}
		}, [
			computedValues.isVerticalLayout,
			imageDimensions,
			pandal.images,
			onVerticalScroll,
			onScroll,
			renderImageWithLoader
		])

		const renderDescription = useCallback(
			() => (
				<View className="mb-4">
					<Text className="text-sm text-white leading-relaxed">
						{processedDescription.text}
						<Text
							className="font-medium text-blue-400"
							disabled={state.isLoading}
							onPress={processedDescription.actionHandler}
						>
							{processedDescription.actionText}
						</Text>
					</Text>
				</View>
			),
			[processedDescription, state.isLoading]
		)

		const renderRatingSection = useCallback(
			() => (
				<View className="flex-row items-center gap-2">
					<StarRating rating={pandal.rating} />
					<Text className="font-semibold text-sm text-white">
						{pandal.rating.toFixed(1)}
					</Text>
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
							{pandal.images.length > 1 ? (
								<>
									<FlatList ref={flatListRef} {...flatListProps} />
									<View className="absolute right-3 bottom-3 flex-row">
										{pandal.images.map((imageUrl, index) => (
											<PaginationDot
												imageUrl={imageUrl}
												isActive={index === state.currentImageIndex}
												key={`vertical-dot-${imageUrl}`}
											/>
										))}
									</View>
								</>
							) : (
								renderImageWithLoader(
									pandal.images[0],
									imageDimensions.vertical.width,
									imageDimensions.vertical.height
								)
							)}
							<View className="absolute right-0 bottom-0 left-0 p-6">
								<Text className="font-bold text-2xl text-white leading-tight">
									{pandal.title}
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
				renderImageWithLoader,
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
						{pandal.images.length > 1 ? (
							<>
								<FlatList ref={flatListRef} {...flatListProps} />
								{renderPaginationDots()}
							</>
						) : (
							renderImageWithLoader(
								pandal.images[0],
								imageDimensions.horizontal.width,
								imageDimensions.horizontal.height
							)
						)}
					</View>
					<View className="flex-1 justify-center bg-black p-6">
						<Text className="mb-3 font-bold text-white text-xl leading-tight">
							{pandal.title}
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
				renderImageWithLoader,
				renderPaginationDots,
				updateState,
				renderDescription,
				renderRatingSection
			]
		)

		if (!isVisible) {
			return null
		}

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
						{state.isLoading ? (
							<View className="min-h-[200px] flex-1 items-center justify-center">
								<ActivityIndicator size="small" />
								<Text className="mt-3 text-black text-sm">Loading...</Text>
							</View>
						) : (
							<Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
								{computedValues.isVerticalLayout
									? renderVerticalLayout()
									: renderHorizontalLayout()}
							</Animated.View>
						)}
					</BottomSheetView>
				</BottomSheet>
			</GestureHandlerRootView>
		)
	}
)

PandalDetails.displayName = 'PandalDetails'

export default memo(PandalDetails)
