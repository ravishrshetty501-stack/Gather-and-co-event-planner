const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const {
  app,
  sanitizeString,
  callWithTimeout,
  buildPrompt,
  parseGeneratedPlan,
  generateSmartFallbackPlan,
  regenerateSmartSection,
} = require('../index.js');

let server;
let baseUrl;

test.before(async () => {
  await new Promise(resolve => {
    // Listen on ephemeral port (0) for reliable concurrent testing
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
});

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(path, baseUrl);
    const req = http.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      res => {
        let raw = '';
        res.on('data', chunk => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.get(url, res => {
      let raw = '';
      res.on('data', chunk => (raw += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
  });
}

// -------------------------------------------------------------
// 1. Endpoint & System Health Tests
// -------------------------------------------------------------
test('GET / returns API metadata and operational status', async () => {
  const res = await getJson('/');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'operational');
  assert.strictEqual(res.data.name, 'Gather & Co. API');
});

test('GET /api/health returns status ok and gemini configuration status', async () => {
  const res = await getJson('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'ok');
  assert.strictEqual(typeof res.data.geminiConfigured, 'boolean');
});

// -------------------------------------------------------------
// 2. Input Validation Tests (Positive & Negative)
// -------------------------------------------------------------
test('POST /api/generate-plan rejects request with missing required fields', async () => {
  const res = await postJson('/api/generate-plan', {
    eventName: 'Birthday Celebration',
    // Missing eventType, guestCount, budget
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error.includes('Missing required fields'));
});

test('POST /api/generate-plan rejects invalid guest counts (< 1)', async () => {
  const res = await postJson('/api/generate-plan', {
    eventType: 'Birthday Party',
    eventName: 'Family Dinner',
    guestCount: 0,
    budget: 20000,
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error.includes('Guest count'));
});

test('POST /api/generate-plan rejects invalid guest counts (> 10,000)', async () => {
  const res = await postJson('/api/generate-plan', {
    eventType: 'Festival Celebration',
    eventName: 'Mega Fest',
    guestCount: 15000,
    budget: 500000,
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error.includes('Guest count'));
});

test('POST /api/generate-plan rejects budget under ₹1,000', async () => {
  const res = await postJson('/api/generate-plan', {
    eventType: 'Birthday Party',
    eventName: 'Small Gathering',
    guestCount: 10,
    budget: 500,
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error.includes('Budget must be at least ₹1,000'));
});

test('POST /api/generate-plan handles string numbers gracefully', async () => {
  const res = await postJson('/api/generate-plan', {
    eventType: 'Anniversary',
    eventName: 'Silver Jubilee',
    guestCount: '50',
    budget: '75000',
    city: 'Bengaluru',
  });
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.plan);
  assert.ok(res.data.plan.budget);
});

// -------------------------------------------------------------
// 3. Fallback Plan Mathematical & Cultural Integrity
// -------------------------------------------------------------
test('Smart fallback plan calculates accurate budget breakdown and per-guest metrics', () => {
  const details = {
    eventType: 'Birthday Party',
    eventName: "Aarav's 30th Birthday Garden Soirée",
    city: 'Bengaluru',
    guestCount: 40,
    budget: 30000,
    theme: 'Garden Party with fairy lights',
    foodPreferences: 'Mixed (Veg & Non-Veg)',
    dietaryRequirements: 'Nut allergy',
    accessibilityRequirements: 'Wheelchair access',
  };

  const plan = generateSmartFallbackPlan(details);

  // Must contain all 8 pillars
  const requiredPillars = ['concept', 'schedule', 'budget', 'menu', 'decorations', 'checklist', 'invitation', 'risks'];
  for (const pillar of requiredPillars) {
    assert.ok(plan[pillar], `Plan missing pillar: ${pillar}`);
    assert.ok(plan[pillar].title, `Pillar ${pillar} missing title`);
    assert.ok(plan[pillar].content.length > 50, `Pillar ${pillar} content too short`);
  }

  // Budget calculations check
  assert.ok(plan.budget.content.includes('₹30,000'));
  assert.ok(plan.budget.content.includes('40 guests'));
  // 30,000 / 40 = 750
  assert.ok(plan.budget.content.includes('₹750'));

  // Personalization context checks
  assert.ok(plan.concept.content.includes('Bengaluru'));
  assert.ok(plan.concept.content.includes('Garden Party'));
  assert.ok(plan.menu.content.includes('Nut allergy'));
  assert.ok(plan.invitation.content.includes("Aarav's 30th Birthday Garden Soirée"));
});

// -------------------------------------------------------------
// 4. Prompt Construction & Output Parser Tests
// -------------------------------------------------------------
test('buildPrompt includes safety guidelines, Indian Rupees, and estimate disclaimers', () => {
  const prompt = buildPrompt({
    eventType: 'Wedding Reception',
    eventName: 'Meera & Rohan Reception',
    guestCount: 200,
    budget: 500000,
    city: 'Mumbai',
    theme: 'Royal Heritage',
    dietaryRequirements: 'Jain options',
    accessibilityRequirements: 'Ground floor only',
  });

  assert.ok(prompt.includes('Indian Rupees (₹)'));
  assert.ok(prompt.includes('ESTIMATES'));
  assert.ok(prompt.includes('Do NOT invent real vendor names'));
  assert.ok(prompt.includes('Jain options'));
  assert.ok(prompt.includes('Ground floor only'));
  assert.ok(prompt.includes('===CONCEPT==='));
  assert.ok(prompt.includes('===SCHEDULE==='));
  assert.ok(prompt.includes('===BUDGET==='));
  assert.ok(prompt.includes('===MENU==='));
  assert.ok(prompt.includes('===DECORATIONS==='));
  assert.ok(prompt.includes('===CHECKLIST==='));
  assert.ok(prompt.includes('===INVITATION==='));
  assert.ok(prompt.includes('===RISKS==='));
});

test('parseGeneratedPlan parses well-formed Gemini marker response correctly', () => {
  const mockGeminiOutput = `
===CONCEPT===
A magical starlit garden celebration.

===SCHEDULE===
- 6:00 PM: Welcome
- 7:30 PM: Dinner

===BUDGET===
Total: ₹30,000

===MENU===
Artisanal mocktails and biryani.

===DECORATIONS===
Fairy lights and brass urns.

===CHECKLIST===
- 2 weeks before: Book venue

===INVITATION===
You are warmly invited!

===RISKS===
Rain contingency plan ready.
`;

  const parsed = parseGeneratedPlan(mockGeminiOutput);
  assert.strictEqual(parsed.concept.content, 'A magical starlit garden celebration.');
  assert.ok(parsed.schedule.content.includes('6:00 PM'));
  assert.ok(parsed.budget.content.includes('₹30,000'));
  assert.ok(parsed.invitation.content.includes('You are warmly invited!'));
});

test('parseGeneratedPlan gracefully falls back if no markers are present', () => {
  const rawText = 'This is an unstructured event plan without section markers.';
  const parsed = parseGeneratedPlan(rawText);
  assert.strictEqual(parsed.concept.content, rawText);
});

// -------------------------------------------------------------
// 5. Section Regeneration Tests
// -------------------------------------------------------------
test('POST /api/regenerate-section regenerates single requested section', async () => {
  const res = await postJson('/api/regenerate-section', {
    sectionKey: 'menu',
    sectionTitle: 'Food & Menu',
    eventDetails: {
      eventName: 'Graduation Party',
      eventType: 'College Event',
      guestCount: 30,
      budget: 25000,
      city: 'Delhi',
      foodPreferences: 'Pure Vegetarian',
    },
    currentContent: 'Previous menu',
  });

  assert.strictEqual(res.status, 200);
  assert.ok(res.data.content);
  assert.ok(res.data.content.length > 50);
});

test('POST /api/regenerate-section rejects requests missing sectionKey or eventDetails', async () => {
  const res = await postJson('/api/regenerate-section', {
    sectionKey: 'menu',
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

// -------------------------------------------------------------
// 6. Security, Resilience & Boundary Tests
// -------------------------------------------------------------
test('sanitizeString utility trims and enforces character boundaries safely', () => {
  assert.strictEqual(sanitizeString('  hello world  ', 10), 'hello worl');
  assert.strictEqual(sanitizeString(12345, 10), '');
  assert.strictEqual(sanitizeString(null, 10), '');
  assert.strictEqual(sanitizeString(undefined, 10), '');
});

test('callWithTimeout resolves when completed in time and rejects on timeout', async () => {
  // Fast operation
  const fast = new Promise(resolve => setTimeout(() => resolve('done'), 20));
  const result = await callWithTimeout(fast, 100);
  assert.strictEqual(result, 'done');

  // Slow operation exceeding timeout
  const slow = new Promise(resolve => setTimeout(() => resolve('too-late'), 150));
  await assert.rejects(
    async () => {
      await callWithTimeout(slow, 30);
    },
    /Operation timed out/
  );
});

test('POST /api/generate-plan rejects budget exceeding maximum cap', async () => {
  const res = await postJson('/api/generate-plan', {
    eventType: 'Wedding',
    eventName: 'Royal Celebration',
    guestCount: 500,
    budget: 2000000000, // Exceeds ₹100 Cr cap
  });
  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error.includes('Budget'));
});

test('POST /api/generate-plan safely sanitizes event input and avoids crashing on HTML payloads', async () => {
  const res = await postJson('/api/generate-plan', {
    eventType: '<script>alert("XSS")</script> Birthday',
    eventName: '<b>Aarav Celebration</b>',
    guestCount: 25,
    budget: 25000,
  });
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.plan);
});

test('GET /api/nonexistent-route returns 404 with safe JSON format', async () => {
  const res = await getJson('/api/nonexistent-endpoint');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.data.error, 'API route not found');
});
