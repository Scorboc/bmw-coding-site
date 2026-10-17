import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { parseCsv, encodeCsv } from './csv.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEXT_FIELDS = ['model_name','series','body_type','engine_code','article_code','stage_type','firmware_type'];
const NUMBER_FIELDS = ['stock_power','stock_torque','stage1_power','stage1_torque','stage1_price'];
const OPTIONAL_NUMBERS = ['stage2_power','stage2_torque','stage2_price'];
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };

export function validateRecord(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail(400, 'Некорректная запись.');
  const result = {};
  for (const field of TEXT_FIELDS) {
    const value = input[field] ?? (field === 'firmware_type' ? '30I' : undefined);
    if (typeof value !== 'string' || !value.trim() || value.length > 500) fail(400, `Проверьте поле ${field}.`);
    result[field] = value.trim();
  }
  for (const field of [...NUMBER_FIELDS,...OPTIONAL_NUMBERS]) {
    const value = input[field];
    if (OPTIONAL_NUMBERS.includes(field) && value == null) { result[field] = null; continue; }
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000000) fail(400, `Проверьте число ${field}.`);
    result[field] = value;
  }
  if (!['0','1','draft'].includes(input.status)) fail(400, 'Некорректный статус.');
  result.status = input.status;
  for (const field of ['is_restyling','show_stage2']) {
    if (typeof input[field] !== 'boolean') fail(400, `Проверьте флаг ${field}.`);
    result[field] = input[field];
  }
  return result;
}
function readRecord(row) {
  const r = JSON.parse(row.document);
  return { id: row.id, model_name:r.model_name, series:r.series, body_type:r.body_type, engine_code:r.engine_code,
    article_code:r.article_code, stock:{power:r.stock_power,torque:r.stock_torque},
    stage1:{power:r.stage1_power,torque:r.stage1_torque,price:r.stage1_price},
    stage2:r.stage2_power != null && r.stage2_torque != null ? {power:r.stage2_power,torque:r.stage2_torque,price:r.stage2_price} : null,
    stage_type:r.stage_type,is_restyling:r.is_restyling,status:r.status,show_stage2:r.show_stage2,firmware_type:r.firmware_type };
}
function openDatabase(filename) {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), {recursive:true,mode:0o700});
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS cars (id INTEGER PRIMARY KEY AUTOINCREMENT,document TEXT NOT NULL); CREATE TABLE IF NOT EXISTS errors (code TEXT PRIMARY KEY,document TEXT NOT NULL,search_count INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY,created_at TEXT NOT NULL,device_type TEXT NOT NULL); CREATE TABLE IF NOT EXISTS searches (id INTEGER PRIMARY KEY,created_at TEXT NOT NULL,code TEXT NOT NULL);');
  if (!db.prepare("SELECT value FROM meta WHERE key='seed_version'").get()) {
    db.exec('BEGIN');
    try {
      for (const row of parseCsv(fs.readFileSync(path.join(ROOT,'data/chiptuning.csv'),'utf8'))) {
        const input = {...row,firmware_type:row.firmware_type || '30I',is_restyling:row.is_restyling==='1',show_stage2:false};
        for (const field of NUMBER_FIELDS) input[field]=Number(row[field]);
        for (const field of OPTIONAL_NUMBERS) input[field]=row[field] ? Number(row[field]) : null;
        db.prepare('INSERT INTO cars(document) VALUES(?)').run(JSON.stringify(validateRecord(input)));
      }
      const snapshot=JSON.parse(fs.readFileSync(path.join(ROOT,'data/catalog-seed.json'),'utf8'));
      for(const error of snapshot.errors) db.prepare('INSERT INTO errors(code,document) VALUES(?,?)').run(error.code.toUpperCase(),JSON.stringify(error));
      db.prepare('INSERT INTO meta(key,value) VALUES(?,?)').run('seed_version','1');
      db.prepare('INSERT INTO meta(key,value) VALUES(?,?)').run('data_source','repository-seed');
      db.exec('COMMIT');
    } catch(error) {db.exec('ROLLBACK');db.close();throw error;}
  }
  return db;
}
function id(value) { if (!Number.isSafeInteger(value) || value<1) fail(400,'Некорректный ID.'); return value; }
function authenticated(req, secret) {
  if (!secret || secret.length<32) fail(503,'Административный ключ ещё не настроен.');
  const parts=(req.headers.authorization ?? '').split(/\s+/);
  const token=parts.length===2 && parts[0].toLowerCase()==='bearer' ? parts[1] : '';
  const a=Buffer.from(secret),b=Buffer.from(token);
  if (a.length!==b.length || !timingSafeEqual(a,b)) fail(401,'Доступ не подтверждён.');
}
async function jsonBody(req) {
  let length=0; const chunks=[];
  for await (const chunk of req) {length+=chunk.length;if(length>2*1024*1024)fail(413,'Запрос слишком большой.');chunks.push(chunk);}
  try { const body=JSON.parse(Buffer.concat(chunks).toString() || '{}');if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body; }
  catch {fail(400,'Некорректный JSON.');}
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.mp3':'audio/mpeg','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};

export function createApp(options={}) {
  const db=openDatabase(options.dbPath ?? path.join(ROOT,'.private/site.sqlite'));
  const adminToken=options.adminToken ?? process.env.ADMIN_API_TOKEN;
  const aiKey=options.aiKey ?? process.env.POLZA_AI_API_KEY;
  const aiProvider=options.aiProvider ?? process.env.AI_PROVIDER ?? 'ollama';
  const localAI=aiProvider==='ollama';
  const aiBase=options.aiBase ?? process.env.AI_BASE_URL ?? (localAI?'http://127.0.0.1:11434':'https://api.polza.ai/api/v1');
  const aiModel=options.aiModel ?? process.env.AI_MODEL ?? (localAI?'qwen3:4b':'openai/gpt-4o-mini');
  const aiConfigured=localAI||Boolean(aiKey);
  const limits=new Map();
  function rateLimit(req, bucket='ai', maximum=10) {
    const key=bucket+':'+(req.socket.remoteAddress ?? 'unknown'), now=Date.now();
    const current=limits.get(key); const limit=current && now-current.start<60000 ? current : {start:now,count:0};
    if(++limit.count>maximum)fail(429,'Слишком много запросов. Попробуйте через минуту.');
    if(limits.size>10000)for(const [key,value] of limits)if(now-value.start>=60000)limits.delete(key);
    limits.set(key,limit);
  }
  async function generate(req, body) {
    rateLimit(req);
    if(!aiConfigured)fail(503,'AI ещё не подключён. Настройте локальную модель или ключ провайдера.');
    if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>40)fail(400,'Некорректный диалог.');
    let total=0;
    for(const message of body.messages) {
      if(!message||!['user','assistant','system'].includes(message.role)||typeof message.content!=='string')fail(400,'Некорректное сообщение.');
      total+=message.content.length;
    }
    if(total>20000)fail(400,'Диалог слишком длинный. Начните новый.');
    let response;
    const messages=body.messages.map(({role,content})=>({role,content}));
    try {response=await fetch(`${aiBase.replace(/\/$/,'')}${localAI?'/api/chat':'/chat/completions'}`,{method:'POST',headers:{...(!localAI?{Authorization:`Bearer ${aiKey}`}:{}) ,'Content-Type':'application/json'},body:JSON.stringify(localAI?{model:aiModel,messages,stream:false,think:true,options:{num_predict:2048,num_ctx:4096,temperature:0.5}}:{model:aiModel,messages,max_tokens:800,temperature:0.5}),signal:AbortSignal.timeout(localAI?120000:45000)});}
    catch {fail(502,'Провайдер AI временно недоступен.');}
    if(!response.ok)fail(502,'Провайдер AI отклонил запрос. Проверьте ключ и лимит в кабинете провайдера.');
    let data;try {data=await response.json();}catch {fail(502,'Некорректный ответ AI.');}
    const content=localAI?data.message?.content:data.choices?.[0]?.message?.content;
    if(typeof content!=='string'||!content.trim())fail(502,'AI не вернул ответ.');
    return {content,model:aiModel,usage:localAI?{prompt_tokens:data.prompt_eval_count,completion_tokens:data.eval_count}:data.usage,finish_reason:localAI?data.done_reason:data.choices[0].finish_reason};
  }
  const server=http.createServer(async(req,res)=>{
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    try {
      const url=new URL(req.url,'http://localhost'), action=url.searchParams.get('action');
      if(url.pathname.startsWith('/api/')) {
        if(!['GET','POST'].includes(req.method))fail(405,'Метод не поддерживается.');
        // Same-origin browser requests only. CLI callers still require the administrative bearer key.
        if(req.headers['sec-fetch-site']==='cross-site')fail(403,'Недопустимый источник запроса.');
        if(req.method==='POST'&&req.headers.origin) {
          let origin;try{origin=new URL(req.headers.origin);}catch{fail(403,'Недопустимый источник запроса.');}
          if(origin.host!==req.headers.host)fail(403,'Недопустимый источник запроса.');
        }
        if(url.pathname==='/api/health'&&req.method==='GET')return send(200,{ok:true,database:'sqlite',aiConfigured,aiProvider,dataSource:'repository-seed'});
        const body=req.method==='POST' ? await jsonBody(req) : {};
        if(url.pathname==='/api/visit'&&req.method==='POST') {
          rateLimit(req,'visits',120);
          db.prepare('INSERT INTO visits(created_at,device_type) VALUES(?,?)').run(new Date().toISOString(),body.mobile===true?'mobile':'desktop');
          return send(200,{success:true});
        }
        if(url.pathname==='/api/ai') {
          if(action==='models'&&req.method==='GET')return send(200,{models:[{id:aiModel,name:aiModel,description:localAI?'Локальная модель на вашем компьютере':'Прямое подключение к провайдеру'}],provider:aiProvider,configured:aiConfigured});
          if(req.method!=='POST')fail(404,'Метод AI не найден.');
          if(action==='generate')return send(200,await generate(req,body));
          if(action==='test') {authenticated(req,adminToken);const answer=await generate(req,{messages:[{role:'user',content:'Ответь: OK'}]});return send(200,{message:'Подключение работает',response:answer.content,model:aiModel});}
          fail(404,'Метод AI не найден.');
        }
        if(url.pathname!=='/api/data')fail(404,'API не найден.');
        const protectedRequest=url.searchParams.get('admin')==='1'||['analytics_overview','analytics_errors'].includes(action)||['add','update','delete','sync_csv','import'].includes(body.action)||(req.method==='POST'&&action!=='ask_ai');
        if(protectedRequest)authenticated(req,adminToken);
        if(action==='analytics_overview'||action==='analytics_errors') {
          const popular_errors=db.prepare('SELECT document,search_count FROM errors ORDER BY search_count DESC LIMIT 10').all().map(row=>({...JSON.parse(row.document),search_count:row.search_count}));
          if(action==='analytics_errors')return send(200,{errors:popular_errors});
          const count=sql=>Number(db.prepare(sql).get().count);
          return send(200,{total_visits_30d:count("SELECT count(*) count FROM visits WHERE datetime(created_at)>=datetime('now','-30 days')"),today_visits:count("SELECT count(*) count FROM visits WHERE date(created_at)=date('now')"),error_searches_7d:count("SELECT count(*) count FROM searches WHERE datetime(created_at)>=datetime('now','-7 days')"),popular_errors,
            visits_chart:db.prepare("SELECT date(created_at) date,count(*) visits FROM visits WHERE datetime(created_at)>=datetime('now','-14 days') GROUP BY date(created_at) ORDER BY date").all(),devices:db.prepare("SELECT device_type,count(*) count FROM visits WHERE datetime(created_at)>=datetime('now','-30 days') GROUP BY device_type").all()});
        }
        if(action==='get_popular_errors')return send(200,db.prepare('SELECT document,search_count FROM errors ORDER BY search_count DESC,code').all().map(row=>({...JSON.parse(row.document),search_count:row.search_count})));
        if(action==='get_error') {
          const code=(url.searchParams.get('code')??'').toUpperCase();if(!/^[A-Z0-9]{1,20}$/.test(code))fail(400,'Некорректный код ошибки.');
          const row=db.prepare('SELECT document,search_count FROM errors WHERE code=?').get(code);
          rateLimit(req,'searches',120);
          db.prepare('INSERT INTO searches(created_at,code) VALUES(?,?)').run(new Date().toISOString(),code);
          if(row)db.prepare('UPDATE errors SET search_count=search_count+1 WHERE code=?').run(code);
          return send(200,row?{found:true,error:{...JSON.parse(row.document),search_count:row.search_count+1}}:{found:false});
        }
        if(action==='ask_ai'&&req.method==='POST') {
          if(typeof body.question!=='string'||!body.question.trim()||body.question.length>2000)fail(400,'Введите вопрос до 2000 символов.');
          const row=db.prepare('SELECT document FROM errors WHERE code=?').get(String(body.code??'').toUpperCase());
          const result=await generate(req,{messages:[{role:'system',content:'Ты консультант BMW. Не выдумывай неисправности и цены; уточняй необходимость диагностики. Справочная запись: '+(row?row.document:'не найдена')},{role:'user',content:body.question}]});
          return send(200,{answer:result.content});
        }
        if(req.method==='POST') {
          const operation=body.action;
          if(operation==='import') {
            if(!Array.isArray(body.records)||!body.records.length||body.records.length>1000)fail(400,'Импортируйте от 1 до 1000 записей.');
            const records=body.records.map(validateRecord);
            db.exec('BEGIN');
            try{for(const record of records)db.prepare('INSERT INTO cars(document) VALUES(?)').run(JSON.stringify(record));db.exec('COMMIT');}
            catch(error){db.exec('ROLLBACK');throw error;}
            return send(200,{success:true,added:records.length});
          }
          if(operation==='add') {const record=validateRecord(body.data);const result=db.prepare('INSERT INTO cars(document) VALUES(?)').run(JSON.stringify(record));return send(200,{success:true,id:Number(result.lastInsertRowid)});}
          if(operation==='update') {const record=validateRecord(body.data);const result=db.prepare('UPDATE cars SET document=? WHERE id=?').run(JSON.stringify(record),id(body.id));if(!result.changes)fail(404,'Запись не найдена.');return send(200,{success:true});}
          if(operation==='delete') {const result=db.prepare('DELETE FROM cars WHERE id=?').run(id(body.id));if(!result.changes)fail(404,'Запись не найдена.');return send(200,{success:true});}
          if(operation==='sync_csv') {
            const fields=[...TEXT_FIELDS.slice(0,5),...NUMBER_FIELDS,...OPTIONAL_NUMBERS,'stage_type','is_restyling','status','show_stage2','firmware_type'];
            const rows=db.prepare('SELECT document FROM cars ORDER BY id').all().map(row=>JSON.parse(row.document));
            return send(200,{success:true,csv:encodeCsv([fields,...rows.map(row=>fields.map(field=>typeof row[field]==='boolean'?Number(row[field]):row[field]))]),filename:'chiptuning.csv',message:'CSV создан из вашей базы.'});
          }
          fail(400,'Неизвестная операция.');
        }
        const records=db.prepare('SELECT id,document FROM cars ORDER BY id').all().map(readRecord);
        if(url.searchParams.get('admin')==='1')return send(200,records);
        const published=records.filter(row=>row.status==='1');
        if(action==='variants')return send(200,published);
        const series=published.filter(row=>row.series.toLowerCase()===(url.searchParams.get('series')??'').toLowerCase());
        if(action==='bodies')return send(200,[...new Set(series.map(row=>row.body_type))]);
        if(action==='engines')return send(200,series.filter(row=>row.body_type===url.searchParams.get('body_type')).map(row=>({...row,stage2:row.show_stage2&&row.stage2?.price!=null?row.stage2:null})));
        if(action)fail(404,'Неизвестный метод.');
        return send(200,[...new Set(published.map(row=>row.series))]);
      }
      // Serve only production build assets; server sources, database and environment are never served.
      const staticRoot=path.join(ROOT,'dist');let pathname;
      try{pathname=decodeURIComponent(url.pathname);}catch{fail(400,'Некорректный путь.');}
      if(pathname.startsWith('/data/')||pathname.includes('\\')||pathname.split('/').some(part=>part.startsWith('.')))fail(404,'Файл не найден.');
      let file=path.resolve(staticRoot,'.'+pathname);
      if(!file.startsWith(staticRoot+path.sep))file=path.join(staticRoot,'index.html');
      if(!fs.existsSync(file)||!fs.statSync(file).isFile()) {
        if(path.extname(pathname))fail(404,'Файл не найден.');
        file=path.join(staticRoot,'index.html');
      }
      if(!fs.existsSync(file))fail(503,'Сначала выполните npm run build.');
      if(!['GET','HEAD'].includes(req.method))fail(405,'Метод не поддерживается.');
      const size=fs.statSync(file).size;
      const headers={'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':pathname.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache','Accept-Ranges':'bytes'};
      if(req.headers.range) {
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!match||(!match[1]&&!match[2]))fail(416,'Некорректный диапазон.');
        const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
        const end=match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||start>end)fail(416,'Некорректный диапазон.');
        res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});
        if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
      } else {
        res.writeHead(200,{...headers,'Content-Length':size});
        if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
      }
    } catch(error) {if(!res.headersSent)send(error.status??500,{error:error.status?error.message:'Ошибка сервера.'});else res.end();}
  });
  server.requestTimeout=30000;server.headersTimeout=10000;
  return {server,db};
}
