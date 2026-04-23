-- =============================================================
-- HireMind — Supabase (PostgreSQL) Schema
-- Run this in your Supabase SQL Editor to create all tables.
-- =============================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'recruiter',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  department    TEXT NOT NULL,
  location      TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'full-time',
  status        TEXT NOT NULL DEFAULT 'active',
  description   TEXT,
  skills        JSONB NOT NULL DEFAULT '[]'::jsonb,
  posted_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL,
  role                TEXT NOT NULL,
  experience          TEXT,
  skills              JSONB NOT NULL DEFAULT '[]'::jsonb,
  status              TEXT NOT NULL DEFAULT 'new',
  fit_score           DOUBLE PRECISION NOT NULL DEFAULT 0,
  resume_score        DOUBLE PRECISION NOT NULL DEFAULT 0,
  bias_flag           BOOLEAN NOT NULL DEFAULT false,
  diversity_score     DOUBLE PRECISION NOT NULL DEFAULT 0,
  success_prediction  DOUBLE PRECISION NOT NULL DEFAULT 0,
  applied_date        TIMESTAMPTZ NOT NULL DEFAULT now(),
  job_id              BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
  user_id             BIGINT REFERENCES users(id) ON DELETE SET NULL,
  resume_filename     TEXT
);

-- 4. Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id                BIGSERIAL PRIMARY KEY,
  filename          TEXT NOT NULL,
  name              TEXT,
  email             TEXT,
  phone             TEXT,
  experience_years  DOUBLE PRECISION NOT NULL DEFAULT 0,
  skills            JSONB NOT NULL DEFAULT '[]'::jsonb,
  education         JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_text          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Interviews
CREATE TABLE IF NOT EXISTS interviews (
  id            BIGSERIAL PRIMARY KEY,
  candidate_id  BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  role          TEXT NOT NULL,
  date          TEXT NOT NULL,
  time          TEXT NOT NULL,
  type          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'scheduled',
  rating        DOUBLE PRECISION,
  ai_insight    TEXT,
  interviewer   TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
