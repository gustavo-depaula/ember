// The app's language, in the browser: the page's.
export function detectLanguage(): 'en-US' | 'pt-BR' {
  return document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}
