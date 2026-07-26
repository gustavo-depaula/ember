import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { Movement } from '@/db/events'
import { lightTap } from '@/lib/haptics'

import { useActiveIntentions, usePinMovement, usePinnedFor, useUnpinMovement } from '../hooks'

import { OfferingPickerSheet } from './OfferingPickerSheet'

/**
 * Any prayer can be offered for someone. This is that, everywhere, at the
 * lowest volume the ladder allows.
 *
 * It sits under the practice header — where a Mass intention is announced,
 * before the prayer rather than after — as one muted apparatus line, never a
 * section. Three rules keep it from becoming the papercut it exists to avoid:
 *
 * 1. **Nothing on the Altar, nothing here.** A user with no intentions never
 *    sees it, so it can't nag someone who hasn't asked for the feature.
 * 2. **Never gold.** Carrying an intention is not a call to action; gold is
 *    reserved for preciousness and this is apparatus.
 * 3. **Never where an author placed a real offering block.** The morning
 *    offerings and the Rosary own their moment; this defers to them.
 */
export function OfferingLine({ practiceId }: { practiceId: string }) {
  const { t } = useTranslation()
  const [sheetOpen, setSheetOpen] = useState(false)
  // Carried for this sitting only, exactly as in the offering block — the
  // durable form is the star, which pins.
  const [carriedIds, setCarriedIds] = useState<Set<string>>(new Set())

  const active = useActiveIntentions()
  const standing = usePinnedFor(practiceId, 'intention')
  const pinMovement = usePinMovement()
  const unpinMovement = useUnpinMovement()

  const carried = useMemo(() => {
    const standingIds = new Set(standing.map((m) => m.id))
    return [...standing, ...active.filter((m) => carriedIds.has(m.id) && !standingIds.has(m.id))]
  }, [standing, active, carriedIds])

  if (active.length === 0) return null

  const standingIds = new Set(standing.map((m) => m.id))

  function toggleStanding(movement: Movement) {
    if (standingIds.has(movement.id)) {
      unpinMovement.mutate({ practiceId, movementId: movement.id })
      setCarriedIds((prev) => new Set(prev).add(movement.id))
    } else {
      pinMovement.mutate({ practiceId, movementId: movement.id })
    }
  }

  const label = (() => {
    if (carried.length === 0) return t('movements.offering.line.invite')
    if (carried.length === 1) return t('movements.offering.line.one', { text: carried[0].text })
    return t('movements.offering.line.more', {
      text: carried[0].text,
      count: carried.length - 1,
    })
  })()

  return (
    <>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          setSheetOpen(true)
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <XStack justifyContent="center" alignItems="baseline" gap="$xs" paddingHorizontal="$lg">
          <Typography variant="caption" textAlign="center">
            {label}
          </Typography>
        </XStack>
      </AnimatedPressable>

      <OfferingPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        carried={carried}
        candidates={active.filter((m) => !carried.some((c) => c.id === m.id))}
        standingIds={standingIds}
        onCarry={(id) => setCarriedIds((prev) => new Set(prev).add(id))}
        onDrop={(id) =>
          setCarriedIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
        onToggleStanding={toggleStanding}
      />
    </>
  )
}
