import { Text, YStack } from 'tamagui'

export default function HomeScreen() {
	return (
		<YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
			<Text fontFamily="$heading" fontSize="$5" color="$color">
				Ember
			</Text>
			<Text fontFamily="$body" fontSize="$3" color="$colorSecondary" marginTop="$sm">
				A place for prayer
			</Text>
		</YStack>
	)
}
