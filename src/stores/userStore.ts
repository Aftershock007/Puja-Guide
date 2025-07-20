import type { SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Users } from '@/types/dbTypes'

interface UserState {
	user: Users | null
	loading: boolean
	error: string | null
	isSubmitting: boolean
}

interface UserActions {
	setUser: (user: Users | null) => void
	createUser: (userData: Users, supabase: SupabaseClient) => Promise<void>
	clearUser: () => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
}

export const useUserStore = create<UserState & UserActions>()(
	subscribeWithSelector((set) => ({
		user: null,
		loading: false,
		error: null,
		isSubmitting: false,

		setUser: (user) => set({ user }),

		createUser: async (userData, supabase) => {
			set({ isSubmitting: true, error: null })

			try {
				const { data, error } = await supabase
					.from('users')
					.insert(userData)
					.select()
					.single()

				if (error) {
					throw error
				}

				set({
					user: data,
					isSubmitting: false,
					error: null
				})
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to create user'
				set({
					error: errorMessage,
					isSubmitting: false
				})
				throw error
			}
		},

		clearUser: () =>
			set({
				user: null,
				loading: false,
				error: null,
				isSubmitting: false
			}),

		setLoading: (loading) => set({ loading }),
		setError: (error) => set({ error })
	}))
)
