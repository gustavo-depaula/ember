import { MotiView } from 'moti'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { ManuscriptFrame, WatercolorIcon } from '@/components'

type IconName = 'sunrise' | 'book' | 'rosary' | 'moon' | 'quill' | 'cross'

export function NavigationMedallion({
	icon,
	title,
	subtitle,
	onPress,
}: {
	icon: IconName
	title: string
	subtitle: string
	onPress: () => void
}) {
	return (
		<Pressable onPress={onPress}>
			{({ pressed }) => (
				<MotiView
					animate={{ scale: pressed ? 0.97 : 1 }}
					transition={{ type: 'timing', duration: 100 }}
				>
					<ManuscriptFrame ornate={false}>
						<XStack gap="$md" alignItems="center">
							<WatercolorIcon name={icon} size={40} />
							<YStack gap={2} flex={1}>
								<Text fontFamily="$heading" fontSize="$3" color="$color">
									{title}
								</Text>
								<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
									{subtitle}
								</Text>
							</YStack>
						</XStack>
					</ManuscriptFrame>
				</MotiView>
			)}
		</Pressable>
	)
}
