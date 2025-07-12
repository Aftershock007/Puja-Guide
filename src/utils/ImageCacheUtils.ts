import { Image } from 'react-native'

export const imageCache = new Map<
	string,
	{
		loaded: boolean
		error: boolean
		timestamp: number
		prefetched: boolean
	}
>()

const CACHE_TTL = 30 * 60 * 1000

export const cleanupCache = () => {
	const now = Date.now()
	for (const [key, value] of imageCache.entries()) {
		if (now - value.timestamp > CACHE_TTL) {
			imageCache.delete(key)
		}
	}
}

export const preloadImage = (uri: string): Promise<void> => {
	return new Promise((resolve) => {
		const cached = imageCache.get(uri)
		if (cached?.prefetched) {
			resolve()
			return
		}

		Image.prefetch(uri)
			.then(() => {
				imageCache.set(uri, {
					loaded: true,
					error: false,
					timestamp: Date.now(),
					prefetched: true
				})
				resolve()
			})
			.catch(() => {
				imageCache.set(uri, {
					loaded: false,
					error: true,
					timestamp: Date.now(),
					prefetched: true
				})
				resolve()
			})
	})
}

export const preloadImages = async (urls: string[]): Promise<void> => {
	const priorityUrls = urls.slice(0, 3)
	const backgroundUrls = urls.slice(3)

	await Promise.allSettled(priorityUrls.map(preloadImage))

	if (backgroundUrls.length > 0) {
		setTimeout(() => {
			Promise.allSettled(backgroundUrls.map(preloadImage))
		}, 100)
	}
}
