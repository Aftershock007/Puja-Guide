import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef
} from 'react'
import { StyleSheet, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

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

		const snapPoints = useMemo(() => ['30%', '50%', '80%'], [])

		useImperativeHandle(
			ref,
			() => ({
				closeSheet: () => {
					bottomSheetRef.current?.close()
				}
			}),
			[]
		)

		const handleSheetChanges = useCallback(
			(index: number) => {
				if (index === -1) {
					onClose()
				}
			},
			[onClose]
		)

		useEffect(() => {
			if (isVisible) {
				bottomSheetRef.current?.expand()
			} else {
				bottomSheetRef.current?.close()
			}
		}, [isVisible])

		if (!isVisible) {
			return null
		}

		return (
			<GestureHandlerRootView style={styles.container}>
				<BottomSheet
					enablePanDownToClose={true}
					index={1}
					onChange={handleSheetChanges}
					ref={bottomSheetRef}
					snapPoints={snapPoints}
				>
					<BottomSheetView style={styles.contentContainer}>
						<Text style={styles.title}>{pandal.title}</Text>
						<Text style={styles.description}>{pandal.description}</Text>
						<Text style={styles.rating}>Rating: {pandal.rating}/5</Text>
					</BottomSheetView>
				</BottomSheet>
			</GestureHandlerRootView>
		)
	}
)

PandalDetails.displayName = 'PandalDetails'

export default PandalDetails

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		pointerEvents: 'box-none'
	},
	contentContainer: {
		flex: 1,
		padding: 20,
		alignItems: 'center'
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10
	},
	description: {
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 10
	},
	rating: {
		fontSize: 16,
		fontWeight: '600'
	}
})
