import { createApp, ROOT } from './app.mjs';
import path from 'node:path';
try { process.loadEnvFile(path.join(ROOT,'.env.server.local')); } catch(error) { if(error.code!=='ENOENT')throw error; }
const {server,db}=createApp({dbPath:process.env.DB_PATH?path.resolve(process.env.DB_PATH):undefined});
const host=process.env.HOST??'127.0.0.1',port=Number(process.env.PORT??5187);
server.listen(port,host,()=>console.log(`BMW server: http://${host}:${port} (SQLite; AI ${process.env.AI_PROVIDER??'ollama'})`));
function stop(){server.close(()=>{db.close();process.exit(0)});}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
