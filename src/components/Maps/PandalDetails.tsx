import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import {
	forwardRef,
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
	type LayoutChangeEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Text,
	View
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import StarRating from './StarRating'

const TRAILING_PUNCTUATION_REGEX = /[.,!?;:]+$/

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

const PandalDetails = forwardRef<PandalDetailsRef, PandalDetailsProps>(
	({ pandal, isVisible, onClose }, ref) => {
		const bottomSheetRef = useRef<BottomSheet>(null)
		const snapPoints = useMemo(() => ['35%', '60%', '80%'], [])
		const [currentImageIndex, setCurrentImageIndex] = useState(0)
		const [imageContainerWidth, setImageContainerWidth] = useState(0)
		const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
		const [isDescriptionExpandedMore, setIsDescriptionExpandedMore] =
			useState(false)
		const [currentSnapIndex, setCurrentSnapIndex] = useState(1)
		const [isLoading, setIsLoading] = useState(false)
		const [forceHorizontalLayout, setForceHorizontalLayout] = useState(false)
		const [imageLoadingStates, setImageLoadingStates] = useState<{
			[key: string]: boolean
		}>({})
		const [isTransitioning, setIsTransitioning] = useState(false)

		const fadeAnim = useRef(new Animated.Value(1)).current
		const screenWidth = Dimensions.get('window').width
		const paddingHorizontal = 35
		const isVerticalLayout = currentSnapIndex >= 2 && !forceHorizontalLayout

		const imageWidth = useMemo(() => {
			if (isVerticalLayout) {
				return imageContainerWidth || screenWidth - paddingHorizontal
			}
			const availableWidth = screenWidth - paddingHorizontal
			return imageContainerWidth || availableWidth * 0.4
		}, [imageContainerWidth, screenWidth, isVerticalLayout])

		useImperativeHandle(
			ref,
			() => ({
				closeSheet: () => {
					bottomSheetRef.current?.close()
				}
			}),
			[]
		)

		useEffect(() => {
			if (pandal?.images) {
				const initialLoadingStates: { [key: string]: boolean } = {}
				for (const imageUrl of pandal.images) {
					initialLoadingStates[imageUrl] = true
				}
				setImageLoadingStates(initialLoadingStates)
			}
		}, [pandal?.images])

		const handleImageLoad = useCallback((imageUrl: string) => {
			setImageLoadingStates((prev) => ({
				...prev,
				[imageUrl]: false
			}))
		}, [])

		const handleImageError = useCallback((imageUrl: string) => {
			setImageLoadingStates((prev) => ({
				...prev,
				[imageUrl]: false
			}))
		}, [])

		const handleSheetChanges = useCallback(
			(index: number) => {
				setIsTransitioning(true)
				const newIsVerticalLayout = index >= 2 && !forceHorizontalLayout
				const oldIsVerticalLayout =
					currentSnapIndex >= 2 && !forceHorizontalLayout
				setCurrentSnapIndex(index)
				if (newIsVerticalLayout !== oldIsVerticalLayout) {
					setImageContainerWidth(0)
					if (pandal?.images) {
						const resetLoadingStates: { [key: string]: boolean } = {}
						for (const imageUrl of pandal.images) {
							resetLoadingStates[imageUrl] = true
						}
						setImageLoadingStates(resetLoadingStates)
					}
				}
				if (index < 2 && isDescriptionExpanded) {
					setIsDescriptionExpanded(false)
					setIsDescriptionExpandedMore(false)
				}
				if (index < 2) {
					setForceHorizontalLayout(false)
				}
				if (index <= 1) {
					setIsDescriptionExpanded(false)
					setIsDescriptionExpandedMore(false)
				}
				if (index === 2) {
					setIsDescriptionExpanded(true)
					setIsDescriptionExpandedMore(false)
				}
				if (index === 3) {
					setIsDescriptionExpandedMore(true)
					setIsDescriptionExpanded(false)
				}
				if (index === -1) {
					onClose()
				}
				setTimeout(() => {
					setIsTransitioning(false)
				}, 300)
			},
			[
				onClose,
				isDescriptionExpanded,
				currentSnapIndex,
				forceHorizontalLayout,
				pandal?.images
			]
		)

		useEffect(() => {
			if (isVisible) {
				bottomSheetRef.current?.expand()
				setCurrentImageIndex(0)
				setIsDescriptionExpanded(false)
				setIsDescriptionExpandedMore(false)
				setCurrentSnapIndex(1)
				setForceHorizontalLayout(false)
				fadeAnim.setValue(1)
				setIsLoading(false)
				setIsTransitioning(false)
				setImageContainerWidth(0) // Reset width on visibility change
			} else {
				bottomSheetRef.current?.close()
			}
		}, [isVisible, fadeAnim])

		const handleShowMore = useCallback(() => {
			setIsLoading(true)
			setIsDescriptionExpanded(true)
			setForceHorizontalLayout(false)

			setTimeout(() => {
				Animated.timing(fadeAnim, {
					toValue: 0.7,
					duration: 200,
					useNativeDriver: true
				}).start(() => {
					bottomSheetRef.current?.snapToIndex(2)
					Animated.timing(fadeAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true
					}).start(() => {
						setIsLoading(false)
					})
				})
			}, 50)
		}, [fadeAnim])

		const handleShowMoreAgain = useCallback(() => {
			setIsLoading(true)
			setIsDescriptionExpandedMore(true)
			setForceHorizontalLayout(false)

			setTimeout(() => {
				Animated.timing(fadeAnim, {
					toValue: 0.7,
					duration: 200,
					useNativeDriver: true
				}).start(() => {
					bottomSheetRef.current?.snapToIndex(3)
					Animated.timing(fadeAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true
					}).start(() => {
						setIsLoading(false)
					})
				})
			}, 50)
		}, [fadeAnim])

		const handleShowLess = useCallback(() => {
			setIsLoading(true)
			setIsDescriptionExpanded(false)
			setIsDescriptionExpandedMore(false)
			setForceHorizontalLayout(true)

			// Reset container width to force recalculation for horizontal layout
			setImageContainerWidth(0)

			// Reset image loading states when switching to horizontal layout
			if (pandal?.images) {
				const resetLoadingStates: { [key: string]: boolean } = {}
				for (const imageUrl of pandal.images) {
					resetLoadingStates[imageUrl] = true
				}
				setImageLoadingStates(resetLoadingStates)
			}

			Animated.timing(fadeAnim, {
				toValue: 0.7,
				duration: 200,
				useNativeDriver: true
			}).start(() => {
				bottomSheetRef.current?.snapToIndex(1)
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				}).start(() => {
					setIsLoading(false)
				})
			})
		}, [fadeAnim, pandal?.images])

		const onScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const contentOffsetX = event.nativeEvent.contentOffset.x
				const currentIndex = Math.round(contentOffsetX / imageWidth)
				setCurrentImageIndex(currentIndex)
			},
			[imageWidth]
		)

		const onVerticalScroll = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const contentOffsetX = event.nativeEvent.contentOffset.x
				const currentIndex = Math.round(
					contentOffsetX / (screenWidth - paddingHorizontal)
				)
				setCurrentImageIndex(currentIndex)
			},
			[screenWidth]
		)

		const renderImageWithLoader = ({
			item,
			width,
			height
		}: {
			item: string
			width: number
			height: number
		}) => {
			const isImageLoading = imageLoadingStates[item] || isTransitioning

			return (
				<View style={{ width, height, position: 'relative' }}>
					<Image
						onError={() => handleImageError(item)}
						onLoad={() => handleImageLoad(item)}
						resizeMode="cover"
						source={{
							uri: item,
							cache: 'force-cache'
						}}
						style={{
							width,
							height,
							opacity: isImageLoading ? 0.3 : 1
						}}
					/>
					{isImageLoading && (
						<View
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								backgroundColor: 'rgba(255, 255, 255, 0.8)',
								justifyContent: 'center',
								alignItems: 'center',
								borderRadius: 8
							}}
						>
							<ActivityIndicator color="black" size="small" />
						</View>
					)}
				</View>
			)
		}

		const renderImage = ({ item }: { item: string }) =>
			renderImageWithLoader({ item, width: imageWidth, height: 200 })

		const onImageContainerLayout = (event: LayoutChangeEvent) => {
			const { width } = event.nativeEvent.layout
			setImageContainerWidth(width)
		}

		const renderPaginationDots = () => {
			if (pandal.images.length <= 1) {
				return null
			}
			return (
				<View className="absolute right-3 bottom-2 left-0 flex-row justify-end">
					{pandal.images.map((_, index) => (
						<View
							className={`mx-1 h-2 w-2 rounded-full ${
								index === currentImageIndex ? 'bg-white' : 'bg-white/50'
							}`}
							key={index}
						/>
					))}
				</View>
			)
		}

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

		const renderDescription = () => {
			const description = pandal.description

			if (isDescriptionExpandedMore) {
				return (
					<View className="mb-4">
						<Text className="text-sm text-white leading-relaxed">
							{description}
							<Text
								className="font-medium text-blue-400"
								disabled={isLoading}
								onPress={handleShowLess}
							>
								{' Show less'}
							</Text>
						</Text>
					</View>
				)
			}

			if (isDescriptionExpanded) {
				return (
					<View className="mb-4">
						<Text className="text-sm text-white leading-relaxed">
							{description.length > 130
								? `${sliceTextAtWordBoundary(description, 130)}...`
								: description}
							<Text
								className="font-medium text-blue-400"
								disabled={isLoading}
								onPress={handleShowMoreAgain}
							>
								{' Show more'}
							</Text>
						</Text>
					</View>
				)
			}

			return (
				<View className="mb-4">
					<Text className="text-sm text-white leading-relaxed">
						{description.length > 60
							? `${sliceTextAtWordBoundary(description, 60)}...`
							: description}
						<Text
							className="font-medium text-blue-400"
							disabled={isLoading}
							onPress={handleShowMore}
						>
							{' Show more'}
						</Text>
					</Text>
				</View>
			)
		}

		const renderVerticalLayout = () => (
			<View className="overflow-hidden rounded-2xl bg-white">
				<View className="flex-col">
					<View className="relative h-60" onLayout={onImageContainerLayout}>
						{pandal.images.length > 1 ? (
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
									keyExtractor={(_, index) => `image-vertical-${index}`}
									onScroll={onVerticalScroll}
									pagingEnabled
									removeClippedSubviews={false}
									renderItem={({ item }) =>
										renderImageWithLoader({
											item,
											width: screenWidth - paddingHorizontal,
											height: 240
										})
									}
									scrollEventThrottle={16}
									showsHorizontalScrollIndicator={false}
									snapToAlignment="start"
								/>
								<View className="absolute right-3 bottom-3 flex-row">
									{pandal.images.map((_, index) => (
										<View
											className={`mx-1 h-2 w-2 rounded-full ${
												index === currentImageIndex ? 'bg-white' : 'bg-white/50'
											}`}
											key={index}
										/>
									))}
								</View>
							</>
						) : (
							renderImageWithLoader({
								item: pandal.images[0],
								width: screenWidth - paddingHorizontal,
								height: 240
							})
						)}
						<View className="absolute right-0 bottom-0 left-0 p-6">
							<Text className="font-bold text-2xl text-white leading-tight">
								{pandal.title}
							</Text>
						</View>
					</View>
					<View className="bg-black px-5 pt-2 pb-4">
						{renderDescription()}
						<View className="flex-row items-center gap-2">
							<StarRating rating={pandal.rating} />
							<Text className="font-semibold text-sm text-white">
								{pandal.rating.toFixed(1)}
							</Text>
						</View>
					</View>
				</View>
			</View>
		)

		const renderHorizontalLayout = () => (
			<View className="h-48 flex-row overflow-hidden rounded-2xl bg-white">
				<View className="relative w-2/5" onLayout={onImageContainerLayout}>
					{pandal.images.length > 1 ? (
						<>
							<FlatList
								data={pandal.images}
								decelerationRate="fast"
								getItemLayout={(_, index) => ({
									length: imageWidth,
									offset: imageWidth * index,
									index
								})}
								horizontal
								keyExtractor={(_, index) => `image-horizontal-${index}`}
								onScroll={onScroll}
								pagingEnabled
								removeClippedSubviews={false}
								renderItem={renderImage}
								scrollEventThrottle={30}
								showsHorizontalScrollIndicator={false}
								snapToAlignment="start"
							/>
							{renderPaginationDots()}
						</>
					) : (
						renderImageWithLoader({
							item: pandal.images[0],
							width: imageWidth,
							height: 200
						})
					)}
				</View>
				<View className="flex-1 justify-center bg-black p-6">
					<Text className="mb-3 font-bold text-white text-xl leading-tight">
						{pandal.title}
					</Text>
					{renderDescription()}
					<View className="flex-row items-center gap-2">
						<StarRating rating={pandal.rating} />
						<Text className="font-semibold text-sm text-white">
							{pandal.rating.toFixed(1)}
						</Text>
					</View>
				</View>
			</View>
		)

		const renderLoader = () => (
			<View className="min-h-[200px] flex-1 items-center justify-center">
				<ActivityIndicator size="small" />
				<Text className="mt-3 text-black text-sm">Loading...</Text>
			</View>
		)

		if (!isVisible) {
			return null
		}

		return (
			<GestureHandlerRootView
				className="absolute top-0 right-0 bottom-0 left-0"
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
						{isLoading ? (
							renderLoader()
						) : (
							<Animated.View
								style={{
									opacity: fadeAnim,
									flex: 1
								}}
							>
								{isVerticalLayout
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

export default PandalDetails
