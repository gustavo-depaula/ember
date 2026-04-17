import { EditorPane } from '@/components/EditorPane'
import { Sidebar } from '@/components/Sidebar'
import { TabBar } from '@/components/TabBar'
import { WelcomePane } from '@/components/WelcomePane'
import { useWorkspace } from '@/stores/workspace'
import styles from './App.module.css'

export function App() {
  const activeTabId = useWorkspace((s) => s.activeTabId)

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <TabBar />
        <div className={styles.content}>{activeTabId ? <EditorPane /> : <WelcomePane />}</div>
      </div>
    </div>
  )
}
