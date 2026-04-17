import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LocalizedInput } from '@/components/LocalizedInput'
import * as api from '@/fs/contentFs'
import { useWorkspace } from '@/stores/workspace'
import type { LocalizedText, PrayerAsset } from '@/types/content'
import styles from './PrayerEditor.module.css'

export function PrayerEditor({
  libraryId,
  prayerId,
  tabId,
}: {
  libraryId: string
  prayerId: string
  tabId: string
}) {
  const markDirty = useWorkspace((s) => s.markDirty)
  const queryClient = useQueryClient()

  const { data: prayer, isLoading } = useQuery({
    queryKey: ['prayer', libraryId, prayerId],
    queryFn: () => api.getPrayer(libraryId, prayerId),
  })

  const [local, setLocal] = useState<PrayerAsset | undefined>()
  const dirty = useRef(false)

  useEffect(() => {
    if (prayer) {
      setLocal(prayer)
      dirty.current = false
      markDirty(tabId, false)
    }
  }, [prayer, markDirty, tabId])

  const handleChange = useCallback(
    (updater: (prev: PrayerAsset) => PrayerAsset) => {
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
    mutationFn: (p: PrayerAsset) => api.savePrayer(libraryId, prayerId, p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer', libraryId, prayerId] })
      queryClient.invalidateQueries({ queryKey: ['library', libraryId] })
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

  if (isLoading || !local) {
    return <div className={styles.loading}>Loading prayer...</div>
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <span className={styles.id}>{prayerId}</span>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saveMut.isPending}
        >
          {saveMut.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className={styles.body}>
        <LocalizedInput
          label="Title"
          value={local.title as LocalizedText}
          onChange={(title) =>
            handleChange((prev) => ({ ...prev, title: title as PrayerAsset['title'] }))
          }
        />

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Body</h3>
          {Array.isArray(local.body) ? (
            <p className={styles.hint}>
              This prayer has {local.body.length} flow sections. Edit the raw body in flow.json or
              through a practice that references it.
            </p>
          ) : (
            <textarea
              className={styles.textarea}
              value={local.body}
              onChange={(e) => handleChange((prev) => ({ ...prev, body: e.target.value }))}
              rows={12}
            />
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Raw JSON</h3>
          <pre className={styles.json}>{JSON.stringify(local, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
