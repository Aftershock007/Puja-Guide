import type { SupabaseClient } from '@supabase/supabase-js'
import { Alert } from 'react-native'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface VisitedState {
	visited: Set<string>
	loading: Set<string>
	debouncing: Set<string>
	errors: Map<string, string>
	initialized: boolean
}

interface VisitedActions {
	setVisited: (pandalId: string, isVisited: boolean) => void
	toggleVisited: (
		pandalId: string,
		userId: string,
		supabase: SupabaseClient
	) => Promise<void>
	loadVisited: (userId: string, supabase: SupabaseClient) => Promise<void>
	clearVisited: () => void
	setLoading: (pandalId: string, isLoading: boolean) => void
	setDebouncing: (pandalId: string, isDebouncing: boolean) => void
	setError: (pandalId: string, error?: string) => void
	cleanup: (pandalId: string) => void
}

export const useVisitedStore = create<VisitedState & VisitedActions>()(
	subscribeWithSelector((set, get) => ({
		visited: new Set(),
		loading: new Set(),
		debouncing: new Set(),
		errors: new Map(),
		initialized: false,

		setVisited: (pandalId, isVisited) =>
			set((state) => {
				const newVisited = new Set(state.visited)
				if (isVisited) {
					newVisited.add(pandalId)
				} else {
					newVisited.delete(pandalId)
				}
				return { visited: newVisited }
			}),

		toggleVisited: async (pandalId, userId, supabase) => {
			const { visited, setVisited, setDebouncing, setError } = get()
			const isVisited = visited.has(pandalId)
			const newState = !isVisited

			setVisited(pandalId, newState)
			setDebouncing(pandalId, true)

			try {
				if (newState) {
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
				} else {
					const { error } = await supabase
						.from('user_visited')
						.delete()
						.eq('user_id', userId)
						.eq('pandal_id', pandalId)
					if (error) {
						throw error
					}
				}
				setError(pandalId)
			} catch (error) {
				setVisited(pandalId, isVisited)
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error'
				setError(pandalId, errorMessage)
				Alert.alert(
					'Error',
					`Failed to ${newState ? 'mark as visited' : 'remove visited status'}`
				)
			} finally {
				setDebouncing(pandalId, false)
			}
		},

		loadVisited: async (userId, supabase) => {
			try {
				const { data, error } = await supabase
					.from('user_visited')
					.select('pandal_id')
					.eq('user_id', userId)

				if (error) {
					throw error
				}

				const visitedIds = new Set(data?.map((item) => item.pandal_id) || [])
				set({ visited: visitedIds, initialized: true })
			} catch {
				Alert.alert('Error', 'Failed to load visited')
				set({ initialized: true })
			}
		},

		clearVisited: () =>
			set({
				visited: new Set(),
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
