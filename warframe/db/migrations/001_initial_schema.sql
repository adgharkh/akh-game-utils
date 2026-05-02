-- =============================================================================
-- Migration 001: Initial schema for The Descendia tracker
-- Run this in the Supabase SQL editor (or via supabase CLI migrations).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- stages: static lookup table, seeded once.
-- Shared between Normal and Steel Path variants — structural data only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stages (
  id              INTEGER PRIMARY KEY,  -- 1–21
  is_choice_floor BOOLEAN NOT NULL DEFAULT FALSE
);

-- Seed all 21 stages
INSERT INTO stages (id, is_choice_floor) VALUES
  ( 1, FALSE),
  ( 2, FALSE),
  ( 3, FALSE),
  ( 4, FALSE),
  ( 5, FALSE),
  ( 6, FALSE),
  ( 7, TRUE),   -- choice floor
  ( 8, FALSE),
  ( 9, FALSE),
  (10, FALSE),
  (11, FALSE),
  (12, FALSE),
  (13, FALSE),
  (14, TRUE),   -- choice floor
  (15, FALSE),
  (16, FALSE),
  (17, FALSE),
  (18, FALSE),
  (19, FALSE),
  (20, FALSE),
  (21, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- weekly_conditions: one row per stage+variant per week, with versioning.
--
-- variant: 'normal' or 'steel_path'
--
-- For normal stages (is_choice_floor = false):
--   objective, penance, reward are used; choice_option_a/b are NULL.
--   penance may also be NULL (some objectives have none).
--   reward may be NULL on specific stages.
--
-- For choice floors (stages 7 and 14):
--   choice_option_a and choice_option_b are used; objective/penance/reward are NULL.
--
-- Versioning: when a correction is submitted, the existing is_latest row is
-- marked is_latest = false and a new row is inserted. Full history is preserved.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_conditions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id          INTEGER     NOT NULL REFERENCES stages(id),
  variant           TEXT        NOT NULL CHECK (variant IN ('normal', 'steel_path')),
  for_week_starting DATE        NOT NULL,

  -- Normal stage fields (NULL for choice floors)
  objective         TEXT,
  penance           TEXT,
  reward            TEXT,

  -- Choice floor fields (NULL for normal stages)
  choice_option_a   TEXT,
  choice_option_b   TEXT,

  -- Versioning / metadata
  is_latest         BOOLEAN     NOT NULL DEFAULT TRUE,
  last_updated      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_by      TEXT                              -- for future multi-user support
);

-- Primary query index: fetch current week + variant, latest rows only
CREATE INDEX IF NOT EXISTS idx_wc_week_variant_latest
  ON weekly_conditions (for_week_starting, variant, is_latest)
  WHERE is_latest = TRUE;

-- History query index: all versions for a given stage+variant
CREATE INDEX IF NOT EXISTS idx_wc_stage_variant_week
  ON weekly_conditions (stage_id, variant, for_week_starting);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_conditions ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read stages
CREATE POLICY "stages_public_read"
  ON stages FOR SELECT
  USING (TRUE);

-- Public: anyone can read conditions (all variants, all weeks)
CREATE POLICY "conditions_public_read"
  ON weekly_conditions FOR SELECT
  USING (TRUE);

-- Writes: only the service role (bypasses RLS by default in Supabase).
-- No explicit write policy needed for anon/authenticated roles —
-- absence of a policy means writes are denied for those roles.
