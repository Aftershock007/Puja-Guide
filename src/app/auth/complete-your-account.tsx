import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import RadioButtonInput from '@/components/Forms/RadioButtonInput'
import TextInput from '@/components/Forms/TextInput'

interface FormData {
	full_name: string
	age: number
	gender: string
}

interface ValidationRules {
	validate?: {
		[key: string]: (value: string | number) => boolean | string
	}
}

const CompleteYourAccountScreen = () => {
	const { user, isLoaded } = useUser()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const { control, handleSubmit, setError, setValue } = useForm<FormData>({
		defaultValues: {
			full_name: '',
			age: 0,
			gender: ''
		}
	})

	const onSubmit = async (data: FormData): Promise<void> => {
		const { full_name, age, gender } = data
		try {
			setIsLoading(true)
			await user?.update({
				unsafeMetadata: {
					full_name,
					age,
					gender,
					onboarding_completed: true
				}
			})
			await user?.reload()
			return router.push('/(tabs)')
		} catch (_error: unknown) {
			return setError('root', {
				message:
					'Oops! Something went wrong while setting up your account. Please try again.'
			})
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (!(isLoaded && user)) {
			return
		}
		setValue('full_name', user?.fullName || '')
		setValue('age', Number(user?.unsafeMetadata?.age) || 0)
		setValue('gender', String(user?.unsafeMetadata?.gender) || '')
	}, [isLoaded, user, setValue])

	const ageValidationRules: ValidationRules = {
		validate: {
			isNumeric: (value: string | number): boolean | string => {
				const numValue = Number(value)
				if (Number.isNaN(numValue)) {
					return 'Age must be a number'
				}
				return true
			},
			isPositive: (value: string | number): boolean | string => {
				const numValue = Number(value)
				if (numValue <= 0) {
					return 'Age must be greater than 0'
				}
				return true
			},
			isRealistic: (value: string | number): boolean | string => {
				const numValue = Number(value)
				if (numValue >= 100) {
					return 'Age must be less than 100'
				}
				return true
			}
		}
	}

	return (
		<View
			className="flex-1 gap-5 bg-white p-5"
			style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom }}
		>
			<View className="w-full gap-1.5">
				<Text className="font-bold text-3xl">Complete your account</Text>
				<Text className="text-gray-500 text-sm">
					Enter your details to complete your account setup. This helps us
					provide a personalized experience and better recommendations.
				</Text>
			</View>
			<View className="mt-5 w-full gap-5">
				<TextInput
					control={control}
					label="Full Name"
					name="full_name"
					placeholder="Enter your full name"
					required
				/>
				<TextInput
					control={control}
					keyboardType="numeric"
					label="Age"
					name="age"
					placeholder="Enter your age"
					required
					rules={ageValidationRules}
				/>
				<RadioButtonInput
					control={control}
					label="Gender"
					name="gender"
					options={[
						{ label: 'Male', value: 'male' },
						{ label: 'Female', value: 'female' },
						{ label: 'Other', value: 'other' }
					]}
					placeholder="Select your gender"
					required
				/>
				<View className="mt-5">
					<TouchableOpacity
						className={`w-full flex-row items-center justify-center gap-2.5 rounded-lg bg-black p-2.5 ${
							isLoading ? 'opacity-70' : 'opacity-100'
						}`}
						disabled={isLoading}
						onPress={handleSubmit(onSubmit)}
					>
						{isLoading ? (
							<ActivityIndicator color="white" size="small" />
						) : null}
						<Text className="text-white">
							{isLoading ? 'Loading...' : 'Complete Account'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export default CompleteYourAccountScreen
