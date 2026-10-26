import type { SavedPlan, EventDetails, EventPlan } from './types';

const STORAGE_KEY = 'celebration-planner-saved-plans';

export function getSavedPlans(): SavedPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read saved plans from storage:', err);
    return [];
  }
}

export function savePlan(eventDetails: EventDetails, plan: EventPlan): SavedPlan {
  const plans = getSavedPlans();
  const now = new Date().toISOString();
  const newPlan: SavedPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    eventDetails,
    plan,
    createdAt: now,
    updatedAt: now,
  };
  plans.unshift(newPlan);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save plan to storage:', err);
  }
  return newPlan;
}

export function updateSavedPlan(
  id: string,
  plan: EventPlan,
  eventDetails?: EventDetails
): SavedPlan | null {
  const plans = getSavedPlans();
  const idx = plans.findIndex(p => p.id === id);
  if (idx !== -1) {
    plans[idx].plan = plan;
    if (eventDetails) {
      plans[idx].eventDetails = eventDetails;
    }
    plans[idx].updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (err) {
      console.error('Failed to update plan in storage:', err);
    }
    return plans[idx];
  }
  return null;
}

export function deleteSavedPlan(id: string): boolean {
  try {
    const plans = getSavedPlans();
    const initialLen = plans.length;
    const updated = plans.filter(p => String(p.id).trim() !== String(id).trim());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.length < initialLen;
  } catch (err) {
    console.error('Failed to delete plan from storage:', err);
    return false;
  }
}

export function clearAllSavedPlans(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear saved plans from storage:', err);
  }
}

export function getSavedPlanById(id: string): SavedPlan | undefined {
  return getSavedPlans().find(p => p.id === id);
}

