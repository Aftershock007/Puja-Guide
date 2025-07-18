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
	InteractionManager,
	Text,
	View
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import type { Pandals } from '@/types/dbTypes'
import { cleanupCache, preloadImages } from '../../utils/ImageCacheUtils'
import HorizontalLayout from './HorizontalLayout'
import VerticalLayout from './VerticalLayout'

const SCREEN_WIDTH = Dimensions.get('window').width
const PADDING_HORIZONTAL = 35
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING_HORIZONTAL

interface PandalDetailsProps {
	pandal: Pandals
	isVisible: boolean
	onClose: () => void
	allPandals: Pandals[]
	onPandalNavigate?: (pandal: Pandals) => void
}

export interface PandalDetailsRef {
	closeSheet: () => void
}

const PandalDetails = forwardRef<PandalDetailsRef, PandalDetailsProps>(
	({ pandal, isVisible, onClose, allPandals, onPandalNavigate }, ref) => {
		const bottomSheetRef = useRef<BottomSheet>(null)
		const snapPoints = ['35%', '90%', '90%']
		const fadeAnim = useRef(new Animated.Value(1)).current

		const [state, setState] = useState({
			currentImageIndex: 0,
			imageContainerWidth: 0,
			currentSnapIndex: 1,
			forceHorizontalLayout: false,
			isLayoutTransitioning: false
		})

		const computedValues = useMemo(() => {
			const isVerticalLayout =
				state.currentSnapIndex >= 2 && !state.forceHorizontalLayout
			const imageWidth = isVerticalLayout
				? state.imageContainerWidth || AVAILABLE_WIDTH
				: state.imageContainerWidth || AVAILABLE_WIDTH * 0.4

			return {
				isVerticalLayout,
				imageWidth
			}
		}, [
			state.currentSnapIndex,
			state.forceHorizontalLayout,
			state.imageContainerWidth
		])

		const imageDimensions = useMemo(
			() => ({
				vertical: { width: computedValues.imageWidth, height: 200 },
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
				cleanupCache()
				InteractionManager.runAfterInteractions(() => {
					preloadImages(pandal.images || [])
				})
			}
		}, [pandal?.images, isVisible])

		const updateState = useCallback((updates: Partial<typeof state>) => {
			setTimeout(() => {
				setState((prev) => ({ ...prev, ...updates }))
			}, 0)
		}, [])

		const handleNearestPandalPress = useCallback(
			(nearestPandal: Pandals) => {
				if (onPandalNavigate) {
					onPandalNavigate(nearestPandal)
				} else {
					onClose()
				}
			},
			[onPandalNavigate, onClose]
		)

		const handleSheetChanges = useCallback(
			(index: number) => {
				setTimeout(() => {
					setState((prevState) => {
						if (prevState.isLayoutTransitioning) {
							return prevState
						}

						const newIsVerticalLayout =
							index >= 2 && !prevState.forceHorizontalLayout
						const oldIsVerticalLayout =
							prevState.currentSnapIndex >= 2 &&
							!prevState.forceHorizontalLayout

						if (index < 1) {
							onClose()
							return prevState
						}

						if (newIsVerticalLayout !== oldIsVerticalLayout) {
							const newState = { ...prevState, isLayoutTransitioning: true }
							setState(newState)

							Animated.timing(fadeAnim, {
								toValue: 0.3,
								duration: 80,
								useNativeDriver: true
							}).start(() => {
								setTimeout(() => {
									setState((prev) => ({
										...prev,
										currentSnapIndex: index,
										imageContainerWidth: 0,
										forceHorizontalLayout:
											index < 2 ? false : prev.forceHorizontalLayout
									}))

									Animated.timing(fadeAnim, {
										toValue: 1,
										duration: 120,
										useNativeDriver: true
									}).start(() => {
										setTimeout(() => {
											setState((prev) => ({
												...prev,
												isLayoutTransitioning: false
											}))
										}, 0)
									})
								}, 0)
							})
							return newState
						}
						return {
							...prevState,
							currentSnapIndex: index,
							forceHorizontalLayout:
								index < 2 ? false : prevState.forceHorizontalLayout
						}
					})
				}, 0)
			},
			[onClose, fadeAnim]
		)

		useEffect(() => {
			if (isVisible) {
				InteractionManager.runAfterInteractions(() => {
					setTimeout(() => {
						bottomSheetRef.current?.expand()
						setState({
							currentImageIndex: 0,
							imageContainerWidth: 0,
							currentSnapIndex: 1,
							forceHorizontalLayout: false,
							isLayoutTransitioning: false
						})
						fadeAnim.setValue(1)
					}, 0)
				})
			} else {
				bottomSheetRef.current?.close()
			}
		}, [isVisible, fadeAnim])

		const handleImageIndexChange = useCallback(
			(index: number) => {
				updateState({ currentImageIndex: index })
			},
			[updateState]
		)

		const handleImageContainerLayout = useCallback(
			(width: number) => {
				updateState({ imageContainerWidth: width })
			},
			[updateState]
		)

		const currentDimensions = computedValues.isVerticalLayout
			? imageDimensions.vertical
			: imageDimensions.horizontal

		if (!isVisible) {
			return null
		}

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
								{computedValues.isVerticalLayout ? (
									<VerticalLayout
										allPandals={allPandals}
										currentImageIndex={state.currentImageIndex}
										imageHeight={currentDimensions.height}
										imageWidth={currentDimensions.width}
										onImageContainerLayout={handleImageContainerLayout}
										onImageIndexChange={handleImageIndexChange}
										onNearestPandalPress={handleNearestPandalPress}
										pandal={pandal}
									/>
								) : (
									<HorizontalLayout
										currentImageIndex={state.currentImageIndex}
										imageHeight={currentDimensions.height}
										imageWidth={currentDimensions.width}
										onImageContainerLayout={handleImageContainerLayout}
										onImageIndexChange={handleImageIndexChange}
										pandal={pandal}
									/>
								)}
							</Animated.View>
						) : (
							<View className="min-h-[200px] flex-1 items-center justify-center">
								<ActivityIndicator color="black" size="small" />
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
