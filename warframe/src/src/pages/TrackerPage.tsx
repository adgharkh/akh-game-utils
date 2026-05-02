import React, { useState } from 'react'
import { useDescendiaTracker } from '../hooks/useDescendiaTracker'
import { ConditionTable } from '../components/ConditionTable'
import type { DescendiaVariant } from '../types/descendia'
import styles from './TrackerPage.module.css'

const VARIANTS: { value: DescendiaVariant; label: string }[] = [
  { value: 'normal',     label: 'Normal' },
  { value: 'steel_path', label: 'Steel Path' },
]

/**
 * Main public page — shows the current week's Descendia conditions.
 * Tabs switch between Normal and Steel Path variants.
 *
 * Future additions that slot in cleanly here:
 * - <WeeklyCountdown /> component using msUntilNextReset() from weekUtils
 * - Week selector for browsing history
 * - Admin submit button (conditionally rendered if authed)
 */
export function TrackerPage() {
  const [variant, setVariant] = useState<DescendiaVariant>('normal')
  const { data, weekStartISO, loading, error } = useDescendiaTracker(variant)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>The Descendia</h1>
        <p className={styles.subtitle}>
          Community condition tracker &mdash; week of{' '}
          <strong>{weekStartISO}</strong>
        </p>
        {/* TODO: <WeeklyCountdown /> */}
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Descendia variant">
        {VARIANTS.map(({ value, label }) => (
          <button
            key={value}
            role="tab"
            aria-selected={variant === value}
            className={`${styles.tab} ${variant === value ? styles.tabActive : ''}`}
            onClick={() => setVariant(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className={styles.content} role="tabpanel">
        {loading && <p className={styles.status}>Loading conditions…</p>}
        {error && (
          <p className={styles.error}>
            Failed to load conditions: {error}
          </p>
        )}
        {!loading && !error && data.length === 0 && (
          <p className={styles.status}>No stage data found.</p>
        )}
        {!loading && !error && data.length > 0 && (
          <ConditionTable rows={data} />
        )}
      </section>
    </main>
  )
}
