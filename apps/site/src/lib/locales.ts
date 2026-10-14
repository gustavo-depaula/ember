// The site's two editions, without the build's per-page language: safe to
// import from code that runs in the browser.
export const locales = ['en-US', 'pt-BR'] as const
export type Locale = (typeof locales)[number]

// URL prefix per locale. English lives at the root so the bare domain is a
// real, indexable page.
export const localePrefix: Record<Locale, string> = { 'en-US': '', 'pt-BR': '/pt' }
