import test from 'node:test';
import assert from 'node:assert/strict';
import {preprocessGenericCsv} from '../preprocessing/generic-csv.mjs';
import {buildSelfPreviewFromPrep, SELF_PREVIEW_GATE_VERSION} from '../preprocessing/self-preview-gate.mjs';

const fields = [
  {key:'date', source:'일자', type:'date', required:true},
  {key:'channel', source:'판매처', type:'text', required:true},
  {key:'amount', source:'금액', type:'decimal', required:true}
];
const opts = {mapping:{date:'일자',channel:'판매처',amount:'금액'},period:'monthly'};
const raw = '일자,판매처,금액,비고\n2026-11-01,온라인,100,PRIVATE_NAME_812\n2026-11-02,매장,-10,confidential\n';
const make = (source=raw, mapped=fields) => preprocessGenericCsv(source,{columns:mapped});
const preview = (source=raw,pkg=make(source),options=opts) => buildSelfPreviewFromPrep(source,pkg,options);

test('clean PREP source yields local read-only SELF draft with no approval',()=>{
  const out=preview();
  assert.equal(out.version,SELF_PREVIEW_GATE_VERSION);
  assert.equal(out.status,'READY_FOR_OWNER_REVIEW');
  assert.equal(out.preprocessing_approval,'NOT_GRANTED');
  assert.equal(out.owner_approval,'NOT_GRANTED');
  assert.equal(out.execution,'NOT_PERFORMED');
  assert.equal(out.outbound_transfer,false);
  assert.equal(out.source_modified,false);
  assert.deepEqual(out.summary,{
    period:'monthly',group_count:2,included_rows:2,
    positive_amount:'100.00',negative_adjustment:'10.00',net_amount:'90.00'
  });
});

test('no private source cells, customer labels or CSV exports returned',()=>{
  const wire=JSON.stringify(preview());
  for(const secret of ['PRIVATE_NAME_812','confidential','온라인','매장','reportCsv','reviewCsv','source_cells'])
    assert.equal(wire.includes(secret),false,secret);
});

test('original local source and PREP package remain byte-for-byte unchanged',()=>{
  const pkg=make(),original=JSON.stringify(pkg),source=raw;
  preview(source,pkg);
  assert.equal(JSON.stringify(pkg),original);
  assert.equal(source,raw);
});

test('missing/invalid date makes PREP review HOLD',()=>{
  const source='일자,판매처,금액,비고\n2026-11-01,온라인,10,x\n2026-02-30,매장,20,y\n';
  const out=preview(source);
  assert.equal(out.status,'REVIEW_HOLD');
  assert.equal(out.reason,'PREP_REVIEW_QUEUE_NOT_EMPTY');
  assert.equal(out.review_rows,1);
  assert.equal(out.eligible_rows,0);
  assert.equal(out.summary,null);
});

test('formula in unmapped source cell is blocked',()=>{
  const source='일자,판매처,금액,비고\n2026-11-01,온라인,10,=HYPERLINK(1)\n';
  assert.equal(preview(source).status,'REVIEW_HOLD');
});

test('exact source duplicate cannot pass PREP',()=>{
  const source='일자,판매처,금액,비고\n2026-11-01,온라인,10,x\n2026-11-01,온라인,10,x\n';
  assert.equal(preview(source).review_rows,1);
});

test('SELF-specific normalized date duplicate cannot pass',()=>{
  const source='일자,판매처,금액,비고\n2026-11-01,온라인,10,x\n2026/11/01,온라인,10,x\n';
  assert.equal(make(source).quality.review_rows,0);
  const out=preview(source);
  assert.equal(out.status,'REVIEW_HOLD');
  assert.equal(out.reason,'SELF_REPORT_REVIEW_REQUIRED');
  assert.equal(out.summary,null);
});

test('SELF report amount limit cannot overflow draft totals',()=>{
  const source='일자,판매처,금액,비고\n2026-11-01,온라인,1000000000000,x\n';
  assert.equal(make(source).quality.review_rows,0);
  const out=preview(source);
  assert.equal(out.status,'REVIEW_HOLD');
  assert.equal(out.reason,'SELF_REPORT_REVIEW_REQUIRED');
  assert.equal(out.eligible_rows,0);
});

test('tampered package hash, row, approval or review state rejected',()=>{
  for(const mutate of [
    p=>{p.source.sha256='f'.repeat(64)},
    p=>{p.rows[0].values.amount='1000000'},
    p=>{p.approval='GRANTED'},
    p=>{p.quality.review_rows=1},
    p=>{p.review_queue=[{source_record:2,issues:[]}]}
  ]){
    const fake=structuredClone(make());mutate(fake);
    assert.throws(()=>preview(raw,fake),TypeError);
  }
});

test('source changed while keeping old package is rejected',()=>{
  const modified=raw.replace('100,PRIVATE','101,PRIVATE');
  assert.throws(()=>preview(modified,make()),/differs/);
});

test('unmapped, duplicate, extra option and invalid period rejected',()=>{
  for(const options of [
    {mapping:{date:'일자',channel:'일자',amount:'금액'},period:'daily'},
    {mapping:{date:'일자',channel:'없는열',amount:'금액'},period:'daily'},
    {mapping:{date:'일자',channel:'판매처',amount:'금액',execute:true},period:'daily'},
    {mapping:opts.mapping,period:'yearly'},
    {mapping:opts.mapping,period:'daily',include_raw:true},
  ])assert.throws(()=>preview(raw,make(),options),TypeError);
});

test('PREP incompatible mapped field types are never used as SELF totals',()=>{
  for(const mapped of [
    fields.map(f=>f.key==='amount'?{...f,type:'text'}:f),
    fields.map(f=>f.key==='date'?{...f,type:'text'}:f),
    fields.map(f=>f.key==='channel'?{...f,required:false}:f),
    fields.filter(f=>f.key!=='amount')
  ]){
    const pkg=make(raw,mapped);
    assert.throws(()=>preview(raw,pkg),/type-compatible/);
  }
});

test('daily and monthly periods must be owner-specified',()=>{
  const daily=preview(raw,make(),{...opts,period:'daily'});
  const monthly=preview();
  assert.equal(daily.summary.period,'daily');
  assert.equal(monthly.summary.period,'monthly');
  assert.equal(daily.summary.net_amount,monthly.summary.net_amount);
});

test('external fetch is not needed for local PREP to SELF preview',()=>{
  const previous=globalThis.fetch;
  globalThis.fetch=()=>{throw new Error('external network not authorized');};
  try{assert.equal(preview().status,'READY_FOR_OWNER_REVIEW')}
  finally{globalThis.fetch=previous;}
});
