declare module 'hypher' {
  interface Language {
    patterns: Record<string, unknown>
    leftmin: number
    rightmin: number
    exceptions?: string
  }

  class Hypher {
    constructor(language: Language)
    hyphenate(word: string): string[]
    hyphenateText(text: string): string
  }

  export default Hypher
}

declare module 'hyphenation.en-us' {
  import type Hypher from 'hypher'
  const patterns: ConstructorParameters<typeof Hypher>[0]
  export default patterns
}

declare module 'hyphenation.pt' {
  import type Hypher from 'hypher'
  const patterns: ConstructorParameters<typeof Hypher>[0]
  export default patterns
}
