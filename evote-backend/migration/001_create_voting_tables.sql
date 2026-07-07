-- ============================================================
-- E-Vote Platform — Initial Migration
-- Run this once on the university's database before first use.
-- Command: psql -U <db_user> -d <db_name> -f 001_create_voting_tables.sql
-- ============================================================

-- Eligible voters uploaded by the electoral commission
CREATE TABLE IF NOT EXISTS eligible_voters (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matric_no    VARCHAR(100) UNIQUE NOT NULL,
  full_name    VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  faculty      VARCHAR(150) NOT NULL,
  department   VARCHAR(150) NOT NULL,
  level        VARCHAR(20)  NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- OTP tokens for login verification
CREATE TABLE IF NOT EXISTS otp_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matric_no   VARCHAR(100) NOT NULL,
  token       VARCHAR(6)   NOT NULL,
  expires_at  TIMESTAMPTZ  NOT NULL,
  used        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Elections
CREATE TABLE IF NOT EXISTS voting_elections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  election_type  VARCHAR(100) NOT NULL,
  scope_type     VARCHAR(50),
  scope_value    VARCHAR(100),
  status         VARCHAR(20)  NOT NULL DEFAULT 'draft',
  starts_at      TIMESTAMPTZ,
  ends_at        TIMESTAMPTZ,
  created_by     VARCHAR(100) NOT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Candidates
CREATE TABLE IF NOT EXISTS voting_candidates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id      UUID         NOT NULL REFERENCES voting_elections(id),
  student_id       VARCHAR(100) NOT NULL,
  full_name        VARCHAR(255) NOT NULL,
  position         VARCHAR(150) NOT NULL,
  manifesto        TEXT,
  photo_url        TEXT,
  is_disqualified  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Votes
CREATE TABLE IF NOT EXISTS voting_votes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id      UUID         NOT NULL REFERENCES voting_elections(id),
  candidate_id     UUID         NOT NULL REFERENCES voting_candidates(id),
  voter_matric_no  VARCHAR(100) NOT NULL REFERENCES eligible_voters(matric_no),
  position         VARCHAR(150) NOT NULL,
  voted_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- One vote per student per position per election
  CONSTRAINT unique_vote UNIQUE (election_id, voter_matric_no, position)
);

-- Admins
CREATE TABLE IF NOT EXISTS voting_admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matric_no   VARCHAR(100) UNIQUE NOT NULL,
  full_name   VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'returning_officer',
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_otp_matric    ON otp_tokens(matric_no);
CREATE INDEX IF NOT EXISTS idx_otp_expires   ON otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_election_status ON voting_elections(status);
CREATE INDEX IF NOT EXISTS idx_candidates_election ON voting_candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON voting_votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter   ON voting_votes(voter_matric_no);