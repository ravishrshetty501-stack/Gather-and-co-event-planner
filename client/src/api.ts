import type { EventDetails, GenerateResponse } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function checkHealth(): Promise<{ status: string; geminiConfigured: boolean }> {
  const res = await fetch(`${API_BASE}/api/health`);
  return handleResponse(res);
}

export async function generatePlan(eventDetails: EventDetails): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventDetails),
  });
  return handleResponse(res);
}

export async function regenerateSection(
  sectionKey: string,
  sectionTitle: string,
  eventDetails: EventDetails,
  currentContent: string
): Promise<{ content: string }> {
  const res = await fetch(`${API_BASE}/api/regenerate-section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionKey, sectionTitle, eventDetails, currentContent }),
  });
  return handleResponse(res);
}
