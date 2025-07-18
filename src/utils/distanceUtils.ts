import type { Pandals } from '@/types/dbTypes'

export const calculateDistance = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number => {
	const R = 6371
	const dLat = (lat2 - lat1) * (Math.PI / 180)
	const dLon = (lon2 - lon1) * (Math.PI / 180)
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distance = R * c
	return Math.round(distance * 100) / 100
}

export const formatDistance = (distance: number): string => {
	if (distance < 1) {
		const meters = Math.round(distance * 1000)
		return `${meters}m`
	}
	if (distance < 10) {
		return `${distance.toFixed(1)}km`
	}
	return `${Math.round(distance)}km`
}

export const findNearestPandals = (
	currentPandal: Pandals,
	allPandals: Pandals[],
	limit = 10
): Array<Pandals & { distance: number }> => {
	if (!(currentPandal.latitude && currentPandal.longitude)) {
		return []
	}

	const pandalWithDistances = allPandals
		.filter(
			(pandal) =>
				pandal.id !== currentPandal.id && pandal.latitude && pandal.longitude
		)
		.map((pandal) => ({
			...pandal,
			distance: calculateDistance(
				currentPandal.latitude,
				currentPandal.longitude,
				pandal.latitude,
				pandal.longitude
			)
		}))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, limit)
	return pandalWithDistances
}
