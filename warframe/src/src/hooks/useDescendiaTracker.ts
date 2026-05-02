import { useEffect, useState } from 'react'
import { fetchStages, fetchConditionsForWeek } from '../lib/descendiaApi'
import { getCurrentWeekStartISO } from '../lib/weekUtils'
import type { DescendiaVariant, StageWithCondition } from '../types/descendia'

interface TrackerState {
  data: StageWithCondition[]
  weekStartISO: string
  loading: boolean
  error: string | null
}

/**
 * Fetches all stages and their current-week conditions for a given variant,
 * joined together into StageWithCondition rows.
 *
 * Re-fetches automatically when variant or the current week changes.
 */
export function useDescendiaTracker(variant: DescendiaVariant): TrackerState {
  const weekStartISO = getCurrentWeekStartISO()

  const [state, setState] = useState<TrackerState>({
    data: [],
    weekStartISO,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const [stages, conditions] = await Promise.all([
          fetchStages(),
          fetchConditionsForWeek(weekStartISO, variant),
        ])

        if (cancelled) return

        // Join conditions onto stages by stageId
        const conditionMap = new Map(conditions.map((c) => [c.stageId, c]))

        const joined: StageWithCondition[] = stages.map((stage) => ({
          stage,
          condition: conditionMap.get(stage.id) ?? null,
        }))

        setState({ data: joined, weekStartISO, loading: false, error: null })
      } catch (err) {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      }
    }

    load()
    return () => { cancelled = true }
  }, [weekStartISO, variant])

  return state
}
