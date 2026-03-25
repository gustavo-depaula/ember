import { Text, YStack } from 'tamagui'

export default function OfficeScreen() {
	return (
		<YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
			<Text fontFamily="$heading" fontSize="$5" color="$color">
				Divine Office
			</Text>
			<Text fontFamily="$body" fontSize="$3" color="$colorSecondary" marginTop="$sm">
				Morning · Evening · Compline
			</Text>
		</YStack>
	)
}
