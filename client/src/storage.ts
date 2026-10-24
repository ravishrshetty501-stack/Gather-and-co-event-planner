import type { SavedPlan, EventDetails, EventPlan } from './types';

const STORAGE_KEY = 'celebration-planner-saved-plans';

export function getSavedPlans(): SavedPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return newPlan;
}

export function updateSavedPlan(id: string, plan: EventPlan): void {
  const plans = getSavedPlans();
  const idx = plans.findIndex(p => p.id === id);
  if (idx !== -1) {
    plans[idx].plan = plan;
    plans[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }
}

export function deleteSavedPlan(id: string): void {
  const plans = getSavedPlans().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function getSavedPlanById(id: string): SavedPlan | undefined {
  return getSavedPlans().find(p => p.id === id);
}
