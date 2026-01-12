
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

export const MOCK_LEADS: Lead[] = [
  { 
    id: '1', 
    businessName: 'TechNova Solutions', 
    category: 'IT Services', 
    email: 'hello@technova.com', 
    websiteUrl: 'https://technova.io', 
    city: 'Bangalore', 
    status: 'has_website', 
    score: 45, 
    temperature: 'warm', 
    createdAt: '2023-11-20', 
    orgId: 'org1',
    lead_status: 'has_website',
    is_hot_opportunity: false,
    source: 'google_maps',
    estimated_value: 25000,
    service_tier: 'Tier 1 - Digital Presence',
    rating: 4.2,
    phone: '+91 90000 11111',
    pitch_type: 'seo_audit'
  },
  { 
    id: '2', 
    businessName: 'GreenLeaf Realty', 
    category: 'Real Estate', 
    email: 'sales@greenleaf.in', 
    websiteUrl: '', 
    city: 'Mumbai', 
    status: 'no_website', 
    score: 88, 
    temperature: 'hot', 
    createdAt: '2023-11-21', 
    orgId: 'org2',
    lead_status: 'no_website',
    is_hot_opportunity: true,
    source: 'google_maps',
    estimated_value: 150000,
    service_tier: 'Tier 3 - Business Automation',
    rating: 3.8,
    phone: '+91 91111 22222',
    pitch_type: 'website_development'
  },
  { 
    id: '3', 
    businessName: 'Peak Performance Gym', 
    category: 'Fitness', 
    email: 'peakgym@gmail.com', 
    websiteUrl: '', 
    city: 'Delhi', 
    status: 'no_website', 
    score: 72, 
    temperature: 'warm', 
    createdAt: '2023-11-22', 
    orgId: 'org1',
    lead_status: 'no_website',
    is_hot_opportunity: true,
    source: 'manual',
    estimated_value: 45000,
    service_tier: 'Tier 1 - Digital Presence',
    rating: 3.5,
    phone: '+91 92222 33333',
    pitch_type: 'website_development'
  },
  { 
    id: '4', 
    businessName: 'Royal Spices Exports', 
    category: 'Manufacturing', 
    email: 'info@royalspices.com', 
    websiteUrl: 'https://royalspices.com', 
    city: 'Kochi', 
    status: 'scored', 
    score: 92, 
    temperature: 'hot', 
    createdAt: '2023-11-23', 
    orgId: 'org1',
    lead_status: 'scored',
    is_hot_opportunity: true,
    source: 'manual',
    estimated_value: 250000,
    service_tier: 'Tier 3 - Business Automation',
    rating: 4.8,
    phone: '+91 93333 44444',
    pitch_type: 'crm_setup'
  }
];

export const MOCK_DEALS: Deal[] = [
  { 
    id: 'd1', 
    leadId: '2', 
    businessName: 'GreenLeaf Realty', 
    stage: 'qualified', 
    value: 150000, 
    updatedAt: '2023-11-25',
    service_tier: 'Tier 3 - Business Automation',
    pitch_type: 'website_development'
  },
  { 
    id: 'd2', 
    leadId: '4', 
    businessName: 'Royal Spices Exports', 
    stage: 'proposal', 
    value: 250000, 
    updatedAt: '2023-11-26',
    service_tier: 'Tier 3 - Business Automation',
    pitch_type: 'crm_setup'
  }
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
