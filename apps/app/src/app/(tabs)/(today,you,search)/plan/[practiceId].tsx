import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronDown } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { confirm, ScreenLayout, Typography, VotiveWall } from '@/components'
import { getHourSelect } from '@/content/pins'
import {
  getAlternativeGroup,
  getLoadedFlow,
  getManifest,
  loadPracticeTracks,
} from '@/content/resolver'
import type { SlotState } from '@/db/events'
import type { NotifyConfig, Tier } from '@/db/schema'
import { useCursorsForPractice } from '@/features/divine-office'
import {
  getSlotName,
  useAddSlot,
  useArchivePractice,
  usePractice,
  useProgramProgress,
  useSlotFlows,
  useSlotsForPractice,
  useUpdatePractice,
  useUpdateSlot,
} from '@/features/plan-of-life'
import {
  nodeMarkers,
  Prose,
  type RuleClause,
  RuleProse,
  ruleSentences,
  templatePieces,
} from '@/features/plan-of-life/components/PracticeRule'
import {
  ChoiceSheet,
  RuleSheet,
  type TakenBy,
  WhenSheet,
} from '@/features/plan-of-life/components/RuleSheets'
import {
  describeLeadTime,
  parseNotifyConfig,
  REMINDER_PRESETS,
} from '@/features/plan-of-life/notify'
import { capitalize, phrasing } from '@/features/plan-of-life/phrasing'
import { parseSchedule, type Schedule } from '@/features/plan-of-life/schedule'
import { useRuleRecord } from '@/features/plan-of-life/useRuleRecord'
import { TrackPicker } from '@/features/practices/components'
import { FormStamps } from '@/features/practices/components/PracticeFlow/PracticeActions'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { PracticePlanEditor, usePracticePlan } from '@/features/practices/components/PracticePlan'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'

// Two native sheets can't present at once on iOS; the second waits for the
// first to finish sliding away.
const sheetHandoffMs = 350
const wallWeeks = 20
const tiers: Tier[] = ['essential', 'ideal', 'extra']

type Sheet =
  | { kind: 'when'; mode: 'edit' | 'days'; slots: SlotState[] }
  | { kind: 'new'; schedule: Schedule; time: string; pins?: Record<string, string> }
  | { kind: 'tier' | 'reminder' | 'hours' | 'form' }

/**
 * A practice in the rule of life, set like its prayer page: the rule written
 * as sentences whose every term opens a sheet, then the record kept against
 * it. Reached from the prayer header's calendar and from the rule's tree.
 */
export default function PlanPracticeScreen() {
  const { t, i18n } = useTranslation()
  const { practiceId = '', from } = useLocalSearchParams<{ practiceId: string; from?: string }>()
  const router = useRouter()
  const theme = useTheme()

  const slots = useSlotsForPractice(practiceId)
  const practice = usePractice(practiceId)
  const baseManifest = practiceId ? getManifest(practiceId) : undefined
  const activeVariant = practice?.active_variant ?? baseManifest?.id ?? practiceId
  const manifest = getManifest(activeVariant) ?? baseManifest
  const group = useMemo(() => getAlternativeGroup(practiceId), [practiceId])
  const programProgress = useProgramProgress(practiceId, manifest?.program)
  const enabled = slots.filter((s) => s.enabled === 1)
  // Archived, or only the switched-off placeholder every practice is seeded with.
  const outOfRule = practice?.archived === 1 || enabled.length === 0
  const plan = usePracticePlan(baseManifest)

  // The office's hours name its sentences once its flow is loaded.
  useSlotFlows(slots)
  const hours = getHourSelect(getLoadedFlow(activeVariant))
  const sentences = ruleSentences(slots, hours)
  const record = useRuleRecord(practiceId, wallWeeks * 7)

  const { data: trackDefs } = useQuery({
    queryKey: ['practice-tracks', activeVariant],
    queryFn: async () => (await loadPracticeTracks(activeVariant)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const cursorRows = useCursorsForPractice(trackDefs ? activeVariant : undefined)

  const updateSlot = useUpdateSlot()
  const addSlot = useAddSlot()
  const updatePractice = useUpdatePractice()
  const archive = useArchivePractice()

  const [sheet, setSheet] = useState<Sheet>()
  const [open, setOpen] = useState(false)
  const show = (next: Sheet) => {
    lightTap()
    if (!open) {
      setSheet(next)
      setOpen(true)
      return
    }
    setOpen(false)
    setTimeout(() => {
      setSheet(next)
      setOpen(true)
    }, sheetHandoffMs)
  }
  const close = () => setOpen(false)

  const first = enabled[0] ?? slots[0]
  if (!practiceId || !first) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Typography variant="caption">{t('plan.practiceNotFound')}</Typography>
        </YStack>
      </ScreenLayout>
    )
  }

  const words = phrasing(i18n.language)
  const tier = first.tier
  const notify = parseNotifyConfig(first.notify)
  const reminderOffset = notify?.enabled ? (notify.reminders?.[0]?.offset ?? 0) : undefined
  const reminderLabel = (offset: number | undefined) => {
    if (offset === undefined) return t('rule.reminder.none')
    const lead = describeLeadTime(offset)
    if (lead.kind === 'at') return t('rule.reminder.at')
    if (lead.kind === 'hours') return t('rule.reminder.hours', { count: lead.count })
    return t('rule.reminder.minutes', { count: lead.count })
  }

  const isProgram = !!manifest?.program
  const hourOf = (slot: SlotState) => (hours ? slot.pins?.[hours.as] : undefined)
  const hourOptions = hours?.options.filter((o) => o.pin !== false) ?? []

  // Weekdays already held by the hour's other times, which an office can't
  // pray twice a day. Other practices may repeat a day at several times.
  const takenFor = (editing: SlotState[], pins?: Record<string, string>) => {
    const hour = pins && hours ? pins[hours.as] : editing[0] && hourOf(editing[0])
    if (!hour) return undefined
    const taken = new Map<number, TakenBy>()
    for (const s of enabled) {
      if (hourOf(s) !== hour || editing.includes(s)) continue
      const schedule = parseSchedule(s.schedule)
      const days =
        schedule.type === 'daily'
          ? [0, 1, 2, 3, 4, 5, 6]
          : schedule.type === 'days-of-week'
            ? schedule.days
            : []
      for (const d of days) taken.set(d, { id: s.id, time: s.time ?? undefined })
    }
    return taken
  }

  // A day claimed by this time leaves the one that held it; a time left with
  // no days leaves the rule.
  const release = (claimed: number[]) => {
    const bySlot = new Map<string, number[]>()
    const taken =
      sheet?.kind === 'when'
        ? takenFor(sheet.slots)
        : sheet?.kind === 'new'
          ? takenFor([], sheet.pins)
          : undefined
    for (const d of claimed) {
      const id = taken?.get(d)?.id
      if (id) bySlot.set(id, [...(bySlot.get(id) ?? []), d])
    }
    for (const [id, days] of bySlot) {
      const slot = slots.find((s) => s.id === id)
      if (!slot) continue
      const schedule = parseSchedule(slot.schedule)
      const had =
        schedule.type === 'daily'
          ? [0, 1, 2, 3, 4, 5, 6]
          : schedule.type === 'days-of-week'
            ? schedule.days
            : []
      const left = had.filter((d) => !days.includes(d))
      updateSlot.mutate({
        id,
        data: left.length
          ? { schedule: JSON.stringify({ ...schedule, type: 'days-of-week', days: left }) }
          : { enabled: 0 },
      })
    }
  }

  // Removing a time switches it off rather than deleting it: a deleted slot
  // takes its completions with it, and the record would lose those days.
  const removeTime = (slot: SlotState) => {
    updateSlot.mutate({ id: slot.id, data: { enabled: 0 } })
    close()
  }

  const addTime = async (schedule: Schedule, time: string, pins?: Record<string, string>) => {
    const key = await addSlot.mutateAsync({
      practiceId,
      data: { tier, time, schedule: JSON.stringify(schedule), pins },
    })
    if (first.notify) updateSlot.mutate({ id: key, data: { notify: first.notify } })
  }

  const setAll = (data: Parameters<typeof updateSlot.mutate>[0]['data']) => {
    for (const s of enabled) updateSlot.mutate({ id: s.id, data })
  }

  const openNew = () => {
    if (hours) return show({ kind: 'hours' })
    const last = sentences.at(-1)?.clauses.at(-1)
    show({ kind: 'new', schedule: last?.schedule ?? { type: 'daily' }, time: '08:00' })
  }

  const prayed = record?.count ?? 0
  const recordLine = [
    prayed === 0 ? t('rule.neverPrayed') : t('rule.prayedCount', { count: prayed }),
    record?.since
      ? t('rule.unbrokenSince', {
          date: formatLocalized(new Date(`${record.since}T00:00:00`), t('rule.sinceDate')),
        })
      : undefined,
  ]
    .filter(Boolean)
    .join(' · ')

  const closing = templatePieces(t('rule.closing', nodeMarkers('tier', 'reminder')), {
    tier: {
      text: t(`tier.${tier}`).toLocaleLowerCase(),
      onPress: () => show({ kind: 'tier' }),
      label: t('a11y.ruleEditTier'),
    },
    reminder: {
      text: reminderLabel(reminderOffset),
      onPress: () => show({ kind: 'reminder' }),
      label: t('a11y.ruleEditReminder'),
    },
  })

  const lowRule = (() => {
    if (isProgram) {
      return {
        label: programProgress
          ? t('program.dayOf', {
              day: programProgress.programDay + 1,
              total: programProgress.totalDays,
            })
          : t('program.begin'),
        // Opened from the program's own page, the way there is back.
        onPress: () =>
          from === 'program'
            ? router.back()
            : router.push({
                pathname: '/practices/[manifestId]/program',
                params: { manifestId: activeVariant, from: 'plan' },
              }),
      }
    }
    if (!manifest?.flowHash) return undefined
    return {
      label: t('rule.pray'),
      onPress: () =>
        router.push({ pathname: '/pray/[practiceId]', params: { practiceId: activeVariant } }),
    }
  })()

  const footLabel = (() => {
    if (!outOfRule) return t('rule.leave')
    return practice?.archived === 1 ? t('rule.return') : t('rule.addToRule')
  })()

  const variantLabel = manifest?.alternativeTo ? manifest.alternativeTo.label : undefined

  return (
    <ScreenLayout>
      <YStack paddingVertical="$lg">
        <PracticeHeader
          onBack={() => router.back()}
          name={getSlotName(first, t)}
          variant={
            group && variantLabel ? (
              <Pressable
                onPress={() => show({ kind: 'form' })}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.ruleEditForm')}
              >
                <XStack alignItems="center" gap={5}>
                  <Typography
                    variant="sacred-title"
                    fontSize={25}
                    lineHeight={34}
                    fontStyle="italic"
                    color="$colorSecondary"
                  >
                    {localizeContent(variantLabel)}
                  </Typography>
                  <ChevronDown size={16} strokeWidth={1.5} color={theme.colorSecondary.val} />
                </XStack>
              </Pressable>
            ) : undefined
          }
          actions={
            lowRule ? (
              <Pressable
                onPress={lowRule.onPress}
                hitSlop={12}
                accessibilityRole="link"
                accessibilityLabel={lowRule.label}
              >
                <Typography fontSize={18} color="$colorBurgundy">
                  {`${lowRule.label} ›`}
                </Typography>
              </Pressable>
            ) : undefined
          }
        />

        {outOfRule ? (
          <Typography variant="caption" fontSize={17} textAlign="center" paddingTop="$lg">
            {t('rule.outOfRule')}
          </Typography>
        ) : (
          <>
            <RuleProse
              sentences={sentences}
              onDays={(clause: RuleClause) =>
                show({
                  kind: 'when',
                  mode: clause.slots.length > 1 ? 'days' : 'edit',
                  slots: clause.slots,
                })
              }
              onTime={(slot) => show({ kind: 'when', mode: 'edit', slots: [slot] })}
            />
            <YStack paddingTop={16}>
              <Prose pieces={closing} fontSize={19} color="$colorSecondary" />
            </YStack>
            {!isProgram ? (
              <Pressable
                onPress={openNew}
                accessibilityRole="button"
                accessibilityLabel={hours ? t('rule.addHour') : t('rule.addTime')}
                style={{
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8,
                }}
              >
                <Typography fontSize={17} color="$colorSecondary">
                  {`＋ ${hours ? t('rule.addHour') : t('rule.addTime')}`}
                </Typography>
              </Pressable>
            ) : null}
          </>
        )}

        {trackDefs && cursorRows.length > 0 ? (
          <YStack gap="$md" paddingTop="$xl">
            {Object.entries(trackDefs).map(([trackName, def]) => {
              const cursor = cursorRows.find((r) => r.id === `${activeVariant}/${trackName}`)
              if (!cursor) return null
              const position = JSON.parse(cursor.position)
              return (
                <TrackPicker
                  key={trackName}
                  practiceId={activeVariant}
                  trackDef={def}
                  trackState={{ track: trackName, current_index: position.index ?? 0 }}
                />
              )
            })}
          </YStack>
        ) : null}

        {/* A program's days are drawn on its own page. */}
        {record && !isProgram ? (
          <YStack alignItems="center" paddingTop="$xl" gap="$sm">
            <VotiveWall data={record.wall} weeks={wallWeeks} />
            <Typography variant="caption" fontSize={16} textAlign="center">
              {recordLine}
            </Typography>
          </YStack>
        ) : null}

        <Pressable
          onPress={async () => {
            if (outOfRule) return plan.addToPlan()
            const ok = await confirm({
              title: t('rule.leaveTitle'),
              description: t('rule.leaveConfirm'),
              confirmLabel: t('rule.leave'),
              destructive: true,
            })
            if (!ok) return
            archive.mutate(practiceId)
            router.back()
          }}
          accessibilityRole="button"
          accessibilityLabel={footLabel}
          style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 24 }}
        >
          <Typography fontSize={17} color={outOfRule ? '$colorBurgundy' : '$colorSecondary'}>
            {footLabel}
          </Typography>
        </Pressable>
      </YStack>

      <PracticePlanEditor plan={plan} />

      {sheet?.kind === 'when' ? (
        <WhenSheet
          open={open}
          onClose={close}
          title={capitalize(words.days(parseSchedule(sheet.slots[0].schedule)))}
          schedule={parseSchedule(sheet.slots[0].schedule)}
          time={sheet.slots[0].time ?? '08:00'}
          fields={sheet.mode === 'days' ? 'days' : isProgram ? 'time' : 'both'}
          taken={takenFor(sheet.slots)}
          confirmLabel={t('rule.save')}
          onRemove={
            sheet.mode === 'edit' && enabled.length > 1
              ? () => removeTime(sheet.slots[0])
              : undefined
          }
          onConfirm={({ schedule, time, claimed }) => {
            release(claimed)
            for (const s of sheet.slots) {
              updateSlot.mutate({
                id: s.id,
                data:
                  sheet.mode === 'days'
                    ? { schedule: JSON.stringify(schedule) }
                    : { schedule: JSON.stringify(schedule), time },
              })
            }
            close()
          }}
        />
      ) : null}

      {sheet?.kind === 'new' ? (
        <WhenSheet
          open={open}
          onClose={close}
          title={t('rule.newTime')}
          schedule={sheet.schedule}
          time={sheet.time}
          taken={takenFor([], sheet.pins)}
          confirmLabel={t('rule.add')}
          onConfirm={({ schedule, time, claimed }) => {
            release(claimed)
            void addTime(schedule, time, sheet.pins)
            close()
          }}
        />
      ) : null}

      {sheet?.kind === 'tier' ? (
        <ChoiceSheet
          open={open}
          onClose={close}
          title={t('editor.tier')}
          options={tiers.map((k) => ({
            key: k,
            label: t(`tier.${k}`),
            description: t(`rule.tierHint.${k}`),
          }))}
          selected={tier}
          onPick={(k) => {
            setAll({ tier: k })
            close()
          }}
        />
      ) : null}

      {sheet?.kind === 'reminder' ? (
        <ChoiceSheet
          open={open}
          onClose={close}
          title={t('rule.reminderTitle')}
          options={[
            { key: 'none', label: capitalize(reminderLabel(undefined)) },
            ...REMINDER_PRESETS.map((offset) => ({
              key: String(offset),
              label: capitalize(reminderLabel(offset)),
            })),
          ]}
          selected={reminderOffset === undefined ? 'none' : String(reminderOffset)}
          onPick={(k) => {
            const next: NotifyConfig =
              k === 'none'
                ? { enabled: false }
                : { enabled: true, reminders: [{ offset: Number(k) }] }
            setAll({ notify: JSON.stringify(next) })
            close()
          }}
        />
      ) : null}

      {sheet?.kind === 'hours' && hours ? (
        <ChoiceSheet
          open={open}
          onClose={close}
          title={capitalize(t('rule.addHour'))}
          options={hourOptions.map((o) => {
            const times = enabled
              .filter((s) => hourOf(s) === o.id)
              .flatMap((s) => (s.time ? [s.time] : []))
            return {
              key: o.id,
              label: localizeContent(o.label),
              description: times.length ? words.times(times.sort()) : undefined,
            }
          })}
          onPick={(id) => {
            // A second time for an hour already kept starts on the days it
            // leaves free — or on Sunday, taken over from the first time.
            const pins = { [hours.as]: id }
            const taken = takenFor([], pins)
            const free = [0, 1, 2, 3, 4, 5, 6].filter((d) => !taken?.has(d))
            const schedule: Schedule = !taken?.size
              ? { type: 'daily' }
              : { type: 'days-of-week', days: free.length ? free : [0] }
            const suggested = taken?.size ? undefined : hours.options.find((o) => o.id === id)?.time
            show({ kind: 'new', schedule, time: suggested ?? '08:00', pins })
          }}
        />
      ) : null}

      {sheet?.kind === 'form' && group ? (
        <RuleSheet open={open} onClose={close} title={t('practice.form')}>
          <YStack height={0.5} backgroundColor="$borderColor" marginVertical="$md" />
          <FormStamps
            group={group}
            selectedId={activeVariant}
            onPick={(id) => {
              updatePractice.mutate({ id: practiceId, data: { activeVariant: id } })
              close()
            }}
          />
        </RuleSheet>
      ) : null}
    </ScreenLayout>
  )
}
