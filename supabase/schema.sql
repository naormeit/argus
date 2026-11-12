-- Argus audit storage schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS audits (
  id            UUID        PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  language      TEXT        NOT NULL,
  source_code   TEXT        NOT NULL,
  source_type   TEXT        NOT NULL DEFAULT 'paste',  -- 'paste' | 'address'
  source_ref    TEXT,                                   -- contract address or null
  network       TEXT,                                   -- 'ethereum' | 'base' | 'polygon' | 'arbitrum' | 'bsc'
  overall_risk  TEXT,                                   -- 'critical' | 'high' | 'medium' | 'low'
  findings_count INT        DEFAULT 0,
  summary       TEXT,
  signature     TEXT,
  report        JSONB       NOT NULL
);

-- Index for recent audits listing
CREATE INDEX IF NOT EXISTS audits_created_at_idx ON audits (created_at DESC);

-- Index for address lookups
CREATE INDEX IF NOT EXISTS audits_source_ref_idx ON audits (source_ref) WHERE source_ref IS NOT NULL;

-- Phase 3: user accounts
-- Run this migration in Supabase SQL Editor after enabling Auth
ALTER TABLE audits ADD COLUMN IF NOT EXISTS user_id UUID;
CREATE INDEX IF NOT EXISTS audits_user_id_idx ON audits (user_id) WHERE user_id IS NOT NULL;
