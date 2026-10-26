import test from 'node:test';
import assert from 'node:assert';
import { markdownToHtml } from '../src/markdown.ts';

test('markdownToHtml converts headings correctly', () => {
  assert.ok(markdownToHtml('# Heading 1').includes('<h1>Heading 1</h1>'));
  assert.ok(markdownToHtml('## Heading 2').includes('<h2>Heading 2</h2>'));
  assert.ok(markdownToHtml('### Heading 3').includes('<h3>Heading 3</h3>'));
  assert.ok(markdownToHtml('#### Heading 4').includes('<h4>Heading 4</h4>'));
});

test('markdownToHtml converts bold, italics, and inline code', () => {
  const input = 'This is **bold**, *italic*, and `code`.';
  const html = markdownToHtml(input);
  assert.ok(html.includes('<strong>bold</strong>'));
  assert.ok(html.includes('<em>italic</em>'));
  assert.ok(html.includes('<code'));
});

test('markdownToHtml converts tables properly', () => {
  const table = `
| Category | Cost |
|---|---|
| Venue | ₹50,000 |
| Food | ₹80,000 |
`;
  const html = markdownToHtml(table);
  assert.ok(html.includes('<table'));
  assert.ok(html.includes('<th>Category</th>'));
  assert.ok(html.includes('<td>₹50,000</td>'));
});

test('markdownToHtml sanitizes dangerous HTML and prevents script injection', () => {
  const maliciousInput = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
  const html = markdownToHtml(maliciousInput);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img'));
});

test('markdownToHtml sanitizes malicious link protocols', () => {
  const safeLink = '[Google](https://google.com)';
  const evilLink = '[Click Me](javascript:alert("hacked"))';

  const safeHtml = markdownToHtml(safeLink);
  const evilHtml = markdownToHtml(evilLink);

  assert.ok(safeHtml.includes('<a href="https://google.com"'));
  assert.ok(!evilHtml.includes('href="javascript:'));
  assert.ok(evilHtml.includes('Click Me'));
});

test('markdownToHtml converts checkboxes and lists', () => {
  const input = `
- [x] Confirmed venue
- [ ] Send invitations
- Simple bullet point
`;
  const html = markdownToHtml(input);
  assert.ok(html.includes('✅ Confirmed venue'));
  assert.ok(html.includes('☐ Send invitations'));
  assert.ok(html.includes('<li>Simple bullet point</li>'));
});
