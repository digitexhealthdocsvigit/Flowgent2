
export type LeadStatus = 'discovered' | 'no_website' | 'has_website' | 'scored' | 'converted' | 'contacted' | 'lost';
export type LeadTemperature = 'hot' | 'warm' | 'cold';
export type UserRole = 'super_admin' | 'admin' | 'sales' | 'client' | 'agent';
export type PitchType = 'website_development' | 'seo_audit' | 'lead_gen' | 'crm_setup' | 'seo' | 'automation';
export type ServiceTier = 'Tier 1 - Digital Presence' | 'Tier 2 - Growth System' | 'Tier 3 - Business Automation';

export interface DecisionNode {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface RadarMetrics {
  presence: number;
  automation: number;
  seo: number;
  capture: number;
}

export interface Lead {
  id: string;
  business_name: string;
  category: string;
  email: string;
  website: string;
  city: string;
  status: LeadStatus;
  score: number;
  temperature: LeadTemperature;
  created_at: string;
  org_id?: string;
  lead_status: LeadStatus;
  pitch_type?: PitchType;
  is_hot_opportunity: boolean;
  service_tier?: ServiceTier;
  est_contract_value?: number;
  source: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  address?: string;
  type?: string;
  google_maps_url?: string;
  has_website?: boolean;
  radar_metrics?: RadarMetrics;
  decision_logic?: DecisionNode[];
  projected_roi_lift?: string;
  readiness_score?: number;
  last_audit_at?: string;
  place_id?: string;
  is_synced_to_n8n?: boolean;
  sync_timestamp?: string;
  ai_audit_completed?: boolean;
  ai_insights?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_id?: string;
  tags: string[];
  last_contacted?: string;
  role?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  city: string;
  contacts_count: number;
  mrr?: number;
}

export interface AuditResult {
  summary: string;
  gaps: string[];
  recommendations: string[];
  score: number;
  projected_roi_lift?: string;
  decision_logic?: DecisionNode[];
  radar_metrics?: RadarMetrics;
}

export interface DealNote {
  id: string;
  text: string;
  created_at: string;
  author: string;
}

export interface DealTask {
  id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
}

export interface Deal {
  id: string;
  leadId: string;
  businessName: string;
  stage: 'Discovered' | 'Contacted' | 'Engaged' | 'Qualified' | 'Converted' | 'new' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number;
  updatedAt: string;
  service_tier?: ServiceTier;
  pitch_type?: PitchType;
  lead_id?: string;
  next_follow_up?: string;
  notes?: DealNote[];
  tasks?: DealTask[];
  attachments?: string[];
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  type: string;
  startDate: string;
  nextMilestone: string;
  velocity_score?: number;
  client_name?: string;
  lead_id?: string;
}

export interface Notification {
  id: string;
  type: 'lead' | 'meeting' | 'deal' | 'automation';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
}

export interface Subscription {
  id: string;
  orgId: string;
  clientName: string;
  planName: string;
  amount: number;
  status: 'active' | 'paused' | 'cancelled' | 'pending_payment';
  billingCycle: 'monthly' | 'yearly';
  nextBilling: string;
  payment_ref?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'scoring' | 'calendar';
  status: 'active' | 'inactive';
  lastRun: string;
  successRate: number;
}

export interface AuditLog {
  id?: string;
  text: string;
  type: string;
  payload?: any;
  created_at?: string;
  lead_id?: string;
  source?: string;
}
