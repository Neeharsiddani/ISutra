-- ============================================================
-- IS Standards AI — Database Schema Migration
-- Phase 1: Foundation schema for Indian Standards data
-- 
-- Run this SQL in the Supabase SQL Editor to create all tables.
-- ============================================================

-- ============================================================
-- TABLE 1: standards
-- Core table for Indian Standards metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    scope TEXT,
    category VARCHAR(200),
    status VARCHAR(50) DEFAULT 'active'
        CHECK (status IN ('active', 'withdrawn', 'superseded', 'under_revision', 'demo')),
    edition VARCHAR(100),
    publication_date DATE,
    last_updated DATE,
    source_url VARCHAR(500),
    source_name VARCHAR(200),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_standards_is_number ON standards(is_number);
CREATE INDEX IF NOT EXISTS idx_standards_category ON standards(category);
CREATE INDEX IF NOT EXISTS idx_standards_status ON standards(status);
CREATE INDEX IF NOT EXISTS idx_standards_title_search ON standards USING gin(to_tsvector('english', title));


-- ============================================================
-- TABLE 2: standard_relationships
-- Relationships between standards (normative refs, test methods, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS standard_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    target_standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL
        CHECK (relationship_type IN (
            'normative_reference',
            'test_method',
            'safety_standard',
            'installation_standard',
            'terminology',
            'related_product',
            'allied_standard'
        )),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate relationships
    UNIQUE(source_standard_id, target_standard_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_relationships_source ON standard_relationships(source_standard_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON standard_relationships(target_standard_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON standard_relationships(relationship_type);


-- ============================================================
-- TABLE 3: amendments
-- Amendment records for standards
-- ============================================================
CREATE TABLE IF NOT EXISTS amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    amendment_number VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    publication_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    source_url VARCHAR(500),
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_amendments_standard ON amendments(standard_id);


-- ============================================================
-- TABLE 4: certifications
-- Certification requirements for standards
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    certification_type VARCHAR(100) NOT NULL
        CHECK (certification_type IN (
            'BIS Product Certification',
            'CRS',
            'Hallmarking',
            'Other'
        )),
    requirement TEXT,
    description TEXT,
    source_url VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_certifications_standard ON certifications(standard_id);
CREATE INDEX IF NOT EXISTS idx_certifications_type ON certifications(certification_type);


-- ============================================================
-- TABLE 5: analysis_requests
-- User analysis request log
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_type VARCHAR(50) NOT NULL
        CHECK (input_type IN (
            'product_description',
            'technical_specification',
            'tender_document'
        )),
    input_text TEXT,
    file_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_status ON analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_created ON analysis_requests(created_at DESC);


-- ============================================================
-- TABLE 6: recommendations
-- Recommended standards for each analysis
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_request_id UUID NOT NULL REFERENCES analysis_requests(id) ON DELETE CASCADE,
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    relevance_score DECIMAL(4,3) CHECK (relevance_score >= 0 AND relevance_score <= 1),
    reason TEXT,
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_analysis ON recommendations(analysis_request_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_standard ON recommendations(standard_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON recommendations(relevance_score DESC);


-- ============================================================
-- Auto-update trigger for standards.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_standards_updated_at
    BEFORE UPDATE ON standards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- Row Level Security (RLS) — Read-only public access
-- Enable RLS and allow public SELECT for Phase 1
-- ============================================================
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read standards" ON standards FOR SELECT USING (true);
CREATE POLICY "Allow public read relationships" ON standard_relationships FOR SELECT USING (true);
CREATE POLICY "Allow public read amendments" ON amendments FOR SELECT USING (true);
CREATE POLICY "Allow public read certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Allow public read analysis_requests" ON analysis_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert analysis_requests" ON analysis_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read recommendations" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Allow public insert recommendations" ON recommendations FOR INSERT WITH CHECK (true);
