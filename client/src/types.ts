export interface EventDetails {
  eventType: string;
  eventName: string;
  date: string;
  time: string;
  city: string;
  guestCount: number;
  budget: number;
  theme: string;
  foodPreferences: string;
  dietaryRequirements: string;
  accessibilityRequirements: string;
  additionalInstructions: string;
}

export type PlanSectionKey =
  | 'concept'
  | 'schedule'
  | 'budget'
  | 'menu'
  | 'decorations'
  | 'checklist'
  | 'invitation'
  | 'risks';

export interface PlanSection {
  title: string;
  content: string;
  icon: string;
}

export type EventPlan = Record<PlanSectionKey | string, PlanSection>;

export interface GenerateResponse {
  plan: EventPlan;
  rawText: string;
}

export interface SavedPlan {
  id: string;
  eventDetails: EventDetails;
  plan: EventPlan;
  createdAt: string;
  updatedAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const EVENT_TYPES = [
  'Birthday Party',
  'Wedding',
  'Wedding Reception',
  'Engagement',
  'Anniversary',
  'College Event',
  'Corporate Event',
  'Baby Shower',
  'Housewarming',
  'Festival Celebration',
  'Farewell Party',
  'Reunion',
  'Other',
] as const;

export const FOOD_PREFERENCES = [
  'Pure Vegetarian',
  'Vegetarian with Eggs',
  'Non-Vegetarian',
  'Mixed (Veg & Non-Veg)',
  'Vegan',
  'Jain',
] as const;
