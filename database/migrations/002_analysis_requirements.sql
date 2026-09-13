-- ============================================================
-- ISutra — Database Schema Migration
-- Phase 2: Analysis Requirements Table
-- 
-- Stores extracted procurement requirements with provenance
-- and confidence tracking for human verification.
-- ============================================================

CREATE TABLE IF NOT EXISTS analysis_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_request_id UUID NOT NULL REFERENCES analysis_requests(id) ON DELETE CASCADE,
    requirement_type VARCHAR(100) NOT NULL,
    requirement_name VARCHAR(255) NOT NULL,
    requirement_value TEXT NOT NULL,
    unit VARCHAR(50),
    confidence VARCHAR(50) DEFAULT 'medium'
        CHECK (confidence IN ('high', 'medium', 'needs_review')),
    source_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_requirements_analysis ON analysis_requirements(analysis_request_id);
CREATE INDEX IF NOT EXISTS idx_requirements_type ON analysis_requirements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_requirements_confidence ON analysis_requirements(confidence);

-- Enable Row Level Security (RLS)
ALTER TABLE analysis_requirements ENABLE ROW LEVEL SECURITY;

-- Public access policies (matching Phase 1 pattern)
CREATE POLICY "Allow public read analysis_requirements" ON analysis_requirements FOR SELECT USING (true);
CREATE POLICY "Allow public insert analysis_requirements" ON analysis_requirements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update analysis_requirements" ON analysis_requirements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete analysis_requirements" ON analysis_requirements FOR DELETE USING (true);
