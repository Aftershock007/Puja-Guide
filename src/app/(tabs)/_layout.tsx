import { useAuth, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { Platform } from 'react-native'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import '../../../global.css'

export default function TabLayout() {
	const colorScheme = useColorScheme()
	const { user } = useUser()
	const { isSignedIn } = useAuth()

	if (!isSignedIn) {
		return <Redirect href="/auth" />
	}
	if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
		return <Redirect href="/auth/complete-your-account" />
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarStyle: Platform.select({
					ios: {
						position: 'absolute',
						height: 75,
						paddingBottom: 5,
						paddingTop: 5
					},
					default: {
						height: 60,
						paddingBottom: 5,
						paddingTop: 5
					}
				})
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => (
						<Ionicons color={color} name="home" size={25} />
					)
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: 'Settings',
					tabBarIcon: ({ color }) => (
						<Ionicons color={color} name="settings-outline" size={25} />
					)
				}}
			/>
		</Tabs>
	)
}
