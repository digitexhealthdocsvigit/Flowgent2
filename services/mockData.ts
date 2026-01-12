
import { Lead, Deal, Notification, Project, User, Subscription, AutomationWorkflow } from '../types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Rahul Sharma',
  email: 'rahul@digitex.in',
  role: 'admin',
  orgId: 'org1'
};

export const MOCK_CLIENT: User = {
  id: 'u2',
  name: 'Sunil Mehta',
  email: 'sunil@greenleaf.in',
  role: 'client',
  orgId: 'org2'
};

// Fixed mock leads to include all mandatory properties from the Lead interface and use valid LeadStatus values
export const MOCK_LEADS: Lead[] = [
  { 
    id: '1', 
    businessName: 'TechNova Solutions', 
    category: 'IT Services', 
    email: 'hello@technova.com', 
    websiteUrl: 'https://technova.io', 
    city: 'Bangalore', 
    status: 'discovered', 
    score: 45, 
    temperature: 'warm', 
    createdAt: '2023-11-20', 
    orgId: 'org1',
    lead_status: 'discovered',
    is_hot_opportunity: false,
    source: 'google_maps'
  },
  { 
    id: '2', 
    businessName: 'GreenLeaf Realty', 
    category: 'Real Estate', 
    email: 'sales@greenleaf.in', 
    websiteUrl: 'https://greenleafrealty.com', 
    city: 'Mumbai', 
    status: 'audit_viewed', 
    score: 78, 
    temperature: 'hot', 
    createdAt: '2023-11-21', 
    orgId: 'org2',
    lead_status: 'audit_viewed',
    is_hot_opportunity: true,
    source: 'google_maps'
  },
  { 
    id: '3', 
    businessName: 'Peak Performance Gym', 
    category: 'Fitness', 
    email: 'peakgym@gmail.com', 
    websiteUrl: 'https://peakgym.com', 
    city: 'Delhi', 
    status: 'form_submitted', 
    score: 12, 
    temperature: 'cold', 
    createdAt: '2023-11-22', 
    orgId: 'org1',
    lead_status: 'form_submitted',
    is_hot_opportunity: false,
    source: 'manual'
  },
  { 
    id: '4', 
    businessName: 'Royal Spices Exports', 
    category: 'Manufacturing', 
    email: 'info@royalspices.com', 
    websiteUrl: 'https://royalspices.com', 
    city: 'Kochi', 
    status: 'calendar_booked', 
    score: 92, 
    temperature: 'hot', 
    createdAt: '2023-11-23', 
    orgId: 'org1',
    lead_status: 'calendar_booked',
    is_hot_opportunity: true,
    source: 'manual'
  },
  { 
    id: '5', 
    businessName: 'BlueSky Clinics', 
    category: 'Healthcare', 
    email: 'contact@blueskyclinics.com', 
    websiteUrl: 'https://blueskyclinics.in', 
    city: 'Pune', 
    status: 'discovered', 
    score: 30, 
    temperature: 'warm', 
    createdAt: '2023-11-24', 
    orgId: 'org1',
    lead_status: 'discovered',
    is_hot_opportunity: false,
    source: 'google_maps'
  },
  { 
    id: '6', 
    businessName: 'Elite Motors', 
    category: 'Automotive', 
    email: 'sales@elitemotors.com', 
    websiteUrl: 'https://elitemotors.co.in', 
    city: 'Gurgaon', 
    status: 'proposal_sent', 
    score: 85, 
    temperature: 'hot', 
    createdAt: '2023-11-25', 
    orgId: 'org1',
    lead_status: 'proposal_sent',
    is_hot_opportunity: true,
    source: 'manual'
  },
];

export const MOCK_DEALS: Deal[] = [
  { id: 'd1', leadId: '2', businessName: 'GreenLeaf Realty', stage: 'qualified', value: 85000, updatedAt: '2023-11-25' },
  { id: 'd2', leadId: '4', businessName: 'Royal Spices Exports', stage: 'proposal', value: 240000, updatedAt: '2023-11-26' },
  { id: 'd3', leadId: '6', businessName: 'Elite Motors', stage: 'negotiation', value: 120000, updatedAt: '2023-11-27' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'CRM Implementation', status: 'active', progress: 65, type: 'Automation', startDate: '2023-11-01', nextMilestone: 'User Training' },
  { id: 'p2', name: 'Website Redesign', status: 'active', progress: 40, type: 'Digital Presence', startDate: '2023-11-10', nextMilestone: 'SEO Audit' },
  { id: 'p3', name: 'WhatsApp Funnel', status: 'completed', progress: 100, type: 'Marketing', startDate: '2023-10-15', nextMilestone: 'Post-launch Review' },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', orgId: 'org2', clientName: 'GreenLeaf Realty', planName: 'Growth Automation', amount: 8000, status: 'active', billingCycle: 'monthly', nextBilling: '2023-12-25' },
  { id: 's2', orgId: 'org3', clientName: 'Elite Motors', planName: 'Business Ops Pro', amount: 25000, status: 'active', billingCycle: 'monthly', nextBilling: '2023-12-20' },
  { id: 's3', orgId: 'org4', clientName: 'TechNova', planName: 'Starter Care', amount: 2000, status: 'paused', billingCycle: 'monthly', nextBilling: '2024-01-01' },
];

export const MOCK_WORKFLOWS: AutomationWorkflow[] = [
  { id: 'w1', name: 'Hot Lead Email Outreach', type: 'email', status: 'active', lastRun: '12m ago', successRate: 98 },
  { id: 'w2', name: 'WhatsApp Appointment Reminder', type: 'whatsapp', status: 'active', lastRun: '2h ago', successRate: 94 },
  { id: 'w3', name: 'Digital Health Lead Scoring', type: 'scoring', status: 'active', lastRun: '5m ago', successRate: 100 },
  { id: 'w4', name: 'Cal.com Sync to CRM', type: 'calendar', status: 'active', lastRun: '1h ago', successRate: 97 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'lead', title: 'New Hot Lead', message: 'Elite Motors just requested a priority audit.', timestamp: '5m ago', isRead: false },
  { id: 'n2', type: 'meeting', title: 'Upcoming Meeting', message: 'Strategy call with GreenLeaf in 45 minutes.', timestamp: '20m ago', isRead: false },
  { id: 'n3', type: 'deal', title: 'Deal Won!', message: 'Royal Spices project has been approved.', timestamp: '1h ago', isRead: true },
  { id: 'n4', type: 'automation', title: 'Automation Alert', message: 'Monthly SEO audit triggered for 12 clients.', timestamp: '3h ago', isRead: true },
];
