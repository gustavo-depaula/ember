import { MotiView } from 'moti'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { ManuscriptFrame, WatercolorIcon } from '@/components'
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
				<ManuscriptFrame light>
					<YStack alignItems="center" gap="$sm" paddingVertical="$sm">
						{action.type === 'office' && <OfficeContent action={action} />}
						{action.type === 'practice' && <PracticeContent action={action} />}
						{action.type === 'allDone' && <AllDoneContent action={action} />}
					</YStack>
				</ManuscriptFrame>
			</Pressable>
		</MotiView>
	)
}

function getOfficeIcon(label: string): 'sunrise' | 'moon' | 'book' {
	if (label.toLowerCase().includes('morning')) return 'sunrise'
	if (label.toLowerCase().includes('night') || label.toLowerCase().includes('compline'))
		return 'moon'
	return 'book'
}

function OfficeContent({ action }: { action: Extract<NextAction, { type: 'office' }> }) {
	return (
		<>
			<WatercolorIcon name={getOfficeIcon(action.label)} size={48} />
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
			<WatercolorIcon name="cross" size={48} />
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
