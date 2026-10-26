import type { EventDetails, GenerateResponse } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DEFAULT_TIMEOUT_MS = 30000;

async function handleResponse<T>(res: Response): Promise<T> {
  let data: Record<string, unknown> | null = null;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`Server returned status ${res.status} with unparseable response.`);
  }

  if (!res.ok) {
    const errorMsg = typeof data?.error === 'string' ? data.error : `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data as unknown as T;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection or try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkHealth(): Promise<{ status: string; geminiConfigured: boolean }> {
  const res = await fetchWithTimeout(`${API_BASE}/api/health`, {}, 10000);
  return handleResponse<{ status: string; geminiConfigured: boolean }>(res);
}

export async function generatePlan(eventDetails: EventDetails): Promise<GenerateResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventDetails),
  });
  return handleResponse<GenerateResponse>(res);
}

export async function regenerateSection(
  sectionKey: string,
  sectionTitle: string,
  eventDetails: EventDetails,
  currentContent: string
): Promise<{ content: string }> {
  const res = await fetchWithTimeout(`${API_BASE}/api/regenerate-section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionKey, sectionTitle, eventDetails, currentContent }),
  });
  return handleResponse<{ content: string }>(res);
}
