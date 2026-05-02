/**
 * Core domain types for The Descendia tracker.
 */

/** The two Descendia variants. */
export type DescendiaVariant = 'normal' | 'steel_path'

/** A static stage definition (seeded once, shared across variants). */
export interface Stage {
  id: number              // 1–21
  isChoiceFloor: boolean  // true for stages 7 and 14
}

/**
 * The weekly condition record for a single stage + variant.
 * Mirrors the `weekly_conditions` table in Supabase.
 *
 * For normal stages (isChoiceFloor = false):
 *   - objective and reward are populated; choiceOptionA/B are null
 *   - penance is optional (some objectives don't have one)
 *   - reward may be null on specific stages
 *
 * For choice floors (stages 7 and 14):
 *   - choiceOptionA and choiceOptionB are populated
 *   - objective, penance, reward are null
 */
export interface WeeklyCondition {
  id: string                    // uuid
  stageId: number
  variant: DescendiaVariant
  forWeekStarting: string       // ISO date string, e.g. "2026-04-28"
  objective: string | null
  penance: string | null
  reward: string | null
  choiceOptionA: string | null
  choiceOptionB: string | null
  isLatest: boolean
  lastUpdated: string           // ISO timestamp
  submittedBy: string | null
}

/**
 * A stage paired with its current weekly condition for a specific variant.
 * Used as the primary view model for the tracker table.
 */
export interface StageWithCondition {
  stage: Stage
  condition: WeeklyCondition | null  // null if not yet submitted for this week
}
