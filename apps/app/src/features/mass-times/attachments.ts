// Pick a photo from the library and downscale + compress it to comfortably fit the backend's 1 MB
// attachment cap. Returns undefined if permission is denied or the user cancels.
//
// expo-image-picker and expo-image-manipulator bind their native modules at import, so they're loaded
// DYNAMICALLY here — importing this file (and thus the church detail) never triggers the native
// binding. Before a native rebuild the dynamic import throws; the caller (ChurchFeedback) catches it
// and degrades gracefully.

const maxWidth = 1280
const compress = 0.6

export async function pickCorrectionPhoto(): Promise<
  { uri: string; contentType: string } | undefined
> {
  const ImagePicker = await import('expo-image-picker')
  const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator')

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) return undefined

  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 })
  const asset = result.canceled ? undefined : result.assets?.[0]
  if (!asset) return undefined

  const context = ImageManipulator.manipulate(asset.uri)
  if (asset.width && asset.width > maxWidth) context.resize({ width: maxWidth })
  const ref = await context.renderAsync()
  const image = await ref.saveAsync({ compress, format: SaveFormat.JPEG })
  return { uri: image.uri, contentType: 'image/jpeg' }
}
