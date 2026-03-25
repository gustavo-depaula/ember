import { Text, YStack } from 'tamagui'

export default function PlanScreen() {
	return (
		<YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
			<Text fontFamily="$heading" fontSize="$5" color="$color">
				Plan of Life
			</Text>
			<Text fontFamily="$body" fontSize="$3" color="$colorSecondary" marginTop="$sm">
				Track your daily practices
			</Text>
		</YStack>
	)
}
