
import { Lead, LeadTemperature } from '../types';

export const calculateLeadScore = (lead: Partial<Lead>): { score: number; temperature: LeadTemperature } => {
  let score = 0;

  // Website status scoring (40 points)
  if (!lead.websiteUrl || lead.websiteUrl.trim() === '') {
    score += 40; // High gap = high potential for our services
  } else if (lead.websiteUrl.includes('broken') || lead.websiteUrl.includes('error')) {
    score += 30;
  } else {
    score += 10; // Basic presence exists
  }

  // Business Category scoring (30 points)
  const highValueSectors = ['manufacturing', 'real estate', 'healthcare', 'export', 'automotive'];
  if (highValueSectors.some(sector => lead.category?.toLowerCase().includes(sector))) {
    score += 30;
  } else {
    score += 15;
  }

  // City/Market scoring (20 points)
  const tier1Cities = ['bangalore', 'mumbai', 'delhi', 'pune', 'gurgaon'];
  if (tier1Cities.some(city => lead.city?.toLowerCase().includes(city))) {
    score += 20;
  } else {
    score += 10;
  }

  // Final Temperature Classification
  let temperature: LeadTemperature = 'cold';
  if (score >= 75) temperature = 'hot';
  else if (score >= 40) temperature = 'warm';

  return { score, temperature };
};
