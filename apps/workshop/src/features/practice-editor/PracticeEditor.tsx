import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '@/fs/contentFs'
import { useWorkspace } from '@/stores/workspace'
import type { FlowDefinition, PracticeManifest } from '@/types/content'
import { FlowEditor } from '../flow-editor/FlowEditor'
import { ManifestForm } from './ManifestForm'
import styles from './PracticeEditor.module.css'

type EditorView = 'manifest' | 'flow' | 'preview'

export function PracticeEditor({
  libraryId,
  practiceId,
  tabId,
}: {
  libraryId: string
  practiceId: string
  tabId: string
}) {
  const [view, setView] = useState<EditorView>('manifest')
  const markDirty = useWorkspace((s) => s.markDirty)
  const queryClient = useQueryClient()

  const { data: manifest, isLoading: manifestLoading } = useQuery({
    queryKey: ['manifest', libraryId, practiceId],
    queryFn: () => api.getManifest(libraryId, practiceId),
  })

  const { data: flow, isLoading: flowLoading } = useQuery({
    queryKey: ['flow', libraryId, practiceId],
    queryFn: () => api.getFlow(libraryId, practiceId),
  })

  const [localManifest, setLocalManifest] = useState<PracticeManifest | undefined>()
  const [localFlow, setLocalFlow] = useState<FlowDefinition | undefined>()
  const dirty = useRef(false)

  // Sync from server data — reset local state when query data changes (initial load + post-save refetch)
  useEffect(() => {
    if (manifest) {
      setLocalManifest(manifest)
      dirty.current = false
      markDirty(tabId, false)
    }
  }, [manifest, markDirty, tabId])

  useEffect(() => {
    if (flow) {
      setLocalFlow(flow)
      dirty.current = false
      markDirty(tabId, false)
    }
  }, [flow, markDirty, tabId])

  const handleManifestChange = useCallback(
    (m: PracticeManifest) => {
      setLocalManifest(m)
      dirty.current = true
      markDirty(tabId, true)
    },
    [markDirty, tabId],
  )

  const handleFlowChange = useCallback(
    (f: FlowDefinition) => {
      setLocalFlow(f)
      dirty.current = true
      markDirty(tabId, true)
    },
    [markDirty, tabId],
  )

  const saveManifestMut = useMutation({
    mutationFn: (m: PracticeManifest) => api.saveManifest(libraryId, practiceId, m),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manifest', libraryId, practiceId] })
      queryClient.invalidateQueries({ queryKey: ['library', libraryId] })
    },
  })

  const saveFlowMut = useMutation({
    mutationFn: (f: FlowDefinition) => api.saveFlow(libraryId, practiceId, f),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow', libraryId, practiceId] })
    },
  })

  const handleSave = useCallback(() => {
    if (!dirty.current) return
    if (localManifest) saveManifestMut.mutate(localManifest)
    if (localFlow) saveFlowMut.mutate(localFlow)
  }, [localManifest, localFlow, saveManifestMut, saveFlowMut])

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

  if (manifestLoading || flowLoading) {
    return <div className={styles.loading}>Loading practice...</div>
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div className={styles.viewTabs}>
          <button
            type="button"
            className={`${styles.viewTab} ${view === 'manifest' ? styles.activeView : ''}`}
            onClick={() => setView('manifest')}
          >
            Manifest
          </button>
          <button
            type="button"
            className={`${styles.viewTab} ${view === 'flow' ? styles.activeView : ''}`}
            onClick={() => setView('flow')}
          >
            Flow
          </button>
          <button
            type="button"
            className={`${styles.viewTab} ${view === 'preview' ? styles.activeView : ''}`}
            onClick={() => setView('preview')}
          >
            Preview
          </button>
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.practiceId}>{practiceId}</span>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saveManifestMut.isPending || saveFlowMut.isPending}
          >
            {saveManifestMut.isPending || saveFlowMut.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {view === 'manifest' && localManifest && (
          <ManifestForm manifest={localManifest} onChange={handleManifestChange} />
        )}
        {(view === 'flow' || view === 'preview') && localFlow && (
          <FlowEditor
            libraryId={libraryId}
            flow={localFlow}
            onChange={handleFlowChange}
            showPreview={view === 'preview'}
          />
        )}
      </div>
    </div>
  )
}
