import { BookViewer } from '@/features/library-manager/BookViewer'
import { PracticeEditor } from '@/features/practice-editor/PracticeEditor'
import { PrayerEditor } from '@/features/practice-editor/PrayerEditor'
import { useWorkspace } from '@/stores/workspace'

export function EditorPane() {
  const tab = useWorkspace((s) => s.tabs.find((t) => t.id === s.activeTabId))
  if (!tab) return null

  switch (tab.entity.type) {
    case 'practice':
      return (
        <PracticeEditor
          key={tab.id}
          libraryId={tab.libraryId}
          practiceId={tab.entity.id}
          tabId={tab.id}
        />
      )
    case 'prayer':
      return (
        <PrayerEditor
          key={tab.id}
          libraryId={tab.libraryId}
          prayerId={tab.entity.id}
          tabId={tab.id}
        />
      )
    case 'book':
      return <BookViewer key={tab.id} libraryId={tab.libraryId} bookId={tab.entity.id} />
    default:
      return <div style={{ padding: 24 }}>Editor not implemented for {tab.entity.type}</div>
  }
}
