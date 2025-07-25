import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useColorScheme } from 'react-native'
import { StoreProvider } from '@/providers/StoreProvider'

preventAutoHideAsync()

const queryClient = new QueryClient()

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		openSans: require('../assets/fonts/OpenSans-Regular.ttf')
	})
	useReactQueryDevTools(queryClient)

	useEffect(() => {
		if (loaded) {
			hideAsync()
		}
	}, [loaded])

	if (!loaded) {
		return null
	}

	const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
	if (!publishableKey) {
		throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file')
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
				<ClerkLoaded>
					<StoreProvider>
						<ThemeProvider
							value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
						>
							<Stack>
								<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
								<Stack.Screen name="auth" options={{ headerShown: false }} />
							</Stack>
							<StatusBar style="auto" />
						</ThemeProvider>
					</StoreProvider>
				</ClerkLoaded>
			</ClerkProvider>
		</QueryClientProvider>
	)
}
