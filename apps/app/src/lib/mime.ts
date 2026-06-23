// Image MIME type from a file path/extension. Shared by image rendering
// (useResolvedImageUri) and EPUB image embedding (reader-sync).
export function mimeForPath(path: string): string {
  const lower = path.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.svg')) return 'image/svg+xml'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}
