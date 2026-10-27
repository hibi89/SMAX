import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {preprocessGenericCsv,validateGenericCsvPackage,serializeGenericCsvPackage,
  GENERIC_CSV_VERSION} from '../preprocessing/generic-csv.mjs';

const columns=[
  {key:'order_id',source:'주문번호',type:'text',required:true},
  {key:'ordered_on',source:'일자',type:'date',required:true},
  {key:'amount',source:'금액',type:'decimal',required:true},
  {key:'delivered',source:'배송여부',type:'boolean',required:false}
];
const sample='주문번호,일자,금액,배송여부,메모\n'
  +'O-01,2026/10/27,"1,000.50",true,첫주문\n'
  +'O-02,2026-02-30,99.99,0,날짜오류\n'
  +'O-02,2026-02-30,99.99,0,날짜오류\n';

test('arbitrary four-column mapping preserves all five raw columns and each source row',()=>{
  const p=preprocessGenericCsv(sample,{columns});
  assert.equal(p.schema_version,GENERIC_CSV_VERSION);
  assert.equal(p.approval,'NOT_GRANTED');
  assert.equal(p.source.sha256,createHash('sha256').update(sample).digest('hex'));
  assert.deepEqual(p.source.headers,['주문번호','일자','금액','배송여부','메모']);
  assert.deepEqual(p.rows.map(r=>r.source_record),[2,3,4]);
  assert.equal(p.rows[0].values.amount,'1000.50');
  assert.equal(p.rows[0].values.ordered_on,'2026-10-27');
  assert.equal(p.rows[0].values.delivered,true);
  assert.equal(p.rows[0].source_cells[4],'첫주문');
  assert.deepEqual(p.rows[1].issues,[{field:'ordered_on',code:'INVALID_DATE'}]);
  assert.deepEqual(p.rows[2].issues,[
    {field:'ordered_on',code:'INVALID_DATE'},
    {field:null,code:'DUPLICATE_SOURCE_ROW'}
  ]);
  assert.equal(p.quality.review_rows,2);
  assert.equal(p.quality.exact_duplicate_rows,1);
  assert.equal(validateGenericCsvPackage(p),true);
  assert.deepEqual(JSON.parse(serializeGenericCsvPackage(p)),p);
});
test('one-column and mixed typed generic schema do not require date/item/amount',()=>{
  const p=preprocessGenericCsv('문장\n일반 표현\n=HYPERLINK(1)',{
    columns:[{key:'message',source:'문장',type:'text',required:true}]
  });
  assert.equal(p.rows.length,2);
  assert.equal(p.rows[0].status,'READY_FOR_HUMAN_REVIEW');
  assert.deepEqual(p.review_queue,[{source_record:3,issues:[{field:'message',code:'FORMULA_RISK'}]}]);
});
test('missing required, invalid integer/decimal/boolean are retained and flagged',()=>{
  const p=preprocessGenericCsv('코드,수량,가격,배송\n,abc,NaN,unknown\n'
    +'A,001,+10.50,1',{columns:[
      {key:'code',source:'코드',type:'text',required:true},
      {key:'quantity',source:'수량',type:'integer',required:true},
      {key:'price',source:'가격',type:'decimal',required:true},
      {key:'delivery',source:'배송',type:'boolean',required:false}
    ]});
  assert.equal(p.quality.review_rows,2);
  assert.equal(p.quality.invalid_cells,3);
  assert.equal(p.quality.missing_required_cells,1);
  assert.equal(p.rows[1].values.quantity,'1');
  assert.equal(p.rows[1].values.price,'10.50');
  assert.equal(p.rows[1].values.delivery,true);
  assert.equal(p.rows[0].values.price,null);
});
test('exact duplicates include unmapped source column and do not delete data',()=>{
  const p=preprocessGenericCsv('원본,ID\nA,1\nA,2\nA,1',{columns:[
    {key:'value',source:'원본',type:'text',required:false}
  ]});
  assert.equal(p.rows.length,3);
  assert.equal(p.quality.exact_duplicate_rows,1);
  assert.deepEqual(p.review_queue[0].issues,[{field:null,code:'DUPLICATE_SOURCE_ROW'}]);
});
test('schema must be explicit, 1-64 unique keys with existing unambiguous source columns',()=>{
  const raw='문장,값\nA,1';
  assert.throws(()=>preprocessGenericCsv(raw),/Define 1-64/);
  assert.throws(()=>preprocessGenericCsv(raw,{columns:[]}),/Define 1-64/);
  assert.throws(()=>preprocessGenericCsv(raw,{columns:[
    {key:'x',source:'문장',type:'text',required:true},
    {key:'x',source:'값',type:'text',required:true}
  ]}),/Invalid/);
  assert.throws(()=>preprocessGenericCsv(raw,{columns:[{key:'x',source:'누락',type:'text',required:true}]}),/Invalid/);
  assert.throws(()=>preprocessGenericCsv(raw,{columns:[{key:'x',source:'문장',type:'mystery',required:true}]}),/Invalid/);
  assert.throws(()=>preprocessGenericCsv(raw,{columns:[{key:'__proto__',source:'문장',type:'text',required:true}]}),/Invalid/);
});
test('CSV structural and header protections remain shared with legacy parser',()=>{
  const fields=[{key:'a',source:'A',type:'text',required:true}];
  assert.throws(()=>preprocessGenericCsv('A,A\n1,2',{columns:fields}),/중복된/);
  assert.throws(()=>preprocessGenericCsv('A,\u200B금액\n1,2',{columns:fields}),/보이지 않는/);
  assert.throws(()=>preprocessGenericCsv('A\n"unterminated',{columns:fields}),/닫히지 않은/);
  assert.throws(()=>preprocessGenericCsv('A,B\n1',{columns:fields}),/열 개수/);
  assert.throws(()=>preprocessGenericCsv('A\n'+('x'.repeat(2*1024*1024)),{columns:fields}),/2MB/);
});
test('validator prevents synthetic approval and tampering of source row provenance',()=>{
  const p=preprocessGenericCsv(sample,{columns});
  assert.throws(()=>validateGenericCsvPackage({...p,approval:'APPROVED'}),/Unsupported/);
  assert.throws(()=>validateGenericCsvPackage({...p,extra:true}),/Unsupported/);
  assert.throws(()=>validateGenericCsvPackage({...p,quality:{...p.quality,review_rows:0}}),/Review queue/);
  assert.throws(()=>validateGenericCsvPackage({...p,review_queue:[]}),/Review queue/);
  assert.throws(()=>validateGenericCsvPackage({...p,rows:p.rows.slice(1)}),/Quality counts/);
  assert.throws(()=>validateGenericCsvPackage({...p,rows:[
    {...p.rows[0],source_record:99},...p.rows.slice(1)
  ]}),/provenance/);
});
test('formula-looking text is kept in JSON and flagged, not silently changed',()=>{
  const p=preprocessGenericCsv('값\n\u200B=HYPERLINK(1)\n-100',{columns:[
    {key:'text',source:'값',type:'text',required:true}
  ]});
  assert.equal(p.rows[0].source_cells[0],'\u200B=HYPERLINK(1)');
  assert.equal(p.rows[0].values.text,'\u200B=HYPERLINK(1)');
  assert.deepEqual(p.review_queue[0].issues,[{field:'text',code:'FORMULA_RISK'}]);
  assert.equal(p.rows[1].issues.length,0);
});

test('unmapped source formula-like fields trigger review without changing raw cells',()=>{
 const columns=[{key:'name',source:'Name',type:'text',required:true}];
 const raw='Name,Note,Other\nAlice,=HYPERLINK(1),-100\nBob,safe,+SUM(2)';
 const pkg=preprocessGenericCsv(raw,{columns});
 assert.deepEqual(pkg.rows.map(row=>row.source_cells),[['Alice','=HYPERLINK(1)','-100'],['Bob','safe','+SUM(2)']]);
 assert.deepEqual(pkg.rows.map(row=>row.issues),[[{field:'Note',code:'UNMAPPED_FORMULA_RISK'}],[{field:'Other',code:'UNMAPPED_FORMULA_RISK'}]]);
 assert.deepEqual(pkg.rows.map(row=>row.status),['NEEDS_REVIEW','NEEDS_REVIEW']);
 assert.equal(pkg.quality.formula_risk_cells,2);
 assert.equal(validateGenericCsvPackage(pkg),true);
 const forged=structuredClone(pkg);forged.rows[0].issues=[];forged.rows[0].status='READY_FOR_HUMAN_REVIEW';forged.review_queue.shift();
 assert.throws(()=>validateGenericCsvPackage(forged),/Review issues disagree/);
});
