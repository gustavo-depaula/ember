import { Platform } from 'react-native'

async function fire(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return
  try {
    await fn()
  } catch {}
}

export function lightTap() {
  return fire(async () => {
    const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics')
    await impactAsync(ImpactFeedbackStyle.Light)
  })
}

export function mediumTap() {
  return fire(async () => {
    const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics')
    await impactAsync(ImpactFeedbackStyle.Medium)
  })
}

export function successBuzz() {
  return fire(async () => {
    const { notificationAsync, NotificationFeedbackType } = await import('expo-haptics')
    await notificationAsync(NotificationFeedbackType.Success)
  })
}
