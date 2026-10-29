import test from 'node:test';
import assert from 'node:assert';

// ---------------------------------------------------------------------------
// Safe localStorage mock — isolated per test via t.beforeEach/t.afterEach
// ---------------------------------------------------------------------------
const store = new Map();

const localStorageMock = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => { store.set(key, String(value)); },
  removeItem: (key) => { store.delete(key); },
  clear: () => { store.clear(); },
};

// Install the mock before we load the module under test
globalThis.localStorage = localStorageMock;

const {
  getSavedPlans,
  savePlan,
  updateSavedPlan,
  deleteSavedPlan,
  clearAllSavedPlans,
  getSavedPlanById,
} = await import('../src/storage.ts');

const STORAGE_KEY = 'celebration-planner-saved-plans';

/** Returns minimal valid EventDetails for testing. */
function makeDetails(overrides = {}) {
  return {
    eventType: 'Birthday Party',
    eventName: 'Test Event',
    date: '2026-12-01',
    time: '18:00',
    city: 'Delhi',
    guestCount: 50,
    budget: 30000,
    theme: '',
    foodPreferences: '',
    dietaryRequirements: '',
    accessibilityRequirements: '',
    additionalInstructions: '',
    ...overrides,
  };
}

/** Returns a minimal valid EventPlan for testing. */
function makePlan(overrides = {}) {
  return {
    concept: { title: 'Concept', content: 'Test concept', icon: 'Sparkles' },
    schedule: { title: 'Schedule', content: 'Test schedule', icon: 'Clock' },
    budget: { title: 'Budget', content: 'Test budget', icon: 'IndianRupee' },
    menu: { title: 'Menu', content: 'Test menu', icon: 'UtensilsCrossed' },
    decorations: { title: 'Decorations', content: 'Test decorations', icon: 'Palette' },
    checklist: { title: 'Checklist', content: 'Test checklist', icon: 'CheckSquare' },
    invitation: { title: 'Invitation', content: 'Test invitation', icon: 'Mail' },
    risks: { title: 'Risks', content: 'Test risks', icon: 'Shield' },
    ...overrides,
  };
}

// Clear store before each top-level test so tests are fully isolated.
test.beforeEach(() => { store.clear(); });

// ───────────────────────────────────────────────────────────────────────────
// 1. getSavedPlans — Read
// ───────────────────────────────────────────────────────────────────────────
test('getSavedPlans returns empty array when nothing is stored', () => {
  assert.deepStrictEqual(getSavedPlans(), []);
});

test('getSavedPlans returns empty array when stored value is null', () => {
  store.set(STORAGE_KEY, null);
  assert.deepStrictEqual(getSavedPlans(), []);
});

test('getSavedPlans returns plans that were previously saved', () => {
  const details = makeDetails();
  const plan = makePlan();
  savePlan(details, plan);
  const plans = getSavedPlans();
  assert.strictEqual(plans.length, 1);
  assert.strictEqual(plans[0].eventDetails.eventName, 'Test Event');
});

// ───────────────────────────────────────────────────────────────────────────
// 2. savePlan — Create
// ───────────────────────────────────────────────────────────────────────────
test('savePlan creates a SavedPlan with expected shape', () => {
  const saved = savePlan(makeDetails(), makePlan());
  assert.ok(saved.id.startsWith('plan-'));
  assert.strictEqual(saved.eventDetails.eventName, 'Test Event');
  assert.ok(saved.createdAt);
  assert.ok(saved.updatedAt);
  assert.strictEqual(saved.createdAt, saved.updatedAt);
});

test('savePlan prepends new plans (most recent first)', () => {
  savePlan(makeDetails({ eventName: 'First' }), makePlan());
  savePlan(makeDetails({ eventName: 'Second' }), makePlan());
  const plans = getSavedPlans();
  assert.strictEqual(plans.length, 2);
  assert.strictEqual(plans[0].eventDetails.eventName, 'Second');
  assert.strictEqual(plans[1].eventDetails.eventName, 'First');
});

test('savePlan persists to localStorage', () => {
  savePlan(makeDetails(), makePlan());
  const raw = store.get(STORAGE_KEY);
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.strictEqual(parsed.length, 1);
});

// ───────────────────────────────────────────────────────────────────────────
// 3. updateSavedPlan — Update
// ───────────────────────────────────────────────────────────────────────────
test('updateSavedPlan updates plan content for an existing id', () => {
  const saved = savePlan(makeDetails(), makePlan());
  const updatedPlan = makePlan({
    concept: { title: 'Concept', content: 'Updated concept', icon: 'Sparkles' },
  });
  const result = updateSavedPlan(saved.id, updatedPlan);
  assert.ok(result);
  assert.strictEqual(result.plan.concept.content, 'Updated concept');
  // updatedAt should be a valid ISO date string
  assert.ok(result.updatedAt);
  assert.ok(!isNaN(new Date(result.updatedAt).getTime()));
});

test('updateSavedPlan also updates eventDetails when provided', () => {
  const saved = savePlan(makeDetails(), makePlan());
  const newDetails = makeDetails({ eventName: 'Renamed Event' });
  const result = updateSavedPlan(saved.id, makePlan(), newDetails);
  assert.ok(result);
  assert.strictEqual(result.eventDetails.eventName, 'Renamed Event');
});

test('updateSavedPlan returns null for a non-existent id', () => {
  savePlan(makeDetails(), makePlan());
  const result = updateSavedPlan('plan-nonexistent-999', makePlan());
  assert.strictEqual(result, null);
});

test('updateSavedPlan does not alter other saved plans', () => {
  const first = savePlan(makeDetails({ eventName: 'First' }), makePlan());
  savePlan(makeDetails({ eventName: 'Second' }), makePlan());
  updateSavedPlan(first.id, makePlan({
    concept: { title: 'Concept', content: 'Changed', icon: 'Sparkles' },
  }));
  const plans = getSavedPlans();
  assert.strictEqual(plans.length, 2);
  const second = plans.find(p => p.eventDetails.eventName === 'Second');
  assert.strictEqual(second.plan.concept.content, 'Test concept');
});

// ───────────────────────────────────────────────────────────────────────────
// 4. deleteSavedPlan — Delete
// ───────────────────────────────────────────────────────────────────────────
test('deleteSavedPlan removes the plan with the given id', () => {
  const saved = savePlan(makeDetails(), makePlan());
  const result = deleteSavedPlan(saved.id);
  assert.strictEqual(result, true);
  assert.strictEqual(getSavedPlans().length, 0);
});

test('deleteSavedPlan returns false for a non-existent id', () => {
  savePlan(makeDetails(), makePlan());
  const result = deleteSavedPlan('plan-does-not-exist');
  assert.strictEqual(result, false);
  assert.strictEqual(getSavedPlans().length, 1);
});

test('deleteSavedPlan only removes the targeted plan', () => {
  const first = savePlan(makeDetails({ eventName: 'Keep' }), makePlan());
  const second = savePlan(makeDetails({ eventName: 'Remove' }), makePlan());
  deleteSavedPlan(second.id);
  const plans = getSavedPlans();
  assert.strictEqual(plans.length, 1);
  assert.strictEqual(plans[0].id, first.id);
});

// ───────────────────────────────────────────────────────────────────────────
// 5. clearAllSavedPlans
// ───────────────────────────────────────────────────────────────────────────
test('clearAllSavedPlans removes the storage key entirely', () => {
  savePlan(makeDetails(), makePlan());
  savePlan(makeDetails({ eventName: 'Another' }), makePlan());
  clearAllSavedPlans();
  assert.deepStrictEqual(getSavedPlans(), []);
  assert.strictEqual(store.has(STORAGE_KEY), false);
});

// ───────────────────────────────────────────────────────────────────────────
// 6. getSavedPlanById — Lookup
// ───────────────────────────────────────────────────────────────────────────
test('getSavedPlanById returns the correct plan', () => {
  savePlan(makeDetails({ eventName: 'A' }), makePlan());
  const second = savePlan(makeDetails({ eventName: 'B' }), makePlan());
  const result = getSavedPlanById(second.id);
  assert.ok(result);
  assert.strictEqual(result.eventDetails.eventName, 'B');
});

test('getSavedPlanById returns undefined for missing id', () => {
  savePlan(makeDetails(), makePlan());
  const result = getSavedPlanById('plan-missing');
  assert.strictEqual(result, undefined);
});

// ───────────────────────────────────────────────────────────────────────────
// 7. Corrupt JSON resilience
// ───────────────────────────────────────────────────────────────────────────
test('getSavedPlans returns empty array when stored JSON is corrupt', () => {
  store.set(STORAGE_KEY, '{not valid json!!!');
  const plans = getSavedPlans();
  assert.deepStrictEqual(plans, []);
});

test('getSavedPlans returns empty array when stored value is a non-array JSON', () => {
  store.set(STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
  assert.deepStrictEqual(getSavedPlans(), []);
});

test('getSavedPlans returns empty array when stored value is a JSON string', () => {
  store.set(STORAGE_KEY, JSON.stringify('just a string'));
  assert.deepStrictEqual(getSavedPlans(), []);
});

test('getSavedPlans returns empty array when stored value is a JSON number', () => {
  store.set(STORAGE_KEY, JSON.stringify(42));
  assert.deepStrictEqual(getSavedPlans(), []);
});

// ───────────────────────────────────────────────────────────────────────────
// 8. Edge cases — missing / empty IDs
// ───────────────────────────────────────────────────────────────────────────
test('deleteSavedPlan with empty string id does not remove any plan', () => {
  savePlan(makeDetails(), makePlan());
  const result = deleteSavedPlan('');
  // An empty id won't match any plan's id (which starts with "plan-")
  assert.strictEqual(result, false);
  assert.strictEqual(getSavedPlans().length, 1);
});

test('updateSavedPlan with empty string id returns null', () => {
  savePlan(makeDetails(), makePlan());
  const result = updateSavedPlan('', makePlan());
  assert.strictEqual(result, null);
});

test('getSavedPlanById with empty string returns undefined', () => {
  savePlan(makeDetails(), makePlan());
  assert.strictEqual(getSavedPlanById(''), undefined);
});

// ───────────────────────────────────────────────────────────────────────────
// 9. Multiple CRUD operations in sequence
// ───────────────────────────────────────────────────────────────────────────
test('full lifecycle: create, read, update, read, delete, read', () => {
  // Create
  const saved = savePlan(makeDetails({ eventName: 'Lifecycle' }), makePlan());
  assert.strictEqual(getSavedPlans().length, 1);

  // Update
  const updatedPlan = makePlan({
    menu: { title: 'Menu', content: 'New menu content', icon: 'UtensilsCrossed' },
  });
  const updated = updateSavedPlan(saved.id, updatedPlan);
  assert.ok(updated);
  assert.strictEqual(getSavedPlanById(saved.id).plan.menu.content, 'New menu content');

  // Delete
  assert.strictEqual(deleteSavedPlan(saved.id), true);
  assert.strictEqual(getSavedPlans().length, 0);
  assert.strictEqual(getSavedPlanById(saved.id), undefined);
});
