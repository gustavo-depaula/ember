import { styled, YStack } from 'tamagui'

export const Card = styled(YStack, {
	name: 'Card',
	backgroundColor: '$backgroundSurface',
	borderRadius: '$md',
	padding: '$md',
	borderTopWidth: 1,
	borderTopColor: '$accentSubtle',
	shadowColor: '$black',
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.06,
	shadowRadius: 8,
	elevation: 2,

	variants: {
		ornate: {
			true: {
				borderWidth: 1,
				borderColor: '$accentSubtle',
			},
		},
	} as const,
})
