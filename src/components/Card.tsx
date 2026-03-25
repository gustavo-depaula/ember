import { styled, YStack } from 'tamagui'

export const Card = styled(YStack, {
	name: 'Card',
	backgroundColor: '$backgroundSurface',
	borderRadius: '$lg',
	padding: '$md',
	shadowColor: '$black',
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.06,
	shadowRadius: 8,
	elevation: 2,
})
