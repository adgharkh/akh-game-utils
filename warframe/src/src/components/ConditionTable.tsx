import React from 'react'
import type { StageWithCondition } from '../types/descendia'
import styles from './ConditionTable.module.css'

interface Props {
  rows: StageWithCondition[]
}

/**
 * Renders the full 21-stage condition table for the current week.
 *
 * Stages 7 and 14 (choice floors) render a special two-option reward row.
 * All other stages render objective / penance / reward columns.
 *
 * Designed to be easy to extend:
 * - Add tooltips by wrapping cell content in a <Tooltip> component
 * - Add icons by mapping objective/penance strings to image assets
 * - Add a countdown timer in the parent page, not here
 */
export function ConditionTable({ rows }: Props) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stageCol}>Stage</th>
            <th>Objective</th>
            <th>Penance</th>
            <th>Reward</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ stage, condition }) => {
            const stageLabel = stage.id

            if (stage.isChoiceFloor) {
              return (
                <tr key={stage.id} className={styles.choiceFloor}>
                  <td className={styles.stageCol}>{stageLabel}</td>
                  <td colSpan={2} className={styles.choiceLabel}>
                    Choice Floor
                  </td>
                  <td>
                    {condition ? (
                      <span className={styles.choiceOptions}>
                        <span className={styles.optionA}>
                          {condition.choiceOptionA ?? '—'}
                        </span>
                        <span className={styles.orDivider}>or</span>
                        <span className={styles.optionB}>
                          {condition.choiceOptionB ?? '—'}
                        </span>
                      </span>
                    ) : (
                      <span className={styles.unknown}>Not yet submitted</span>
                    )}
                  </td>
                </tr>
              )
            }

            return (
              <tr key={stage.id}>
                <td className={styles.stageCol}>{stageLabel}</td>
                <td>
                  {condition?.objective ?? (
                    <span className={styles.unknown}>—</span>
                  )}
                </td>
                <td>
                  {condition?.penance ?? (
                    <span className={styles.none}>None</span>
                  )}
                </td>
                <td>
                  {condition?.reward ?? (
                    <span className={styles.unknown}>—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
