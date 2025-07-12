import { memo, useMemo } from 'react'
import { Text, View } from 'react-native'
import { truncateText } from '@/utils/truncateText'

export type DescriptionState = 'collapsed' | 'expanded' | 'fully-expanded'

interface DescriptionSectionProps {
	description: string
	state: DescriptionState
	onShowMore: () => void
	onShowMoreAgain: () => void
	onShowLess: () => void
	isLayoutTransitioning?: boolean
	textColor?: string
	actionColor?: string
}

const DescriptionSection = memo<DescriptionSectionProps>(
	({
		description,
		state,
		onShowMore,
		onShowMoreAgain,
		onShowLess,
		isLayoutTransitioning = false,
		textColor = 'text-white',
		actionColor = 'text-blue-400'
	}) => {
		const processedDescription = useMemo(() => {
			if (!description) {
				return null
			}

			const getDescriptionText = () => {
				if (state === 'fully-expanded') {
					return description
				}
				if (state === 'expanded') {
					return description.length > 130
						? `${truncateText(description, 130)}...`
						: description
				}
				return description.length > 60
					? `${truncateText(description, 60)}...`
					: description
			}

			const needsActionButton = () => {
				if (state === 'fully-expanded') {
					return true
				}
				if (state === 'expanded') {
					return description.length > 130
				}
				return description.length > 60
			}

			const getActionText = () => {
				if (!needsActionButton()) {
					return ''
				}
				if (state === 'fully-expanded') {
					return ' Show less'
				}
				if (state === 'expanded') {
					return ' Show more'
				}
				return ' Show more'
			}

			const getActionHandler = () => {
				if (state === 'fully-expanded') {
					return onShowLess
				}
				if (state === 'expanded') {
					return onShowMoreAgain
				}
				return onShowMore
			}

			return {
				text: getDescriptionText(),
				actionText: getActionText(),
				actionHandler: getActionHandler()
			}
		}, [description, state, onShowMore, onShowMoreAgain, onShowLess])

		if (!(description && processedDescription)) {
			return null
		}

		return (
			<View className="mb-4">
				<Text className={`text-sm ${textColor} leading-relaxed`}>
					{processedDescription.text}
					{processedDescription.actionText && (
						<Text
							className={`font-medium ${actionColor}`}
							disabled={isLayoutTransitioning}
							onPress={processedDescription.actionHandler}
						>
							{processedDescription.actionText}
						</Text>
					)}
				</Text>
			</View>
		)
	}
)

DescriptionSection.displayName = 'DescriptionSection'

export default DescriptionSection
