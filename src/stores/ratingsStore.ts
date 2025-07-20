import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

interface RatingsState {
	userRatings: Record<string, number>
	submittingRatings: string[]
	errors: Record<string, string>
	isLoaded: boolean
}

interface RatingsActions {
	setUserRating: (pandalId: string, rating: number) => void
	getUserRating: (pandalId: string) => number
	submitRating: (
		pandalId: string,
		rating: number,
		userId: string,
		supabase: SupabaseClient,
		updatePandalStore?: (
			pandalId: string,
			newRating: number,
			newCount: number
		) => void
	) => Promise<void>
	loadUserRatings: (userId: string, supabase: SupabaseClient) => Promise<void>
	clearRatings: () => void
	setSubmitting: (pandalId: string, isSubmitting: boolean) => void
	setError: (pandalId: string, error?: string) => void
}

const initialState: RatingsState = {
	userRatings: {},
	submittingRatings: [],
	errors: {},
	isLoaded: false
}

export const useRatingsStore = create<RatingsState & RatingsActions>()(
	persist(
		subscribeWithSelector((set, get) => ({
			...initialState,

			setUserRating: (pandalId, rating) => {
				set((state) => ({
					userRatings: {
						...state.userRatings,
						[pandalId]: rating
					}
				}))
			},

			getUserRating: (pandalId) => {
				const state = get()
				const ratings = state.userRatings || {}
				return ratings[pandalId] || 0
			},

			submitRating: async (
				pandalId,
				rating,
				userId,
				supabase,
				updatePandalStore
			) => {
				const { setSubmitting, setError, setUserRating } = get()

				setSubmitting(pandalId, true)
				setError(pandalId)

				try {
					const { data: existingRating, error: checkError } = await supabase
						.from('user_ratings')
						.select('rating')
						.eq('user_id', userId)
						.eq('pandal_id', pandalId)
						.maybeSingle()

					if (checkError) {
						throw checkError
					}

					const isUpdate = !!existingRating
					const oldRating = existingRating?.rating || 0

					const { data: pandalData, error: pandalError } = await supabase
						.from('pandals')
						.select('rating, number_of_ratings')
						.eq('id', pandalId)
						.single()

					if (pandalError) {
						throw pandalError
					}

					const currentRating = pandalData.rating || 0
					const currentCount = pandalData.number_of_ratings || 0

					let newRating: number
					let newCount: number

					if (isUpdate) {
						const totalPoints = currentRating * currentCount
						const newTotalPoints = totalPoints - oldRating + rating
						newRating =
							currentCount > 0 ? newTotalPoints / currentCount : rating
						newCount = currentCount
					} else {
						const totalPoints = currentRating * currentCount
						const newTotalPoints = totalPoints + rating
						newCount = currentCount + 1
						newRating = newTotalPoints / newCount
					}

					const finalRating = Math.round(newRating * 100) / 100

					const { error: updatePandalError } = await supabase
						.from('pandals')
						.update({
							rating: finalRating,
							number_of_ratings: newCount
						})
						.eq('id', pandalId)

					if (updatePandalError) {
						throw updatePandalError
					}

					const { error: upsertError } = await supabase
						.from('user_ratings')
						.upsert(
							{
								user_id: userId,
								pandal_id: pandalId,
								rating,
								updated_at: new Date().toISOString()
							},
							{
								onConflict: 'user_id,pandal_id'
							}
						)

					if (upsertError) {
						throw upsertError
					}

					setUserRating(pandalId, rating)

					if (updatePandalStore) {
						updatePandalStore(pandalId, finalRating, newCount)
					}
				} catch (submissionError) {
					setError(
						pandalId,
						submissionError instanceof Error
							? submissionError.message
							: 'Failed to submit rating'
					)
				} finally {
					setSubmitting(pandalId, false)
				}
			},

			loadUserRatings: async (userId, supabase) => {
				try {
					const { data, error } = await supabase
						.from('user_ratings')
						.select('pandal_id, rating')
						.eq('user_id', userId)

					if (error) {
						throw error
					}

					const ratingsObject: Record<string, number> = {}

					if (data) {
						for (const ratingData of data) {
							ratingsObject[ratingData.pandal_id] = ratingData.rating
						}
					}

					set({
						userRatings: ratingsObject,
						isLoaded: true
					})
				} catch {
					set({ isLoaded: true })
				}
			},

			clearRatings: () => {
				set(initialState)
			},

			setSubmitting: (pandalId, isSubmitting) => {
				set((state) => {
					const submittingList = state.submittingRatings || []
					if (isSubmitting) {
						return {
							submittingRatings: submittingList.includes(pandalId)
								? submittingList
								: [...submittingList, pandalId]
						}
					}
					return {
						submittingRatings: submittingList.filter((id) => id !== pandalId)
					}
				})
			},

			setError: (pandalId, errorMessage) => {
				set((state) => {
					const newErrors = { ...state.errors }
					if (errorMessage) {
						newErrors[pandalId] = errorMessage
					} else {
						delete newErrors[pandalId]
					}
					return { errors: newErrors }
				})
			}
		})),
		{
			name: 'user-ratings-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				userRatings: state.userRatings || {},
				isLoaded: state.isLoaded
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.userRatings = state.userRatings || {}
					state.submittingRatings = []
					state.errors = {}
				}
			}
		}
	)
)
