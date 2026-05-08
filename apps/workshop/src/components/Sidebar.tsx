import { useMemo, useState } from 'react'
import {
  buildCorpusRefMap,
  type CorpusItem,
  collectionRefs,
  kindIcon,
  kindLabel,
  type LoadedCorpus,
  parseRef,
  useCorpus,
} from '@/lib/corpus'
import { iconMap } from '@/lib/icons'
import { loc } from '@/lib/localize'
import { useWorkspace } from '@/stores/workspace'
import type {
  BookManifest,
  ChapterManifest,
  CollectionManifest,
  CorpusKind,
  PracticeManifest,
  PrayerAsset,
} from '@/types/content'
import { CreateItemDialog, type CreateKind } from './CreateItemDialog'
import styles from './Sidebar.module.css'

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return fields.some((f) => (f ?? '').toLowerCase().includes(q))
}

export function Sidebar() {
  const sidebarView = useWorkspace((s) => s.sidebarView)
  const setSidebarView = useWorkspace((s) => s.setSidebarView)
  const openTab = useWorkspace((s) => s.openTab)
  const [search, setSearch] = useState('')
  const [createKind, setCreateKind] = useState<CreateKind | undefined>()
  const { data: corpus, isLoading } = useCorpus()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>Workshop</h1>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${sidebarView === 'kind' ? styles.viewToggleActive : ''}`}
            onClick={() => setSidebarView('kind')}
          >
            By kind
          </button>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${sidebarView === 'collection' ? styles.viewToggleActive : ''}`}
            onClick={() => setSidebarView('collection')}
          >
            By collection
          </button>
        </div>
        <input
          className={styles.searchInput}
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => openTab({ type: 'translation-review', id: 'main' }, 'Translation Review')}
        >
          🔍 Review translations
        </button>
      </div>

      <div className={styles.scrollArea}>
        {isLoading && <p className={styles.loading}>Loading…</p>}
        {!isLoading && sidebarView === 'kind' && (
          <KindView corpus={corpus} search={search} onCreate={setCreateKind} />
        )}
        {!isLoading && sidebarView === 'collection' && (
          <CollectionView corpus={corpus} search={search} onCreate={setCreateKind} />
        )}
      </div>

      {createKind && (
        <CreateItemDialog kind={createKind} onClose={() => setCreateKind(undefined)} />
      )}
    </aside>
  )
}

// ── By Kind view ──

type KindGroupRow = { id: string; icon: string; label: string }

type KindGroupConfig<T> = {
  kind: CorpusKind
  items: T[]
  toRow: (item: T) => KindGroupRow
  creatable: boolean
}

function KindView({
  corpus,
  search,
  onCreate,
}: {
  corpus: LoadedCorpus
  search: string
  onCreate: (k: CreateKind) => void
}) {
  const openTab = useWorkspace((s) => s.openTab)

  const practiceConfig: KindGroupConfig<PracticeManifest> = {
    kind: 'practice',
    items: corpus.practices.filter((p) => matches(search, p.id, loc(p.name))),
    toRow: (p) => ({
      id: p.id,
      icon: p.icon ? (iconMap[p.icon] ?? kindIcon.practice) : kindIcon.practice,
      label: loc(p.name) || p.id,
    }),
    creatable: true,
  }

  const prayerConfig: KindGroupConfig<PrayerAsset> = {
    kind: 'prayer',
    items: corpus.prayers
      .filter((p) => p.id != null)
      .filter((p) => matches(search, p.id, loc(p.title))),
    toRow: (p) => ({
      id: p.id as string,
      icon: kindIcon.prayer,
      label: loc(p.title) || (p.id as string),
    }),
    creatable: true,
  }

  const bookConfig: KindGroupConfig<BookManifest> = {
    kind: 'book',
    items: corpus.books.filter((b) => matches(search, b.id, loc(b.name))),
    toRow: (b) => ({ id: b.id, icon: kindIcon.book, label: loc(b.name) || b.id }),
    creatable: false,
  }

  const chapterConfig: KindGroupConfig<ChapterManifest> = {
    kind: 'chapter',
    items: corpus.chapters.filter((c) => matches(search, c.id, loc(c.title))),
    toRow: (c) => ({ id: c.id, icon: kindIcon.chapter, label: loc(c.title) || c.id }),
    creatable: false,
  }

  const collectionConfig: KindGroupConfig<CollectionManifest> = {
    kind: 'collection',
    items: corpus.collections.filter((c) => matches(search, c.id, loc(c.name))),
    toRow: (c) => ({
      id: stripCollectionPrefix(c.id),
      icon: c.icon ? (iconMap[c.icon] ?? kindIcon.collection) : kindIcon.collection,
      label: loc(c.name) || c.id,
    }),
    creatable: true,
  }

  const groups: KindGroupConfig<unknown>[] = [
    practiceConfig as KindGroupConfig<unknown>,
    prayerConfig as KindGroupConfig<unknown>,
    bookConfig as KindGroupConfig<unknown>,
    chapterConfig as KindGroupConfig<unknown>,
    collectionConfig as KindGroupConfig<unknown>,
  ]

  return (
    <>
      {groups.map((g) => (
        <KindGroup
          key={g.kind}
          config={g}
          onItemClick={(id, label) => openTab({ type: g.kind, id }, label)}
          onCreate={g.creatable ? () => onCreate(g.kind as CreateKind) : undefined}
        />
      ))}
    </>
  )
}

function KindGroup<T>({
  config,
  onItemClick,
  onCreate,
}: {
  config: KindGroupConfig<T>
  onItemClick: (id: string, label: string) => void
  onCreate?: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={`${styles.groupHeader} ${expanded ? styles.expanded : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={styles.groupChevron}>{expanded ? '▾' : '▸'}</span>
        <div className={styles.groupInfo}>
          <span className={styles.groupName}>{kindLabel[config.kind]}</span>
          <span className={styles.groupMeta}>{config.items.length}</span>
        </div>
        {onCreate && (
          <button
            type="button"
            className={styles.headerAddBtn}
            onClick={(e) => {
              e.stopPropagation()
              onCreate()
            }}
            title={`New ${config.kind}`}
          >
            +
          </button>
        )}
      </button>
      {expanded && (
        <div className={styles.contents}>
          {config.items.map((item) => {
            const r = config.toRow(item)
            return (
              <button
                type="button"
                key={r.id}
                className={styles.entityItem}
                onClick={() => onItemClick(r.id, r.label)}
              >
                <span className={styles.entityIcon}>{r.icon}</span>
                <span className={styles.entityName}>{r.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── By Collection view ──

function CollectionView({
  corpus,
  search,
  onCreate,
}: {
  corpus: LoadedCorpus
  search: string
  onCreate: (k: CreateKind) => void
}) {
  const refMap = useMemo(() => buildCorpusRefMap(corpus), [corpus])

  const collectedRefs = useMemo(() => {
    const s = new Set<string>()
    for (const c of corpus.collections) {
      for (const ref of collectionRefs(c)) s.add(ref)
    }
    return s
  }, [corpus.collections])

  const filteredCollections = corpus.collections.filter((c) => matches(search, c.id, loc(c.name)))

  const uncollected: CorpusItem[] = useMemo(() => {
    const out: CorpusItem[] = []
    for (const item of refMap.values()) {
      if (collectedRefs.has(item.ref)) continue
      if (!matches(search, item.id, item.label)) continue
      out.push(item)
    }
    return out.sort((a, b) => a.label.localeCompare(b.label))
  }, [refMap, collectedRefs, search])

  return (
    <>
      {filteredCollections.map((coll) => (
        <CollectionGroup key={coll.id} collection={coll} refMap={refMap} search={search} />
      ))}
      <UncollectedGroup items={uncollected} />
      <div className={styles.bottomActions}>
        <button type="button" className={styles.toolBtn} onClick={() => onCreate('collection')}>
          + New collection
        </button>
      </div>
    </>
  )
}

function CollectionGroup({
  collection,
  refMap,
  search,
}: {
  collection: CollectionManifest
  refMap: Map<string, CorpusItem>
  search: string
}) {
  const [expanded, setExpanded] = useState(false)
  const openTab = useWorkspace((s) => s.openTab)
  const collId = stripCollectionPrefix(collection.id)
  const refs = collectionRefs(collection)
  const resolved = refs
    .map((ref) => refMap.get(ref) ?? unresolvedItem(ref))
    .filter((r) => matches(search, r.id, r.label))

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={`${styles.groupHeader} ${expanded ? styles.expanded : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={styles.groupChevron}>{expanded ? '▾' : '▸'}</span>
        <div className={styles.groupInfo}>
          <span className={styles.groupName}>{loc(collection.name) || collId}</span>
          <span className={styles.groupMeta}>{refs.length} items</span>
        </div>
        <button
          type="button"
          className={styles.headerAddBtn}
          onClick={(e) => {
            e.stopPropagation()
            openTab({ type: 'collection', id: collId }, loc(collection.name) || collId)
          }}
          title="Edit collection"
        >
          ✎
        </button>
      </button>
      {expanded && (
        <div className={styles.contents}>
          {resolved.map((item) => (
            <button
              type="button"
              key={item.ref}
              className={styles.entityItem}
              onClick={() => openTab({ type: item.kind, id: item.id }, item.label)}
            >
              <span className={styles.entityIcon}>{item.icon}</span>
              <span className={styles.entityName}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UncollectedGroup({ items }: { items: CorpusItem[] }) {
  const [expanded, setExpanded] = useState(false)
  const openTab = useWorkspace((s) => s.openTab)

  if (items.length === 0) return null

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={`${styles.groupHeader} ${expanded ? styles.expanded : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={styles.groupChevron}>{expanded ? '▾' : '▸'}</span>
        <div className={styles.groupInfo}>
          <span className={styles.groupName}>Uncollected</span>
          <span className={styles.groupMeta}>{items.length} items</span>
        </div>
      </button>
      {expanded && (
        <div className={styles.contents}>
          {items.map((item) => (
            <button
              type="button"
              key={item.ref}
              className={styles.entityItem}
              onClick={() => openTab({ type: item.kind, id: item.id }, item.label)}
            >
              <span className={styles.entityIcon}>{item.icon}</span>
              <span className={styles.entityName}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Helpers ──

function unresolvedItem(ref: string): CorpusItem {
  const parsed = parseRef(ref)
  return {
    ref,
    kind: parsed?.kind ?? 'practice',
    id: parsed?.id ?? ref,
    label: ref,
    icon: '?',
  }
}

function stripCollectionPrefix(s: string): string {
  return s.replace(/^collection\//, '')
}
