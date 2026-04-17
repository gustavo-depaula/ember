import { useWorkspace } from '@/stores/workspace'
import styles from './TabBar.module.css'

export function TabBar() {
  const tabs = useWorkspace((s) => s.tabs)
  const activeTabId = useWorkspace((s) => s.activeTabId)
  const setActiveTab = useWorkspace((s) => s.setActiveTab)
  const closeTab = useWorkspace((s) => s.closeTab)

  if (tabs.length === 0) return null

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={`${styles.tab} ${tab.id === activeTabId ? styles.active : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className={styles.tabType}>{tab.entity.type}</span>
          <span className={styles.tabLabel}>
            {tab.dirty && <span className={styles.dot} />}
            {tab.label}
          </span>
          <button
            type="button"
            className={styles.tabClose}
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
          >
            ×
          </button>
        </button>
      ))}
    </div>
  )
}
