import { Text, View, XStack } from 'tamagui'

export function SectionDivider({ symbol = '\u2726' }: { symbol?: string }) {
	return (
		<XStack alignItems="center" gap="$md" paddingVertical="$lg">
			<View flex={1} borderBottomWidth={1} borderColor="$borderColor" />
			<Text fontFamily="$heading" fontSize="$3" color="$accent">
				{symbol}
			</Text>
			<View flex={1} borderBottomWidth={1} borderColor="$borderColor" />
		</XStack>
	)
}
