import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type EntityRef =
  | { type: 'practice'; id: string }
  | { type: 'prayer'; id: string }
  | { type: 'book'; id: string }
  | { type: 'chapter'; id: string }
  | { type: 'collection'; id: string }
  | { type: 'translation-review'; id: string }

export type EditorTab = {
  id: string
  entity: EntityRef
  label: string
  dirty: boolean
}

export type SidebarView = 'kind' | 'collection'

type WorkspaceState = {
  activeTabId: string | undefined
  tabs: EditorTab[]
  sidebarView: SidebarView
}

type WorkspaceActions = {
  openTab: (entity: EntityRef, label: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  markDirty: (tabId: string, dirty: boolean) => void
  setSidebarView: (view: SidebarView) => void
}

function makeTabId(entity: EntityRef): string {
  return `${entity.type}:${entity.id}`
}

export const useWorkspace = create<WorkspaceState & WorkspaceActions>()(
  immer((set) => ({
    activeTabId: undefined,
    tabs: [],
    sidebarView: 'kind',

    openTab: (entity, label) =>
      set((s) => {
        const tabId = makeTabId(entity)
        const existing = s.tabs.find((t) => t.id === tabId)
        if (!existing) {
          s.tabs.push({ id: tabId, entity, label, dirty: false })
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

    setSidebarView: (view) =>
      set((s) => {
        s.sidebarView = view
      }),
  })),
)
