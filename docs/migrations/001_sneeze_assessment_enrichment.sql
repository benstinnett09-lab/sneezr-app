-- Migration: 001_sneeze_assessment_enrichment
-- Purpose: Add nullable post-event assessment fields to public.sneezes and support row updates.
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- ---------------------------------------------------------------------------
-- 1. Add nullable assessment columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.sneezes
  ADD COLUMN IF NOT EXISTS severity smallint,
  ADD COLUMN IF NOT EXISTS trigger text,
  ADD COLUMN IF NOT EXISTS environment text,
  ADD COLUMN IF NOT EXISTS symptoms text[],
  ADD COLUMN IF NOT EXISTS intervention text,
  ADD COLUMN IF NOT EXISTS assessment_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN public.sneezes.severity IS '1-5 scale, post-event assessment';
COMMENT ON COLUMN public.sneezes.trigger IS 'Reported trigger (e.g. pollen, pepper)';
COMMENT ON COLUMN public.sneezes.environment IS 'Where it happened (e.g. outdoors, office)';
COMMENT ON COLUMN public.sneezes.symptoms IS 'Array of symptom labels (e.g. runny_nose, itchy_eyes)';
COMMENT ON COLUMN public.sneezes.intervention IS 'What they did (e.g. tissue, medication)';
COMMENT ON COLUMN public.sneezes.assessment_completed_at IS 'When the 5-question assessment was completed';
COMMENT ON COLUMN public.sneezes.updated_at IS 'Set automatically on row update';

-- Constraint: severity in valid range when present
ALTER TABLE public.sneezes
  DROP CONSTRAINT IF EXISTS sneezes_severity_range;

ALTER TABLE public.sneezes
  ADD CONSTRAINT sneezes_severity_range CHECK (severity IS NULL OR (severity >= 1 AND severity <= 5));

-- ---------------------------------------------------------------------------
-- 2. Trigger to set updated_at on row update
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_sneezes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_sneezes_updated_at() IS 'Sets updated_at to now() on sneezes row update';

DROP TRIGGER IF EXISTS sneezes_updated_at ON public.sneezes;

CREATE TRIGGER sneezes_updated_at
  BEFORE UPDATE ON public.sneezes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sneezes_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS: allow users to update their own rows
-- ---------------------------------------------------------------------------

-- Ensure RLS is enabled (no-op if already on)
ALTER TABLE public.sneezes ENABLE ROW LEVEL SECURITY;

-- Policy: users may update only rows where user_id = auth.uid()
DROP POLICY IF EXISTS "Users can update own sneezes" ON public.sneezes;

CREATE POLICY "Users can update own sneezes"
  ON public.sneezes
  FOR UPDATE
  TO authenticated, anon
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Optional: policies for INSERT/SELECT if not already present
-- ---------------------------------------------------------------------------

-- Uncomment if you have not yet created these:
/*
DROP POLICY IF EXISTS "Users can insert own sneezes" ON public.sneezes;
CREATE POLICY "Users can insert own sneezes"
  ON public.sneezes FOR INSERT TO authenticated, anon
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select own sneezes" ON public.sneezes;
CREATE POLICY "Users can select own sneezes"
  ON public.sneezes FOR SELECT TO authenticated, anon
  USING (auth.uid() = user_id);
*/
