
export type LeadStatus = 'discovered' | 'audit_viewed' | 'form_submitted' | 'calendar_booked' | 'meeting_done' | 'proposal_sent' | 'converted';
export type LeadTemperature = 'hot' | 'warm' | 'cold';
export type UserRole = 'super_admin' | 'admin' | 'sales' | 'client' | 'agent';

export interface Lead {
  id: string;
  businessName: string;
  category: string;
  email: string;
  websiteUrl: string;
  city: string;
  status: LeadStatus;
  score: number;
  temperature: LeadTemperature;
  createdAt: string;
  orgId?: string;
}

export interface Deal {
  id: string;
  leadId: string;
  businessName: string;
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  type: string;
  startDate: string;
  nextMilestone: string;
}

export interface AuditResult {
  summary: string;
  gaps: string[];
  recommendations: string[];
  score: number;
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
  planName: 'Starter Care' | 'Growth Automation' | 'Business Ops Pro';
  amount: number;
  status: 'active' | 'paused' | 'cancelled';
  billingCycle: 'monthly' | 'yearly';
  nextBilling: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'scoring' | 'calendar';
  status: 'active' | 'inactive';
  lastRun: string;
  successRate: number;
}
