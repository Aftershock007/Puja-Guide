import { SignedIn, useClerk } from '@clerk/clerk-expo'
import { Button, Text, View } from 'react-native'

const SettingsScreen = () => {
	const { signOut, user } = useClerk()
	const fullName = user?.fullName || 'N/A'
	const age = (user?.unsafeMetadata?.age as string) || 'N/A'

	return (
		<View className="flex-1 items-center justify-center bg-white">
			<SignedIn>
				<Text>Email: {user?.emailAddresses[0]?.emailAddress}</Text>
				<Text>Name: {fullName}</Text>
				<Text>Age: {age}</Text>
				<Button onPress={() => signOut()} title="Logout" />
			</SignedIn>
		</View>
	)
}

export default SettingsScreen
