import type { SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Pandals } from '@/types/dbTypes'

interface PandalState {
	pandals: Pandals[]
	loading: boolean
	error: string | null
	selectedPandal: Pandals | null
	lastFetch: number | null
	isInitialized: boolean
}

interface PandalActions {
	setPandals: (pandals: Pandals[]) => void
	loadPandals: (
		supabase: SupabaseClient,
		forceRefresh?: boolean
	) => Promise<void>
	setSelectedPandal: (pandal: Pandals | null) => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	updatePandalRating: (
		pandalId: string,
		newRating: number,
		newCount: number
	) => void
	getPandalById: (pandalId: string) => Pandals | null
	refreshPandal: (pandalId: string, supabase: SupabaseClient) => Promise<void>
	clearPandals: () => void
	retryFetch: (supabase: SupabaseClient) => Promise<void>
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

export const usePandalStore = create<PandalState & PandalActions>()(
	subscribeWithSelector((set, get) => ({
		pandals: [],
		loading: false,
		error: null,
		selectedPandal: null,
		lastFetch: null,
		isInitialized: false,

		setPandals: (pandals) =>
			set({
				pandals,
				lastFetch: Date.now(),
				isInitialized: true
			}),

		loadPandals: async (supabase, forceRefresh = false) => {
			const { lastFetch, pandals, loading } = get()

			if (loading) {
				return
			}

			if (!forceRefresh && lastFetch && pandals.length > 0) {
				const cacheAge = Date.now() - lastFetch
				if (cacheAge < CACHE_DURATION) {
					return
				}
			}

			set({ loading: true, error: null })

			try {
				const { data, error } = await supabase.from('pandals').select('*')
				if (error) {
					throw error
				}

				set({
					pandals: data || [],
					loading: false,
					lastFetch: Date.now(),
					isInitialized: true,
					error: null
				})
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to load pandals'
				set({
					error: errorMessage,
					loading: false,
					isInitialized: true
				})
			}
		},

		retryFetch: async (supabase) => {
			const { loadPandals } = get()
			await loadPandals(supabase, true)
		},

		setSelectedPandal: (pandal) => set({ selectedPandal: pandal }),
		setLoading: (loading) => set({ loading }),
		setError: (error) => set({ error }),

		updatePandalRating: (pandalId, newRating, newCount) => {
			set((state) => {
				const updatedPandals = state.pandals.map((pandal) =>
					pandal.id === pandalId
						? { ...pandal, rating: newRating, number_of_ratings: newCount }
						: pandal
				)

				const updatedSelectedPandal =
					state.selectedPandal?.id === pandalId
						? {
								...state.selectedPandal,
								rating: newRating,
								number_of_ratings: newCount
							}
						: state.selectedPandal

				return {
					pandals: updatedPandals,
					selectedPandal: updatedSelectedPandal
				}
			})
		},

		getPandalById: (pandalId) => {
			const { pandals } = get()
			return pandals.find((pandal) => pandal.id === pandalId) || null
		},

		refreshPandal: async (pandalId, supabase) => {
			try {
				const { data, error } = await supabase
					.from('pandals')
					.select('*')
					.eq('id', pandalId)
					.single()

				if (error) {
					throw error
				}

				if (data) {
					set((state) => {
						const updatedPandals = state.pandals.map((pandal) =>
							pandal.id === pandalId ? data : pandal
						)

						const updatedSelectedPandal =
							state.selectedPandal?.id === pandalId
								? data
								: state.selectedPandal

						return {
							pandals: updatedPandals,
							selectedPandal: updatedSelectedPandal
						}
					})
				}
			} catch {
				// console.error('Failed to refresh pandal:', error)
			}
		},

		clearPandals: () =>
			set({
				pandals: [],
				loading: false,
				error: null,
				selectedPandal: null,
				lastFetch: null,
				isInitialized: false
			})
	}))
)
