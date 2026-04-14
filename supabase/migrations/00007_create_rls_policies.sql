-- ============================================================
-- profiles
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- No direct INSERT (handled by trigger) or DELETE by users

-- ============================================================
-- adrs
-- ============================================================

-- All authenticated users can read non-deleted ADRs
CREATE POLICY "adrs_select_all"
  ON adrs FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Only the author can insert ADRs (author_id must match current user)
CREATE POLICY "adrs_insert_author"
  ON adrs FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Only the author can update their own non-deleted ADRs
CREATE POLICY "adrs_update_author"
  ON adrs FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (author_id = auth.uid());

-- Only the author can delete (soft delete) their own ADRs
-- This allows UPDATE to set deleted_at — actual DELETE is not permitted via RLS
CREATE POLICY "adrs_delete_author"
  ON adrs FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() AND deleted_at IS NULL);

-- ============================================================
-- adr_links
-- ============================================================

-- All authenticated users can read links (for non-deleted ADRs, filtered at API level)
CREATE POLICY "adr_links_select_all"
  ON adr_links FOR SELECT
  TO authenticated
  USING (true);

-- Only the author of the source ADR can create a link
CREATE POLICY "adr_links_insert_author"
  ON adr_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM adrs
      WHERE adrs.id = source_adr_id
        AND adrs.author_id = auth.uid()
        AND adrs.deleted_at IS NULL
    )
  );

-- Only the author of the source ADR can delete a link
CREATE POLICY "adr_links_delete_author"
  ON adr_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adrs
      WHERE adrs.id = source_adr_id
        AND adrs.author_id = auth.uid()
        AND adrs.deleted_at IS NULL
    )
  );

-- No UPDATE on links — delete and recreate instead

-- ============================================================
-- user_ai_usage
-- ============================================================

-- Users can read their own usage data
CREATE POLICY "user_ai_usage_select_own"
  ON user_ai_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT and UPDATE handled by service role (API with service_role key)
-- No user-facing INSERT/UPDATE/DELETE policies needed
