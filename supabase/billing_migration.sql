-- Phase 4: billing — user credits + subscription tracking

CREATE TABLE IF NOT EXISTS user_credits (
  user_id           UUID PRIMARY KEY,
  credits           INTEGER NOT NULL DEFAULT 3,
  plan              TEXT    NOT NULL DEFAULT 'free',   -- 'free' | 'credits' | 'pro'
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  subscription_status     TEXT,                        -- 'active' | 'canceled' | 'past_due'
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

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
