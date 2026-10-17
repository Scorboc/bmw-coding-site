import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
import { parseCsv } from '../server/csv.mjs';
const variants = parseCsv(fs.readFileSync(path.join(root, 'data/chiptuning.csv'), 'utf8'))
  .filter(row => row.status === '1').map(row => ({
    model_name: row.model_name, series: row.series, body_type: row.body_type, engine_code: row.engine_code,
    stock: { power: Number(row.stock_power), torque: Number(row.stock_torque) },
    stage1: { power: Number(row.stage1_power), torque: Number(row.stage1_torque), price: Number(row.stage1_price) },
    stage2: null, show_stage2: false, status: '1', stage_type: row.stage_type, snapshot: true,
  }));
const errors = new Map();
const value = "'((?:[^']|'')*)'";
const pattern = new RegExp(`\\(\\s*${value}\\s*,\\s*${value}\\s*,\\s*${value}\\s*,\\s*${value}\\s*,\\s*ARRAY\\[([\\s\\S]*?)\\]\\s*,\\s*ARRAY\\[([\\s\\S]*?)\\]\\s*,\\s*ARRAY\\[([\\s\\S]*?)\\]\\s*,\\s*ARRAY\\[([\\s\\S]*?)\\]\\s*,\\s*${value}\\s*\\)`, 'g');
const unquote = text => text.replace(/''/g, "'");
const array = text => [...text.matchAll(new RegExp(value, 'g'))].map(match => unquote(match[1]));
for (const file of ['V0022__create_error_codes_system.sql', 'V0023__add_all_bmw_error_codes.sql', 'V0024__add_comprehensive_bmw_error_codes.sql']) {
  const sql = fs.readFileSync(path.join(root, 'db_migrations', file), 'utf8');
  for (const match of sql.matchAll(pattern)) {
    const [, code, title, description, severity, causes, symptoms, solutions, systems, category] = match;
    if (errors.has(code)) continue; // Match INSERT ... ON CONFLICT DO NOTHING.
    errors.set(code, { id: errors.size + 1, code, title: unquote(title), description: unquote(description), severity,
      common_causes: array(causes), symptoms: array(symptoms), solutions: array(solutions), related_systems: array(systems), category, search_count: 0 });
  }
}
if (!variants.length || !errors.has('P0171')) throw new Error('Snapshot sources could not be parsed');
const target = path.join(root, 'data/catalog-seed.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify({ source: 'repository-snapshot', variants, errors: [...errors.values()] }));
console.log(`Snapshot: ${variants.length} published variants, ${errors.size} error codes. Stage 2 prices absent in CSV; omitted.`);
