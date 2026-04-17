import styles from './WelcomePane.module.css'

export function WelcomePane() {
  return (
    <div className={styles.welcome}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Ember Workshop</h2>
        <p className={styles.subtitle}>Library Manager & Practice Editor</p>
        <div className={styles.hint}>
          <p>Select a library from the sidebar to browse its contents.</p>
          <p>Click on a practice, prayer, or book to open it in an editor tab.</p>
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
