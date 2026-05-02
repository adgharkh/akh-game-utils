/**
 * Utilities for working with the weekly reset cycle.
 *
 * TODO: Confirm the exact reset day and time from in-game observation,
 * then update RESET_DAY_UTC and RESET_HOUR_UTC accordingly.
 */

/** 0 = Sunday, 1 = Monday, … 6 = Saturday */
const RESET_DAY_UTC = 1   // Monday — update if different
const RESET_HOUR_UTC = 0  // 00:00 UTC — update if different

/**
 * Returns the start of the current Descendia week as a Date (UTC midnight
 * on the most recent reset day).
 */
export function getCurrentWeekStart(): Date {
  const now = new Date()
  const dayOfWeek = now.getUTCDay()
  const hourOfDay = now.getUTCHours()

  // How many days ago was the last reset day?
  let daysBack = (dayOfWeek - RESET_DAY_UTC + 7) % 7

  // If today IS the reset day but we haven't hit the reset hour yet,
  // roll back one full week.
  if (daysBack === 0 && now.getUTCHours() < RESET_HOUR_UTC) {
    daysBack = 7
  }

  const weekStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysBack,
    RESET_HOUR_UTC,
    0,
    0,
    0,
  ))

  return weekStart
}

/**
 * Returns the ISO date string (YYYY-MM-DD) for the current week start.
 * This is the value stored in `for_week_starting`.
 */
export function getCurrentWeekStartISO(): string {
  return getCurrentWeekStart().toISOString().slice(0, 10)
}

/**
 * Returns the Date of the next weekly reset.
 */
export function getNextResetDate(): Date {
  const weekStart = getCurrentWeekStart()
  return new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
}

/**
 * Returns milliseconds until the next weekly reset.
 */
export function msUntilNextReset(): number {
  return getNextResetDate().getTime() - Date.now()
}
