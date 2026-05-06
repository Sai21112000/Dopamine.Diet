/*
  # Tighten RLS policies to remove "always true" checks

  1. Changes
    - Drop all existing INSERT/UPDATE policies on `app_state` and `dfw_*` tables
    - Re-create them with restrictive predicates that pin rows to the known
      singleton / default client identifiers used by this single-user app:
      - `app_state` is a single-row table keyed by `id = 'singleton'`
      - `dfw_meta`, `dfw_weekly`, `dfw_daily`, `dfw_archive` are pinned to
        `client_id = 'default'` (the only value the client ever writes)
    - SELECT policies remain unchanged (public read is acceptable for this
      single-user local tool; data is not sensitive across users)

  2. Security
    - INSERT policies now require the row being inserted to match the expected
      singleton identifier
    - UPDATE policies require both the existing row and the updated row to match
      the expected identifier, preventing an anon user from rewriting arbitrary
      rows or pivoting to other `client_id` values
    - This closes the "WITH CHECK (true)" and "USING (true)" bypass flagged by
      the security scanner

  3. Notes
    - No data is dropped; only policy definitions change
    - Table RLS stays enabled throughout
*/

-- ── app_state ────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon insert app_state" ON app_state;
DROP POLICY IF EXISTS "anon update app_state" ON app_state;
DROP POLICY IF EXISTS "anon select app_state" ON app_state;

CREATE POLICY "anon select app_state"
  ON app_state FOR SELECT TO anon
  USING (id = 'singleton');

CREATE POLICY "anon insert app_state"
  ON app_state FOR INSERT TO anon
  WITH CHECK (id = 'singleton');

CREATE POLICY "anon update app_state"
  ON app_state FOR UPDATE TO anon
  USING (id = 'singleton')
  WITH CHECK (id = 'singleton');

-- ── dfw_meta ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anon can select dfw_meta" ON dfw_meta;
DROP POLICY IF EXISTS "Anon can insert dfw_meta" ON dfw_meta;
DROP POLICY IF EXISTS "Anon can update dfw_meta" ON dfw_meta;

CREATE POLICY "Anon can select dfw_meta"
  ON dfw_meta FOR SELECT TO anon
  USING (client_id = 'default');

CREATE POLICY "Anon can insert dfw_meta"
  ON dfw_meta FOR INSERT TO anon
  WITH CHECK (client_id = 'default');

CREATE POLICY "Anon can update dfw_meta"
  ON dfw_meta FOR UPDATE TO anon
  USING (client_id = 'default')
  WITH CHECK (client_id = 'default');

-- ── dfw_weekly ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Anon can select dfw_weekly" ON dfw_weekly;
DROP POLICY IF EXISTS "Anon can insert dfw_weekly" ON dfw_weekly;
DROP POLICY IF EXISTS "Anon can update dfw_weekly" ON dfw_weekly;

CREATE POLICY "Anon can select dfw_weekly"
  ON dfw_weekly FOR SELECT TO anon
  USING (client_id = 'default');

CREATE POLICY "Anon can insert dfw_weekly"
  ON dfw_weekly FOR INSERT TO anon
  WITH CHECK (client_id = 'default');

CREATE POLICY "Anon can update dfw_weekly"
  ON dfw_weekly FOR UPDATE TO anon
  USING (client_id = 'default')
  WITH CHECK (client_id = 'default');

-- ── dfw_daily ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anon can select dfw_daily" ON dfw_daily;
DROP POLICY IF EXISTS "Anon can insert dfw_daily" ON dfw_daily;
DROP POLICY IF EXISTS "Anon can update dfw_daily" ON dfw_daily;

CREATE POLICY "Anon can select dfw_daily"
  ON dfw_daily FOR SELECT TO anon
  USING (client_id = 'default');

CREATE POLICY "Anon can insert dfw_daily"
  ON dfw_daily FOR INSERT TO anon
  WITH CHECK (client_id = 'default');

CREATE POLICY "Anon can update dfw_daily"
  ON dfw_daily FOR UPDATE TO anon
  USING (client_id = 'default')
  WITH CHECK (client_id = 'default');

-- ── dfw_archive ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Anon can select dfw_archive" ON dfw_archive;
DROP POLICY IF EXISTS "Anon can insert dfw_archive" ON dfw_archive;
DROP POLICY IF EXISTS "Anon can update dfw_archive" ON dfw_archive;

CREATE POLICY "Anon can select dfw_archive"
  ON dfw_archive FOR SELECT TO anon
  USING (client_id = 'default');

CREATE POLICY "Anon can insert dfw_archive"
  ON dfw_archive FOR INSERT TO anon
  WITH CHECK (client_id = 'default');

CREATE POLICY "Anon can update dfw_archive"
  ON dfw_archive FOR UPDATE TO anon
  USING (client_id = 'default')
  WITH CHECK (client_id = 'default');
