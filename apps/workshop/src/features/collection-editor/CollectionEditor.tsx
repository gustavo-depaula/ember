import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Field, Section, TagInput } from '@/components/FormControls'
import { LocalizedInput } from '@/components/LocalizedInput'
import * as api from '@/fs/contentFs'
import { type CorpusItem, useCorpusRefMap } from '@/lib/corpus'
import { iconMap } from '@/lib/icons'
import { useWorkspace } from '@/stores/workspace'
import type {
  CollectionBlock,
  CollectionManifest,
  CollectionSection,
  LocalizedText,
} from '@/types/content'
import { AddItemDialog } from './AddItemDialog'
import styles from './CollectionEditor.module.css'

const DEPTH_CAP = 1 // 0 = top-level section, 1 = one nested level allowed

function newSubSection(): CollectionSection {
  return {
    id: `s-${Date.now().toString(36)}`,
    title: { 'en-US': 'New sub-section', 'pt-BR': 'Nova sub-seção' },
    blocks: [],
  }
}

export function CollectionEditor({ collectionId, tabId }: { collectionId: string; tabId: string }) {
  const queryClient = useQueryClient()
  const markDirty = useWorkspace((s) => s.markDirty)

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => api.getCollection(collectionId),
  })

  const [local, setLocal] = useState<CollectionManifest | undefined>()
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

  if (isLoading || !local) {
    return <div className={styles.loading}>Loading collection…</div>
  }

  const sections = local.sections

  function moveSection(idx: number, direction: -1 | 1) {
    update((prev) => {
      const next = [...prev.sections]
      const target = idx + direction
      if (target < 0 || target >= next.length) return prev
      const item = next[idx]
      if (!item) return prev
      next.splice(idx, 1)
      next.splice(target, 0, item)
      return { ...prev, sections: next }
    })
  }

  function addSection() {
    update((prev) => {
      const id = `s-${Date.now().toString(36)}`
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            id,
            title: { 'en-US': 'New section', 'pt-BR': 'Nova seção' },
            blocks: [],
          },
        ],
      }
    })
  }

  function removeSection(idx: number) {
    update((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }))
  }

  function updateSection(idx: number, next: CollectionSection) {
    update((prev) => {
      const list = [...prev.sections]
      list[idx] = next
      return { ...prev, sections: list }
    })
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

        <Section title="Prologue (markdown)">
          <LocalizedInput
            label="Prologue body (markdown, per language)"
            value={(local.prologue?.body ?? {}) as LocalizedText}
            onChange={(body) => {
              const text = body as LocalizedText
              const hasContent = Object.values(text).some((v) => v && v.trim().length > 0)
              update((prev) => ({
                ...prev,
                prologue: hasContent ? { body: text } : undefined,
              }))
            }}
            multiline
          />
        </Section>

        <Section title={`Sections (${sections.length})`}>
          <div className={styles.itemsHeader}>
            <button type="button" className={styles.addItemBtn} onClick={addSection}>
              + Add section
            </button>
          </div>
          {sections.length === 0 && (
            <p className={styles.empty}>No sections yet. Click "+ Add section" to create one.</p>
          )}
          {sections.map((section, idx) => (
            <SectionBlock
              key={section.id}
              section={section}
              depth={0}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
              onMove={(d) => moveSection(idx, d)}
              onRemove={() => removeSection(idx)}
              onChange={(next) => updateSection(idx, next)}
              existingRefs={collectExistingRefs(sections)}
            />
          ))}
        </Section>
      </div>
    </div>
  )
}

function collectExistingRefs(sections: CollectionSection[]): Set<string> {
  const out = new Set<string>()
  function walk(blocks: CollectionBlock[]): void {
    for (const b of blocks) {
      if (b.kind === 'item') out.add(b.ref)
      else if (b.kind === 'section') walk(b.blocks)
    }
  }
  for (const s of sections) walk(s.blocks)
  return out
}

function SectionBlock({
  section,
  depth,
  isFirst,
  isLast,
  onMove,
  onRemove,
  onChange,
  existingRefs,
}: {
  section: CollectionSection
  depth: number
  isFirst: boolean
  isLast: boolean
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onChange: (next: CollectionSection) => void
  existingRefs: Set<string>
}) {
  const [showAddItem, setShowAddItem] = useState(false)

  function addItemBlock(ref: string) {
    onChange({ ...section, blocks: [...section.blocks, { kind: 'item', ref }] })
    setShowAddItem(false)
  }

  function addSubSection() {
    onChange({ ...section, blocks: [...section.blocks, { kind: 'section', ...newSubSection() }] })
  }

  function addProseBlock() {
    onChange({
      ...section,
      blocks: [...section.blocks, { kind: 'prose', body: { body: {} } }],
    })
  }

  function moveBlock(idx: number, direction: -1 | 1) {
    const target = idx + direction
    if (target < 0 || target >= section.blocks.length) return
    const next = [...section.blocks]
    const item = next[idx]
    if (!item) return
    next.splice(idx, 1)
    next.splice(target, 0, item)
    onChange({ ...section, blocks: next })
  }

  function removeBlock(idx: number) {
    onChange({ ...section, blocks: section.blocks.filter((_, i) => i !== idx) })
  }

  function updateBlock(idx: number, next: CollectionBlock) {
    const list = [...section.blocks]
    list[idx] = next
    onChange({ ...section, blocks: list })
  }

  return (
    <div className={styles.sectionCard} style={{ marginLeft: depth > 0 ? '1rem' : undefined }}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderActions}>
          <button
            type="button"
            className={styles.itemBtn}
            onClick={() => onMove(-1)}
            disabled={isFirst}
            title="Move up"
          >
            ▲
          </button>
          <button
            type="button"
            className={styles.itemBtn}
            onClick={() => onMove(1)}
            disabled={isLast}
            title="Move down"
          >
            ▼
          </button>
          <button
            type="button"
            className={styles.itemBtnDanger}
            onClick={onRemove}
            title="Remove section"
          >
            ✕
          </button>
        </div>
      </div>
      <LocalizedInput
        label="Title"
        value={section.title as LocalizedText}
        onChange={(title) => onChange({ ...section, title: title as CollectionSection['title'] })}
      />
      <LocalizedInput
        label="Description (markdown, per language)"
        value={(section.description?.body ?? {}) as LocalizedText}
        onChange={(body) => {
          const text = body as LocalizedText
          const hasContent = Object.values(text).some((v) => v && v.trim().length > 0)
          onChange({ ...section, description: hasContent ? { body: text } : undefined })
        }}
        multiline
      />
      <Field label="Default collapsed">
        <input
          type="checkbox"
          checked={section.defaultCollapsed ?? false}
          onChange={(e) =>
            onChange({ ...section, defaultCollapsed: e.target.checked || undefined })
          }
        />
      </Field>

      <div className={styles.blocksHeader}>
        <span className={styles.blocksLabel}>Blocks ({section.blocks.length})</span>
        <div className={styles.blocksActions}>
          <button type="button" className={styles.addItemBtn} onClick={() => setShowAddItem(true)}>
            + Item
          </button>
          {depth < DEPTH_CAP && (
            <button type="button" className={styles.addItemBtn} onClick={addSubSection}>
              + Sub-section
            </button>
          )}
          <button type="button" className={styles.addItemBtn} onClick={addProseBlock}>
            + Prose
          </button>
        </div>
      </div>

      {section.blocks.length === 0 && (
        <p className={styles.empty}>Empty section. Add an item or sub-section.</p>
      )}

      {section.blocks.map((block, idx) => (
        <BlockRow
          // biome-ignore lint/suspicious/noArrayIndexKey: blocks are positional; refs may repeat
          key={idx}
          block={block}
          depth={depth}
          isFirst={idx === 0}
          isLast={idx === section.blocks.length - 1}
          onMove={(d) => moveBlock(idx, d)}
          onRemove={() => removeBlock(idx)}
          onChange={(next) => updateBlock(idx, next)}
          existingRefs={existingRefs}
        />
      ))}

      {showAddItem && (
        <AddItemDialog
          excludeRefs={existingRefs}
          onClose={() => setShowAddItem(false)}
          onPick={addItemBlock}
        />
      )}
    </div>
  )
}

function BlockRow({
  block,
  depth,
  isFirst,
  isLast,
  onMove,
  onRemove,
  onChange,
  existingRefs,
}: {
  block: CollectionBlock
  depth: number
  isFirst: boolean
  isLast: boolean
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onChange: (next: CollectionBlock) => void
  existingRefs: Set<string>
}) {
  if (block.kind === 'item') {
    return (
      <ItemBlockRow
        block={block}
        isFirst={isFirst}
        isLast={isLast}
        onMove={onMove}
        onRemove={onRemove}
        onChange={(next) => onChange({ kind: 'item', ...next })}
      />
    )
  }
  if (block.kind === 'section') {
    return (
      <SectionBlock
        section={block}
        depth={depth + 1}
        isFirst={isFirst}
        isLast={isLast}
        onMove={onMove}
        onRemove={onRemove}
        onChange={(next) => onChange({ kind: 'section', ...next })}
        existingRefs={existingRefs}
      />
    )
  }
  if (block.kind === 'prose') {
    return (
      <ProseBlockRow
        block={block}
        isFirst={isFirst}
        isLast={isLast}
        onMove={onMove}
        onRemove={onRemove}
        onChange={(next) => onChange({ kind: 'prose', body: next })}
      />
    )
  }
  return null
}

function ProseBlockRow({
  block,
  isFirst,
  isLast,
  onMove,
  onRemove,
  onChange,
}: {
  block: { kind: 'prose'; body: { body: LocalizedText } }
  isFirst: boolean
  isLast: boolean
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onChange: (next: { body: LocalizedText }) => void
}) {
  return (
    <div className={styles.proseBlock}>
      <div className={styles.proseBlockHeader}>
        <span className={styles.proseBlockLabel}>Prose block (markdown, per language)</span>
        <div className={styles.itemActions}>
          <button
            type="button"
            className={styles.itemBtn}
            onClick={() => onMove(-1)}
            disabled={isFirst}
            title="Move up"
          >
            ▲
          </button>
          <button
            type="button"
            className={styles.itemBtn}
            onClick={() => onMove(1)}
            disabled={isLast}
            title="Move down"
          >
            ▼
          </button>
          <button type="button" className={styles.itemBtnDanger} onClick={onRemove} title="Remove">
            ✕
          </button>
        </div>
      </div>
      <LocalizedInput
        label=""
        value={(block.body.body ?? {}) as LocalizedText}
        onChange={(body) => onChange({ body: body as LocalizedText })}
        multiline
      />
    </div>
  )
}

type ItemBlock = Extract<CollectionBlock, { kind: 'item' }>

function ItemBlockRow({
  block,
  isFirst,
  isLast,
  onMove,
  onRemove,
  onChange,
}: {
  block: ItemBlock
  isFirst: boolean
  isLast: boolean
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onChange: (next: Omit<ItemBlock, 'kind'>) => void
}) {
  const refMap = useCorpusRefMap()
  const resolved: CorpusItem | undefined = refMap.get(block.ref)
  const [showAnnotation, setShowAnnotation] = useState(
    () =>
      (block.annotation !== undefined && Object.keys(block.annotation).length > 0) ||
      (block.seeAlso !== undefined && block.seeAlso.length > 0),
  )
  const [showSeeAlsoPicker, setShowSeeAlsoPicker] = useState(false)
  const seeAlsoSet = useMemo(() => new Set(block.seeAlso ?? []), [block.seeAlso])

  function updateAnnotation(patch: Partial<NonNullable<ItemBlock['annotation']>>) {
    const next: Record<string, unknown> = { ...(block.annotation ?? {}), ...patch }
    // strip undefined / empty values so the JSON stays clean
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === null) continue
      if (typeof v === 'string' && v === '') continue
      if (typeof v === 'object' && Object.keys(v as object).length === 0) continue
      cleaned[k] = v
    }
    onChange({
      ref: block.ref,
      label: block.label,
      seeAlso: block.seeAlso,
      annotation:
        Object.keys(cleaned).length > 0 ? (cleaned as ItemBlock['annotation']) : undefined,
    })
  }

  function addSeeAlso(ref: string) {
    const next = [...(block.seeAlso ?? []), ref]
    onChange({
      ref: block.ref,
      label: block.label,
      annotation: block.annotation,
      seeAlso: next,
    })
    setShowSeeAlsoPicker(false)
  }

  function removeSeeAlso(ref: string) {
    const next = (block.seeAlso ?? []).filter((r) => r !== ref)
    onChange({
      ref: block.ref,
      label: block.label,
      annotation: block.annotation,
      seeAlso: next.length > 0 ? next : undefined,
    })
  }

  return (
    <>
      <div className={styles.itemRow}>
        <span className={styles.itemIcon}>{resolved?.icon ?? '?'}</span>
        <div className={styles.itemBody}>
          <span className={styles.itemLabel}>
            {resolved?.label ?? <em className={styles.unresolved}>Unresolved</em>}
          </span>
          <code className={styles.itemRef}>{block.ref}</code>
        </div>
        <div className={styles.itemActions}>
          <button
            type="button"
            className={styles.itemBtn}
            onClick={() => setShowAnnotation((v) => !v)}
            title="Annotation"
          >
            §
          </button>
          <button
            type="button"
            className={styles.itemBtn}
            onClick={() => onMove(-1)}
            disabled={isFirst}
            title="Move up"
          >
            ▲
          </button>
          <button
            type="button"
            className={styles.itemBtn}
            onClick={() => onMove(1)}
            disabled={isLast}
            title="Move down"
          >
            ▼
          </button>
          <button type="button" className={styles.itemBtnDanger} onClick={onRemove} title="Remove">
            ✕
          </button>
        </div>
      </div>
      {showAnnotation && (
        <div className={styles.annotationPanel}>
          <LocalizedInput
            label="Rubric"
            value={(block.annotation?.rubric ?? {}) as LocalizedText}
            onChange={(rubric) => updateAnnotation({ rubric: rubric as LocalizedText })}
          />
          <LocalizedInput
            label="Indulgence"
            value={(block.annotation?.indulgence ?? {}) as LocalizedText}
            onChange={(indulgence) => updateAnnotation({ indulgence: indulgence as LocalizedText })}
          />
          <LocalizedInput
            label="Attribution"
            value={(block.annotation?.attribution ?? {}) as LocalizedText}
            onChange={(attribution) =>
              updateAnnotation({ attribution: attribution as LocalizedText })
            }
          />
          <LocalizedInput
            label="Context"
            value={(block.annotation?.context ?? {}) as LocalizedText}
            onChange={(context) => updateAnnotation({ context: context as LocalizedText })}
          />
          <Field label="Recommended time">
            <select
              className={styles.input}
              value={block.annotation?.recommendedTime ?? ''}
              onChange={(e) =>
                updateAnnotation({
                  recommendedTime: (e.target.value || undefined) as
                    | 'morning'
                    | 'noon'
                    | 'evening'
                    | 'night'
                    | undefined,
                })
              }
            >
              <option value="">—</option>
              <option value="morning">Morning</option>
              <option value="noon">Noon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </Field>
          <Field label={`See also (${block.seeAlso?.length ?? 0})`}>
            <div className={styles.seeAlsoChips}>
              {(block.seeAlso ?? []).map((ref) => {
                const target = refMap.get(ref)
                return (
                  <span key={ref} className={styles.seeAlsoChip}>
                    <span className={styles.seeAlsoChipIcon}>{target?.icon ?? '?'}</span>
                    <span className={styles.seeAlsoChipLabel}>{target?.label ?? ref}</span>
                    <button
                      type="button"
                      className={styles.seeAlsoChipRemove}
                      onClick={() => removeSeeAlso(ref)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </span>
                )
              })}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => setShowSeeAlsoPicker(true)}
              >
                + Add
              </button>
            </div>
          </Field>
        </div>
      )}
      {showSeeAlsoPicker && (
        <AddItemDialog
          excludeRefs={seeAlsoSet}
          onClose={() => setShowSeeAlsoPicker(false)}
          onPick={addSeeAlso}
        />
      )}
    </>
  )
}
