export async function getCached<T>(): Promise<T | undefined> {
  return undefined
}

export async function hasCached(): Promise<boolean> {
  return false
}

export async function setCache(): Promise<void> {}

export async function clearCache(): Promise<void> {}
