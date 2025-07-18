import { memo } from 'react'
import { Text, View } from 'react-native'
import StarRating from './StarRating'

interface RatingSectionProps {
	rating?: number
}

const RatingSection = memo<RatingSectionProps>(({ rating }) => {
	if (!rating) {
		return null
	}

	return (
		<View className="flex-row items-center gap-2">
			<StarRating rating={rating} />
			<Text className="font-semibold text-[11px] text-black">
				{rating.toFixed(1)}
			</Text>
		</View>
	)
})

RatingSection.displayName = 'RatingSection'

export default RatingSection
