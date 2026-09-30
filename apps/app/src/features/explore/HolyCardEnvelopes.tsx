import type { Grant } from '@ember/holy-cards'
import { useIsFocused, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { EnvelopeStack, envelopeDate, howWon, openBy, useSaintsCatalog } from '@/features/saints'
import { useToday } from '@/hooks/useToday'
import { toneForKey } from './bgColor'
import { FeatureBlock } from './FeatureBlock'

/**
 * The holy cards waiting to be opened, heading Today's carousel as one card:
 * the soonest-due envelope on top of the stack, sealed. Opens it to redeem.
 */
export function HolyCardEnvelopes({ pending }: { pending: Grant[] }) {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const focused = useIsFocused()
  const { byId } = useSaintsCatalog()
  const top = pending[0]
  const named = top.choice.length === 1 ? byId[top.choice[0]]?.name : undefined
  const won = howWon(top, t)
  // A named envelope reads its saint; a starter asks for a choice; any other
  // choice says what's to choose.
  const { title, subtitle } = (() => {
    const due = [won, openBy(top, today, t)].filter(Boolean).join(' · ')
    if (named) return { title: named, subtitle: due }
    if (top.door === 'starter') return { title: won, subtitle: t('saints.redeem.chooseStarter') }
    return { title: t('saints.redeem.choose'), subtitle: due }
  })()

  return (
    <FeatureBlock
      label={t('saints.redeem.waiting', { count: pending.length })}
      title={title}
      subtitle={subtitle}
      tone={toneForKey('holy-cards')}
      onPress={() => router.push({ pathname: '/redeem', params: { grant: top.id } })}
      art={(width) => (
        <EnvelopeStack
          width={Math.round(width * 0.46)}
          count={pending.length}
          name={named ?? '✠'}
          date={envelopeDate(top)}
          shimmer={focused}
        />
      )}
    />
  )
}
