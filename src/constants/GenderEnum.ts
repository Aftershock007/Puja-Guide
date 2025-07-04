export type Gender = 'male' | 'female' | 'other'

export const GENDER_VALUES = ['male', 'female', 'other'] as const

export const GENDER_OPTIONS = [
	{ label: 'Male', value: 'male' },
	{ label: 'Female', value: 'female' },
	{ label: 'Other', value: 'other' }
] as const satisfies Array<{ label: string; value: Gender }>

export const isValidGender = (value: string): value is Gender => {
	return GENDER_VALUES.includes(value as Gender)
}
