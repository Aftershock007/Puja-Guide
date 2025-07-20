import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface UIState {
	currentImageIndex: number
	imageContainerWidth: number
	currentSnapIndex: number
	forceHorizontalLayout: boolean
	isLayoutTransitioning: boolean
	isVisible: boolean
}

interface UIActions {
	setCurrentImageIndex: (index: number) => void
	setImageContainerWidth: (width: number) => void
	setCurrentSnapIndex: (index: number) => void
	setForceHorizontalLayout: (force: boolean) => void
	setIsLayoutTransitioning: (transitioning: boolean) => void
	setIsVisible: (visible: boolean) => void
	resetUI: () => void
	updateState: (updates: Partial<UIState>) => void // Added this function
}

const initialState: UIState = {
	currentImageIndex: 0,
	imageContainerWidth: 0,
	currentSnapIndex: 1,
	forceHorizontalLayout: false,
	isLayoutTransitioning: false,
	isVisible: false
}

export const useUIStore = create<UIState & UIActions>()(
	subscribeWithSelector((set) => ({
		...initialState,

		setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
		setImageContainerWidth: (width) => set({ imageContainerWidth: width }),
		setCurrentSnapIndex: (index) => set({ currentSnapIndex: index }),
		setForceHorizontalLayout: (force) => set({ forceHorizontalLayout: force }),
		setIsLayoutTransitioning: (transitioning) =>
			set({ isLayoutTransitioning: transitioning }),
		setIsVisible: (visible) => set({ isVisible: visible }),
		resetUI: () => set(initialState),

		updateState: (updates) => set((state) => ({ ...state, ...updates }))
	}))
)
