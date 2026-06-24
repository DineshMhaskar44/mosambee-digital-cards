// ============================================================
// Mosambee Digital Business Cards — TypeScript Types
// ============================================================

export type EmployeeStatus = "active" | "inactive";
export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";
export type ScanReferrer = "qr" | "direct" | "share" | "other";
export type AdminRole = "super_admin" | "admin";

// ---- Database Row Types ----

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  designation: string;
  department: string;
  mobile_number: string;
  alternate_number: string | null;
  email: string;
  company_website: string | null;
  office_address: string | null;
  profile_photo_url: string | null;
  linkedin_url: string | null;
  whatsapp_number: string | null;
  company_profile_pdf: string | null;
  qr_code_url: string | null;
  status: EmployeeStatus;
  card_views: number;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
}

export interface ScanLog {
  id: string;
  employee_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: DeviceType | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  referrer: ScanReferrer | null;
  scanned_at: string;
}

export interface VcardDownload {
  id: string;
  employee_id: string;
  ip_address: string | null;
  user_agent: string | null;
  downloaded_at: string;
}

// ---- Analytics View Types ----

export interface DailyScanSummary {
  scan_date: string;
  total_scans: number;
  unique_visitors: number;
}

export interface MonthlyScanSummary {
  scan_month: string;
  total_scans: number;
  unique_visitors: number;
}

export interface EmployeeAnalytics {
  id: string;
  employee_id: string;
  full_name: string;
  designation: string;
  department: string;
  status: EmployeeStatus;
  total_scans: number;
  unique_visitors: number;
  qr_scans: number;
  last_scanned_at: string | null;
}

export interface DeviceAnalytics {
  device_type: string;
  total_scans: number;
  percentage: number;
}

export interface BrowserAnalytics {
  browser: string;
  total_scans: number;
  percentage: number;
}

export interface ReferrerAnalytics {
  referrer: string;
  total_scans: number;
}

// ---- Form Types ----

export interface EmployeeFormData {
  employee_id: string;
  full_name: string;
  designation: string;
  department: string;
  mobile_number: string;
  alternate_number?: string;
  email: string;
  company_website?: string;
  office_address?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  status: EmployeeStatus;
}

// ---- API Response Types ----

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- Analytics Dashboard Types ----

export interface OverallAnalytics {
  totalScans: number;
  uniqueVisitors: number;
  totalEmployees: number;
  activeEmployees: number;
  todayScans: number;
  monthScans: number;
  dailyData: DailyScanSummary[];
  monthlyData: MonthlyScanSummary[];
  topEmployees: EmployeeAnalytics[];
  deviceData: DeviceAnalytics[];
  browserData: BrowserAnalytics[];
  referrerData: ReferrerAnalytics[];
}
