import { supabase } from './supabaseClient'
import type { DescendiaVariant, Stage, WeeklyCondition } from '../types/descendia'

// ---------------------------------------------------------------------------
// Stages (static data — shared across variants, cache-friendly)
// ---------------------------------------------------------------------------

export async function fetchStages(): Promise<Stage[]> {
  const { data, error } = await supabase
    .from('stages')
    .select('id, is_choice_floor')
    .order('id')

  if (error) throw new Error(`fetchStages: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id as number,
    isChoiceFloor: row.is_choice_floor as boolean,
  }))
}

// ---------------------------------------------------------------------------
// Weekly conditions
// ---------------------------------------------------------------------------

/**
 * Fetches the latest conditions for all stages for a given week and variant.
 * @param weekStartISO  ISO date string, e.g. "2026-04-28"
 * @param variant       'normal' or 'steel_path'
 */
export async function fetchConditionsForWeek(
  weekStartISO: string,
  variant: DescendiaVariant,
): Promise<WeeklyCondition[]> {
  const { data, error } = await supabase
    .from('weekly_conditions')
    .select('*')
    .eq('for_week_starting', weekStartISO)
    .eq('variant', variant)
    .eq('is_latest', true)
    .order('stage_id')

  if (error) throw new Error(`fetchConditionsForWeek: ${error.message}`)

  return (data ?? []).map(rowToCondition)
}

// ---------------------------------------------------------------------------
// Admin writes (requires service role key — call from a secure context only)
// ---------------------------------------------------------------------------

/**
 * Upserts a condition for a stage/variant/week.
 * Marks any existing is_latest row for that stage+variant+week as stale,
 * then inserts the new row as is_latest = true.
 *
 * NOTE: This must be called with a Supabase client authenticated with the
 * service role key, not the anon key. Do not call this from the public
 * frontend bundle.
 */
export async function upsertCondition(
  condition: Omit<WeeklyCondition, 'id' | 'isLatest' | 'lastUpdated'>,
  adminClient: typeof supabase,
): Promise<void> {
  // 1. Mark existing latest row(s) for this stage+variant+week as stale
  const { error: staleError } = await adminClient
    .from('weekly_conditions')
    .update({ is_latest: false })
    .eq('stage_id', condition.stageId)
    .eq('variant', condition.variant)
    .eq('for_week_starting', condition.forWeekStarting)
    .eq('is_latest', true)

  if (staleError) throw new Error(`upsertCondition (stale): ${staleError.message}`)

  // 2. Insert the new row
  const { error: insertError } = await adminClient
    .from('weekly_conditions')
    .insert({
      stage_id: condition.stageId,
      variant: condition.variant,
      for_week_starting: condition.forWeekStarting,
      objective: condition.objective ?? null,
      penance: condition.penance ?? null,
      reward: condition.reward ?? null,
      choice_option_a: condition.choiceOptionA ?? null,
      choice_option_b: condition.choiceOptionB ?? null,
      is_latest: true,
      submitted_by: condition.submittedBy ?? null,
    })

  if (insertError) throw new Error(`upsertCondition (insert): ${insertError.message}`)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function rowToCondition(row: Record<string, unknown>): WeeklyCondition {
  return {
    id: row.id as string,
    stageId: row.stage_id as number,
    variant: row.variant as DescendiaVariant,
    forWeekStarting: row.for_week_starting as string,
    objective: (row.objective as string | null) ?? null,
    penance: (row.penance as string | null) ?? null,
    reward: (row.reward as string | null) ?? null,
    choiceOptionA: (row.choice_option_a as string | null) ?? null,
    choiceOptionB: (row.choice_option_b as string | null) ?? null,
    isLatest: row.is_latest as boolean,
    lastUpdated: row.last_updated as string,
    submittedBy: (row.submitted_by as string | null) ?? null,
  }
}
