// `@/stores/preferencesStore` in the browser of an account's device: the
// settings that follow the person are read from the account's log; the
// language is the page's.
import { useEventStore } from '@/db/events'

export const usePreferencesStore = {
  getState: () => {
    const synced = useEventStore.getState().preferences
    return {
      contentLanguage: document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en-US',
      secondaryLanguage: undefined,
      hyphenation: true,
      jurisdiction: synced.get('jurisdiction'),
    }
  },
}
