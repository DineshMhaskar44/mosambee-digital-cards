-- ============================================================
-- MOSAMBEE DIGITAL BUSINESS CARDS — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- ============================================================
-- TABLE: admins
-- Stores admin user references (linked to Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  role         TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: employees
-- Core employee data for digital business cards
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id         TEXT NOT NULL UNIQUE,          -- e.g. MOS-001
  full_name           TEXT NOT NULL,
  designation         TEXT NOT NULL,
  department          TEXT NOT NULL,
  mobile_number       TEXT NOT NULL,
  alternate_number    TEXT,
  email               TEXT NOT NULL UNIQUE,
  company_website     TEXT DEFAULT 'https://mosambee.com',
  office_address      TEXT,
  profile_photo_url   TEXT,
  linkedin_url        TEXT,
  whatsapp_number     TEXT,
  company_profile_pdf TEXT,                          -- Supabase storage path
  qr_code_url         TEXT,                          -- Supabase storage path
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  card_views          BIGINT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: scan_logs
-- Tracks each visit/scan of a digital card
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  ip_address      INET,
  user_agent      TEXT,
  device_type     TEXT,                              -- mobile | tablet | desktop
  browser         TEXT,
  os              TEXT,
  country         TEXT,
  city            TEXT,
  referrer        TEXT,                              -- qr | direct | share
  scanned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: vcard_downloads
-- Tracks vCard (.vcf) downloads per employee
-- ============================================================
CREATE TABLE IF NOT EXISTS vcard_downloads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  ip_address  INET,
  user_agent  TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_employees_status      ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department  ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_employee_id ON scan_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at  ON scan_logs(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_logs_device      ON scan_logs(device_type);
CREATE INDEX IF NOT EXISTS idx_scan_logs_referrer    ON scan_logs(referrer);
CREATE INDEX IF NOT EXISTS idx_vcard_employee_id     ON vcard_downloads(employee_id);

-- Full-text search on employees
CREATE INDEX IF NOT EXISTS idx_employees_search ON employees
  USING gin ((full_name || ' ' || designation || ' ' || department) gin_trgm_ops);

-- ============================================================
-- ANALYTICS VIEWS
-- ============================================================

-- Daily scan summary
CREATE OR REPLACE VIEW daily_scan_summary AS
SELECT
  DATE(scanned_at)          AS scan_date,
  COUNT(*)                  AS total_scans,
  COUNT(DISTINCT ip_address) AS unique_visitors
FROM scan_logs
GROUP BY DATE(scanned_at)
ORDER BY scan_date DESC;

-- Monthly scan summary
CREATE OR REPLACE VIEW monthly_scan_summary AS
SELECT
  DATE_TRUNC('month', scanned_at) AS scan_month,
  COUNT(*)                         AS total_scans,
  COUNT(DISTINCT ip_address)       AS unique_visitors
FROM scan_logs
GROUP BY DATE_TRUNC('month', scanned_at)
ORDER BY scan_month DESC;

-- Employee-wise analytics
CREATE OR REPLACE VIEW employee_analytics AS
SELECT
  e.id,
  e.employee_id,
  e.full_name,
  e.designation,
  e.department,
  e.status,
  COUNT(sl.id)                           AS total_scans,
  COUNT(DISTINCT sl.ip_address)          AS unique_visitors,
  COUNT(CASE WHEN sl.referrer = 'qr' THEN 1 END) AS qr_scans,
  MAX(sl.scanned_at)                     AS last_scanned_at
FROM employees e
LEFT JOIN scan_logs sl ON sl.employee_id = e.id
GROUP BY e.id, e.employee_id, e.full_name, e.designation, e.department, e.status;

-- Device analytics
CREATE OR REPLACE VIEW device_analytics AS
SELECT
  device_type,
  COUNT(*) AS total_scans,
  ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2) AS percentage
FROM scan_logs
GROUP BY device_type;

-- Browser analytics
CREATE OR REPLACE VIEW browser_analytics AS
SELECT
  browser,
  COUNT(*) AS total_scans,
  ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2) AS percentage
FROM scan_logs
GROUP BY browser;

-- Referrer analytics
CREATE OR REPLACE VIEW referrer_analytics AS
SELECT
  referrer,
  COUNT(*) AS total_scans
FROM scan_logs
GROUP BY referrer;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment card_views counter on new scan log
CREATE OR REPLACE FUNCTION increment_card_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE employees SET card_views = card_views + 1 WHERE id = NEW.employee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_scan_log
  AFTER INSERT ON scan_logs
  FOR EACH ROW EXECUTE FUNCTION increment_card_views();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE admins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees  ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vcard_downloads ENABLE ROW LEVEL SECURITY;

-- ADMINS table policies
CREATE POLICY "Admins can read own record"
  ON admins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all admins"
  ON admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- EMPLOYEES table policies
-- Public read (active employees only — for digital card page)
CREATE POLICY "Public can view active employees"
  ON employees FOR SELECT
  TO anon
  USING (status = 'active');

-- Authenticated admins can do everything
CREATE POLICY "Admins can manage employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- SCAN_LOGS table policies
-- Anonymous can insert (card visits from public)
CREATE POLICY "Anyone can insert scan logs"
  ON scan_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read scan logs"
  ON scan_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- VCARD_DOWNLOADS table policies
CREATE POLICY "Anyone can insert vcard downloads"
  ON vcard_downloads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read vcard downloads"
  ON vcard_downloads FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase Dashboard)
-- Or via CLI: supabase storage create-bucket profiles --public
-- ============================================================
-- Bucket: profile-photos   (public)
-- Bucket: qr-codes         (public)
-- Bucket: company-profiles (public)
-- See README for storage policy setup

-- ============================================================
-- SAMPLE DATA (optional — remove in production)
-- ============================================================
-- INSERT INTO employees (employee_id, full_name, designation, department, mobile_number, email, office_address)
-- VALUES
--   ('MOS-001', 'Rahul Sharma', 'Senior Developer', 'Technology', '+91-9876543210', 'rahul.sharma@mosambee.com', '123 Tech Park, Bangalore'),
--   ('MOS-002', 'Priya Patel',  'Product Manager',  'Product',    '+91-9123456789', 'priya.patel@mosambee.com',  '123 Tech Park, Bangalore');
