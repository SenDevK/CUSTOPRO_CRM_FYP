
export type UserRole = 'admin' | 'data_analyst' | 'marketing' | 'legal';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  segment?: string;
  lastPurchase?: string;
  totalSpent: number;
  purchaseCount: number;
  consentGiven: boolean;
  consentDate?: string;
  notes?: string;
  createdAt: string;
  marketing_status?: 'active' | 'opted_out' | 'deleted' | 'inactive';
  opt_out_date?: string;
  opt_out_reason?: string;

  // Additional fields from backend
  gender?: string;
  age?: number;
  value_segment?: string;
  rfm_data?: {
    r_score?: number;
    f_score?: number;
    m_score?: number;
    rfm_score?: number;
    recency?: number;
    frequency?: number;
    monetary?: number;
    last_calculated?: string;
  };
  transactions?: Array<{
    id?: string;
    purchase_datetime?: string;
    total_amount_lkr?: number;
    payment_method?: string;
    store_location?: string;
    items?: Array<any>;
  }>;
  preferences?: Record<string, any>;
  survey_responses?: Array<any>;
  gender_segment?: string;
  age_segment?: string;
}

export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
}

export interface SegmentData {
  name: string;
  value: number;
  color: string;
}

export interface ChartData {
  label: string;
  data: number[];
}

export interface CampaignData {
  id: string;
  name: string;
  type: 'email' | 'sms';
  segment: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  reach: number;
  response: number;
  createdAt: string;
  scheduledFor?: string;
}
