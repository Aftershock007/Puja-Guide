import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'
import StarRating from 'react-native-star-rating-widget'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import { usePandalStore } from '@/stores/pandalStore'
import { useRatingsStore } from '@/stores/ratingsStore'

interface StarRatingPickerProps {
	starSize: number
	pandalId: string
	userId: string
	disabled?: boolean
}

export default function StarRatingPicker({
	starSize,
	pandalId,
	userId,
	disabled = false
}: StarRatingPickerProps) {
	const [localRating, setLocalRating] = useState(0)

	const getUserRating = useRatingsStore((state) => state.getUserRating)
	const setUserRating = useRatingsStore((state) => state.setUserRating)
	const submitRating = useRatingsStore((state) => state.submitRating)
	const submittingRatings = useRatingsStore((state) => state.submittingRatings)
	const errors = useRatingsStore((state) => state.errors)

	const updatePandalRating = usePandalStore((state) => state.updatePandalRating)

	const supabase = useSupabaseStore((state) => state.supabase)

	const isSubmitting = submittingRatings?.includes(pandalId)
	const error = errors?.[pandalId]

	useEffect(() => {
		if (pandalId) {
			try {
				const existingRating = getUserRating(pandalId)
				setLocalRating(existingRating)
			} catch {
				Alert.alert('Error', 'Error getting user rating')
				setLocalRating(0)
			}
		}
	}, [pandalId, getUserRating])

	const handleRatingChange = async (rating: number) => {
		if (disabled || isSubmitting || !supabase || !userId || !pandalId) {
			return
		}

		setLocalRating(rating)
		setUserRating(pandalId, rating)

		try {
			await submitRating(pandalId, rating, userId, supabase, updatePandalRating)
		} catch {
			Alert.alert('Error', 'Failed to submit rating')
		}
	}

	return (
		<View className="items-center">
			<View className="flex-row items-center">
				<StarRating
					animationConfig={{
						scale: 1.2,
						duration: 350,
						delay: 200,
						easing: (t: number) => t * t * (3 - 2 * t)
					}}
					color="#FFD700"
					enableHalfStar={false}
					enableSwiping={false}
					onChange={handleRatingChange}
					rating={localRating}
					starSize={starSize}
					starStyle={{ marginHorizontal: 1 }}
				/>

				{isSubmitting && (
					<ActivityIndicator className="ml-4" color="#FFD700" size="small" />
				)}
			</View>

			{error && (
				<Text className="mt-1 text-center text-[10px] text-red-600">
					{error}
				</Text>
			)}
		</View>
	)
}
