import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'

export default function HomeScreen() {
	return (
		<ScreenLayout scroll={false}>
			<YStack flex={1} alignItems="center" justifyContent="center">
				<Text fontFamily="$heading" fontSize="$5" color="$color">
					Ember
				</Text>
				<Text fontFamily="$body" fontSize="$3" color="$colorSecondary" marginTop="$sm">
					A place for prayer
				</Text>
			</YStack>
		</ScreenLayout>
	)
}
