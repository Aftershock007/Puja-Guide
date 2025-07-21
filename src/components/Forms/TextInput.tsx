import { memo } from 'react'
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
	type RegisterOptions
} from 'react-hook-form'
import { TextInput as RNTextInput, Text, View } from 'react-native'

interface TextInputProps<T extends FieldValues = FieldValues> {
	control: Control<T>
	placeholder: string
	required?: boolean
	label: string
	name: FieldPath<T>
	keyboardType?: 'default' | 'numeric'
	rules?: RegisterOptions<T>
}

function TextInputComponent<T extends FieldValues = FieldValues>({
	control,
	placeholder,
	required,
	label,
	name,
	keyboardType = 'default',
	rules
}: TextInputProps<T>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({
				field: { onChange, onBlur, value },
				fieldState: { error }
			}) => (
				<View className="w-full gap-1.5">
					<Text className="font-medium text-sm">
						{label}
						{required && <Text className="text-red-500">*</Text>}
					</Text>
					<RNTextInput
						autoCapitalize="none"
						autoComplete="off"
						className={`w-full rounded-lg border p-2.5 ${
							error ? 'border-red-500' : 'border-gray-400'
						}`}
						keyboardType={keyboardType}
						onBlur={onBlur}
						onChangeText={onChange}
						placeholder={placeholder}
						placeholderTextColor="#D3D3D3"
						value={value?.toString() || ''}
					/>
					{error && <Text className="text-red-500">{error.message}</Text>}
				</View>
			)}
			rules={{
				required: required && 'This field is required!',
				...rules
			}}
		/>
	)
}

const TextInput = memo(TextInputComponent)
TextInput.displayName = 'TextInput'

export default TextInput
