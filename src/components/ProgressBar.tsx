import { Text, XStack, YStack } from 'tamagui'

export function ProgressBar({ value, label }: { value: number; label?: string }) {
	const clamped = Math.min(1, Math.max(0, value))

	return (
		<YStack gap="$xs">
			{label && (
				<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
					{label}
				</Text>
			)}
			<XStack height={8} backgroundColor="$borderColor" borderRadius="$sm" overflow="hidden">
				<XStack height={8} backgroundColor="$accent" borderRadius="$sm" flex={clamped} />
				{clamped < 1 && <XStack flex={1 - clamped} />}
			</XStack>
		</YStack>
	)
}
