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
			Id: string,
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

const fetchExistingRating = async (
	supabase: SupabaseClient,
	userId: string,
	pandalId: string
) => {
	const { data, error } = await supabase
		.from('user_ratings')
		.select('rating')
		.eq('user_id', userId)
		.eq('pandal_id', pandalId)
		.maybeSingle()

	if (error) {
		throw error
	}
	return { isUpdate: !!data, oldRating: data?.rating || 0 }
}

const fetchPandalData = async (supabase: SupabaseClient, pandalId: string) => {
	const { data, error } = await supabase
		.from('pandals')
		.select('rating, number_of_ratings')
		.eq('id', pandalId)
		.single()

	if (error) {
		throw error
	}
	return {
		currentRating: data.rating || 0,
		currentCount: data.number_of_ratings || 0
	}
}

const calculateNewRating = (
	isUpdate: boolean,
	currentRating: number,
	currentCount: number,
	oldRating: number,
	newRating: number
) => {
	const totalPoints = currentRating * currentCount

	if (isUpdate) {
		const newTotalPoints = totalPoints - oldRating + newRating
		return {
			rating: currentCount > 0 ? newTotalPoints / currentCount : newRating,
			count: currentCount
		}
	}
	const newTotalPoints = totalPoints + newRating
	return {
		rating: newTotalPoints / (currentCount + 1),
		count: currentCount + 1
	}
}

const updatePandalRating = async (
	supabase: SupabaseClient,
	pandalId: string,
	rating: number,
	count: number
) => {
	const finalRating = Math.round(rating * 100) / 100
	const { error } = await supabase
		.from('pandals')
		.update({
			rating: finalRating,
			number_of_ratings: count
		})
		.eq('id', pandalId)

	if (error) {
		throw error
	}
	return finalRating
}

const upsertUserRating = async (
	supabase: SupabaseClient,
	userId: string,
	pandalId: string,
	rating: number
) => {
	const { error } = await supabase.from('user_ratings').upsert(
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

	if (error) {
		throw error
	}
}

const buildRatingsObject = (
	data: Array<{ pandal_id: string; rating: number }> | null
) => {
	const ratingsObject: Record<string, number> = {}

	if (data) {
		for (const ratingData of data) {
			ratingsObject[ratingData.pandal_id] = ratingData.rating
		}
	}

	return ratingsObject
}

const updateSubmittingList = (
	submittingList: string[],
	pandalId: string,
	isSubmitting: boolean
) => {
	if (isSubmitting) {
		return submittingList.includes(pandalId)
			? submittingList
			: [...submittingList, pandalId]
	}
	return submittingList.filter((id) => id !== pandalId)
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
					const { isUpdate, oldRating } = await fetchExistingRating(
						supabase,
						userId,
						pandalId
					)
					const { currentRating, currentCount } = await fetchPandalData(
						supabase,
						pandalId
					)

					const { rating: newRating, count: newCount } = calculateNewRating(
						isUpdate,
						currentRating,
						currentCount,
						oldRating,
						rating
					)

					const finalRating = await updatePandalRating(
						supabase,
						pandalId,
						newRating,
						newCount
					)
					await upsertUserRating(supabase, userId, pandalId, rating)

					setUserRating(pandalId, rating)

					if (updatePandalStore) {
						updatePandalStore(pandalId, finalRating, newCount)
					}
				} catch (submissionError) {
					const errorMessage =
						submissionError instanceof Error
							? submissionError.message
							: 'Failed to submit rating'
					setError(pandalId, errorMessage)
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

					const ratingsObject = buildRatingsObject(data)

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
					return {
						submittingRatings: updateSubmittingList(
							submittingList,
							pandalId,
							isSubmitting
						)
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
