import fs from 'node:fs';import path from 'node:path';import {randomBytes} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const env=path.join(root,'.env.server.local');
if(!fs.existsSync(env)) {
  fs.writeFileSync(env,`ADMIN_API_TOKEN=${randomBytes(32).toString('hex')}\nAI_PROVIDER=ollama\nAI_MODEL=qwen3:4b\n# Optional paid provider: AI_PROVIDER=polza\n# POLZA_AI_API_KEY=\n`,{mode:0o600});
  console.log('Created private .env.server.local with an administrator key. Key is not printed.');
} else console.log('Existing server configuration preserved.');
