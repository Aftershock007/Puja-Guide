import { useUser } from '@clerk/clerk-expo'
import { useEffect } from 'react'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import useSupabase from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePandalStore } from '@/stores/pandalStore'
import { useRatingsStore } from '@/stores/ratingsStore'
import { useUserStore } from '@/stores/userStore'
import { useVisitedStore } from '@/stores/visitedStore'

export const useStoreInitializer = () => {
	const { user } = useUser()
	const supabase = useSupabase()
	const setSupabase = useSupabaseStore((state) => state.setSupabase)

	const loadFavorites = useFavoritesStore((state) => state.loadFavorites)
	const loadVisited = useVisitedStore((state) => state.loadVisited)
	const loadUserRatings = useRatingsStore((state) => state.loadUserRatings)
	const loadPandals = usePandalStore((state) => state.loadPandals)

	const isRatingsLoaded = useRatingsStore((state) => state.isLoaded)
	const isPandalsInitialized = usePandalStore((state) => state.isInitialized)

	const clearFavorites = useFavoritesStore((state) => state.clearFavorites)
	const clearVisited = useVisitedStore((state) => state.clearVisited)
	const clearRatings = useRatingsStore((state) => state.clearRatings)
	const clearPandals = usePandalStore((state) => state.clearPandals)
	const clearUser = useUserStore((state) => state.clearUser)
	const clearAuthState = useAuthStore((state) => state.clearAuthState)

	useEffect(() => {
		setSupabase(supabase)
	}, [supabase, setSupabase])

	useEffect(() => {
		if (supabase && !isPandalsInitialized) {
			loadPandals(supabase)
		}
	}, [supabase, isPandalsInitialized, loadPandals])

	useEffect(() => {
		if (user?.id && supabase) {
			loadFavorites(user.id, supabase)
			loadVisited(user.id, supabase)

			if (!isRatingsLoaded) {
				loadUserRatings(user.id, supabase)
			}
		} else {
			clearFavorites()
			clearVisited()
			clearRatings()
			clearUser()
			clearAuthState()
		}
	}, [
		user?.id,
		supabase,
		isRatingsLoaded,
		loadFavorites,
		loadVisited,
		loadUserRatings,
		clearFavorites,
		clearVisited,
		clearRatings,
		clearUser,
		clearAuthState
	])

	useEffect(() => {
		if (!supabase) {
			clearFavorites()
			clearVisited()
			clearRatings()
			clearPandals()
			clearUser()
			clearAuthState()
		}
	}, [
		supabase,
		clearFavorites,
		clearVisited,
		clearRatings,
		clearPandals,
		clearUser,
		clearAuthState
	])
}
