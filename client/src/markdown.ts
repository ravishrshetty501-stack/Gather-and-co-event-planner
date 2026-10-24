/**
 * Simple markdown to HTML converter.
 * Handles: headings, bold, italic, lists, tables, blockquotes, horizontal rules, links, line breaks.
 * No external dependencies.
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';

  let html = md;

  // Escape HTML entities (but preserve markdown syntax chars)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore blockquote > that we just escaped
  html = html.replace(/^&gt; /gm, '> ');
  html = html.replace(/^&gt;$/gm, '>');

  // Tables
  html = convertTables(html);

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr/>');
  html = html.replace(/^___+$/gm, '<hr/>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:var(--purple-50);padding:2px 6px;border-radius:4px;font-size:0.88em;">$1</code>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--purple-300);padding-left:16px;color:var(--text-secondary);margin:8px 0;">$1</blockquote>');

  // Checkbox lists
  html = html.replace(/^- \[x\] (.+)$/gm, '<li style="list-style:none;margin-left:-20px;">✅ $1</li>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<li style="list-style:none;margin-left:-20px;">⬜ $1</li>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^• (.+)$/gm, '<li>$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs — wrap remaining text blocks
  const lines = html.split('\n');
  const result: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBlock = /^<(h[1-6]|ul|ol|li|blockquote|hr|table|thead|tbody|tr|th|td)/.test(trimmed);
    const isEmpty = trimmed === '';

    if (isBlock) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      result.push(line);
    } else if (isEmpty) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
    } else {
      if (!inParagraph) {
        result.push('<p>');
        inParagraph = true;
      }
      result.push(line);
    }
  }
  if (inParagraph) {
    result.push('</p>');
  }

  return result.join('\n');
}

function convertTables(md: string): string {
  const lines = md.split('\n');
  const result: string[] = [];
  let tableLines: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableRow = /^\|.+\|$/.test(line);
    const isSeparator = /^\|[\s\-:|]+\|$/.test(line);

    if (isTableRow || isSeparator) {
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      if (inTable) {
        result.push(buildTable(tableLines));
        inTable = false;
        tableLines = [];
      }
      result.push(lines[i]);
    }
  }

  if (inTable) {
    result.push(buildTable(tableLines));
  }

  return result.join('\n');
}

function buildTable(lines: string[]): string {
  const rows = lines.filter(l => !/^\|[\s\-:|]+\|$/.test(l));
  if (rows.length === 0) return '';

  const parseRow = (row: string) =>
    row.split('|').slice(1, -1).map(cell => cell.trim());

  let html = '<table>';

  if (rows.length > 0) {
    const headerCells = parseRow(rows[0]);
    html += '<thead><tr>';
    headerCells.forEach(cell => {
      html += `<th>${cell}</th>`;
    });
    html += '</tr></thead>';
  }

  if (rows.length > 1) {
    html += '<tbody>';
    for (let i = 1; i < rows.length; i++) {
      const cells = parseRow(rows[i]);
      html += '<tr>';
      cells.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody>';
  }

  html += '</table>';
  return html;
}
