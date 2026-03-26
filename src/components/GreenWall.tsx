import { addDays, format, startOfWeek, subWeeks } from 'date-fns'
import { MotiView } from 'moti'
import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

export type WallEntry = { date: string; value: number }

function buildWeekGrid(data: WallEntry[], weeks: number): WallEntry[][] {
	const byDate = new Map(data.map((d) => [d.date, d.value]))
	const today = new Date()
	const start = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 1 })
	const columns: WallEntry[][] = []

	let current = start
	while (current <= today) {
		const week: WallEntry[] = []
		for (let day = 0; day < 7; day++) {
			const date = addDays(current, day)
			if (date > today) break
			const key = format(date, 'yyyy-MM-dd')
			week.push({ date: key, value: byDate.get(key) ?? 0 })
		}
		columns.push(week)
		current = addDays(current, 7)
	}

	return columns
}

const cell = { size: 12, gap: 2, radius: 6 }

function Cell({
	color,
	date,
	delay,
	onPress,
}: {
	color: string
	date: string
	delay: number
	onPress?: () => void
}) {
	const square = (
		<MotiView
			from={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: 'timing', duration: 150, delay }}
		>
			<YStack
				width={cell.size}
				height={cell.size}
				borderRadius={cell.radius}
				backgroundColor={color}
			/>
		</MotiView>
	)

	if (onPress) {
		return (
			<Pressable onPress={onPress} accessibilityLabel={`${date}: activity`}>
				{square}
			</Pressable>
		)
	}

	return square
}

export function GreenWall({
	data,
	onDayPress,
	weeks = 20,
}: {
	data: WallEntry[]
	onDayPress?: (date: string) => void
	weeks?: number
}) {
	const grid = useMemo(() => buildWeekGrid(data, weeks), [data, weeks])
	const theme = useTheme()

	const colors = [
		theme.wallEmpty.val,
		theme.wallLow.val,
		theme.wallMedium.val,
		theme.wallHigh.val,
		theme.wallFull.val,
	]

	return (
		<XStack gap={cell.gap} justifyContent="flex-end">
			{grid.map((week, wi) => (
				<YStack key={week[0]?.date ?? wi} gap={cell.gap}>
					{week.map((entry, di) => (
						<Cell
							key={entry.date}
							color={colors[entry.value] ?? colors[0]}
							date={entry.date}
							delay={(wi * 7 + di) * 4}
							onPress={onDayPress ? () => onDayPress(entry.date) : undefined}
						/>
					))}
				</YStack>
			))}
		</XStack>
	)
}
