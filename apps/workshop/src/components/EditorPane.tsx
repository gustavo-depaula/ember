import { BookViewer } from '@/features/book-viewer/BookViewer'
import { CollectionEditor } from '@/features/collection-editor/CollectionEditor'
import { PracticeEditor } from '@/features/practice-editor/PracticeEditor'
import { PrayerEditor } from '@/features/practice-editor/PrayerEditor'
import { TranslationReview } from '@/features/translation-review/TranslationReview'
import { useWorkspace } from '@/stores/workspace'

export function EditorPane() {
  const tab = useWorkspace((s) => s.tabs.find((t) => t.id === s.activeTabId))
  if (!tab) return null

  switch (tab.entity.type) {
    case 'practice':
      return <PracticeEditor key={tab.id} practiceId={tab.entity.id} tabId={tab.id} />
    case 'prayer':
      return <PrayerEditor key={tab.id} prayerId={tab.entity.id} tabId={tab.id} />
    case 'book':
      return <BookViewer key={tab.id} bookId={tab.entity.id} />
    case 'collection':
      return <CollectionEditor key={tab.id} collectionId={tab.entity.id} tabId={tab.id} />
    case 'translation-review':
      return (
        <TranslationReview
          key={tab.id}
          initial={tab.entity.id !== 'main' ? { bookId: tab.entity.id } : undefined}
        />
      )
    default:
      return <div style={{ padding: 24 }}>Editor not implemented for {tab.entity.type}</div>
  }
}
