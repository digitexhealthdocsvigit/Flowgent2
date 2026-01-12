
import { Lead, LeadTemperature, PitchType, ServiceTier, LeadStatus } from '../types';

export const calculateLeadScore = (lead: Partial<Lead>): { 
  score: number; 
  temperature: LeadTemperature; 
  pitch_type: PitchType;
  service_tier: ServiceTier;
  estimated_value: number;
  is_hot_opportunity: boolean;
  lead_status: LeadStatus;
} => {
  let score = 0;
  let hasNoWebsite = !lead.websiteUrl || lead.websiteUrl.trim() === '';

  // Website status scoring (40 points)
  if (hasNoWebsite) {
    score += 40;
  } else if (lead.websiteUrl?.includes('broken') || lead.websiteUrl?.includes('error')) {
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

  // Determine Pitch and Tier
  let pitch_type: PitchType = 'lead_gen';
  let service_tier: ServiceTier = 'Tier 1 - Digital Presence';
  let estimated_value = 25000;

  if (hasNoWebsite) {
    pitch_type = 'website_development';
    service_tier = 'Tier 1 - Digital Presence';
    estimated_value = 45000;
  } else if (score > 80) {
    pitch_type = 'crm_setup';
    service_tier = 'Tier 3 - Business Automation';
    estimated_value = 150000;
  } else if (score > 60) {
    pitch_type = 'seo_audit';
    service_tier = 'Tier 2 - Growth System';
    estimated_value = 85000;
  }

  // Final Temperature and Hot Opportunity
  let temperature: LeadTemperature = 'cold';
  if (score >= 75) temperature = 'hot';
  else if (score >= 40) temperature = 'warm';

  const is_hot_opportunity = score >= 80 || (hasNoWebsite && isHighValue);
  const lead_status: LeadStatus = hasNoWebsite ? 'no_website' : 'has_website';

  return { 
    score, 
    temperature, 
    pitch_type, 
    service_tier, 
    estimated_value, 
    is_hot_opportunity, 
    lead_status 
  };
};
