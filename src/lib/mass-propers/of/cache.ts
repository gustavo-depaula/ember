import { getCached, setCache } from '@/db/repositories/cache'

function cacheKey(date: string, language: string): string {
  return `of-propers-raw:${date}:${language}`
}

export async function getCachedRaw(date: string, language: string): Promise<string | undefined> {
  return getCached<string>(cacheKey(date, language))
}

export async function setCachedRaw(date: string, language: string, raw: string): Promise<void> {
  await setCache(cacheKey(date, language), raw)
}
