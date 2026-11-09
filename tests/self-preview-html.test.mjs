import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderSelfBatchHtml,SELF_HTML_VERSION} from '../preprocessing/self-preview-html.mjs';
import {SELF_BATCH_VERSION} from '../preprocessing/self-preview-batch.mjs';
import {executeHtmlPreview} from '../preprocessing/self-preview-html-cli.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const command=join(root,'preprocessing','self-preview-html-cli.mjs');
const fake={
 version:SELF_BATCH_VERSION,status:'READY_FOR_OWNER_REVIEW',
 preprocessing_approval:'NOT_GRANTED',owner_approval:'NOT_GRANTED',
 execution:'NOT_PERFORMED',outbound_transfer:false,source_modified:false,
 item_count:2,source_rows:3,hold_sources:0,
 items:[
  {id:'first',source_sha256:'a'.repeat(64),source_rows:2,status:'READY_FOR_OWNER_REVIEW'},
  {id:'second',source_sha256:'b'.repeat(64),source_rows:1,status:'READY_FOR_OWNER_REVIEW'}
 ],
 summary:{period:'monthly',positive_amount:'300.00',
 negative_adjustment:'10.00',net_amount:'290.00'}
};
const clone=o=>JSON.parse(JSON.stringify(o));
function withTemp(fn) {
 const dir=mkdtempSync(join(tmpdir(),'smax-html-review-'));
 const columns=[
  {key:'date',source:'일자',type:'date',required:true},
  {key:'channel',source:'판매처',type:'text',required:true},
  {key:'amount',source:'금액',type:'decimal',required:true}
 ];
 const csv='일자,판매처,금액,메모\n2026-11-01,온라인,100,PRIVATE_CLIENT_812\n2026-11-02,매장,-10,SECRET\n';
 const input=join(dir,'sample.csv'),cfg=join(dir,'sample.json'),manifest=join(dir,'manifest.json');
 writeFileSync(input,csv);
 writeFileSync(cfg,JSON.stringify({columns,mapping:{date:'일자',channel:'판매처',amount:'금액'},period:'monthly'}));
 writeFileSync(manifest,JSON.stringify({version:1,sources:[{id:'source_a',input:'sample.csv',config:'sample.json'}]}));
 try {return fn({dir,input,cfg,manifest})}
 finally{rmSync(dir,{recursive:true,force:true})}
}
const run=m=>spawnSync(process.execPath,[command,'--manifest',m],
  {cwd:root,encoding:'utf8',timeout:30000,maxBuffer:512*1024});

test('strict verified receipt renders readable, fully offline and unapproved HTML',()=>{
 const html=renderSelfBatchHtml(fake);
 assert.match(html,/<!doctype html>/);
 assert.match(html,/<html lang="ko">/);
 assert.match(html,/content="no-referrer"/);
 assert.match(html,/Content-Security-Policy/);
 assert.match(html,/script-src &#39;none&#39;/);
 assert.match(html,/form-action &#39;none&#39;/);
 assert.match(html,/290\.00/);
 assert.match(html,/NOT_GRANTED|승인·작업 실행/);
 assert.match(html,new RegExp(SELF_HTML_VERSION));
 assert.doesNotMatch(html,/<script\b/i);
 assert.doesNotMatch(html,/<img\b/i);
 assert.doesNotMatch(html,/https?:\/\//i);
});
test('safe HTML includes only aggregate, IDs and sha; never source/customer content',()=>{
 const html=renderSelfBatchHtml(fake);
 for(const secret of ['PRIVATE_CLIENT_812','온라인','매장','source_cells',
                      'reportCsv','/user/secret.csv'])assert.equal(html.includes(secret),false);
});
test('HOLD suppresses every numeric money field',()=>{
 const hold=clone(fake);
 hold.status='REVIEW_HOLD';
 hold.hold_sources=1;
 hold.items[1].status='REVIEW_HOLD';
 hold.summary=null;
 const html=renderSelfBatchHtml(hold);
 assert.match(html,/검토가 필요한 데이터/);
 for(const money of ['290.00','300.00','10.00'])assert.equal(html.includes(money),false);
});
test('never trust changed approval or claimed execution',()=>{
 for(const field of ['preprocessing_approval','owner_approval','execution']){
   const tampered=clone(fake);
   tampered[field]='GRANTED';
   assert.throws(()=>renderSelfBatchHtml(tampered),TypeError);
 }
 for(const field of ['outbound_transfer','source_modified']){
   const tampered=clone(fake);tampered[field]=true;
   assert.throws(()=>renderSelfBatchHtml(tampered),TypeError);
 }
});
test('tampered net or negative totals are rejected',()=>{
 for(const value of ['280.00','NaN','1e3','1,000.00',null]){
  const tampered=clone(fake);tampered.summary.net_amount=value;
  assert.throws(()=>renderSelfBatchHtml(tampered),TypeError);
 }
});
test('extra raw value fields and source URLs are refused rather than rendered',()=>{
 for(const field of ['raw_csv','customer_details','script','source_path']){
  const tampered=clone(fake);tampered[field]='private_info';
  assert.throws(()=>renderSelfBatchHtml(tampered),TypeError);
 }
});
test('invalid malicious ID or duplicate hash cannot be rendered',()=>{
 const injected=clone(fake);injected.items[0].id='<script>alert(1)</script>';
 assert.throws(()=>renderSelfBatchHtml(injected),TypeError);
 const dup=clone(fake);dup.items[1].source_sha256=dup.items[0].source_sha256;
 assert.throws(()=>renderSelfBatchHtml(dup),TypeError);
});
test('wrong row/hold counts, unsupported statuses, and missing summary fail',()=>{
 for(const change of [
  d=>{d.source_rows=4},d=>{d.hold_sources=1},
  d=>{d.status='APPROVED'},d=>{d.item_count=3},
  d=>{d.items[0].source_rows=20001},d=>{d.summary=null}
 ]){
   const bad=clone(fake);change(bad);
   assert.throws(()=>renderSelfBatchHtml(bad),TypeError);
 }
});
test('live child process generates HTML with real local synthetic PREP/SELF source',()=>{
 withTemp(({manifest})=>{
  const res=run(manifest);
  assert.equal(res.status,0,res.stderr);
  assert.equal(res.stderr,'');
  assert.match(res.stdout,/<!doctype html>/);
  assert.match(res.stdout,/90\.00/);
  assert.match(res.stdout,/source_a/);
  assert.match(res.stdout,/Content-Security-Policy/);
 });
});
test('live child process flags review and hides monetary totals',()=>{
 withTemp(({manifest,input})=>{
  writeFileSync(input,'일자,판매처,금액\n2026-02-30,온라인,100\n');
  const res=run(manifest);
  assert.equal(res.status,2,res.stderr);
  assert.match(res.stdout,/검토 보류/);
  assert.doesNotMatch(res.stdout,/90\.00/);
 });
});
test('live child process does not leak paths, private cells or exception traces',()=>{
 withTemp(({manifest,input})=>{
  const res=run(manifest);
  const all=res.stdout+res.stderr;
  for(const text of ['PRIVATE_CLIENT_812','SECRET','온라인','매장',input,'source_cells'])
    assert.equal(all.includes(text),false,text);
 });
});
test('live child process does not modify files or create output by itself',()=>{
 withTemp(({manifest,input,cfg,dir})=>{
  const names=readdirSync(dir);
  const saved=[input,cfg,manifest].map(p=>readFileSync(p));
  assert.equal(run(manifest).status,0);
  assert.deepEqual(readdirSync(dir),names);
  for(const [i,p] of [input,cfg,manifest].entries())assert.deepEqual(readFileSync(p),saved[i]);
 });
});
test('invalid manifest, unknown args and non-UTF8 are statically sanitized',()=>{
 withTemp(({manifest})=>{
  writeFileSync(manifest,'{"version":1,"sources":[],"execute":"anything"}');
  const bad=run(manifest);
  assert.equal(bad.status,1);
  assert.equal(bad.stdout,'');
  assert.match(bad.stderr,/INVALID_LOCAL_HTML_PREVIEW_INPUT/);
  assert.doesNotMatch(bad.stderr,/manifest\.json/);
 });
});
test('pure HTML CLI wrapper accepts injection only for tests and enforces receipt validation',()=>{
 const html=executeHtmlPreview(['--manifest','report.json'],
   ()=>'{"version":1,"sources":[{"id":"one","input":"a.csv","config":"a.json"}]}',
   ()=>({...fake,item_count:1,source_rows:2,items:fake.items.slice(0,1),
          summary:{period:'monthly',positive_amount:'100.00',
                   negative_adjustment:'0.00',net_amount:'100.00'}}));
 assert.equal(html.status,'READY_FOR_OWNER_REVIEW');
 assert.match(html.html,/100\.00/);
});
test('malicious injected batch report cannot bypass renderer',()=>{
 assert.throws(()=>executeHtmlPreview(['--manifest','report.json'],
  ()=>'{"version":1,"sources":[{"id":"one","input":"a.csv","config":"a.json"}]}',
  ()=>({...fake,owner_approval:'GRANTED'})),TypeError);
});
