import { useState } from 'react'
import type { LocalizedText } from '@/types/content'
import styles from './LocalizedInput.module.css'

const languages = ['en-US', 'pt-BR', 'la'] as const

export function LocalizedInput({
  value,
  onChange,
  multiline = false,
  label,
}: {
  value: LocalizedText
  onChange: (val: LocalizedText) => void
  multiline?: boolean
  label?: string
}) {
  const [activeLang, setActiveLang] = useState<string>('en-US')

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.langTabs}>
        {languages.map((lang) => {
          const hasContent = Boolean(value[lang]?.trim())
          return (
            <button
              key={lang}
              type="button"
              className={`${styles.langTab} ${activeLang === lang ? styles.active : ''} ${hasContent ? styles.filled : ''}`}
              onClick={() => setActiveLang(lang)}
            >
              {lang}
            </button>
          )
        })}
      </div>
      {multiline ? (
        <textarea
          className={styles.textarea}
          value={value[activeLang] ?? ''}
          onChange={(e) => onChange({ ...value, [activeLang]: e.target.value })}
          rows={4}
          placeholder={`${activeLang} text...`}
        />
      ) : (
        <input
          className={styles.input}
          value={value[activeLang] ?? ''}
          onChange={(e) => onChange({ ...value, [activeLang]: e.target.value })}
          placeholder={`${activeLang} text...`}
        />
      )}
    </div>
  )
}

export function LocalizedDisplay({ value }: { value: LocalizedText }) {
  const text = value['en-US'] ?? value['pt-BR'] ?? Object.values(value)[0] ?? ''
  const secondary = value['en-US'] ? value['pt-BR'] : undefined

  return (
    <div className={styles.display}>
      <span>{text}</span>
      {secondary && <span className={styles.secondary}>{secondary}</span>}
    </div>
  )
}
