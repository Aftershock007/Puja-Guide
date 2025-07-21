import { useUser } from '@clerk/clerk-expo'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { useCallback, useMemo } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	RefreshControl,
	Text,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import HorizontalLayout from '@/components/PandalDetails/HorizontalLayout'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePandalStore } from '@/stores/pandalStore'
import { useUIStore } from '@/stores/uiStore'
import type { Pandals } from '@/types/dbTypes'

const SCREEN_WIDTH = Dimensions.get('window').width
const ITEM_HEIGHT = 190

export default function FavoritesScreen() {
	const { user } = useUser()
	const insets = useSafeAreaInsets()

	const { currentImageIndex, setCurrentImageIndex, setImageContainerWidth } =
		useUIStore()

	const favorites = useFavoritesStore((state) => state.favorites)
	const pandals = usePandalStore((state) => state.pandals)
	const pandalLoading = usePandalStore((state) => state.loading)
	const loadPandals = usePandalStore((state) => state.loadPandals)
	const supabase = useSupabaseStore((state) => state.supabase)

	const favoritePandals = useMemo(() => {
		if (!favorites || favorites.size === 0) {
			return []
		}
		return pandals.filter((pandal) => favorites.has(pandal.id))
	}, [favorites, pandals])

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

	const handleRefresh = useCallback(() => {
		if (supabase) {
			loadPandals(supabase, true)
		}
	}, [loadPandals, supabase])

	const renderFavoritePandal = useCallback(
		({ item }: { item: Pandals }) => (
			<View className="mx-5 mb-4">
				<HorizontalLayout
					currentImageIndex={currentImageIndex}
					imageHeight={ITEM_HEIGHT}
					imageWidth={SCREEN_WIDTH * 0.4}
					onImageContainerLayout={handleImageContainerLayout}
					onImageIndexChange={handleImageIndexChange}
					pandal={item}
					userId={String(user?.id)}
				/>
			</View>
		),
		[
			handleImageContainerLayout,
			user?.id,
			currentImageIndex,
			handleImageIndexChange
		]
	)

	const keyExtractor = useCallback((item: Pandals) => `favorite-${item.id}`, [])

	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: ITEM_HEIGHT + 16,
			offset: (ITEM_HEIGHT + 16) * index,
			index
		}),
		[]
	)

	if (pandalLoading && pandals.length === 0) {
		return (
			<View
				className="flex-1 items-center justify-center bg-white"
				style={{
					paddingTop: insets.top,
					paddingBottom: insets.bottom
				}}
			>
				<ActivityIndicator color="#000" size="large" />
				<Text className="mt-4 font-medium text-gray-800 text-lg">
					Loading your favorites...
				</Text>
			</View>
		)
	}

	if (favoritePandals.length === 0) {
		return (
			<View
				className="flex-1 items-center justify-center bg-white px-8"
				style={{
					paddingTop: insets.top,
					paddingBottom: insets.bottom
				}}
			>
				<FontAwesome6
					className="pb-3"
					color="red"
					name="heart-crack"
					size={35}
				/>
				<Text className="mb-3 text-center font-bold text-2xl text-black">
					No Favorites Yet
				</Text>
				<Text className="text-center text-base text-gray-600 leading-6">
					Start exploring pandals and tap the heart icon to add them to your
					favorites!
				</Text>
			</View>
		)
	}

	return (
		<View
			className="flex-1 bg-white"
			style={{
				paddingTop: insets.top,
				paddingBottom: insets.bottom
			}}
		>
			<View className="px-5 pt-4 pb-6">
				<Text className="font-bold text-3xl text-black">My Favorites</Text>
				<Text className="mt-1 text-base text-gray-600">
					{favoritePandals.length} pandal
					{favoritePandals.length !== 1 ? 's' : ''} you love
				</Text>
			</View>

			<FlatList
				contentContainerStyle={{
					paddingBottom: 20,
					flexGrow: 1
				}}
				data={favoritePandals}
				getItemLayout={getItemLayout}
				initialNumToRender={4}
				keyExtractor={keyExtractor}
				maxToRenderPerBatch={5}
				removeClippedSubviews={true}
				renderItem={renderFavoritePandal}
				showsVerticalScrollIndicator={false}
				updateCellsBatchingPeriod={50}
				windowSize={7}
			/>
		</View>
	)
}
