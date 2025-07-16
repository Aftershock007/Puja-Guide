import { useState } from 'react'
import StarRating from 'react-native-star-rating-widget'

export default function StarRatingPicker({ starSize }: { starSize: number }) {
	const [rating, setRating] = useState(0)

	return (
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
			onChange={setRating}
			rating={rating}
			starSize={starSize}
			starStyle={{ marginHorizontal: 0 }}
		/>
	)
}
