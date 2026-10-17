import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {createApp} from './app.mjs';import {parseCsv} from './csv.mjs';
const token='isolated-test-'+ 'x'.repeat(48);
const example={model_name:'Test BMW',series:'3-series',body_type:'TestBody',engine_code:'TestEngine',article_code:'TEST',stock_power:100,stock_torque:200,stage1_power:130,stage1_torque:250,stage1_price:30000,stage2_power:null,stage2_torque:null,stage2_price:null,stage_type:'St.1',status:'1',is_restyling:false,show_stage2:false,firmware_type:'30I'};
async function fixture(t,options={}) {
 const app=createApp({dbPath:':memory:',adminToken:token,aiKey:'',...options});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${app.server.address().port}`;
 t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));app.db.close();});
 const get=(url,auth=false)=>fetch(base+url,{headers:auth?{Authorization:`bEaReR ${token}`}:{}});
 const post=(url,body,auth=false)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',...(auth?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 return {...app,base,get,post};
}
test('admin gate protects all mutations and both analytics actions, including query/body collision',async t=>{
 const f=await fixture(t);const count=f.db.prepare('SELECT count(*) c FROM cars').get().c;
 for(const action of ['add','update','delete','sync_csv','import'])for(const suffix of ['', '?action=ask_ai']){
   const res=await f.post('/api/data'+suffix,{action,id:1,data:example});assert.equal(res.status,401);
 }
 for(const query of ['admin=1','action=analytics_overview','action=analytics_errors'])assert.equal((await f.get('/api/data?'+query)).status,401);
 assert.equal(f.db.prepare('SELECT count(*) c FROM cars').get().c,count);
 assert.equal((await f.get('/api/data?admin=1',true)).status,200);
});
test('missing admin secret fails closed, malformed JSON and cross-origin writes rejected',async t=>{
 const f=await fixture(t,{adminToken:''});assert.equal((await f.get('/api/data?admin=1')).status,503);
 assert.equal((await fetch(f.base+'/api/data',{method:'POST',body:'[]'})).status,400);
 assert.equal((await fetch(f.base+'/api/data',{method:'POST',headers:{Origin:'https://other.example'},body:'{}'})).status,403);
});
test('real SQLite add update delete and validation preserve types, defaults and IDs',async t=>{
 const f=await fixture(t);let r=await f.post('/api/data',{action:'add',data:example},true);assert.equal(r.status,200);const id=(await r.json()).id;assert(Number.isSafeInteger(id));
 r=await f.post('/api/data',{action:'update',id,data:{...example,stage1_price:12345,status:'draft'}},true);assert.equal(r.status,200);
 const records=await (await f.get('/api/data?admin=1',true)).json();assert.equal(records.find(r=>r.id===id).stage1.price,12345);
 assert(!(await (await f.get('/api/data?action=variants')).json()).some(r=>r.id===id));
 assert.equal((await f.post('/api/data',{action:'update',id,data:{...example,stage1_price:null}},true)).status,400);
 assert.equal((await f.post('/api/data',{action:'delete',id},true)).status,200);
 assert.equal((await f.post('/api/data',{action:'delete',id},true)).status,404);
});
test('public bodies engines and error lookup work independently',async t=>{
 const f=await fixture(t);assert((await (await f.get('/api/data?action=bodies&series=3-series')).json()).includes('F3x'));
 const engines=await (await f.get('/api/data?action=engines&series=3-series&body_type=F3x')).json();assert(engines.length>0);assert.equal(engines[0].stage2,null);
 const error=await (await f.get('/api/data?action=get_error&code=P0171')).json();assert.equal(error.found,true);assert(Array.isArray(error.error.solutions));
 assert.equal((await (await f.get('/api/data?action=get_error&code=ZZ999')).json()).found,false);
});
test('analytics uses actual new visits and search records; CSV preserves commas',async t=>{
 const f=await fixture(t);await f.post('/api/visit',{mobile:true});await f.get('/api/data?action=get_error&code=P0171');
 const data=await (await f.get('/api/data?action=analytics_overview',true)).json();assert.equal(data.today_visits,1);assert.equal(data.error_searches_7d,1);assert.equal(data.devices[0].device_type,'mobile');
 await f.post('/api/data',{action:'add',data:{...example,model_name:'BMW, test'}},true);
 const exported=await (await f.post('/api/data',{action:'sync_csv'},true)).json();assert(exported.success);assert(parseCsv(exported.csv).some(r=>r.model_name==='BMW, test'));
});
test('database persists mutations and deleted catalogue is not reseeded on restart',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bmw-independent-')),dbPath=path.join(dir,'db.sqlite');
 try {let app=createApp({dbPath,adminToken:token});app.db.exec('DELETE FROM cars');app.db.close();app=createApp({dbPath,adminToken:token});assert.equal(app.db.prepare('SELECT count(*) c FROM cars').get().c,0);app.db.close();}
 finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('CSV import validates the entire batch before saving; unpublished rows never reappear',async t=>{
 const f=await fixture(t);const before=f.db.prepare('SELECT count(*) c FROM cars').get().c;
 assert.equal((await f.post('/api/data',{action:'import',records:[example,{...example,stock_power:null}]},true)).status,400);
 assert.equal(f.db.prepare('SELECT count(*) c FROM cars').get().c,before);
 assert.equal((await f.post('/api/data',{action:'import',records:[{...example,status:'draft'}]},true)).status,200);
 assert(!(await (await f.get('/api/data?action=variants')).json()).some(row=>row.model_name==='Test BMW'));
 assert.equal((await f.get('/data/catalog-snapshot.json')).status,404);
});
test('AI does not simulate success without a provider, and server never serves private files',async t=>{
 const f=await fixture(t,{aiProvider:'polza',aiKey:''});assert.equal((await f.post('/api/ai?action=generate',{messages:[{role:'user',content:'Hello'}]})).status,503);
 for(const url of ['/.env.server.local','/.private/site.sqlite','/server/app.mjs','/api/unknown','/data/catalog-snapshot.json','/data/catalog-seed.json'])assert.equal((await f.get(url)).status,404);
});
