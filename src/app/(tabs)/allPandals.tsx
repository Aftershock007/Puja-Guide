import { Ionicons } from '@expo/vector-icons'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	Modal,
	RefreshControl,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PandalDetails, {
	type PandalDetailsRef
} from '@/components/PandalDetails/PandalDetails'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePandalStore } from '@/stores/pandalStore'
import { useVisitedStore } from '@/stores/visitedStore'
import type { Pandals } from '@/types/dbTypes'

type SortOption = 'name' | 'rating' | 'popularity'

interface SortConfig {
	label: string
	value: SortOption
}

const SORT_OPTIONS: SortConfig[] = [
	{ label: 'Sort by Name (A-Z)', value: 'name' },
	{ label: 'Sort by Rating', value: 'rating' },
	{ label: 'Most Popular', value: 'popularity' }
]

export default function AllPandalsScreen() {
	const insets = useSafeAreaInsets()
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedPandal, setSelectedPandal] = useState<Pandals | null>(null)
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
	const [sortBy, setSortBy] = useState<SortOption>('name')
	const [showSortModal, setShowSortModal] = useState(false)
	const pandalDetailsRef = useRef<PandalDetailsRef>(null)
	const searchInputRef = useRef<TextInput>(null)

	const pandals = usePandalStore((state) => state.pandals)
	const loading = usePandalStore((state) => state.loading)
	const error = usePandalStore((state) => state.error)
	const loadPandals = usePandalStore((state) => state.loadPandals)
	const favorites = useFavoritesStore((state) => state.favorites)
	const visited = useVisitedStore((state) => state.visited)
	const supabase = useSupabaseStore((state) => state.supabase)

	const filteredPandals = useMemo(() => {
		if (!searchQuery.trim()) {
			return pandals
		}

		const query = searchQuery.toLowerCase().trim()
		return pandals.filter(
			(pandal) =>
				pandal.clubname?.toLowerCase().includes(query) ||
				pandal.address?.toLowerCase().includes(query) ||
				pandal.theme?.toLowerCase().includes(query) ||
				pandal.artistname?.toLowerCase().includes(query)
		)
	}, [pandals, searchQuery])

	const sortedPandals = useMemo(() => {
		const sorted = [...filteredPandals]

		switch (sortBy) {
			case 'name':
				return sorted.sort((a, b) =>
					(a.clubname || '').localeCompare(b.clubname || '')
				)
			case 'rating':
				return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
			case 'popularity':
				return sorted.sort(
					(a, b) => (b.number_of_ratings || 0) - (a.number_of_ratings || 0)
				)
			default:
				return sorted
		}
	}, [filteredPandals, sortBy])

	const handlePandalPress = useCallback((pandal: Pandals) => {
		setSelectedPandal(pandal)
		setIsBottomSheetVisible(true)
	}, [])

	const handleBottomSheetClose = useCallback(() => {
		setIsBottomSheetVisible(false)
		setSelectedPandal(null)
	}, [])

	const handlePandalNavigate = useCallback((newPandal: Pandals) => {
		setSelectedPandal(newPandal)
	}, [])

	const handleRefresh = useCallback(() => {
		if (supabase) {
			loadPandals(supabase, true)
		}
	}, [loadPandals, supabase])

	const handleSortSelect = useCallback((option: SortOption) => {
		setSortBy(option)
		setShowSortModal(false)
	}, [])

	const clearSearch = useCallback(() => {
		setSearchQuery('')
		searchInputRef.current?.focus()
	}, [])

	const getCurrentSortLabel = useCallback(() => {
		return (
			SORT_OPTIONS.find((option) => option.value === sortBy)?.label || 'Sort'
		)
	}, [sortBy])

	const renderPandalCard = useCallback(
		({ item: pandal }: { item: Pandals }) => {
			const isFavorited = favorites.has(pandal.id)
			const isVisited = visited.has(pandal.id)

			return (
				<TouchableOpacity
					activeOpacity={0.7}
					className="mx-4 mb-2"
					onPress={() => handlePandalPress(pandal)}
				>
					<View
						className="flex-row items-center justify-between rounded-lg bg-white px-3 py-3"
						style={{
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.05,
							shadowRadius: 3,
							elevation: 2,
							borderWidth: 0.5,
							borderColor: '#E5E7EB'
						}}
					>
						<View className="flex-1">
							<View className="mb-1 flex-row items-center">
								<Text
									className="flex-1 font-semibold text-[14px] text-gray-800"
									numberOfLines={1}
								>
									{pandal.clubname}
								</Text>
								<View className="flex-row items-center">
									{isFavorited && (
										<View className="rounded-full bg-red-100 px-2 py-1">
											<Text className="font-bold text-[8px] text-red-700">
												FAVORITE
											</Text>
										</View>
									)}
									{isVisited && (
										<View className="rounded-full bg-green-100 px-2 py-1">
											<Text className="font-bold text-[8px] text-green-700">
												VISITED
											</Text>
										</View>
									)}
									{pandal.rating && pandal.rating > 0 && (
										<View className="ml-2 flex-row items-center">
											<Text className="mr-1 text-[#FFD700] text-[12px]">★</Text>
											<Text className="font-medium text-[12px] text-gray-700">
												{pandal.rating.toFixed(1)}
											</Text>
											{pandal.number_of_ratings &&
												pandal.number_of_ratings > 0 && (
													<Text className="ml-1 text-[9px] text-gray-500">
														({pandal.number_of_ratings})
													</Text>
												)}
										</View>
									)}
								</View>
							</View>
							{pandal.address && (
								<Text
									className="mb-1 text-[11px] text-gray-600"
									numberOfLines={1}
								>
									{pandal.address}
								</Text>
							)}
							{pandal.theme && (
								<Text className="text-[10px] text-gray-500" numberOfLines={1}>
									{pandal.theme}
								</Text>
							)}
							{pandal.artistname && (
								<Text
									className="mt-0.5 text-[10px] text-gray-500"
									numberOfLines={1}
								>
									{pandal.artistname}
								</Text>
							)}
						</View>
						<View className="items-end">
							<Ionicons color="#9CA3AF" name="chevron-forward" size={16} />
						</View>
					</View>
				</TouchableOpacity>
			)
		},
		[favorites, visited, handlePandalPress]
	)

	const keyExtractor = useCallback((item: Pandals) => item.id, [])

	const renderEmpty = useCallback(
		() => (
			<View className="flex-1 items-center justify-center px-8 py-12">
				{searchQuery ? (
					<>
						<Text className="mb-4 text-4xl">🔍</Text>
						<Text className="mb-2 text-center font-bold text-gray-900 text-xl">
							No Results Found
						</Text>
						<Text className="mb-4 text-center text-base text-gray-600">
							No pandals match "{searchQuery}"
						</Text>
						<TouchableOpacity
							className="rounded-lg bg-black px-4 py-2"
							onPress={clearSearch}
						>
							<Text className="font-medium text-white">Clear Search</Text>
						</TouchableOpacity>
					</>
				) : (
					<>
						<Text className="mb-4 text-4xl">🏛️</Text>
						<Text className="mb-2 text-center font-bold text-gray-900 text-xl">
							No Pandals Available
						</Text>
						<Text className="text-center text-base text-gray-600">
							Pull down to refresh and load pandals
						</Text>
					</>
				)}
			</View>
		),
		[searchQuery, clearSearch]
	)

	if (loading && pandals.length === 0) {
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
					Loading pandals...
				</Text>
			</View>
		)
	}

	if (error && pandals.length === 0) {
		return (
			<View
				className="flex-1 items-center justify-center bg-white px-8"
				style={{
					paddingTop: insets.top,
					paddingBottom: insets.bottom
				}}
			>
				<Text className="mb-4 text-4xl">⚠️</Text>
				<Text className="mb-2 text-center font-bold text-gray-900 text-xl">
					Something went wrong
				</Text>
				<Text className="mb-6 text-center text-base text-gray-600">
					{error}
				</Text>
				<TouchableOpacity
					className="rounded-lg bg-black px-6 py-3"
					onPress={handleRefresh}
				>
					<Text className="font-medium text-white">Try Again</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View
			className="flex-1 bg-gray-50"
			style={{
				paddingTop: insets.top,
				paddingBottom: insets.bottom
			}}
		>
			<View className="bg-white px-4 pt-4 pb-2">
				<Text className="font-bold text-3xl text-gray-900">All Pandals</Text>
				<Text className="mt-1 text-base text-gray-600">
					Discover amazing pandals around you
				</Text>
			</View>

			<View className="bg-white px-4 py-4">
				<View className="relative mb-4">
					<View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
						<Ionicons color="#6B7280" name="search" size={20} />
						<TextInput
							autoCapitalize="none"
							autoCorrect={false}
							className="ml-3 flex-1 text-[14px]"
							onChangeText={setSearchQuery}
							placeholder="Search pandals, themes, artists..."
							placeholderTextColor="#9CA3AF"
							ref={searchInputRef}
							returnKeyType="search"
							value={searchQuery}
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity onPress={clearSearch}>
								<Ionicons color="#6B7280" name="close-circle" size={20} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				<View className="flex-row items-center justify-between">
					<Text className="font-medium text-[14px] text-gray-700">
						{searchQuery
							? `${sortedPandals.length} results`
							: `${sortedPandals.length} pandals`}
					</Text>

					<TouchableOpacity
						className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2"
						onPress={() => setShowSortModal(true)}
					>
						<Text className="mr-1 text-[12px] text-gray-700">
							{getCurrentSortLabel()}
						</Text>
						<Ionicons color="#6B7280" name="chevron-down" size={14} />
					</TouchableOpacity>
				</View>
			</View>

			<FlatList
				contentContainerStyle={{
					flexGrow: 1,
					paddingTop: 10,
					paddingBottom: 43
				}}
				data={sortedPandals}
				initialNumToRender={15}
				keyboardShouldPersistTaps="handled"
				keyExtractor={keyExtractor}
				ListEmptyComponent={renderEmpty}
				maxToRenderPerBatch={10}
				refreshControl={
					<RefreshControl
						colors={['#000']}
						onRefresh={handleRefresh}
						refreshing={loading}
						tintColor="#000"
					/>
				}
				removeClippedSubviews={true}
				renderItem={renderPandalCard}
				showsVerticalScrollIndicator={false}
				updateCellsBatchingPeriod={50}
				windowSize={21}
			/>

			{selectedPandal && (
				<PandalDetails
					allPandals={pandals}
					isVisible={isBottomSheetVisible}
					onClose={handleBottomSheetClose}
					onPandalNavigate={handlePandalNavigate}
					pandal={selectedPandal}
					ref={pandalDetailsRef}
				/>
			)}

			<Modal
				animationType="fade"
				onRequestClose={() => setShowSortModal(false)}
				transparent={true}
				visible={showSortModal}
			>
				<View className="flex-1 justify-end bg-black">
					<View className="rounded-t-2xl bg-white">
						<View className="flex-row items-center justify-between border-gray-200 border-b p-4">
							<Text className="font-semibold text-gray-900 text-lg">
								Sort Pandals
							</Text>
							<TouchableOpacity onPress={() => setShowSortModal(false)}>
								<Ionicons color="#6B7280" name="close" size={24} />
							</TouchableOpacity>
						</View>

						<View className="pb-6">
							{SORT_OPTIONS.map((option) => (
								<TouchableOpacity
									className="flex-row items-center justify-between px-4 py-4"
									key={option.value}
									onPress={() => handleSortSelect(option.value)}
								>
									<Text
										className={`text-base ${
											sortBy === option.value
												? 'font-semibold text-black'
												: 'text-gray-700'
										}`}
									>
										{option.label}
									</Text>
									{sortBy === option.value && (
										<Ionicons color="#000" name="checkmark" size={20} />
									)}
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>
			</Modal>
		</View>
	)
}
