// Every site call passes its language explicitly; this only satisfies the
// app modules that read a default from the preferences store.
const state = { contentLanguage: 'en-US', secondaryLanguage: undefined, hyphenation: true }

export const usePreferencesStore = { getState: () => state }
