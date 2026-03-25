import { createFont } from 'tamagui'

export const headingFont = createFont({
	family: 'CormorantGaramond_600SemiBold',
	size: {
		1: 12,
		2: 14,
		3: 17,
		4: 22,
		5: 28,
		6: 32,
		true: 22,
	},
	lineHeight: {
		1: 16,
		2: 18,
		3: 22,
		4: 29,
		5: 34,
		6: 38,
		true: 29,
	},
	weight: {
		4: '600',
		true: '600',
	},
	face: {
		600: {
			normal: 'CormorantGaramond_600SemiBold',
			italic: 'CormorantGaramond_600SemiBold_Italic',
		},
		700: { normal: 'CormorantGaramond_700Bold', italic: 'CormorantGaramond_700Bold_Italic' },
	},
})

export const bodyFont = createFont({
	family: 'SourceSerif4_400Regular',
	size: {
		1: 12,
		2: 14,
		3: 17,
		4: 19,
		5: 22,
		true: 17,
	},
	lineHeight: {
		1: 16,
		2: 20,
		3: 27,
		4: 34,
		5: 29,
		true: 27,
	},
	weight: {
		3: '400',
		4: '400',
		5: '500',
		true: '400',
	},
	face: {
		400: { normal: 'SourceSerif4_400Regular', italic: 'SourceSerif4_400Regular_Italic' },
		500: { normal: 'SourceSerif4_500Medium' },
		600: { normal: 'SourceSerif4_600SemiBold' },
	},
})
