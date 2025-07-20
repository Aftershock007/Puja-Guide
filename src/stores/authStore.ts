import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface AuthState {
	socialLoginLoading: Record<string, boolean>
	authErrors: Record<string, string>
	isAuthenticating: boolean
}

interface AuthActions {
	setSocialLoginLoading: (strategy: string, loading: boolean) => void
	setAuthError: (strategy: string, error?: string) => void
	setAuthenticating: (authenticating: boolean) => void
	clearAuthState: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
	subscribeWithSelector((set) => ({
		socialLoginLoading: {},
		authErrors: {},
		isAuthenticating: false,

		setSocialLoginLoading: (strategy, loading) =>
			set((state) => ({
				socialLoginLoading: {
					...state.socialLoginLoading,
					[strategy]: loading
				}
			})),

		setAuthError: (strategy, error) =>
			set((state) => {
				const newErrors = { ...state.authErrors }
				if (error) {
					newErrors[strategy] = error
				} else {
					delete newErrors[strategy]
				}
				return { authErrors: newErrors }
			}),

		setAuthenticating: (authenticating) =>
			set({ isAuthenticating: authenticating }),

		clearAuthState: () =>
			set({
				socialLoginLoading: {},
				authErrors: {},
				isAuthenticating: false
			})
	}))
)
