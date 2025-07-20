import { memo, useCallback } from 'react'
import { type Control, Controller } from 'react-hook-form'
import { Text, TouchableOpacity, View } from 'react-native'

interface OptionData {
	label: string
	value: string
}

interface OptionProps {
	optionLabel: string
	value: string
	onChange: (value: string) => void
	isSelected: boolean
}

interface RadioButtonInputProps {
	control: Control<any>
	placeholder?: string
	required?: boolean
	label: string
	name: string
	options: OptionData[]
}

const Option = memo<OptionProps>(
	({ optionLabel, value, onChange, isSelected }) => {
		const handlePress = useCallback(() => {
			onChange(value)
		}, [onChange, value])

		return (
			<TouchableOpacity
				className={`rounded-lg border px-5 py-2 ${
					isSelected ? 'border-black bg-black' : 'border-gray-400 bg-white'
				}`}
				onPress={handlePress}
			>
				<Text className={`text-sm ${isSelected ? 'text-white' : 'text-black'}`}>
					{optionLabel}
				</Text>
			</TouchableOpacity>
		)
	}
)

Option.displayName = 'Option'

const RadioButtonInput = memo<RadioButtonInputProps>(
	({ control, placeholder, required, label, name, options }) => {
		return (
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value }, fieldState: { error } }) => (
					<View className="w-full gap-1.5">
						<Text className="font-medium text-sm">
							{label}
							{required && <Text className="text-red-600">*</Text>}
						</Text>
						{placeholder && (
							<Text className="text-gray-500 text-sm">{placeholder}</Text>
						)}
						<View className="mt-1.5 flex-row gap-2.5">
							{options.map((option) => (
								<Option
									isSelected={value === option.value}
									key={option.value}
									onChange={onChange}
									optionLabel={option.label}
									value={option.value}
								/>
							))}
						</View>
						{error && <Text className="text-red-500">{error.message}</Text>}
					</View>
				)}
				rules={{ required: required && 'This field is required!' }}
			/>
		)
	}
)

RadioButtonInput.displayName = 'RadioButtonInput'

export default RadioButtonInput
