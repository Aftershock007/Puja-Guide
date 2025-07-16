import { Link } from 'expo-router'
import { memo } from 'react'
import { Text, View } from 'react-native'
import type { Pandals } from '@/types/dbTypes'
import ImageCarousel from './ImageCarousel'
import RatingSection from './RatingSection'
import StarRatingPicker from './StarRatingPicker'

interface VerticalLayoutProps {
	pandal: Pandals
	imageWidth: number
	imageHeight: number
	currentImageIndex: number
	onImageIndexChange: (index: number) => void
	onImageContainerLayout: (width: number) => void
}

const VerticalLayout = memo<VerticalLayoutProps>(
	({
		pandal,
		imageWidth,
		imageHeight,
		currentImageIndex,
		onImageIndexChange,
		onImageContainerLayout
	}) => {
		const {
			clubname,
			description = '',
			theme = '',
			artistname = '',
			clubsocialmedialinks = [],
			address = '',
			rating = 0,
			images = []
		} = pandal

		return (
			<View className="overflow-hidden rounded-2xl bg-white">
				<View className="flex-col">
					<View
						className="relative h-60"
						onLayout={(e) => onImageContainerLayout(e.nativeEvent.layout.width)}
					>
						<ImageCarousel
							currentImageIndex={currentImageIndex}
							height={imageHeight}
							images={images || []}
							onImageIndexChange={onImageIndexChange}
							paginationPosition="bottom-center"
							showPagination={(images || []).length > 1}
							width={imageWidth}
						/>
						<View className="absolute right-0 bottom-0 left-0 pb-2 pl-3">
							<Text className="mb-[1.2px] font-bold text-2xl text-white">
								{clubname}
							</Text>
							<RatingSection rating={rating || 0} />
						</View>
					</View>
					<View className="bg-black p-3">
						{theme && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[14px] text-white">
									Theme:
								</Text>
								<Text className="mt-[1.8px] flex-1 text-[12px] text-white">
									{theme}
								</Text>
							</View>
						)}
						{artistname && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[14px] text-white">
									Artist:
								</Text>
								<Text className="mt-[1.6px] flex-1 text-[12px] text-white">
									{artistname}
								</Text>
							</View>
						)}
						{description && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[14px] text-white">
									Description:
								</Text>
								<Text className="mt-[1.8px] flex-1 text-[12px] text-white">
									{description}
								</Text>
							</View>
						)}
						{address && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[14px] text-white">
									Address:
								</Text>
								<Text className="mt-[1.8px] flex-1 text-[12px] text-white">
									{address}
								</Text>
							</View>
						)}
						{clubsocialmedialinks && clubsocialmedialinks.length > 0 && (
							<View className="mb-2 flex flex-row">
								<Text className="mr-1 font-bold text-[14px] text-white">
									Socials:
								</Text>
								<View className="mt-[1.8px] flex-1">
									{clubsocialmedialinks.map((clubsocialmedialink, index) => (
										<Link
											className="text-[12px] text-blue-400"
											href={clubsocialmedialink}
											key={`${clubsocialmedialink}-${index}`}
										>
											{clubsocialmedialink}
										</Link>
									))}
								</View>
							</View>
						)}
						<View className="my-3 h-[1px] bg-white" />
						<View className="mb-2 flex flex-row items-center">
							<Text className="mt-[1px] mr-1 font-bold text-[14px] text-white">
								Rate this pandal:
							</Text>
							<StarRatingPicker starSize={30} />
						</View>
					</View>
				</View>
			</View>
		)
	}
)

VerticalLayout.displayName = 'VerticalLayout'

export default VerticalLayout
