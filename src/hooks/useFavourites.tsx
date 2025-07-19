import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { Alert } from 'react-native'
import useSupabase from '@/lib/supabase'

const DEBOUNCE_TIME = 5000

interface UseFavoritesProps {
	userId: string
	pandalId: string
	debounceMs?: number
}

export const useFavorites = ({
	userId,
	pandalId,
	debounceMs = DEBOUNCE_TIME
}: UseFavoritesProps) => {
	const queryClient = useQueryClient()
	const supabase = useSupabase()
	const [isDebouncing, setIsDebouncing] = useState<boolean>(false)
	const debounceRef = useRef<number | null>(null)

	const { data: isFavorited = false, isLoading: isCheckingFavorite } = useQuery(
		{
			queryKey: ['favorite', userId, pandalId],
			queryFn: async () => {
				const { data, error } = await supabase
					.from('user_favourites')
					.select('*')
					.eq('user_id', userId)
					.eq('pandal_id', pandalId)
					.single()

				if (error && error.code !== 'PGRST116') {
					throw error
				}

				return !!data
			},
			enabled: !!userId && !!pandalId
		}
	)

	const addFavoriteMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from('user_favourites').insert({
				user_id: userId,
				pandal_id: pandalId
			})
			if (error) {
				throw error
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['favorite', userId, pandalId]
			})
			queryClient.invalidateQueries({
				queryKey: ['favorites', userId]
			})
		},
		onError: () => {
			Alert.alert('Error', 'Failed to add to favorites')
		},
		onSettled: () => {
			setIsDebouncing(false)
		}
	})

	const removeFavoriteMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase
				.from('user_favourites')
				.delete()
				.eq('user_id', userId)
				.eq('pandal_id', pandalId)
			if (error) {
				throw error
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['favorite', userId, pandalId]
			})
			queryClient.invalidateQueries({
				queryKey: ['favorites', userId]
			})
		},
		onError: () => {
			Alert.alert('Error', 'Failed to remove from favorites')
		},
		onSettled: () => {
			setIsDebouncing(false)
		}
	})

	const debouncedToggleFavorite = useCallback(
		(isFavorite: boolean) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}
			setIsDebouncing(true)
			debounceRef.current = setTimeout(() => {
				if (isFavorite) {
					addFavoriteMutation.mutate()
				} else {
					removeFavoriteMutation.mutate()
				}
			}, debounceMs)
		},
		[addFavoriteMutation, removeFavoriteMutation, debounceMs]
	)

	const cleanup = useCallback(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current)
			setIsDebouncing(false)
		}
	}, [])

	return {
		isFavorited,
		isCheckingFavorite,
		isUpdating:
			isDebouncing ||
			addFavoriteMutation.isPending ||
			removeFavoriteMutation.isPending,
		isDebouncing,
		toggleFavorite: debouncedToggleFavorite,
		cleanup,
		addFavorite: () => addFavoriteMutation.mutate(),
		removeFavorite: () => removeFavoriteMutation.mutate(),
		error:
			addFavoriteMutation.error?.message ||
			removeFavoriteMutation.error?.message
	}
}

export const useUserFavorites = (userId: string) => {
	const supabase = useSupabase()

	return useQuery({
		queryKey: ['favorites', userId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('user_favourites')
				.select(`
					pandal_id,
					pandals (*)
				`)
				.eq('user_id', userId)
			if (error) {
				throw error
			}
			return data
		},
		enabled: !!userId
	})
}
