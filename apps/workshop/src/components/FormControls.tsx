import styles from './FormControls.module.css'

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className={styles.section}>
      <legend className={styles.sectionTitle}>{title}</legend>
      <div className={styles.sectionBody}>{children}</div>
    </fieldset>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </div>
  )
}

export function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = e.currentTarget.value.trim()
      if (val && !values.includes(val)) {
        onChange([...values, val])
        e.currentTarget.value = ''
      }
    }
  }

  return (
    <div className={styles.tagContainer}>
      <div className={styles.tags}>
        {values.map((v) => (
          <span key={v} className={styles.tag}>
            {v}
            <button
              type="button"
              className={styles.tagRemove}
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input className={styles.tagInput} placeholder={placeholder} onKeyDown={handleKeyDown} />
    </div>
  )
}
