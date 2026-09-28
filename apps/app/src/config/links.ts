import { Linking, Platform } from 'react-native'

export const SUGGEST_CREATOR_URL =
  'https://github.com/gustavo-depaula/ember/issues/new?template=suggest-creator.md'

export const SUGGEST_EDIT_URL = (creatorId: string) =>
  `https://github.com/gustavo-depaula/ember/issues/new?title=${encodeURIComponent(
    `[creator] edit ${creatorId}`,
  )}`

export function openExternalUrl(url: string | undefined): void {
  if (!url) return
  if (Platform.OS === 'web') window.open(url, '_blank')
  else void Linking.openURL(url)
}
