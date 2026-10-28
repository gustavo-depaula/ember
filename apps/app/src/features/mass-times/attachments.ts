// Pick up to `limit` photos from the library and downscale + compress each to comfortably fit the
// backend's 1 MB attachment cap. Returns none if permission is denied or the user cancels.
//
// expo-image-picker and expo-image-manipulator bind their native modules at import, so they're loaded
// dynamically: importing this file never triggers the native binding. Without the native module the
// dynamic import throws; the caller (ChurchFeedback) catches it and degrades gracefully.

const maxWidth = 1280
const compress = 0.6

export async function pickCorrectionPhotos(
  limit: number,
): Promise<{ uri: string; contentType: string }[]> {
  const ImagePicker = await import('expo-image-picker')
  const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator')

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) return []

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    allowsMultipleSelection: true,
    selectionLimit: limit,
    orderedSelection: true,
  })
  if (result.canceled) return []

  // Android's picker treats the limit as a hint on some versions, so it is held here too.
  return Promise.all(
    result.assets.slice(0, limit).map(async (asset) => {
      const context = ImageManipulator.manipulate(asset.uri)
      if (asset.width && asset.width > maxWidth) context.resize({ width: maxWidth })
      const ref = await context.renderAsync()
      const image = await ref.saveAsync({ compress, format: SaveFormat.JPEG })
      return { uri: image.uri, contentType: 'image/jpeg' }
    }),
  )
}
