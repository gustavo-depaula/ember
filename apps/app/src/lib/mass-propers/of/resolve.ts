import { format } from 'date-fns'

import type { ProperDay } from '..'
import { getCachedRaw, setCachedRaw } from './cache'
import { fetchEvangelizo, normalizeEvangelizo } from './evangelizo'
import { fetchLiturgiaDiaria, normalizeLiturgiaDiaria } from './liturgia-diaria'

export async function fetchOfPropers(date: Date, language: string): Promise<ProperDay> {
  const dateKey = format(date, 'yyyy-MM-dd')
  const normalize = language === 'pt-BR' ? normalizeLiturgiaDiaria : normalizeEvangelizo

  const cached = await getCachedRaw(dateKey, language)
  if (cached) return normalize(cached)

  const raw = language === 'pt-BR' ? await fetchLiturgiaDiaria(date) : await fetchEvangelizo(date)

  setCachedRaw(dateKey, language, raw)

  return normalize(raw)
}
