import { memo, useMemo } from 'react'
import { Text, View } from 'react-native'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import { useFavoritesStore } from '@/stores/favoritesStore'
import type { Pandals } from '@/types/dbTypes'
import FavoriteButton from './FavoriteButton'
import ImageCarousel from './ImageCarousel'
import RatingSection from './RatingSection'
import StarRatingPicker from './StarRatingPicker'

interface HorizontalLayoutProps {
	pandal: Pandals
	imageWidth: number
	imageHeight: number
	currentImageIndex: number
	onImageIndexChange: (index: number) => void
	onImageContainerLayout: (width: number) => void
	userId: string
}

const HorizontalLayout = memo<HorizontalLayoutProps>(
	({ pandal, imageWidth, imageHeight, onImageContainerLayout, userId }) => {
		const {
			id: pandalId,
			clubname = '',
			theme = '',
			artistname = '',
			rating = 0,
			images = []
		} = pandal

		const displayImages = useMemo(() => {
			return images && images.length > 0 ? [images[0]] : []
		}, [images])

		const favorites = useFavoritesStore((state) => state.favorites)
		const loading = useFavoritesStore((state) => state.loading)
		const debouncing = useFavoritesStore((state) => state.debouncing)
		const errors = useFavoritesStore((state) => state.errors)
		const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
		const supabase = useSupabaseStore((state) => state.supabase)

		const isFavorited = favorites.has(pandalId)
		const isLoading = loading.has(pandalId)
		const isDebouncing = debouncing.has(pandalId)
		const error = errors.get(pandalId)

		const handleFavoriteChange = () => {
			if (isLoading || !supabase) {
				return
			}
			toggleFavorite(pandalId, userId, supabase)
		}

		return (
			<View className="relative h-[190px] overflow-hidden rounded-2xl bg-gray-100">
				<View
					className="relative w-[47%]"
					onLayout={(e) => onImageContainerLayout(e.nativeEvent.layout.width)}
				>
					<ImageCarousel
						currentImageIndex={0}
						height={imageHeight}
						images={displayImages}
						showPagination={false}
						width={imageWidth}
					/>
				</View>
				<FavoriteButton
					className="absolute top-2.5 left-2.5 z-20"
					error={error}
					isDebouncing={isDebouncing}
					isFavorited={isFavorited}
					isLoading={isLoading}
					onFavoriteChange={handleFavoriteChange}
					size={40}
				/>
				<View
					className="android:elevation-8 absolute top-2 right-2 bottom-2 z-10 rounded-xl border border-white/80 bg-gray-100 px-3.5 py-1.5 shadow-lg"
					style={{
						left: '42%'
					}}
				>
					<View className="absolute inset-0 rounded-xl bg-transparent shadow-md" />
					<View className="flex-1 justify-center">
						{clubname && (
							<Text className="mb-2 font-bold text-xl" numberOfLines={1}>
								{clubname}
							</Text>
						)}
						{rating && rating > 0 && (
							<View className="mb-2">
								<RatingSection
									pandalId={pandalId}
									rating={rating}
									showCount={true}
								/>
							</View>
						)}
						{theme && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[13px]">Theme:</Text>
								<Text
									className="mt-[1.8px] flex-1 text-[11.5px]"
									numberOfLines={1}
								>
									{theme}
								</Text>
							</View>
						)}
						{artistname && (
							<View className="mb-2 flex flex-row items-start">
								<Text className="mr-1 font-bold text-[13px]">Artist:</Text>
								<Text
									className="mt-[1.6px] flex-1 text-[11.5px]"
									numberOfLines={1}
								>
									{artistname}
								</Text>
							</View>
						)}
						<View className="mx-0.5 my-1 h-[1.5px] border-t border-t-white/80 bg-gray-200 shadow-sm" />
						<View className="mt-1 items-center">
							<Text className="mb-1 font-bold text-[12px]">
								Rate this pandal:
							</Text>
							<StarRatingPicker
								pandalId={pandalId}
								starSize={28}
								userId={userId}
							/>
						</View>
					</View>
				</View>
			</View>
		)
	}
)

HorizontalLayout.displayName = 'HorizontalLayout'

export default HorizontalLayout
