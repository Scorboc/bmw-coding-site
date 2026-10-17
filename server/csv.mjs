export function parseCsv(text) {
  const rows = []; let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; } else quoted = !quoted;
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(value.replace(/\r$/, '')); value = '';
      if (char === '\n') { rows.push(row); row = []; }
    } else value += char;
  }
  if (quoted) throw new Error('Unterminated CSV value');
  if (value || row.length) { row.push(value.replace(/\r$/, '')); rows.push(row); }
  const headers = rows.shift() ?? [];
  if (rows.some(row => row.length !== headers.length)) throw new Error('CSV columns mismatch');
  return rows.map(row => Object.fromEntries(headers.map((name, i) => [name, row[i]])));
}
export function encodeCsv(rows) {
  return rows.map(row => row.map(value => {
    let text = String(value ?? '');
    // Prevent formula execution when the exported catalogue is opened in Excel.
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }).join(',')).join('\r\n');
}
