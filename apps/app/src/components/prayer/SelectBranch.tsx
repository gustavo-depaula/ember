import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { YStack } from 'tamagui'
import type { PreprocessContext } from '@/content/preprocessFlow'
import { preprocessFlow } from '@/content/preprocessFlow'
import { usePreprocessContext } from '@/content/preprocessRuntime'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { Skeleton } from '../Skeleton'

// Query key for a single select branch's preprocessed body. The branch only
// varies by option id within a given main-query result; lang/translation/day
// are folded in so it re-resolves when those change (matching the main query).
export function selectBranchKey(
  practiceId: string,
  overrideKey: string,
  optionId: string,
  ctx: PreprocessContext,
) {
  return [
    'select-branch',
    practiceId,
    overrideKey,
    optionId,
    ctx.prefs.lang,
    ctx.prefs.translation,
    ctx.date.getTime(),
  ] as const
}

// Renders the active branch of a select. The initially-selected (default)
// branch was preprocessed eagerly with the rest of the flow, so it renders its
// `children` instantly. Any other branch is preprocessed on demand from
// `rawSections` (usually already warmed by the prefetch in SelectBlock), with a
// skeleton shown only while that one branch resolves — the rest of the practice
// stays put.
export function SelectBranch({
  practiceId,
  overrideKey,
  option,
  isDefault,
  renderSection,
}: {
  practiceId: string
  overrideKey: string
  option: ContainerOption
  isDefault: boolean
  renderSection: (section: Primitive, index: number) => ReactNode
}) {
  const ctx = usePreprocessContext()
  const hasRaw = (option.rawSections?.length ?? 0) > 0

  const branch = useQuery({
    queryKey: selectBranchKey(practiceId, overrideKey, option.id, ctx),
    queryFn: () => preprocessFlow(option.rawSections ?? [], ctx),
    enabled: !isDefault && hasRaw,
    staleTime: Number.POSITIVE_INFINITY,
  })

  if (isDefault) {
    return <YStack gap="$sm">{option.children.map(renderSection)}</YStack>
  }
  if (branch.data) {
    return <YStack gap="$sm">{branch.data.map(renderSection)}</YStack>
  }
  // Non-default branch with pre-built `children` and nothing to lazily
  // preprocess (e.g. the Order-of-Mass form/invitation pickers, which emit
  // final primitives directly) — render the children as-is.
  if (!hasRaw) {
    return option.children.length > 0 ? (
      <YStack gap="$sm">{option.children.map(renderSection)}</YStack>
    ) : undefined
  }
  return <SelectBranchSkeleton />
}

// A quiet stand-in shaped like a short prayer stanza, shown only in the rare
// case a branch is tapped before its prefetch has landed.
function SelectBranchSkeleton() {
  return (
    <YStack gap="$sm" paddingVertical="$xs">
      <Skeleton width="90%" height={16} />
      <Skeleton width="100%" height={16} />
      <Skeleton width="95%" height={16} />
      <Skeleton width="60%" height={16} />
    </YStack>
  )
}
