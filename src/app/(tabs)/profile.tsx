import { SignedIn, useClerk } from '@clerk/clerk-expo'
import { MaterialIcons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProfileScreen() {
	const { signOut, user } = useClerk()
	const fullName = user?.fullName || 'N/A'
	const email = user?.emailAddresses[0]?.emailAddress || 'N/A'
	const insets = useSafeAreaInsets()

	return (
		<View
			className="flex-1 bg-white"
			style={{
				paddingTop: insets.top,
				paddingBottom: insets.bottom
			}}
		>
			<SignedIn>
				<View className="px-4 pt-4 pb-6">
					<Text className="font-bold text-3xl text-black">Profile</Text>
					<Text className="mt-1 text-base text-gray-600">
						Manage your account settings
					</Text>
				</View>
				<View className="px-4">
					<View className="mb-4 rounded-xl border border-white/30 bg-gray-50 p-6 shadow-md">
						<View className="items-center">
							<View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-200">
								<FontAwesome color="black" name="user" size={40} />
							</View>
							<Text className="mb-1 font-bold text-2xl text-black">
								{fullName}
							</Text>
							<Text className="text-gray-500">Welcome back!</Text>
						</View>
					</View>
					<View className="mb-8">
						<View className="rounded-xl border border-white/30 bg-white p-5 shadow-md">
							<View className="flex-row items-center">
								<View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-200 shadow-inner">
									<MaterialIcons color="black" name="email" size={24} />
								</View>
								<View className="flex-1">
									<Text className="mb-1 font-medium text-gray-500 text-sm">
										Email Address
									</Text>
									<Text className="font-semibold text-black text-lg">
										{email}
									</Text>
								</View>
							</View>
						</View>
					</View>
					<TouchableOpacity
						className="mt-8 rounded-xl bg-red-600 py-4"
						onPress={() => signOut()}
					>
						<View className="flex-row items-center justify-center">
							<MaterialIcons color="white" name="logout" size={24} />
							<Text className="ml-1.5 font-semibold text-lg text-white">
								Logout
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</SignedIn>
		</View>
	)
}
