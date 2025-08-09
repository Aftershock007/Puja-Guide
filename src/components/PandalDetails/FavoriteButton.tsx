import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'

interface FavoriteButtonProps {
	onFavoriteChange?: (isFavorite: boolean) => void
	isFavorited?: boolean
	size?: number
	className?: string
	isLoading?: boolean
	isDebouncing?: boolean
	error?: string
}

const FavoriteButton = memo<FavoriteButtonProps>(
	({
		onFavoriteChange,
		isFavorited = false,
		size = 40,
		className = '',
		isLoading = false,
		isDebouncing = false,
		error
	}) => {
		const handlePress = () => {
			if (error || isLoading || isDebouncing) {
				return
			}
			const newFavoriteState = !isFavorited
			onFavoriteChange?.(newFavoriteState)
		}

		const isDisabled = isLoading || isDebouncing || !!error

		return (
			<TouchableOpacity
				className={`items-center justify-center rounded-full border border-white/30 bg-white/25 ${isDisabled ? 'opacity-70' : 'opacity-100'} android:elevation-[5] ${className}`}
				disabled={isDisabled}
				onPress={handlePress}
				style={{
					width: size,
					height: size
				}}
			>
				<View>
					{isFavorited ? (
						<MaterialIcons color="#EE4B2B" name="favorite" size={25} />
					) : (
						<MaterialIcons
							color="rgba(255, 255, 255, 0.5)"
							name="favorite"
							size={25}
						/>
					)}
				</View>
			</TouchableOpacity>
		)
	}
)

FavoriteButton.displayName = 'FavoriteButton'

export default FavoriteButton
