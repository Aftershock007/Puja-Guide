import { memo } from 'react'
import { Text, View } from 'react-native'
import { usePandalStore } from '@/stores/pandalStore'
import StarRating from './StarRating'

interface RatingSectionProps {
	rating?: number
	pandalId?: string
	showCount?: boolean
}

const RatingSection = memo<RatingSectionProps>(
	({ rating: initialRating, pandalId, showCount = false }) => {
		const pandal = usePandalStore((state) =>
			pandalId ? state.pandals.find((p) => p.id === pandalId) : null
		)

		const rating = pandal?.rating ?? initialRating
		const ratingCount = pandal?.number_of_ratings

		if (!rating || rating <= 0) {
			return null
		}

		return (
			<View className="flex-row items-center gap-2">
				<StarRating rating={rating} />
				<Text className="font-semibold text-[11px] text-black">
					{rating.toFixed(1)}
				</Text>
				{showCount && ratingCount && ratingCount > 0 && (
					<Text className="text-[10px] text-gray-600">
						({ratingCount} rating{ratingCount !== 1 ? 's' : ''})
					</Text>
				)}
			</View>
		)
	}
)

RatingSection.displayName = 'RatingSection'

export default RatingSection
