// Pure validation helpers shared by validate-flows.ts and its unit tests.
// Kept side-effect-free so importing this module never walks the filesystem.

export type ValidationIssue = {
  file: string
  path: string
  message: string
  severity?: 'error' | 'warning'
}

export const GALLERY_DISPLAYS = new Set(['carousel', 'stack', 'row'])

export function validateGallery(
  obj: Record<string, unknown>,
  file: string,
  path: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const display = obj.display
  if (display !== undefined) {
    if (typeof display !== 'string' || !GALLERY_DISPLAYS.has(display)) {
      issues.push({
        file,
        path: `${path}.display`,
        message: `gallery.display must be one of carousel | stack | row (got ${JSON.stringify(display)})`,
      })
    }
  }

  if (!Array.isArray(obj.items) || obj.items.length === 0) {
    issues.push({
      file,
      path: `${path}.items`,
      message: 'gallery.items must be a non-empty array',
    })
    return issues
  }

  const items = obj.items as unknown[]
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item || typeof item !== 'object') {
      issues.push({
        file,
        path: `${path}.items[${i}]`,
        message: 'gallery item must be an object',
      })
      continue
    }
    if (typeof (item as { src?: unknown }).src !== 'string') {
      issues.push({
        file,
        path: `${path}.items[${i}].src`,
        message: 'gallery item missing string `src`',
      })
    }
  }

  const effectiveDisplay = typeof display === 'string' ? display : 'carousel'
  if (obj.weights !== undefined) {
    if (effectiveDisplay !== 'row') {
      issues.push({
        file,
        path: `${path}.weights`,
        message: 'gallery.weights only applies when display === "row"',
      })
    } else if (!Array.isArray(obj.weights)) {
      issues.push({
        file,
        path: `${path}.weights`,
        message: 'gallery.weights must be an array of numbers',
      })
    } else if (obj.weights.length !== items.length) {
      issues.push({
        file,
        path: `${path}.weights`,
        message: `gallery.weights length (${obj.weights.length}) must match items length (${items.length})`,
      })
    } else if (!obj.weights.every((w) => typeof w === 'number' && w > 0)) {
      issues.push({
        file,
        path: `${path}.weights`,
        message: 'gallery.weights entries must be positive numbers',
      })
    }
  }

  if (effectiveDisplay === 'row' && items.length > 4) {
    issues.push({
      file,
      path,
      message: `gallery has ${items.length} items in row mode — consider display="carousel" for browsing-heavy content`,
      severity: 'warning',
    })
  }

  return issues
}
