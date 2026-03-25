import { Check } from 'lucide-react-native'
import { AnimatePresence, MotiView } from 'moti'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { getPracticeIcon } from '@/db/seed'

export function PracticeChecklist({
	practices,
	completedIds,
	onToggle,
	onRowPress,
}: {
	practices: Array<{ id: string; name: string; icon: string }>
	completedIds: Set<string>
	onToggle: (practiceId: string, completed: boolean) => void
	onRowPress?: (practiceId: string) => void
}) {
	const theme = useTheme()

	return (
		<YStack gap="$sm">
			{practices.map((practice, index) => {
				const done = completedIds.has(practice.id)
				return (
					<MotiView
						key={practice.id}
						from={{ opacity: 0, translateX: -12 }}
						animate={{ opacity: 1, translateX: 0 }}
						transition={{ type: 'timing', duration: 250, delay: index * 60 }}
					>
						<Pressable onPress={onRowPress ? () => onRowPress(practice.id) : undefined}>
							<XStack
								backgroundColor="$backgroundSurface"
								borderRadius="$lg"
								padding="$md"
								alignItems="center"
								gap="$md"
							>
								<Text fontSize={20}>{getPracticeIcon(practice.icon)}</Text>
								<Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
									{practice.name}
								</Text>
								<Pressable
									onPress={(e) => {
										e.stopPropagation()
										onToggle(practice.id, !done)
									}}
									hitSlop={8}
								>
									<YStack
										width={28}
										height={28}
										borderRadius={14}
										borderWidth={2}
										borderColor={done ? '$accent' : '$borderColor'}
										backgroundColor={done ? '$accent' : 'transparent'}
										alignItems="center"
										justifyContent="center"
									>
										<AnimatePresence>
											{done && (
												<MotiView
													key="check"
													from={{ opacity: 0, scale: 0 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0 }}
													transition={{ type: 'spring', damping: 15, stiffness: 200 }}
												>
													<Check size={16} color={theme.background.val} />
												</MotiView>
											)}
										</AnimatePresence>
									</YStack>
								</Pressable>
							</XStack>
						</Pressable>
					</MotiView>
				)
			})}
		</YStack>
	)
}
