import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'

// Pick a photo from the library and downscale + compress it to comfortably fit the backend's 1 MB
// attachment cap. Returns undefined if permission is denied or the user cancels.
const maxWidth = 1280
const compress = 0.6

export async function pickCorrectionPhoto(): Promise<
  { uri: string; contentType: string } | undefined
> {
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
