import { memo } from 'react'
import { Text, View } from 'react-native'
import StarRating from './StarRating'

interface RatingSectionProps {
	rating?: number
	textColor?: string
}

const RatingSection = memo<RatingSectionProps>(
	({ rating, textColor = 'text-white' }) => {
		if (!rating) {
			return null
		}

		return (
			<View className="flex-row items-center gap-2">
				<StarRating rating={rating} />
				<Text className={`font-semibold text-sm ${textColor}`}>
					{rating.toFixed(1)}
				</Text>
			</View>
		)
	}
)

RatingSection.displayName = 'RatingSection'

export default RatingSection
