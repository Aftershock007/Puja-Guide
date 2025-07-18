import { memo } from 'react'
import { ActivityIndicator, View } from 'react-native'

const LoadingOverlay = memo(() => (
	<View className="absolute inset-0 items-center justify-center">
		<ActivityIndicator color="black" size="small" />
	</View>
))

LoadingOverlay.displayName = 'LoadingOverlay'

export default LoadingOverlay
