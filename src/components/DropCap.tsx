import { Text, XStack } from 'tamagui'

export function DropCap({ text }: { text: string }) {
	if (text.length === 0) return undefined

	const firstLetter = text[0]
	const rest = text.slice(1)

	return (
		<XStack gap="$sm">
			<Text
				fontFamily="$heading"
				fontWeight="700"
				fontSize={48}
				lineHeight={48}
				color="$accent"
				width={40}
				textAlign="center"
			>
				{firstLetter}
			</Text>
			<Text flex={1} fontFamily="$body" fontSize="$4" lineHeight="$4" color="$color">
				{rest}
			</Text>
		</XStack>
	)
}
