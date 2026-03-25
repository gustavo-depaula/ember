import { Text, YStack } from 'tamagui'

export default function SettingsScreen() {
	return (
		<YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
			<Text fontFamily="$heading" fontSize="$5" color="$color">
				Settings
			</Text>
			<Text fontFamily="$body" fontSize="$3" color="$colorSecondary" marginTop="$sm">
				Customize your experience
			</Text>
		</YStack>
	)
}
