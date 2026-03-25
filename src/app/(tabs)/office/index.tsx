import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'

export default function OfficeScreen() {
	return (
		<ScreenLayout scroll={false}>
			<YStack flex={1} alignItems="center" justifyContent="center">
				<Text fontFamily="$heading" fontSize="$5" color="$color">
					Divine Office
				</Text>
				<Text fontFamily="$body" fontSize="$3" color="$colorSecondary" marginTop="$sm">
					Morning · Evening · Compline
				</Text>
			</YStack>
		</ScreenLayout>
	)
}
