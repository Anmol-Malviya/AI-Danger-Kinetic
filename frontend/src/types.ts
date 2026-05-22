export interface UrlFeatures {
  url_length: number;
  dot_count: number;
  hyphen_count: number;
  has_ip: number;
  has_at: number;
  is_https: number;
  has_redirect: number;
  is_shortened: number;
  subdomain_count: number;
  keyword_count: number;
  domain_entropy: number;
}

export interface UrlScanResult {
  url: string;
  threat_level: "safe" | "warning" | "dangerous";
  confidence: number;
  features: UrlFeatures;
  details: string[];
}

export interface TextScanResult {
  text: string;
  threat_level: "safe" | "warning" | "dangerous";
  confidence: number;
  matched_links: UrlScanResult[];
  urgency_words: string[];
  financial_words: string[];
  credential_words: string[];
}

export interface QrScanResult {
  filename: string;
  decoded_url: string;
  scan_results: UrlScanResult;
}

export interface ThreatMetrics {
  safe: number;
  warning: number;
  dangerous: number;
}

export interface HistoryItem {
  id: number;
  type: string;
  target: string;
  threat_level: "safe" | "warning" | "dangerous";
  confidence: number;
  timestamp: string;
}

export interface DashboardStats {
  threat_score: number;
  total_scans: number;
  metrics: ThreatMetrics;
  description: string;
  history: HistoryItem[];
}
