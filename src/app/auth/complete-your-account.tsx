import { useUser } from '@clerk/clerk-expo'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'
import RadioButtonInput from '@/components/Forms/RadioButtonInput'
import TextInput from '@/components/Forms/TextInput'
import Header from '@/components/Header'
import {
	GENDER_OPTIONS,
	GENDER_VALUES,
	isValidGender
} from '@/constants/GenderEnum'
import { completeDetailsPageHeader } from '@/constants/Headings'
import { useSupabaseStore } from '@/hooks/useSupabaseContext'
import { useUserStore } from '@/stores/userStore'

const formSchema = z.object({
	full_name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters'),
	age: z
		.string()
		.min(1, 'Age is required')
		.refine(
			(val) => {
				const num = Number(val)
				return (
					!Number.isNaN(num) && Number.isInteger(num) && num > 0 && num <= 99
				)
			},
			{ message: 'Age must be a whole number between 1 and 99' }
		),
	gender: z.enum(GENDER_VALUES, { required_error: 'Please select a gender' })
})

type FormData = z.infer<typeof formSchema>

export default function CompleteYourAccountScreen() {
	const { user, isLoaded } = useUser()
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const supabase = useSupabaseStore((state) => state.supabase)

	const { createUser, isSubmitting, error } = useUserStore()

	const {
		control,
		handleSubmit,
		setError,
		setValue,
		formState: { isValid }
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: { full_name: '', age: '', gender: undefined }
	})

	const onSubmit = async (data: FormData) => {
		if (!(supabase && user)) {
			return
		}

		const { full_name, age, gender } = data

		try {
			await user.update({
				unsafeMetadata: { full_name, age, gender, onboarding_completed: true }
			})
			await user.reload()

			await createUser(
				{
					id: user.id,
					name: user.fullName || full_name,
					email: user.primaryEmailAddress?.emailAddress || '',
					age: Number(age),
					gender
				},
				supabase
			)

			router.push('/(tabs)')
		} catch {
			setError('root', {
				message:
					'Oops! Something went wrong while setting up your account. Please try again.'
			})
		}
	}

	useEffect(() => {
		if (!(isLoaded && user)) {
			return
		}

		setValue('full_name', user.fullName || '')
		setValue(
			'age',
			user.unsafeMetadata?.age ? String(user.unsafeMetadata.age) : ''
		)
		const userGender = String(user.unsafeMetadata?.gender)
		if (isValidGender(userGender)) {
			setValue('gender', userGender)
		}
	}, [isLoaded, user, setValue])

	useEffect(() => {
		if (error) {
			Alert.alert('Error', error)
		}
	}, [error])

	const isDisabled = isSubmitting || !isValid
	const buttonStyle = isDisabled ? 'bg-gray-400 opacity-50' : 'bg-black'
	const textStyle = isDisabled ? 'text-gray-600' : 'text-white'

	return (
		<View
			className="flex-1 gap-5 bg-white p-5"
			style={{
				paddingTop: insets.top + 20,
				paddingBottom: insets.bottom
			}}
		>
			<Header
				heading={completeDetailsPageHeader.heading}
				subheading={completeDetailsPageHeader.subheading}
			/>
			<View className="mt-5 w-full gap-5">
				<TextInput
					control={control}
					label="Name"
					name="full_name"
					placeholder="Enter your name"
					required
				/>
				<TextInput
					control={control}
					keyboardType="numeric"
					label="Age"
					name="age"
					placeholder="Enter your age"
					required
				/>
				<RadioButtonInput
					control={control}
					label="Gender"
					name="gender"
					options={GENDER_OPTIONS}
					placeholder="Select your gender"
					required
				/>
				<View className="mt-5">
					<TouchableOpacity
						className={`w-full flex-row items-center justify-center gap-2.5 rounded-lg p-2.5 ${buttonStyle}`}
						disabled={isDisabled}
						onPress={handleSubmit(onSubmit)}
					>
						{isSubmitting && <ActivityIndicator color="white" size="small" />}
						<Text className={textStyle}>
							{isSubmitting ? 'Loading...' : 'Complete Account'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}
