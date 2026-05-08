import styles from './WelcomePane.module.css'

export function WelcomePane() {
  return (
    <div className={styles.welcome}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Ember Workshop</h2>
        <p className={styles.subtitle}>Corpus Editor</p>
        <div className={styles.hint}>
          <p>Browse the sidebar by kind or by collection.</p>
          <p>
            Click on a practice, prayer, book, chapter, or collection to open it in an editor tab.
          </p>
        </div>
        <div className={styles.shortcuts}>
          <div className={styles.shortcut}>
            <kbd>Cmd+S</kbd>
            <span>Save current file</span>
          </div>
        </div>
      </div>
    </div>
  )
}
