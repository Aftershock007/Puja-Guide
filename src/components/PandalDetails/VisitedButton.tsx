import { memo } from 'react'
import { Text, TouchableOpacity } from 'react-native'

interface VisitedButtonProps {
	onVisitedChange?: (isVisited: boolean) => void
	isVisited?: boolean
	isLoading?: boolean
	isDebouncing?: boolean
	error?: string
	className?: string
}

const VisitedButton = memo<VisitedButtonProps>(
	({
		onVisitedChange,
		isVisited = false,
		isLoading = false,
		isDebouncing = false,
		error,
		className = ''
	}) => {
		const handlePress = () => {
			if (error || isLoading || isDebouncing) {
				return
			}

			const newVisitedState = !isVisited
			onVisitedChange?.(newVisitedState)
		}

		const isDisabled = isLoading || isDebouncing || !!error

		const buttonClasses = `min-w-[100px] flex-row items-center justify-center rounded-xl px-2.5 py-1.5 ${
			isVisited ? 'bg-gray-500' : 'bg-black'
		} ${isDisabled ? 'opacity-60' : 'opacity-100'} ${className}`

		const buttonText = isVisited ? 'NOT VISITED YET' : ' MARK AS VISITED'

		return (
			<TouchableOpacity
				className={buttonClasses}
				disabled={isDisabled}
				onPress={handlePress}
			>
				<Text className="text-center font-bold text-white text-xs">
					{buttonText}
				</Text>
			</TouchableOpacity>
		)
	}
)

VisitedButton.displayName = 'VisitedButton'

export default VisitedButton
