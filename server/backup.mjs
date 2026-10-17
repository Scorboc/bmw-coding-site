import {DatabaseSync,backup} from 'node:sqlite';import fs from 'node:fs';import path from 'node:path';import {ROOT} from './app.mjs';
try{process.loadEnvFile(path.join(ROOT,'.env.server.local'));}catch(error){if(error.code!=='ENOENT')throw error;}
const source=process.env.DB_PATH?path.resolve(process.env.DB_PATH):path.join(ROOT,'.private/site.sqlite');
if(!fs.existsSync(source))throw Error('Database does not exist yet. Start the server first.');
const dir=path.join(ROOT,'.private/backups');fs.mkdirSync(dir,{recursive:true,mode:0o700});
const destination=path.join(dir,`site-${new Date().toISOString().replaceAll(':','-')}.sqlite`);
const db=new DatabaseSync(source,{readOnly:true});try{await backup(db,destination);console.log('SQLite backup created in .private/backups.');}finally{db.close();}
