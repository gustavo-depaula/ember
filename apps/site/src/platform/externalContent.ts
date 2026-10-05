// The site renders each page once per build, so sources have no cache to read.
export type ExternalContentKey = {
  producerId: string
  producerVersion: string
  lang: string
  cacheKey: string
  paramsKey: string
}

export async function getExternalContent(): Promise<undefined> {
  return undefined
}

export async function putExternalContent(): Promise<void> {}
