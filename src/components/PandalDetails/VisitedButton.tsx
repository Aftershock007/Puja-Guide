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

		const buttonStyle = {
			backgroundColor: isVisited ? '#BEBEBE' : '#000',
			opacity: isDisabled ? 0.6 : 1
		}

		const buttonText = isVisited ? 'NOT VISITED YET' : ' MARK AS VISITED'

		return (
			<TouchableOpacity
				className={`min-w-[100px] flex-row items-center justify-center rounded-lg px-4 py-2 ${className}`}
				disabled={isDisabled}
				onPress={handlePress}
				style={buttonStyle}
			>
				<Text
					style={{
						color: '#FFFFFF',
						fontSize: 12,
						fontWeight: 'bold',
						textAlign: 'center'
					}}
				>
					{buttonText}
				</Text>
			</TouchableOpacity>
		)
	}
)

VisitedButton.displayName = 'VisitedButton'

export default VisitedButton
