import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
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
import PandalCard from '@/components/PandalCard/PandalCard'
import {
	type PandalWithDistance,
	useLocationDistanceTracker
} from '@/hooks/useLocationDistanceTracker'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePandalStore } from '@/stores/pandalStore'
import { useVisitedStore } from '@/stores/visitedStore'
import type { Pandals } from '@/types/dbTypes'

type SortOption = 'name' | 'rating' | 'popularity' | 'distance'

interface SortConfig {
	label: string
	value:
		| SortOption
		| 'remove-visited'
		| 'show-visited-only'
		| 'show-favorites-only'
		| 'remove-favorites'
	isFilter?: boolean
}

const SORT_OPTIONS: SortConfig[] = [
	{ label: 'Sort by Name (A-Z)', value: 'name' },
	{ label: 'Sort by Rating', value: 'rating' },
	{ label: 'Most Popular', value: 'popularity' },
	{ label: 'Sort by Distance', value: 'distance' },
	{
		label: 'Show Only Visited Pandals',
		value: 'show-visited-only',
		isFilter: true
	},
	{ label: 'Remove Visited Pandals', value: 'remove-visited', isFilter: true },
	{
		label: 'Show Favourite Pandals Only',
		value: 'show-favorites-only',
		isFilter: true
	},
	{
		label: 'Remove Favourite Pandals',
		value: 'remove-favorites',
		isFilter: true
	}
]

export default function AllPandalsScreen() {
	const insets = useSafeAreaInsets()
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState<SortOption>('name')
	const [showSortModal, setShowSortModal] = useState(false)
	const [loading, setLoading] = useState(false)
	const [hideVisited, setHideVisited] = useState(false)
	const [showVisitedOnly, setShowVisitedOnly] = useState(false)
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
	const [hideFavorites, setHideFavorites] = useState(false)
	const searchInputRef = useRef<TextInput>(null)

	const pandals = usePandalStore((state) => state.pandals)
	const error = usePandalStore((state) => state.error)
	const loadPandals = usePandalStore((state) => state.loadPandals)
	const setSelectedPandal = usePandalStore((state) => state.setSelectedPandal)
	const favorites = useFavoritesStore((state) => state.favorites)
	const visited = useVisitedStore((state) => state.visited)
	const supabase = useSupabaseStore((state) => state.supabase)

	const {
		pandalsWithDistance,
		userLocation,
		locationPermission,
		isLoadingLocation,
		locationError,
		refreshLocation
	} = useLocationDistanceTracker(pandals, 120_000) // Update every 2 minutes

	const filteredPandals = useMemo(() => {
		let filtered = pandalsWithDistance

		if (hideVisited) {
			filtered = filtered.filter((pandal) => !visited.has(pandal.id))
		}
		if (showVisitedOnly) {
			filtered = filtered.filter((pandal) => visited.has(pandal.id))
		}

		if (hideFavorites) {
			filtered = filtered.filter((pandal) => !favorites.has(pandal.id))
		}
		if (showFavoritesOnly) {
			filtered = filtered.filter((pandal) => favorites.has(pandal.id))
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim()
			filtered = filtered.filter(
				(pandal) =>
					pandal.clubname?.toLowerCase().includes(query) ||
					pandal.address?.toLowerCase().includes(query) ||
					pandal.theme?.toLowerCase().includes(query) ||
					pandal.artistname?.toLowerCase().includes(query)
			)
		}

		return filtered
	}, [
		pandalsWithDistance,
		searchQuery,
		hideVisited,
		showVisitedOnly,
		hideFavorites,
		showFavoritesOnly,
		visited,
		favorites
	])

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
			case 'distance':
				return sorted.sort((a, b) => a.distance - b.distance)
			default:
				return sorted
		}
	}, [filteredPandals, sortBy])

	const handlePandalPress = useCallback(
		(pandal: Pandals) => {
			setSelectedPandal(pandal)
			router.push('/')
		},
		[setSelectedPandal]
	)

	const handleRefresh = useCallback(async () => {
		setLoading(true)
		try {
			if (supabase) {
				await loadPandals(supabase, true)
			}
			refreshLocation()
		} finally {
			setLoading(false)
		}
	}, [loadPandals, supabase, refreshLocation])

	const handleSortSelect = useCallback(
		(
			option:
				| SortOption
				| 'remove-visited'
				| 'show-visited-only'
				| 'show-favorites-only'
				| 'remove-favorites'
		) => {
			switch (option) {
				case 'remove-visited':
					if (hideVisited) {
						setHideVisited(false)
					} else {
						setHideVisited(true)
						setShowVisitedOnly(false)
					}
					break
				case 'show-visited-only':
					if (showVisitedOnly) {
						setShowVisitedOnly(false)
					} else {
						setShowVisitedOnly(true)
						setHideVisited(false)
					}
					break
				case 'show-favorites-only':
					if (showFavoritesOnly) {
						setShowFavoritesOnly(false)
					} else {
						setShowFavoritesOnly(true)
						setHideFavorites(false)
					}
					break
				case 'remove-favorites':
					if (hideFavorites) {
						setHideFavorites(false)
					} else {
						setHideFavorites(true)
						setShowFavoritesOnly(false)
					}
					break
				default:
					setSortBy(option)
					break
			}
		},
		[hideVisited, showVisitedOnly, showFavoritesOnly, hideFavorites]
	)

	const clearSearch = useCallback(() => {
		setSearchQuery('')
		searchInputRef.current?.focus()
	}, [])

	const getFilterState = useCallback(
		(filterValue: string) => {
			switch (filterValue) {
				case 'remove-visited':
					return hideVisited
				case 'show-visited-only':
					return showVisitedOnly
				case 'show-favorites-only':
					return showFavoritesOnly
				case 'remove-favorites':
					return hideFavorites
				default:
					return false
			}
		},
		[hideVisited, showVisitedOnly, showFavoritesOnly, hideFavorites]
	)

	const getCurrentSortLabel = useCallback(() => {
		const sortLabel =
			SORT_OPTIONS.find((option) => option.value === sortBy)?.label || 'Sort'
		const filters: string[] = []

		if (hideVisited) {
			filters.push('Hide Visited')
		}
		if (showVisitedOnly) {
			filters.push('Visited Only')
		}
		if (hideFavorites) {
			filters.push('Hide Favorites')
		}
		if (showFavoritesOnly) {
			filters.push('Favorites Only')
		}

		const filterLabel = filters.length > 0 ? ` (${filters.join(', ')})` : ''
		return sortLabel + filterLabel
	}, [sortBy, hideVisited, showVisitedOnly, hideFavorites, showFavoritesOnly])

	const renderPandalCard = useCallback(
		({ item: pandal }: { item: PandalWithDistance }) => {
			const isFavorited = favorites.has(pandal.id)
			const isVisited = visited.has(pandal.id)

			return (
				<PandalCard
					className="mx-4 mb-2"
					isFavorited={isFavorited}
					isVisited={isVisited}
					onPress={handlePandalPress}
					pandal={pandal}
					userLocation={userLocation}
				/>
			)
		},
		[favorites, visited, handlePandalPress, userLocation]
	)

	const keyExtractor = useCallback((item: PandalWithDistance) => item.id, [])

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
				<ActivityIndicator color="#000" size="small" />
				<Text className="mt-4 font-medium text-black text-lg">
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
			className="flex-1 bg-white"
			style={{
				paddingTop: insets.top,
				paddingBottom: insets.bottom
			}}
		>
			<View className="bg-white px-4 pt-4 pb-2">
				<Text className="font-bold text-3xl text-gray-900">All Pandals</Text>
				<View className="mt-1 flex-row items-center justify-between">
					<Text className="text-base text-gray-600">
						Discover amazing pandals around you
					</Text>
					{!(locationPermission || isLoadingLocation) && (
						<TouchableOpacity onPress={refreshLocation}>
							<Text className="text-blue-600 text-xs">Enable Location</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
			<View className="bg-white px-4 py-1">
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
						className="ml-2 max-w-[60%] flex-row items-center rounded-lg bg-gray-100 px-2.5 py-1.5"
						onPress={() => setShowSortModal(true)}
					>
						<Text
							className="mr-1 flex-shrink text-[12px] text-gray-700"
							numberOfLines={1}
						>
							{getCurrentSortLabel()}
						</Text>
						<Ionicons color="#6B7280" name="chevron-down" size={14} />
					</TouchableOpacity>
				</View>
			</View>
			<FlatList
				alwaysBounceVertical={true}
				bounces={true}
				contentContainerStyle={{
					flexGrow: 1,
					paddingTop: 10,
					paddingBottom: 43
				}}
				data={sortedPandals}
				directionalLockEnabled={true}
				horizontal={false}
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
				scrollEnabled={true}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
				updateCellsBatchingPeriod={50}
				windowSize={21}
			/>
			{locationError && (
				<View className="absolute right-4 bottom-20 left-4 rounded-lg border border-red-400 bg-red-100 p-3">
					<View className="flex-row items-center">
						<Ionicons color="#DC2626" name="warning" size={16} />
						<Text className="ml-2 flex-1 text-red-700 text-sm">
							{locationError}
						</Text>
						<TouchableOpacity onPress={refreshLocation}>
							<Text className="font-medium text-red-600 text-sm">Retry</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			<Modal
				animationType="fade"
				onRequestClose={() => setShowSortModal(false)}
				transparent={true}
				visible={showSortModal}
			>
				<View className="flex-1 justify-end bg-black/50">
					<TouchableOpacity
						activeOpacity={1}
						className="flex-1"
						onPress={() => setShowSortModal(false)}
					/>
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
									className="flex-row items-center justify-between p-4"
									key={option.value}
									onPress={() => handleSortSelect(option.value)}
								>
									<View className="flex-row items-center">
										<Text
											className={`text-base ${
												(option.isFilter && getFilterState(option.value)) ||
												(!option.isFilter && sortBy === option.value)
													? 'font-semibold text-black'
													: 'text-gray-700'
											}`}
										>
											{option.label}
										</Text>
										{option.value === 'distance' && !userLocation && (
											<Text className="ml-2 text-gray-400 text-xs">
												(Requires location)
											</Text>
										)}
									</View>
									{(option.isFilter
										? getFilterState(option.value)
										: sortBy === option.value) && (
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
