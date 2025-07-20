import { memo, useState } from 'react'
import { ActivityIndicator, Image, View } from 'react-native'
import { imageCache } from '../../utils/ImageCacheUtils'

interface OptimizedImageProps {
	uri: string
	width: number
	height: number
	onLoadStart?: () => void
	onLoadEnd?: () => void
}

const OptimizedImage = memo<OptimizedImageProps>(
	({ uri, width, height, onLoadStart, onLoadEnd }) => {
		const [isLoading, setIsLoading] = useState(() => {
			const cached = imageCache.get(uri)
			return !cached?.loaded
		})

		const handleLoadStart = () => {
			setIsLoading(false)
			onLoadStart?.()
		}

		const handleLoad = () => {
			imageCache.set(uri, {
				loaded: true,
				error: false,
				timestamp: Date.now(),
				prefetched: true
			})
			setIsLoading(false)
			onLoadEnd?.()
		}

		const handleError = () => {
			imageCache.set(uri, {
				loaded: false,
				error: true,
				timestamp: Date.now(),
				prefetched: true
			})
			setIsLoading(false)
			onLoadEnd?.()
		}

		return (
			<View className="relative" style={{ width, height }}>
				<Image
					fadeDuration={150}
					onError={handleError}
					onLoad={handleLoad}
					onLoadStart={handleLoadStart}
					resizeMode="cover"
					source={{ uri, cache: 'force-cache' }}
					style={{ width, height }}
				/>
				{isLoading && (
					<View className="absolute inset-0 items-center justify-center">
						<ActivityIndicator color="black" size="small" />
					</View>
				)}
			</View>
		)
	}
)

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage
