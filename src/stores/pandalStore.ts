import type { SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Pandals } from '@/types/dbTypes'

interface PandalState {
	pandals: Pandals[]
	loading: boolean
	error: string | null
	selectedPandal: Pandals | null
	initialized: boolean
}

interface PandalActions {
	setPandals: (pandals: Pandals[]) => void
	loadPandals: (supabase: SupabaseClient) => Promise<void>
	setSelectedPandal: (pandal: Pandals | null) => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	clearPandals: () => void
}

export const usePandalStore = create<PandalState & PandalActions>()(
	subscribeWithSelector((set, get) => ({
		pandals: [],
		loading: false,
		error: null,
		selectedPandal: null,
		initialized: false,

		setPandals: (pandals) => set({ pandals, initialized: true }),

		loadPandals: async (supabase) => {
			set({ loading: true, error: null })
			try {
				const { data, error } = await supabase.from('pandals').select('*')
				if (error) {
					throw error
				}
				set({ pandals: data || [], loading: false, initialized: true })
			} catch (error) {
				set({
					error: error instanceof Error ? error.message : 'Unknown error',
					loading: false,
					initialized: true
				})
			}
		},

		setSelectedPandal: (pandal) => set({ selectedPandal: pandal }),
		setLoading: (loading) => set({ loading }),
		setError: (error) => set({ error }),
		clearPandals: () =>
			set({
				pandals: [],
				selectedPandal: null,
				error: null,
				loading: false,
				initialized: false
			})
	}))
)
