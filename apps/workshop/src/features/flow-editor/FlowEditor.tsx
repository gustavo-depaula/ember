import { useState } from 'react'
import type { FlowDefinition, FlowSection } from '@/types/content'
import { FlowDataEditor } from './FlowDataEditor'
import styles from './FlowEditor.module.css'
import { FlowNodeForm } from './FlowNodeForm'
import { FlowPreview } from './FlowPreview'
import { FlowTree } from './FlowTree'

export function FlowEditor({
  libraryId,
  flow,
  onChange,
  showPreview,
}: {
  libraryId: string
  flow: FlowDefinition
  onChange: (f: FlowDefinition) => void
  showPreview: boolean
}) {
  const [selectedPath, setSelectedPath] = useState<number[] | undefined>()
  const [editingTopLevel, setEditingTopLevel] = useState<'data' | undefined>()

  // Paths alternate: [sectionIdx, groupIdx, sectionIdx, groupIdx, ...sectionIdx]
  // Each pair (sectionIdx, groupIdx) picks a node then selects which child group to enter.
  function walkPath(sections: FlowSection[], path: number[]): FlowSection[] {
    let current = sections
    let i = 0
    while (i < path.length - 1) {
      const sec = current[path[i] ?? 0]
      if (!sec) return current
      const groups = getChildGroups(sec)
      if (groups.length === 0) return current
      const groupIdx = path[i + 1]
      if (groupIdx === undefined || groupIdx >= groups.length) return current
      current = groups[groupIdx] ?? current
      i += 2
    }
    return current
  }

  function getSectionAt(path: number[]): FlowSection | undefined {
    const idx = path[path.length - 1]
    return idx !== undefined ? walkPath(flow.sections, path)[idx] : undefined
  }

  function applyAtPath(mutator: (sections: FlowSection[], idx: number) => void) {
    return (path: number[]) => {
      const idx = path[path.length - 1]
      if (idx === undefined) return
      const next = structuredClone(flow)
      const sections = walkPath(next.sections, path)
      mutator(sections, idx)
      onChange(next)
    }
  }

  function updateSectionAt(path: number[], section: FlowSection) {
    applyAtPath((sections, idx) => {
      sections[idx] = section
    })(path)
  }

  function insertAt(path: number[], section: FlowSection) {
    applyAtPath((sections, idx) => {
      sections.splice(idx, 0, section)
    })(path)
  }

  function removeAt(path: number[]) {
    applyAtPath((sections, idx) => {
      sections.splice(idx, 1)
    })(path)
    setSelectedPath(undefined)
  }

  function moveAt(path: number[], direction: -1 | 1) {
    const idx = path[path.length - 1]
    if (idx === undefined) return
    const next = structuredClone(flow)
    const sections = walkPath(next.sections, path)
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= sections.length) return
    const item = sections.splice(idx, 1)[0]
    if (!item) return
    sections.splice(targetIdx, 0, item)
    onChange(next)
    const newPath = [...path]
    newPath[newPath.length - 1] = targetIdx
    setSelectedPath(newPath)
  }

  const selectedSection = selectedPath ? getSectionAt(selectedPath) : undefined

  return (
    <div className={styles.container}>
      <div className={styles.treePane}>
        <div className={styles.treePaneHeader}>
          <span className={styles.treePaneTitle}>Flow Structure</span>
          <div className={styles.topLevelBtns}>
            {flow.data && (
              <button
                type="button"
                className={`${styles.topBtn} ${editingTopLevel === 'data' ? styles.topBtnActive : ''}`}
                onClick={() => setEditingTopLevel(editingTopLevel === 'data' ? undefined : 'data')}
              >
                Data
              </button>
            )}
            {flow.resolve && (
              <span className={styles.topBadge} title="Has resolve steps">
                Resolve
              </span>
            )}
            {flow.fragments && (
              <span className={styles.topBadge} title="Has fragments">
                Fragments
              </span>
            )}
          </div>
        </div>
        <div className={styles.treeScrollArea}>
          <FlowTree
            sections={flow.sections}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            onInsert={(path) => insertAt(path, { type: 'divider' })}
            onRemove={removeAt}
            onMove={moveAt}
          />
          <button
            type="button"
            className={styles.addRootBtn}
            onClick={() => insertAt([flow.sections.length], { type: 'divider' })}
          >
            + Add section
          </button>
        </div>
      </div>

      <div className={styles.editPane}>
        {editingTopLevel === 'data' && flow.data && (
          <FlowDataEditor data={flow.data} onChange={(data) => onChange({ ...flow, data })} />
        )}
        {!editingTopLevel && selectedSection && selectedPath && (
          <FlowNodeForm
            section={selectedSection}
            path={selectedPath}
            onChange={(sec) => updateSectionAt(selectedPath, sec)}
          />
        )}
        {!editingTopLevel && !selectedSection && (
          <div className={styles.placeholder}>Select a node from the tree to edit it</div>
        )}
      </div>

      {showPreview && (
        <div className={styles.previewPane}>
          <FlowPreview libraryId={libraryId} flow={flow} />
        </div>
      )}
    </div>
  )
}

// Must mirror FlowTree's getChildren — same group count, same order — so path
// indices from the tree map correctly to mutable section arrays.
function getChildGroups(sec: FlowSection): FlowSection[][] {
  switch (sec.type) {
    case 'select':
      return sec.options.map((opt) => (opt.sections ?? []) as FlowSection[])
    case 'options':
      if ('options' in sec && Array.isArray((sec as Record<string, unknown>).options)) {
        return (sec as { options: { sections: FlowSection[] }[] }).options.map((o) => o.sections)
      }
      if ('sections' in sec) return [(sec as { sections: FlowSection[] }).sections]
      return []
    case 'repeat':
      return [sec.sections]
    case 'prayer':
      if ('sections' in sec && Array.isArray((sec as Record<string, unknown>).sections)) {
        return [(sec as { sections: FlowSection[] }).sections]
      }
      return []
    case 'cycle':
      if (sec.sections) return [sec.sections]
      return []
    default:
      return []
  }
}
