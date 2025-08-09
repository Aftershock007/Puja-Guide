import { useUser } from '@clerk/clerk-expo'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef
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
import { useUIStore } from '@/stores/uiStore'
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
		const { user } = useUser()

		const {
			currentImageIndex,
			imageContainerWidth,
			currentSnapIndex,
			forceHorizontalLayout,
			isLayoutTransitioning,
			setCurrentImageIndex,
			setImageContainerWidth,
			setIsLayoutTransitioning,
			resetUI,
			updateState
		} = useUIStore()

		const computedValues = useMemo(() => {
			const isVerticalLayout = currentSnapIndex >= 2 && !forceHorizontalLayout
			const imageWidth = isVerticalLayout
				? imageContainerWidth || AVAILABLE_WIDTH
				: imageContainerWidth || AVAILABLE_WIDTH * 0.4

			return {
				isVerticalLayout,
				imageWidth
			}
		}, [currentSnapIndex, forceHorizontalLayout, imageContainerWidth])

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
				if (isLayoutTransitioning) {
					return
				}

				const newIsVerticalLayout = index >= 1 && !forceHorizontalLayout
				const oldIsVerticalLayout =
					currentSnapIndex >= 1 && !forceHorizontalLayout

				if (index < 1) {
					resetUI()
					onClose()
					return
				}

				if (newIsVerticalLayout !== oldIsVerticalLayout) {
					setIsLayoutTransitioning(true)

					Animated.timing(fadeAnim, {
						toValue: 0.3,
						duration: 80,
						useNativeDriver: true
					}).start(() => {
						setTimeout(() => {
							updateState({
								currentSnapIndex: index,
								imageContainerWidth: 0,
								forceHorizontalLayout: index < 1 ? false : forceHorizontalLayout
							})

							Animated.timing(fadeAnim, {
								toValue: 1,
								duration: 120,
								useNativeDriver: true
							}).start(() => {
								setIsLayoutTransitioning(false)
							})
						}, 0)
					})
					return
				}

				updateState({
					currentSnapIndex: index,
					forceHorizontalLayout: index < 1 ? false : forceHorizontalLayout
				})
			},
			[
				onClose,
				resetUI,
				fadeAnim,
				isLayoutTransitioning,
				forceHorizontalLayout,
				currentSnapIndex,
				setIsLayoutTransitioning,
				updateState
			]
		)

		useEffect(() => {
			if (isVisible) {
				resetUI()
				InteractionManager.runAfterInteractions(() => {
					bottomSheetRef.current?.expand()
					fadeAnim.setValue(1)
				})
			} else {
				bottomSheetRef.current?.close()
			}
		}, [isVisible, fadeAnim, resetUI])

		const handleImageIndexChange = useCallback(
			(index: number) => {
				setCurrentImageIndex(index)
			},
			[setCurrentImageIndex]
		)

		const handleImageContainerLayout = useCallback(
			(width: number) => {
				setImageContainerWidth(width)
			},
			[setImageContainerWidth]
		)

		const currentDimensions = computedValues.isVerticalLayout
			? imageDimensions.vertical
			: imageDimensions.horizontal

		if (!isVisible) {
			return null
		}

		const showMainContent = !isLayoutTransitioning

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
										currentImageIndex={currentImageIndex}
										imageHeight={currentDimensions.height}
										imageWidth={currentDimensions.width}
										onImageContainerLayout={handleImageContainerLayout}
										onImageIndexChange={handleImageIndexChange}
										onNearestPandalPress={handleNearestPandalPress}
										pandal={pandal}
										userId={String(user?.id)}
									/>
								) : (
									<HorizontalLayout
										currentImageIndex={currentImageIndex}
										imageHeight={currentDimensions.height}
										imageWidth={currentDimensions.width}
										onImageContainerLayout={handleImageContainerLayout}
										onImageIndexChange={handleImageIndexChange}
										pandal={pandal}
										userId={String(user?.id)}
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
