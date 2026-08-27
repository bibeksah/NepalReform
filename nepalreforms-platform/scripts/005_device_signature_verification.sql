-- Migration: 005_device_signature_verification.sql
-- Description: Transition from mandatory Supabase user authentication to Device Signature + Cookie verification for public citizens.

-- 1. Create device_identities table to track unique devices, rate-limiting, and reputation
CREATE TABLE IF NOT EXISTS public.device_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID UNIQUE NOT NULL,
  fingerprint_hash TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  vote_count INTEGER DEFAULT 0,
  suggestion_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for device lookup
CREATE INDEX IF NOT EXISTS idx_device_identities_device_id ON public.device_identities(device_id);
CREATE INDEX IF NOT EXISTS idx_device_identities_ip_hash ON public.device_identities(ip_hash);

-- 2. Update agenda_votes table to support device_id
ALTER TABLE public.agenda_votes ADD COLUMN IF NOT EXISTS device_id UUID;
ALTER TABLE public.agenda_votes ALTER COLUMN user_id DROP NOT NULL;

-- Create unique index for device voting (one vote per agenda per device)
CREATE UNIQUE INDEX IF NOT EXISTS idx_agenda_votes_device_unique 
  ON public.agenda_votes(agenda_id, device_id) 
  WHERE device_id IS NOT NULL;

-- 3. Update suggestion_votes table to support device_id
ALTER TABLE public.suggestion_votes ADD COLUMN IF NOT EXISTS device_id UUID;
ALTER TABLE public.suggestion_votes ALTER COLUMN user_id DROP NOT NULL;

-- Create unique index for device voting on suggestions
CREATE UNIQUE INDEX IF NOT EXISTS idx_suggestion_votes_device_unique 
  ON public.suggestion_votes(suggestion_id, device_id) 
  WHERE device_id IS NOT NULL;

-- 4. Update suggestions table to support device_id
ALTER TABLE public.suggestions ADD COLUMN IF NOT EXISTS device_id UUID;
ALTER TABLE public.suggestions ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_suggestions_device_id ON public.suggestions(device_id);

-- 5. Update agendas table (used for community opinions) to support device_id
ALTER TABLE public.agendas ADD COLUMN IF NOT EXISTS device_id UUID;
ALTER TABLE public.agendas ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agendas_device_id ON public.agendas(device_id);

-- 6. Enable RLS and define open public read / service-managed write policies
ALTER TABLE public.device_identities ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'device_identities' AND policyname = 'device_identities_service_all'
  ) THEN
    CREATE POLICY "device_identities_service_all" ON public.device_identities 
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
