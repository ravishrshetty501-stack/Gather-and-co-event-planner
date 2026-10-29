/**
 * Centralized formatting and calculation utilities for Indian event planning.
 * Standardizes rupee currency formatting, compact crore/lakh representations, and date display.
 */

/**
 * Formats a numeric amount in Indian Rupees using the Indian numbering system.
 * e.g., 50000 -> "₹50,000"
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Formats large amounts into compact Indian financial units (Crores, Lakhs).
 * e.g., 250000 -> "₹2.5 L", 15000000 -> "₹1.5 Cr", 45000 -> "₹45,000"
 */
export function formatCompactINR(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '₹0';
  }
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, '')} L`;
  }
  return formatINR(amount);
}

/**
 * Formats an ISO timestamp or YYYY-MM-DD date string into an Indian full/medium readable date.
 * Handles calendar date-only strings safely without UTC timezone shift.
 */
export function formatDateINR(dateString: string, style: 'full' | 'medium' = 'medium'): string {
  if (!dateString) return '';

  // Calendar date-only format (YYYY-MM-DD): parse parts directly to avoid UTC day-offset in non-IST zones
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);
    // Guard against silent Date overflow (e.g. month 99, Feb 30 → Mar 2)
    if (
      localDate.getFullYear() !== year ||
      localDate.getMonth() !== month - 1 ||
      localDate.getDate() !== day
    ) {
      return dateString;
    }
    return localDate.toLocaleDateString('en-IN', { dateStyle: style });
  }

  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString('en-IN', { dateStyle: style });
}

/**
 * Calculates per-guest budget safely, avoiding divide-by-zero errors.
 */
export function calculatePerGuest(budget: number, guestCount: number): number {
  const safeGuests = Math.max(1, Math.round(guestCount || 1));
  const safeBudget = Math.max(0, budget || 0);
  return Math.round(safeBudget / safeGuests);
}
