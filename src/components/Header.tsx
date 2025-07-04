import { Text, View } from 'react-native'

interface HeaderProps {
	heading: string
	subheading: string
}

export default function Header({ heading, subheading }: HeaderProps) {
	return (
		<View className="w-full gap-1.5">
			<Text className="w-full gap-1.5 font-bold text-3xl">{heading}</Text>
			<Text className="text-gray-500 text-sm">{subheading}</Text>
		</View>
	)
}
