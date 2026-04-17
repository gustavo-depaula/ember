import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type EntityRef =
  | { type: 'practice'; id: string }
  | { type: 'prayer'; id: string }
  | { type: 'book'; id: string }
  | { type: 'chapter'; id: string }

export type EditorTab = {
  id: string
  libraryId: string
  entity: EntityRef
  label: string
  dirty: boolean
}

type WorkspaceState = {
  selectedLibrary: string | undefined
  activeTabId: string | undefined
  tabs: EditorTab[]
}

type WorkspaceActions = {
  selectLibrary: (id: string | undefined) => void
  openTab: (libraryId: string, entity: EntityRef, label: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  markDirty: (tabId: string, dirty: boolean) => void
}

function makeTabId(libraryId: string, entity: EntityRef): string {
  return `${libraryId}:${entity.type}:${entity.id}`
}

export const useWorkspace = create<WorkspaceState & WorkspaceActions>()(
  immer((set) => ({
    selectedLibrary: undefined,
    activeTabId: undefined,
    tabs: [],

    selectLibrary: (id) =>
      set((s) => {
        s.selectedLibrary = id
      }),

    openTab: (libraryId, entity, label) =>
      set((s) => {
        const tabId = makeTabId(libraryId, entity)
        const existing = s.tabs.find((t) => t.id === tabId)
        if (!existing) {
          s.tabs.push({ id: tabId, libraryId, entity, label, dirty: false })
        }
        s.activeTabId = tabId
      }),

    closeTab: (tabId) =>
      set((s) => {
        const idx = s.tabs.findIndex((t) => t.id === tabId)
        if (idx === -1) return
        s.tabs.splice(idx, 1)
        if (s.activeTabId === tabId) {
          s.activeTabId = s.tabs[Math.min(idx, s.tabs.length - 1)]?.id
        }
      }),

    setActiveTab: (tabId) =>
      set((s) => {
        s.activeTabId = tabId
      }),

    markDirty: (tabId, dirty) =>
      set((s) => {
        const tab = s.tabs.find((t) => t.id === tabId)
        if (tab && tab.dirty !== dirty) tab.dirty = dirty
      }),
  })),
)
