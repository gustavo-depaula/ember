import { MotiView } from 'moti'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { getPracticeIcon } from '@/db/seed'
import type { NextAction } from '../getNextAction'

export function HeroCTA({ action, onPress }: { action: NextAction; onPress: () => void }) {
	return (
		<MotiView
			from={{ opacity: 0, translateY: -8 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'timing', duration: 250 }}
		>
			<Pressable onPress={onPress}>
				<YStack
					backgroundColor="$backgroundSurface"
					borderRadius="$md"
					borderWidth={1}
					borderColor="$accent"
					padding="$lg"
					alignItems="center"
					gap="$sm"
				>
					{action.type === 'office' && <OfficeContent action={action} />}
					{action.type === 'practice' && <PracticeContent action={action} />}
					{action.type === 'allDone' && <AllDoneContent action={action} />}
				</YStack>
			</Pressable>
		</MotiView>
	)
}

function OfficeContent({ action }: { action: Extract<NextAction, { type: 'office' }> }) {
	return (
		<>
			<Text fontFamily="$display" fontSize={32} lineHeight={38} color="$colorBurgundy">
				{action.label}
			</Text>
			<Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
				{action.sublabel}
			</Text>
			<Text fontFamily="$heading" fontSize="$2" color="$accent" marginTop="$xs">
				Begin
			</Text>
		</>
	)
}

function PracticeContent({ action }: { action: Extract<NextAction, { type: 'practice' }> }) {
	return (
		<>
			<Text fontSize={28}>{getPracticeIcon(action.practice.icon)}</Text>
			<Text fontFamily="$heading" fontSize="$4" color="$color">
				{action.practice.name}
			</Text>
			<Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
				Your next practice
			</Text>
		</>
	)
}

function AllDoneContent({ action }: { action: Extract<NextAction, { type: 'allDone' }> }) {
	return (
		<>
			<Text fontFamily="$display" fontSize={28} lineHeight={34} color="$accent">
				Day complete
			</Text>
			<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
				{action.practiceCount} practices · {action.officeCount} offices
			</Text>
			<Text fontFamily="$script" fontSize="$3" color="$colorSecondary" marginTop="$xs">
				Rest well. See you tomorrow.
			</Text>
		</>
	)
}
