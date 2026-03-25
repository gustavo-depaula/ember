import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'

export default function PlanScreen() {
	return (
		<ScreenLayout scroll={false}>
			<YStack flex={1} alignItems="center" justifyContent="center">
				<Text fontFamily="$heading" fontSize="$5" color="$color">
					Plan of Life
				</Text>
				<Text fontFamily="$body" fontSize="$3" color="$colorSecondary" marginTop="$sm">
					Track your daily practices
				</Text>
			</YStack>
		</ScreenLayout>
	)
}
