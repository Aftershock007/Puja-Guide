import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import SocialLoginButton from '@/components/SocialLoginButton'
import { authPageHeader } from '@/constants/Headings'

export default function AuthScreen() {
	const insets = useSafeAreaInsets()

	return (
		<View
			className="flex-1 gap-5 bg-white px-5"
			style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom }}
		>
			<Header
				heading={authPageHeader.heading}
				subheading={authPageHeader.subheading}
			/>
			<View className="mt-5 w-full gap-5">
				<SocialLoginButton strategy="google" />
				<SocialLoginButton strategy="facebook" />
			</View>
		</View>
	)
}
