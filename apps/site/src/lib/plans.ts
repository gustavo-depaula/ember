import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import {
  type CreatorManifest,
  isTemplatePlaceholder,
  type PlanOfLifeTemplateManifest,
} from '@/content/manifestTypes'
import { artFor } from '@/features/explore/artMap'
import { localizeContent } from '@/lib/i18n'
import { href } from '~/routes'
import { entryTitle, listEntries } from './catalog'
import { bootCorpus } from './corpus'
import { type Locale, translator, withLocale } from './locale'
import { proseHtml } from './markdown'

type Localized = Record<string, string | undefined>

export type PlanSummary = { id: string; title: string; description: string; art?: string }

export async function listPlans(locale: Locale): Promise<PlanSummary[]> {
  await bootCorpus()
  return withLocale(locale, () =>
    listEntries('plan-of-life-template').map(([id, entry]) => ({
      id,
      title: entryTitle(entry),
      description: entry.description ? localizeContent(entry.description as Localized) : '',
      art: artFor(id)?.uri,
    })),
  )
}

export type PlanPractice = {
  title: string
  href?: string
  tier?: string
  when: string
  note?: string
}

export async function loadPlan(id: string, locale: Locale) {
  await bootCorpus()
  const entry = getEntry(id)
  if (!entry) return undefined
  const manifest = await ensureManifestBody<PlanOfLifeTemplateManifest>(entry.hash)
  const t = translator(locale)
  return withLocale(locale, () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const cadence = (schedule: { type?: string; days?: number[] } | undefined): string => {
      if (!schedule || schedule.type === 'daily')
        return t('frequency.daily', {
          defaultValue: locale === 'pt-BR' ? 'Todos os dias' : 'Daily',
        })
      if (schedule.days?.length) return schedule.days.map((d) => t(`day.${days[d]}`)).join(' · ')
      return ''
    }
    const practices: PlanPractice[] = manifest.practices.map((p) => {
      if (isTemplatePlaceholder(p)) {
        return {
          title: localizeContent(p.name),
          tier: p.tier && t(`tier.${p.tier}`),
          when: p.cadence ? localizeContent(p.cadence) : '',
          note: p.note ? localizeContent(p.note) : undefined,
        }
      }
      const practice = getEntry(`practice/${p.ref}`)
      return {
        title: practice ? entryTitle(practice) : p.ref,
        href: practice ? href.prayer(locale, p.ref) : undefined,
        tier: t(`tier.${p.tier}`),
        when: [p.time, cadence(p.schedule as { type?: string; days?: number[] })]
          .filter(Boolean)
          .join(' · '),
        note: p.note ? localizeContent(p.note) : undefined,
      }
    })
    return {
      id,
      title: localizeContent(manifest.name),
      description: localizeContent(manifest.description),
      manifesto: proseHtml(localizeContent(manifest.manifesto)),
      attribution: manifest.attribution ? localizeContent(manifest.attribution) : undefined,
      source: manifest.source ? proseHtml(localizeContent(manifest.source)) : undefined,
      art: artFor(id)?.uri,
      practices,
    }
  })
}

export type Voice = {
  id: string
  name: string
  byline?: string
  bio: string
  role?: string
  languages: string[]
  channels: { label: string; kind: string; url: string }[]
  website?: string
}

export async function listVoices(locale: Locale): Promise<Voice[]> {
  await bootCorpus()
  const t = translator(locale)
  const voices = await Promise.all(
    listEntries('creator').map(async ([id, entry]) => {
      const manifest = await ensureManifestBody<CreatorManifest>(entry.hash)
      return withLocale(locale, (): Voice => {
        const roleKey = manifest.role === 'lay-theologian' ? 'layTheologian' : manifest.role
        return {
          id,
          name: localizeContent(manifest.name),
          byline: manifest.byline ? localizeContent(manifest.byline) : undefined,
          bio: localizeContent(manifest.bio),
          role: roleKey ? t(`creators.role.${roleKey}`) : undefined,
          languages: manifest.languages,
          channels: manifest.channels.flatMap((channel) => {
            const url =
              channel.kind === 'youtube'
                ? channel.channelId && `https://www.youtube.com/channel/${channel.channelId}`
                : channel.feedUrl
            if (!url) return []
            const kindName =
              channel.kind === 'youtube'
                ? 'YouTube'
                : channel.kind === 'podcast'
                  ? 'Podcast'
                  : 'RSS'
            return [
              {
                label: channel.title ? localizeContent(channel.title) : kindName,
                kind: kindName,
                url,
              },
            ]
          }),
          website: manifest.links?.website,
        }
      })
    }),
  )
  return voices.sort((a, b) => a.name.localeCompare(b.name, locale))
}
