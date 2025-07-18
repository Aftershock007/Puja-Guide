import { Link } from 'expo-router'
import { memo, useEffect, useMemo } from 'react'
import { Text, View } from 'react-native'
import { useFavorites } from '@/hooks/useFavourites'
import { useVisited } from '@/hooks/useVisited'
import type { Pandals } from '@/types/dbTypes'
import FavoriteButton from './FavoriteButton'
import ImageCarousel from './ImageCarousel'
import NearestPandals from './NearestPandals'
import RatingSection from './RatingSection'
import StarRatingPicker from './StarRatingPicker'
import VisitedButton from './VisitedButton'

interface VerticalLayoutProps {
	pandal: Pandals
	imageWidth: number
	imageHeight: number
	currentImageIndex: number
	onImageIndexChange: (index: number) => void
	onImageContainerLayout: (width: number) => void
	allPandals: Pandals[]
	onNearestPandalPress?: (pandal: Pandals) => void
	userId: string
}

const VerticalLayout = memo<VerticalLayoutProps>(
	({
		pandal,
		imageWidth,
		imageHeight,
		currentImageIndex,
		onImageIndexChange,
		onImageContainerLayout,
		allPandals,
		onNearestPandalPress,
		userId
	}) => {
		const {
			id: pandalId,
			clubname,
			description = '',
			theme = '',
			artistname = '',
			clubsocialmedialinks = [],
			address = '',
			rating = 0,
			images = []
		} = pandal

		const displayImages = useMemo(() => {
			const safeImages = images || []
			return safeImages.length > 3 ? safeImages.slice(0, 3) : safeImages
		}, [images])

		const {
			isFavorited,
			isCheckingFavorite,
			isUpdating: isFavoriteUpdating,
			isDebouncing: isFavoriteDebouncing,
			toggleFavorite,
			error: favoriteError,
			cleanup: favoriteCleanup
		} = useFavorites({
			userId,
			pandalId
		})

		const {
			isVisited,
			isCheckingVisited,
			isUpdating: isVisitedUpdating,
			isDebouncing: isVisitedDebouncing,
			toggleVisited,
			error: visitedError,
			cleanup: visitedCleanup
		} = useVisited({
			userId,
			pandalId
		})

		useEffect(() => {
			return () => {
				favoriteCleanup()
				visitedCleanup()
			}
		}, [favoriteCleanup, visitedCleanup])

		const handleFavoriteChange = (isFavorite: boolean) => {
			if (isCheckingFavorite) {
				return
			}
			toggleFavorite(isFavorite)
		}

		const handleVisitedChange = (visited: boolean) => {
			if (isCheckingVisited) {
				return
			}
			toggleVisited(visited)
		}

		return (
			<View className="overflow-hidden rounded-2xl bg-gray-100">
				<View className="flex-col">
					<View
						className="relative h-[202px]"
						onLayout={(e) => onImageContainerLayout(e.nativeEvent.layout.width)}
					>
						<ImageCarousel
							currentImageIndex={currentImageIndex}
							height={imageHeight}
							images={displayImages}
							onImageIndexChange={onImageIndexChange}
							paginationPosition="bottom-center"
							showPagination={displayImages.length > 1}
							width={imageWidth}
						/>
					</View>
					<FavoriteButton
						className="absolute top-2.5 left-2.5 z-20"
						error={favoriteError}
						isDebouncing={isFavoriteDebouncing}
						isFavorited={isFavorited}
						isLoading={isFavoriteUpdating || isCheckingFavorite}
						onFavoriteChange={handleFavoriteChange}
						size={40}
					/>
					<View
						className="absolute top-[23.7%] right-0 left-0 z-20 flex flex-row justify-center"
						style={{
							alignItems: 'center'
						}}
					>
						<VisitedButton
							error={visitedError}
							isDebouncing={isVisitedDebouncing}
							isLoading={isVisitedUpdating || isCheckingVisited}
							isVisited={isVisited}
							onVisitedChange={handleVisitedChange}
						/>
					</View>
					<View
						className="m-3 mt-[-30px] rounded-xl bg-gray-100 px-4 pt-3 pb-2.5"
						style={{
							shadowColor: '#000',
							shadowOffset: { width: -6, height: -6 },
							shadowOpacity: 0.15,
							shadowRadius: 10,
							elevation: 8,
							borderWidth: 1,
							borderColor: 'rgba(255, 255, 255, 0.8)'
						}}
					>
						<View
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								borderRadius: 12,
								shadowColor: '#000',
								shadowOffset: { width: 6, height: 6 },
								shadowOpacity: 0.1,
								shadowRadius: 8,
								backgroundColor: 'transparent'
							}}
						/>
						<View className="mt-2 mb-2 flex flex-col items-start">
							<Text className="mb-[1.2px] font-bold text-2xl" numberOfLines={1}>
								{clubname}
							</Text>
						</View>
						{rating && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mt-[-1.5px] mr-1 font-bold text-[13px]">
									Rating:
								</Text>
								<RatingSection rating={rating} />
							</View>
						)}
						{theme && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[13px]">Theme:</Text>
								<Text className="mt-[1.8px] flex-1 text-[11.5px]">{theme}</Text>
							</View>
						)}
						{artistname && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[13px]">Artist:</Text>
								<Text className="mt-[1.6px] flex-1 text-[11.5px]">
									{artistname}
								</Text>
							</View>
						)}
						{description && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[13px]">Description:</Text>
								<Text
									className="mt-[1.8px] flex-1 text-[11.5px]"
									numberOfLines={2}
								>
									{description}
								</Text>
							</View>
						)}
						{address && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[13px]">Address:</Text>
								<Text className="mt-[1.8px] flex-1 text-[11.5px]">
									{address}
								</Text>
							</View>
						)}
						{clubsocialmedialinks && clubsocialmedialinks.length > 0 && (
							<View className="mb-1 flex flex-row">
								<Text className="mr-1 font-bold text-[13px]">Socials:</Text>
								<View className="mt-[1.8px] flex-1">
									{clubsocialmedialinks.map((clubsocialmedialink: string) => (
										<Link
											className="text-[11.5px] text-blue-600"
											href={clubsocialmedialink}
											key={clubsocialmedialink}
										>
											{clubsocialmedialink}
										</Link>
									))}
								</View>
							</View>
						)}
						<View
							className="my-2 h-[1.5px]"
							style={{
								backgroundColor: '#e5e7eb',
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: 0.1,
								shadowRadius: 2,
								borderTopWidth: 1,
								borderTopColor: 'rgba(255, 255, 255, 0.8)'
							}}
						/>
						<View className="flex flex-row items-center justify-between">
							<Text className="mt-[1px] mr-1 font-bold text-[13px]">
								Rate this pandal:
							</Text>
							<StarRatingPicker starSize={30} />
						</View>
						{/* <View className="mt-1 mb-0.5 flex flex-row justify-center">
							<VisitedButton
								error={visitedError}
								isDebouncing={isVisitedDebouncing}
								isLoading={isVisitedUpdating || isCheckingVisited}
								isVisited={isVisited}
								onVisitedChange={handleVisitedChange}
							/>
						</View> */}
					</View>
					<NearestPandals
						allPandals={allPandals}
						currentPandal={pandal}
						limit={7}
						onPandalPress={onNearestPandalPress}
					/>
				</View>
			</View>
		)
	}
)

VerticalLayout.displayName = 'VerticalLayout'

export default VerticalLayout
