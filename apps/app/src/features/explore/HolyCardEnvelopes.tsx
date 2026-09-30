import type { Grant } from '@ember/holy-cards'
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import {
  Envelope,
  envelopeAspect,
  envelopeDate,
  howWon,
  openBy,
  useSaintsCatalog,
} from '@/features/saints'
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
  const today = format(useToday(), 'yyyy-MM-dd')
  const { byId } = useSaintsCatalog()
  const top = pending[0]
  const named = top.choice.length === 1 ? byId[top.choice[0]]?.name : undefined
  const starter = top.door === 'starter'
  const due = [howWon(top, t), openBy(top, today, t)].filter(Boolean).join(' · ')
  // A named envelope reads its saint; an open choice says what's to choose.
  const title = named ?? (starter ? howWon(top, t) : t('saints.redeem.choose'))
  const subtitle = !named && starter ? t('saints.redeem.chooseStarter') : due

  return (
    <FeatureBlock
      label={t('saints.redeem.waiting', { count: pending.length })}
      title={title}
      subtitle={subtitle}
      tone={toneForKey('holy-cards')}
      onPress={() => router.push({ pathname: '/redeem', params: { grant: top.id } })}
      art={(width) => (
        <Stack
          width={Math.round(width * 0.46)}
          count={pending.length}
          name={named}
          date={envelopeDate(top)}
        />
      )}
    />
  )
}

// The top envelope, with the edges of the ones beneath it showing when more wait.
function Stack({
  width,
  count,
  name,
  date,
}: {
  width: number
  count: number
  name?: string
  date: string
}) {
  const height = width * envelopeAspect
  const beneath = Math.min(count - 1, 2)
  return (
    <View style={{ width, height }}>
      {Array.from({ length: beneath }, (_, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative layers
          key={i}
          style={{
            position: 'absolute',
            width,
            height,
            backgroundColor: i === 0 ? '#e8d9b9' : '#dccaa3',
            transform: [{ translateX: (i + 1) * 5 }, { translateY: -(i + 1) * 5 }],
          }}
        />
      ))}
      <Envelope width={width} name={name ?? '✠'} date={date} />
    </View>
  )
}
