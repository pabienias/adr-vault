CREATE TABLE adrs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adr_number      integer GENERATED ALWAYS AS IDENTITY,
  title           text NOT NULL,
  status          adr_status NOT NULL DEFAULT 'Draft',
  content         jsonb NOT NULL DEFAULT '{}',
  ai_summary      text,
  creation_method creation_method NOT NULL DEFAULT 'Manual',
  author_id       uuid NOT NULL REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- Enable RLS (policies defined in a later migration)
ALTER TABLE adrs ENABLE ROW LEVEL SECURITY;

-- Index: author lookups (RLS policies, "my ADRs" queries)
CREATE INDEX idx_adrs_author_id ON adrs (author_id);

-- Index: status filtering
CREATE INDEX idx_adrs_status ON adrs (status);

-- Unique constraint on adr_number for human-readable references
ALTER TABLE adrs ADD CONSTRAINT adrs_adr_number_unique UNIQUE (adr_number);
