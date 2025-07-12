import { memo } from 'react'
import { View } from 'react-native'

interface PaginationDotProps {
	isActive: boolean
	imageUrl: string
}

const PaginationDot = memo<PaginationDotProps>(({ isActive, imageUrl }) => (
	<View
		className={`mx-1 h-2 w-2 rounded-full ${isActive ? 'bg-white' : 'bg-white/50'}`}
		key={`dot-${imageUrl}`}
	/>
))

PaginationDot.displayName = 'PaginationDot'

export default PaginationDot
