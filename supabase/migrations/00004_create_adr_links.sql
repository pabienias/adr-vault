CREATE TABLE adr_links (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_adr_id uuid NOT NULL REFERENCES adrs(id),
  target_adr_id uuid NOT NULL REFERENCES adrs(id),
  link_type     adr_link_type NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Prevent self-referencing links
  CONSTRAINT adr_links_no_self_reference CHECK (source_adr_id != target_adr_id),

  -- Prevent duplicate links (same source, target, and type)
  CONSTRAINT adr_links_unique_link UNIQUE (source_adr_id, target_adr_id, link_type)
);

-- Enable RLS (policies defined in a later migration)
ALTER TABLE adr_links ENABLE ROW LEVEL SECURITY;
