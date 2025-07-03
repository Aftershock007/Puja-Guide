import { useSSO, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { makeRedirectUri } from 'expo-auth-session'
import {
	coolDownAsync,
	maybeCompleteAuthSession,
	warmUpAsync
} from 'expo-web-browser'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

export const useWarmUpBrowser = () => {
	useEffect(() => {
		warmUpAsync()
		return () => {
			coolDownAsync()
		}
	}, [])
}

maybeCompleteAuthSession()

interface SocialLoginButtonProps {
	strategy: 'facebook' | 'google'
	onError?: (error: string) => void
}

const SocialLoginButton = ({ strategy, onError }: SocialLoginButtonProps) => {
	const { startSSOFlow } = useSSO()
	const { user } = useUser()
	const [isLoading, setIsLoading] = useState(false)

	const buttonText = () => {
		if (isLoading) {
			return 'Loading...'
		}
		if (strategy === 'facebook') {
			return 'Continue with Facebook'
		}
		if (strategy === 'google') {
			return 'Continue with Google'
		}
		return 'Continue'
	}

	const buttonIcon = () => {
		if (strategy === 'facebook') {
			return <Ionicons color="#000000" name="logo-facebook" size={24} />
		}
		if (strategy === 'google') {
			return <Ionicons color="#000000" name="logo-google" size={24} />
		}
		return null
	}

	const onSocialLoginPress = useCallback(async () => {
		const getStrategy = () => {
			if (strategy === 'facebook') {
				return 'oauth_facebook'
			}
			if (strategy === 'google') {
				return 'oauth_google'
			}
			return 'oauth_google'
		}
		try {
			setIsLoading(true)
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: getStrategy(),
				redirectUrl: makeRedirectUri()
			})
			if (createdSessionId && setActive) {
				setActive({ session: createdSessionId })
				await user?.reload()
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Authentication failed. Please try again.'
			onError?.(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}, [strategy, startSSOFlow, user, onError])

	return (
		<TouchableOpacity
			className="w-full flex-row items-center justify-between gap-2.5 rounded-lg border border-gray-400 p-2.5"
			disabled={isLoading}
			onPress={onSocialLoginPress}
		>
			{isLoading ? (
				<ActivityIndicator color="black" size="small" />
			) : (
				buttonIcon()
			)}
			<Text className="font-medium text-base">{buttonText()}</Text>
			<View />
		</TouchableOpacity>
	)
}

export default SocialLoginButton
