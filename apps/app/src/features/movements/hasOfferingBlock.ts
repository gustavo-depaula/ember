import type { Primitive } from '@/content/primitives'

type Unknown = Record<string, unknown>

/**
 * Does this practice already say, in its own flow, where the offering goes?
 *
 * The ambient "Offered for" line is a fallback for the ~350 practices that
 * never author an `offering` block. Where an author *did* place one — the
 * morning offerings, the Rosary — that block is the offering and the line must
 * stay out of its way.
 *
 * Two shapes have to be searched. Resolved primitives nest through container
 * children and through each `select` option's children; and a `select`'s
 * unselected branches are not preprocessed at all, carrying `rawSections` of
 * engine output where the node is still `rendered-offering`. Miss the second
 * and the Rosary would show both the line and the block the moment a user
 * switched mysteries.
 */
export function hasOfferingBlock(primitives: readonly Primitive[]): boolean {
  return primitives.some(containsOffering)
}

function containsOffering(node: unknown): boolean {
  if (Array.isArray(node)) return node.some(containsOffering)
  if (!node || typeof node !== 'object') return false

  const n = node as Unknown
  if (n.type === 'interaction' && n.kind === 'offering') return true
  // Unresolved engine output inside a `select` branch that was never preprocessed.
  if (n.type === 'rendered-offering') return true

  return Object.values(n).some((v) =>
    Array.isArray(v) || (v && typeof v === 'object') ? containsOffering(v) : false,
  )
}
