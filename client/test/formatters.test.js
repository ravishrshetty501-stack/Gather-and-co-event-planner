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

test('formatINR handles invalid or non-numeric amounts safely without throwing', () => {
  assert.strictEqual(formatINR(NaN), '₹0');
  assert.strictEqual(formatINR(undefined), '₹0');
  assert.strictEqual(formatINR(null), '₹0');
});

test('formatCompactINR formats crore, lakh, and thousand amounts accurately', () => {
  assert.strictEqual(formatCompactINR(250000), '₹2.5 L');
  assert.strictEqual(formatCompactINR(100000), '₹1 L');
  assert.strictEqual(formatCompactINR(15000000), '₹1.5 Cr');
  assert.strictEqual(formatCompactINR(10000000), '₹1 Cr');
  assert.strictEqual(formatCompactINR(45000), '₹45,000');
  assert.strictEqual(formatCompactINR(0), '₹0');
});

test('formatDateINR formats dates into clean localized Indian format', () => {
  const formatted = formatDateINR('2026-11-15');
  assert.ok(formatted.includes('2026') || formatted.includes('Nov') || formatted.includes('15'));

  // Invalid date fallback
  assert.strictEqual(formatDateINR(''), '');
  assert.strictEqual(formatDateINR('invalid-date'), 'invalid-date');
});

test('calculatePerGuest computes safe per-guest allocations without division by zero', () => {
  assert.strictEqual(calculatePerGuest(50000, 50), 1000);
  assert.strictEqual(calculatePerGuest(30000, 40), 750);
  assert.strictEqual(calculatePerGuest(50000, 0), 50000);
  assert.strictEqual(calculatePerGuest(0, 100), 0);
  assert.strictEqual(calculatePerGuest(-500, 10), 0);
});
