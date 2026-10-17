import {spawn} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const api=spawn(process.execPath,['server/index.mjs'],{cwd:root,stdio:'inherit',env:{...process.env,HOST:'127.0.0.1',PORT:'5190'}});
const web=spawn(process.execPath,['node_modules/vite/bin/vite.js',...process.argv.slice(2)],{cwd:root,stdio:'inherit'});
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;api.kill();web.kill();setTimeout(()=>process.exit(code),100).unref();}
api.on('exit',code=>stop(code??1));web.on('exit',code=>stop(code??1));process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
