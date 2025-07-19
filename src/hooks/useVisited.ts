import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { Alert } from 'react-native'
import useSupabase from '@/lib/supabase'

const DEBOUNCE_TIME = 1000

interface UseVisitedProps {
	userId: string
	pandalId: string
	debounceMs?: number
}

export const useVisited = ({
	userId,
	pandalId,
	debounceMs = DEBOUNCE_TIME
}: UseVisitedProps) => {
	const queryClient = useQueryClient()
	const supabase = useSupabase()
	const [isDebouncing, setIsDebouncing] = useState<boolean>(false)
	const debounceRef = useRef<number | null>(null)

	const { data: isVisited = false, isLoading: isCheckingVisited } = useQuery({
		queryKey: ['visited', userId, pandalId],
		queryFn: async () => {
			if (!(userId && pandalId)) {
				return false
			}
			const { data, error } = await supabase
				.from('user_visited')
				.select('id')
				.eq('user_id', userId)
				.eq('pandal_id', pandalId)
				.maybeSingle()
			if (error) {
				throw error
			}
			return !!data
		},
		enabled: !!userId && !!pandalId,
		refetchOnWindowFocus: false
	})

	const addVisitedMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from('user_visited').upsert(
				{
					user_id: userId,
					pandal_id: pandalId
				},
				{
					onConflict: 'user_id,pandal_id',
					ignoreDuplicates: true
				}
			)
			if (error) {
				throw error
			}
		},
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: ['visited', userId, pandalId]
			})
			const previousValue = queryClient.getQueryData([
				'visited',
				userId,
				pandalId
			])
			queryClient.setQueryData(['visited', userId, pandalId], true)
			return { previousValue }
		},
		onError: () => {
			Alert.alert('Error', 'Failed to mark as visited')
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['visited-list', userId]
			})
		},
		onSettled: () => {
			setIsDebouncing(false)
			queryClient.invalidateQueries({ queryKey: ['visited', userId, pandalId] })
		}
	})

	const removeVisitedMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase
				.from('user_visited')
				.delete()
				.eq('user_id', userId)
				.eq('pandal_id', pandalId)

			if (error) {
				throw error
			}
		},
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: ['visited', userId, pandalId]
			})
			const previousValue = queryClient.getQueryData([
				'visited',
				userId,
				pandalId
			])
			queryClient.setQueryData(['visited', userId, pandalId], false)
			return { previousValue }
		},
		onError: () => {
			Alert.alert('Error', 'Failed to remove visited status')
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['visited-list', userId]
			})
		},
		onSettled: () => {
			setIsDebouncing(false)
			queryClient.invalidateQueries({ queryKey: ['visited', userId, pandalId] })
		}
	})

	const debouncedToggleVisited = useCallback(
		(visited: boolean) => {
			if (debounceRef.current !== null) {
				clearTimeout(debounceRef.current)
			}

			setIsDebouncing(true)

			debounceRef.current = setTimeout(() => {
				if (visited) {
					addVisitedMutation.mutate()
				} else {
					removeVisitedMutation.mutate()
				}
			}, debounceMs) as unknown as number
		},
		[addVisitedMutation, removeVisitedMutation, debounceMs]
	)

	const cleanup = useCallback(() => {
		if (debounceRef.current !== null) {
			clearTimeout(debounceRef.current)
			debounceRef.current = null
			setIsDebouncing(false)
		}
	}, [])

	return {
		isVisited,
		isCheckingVisited,
		isUpdating:
			isDebouncing ||
			addVisitedMutation.isPending ||
			removeVisitedMutation.isPending,
		isDebouncing,
		toggleVisited: debouncedToggleVisited,
		cleanup,
		addVisited: () => addVisitedMutation.mutate(),
		removeVisited: () => removeVisitedMutation.mutate(),
		error:
			addVisitedMutation.error?.message || removeVisitedMutation.error?.message
	}
}

export const useUserVisited = (userId: string) => {
	const supabase = useSupabase()

	return useQuery({
		queryKey: ['visited-list', userId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('user_visited')
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
		enabled: !!userId,
		staleTime: 1000 * 60 * 2
	})
}
