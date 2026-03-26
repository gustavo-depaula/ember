import { Check } from 'lucide-react-native'
import { AnimatePresence, MotiView } from 'moti'
import { Pressable } from 'react-native'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { getPracticeIcon } from '@/db/seed'
import type { BlockState } from '@/features/plan-of-life/timeBlocks'

type Practice = { id: string; name: string; icon: string }

export function TimeBlockSection({
	label,
	practices,
	completedIds,
	state,
	completed,
	total,
	onToggle,
	onToggleCollapse,
}: {
	label: string
	practices: Practice[]
	completedIds: Set<string>
	state: BlockState
	completed: number
	total: number
	onToggle: (practiceId: string, completed: boolean) => void
	onToggleCollapse: () => void
}) {
	const theme = useTheme()
	const allDone = completed === total

	if (state === 'collapsed') {
		return (
			<Pressable onPress={onToggleCollapse}>
				<XStack paddingVertical="$sm" paddingHorizontal="$xs" alignItems="center" gap="$sm">
					<Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
						{label}
					</Text>
					<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
						{completed}/{total}
					</Text>
					{allDone && <Check size={14} color={theme.accent.val} />}
				</XStack>
			</Pressable>
		)
	}

	if (state === 'preview') {
		return (
			<Pressable onPress={onToggleCollapse}>
				<YStack paddingVertical="$sm" paddingHorizontal="$xs" gap="$xs">
					<XStack alignItems="center" gap="$sm">
						<Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
							{label}
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							{completed}/{total}
						</Text>
					</XStack>
					<Text fontFamily="$body" fontSize="$1" color="$colorSecondary" opacity={0.6}>
						{practices.map((p) => p.name).join(' · ')}
					</Text>
				</YStack>
			</Pressable>
		)
	}

	return (
		<YStack gap="$sm">
			<Pressable onPress={onToggleCollapse}>
				<YStack gap="$xs" paddingHorizontal="$xs">
					<XStack justifyContent="space-between" alignItems="center">
						<Text fontFamily="$heading" fontSize="$3" color="$color" letterSpacing={1}>
							{label}
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							{completed}/{total}
						</Text>
					</XStack>
					<View height={1} backgroundColor="$accentSubtle" opacity={0.5} />
				</YStack>
			</Pressable>
			<AnimatePresence>
				{practices.map((practice, index) => {
					const done = completedIds.has(practice.id)
					return (
						<MotiView
							key={practice.id}
							from={{ opacity: 0, translateX: -12 }}
							animate={{ opacity: 1, translateX: 0 }}
							exit={{ opacity: 0, translateX: -12 }}
							transition={{ type: 'timing', duration: 200, delay: index * 40 }}
						>
							<XStack
								backgroundColor="$backgroundSurface"
								borderRadius="$lg"
								padding="$md"
								alignItems="center"
								gap="$md"
								opacity={done ? 0.6 : 1}
							>
								<Text fontSize={20}>{getPracticeIcon(practice.icon)}</Text>
								<Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
									{practice.name}
								</Text>
								<Pressable onPress={() => onToggle(practice.id, !done)} hitSlop={8}>
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
						</MotiView>
					)
				})}
			</AnimatePresence>
		</YStack>
	)
}
