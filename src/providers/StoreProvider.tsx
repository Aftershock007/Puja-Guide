import type { ReactNode } from 'react'
import { useStoreInitializer } from '@/hooks/useStoreInitializer'

interface StoreProviderProps {
	children: ReactNode
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
	useStoreInitializer()
	return <>{children}</>
}
