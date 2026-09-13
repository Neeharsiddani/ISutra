-- ============================================================
-- ISutra: Phase 3 — Indian Standards Table Migration
-- Schema for Verified BIS Reference Standards Dataset
-- ============================================================

CREATE TABLE IF NOT EXISTS standards (
  id VARCHAR(100) PRIMARY KEY,
  standard_number VARCHAR(100) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100) NOT NULL,
  product_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  scope TEXT,
  technical_parameters JSONB,
  safety_requirements JSONB,
  performance_requirements JSONB,
  testing_requirements JSONB,
  related_standards JSONB NOT NULL DEFAULT '[]'::jsonb,
  edition_year INTEGER,
  status VARCHAR(50) NOT NULL,
  source_organization VARCHAR(200) NOT NULL DEFAULT 'Bureau of Indian Standards',
  source_url TEXT NOT NULL,
  last_verified DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance querying and filtering
CREATE INDEX IF NOT EXISTS idx_standards_number ON standards (standard_number);
CREATE INDEX IF NOT EXISTS idx_standards_title ON standards USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_standards_category ON standards (category);
CREATE INDEX IF NOT EXISTS idx_standards_subcategory ON standards (subcategory);
CREATE INDEX IF NOT EXISTS idx_standards_status ON standards (status);
CREATE INDEX IF NOT EXISTS idx_standards_edition ON standards (edition_year);
CREATE INDEX IF NOT EXISTS idx_standards_product_types ON standards USING gin (product_types);
CREATE INDEX IF NOT EXISTS idx_standards_keywords ON standards USING gin (keywords);
