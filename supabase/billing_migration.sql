-- Phase 4: billing — user credits + subscription tracking
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS user_credits (
  user_id           UUID PRIMARY KEY,
  credits           INTEGER NOT NULL DEFAULT 3,
  plan              TEXT    NOT NULL DEFAULT 'free',   -- 'free' | 'credits' | 'pro'
  stripe_customer_id      TEXT,                        -- Lemon Squeezy customer id
  stripe_subscription_id  TEXT,                        -- Lemon Squeezy subscription id
  subscription_status     TEXT,                        -- 'active' | 'on_trial' | 'cancelled' | 'past_due' | 'expired'
  subscription_ends_at    TIMESTAMPTZ,                 -- end of the paid period (Pro stays on until then)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Provider webhook de-duplication (Lemon Squeezy retries deliveries).
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id     TEXT PRIMARY KEY,
  event_name   TEXT,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS webhook_events_received_at_idx
  ON webhook_events (received_at DESC);

-- Auto-provision 3 free credits when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, plan)
  VALUES (NEW.id, 3, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row level security: the anon/authenticated key may only read the user's own
-- credit row. All writes go through the backend service connection.
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own credits" ON user_credits;
CREATE POLICY "users read own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);
