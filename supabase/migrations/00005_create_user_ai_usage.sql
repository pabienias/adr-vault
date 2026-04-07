CREATE TABLE user_ai_usage (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id),
  usage_date      date NOT NULL DEFAULT CURRENT_DATE,
  tokens_used     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- One row per user per day
  CONSTRAINT user_ai_usage_unique_daily UNIQUE (user_id, usage_date)
);

-- Enable RLS (policies defined in a later migration)
ALTER TABLE user_ai_usage ENABLE ROW LEVEL SECURITY;
