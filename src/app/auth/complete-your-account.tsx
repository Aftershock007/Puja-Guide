import { useUser } from '@clerk/clerk-expo'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
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
import useSupabase from '@/lib/supabase'
import type { Users } from '@/types/types'

const formSchema = z.object({
	full_name: z
		.string()
		.min(1, 'Name is required')
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters'),
	age: z
		.string()
		.min(1, 'Age is required')
		.refine((val) => !Number.isNaN(Number(val)), {
			message: 'Age must be a valid number'
		})
		.refine((val) => Number(val) > 0, {
			message: 'Age must be greater than 0'
		})
		.refine((val) => Number(val) <= 99, {
			message: 'Age must be less than 100'
		})
		.refine((val) => Number.isInteger(Number(val)), {
			message: 'Age must be a whole number'
		}),
	gender: z.enum(GENDER_VALUES, {
		required_error: 'Please select a gender'
	})
})

type FormData = z.infer<typeof formSchema>

export default function CompleteYourAccountScreen() {
	const { user, isLoaded } = useUser()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const supabase = useSupabase()

	const { control, handleSubmit, setError, setValue, formState } =
		useForm<FormData>({
			resolver: zodResolver(formSchema),
			mode: 'onChange',
			defaultValues: {
				full_name: '',
				age: '',
				gender: undefined
			}
		})

	const { mutate, isPending } = useMutation({
		mutationFn: async (userData: Users) => {
			const { data, error } = await supabase
				.from('users')
				.insert(userData)
				.select()
			if (error) {
				throw error
			}
			return data
		}
	})

	const { isValid } = formState

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
			mutate({
				id: user?.id || '',
				name: user?.fullName || '',
				email: user?.primaryEmailAddress?.emailAddress || '',
				age: Number(age),
				gender
			})
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

		const userAge = user?.unsafeMetadata?.age
		setValue(
			'age',
			userAge !== undefined && userAge !== null ? String(userAge) : ''
		)

		const userGender = String(user?.unsafeMetadata?.gender)
		if (isValidGender(userGender)) {
			setValue('gender', userGender)
		}
	}, [isLoaded, user, setValue])

	return (
		<View
			className="flex-1 gap-5 bg-white p-5"
			style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom }}
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
						className={`w-full flex-row items-center justify-center gap-2.5 rounded-lg p-2.5 ${
							isLoading || !isValid
								? 'bg-gray-400 opacity-50'
								: 'bg-black opacity-100'
						}`}
						disabled={isLoading || !isValid}
						onPress={handleSubmit(onSubmit)}
					>
						{isLoading ? (
							<ActivityIndicator color="white" size="small" />
						) : null}
						<Text
							className={`${
								isLoading || !isValid ? 'text-gray-600' : 'text-white'
							}`}
						>
							{isLoading || isPending ? 'Loading...' : 'Complete Account'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}
