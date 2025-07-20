import { useUser } from '@clerk/clerk-expo'
import { useEffect } from 'react'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import useSupabase from '@/lib/supabase'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useVisitedStore } from '@/stores/visitedStore'

export const useStoreInitializer = () => {
	const { user } = useUser()
	const supabase = useSupabase()
	const setSupabase = useSupabaseStore((state) => state.setSupabase)

	const loadFavorites = useFavoritesStore((state) => state.loadFavorites)
	const loadVisited = useVisitedStore((state) => state.loadVisited)

	const clearFavorites = useFavoritesStore((state) => state.clearFavorites)
	const clearVisited = useVisitedStore((state) => state.clearVisited)

	useEffect(() => {
		setSupabase(supabase)
	}, [supabase, setSupabase])

	useEffect(() => {
		if (user?.id && supabase) {
			loadFavorites(user.id, supabase)
			loadVisited(user.id, supabase)
		} else {
			clearFavorites()
			clearVisited()
		}
	}, [
		user?.id,
		supabase,
		loadFavorites,
		loadVisited,
		clearFavorites,
		clearVisited
	])
}
