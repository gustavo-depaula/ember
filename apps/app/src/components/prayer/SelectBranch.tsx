import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { YStack } from 'tamagui'
import type { PreprocessContext } from '@/content/preprocessFlow'
import { preprocessFlow } from '@/content/preprocessFlow'
import { usePreprocessContext } from '@/content/preprocessRuntime'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { Skeleton } from '../Skeleton'

// lang/translation/day are folded in so a branch re-resolves when they change,
// matching the main query.
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

// The default branch was preprocessed eagerly with the flow, so its `children`
// render instantly. Other branches are preprocessed on demand from
// `rawSections` (usually warmed by SelectBlock's prefetch), with a skeleton
// only while that branch resolves.
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
  // Pickers that emit final primitives directly (e.g. Order-of-Mass
  // form/invitation) have nothing to preprocess.
  if (!hasRaw) {
    return option.children.length > 0 ? (
      <YStack gap="$sm">{option.children.map(renderSection)}</YStack>
    ) : undefined
  }
  return <SelectBranchSkeleton />
}

// Shown only when a branch is tapped before its prefetch has landed.
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
