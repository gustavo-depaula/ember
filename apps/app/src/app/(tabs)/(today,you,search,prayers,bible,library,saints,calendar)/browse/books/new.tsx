import { format, parseISO, subDays } from 'date-fns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import {
  type Arrival,
  arrivals,
  BookRow,
  ShelfLabel,
  ShelfPage,
  useShelf,
} from '@/features/books/shelf'
import { useStableToday } from '@/hooks/useToday'
import { formatLocalized } from '@/lib/i18n/dateLocale'

const windowDays = 60

type Line = { kind: 'day'; date: string; count: number } | { kind: 'book'; arrival: Arrival }

/** Everything that arrived in the last two months, by day: new books, and books now in the reader's language. */
export default function NewArrivalsScreen() {
  const { t, i18n } = useTranslation()
  const shelf = useShelf()
  const today = useStableToday()
  const since = format(subDays(today, windowDays), 'yyyy-MM-dd')

  const lines = useMemo<Line[]>(() => {
    const byDay = new Map<string, Arrival[]>()
    for (const arrival of arrivals(shelf.books, i18n.language, since)) {
      const day = byDay.get(arrival.date)
      if (day) day.push(arrival)
      else byDay.set(arrival.date, [arrival])
    }
    return [...byDay].flatMap(([date, day]): Line[] => [
      { kind: 'day', date, count: day.length },
      ...day.map((arrival) => ({ kind: 'book' as const, arrival })),
    ])
  }, [shelf.books, i18n.language, since])

  return (
    <ShelfPage
      title={t('shelf.arrivals')}
      data={lines}
      keyExtractor={(line) =>
        line.kind === 'day' ? line.date : `${line.arrival.kind}-${line.arrival.book.id}`
      }
      renderItem={({ item }) => {
        if (item.kind === 'day')
          return (
            <YStack paddingTop="$lg" paddingBottom="$xs">
              <ShelfLabel
                action={
                  <Typography variant="caption" fontVariant={['tabular-nums']}>
                    {item.count}
                  </Typography>
                }
              >
                {formatLocalized(parseISO(item.date), t('program.dateFormat'))}
              </ShelfLabel>
            </YStack>
          )
        const { book, kind } = item.arrival
        const tag = t(kind === 'new' ? 'shelf.newBook' : 'shelf.nowInLanguage')
        return <BookRow book={book} detail={[book.author, tag].filter(Boolean).join(' · ')} />
      }}
      empty={<Typography variant="caption">{t('shelf.arrivalsEmpty')}</Typography>}
    />
  )
}
