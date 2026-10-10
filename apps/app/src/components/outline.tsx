import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { type ScrollView, View } from 'react-native'

export type OutlineEntry = { id: number; title: string }

type Mark = OutlineEntry & { view: View }
type Registry = { add: (mark: Mark) => void; remove: (id: number) => void }

const OutlineContext = createContext<Registry | undefined>(undefined)

let nextId = 0

// The scroll view's content view, as the host instance `measureLayout` needs:
// a node handle is refused on the new architecture, and the typings only
// declare the handle's accessor.
function innerView(scroller: ScrollView | null) {
  return (
    scroller as unknown as { getInnerViewRef?: () => View | null } | null
  )?.getInnerViewRef?.()
}
// Titles are authored as inline markdown; an outline sets them plain.
const plain = (text: string) => text.replace(/[*_`]/g, '').trim()

/**
 * A division of the page — a heading, a section marker. Where a reader keeps
 * an outline (`useOutline`) the division reports itself; anywhere else this is
 * its children and nothing more.
 */
export function OutlineMark({ title, children }: { title: string; children: ReactNode }) {
  const registry = useContext(OutlineContext)
  const id = useRef(0)
  if (id.current === 0) id.current = ++nextId
  if (!registry) return children
  return (
    <View
      // Kept in the native tree so the outline can measure where it stands.
      collapsable={false}
      ref={(view) => {
        if (!view) return
        registry.add({ id: id.current, title: plain(title), view })
        return () => registry.remove(id.current)
      }}
    >
      {children}
    </View>
  )
}

/**
 * The outline of a scrolling page, built from the divisions actually showing —
 * a choice in the text (which mysteries, which hour) changes them. Entries come
 * in page order; `jumpTo` scrolls one to the top.
 */
export function useOutline(scroller: RefObject<ScrollView | null>, enabled: boolean) {
  const marks = useRef(new Map<number, Mark>()).current
  const [entries, setEntries] = useState<OutlineEntry[]>([])
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Divisions mount in bursts and in no set order; once they settle, ask each
  // where it stands on the page and list them top to bottom.
  const settle = useCallback(() => {
    clearTimeout(pending.current)
    pending.current = setTimeout(() => {
      const page = innerView(scroller.current)
      if (!page) return
      const placed: Array<OutlineEntry & { y: number }> = []
      const all = [...marks.values()]
      if (all.length === 0) return setEntries([])
      let waiting = all.length
      const done = () => {
        waiting -= 1
        if (waiting > 0) return
        placed.sort((a, b) => a.y - b.y)
        setEntries(placed.map(({ id, title }) => ({ id, title })))
      }
      for (const mark of all)
        mark.view.measureLayout(
          page,
          (_x, y) => {
            placed.push({ id: mark.id, title: mark.title, y })
            done()
          },
          done,
        )
    }, 200)
  }, [marks, scroller])

  useEffect(() => () => clearTimeout(pending.current), [])

  const registry = useMemo<Registry | undefined>(
    () =>
      enabled
        ? {
            add: (mark) => {
              marks.set(mark.id, mark)
              settle()
            },
            remove: (id) => {
              marks.delete(id)
              settle()
            },
          }
        : undefined,
    [enabled, marks, settle],
  )

  const jumpTo = useCallback(
    (id: number) => {
      const page = innerView(scroller.current)
      if (!page) return
      marks
        .get(id)
        ?.view.measureLayout(page, (_x, y) =>
          scroller.current?.scrollTo({ y: Math.max(0, y - 24), animated: true }),
        )
    },
    [marks, scroller],
  )

  // One division is the page's title again, not a way around it.
  return { registry, entries: entries.length > 1 ? entries : [], jumpTo }
}

export function OutlineProvider({
  registry,
  children,
}: {
  registry: Registry | undefined
  children: ReactNode
}) {
  return <OutlineContext.Provider value={registry}>{children}</OutlineContext.Provider>
}
