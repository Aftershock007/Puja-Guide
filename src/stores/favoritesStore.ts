import type { SupabaseClient } from '@supabase/supabase-js'
import { Alert } from 'react-native'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface FavoritesState {
	favorites: Set<string>
	loading: Set<string>
	debouncing: Set<string>
	errors: Map<string, string>
	initialized: boolean
}

interface FavoritesActions {
	setFavorite: (pandalId: string, isFavorite: boolean) => void
	toggleFavorite: (
		pandalId: string,
		userId: string,
		supabase: SupabaseClient
	) => Promise<void>
	loadFavorites: (userId: string, supabase: SupabaseClient) => Promise<void>
	clearFavorites: () => void
	setLoading: (pandalId: string, isLoading: boolean) => void
	setDebouncing: (pandalId: string, isDebouncing: boolean) => void
	setError: (pandalId: string, error?: string) => void
	cleanup: (pandalId: string) => void
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
	subscribeWithSelector((set, get) => ({
		favorites: new Set(),
		loading: new Set(),
		debouncing: new Set(),
		errors: new Map(),
		initialized: false,

		setFavorite: (pandalId, isFavorite) =>
			set((state) => {
				const newFavorites = new Set(state.favorites)
				if (isFavorite) {
					newFavorites.add(pandalId)
				} else {
					newFavorites.delete(pandalId)
				}
				return { favorites: newFavorites }
			}),

		toggleFavorite: async (pandalId, userId, supabase) => {
			const { favorites, setFavorite, setDebouncing, setError } = get()
			const isFavorite = favorites.has(pandalId)
			const newState = !isFavorite

			// Optimistic update
			setFavorite(pandalId, newState)
			setDebouncing(pandalId, true)

			try {
				if (newState) {
					const { error } = await supabase.from('user_favourites').insert({
						user_id: userId,
						pandal_id: pandalId
					})
					if (error) {
						throw error
					}
				} else {
					const { error } = await supabase
						.from('user_favourites')
						.delete()
						.eq('user_id', userId)
						.eq('pandal_id', pandalId)
					if (error) {
						throw error
					}
				}
				setError(pandalId)
			} catch (error) {
				// Revert optimistic update
				setFavorite(pandalId, isFavorite)
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error'
				setError(pandalId, errorMessage)
				Alert.alert(
					'Error',
					`Failed to ${newState ? 'add to' : 'remove from'} favorites`
				)
			} finally {
				setDebouncing(pandalId, false)
			}
		},

		loadFavorites: async (userId, supabase) => {
			try {
				const { data, error } = await supabase
					.from('user_favourites')
					.select('pandal_id')
					.eq('user_id', userId)

				if (error) {
					throw error
				}

				const favoriteIds = new Set(data?.map((item) => item.pandal_id) || [])
				set({ favorites: favoriteIds, initialized: true })
			} catch {
				Alert.alert('Error', 'Failed to load favorites')
				set({ initialized: true })
			}
		},

		clearFavorites: () =>
			set({
				favorites: new Set(),
				loading: new Set(),
				debouncing: new Set(),
				errors: new Map(),
				initialized: false
			}),

		setLoading: (pandalId, isLoading) =>
			set((state) => {
				const newLoading = new Set(state.loading)
				if (isLoading) {
					newLoading.add(pandalId)
				} else {
					newLoading.delete(pandalId)
				}
				return { loading: newLoading }
			}),

		setDebouncing: (pandalId, isDebouncing) =>
			set((state) => {
				const newDebouncing = new Set(state.debouncing)
				if (isDebouncing) {
					newDebouncing.add(pandalId)
				} else {
					newDebouncing.delete(pandalId)
				}
				return { debouncing: newDebouncing }
			}),

		setError: (pandalId, error) =>
			set((state) => {
				const newErrors = new Map(state.errors)
				if (error) {
					newErrors.set(pandalId, error)
				} else {
					newErrors.delete(pandalId)
				}
				return { errors: newErrors }
			}),

		cleanup: (pandalId) =>
			set((state) => {
				const newLoading = new Set(state.loading)
				const newDebouncing = new Set(state.debouncing)
				const newErrors = new Map(state.errors)

				newLoading.delete(pandalId)
				newDebouncing.delete(pandalId)
				newErrors.delete(pandalId)

				return {
					loading: newLoading,
					debouncing: newDebouncing,
					errors: newErrors
				}
			})
	}))
)
