import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {OWNER_MAPPING_VERSION, validateSourceHeaders, validateOwnerDraft,
  renderOwnerMappingHtml} from '../preprocessing/self-owner-mapping.mjs';
const headers=['거래일','판매처','금액','비고'];
const sha=createHash('sha256').update('synthetic sample').digest('hex');
const draft=()=>({version:OWNER_MAPPING_VERSION,source_sha256:sha,
  mapping:{date:'거래일',channel:'판매처',amount:'금액'},period:'monthly'});

test('P8 explicit 3-field draft yields canonical P3 SELF config without approval flags',()=>{
 const out=validateOwnerDraft(headers,sha,draft());
 assert.deepEqual(out,{columns:[
  {key:'date',source:'거래일',type:'date',required:true},
  {key:'channel',source:'판매처',type:'text',required:true},
  {key:'amount',source:'금액',type:'decimal',required:true}],
  mapping:{date:'거래일',channel:'판매처',amount:'금액'},period:'monthly'});
 assert.doesNotMatch(JSON.stringify(out),/APPROVED|GRANTED|SECRET_ROW/);
});
test('P8 changed source digest or untrusted field refuses',()=>{
 for(const mutate of [d=>d.source_sha256='0'.repeat(64),d=>d.mapping.amount='미존재',
  d=>d.mapping.amount='판매처',d=>d.period='yearly',d=>d.approved=true,
  d=>d.mapping.extra='x',d=>d.version='APPROVED',d=>d.mapping.date=0]){
  const d=draft();mutate(d);assert.throws(()=>validateOwnerDraft(headers,sha,d),TypeError);
 }
});
test('P8 NFKC/hidden/header formula duplicates fail closed',()=>{
 for(const hs of [['a','Ａ','판매처'],['일자','금액\u200b','판매처'],
   ['=HYPERLINK(1)','판매처','금액'],['a','a','b'],['a','b'],['a','b',null]]){
    assert.throws(()=>validateSourceHeaders(hs),TypeError);
 }
});
test('P8 safe Korean HTML no customer row, inline script has CSP SHA',()=>{
 const html=renderOwnerMappingHtml(headers,sha);
 assert.match(html,/매핑 초안 JSON 저장/);
 assert.doesNotMatch(html,/PRIVATE_ROW|SECRET_ROW|fetch\(|XMLHttpRequest/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const scriptHash=createHash('sha256').update(script).digest('base64');
 assert.ok(html.includes(scriptHash));assert.match(html,/connect-src &#39;none&#39;/);
 assert.equal((html.match(/value="" selected/g)||[]).length,3);
});
test('P8 hostile header is escaped as text, never active markup',()=>{
 const h=renderOwnerMappingHtml(['일자','금액','<img src=x onerror=alert(1)>'],sha);
 assert.match(h,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.doesNotMatch(h,/<img/);
});
test('P8 original header and draft objects remain unchanged',()=>{
 const hs=[...headers],d=draft(),before=structuredClone(d);
 validateOwnerDraft(hs,sha,d);renderOwnerMappingHtml(hs,sha);
 assert.deepEqual(d,before);assert.deepEqual(hs,headers);
});
