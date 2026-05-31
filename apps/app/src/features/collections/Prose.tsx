import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'

/**
 * The prologue: justified paragraphs at a comfortable reading leading. Shared by
 * the collection frontispiece (its prologue) and the practice frontispiece (the
 * "about" description), so prose reads identically across both doorways.
 */
export function PrologueProse({ text }: { text: string }) {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (paras.length === 0) return null
  return (
    <YStack gap="$sm">
      {paras.map((p, i) => (
        <Typography
          // biome-ignore lint/suspicious/noArrayIndexKey: positional paragraphs
          key={i}
          selectable
          variant="interface"
          fontSize={18}
          lineHeight={27}
          textAlign="justify"
          color="$color"
        >
          {p}
        </Typography>
      ))}
    </YStack>
  )
}
