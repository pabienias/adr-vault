-- Reusable trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to adrs table
CREATE TRIGGER set_adrs_updated_at
  BEFORE UPDATE ON adrs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_ai_usage table
CREATE TRIGGER set_user_ai_usage_updated_at
  BEFORE UPDATE ON user_ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
