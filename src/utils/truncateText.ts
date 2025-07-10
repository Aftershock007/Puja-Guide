const TRAILING_PUNCTUATION_REGEX = /[.,!?;:]+$/

export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) {
		return text
	}
	let sliced = text.slice(0, maxLength)
	const lastSpaceIndex = sliced.lastIndexOf(' ')
	if (lastSpaceIndex > 0) {
		sliced = sliced.slice(0, lastSpaceIndex)
	}
	return sliced.trim().replace(TRAILING_PUNCTUATION_REGEX, '')
}
