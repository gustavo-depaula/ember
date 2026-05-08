import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import * as api from '@/fs/contentFs'
import { loc } from '@/lib/localize'
import { useWorkspace } from '@/stores/workspace'
import styles from './CreateItemDialog.module.css'

export type CreateKind = 'practice' | 'prayer' | 'collection'

const titleFor: Record<CreateKind, string> = {
  practice: 'New Practice',
  prayer: 'New Prayer',
  collection: 'New Collection',
}

export function CreateItemDialog({ kind, onClose }: { kind: CreateKind; onClose: () => void }) {
  const [mode, setMode] = useState<'blank' | 'clone'>('blank')
  const [id, setId] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [error, setError] = useState('')

  const queryClient = useQueryClient()
  const openTab = useWorkspace((s) => s.openTab)

  const { data: practices } = useQuery({
    queryKey: ['practices'],
    queryFn: api.listPractices,
    enabled: kind === 'practice' && mode === 'clone',
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (kind === 'practice') {
        return api.createPractice(
          id,
          mode === 'clone' && sourceId ? { fromPractice: sourceId } : undefined,
        )
      }
      if (kind === 'prayer') {
        return api.createPrayer(id)
      }
      return api.createCollection(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${kind}s`] })
      const label = id
      openTab({ type: kind, id }, label)
      onClose()
    },
    onError: (err) => setError(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id.trim()) {
      setError('ID is required')
      return
    }
    if (!/^[a-z0-9-]+$/.test(id)) {
      setError('ID must be lowercase kebab-case (a-z, 0-9, hyphens)')
      return
    }
    if (kind === 'practice' && mode === 'clone' && !sourceId) {
      setError('Select a source practice to clone')
      return
    }
    mutation.mutate()
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: modal overlay backdrop */
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <form
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className={styles.title}>{titleFor[kind]}</h3>

        {kind === 'practice' && (
          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === 'blank' ? styles.modeActive : ''}`}
              onClick={() => setMode('blank')}
            >
              Blank
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === 'clone' ? styles.modeActive : ''}`}
              onClick={() => setMode('clone')}
            >
              Clone Existing
            </button>
          </div>
        )}

        <label className={styles.label}>
          <span className={styles.labelText}>ID</span>
          <input
            className={styles.input}
            value={id}
            onChange={(e) => {
              setId(e.target.value)
              setError('')
            }}
            placeholder="e.g. evening-prayer"
          />
        </label>

        {kind === 'practice' && mode === 'clone' && (
          <label className={styles.label}>
            <span className={styles.labelText}>Source Practice</span>
            <select
              className={styles.input}
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
            >
              <option value="">Select practice…</option>
              {practices?.map((p) => (
                <option key={p.id} value={p.id}>
                  {loc(p.name)} ({p.id})
                </option>
              ))}
            </select>
          </label>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.createBtn} disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
