
import { Lead, LeadTemperature, PitchType, ServiceTier, LeadStatus } from '../types';

export const calculateLeadScore = (lead: Partial<Lead>): { 
  score: number; 
  temperature: LeadTemperature; 
  pitch_type: PitchType;
  service_tier: ServiceTier;
  est_contract_value: number;
  is_hot_opportunity: boolean;
  lead_status: LeadStatus;
} => {
  let score = 0;
  const website = lead.website || (lead as any).website_url || '';
  let hasNoWebsite = !website || website.trim() === '';

  // Website status scoring (40 points)
  if (hasNoWebsite) {
    score += 40;
  } else if (website.includes('broken') || website.includes('error')) {
    score += 30;
  } else {
    score += 10;
  }

  // Business Category scoring (30 points)
  const highValueSectors = ['manufacturing', 'real estate', 'healthcare', 'export', 'automotive'];
  const isHighValue = highValueSectors.some(sector => lead.category?.toLowerCase().includes(sector));
  if (isHighValue) {
    score += 30;
  } else {
    score += 15;
  }

  // City/Market scoring (20 points)
  const tier1Cities = ['bangalore', 'mumbai', 'delhi', 'pune', 'gurgaon'];
  const isTier1 = tier1Cities.some(city => lead.city?.toLowerCase().includes(city));
  if (isTier1) {
    score += 20;
  } else {
    score += 10;
  }

  // Determine Pitch and Tier based on your database requirements
  let pitch_type: PitchType = 'lead_gen';
  let service_tier: ServiceTier = 'Tier 1 - Digital Presence';
  let est_contract_value = 25000;

  if (hasNoWebsite) {
    pitch_type = 'website_development';
    service_tier = 'Tier 1 - Digital Presence';
    est_contract_value = 45000;
  } else if (score > 80) {
    pitch_type = 'crm_setup';
    service_tier = 'Tier 3 - Business Automation';
    est_contract_value = 150000;
  } else if (score > 60) {
    pitch_type = 'seo_audit';
    service_tier = 'Tier 2 - Growth System';
    est_contract_value = 85000;
  }

  // Final Temperature and Hot Opportunity
  let temperature: LeadTemperature = 'cold';
  if (score >= 75) temperature = 'hot';
  else if (score >= 40) temperature = 'warm';

  // Strict mapping to your lead_status enum
  const is_hot_opportunity = score >= 80 || (hasNoWebsite && isHighValue);
  const lead_status: LeadStatus = hasNoWebsite ? 'no_website' : 'has_website';

  return { 
    score, 
    temperature, 
    pitch_type, 
    service_tier, 
    est_contract_value, 
    is_hot_opportunity, 
    lead_status 
  };
};
