import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildOwnerSelfPreview} from '../preprocessing/self-owner-preview.mjs';
import {OWNER_MAPPING_VERSION} from '../preprocessing/self-owner-mapping.mjs';
const csv='날짜,채널,금액,메모\n2026-11-01,온라인,100,PRIVATE_938\n';
const sha=createHash('sha256').update(csv).digest('hex');
const draft=()=>({version:OWNER_MAPPING_VERSION,source_sha256:sha,
 mapping:{date:'날짜',channel:'채널',amount:'금액'},period:'daily'});
const services=(modify=()=>{})=>({
 parseCsvRecords:()=>({headers:['날짜','채널','금액','메모'],records:[['2026-11-01','온라인','100','PRIVATE_938']]}),
 preprocessGenericCsv:(source,{columns})=>({source_sha256:sha,columns}),
 buildSelfPreviewFromPrep:(source,pkg,options)=>{
  const r={version:'SMAX_PREP_SELF_SALES_PREVIEW_V1',source_sha256:sha,source_rows:1,status:'READY_FOR_OWNER_REVIEW',reason:'LOCAL_DRAFT_ONLY',review_rows:0,eligible_rows:1,
   preprocessing_approval:'NOT_GRANTED',owner_approval:'NOT_GRANTED',
   execution:'NOT_PERFORMED',outbound_transfer:false,source_modified:false,
   summary:{period:'daily',group_count:1,included_rows:1,positive_amount:'100.00',negative_adjustment:'0.00',net_amount:'100.00'}};
  modify(r);return r;
 }
});
test('P9 owner draft calls PREP and SELF with matching exact config and no row leak',()=>{
 let got;
 const d=services();
 d.preprocessGenericCsv=(s,{columns})=>{got=columns;return {columns}};
 const out=buildOwnerSelfPreview(csv,draft(),d);
 assert.deepEqual(got,[{key:'date',source:'날짜',type:'date',required:true},
  {key:'channel',source:'채널',type:'text',required:true},
  {key:'amount',source:'금액',type:'decimal',required:true}]);
 assert.equal(out.status,'READY_FOR_OWNER_REVIEW');assert.equal(out.owner_authorization,false);
 assert.doesNotMatch(JSON.stringify(out),/PRIVATE_938|온라인/);
});
test('P9 stale source, wrong owner mapping or forged approval rejects before output',()=>{
 const changed=draft();changed.source_sha256='0'.repeat(64);
 assert.throws(()=>buildOwnerSelfPreview(csv,changed,services()),TypeError);
 const falseRole=draft();falseRole.mapping.amount='채널';
 assert.throws(()=>buildOwnerSelfPreview(csv,falseRole,services()),TypeError);
 for(const change of [r=>r.owner_approval='GRANTED',r=>r.execution='DONE',
  r=>r.source_sha256='0'.repeat(64),r=>r.source_rows=2,
  r=>{r.status='REVIEW_HOLD';r.summary={net_amount:'100.00'};}]){
  assert.throws(()=>buildOwnerSelfPreview(csv,draft(),services(change)),TypeError);
 }
});
test('P9 preserves explicit HOLD without monetary values',()=>{
 const r=buildOwnerSelfPreview(csv,draft(),services(out=>{out.status='REVIEW_HOLD';out.reason='PREP_REVIEW_QUEUE_NOT_EMPTY';out.review_rows=1;out.eligible_rows=0;out.summary=null;}));
 assert.equal(r.status,'REVIEW_HOLD');assert.equal(r.summary,null);
 assert.equal(r.owner_authorization,false);
});
test('P9 refuses missing actual services and unbounded source',()=>{
 assert.throws(()=>buildOwnerSelfPreview(csv,draft(),{}),TypeError);
 assert.throws(()=>buildOwnerSelfPreview('x'.repeat(2*1024*1024+1),draft(),services()),TypeError);
});

test('P9 extra rows, forged monetary totals and invalid period are blocked',()=>{
 for(const change of [
  r=>{r.raw_rows=['PRIVATE_938'];},
  r=>{r.summary.raw_rows=['PRIVATE_938'];},
  r=>{r.summary.net_amount='101.00';},
  r=>{r.summary.positive_amount='-100.00';},
  r=>{r.summary.group_count=2;},
  r=>{r.summary.period='monthly';},
  r=>{r.eligible_rows=0;},
  r=>{r.reason='OWNER_APPROVED';}
 ])assert.throws(()=>buildOwnerSelfPreview(csv,draft(),services(change)),TypeError);
});
