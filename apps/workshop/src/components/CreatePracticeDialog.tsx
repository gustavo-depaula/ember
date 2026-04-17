import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import * as api from '@/fs/contentFs'
import { loc } from '@/lib/localize'
import { useWorkspace } from '@/stores/workspace'
import styles from './CreatePracticeDialog.module.css'

export function CreatePracticeDialog({
  libraryId,
  onClose,
}: {
  libraryId: string
  onClose: () => void
}) {
  const [mode, setMode] = useState<'blank' | 'clone'>('blank')
  const [practiceId, setPracticeId] = useState('')
  const [sourceLib, setSourceLib] = useState('')
  const [sourcePractice, setSourcePractice] = useState('')
  const [error, setError] = useState('')

  const queryClient = useQueryClient()
  const openTab = useWorkspace((s) => s.openTab)

  const { data: libraries } = useQuery({
    queryKey: ['libraries'],
    queryFn: api.listLibraries,
  })

  const { data: sourceLibDetail } = useQuery({
    queryKey: ['library', sourceLib],
    queryFn: () => api.getLibrary(sourceLib),
    enabled: mode === 'clone' && sourceLib.length > 0,
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.createPractice(
        libraryId,
        practiceId,
        mode === 'clone' ? { fromLibrary: sourceLib, fromPractice: sourcePractice } : undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', libraryId] })
      openTab(libraryId, { type: 'practice', id: practiceId }, practiceId)
      onClose()
    },
    onError: (err) => setError(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!practiceId.trim()) {
      setError('Practice ID is required')
      return
    }
    if (!/^[a-z0-9-]+$/.test(practiceId)) {
      setError('ID must be lowercase kebab-case (a-z, 0-9, hyphens)')
      return
    }
    if (mode === 'clone' && (!sourceLib || !sourcePractice)) {
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
        <h3 className={styles.title}>New Practice</h3>

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

        <label className={styles.label}>
          <span className={styles.labelText}>Practice ID</span>
          <input
            className={styles.input}
            value={practiceId}
            onChange={(e) => {
              setPracticeId(e.target.value)
              setError('')
            }}
            placeholder="e.g. evening-prayer"
          />
        </label>

        {mode === 'clone' && (
          <>
            <label className={styles.label}>
              <span className={styles.labelText}>Source Library</span>
              <select
                className={styles.input}
                value={sourceLib}
                onChange={(e) => {
                  setSourceLib(e.target.value)
                  setSourcePractice('')
                }}
              >
                <option value="">Select library...</option>
                {libraries?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {loc(l.name)} ({l.id})
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Source Practice</span>
              <select
                className={styles.input}
                value={sourcePractice}
                onChange={(e) => setSourcePractice(e.target.value)}
                disabled={!sourceLibDetail}
              >
                <option value="">Select practice...</option>
                {sourceLibDetail?._practices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {loc(p.name)} ({p.id})
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.createBtn} disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
