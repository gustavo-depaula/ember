import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Field, Section, TagInput } from '@/components/FormControls'
import { LocalizedInput } from '@/components/LocalizedInput'
import * as api from '@/fs/contentFs'
import { type CorpusItem, useCorpusRefMap } from '@/lib/corpus'
import { iconMap } from '@/lib/icons'
import { useWorkspace } from '@/stores/workspace'
import type { CollectionItemRef, CollectionManifest, LocalizedText } from '@/types/content'
import { AddItemDialog } from './AddItemDialog'
import styles from './CollectionEditor.module.css'

export function CollectionEditor({ collectionId, tabId }: { collectionId: string; tabId: string }) {
  const queryClient = useQueryClient()
  const markDirty = useWorkspace((s) => s.markDirty)

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => api.getCollection(collectionId),
  })

  const [local, setLocal] = useState<CollectionManifest | undefined>()
  const [showAdd, setShowAdd] = useState(false)
  const dirty = useRef(false)

  useEffect(() => {
    if (collection) {
      setLocal(collection)
      dirty.current = false
      markDirty(tabId, false)
    }
  }, [collection, markDirty, tabId])

  const update = useCallback(
    (updater: (prev: CollectionManifest) => CollectionManifest) => {
      setLocal((prev) => {
        if (!prev) return prev
        dirty.current = true
        markDirty(tabId, true)
        return updater(prev)
      })
    },
    [markDirty, tabId],
  )

  const saveMut = useMutation({
    mutationFn: (m: CollectionManifest) => api.saveCollection(collectionId, m),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  const handleSave = useCallback(() => {
    if (!dirty.current || !local) return
    saveMut.mutate(local)
  }, [local, saveMut])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave])

  const existingRefs = useMemo(
    () => new Set((local?.items ?? []).map((i) => i.ref)),
    [local?.items],
  )

  if (isLoading || !local) {
    return <div className={styles.loading}>Loading collection…</div>
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <span className={styles.id}>{local.id}</span>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saveMut.isPending}
        >
          {saveMut.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className={styles.body}>
        <Section title="Identity">
          <LocalizedInput
            label="Name"
            value={local.name as LocalizedText}
            onChange={(name) =>
              update((prev) => ({ ...prev, name: name as CollectionManifest['name'] }))
            }
          />
          <LocalizedInput
            label="Description"
            value={(local.description ?? {}) as LocalizedText}
            onChange={(description) =>
              update((prev) => ({
                ...prev,
                description: description as CollectionManifest['description'],
              }))
            }
            multiline
          />
          <Field label="Icon">
            <div className={styles.iconRow}>
              <input
                className={styles.input}
                value={local.icon ?? ''}
                onChange={(e) => update((prev) => ({ ...prev, icon: e.target.value || undefined }))}
                placeholder="e.g. mary, cross, dove"
              />
              {local.icon && (
                <span className={styles.iconPreview}>{iconMap[local.icon] ?? '?'}</span>
              )}
            </div>
          </Field>
        </Section>

        <Section title="Languages">
          <TagInput
            values={local.languages ?? []}
            onChange={(languages) =>
              update((prev) => ({
                ...prev,
                languages: languages.length > 0 ? languages : undefined,
              }))
            }
            placeholder="Add language… (e.g. en-US)"
          />
        </Section>

        <Section title="Tags">
          <TagInput
            values={local.tags ?? []}
            onChange={(tags) =>
              update((prev) => ({ ...prev, tags: tags.length > 0 ? tags : undefined }))
            }
            placeholder="Add tag…"
          />
        </Section>

        <Section title={`Items (${local.items.length})`}>
          <div className={styles.itemsHeader}>
            <button type="button" className={styles.addItemBtn} onClick={() => setShowAdd(true)}>
              + Add item
            </button>
          </div>
          <ItemsList
            items={local.items}
            onChange={(items) => update((prev) => ({ ...prev, items }))}
          />
        </Section>
      </div>

      {showAdd && (
        <AddItemDialog
          excludeRefs={existingRefs}
          onClose={() => setShowAdd(false)}
          onPick={(ref) => {
            update((prev) => ({ ...prev, items: [...prev.items, { ref }] }))
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}

function ItemsList({
  items,
  onChange,
}: {
  items: CollectionItemRef[]
  onChange: (items: CollectionItemRef[]) => void
}) {
  const refMap = useCorpusRefMap()

  function move(idx: number, direction: -1 | 1) {
    const target = idx + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const item = next[idx]
    if (!item) return
    next.splice(idx, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }

  if (items.length === 0) {
    return <p className={styles.empty}>No items. Click "+ Add item" to add one.</p>
  }

  return (
    <ul className={styles.itemsList}>
      {items.map((item, idx) => {
        const resolved: CorpusItem | undefined = refMap.get(item.ref)
        return (
          <li key={item.ref} className={styles.itemRow}>
            <span className={styles.itemIcon}>{resolved?.icon ?? '?'}</span>
            <div className={styles.itemBody}>
              <span className={styles.itemLabel}>
                {resolved?.label ?? <em className={styles.unresolved}>Unresolved</em>}
              </span>
              <code className={styles.itemRef}>{item.ref}</code>
            </div>
            <div className={styles.itemActions}>
              <button
                type="button"
                className={styles.itemBtn}
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                title="Move up"
              >
                ▲
              </button>
              <button
                type="button"
                className={styles.itemBtn}
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                title="Move down"
              >
                ▼
              </button>
              <button
                type="button"
                className={styles.itemBtnDanger}
                onClick={() => remove(idx)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
