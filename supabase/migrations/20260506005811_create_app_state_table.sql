/*
  # Create app_state table for Dopamine-Free Work System

  1. New Tables
    - `app_state`
      - `id` (text, primary key) - singleton key
      - `data` (jsonb) - entire app state blob
      - `updated_at` (timestamptz) - last sync time

  2. Security
    - Enable RLS
    - Policies allow anon (single-user, no auth) to read/write the singleton row
*/

CREATE TABLE IF NOT EXISTS app_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_state' AND policyname = 'anon select app_state') THEN
    CREATE POLICY "anon select app_state" ON app_state FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_state' AND policyname = 'anon insert app_state') THEN
    CREATE POLICY "anon insert app_state" ON app_state FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_state' AND policyname = 'anon update app_state') THEN
    CREATE POLICY "anon update app_state" ON app_state FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;
