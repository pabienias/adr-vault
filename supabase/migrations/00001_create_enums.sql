-- ADR status lifecycle
CREATE TYPE adr_status AS ENUM (
  'Draft',
  'Proposed',
  'Accepted',
  'Deprecated',
  'Superseded'
);

-- How the ADR was created
CREATE TYPE creation_method AS ENUM (
  'Manual',
  'AIGenerated',
  'AIGeneratedUserEdited'
);

-- Relationship type between two ADRs
CREATE TYPE adr_link_type AS ENUM (
  'Supersedes',
  'DependsOn',
  'RelatedTo'
);
