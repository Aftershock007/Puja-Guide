import useSupabase from '@/lib/supabase'
import { usePandalStore } from '@/stores/pandalStore'

export const usePandals = () => {
	const supabase = useSupabase()
	const store = usePandalStore()

	const refreshData = () => {
		if (supabase) {
			store.loadPandals(supabase, true)
		}
	}

	const refreshPandal = (pandalId: string) => {
		if (supabase) {
			store.refreshPandal(pandalId, supabase)
		}
	}

	return {
		...store,
		refreshData,
		refreshPandal,
		isLoading: store.loading,
		hasError: !!store.error,
		isEmpty: store.pandals.length === 0 && !store.loading
	}
}
