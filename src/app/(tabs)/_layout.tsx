import '../../../global.css'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Redirect, Tabs } from 'expo-router'
import { Platform } from 'react-native'

export default function TabLayout() {
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
				tabBarActiveTintColor: 'black',
				headerShown: false,
				tabBarStyle: Platform.select({
					ios: {
						position: 'absolute',
						height: 75,
						paddingBottom: 5,
						paddingTop: 5,
						backgroundColor: 'white'
					},
					default: {
						height: 60,
						paddingBottom: 5,
						paddingTop: 5,
						backgroundColor: 'white'
					}
				})
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Map',
					tabBarIcon: ({ color, focused }) => (
						<AntDesign
							color={color}
							name={focused ? 'enviroment' : 'enviromento'}
							size={25}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="allPandals"
				options={{
					title: 'All Pandals',
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							color={color}
							name={focused ? 'book' : 'book-outline'}
							size={25}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="favorites"
				options={{
					title: 'Favorites',
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons
							color={color}
							name={focused ? 'favorite' : 'favorite-border'}
							size={25}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, focused }) => (
						<FontAwesome
							color={color}
							name={focused ? 'user' : 'user-o'}
							size={24}
						/>
					)
				}}
			/>
		</Tabs>
	)
}
