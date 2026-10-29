import test from 'node:test';
import assert from 'node:assert';
import {
  formatINR,
  formatCompactINR,
  formatDateINR,
  calculatePerGuest,
} from '../src/utils/formatters.ts';

test('formatINR formats currency with Indian rupee symbol and standard comma notation', () => {
  assert.strictEqual(formatINR(50000), '₹50,000');
  assert.strictEqual(formatINR(100000), '₹1,00,000');
  assert.strictEqual(formatINR(1250000), '₹12,50,000');
  assert.strictEqual(formatINR(0), '₹0');
});

test('formatINR handles invalid, non-numeric, or infinite amounts safely without throwing', () => {
  assert.strictEqual(formatINR(NaN), '₹0');
  assert.strictEqual(formatINR(undefined), '₹0');
  assert.strictEqual(formatINR(null), '₹0');
  assert.strictEqual(formatINR(Infinity), '₹0');
  assert.strictEqual(formatINR(-Infinity), '₹0');
});

test('formatCompactINR formats crore, lakh, and thousand amounts accurately', () => {
  assert.strictEqual(formatCompactINR(250000), '₹2.5 L');
  assert.strictEqual(formatCompactINR(100000), '₹1 L');
  assert.strictEqual(formatCompactINR(15000000), '₹1.5 Cr');
  assert.strictEqual(formatCompactINR(10000000), '₹1 Cr');
  assert.strictEqual(formatCompactINR(45000), '₹45,000');
  assert.strictEqual(formatCompactINR(0), '₹0');
});

test('formatDateINR verifies exact calendar-date preservation across month and year boundaries', () => {
  // Calendar dates (YYYY-MM-DD) must preserve exact day without UTC midnight shift
  const startOfYear = formatDateINR('2026-01-01');
  assert.ok(startOfYear.includes('1'), 'Must preserve day 1');
  assert.ok(startOfYear.includes('2026'));

  const midMonth = formatDateINR('2026-12-15');
  assert.ok(midMonth.includes('15'), 'Must preserve day 15');
  assert.ok(midMonth.includes('2026'));

  const endOfYear = formatDateINR('2026-12-31');
  assert.ok(endOfYear.includes('31'), 'Must preserve day 31');
  assert.ok(endOfYear.includes('2026'));

  // Supports both medium and full styles
  const fullStyle = formatDateINR('2026-08-15', 'full');
  assert.ok(fullStyle.includes('15') && fullStyle.includes('2026'));
});

test('formatDateINR returns raw string for impossible calendar dates that overflow silently', () => {
  // Month 99 does not exist — should return the raw input, not overflow to a future year
  assert.strictEqual(formatDateINR('2026-99-99'), '2026-99-99');

  // February 30 does not exist in any year
  assert.strictEqual(formatDateINR('2026-02-30'), '2026-02-30');

  // April 31 does not exist (April has 30 days)
  assert.strictEqual(formatDateINR('2026-04-31'), '2026-04-31');

  // February 29 in a non-leap year (2026 is not a leap year)
  assert.strictEqual(formatDateINR('2026-02-29'), '2026-02-29');

  // Month 13 does not exist
  assert.strictEqual(formatDateINR('2026-13-01'), '2026-13-01');

  // Day 0 is not a valid calendar day
  assert.strictEqual(formatDateINR('2026-01-00'), '2026-01-00');
});

test('formatDateINR handles clearly defined ISO timestamps across time zones and invalid fallbacks', () => {
  // UTC ISO timestamp (e.g. from savedPlan.createdAt)
  const isoUtc = formatDateINR('2026-10-26T14:30:00.000Z');
  assert.ok(isoUtc.includes('2026'));
  assert.ok(isoUtc.length > 5);

  // Offset-defined ISO timestamps
  const isoWithOffset = formatDateINR('2026-07-04T18:00:00+05:30');
  assert.ok(isoWithOffset.includes('2026') && isoWithOffset.includes('4'));

  // Invalid date and empty string fallbacks
  assert.strictEqual(formatDateINR(''), '');
  assert.strictEqual(formatDateINR('invalid-date'), 'invalid-date');
  assert.strictEqual(formatDateINR('not-a-date'), 'not-a-date');
});

test('calculatePerGuest computes safe per-guest allocations without division by zero', () => {
  assert.strictEqual(calculatePerGuest(50000, 50), 1000);
  assert.strictEqual(calculatePerGuest(30000, 40), 750);
  assert.strictEqual(calculatePerGuest(50000, 0), 50000);
  assert.strictEqual(calculatePerGuest(0, 100), 0);
  assert.strictEqual(calculatePerGuest(-500, 10), 0);
});
