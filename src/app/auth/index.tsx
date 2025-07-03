import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SocialLoginButton from '@/components/SocialLoginButton'

const AuthScreen = () => {
	const insets = useSafeAreaInsets()

	return (
		<View
			className="flex-1 gap-5 bg-white p-5"
			style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom }}
		>
			<View className="w-full gap-1.5">
				<Text className="w-full gap-1.5 font-bold text-3xl">
					Welcome to Puja Guide
				</Text>
				<Text className="text-gray-500 text-sm">
					Please sign in to continue. You can use your Google or Facebook
					account to log in.
				</Text>
			</View>
			<View className="mt-5 w-full gap-5">
				<SocialLoginButton strategy="google" />
				<SocialLoginButton strategy="facebook" />
			</View>
		</View>
	)
}

export default AuthScreen
