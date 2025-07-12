import type { JSX } from 'react'
import { Image, View } from 'react-native'
import starEmpty from '../../assets/images/star-empty.png'
import starFull from '../../assets/images/star-full.png'
import starHalf from '../../assets/images/star-half.png'

export default function StarRating({ rating }: { rating: number }) {
	const stars: JSX.Element[] = []
	const fullStars = Math.floor(rating)
	const hasHalfStar = rating % 1 >= 0.5
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

	for (let i = 0; i < fullStars; i++) {
		stars.push(
			<Image
				className="mx-0.5 h-3 w-3"
				key={`full-${i}`}
				resizeMode="contain"
				source={starFull}
			/>
		)
	}
	if (hasHalfStar) {
		stars.push(
			<Image
				className="mx-0.5 h-3 w-3"
				key="half"
				resizeMode="contain"
				source={starHalf}
			/>
		)
	}
	for (let i = 0; i < emptyStars; i++) {
		stars.push(
			<Image
				className="mx-0.5 h-3 w-3"
				key={`empty-${i}`}
				resizeMode="contain"
				source={starEmpty}
			/>
		)
	}
	return <View className="flex-row items-center">{stars}</View>
}
