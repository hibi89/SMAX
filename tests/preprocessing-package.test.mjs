import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {preprocessMappedCsv,validatePreprocessPackage,serializePreprocessPackage,PACKAGE_VERSION} from '../preprocessing/index.mjs';

const mapping=Object.freeze({date:'거래날짜',item:'품목',amount:'결제금액'});
const csv='거래날짜,품목,결제금액,주문번호\n'
  +'2026-10-01,연필,100,ORDER-A\n'
  +'2026-10-01,연필,100,ORDER-A\n'
  +'2026-02-30,책,200,ORDER-B\n'
  +'2026-10-02,지우개,300,ORDER-C';

test('strict package preserves every row, review reasons and provenance without inferred approval',()=>{
  const p=preprocessMappedCsv(csv,{mapping});
  assert.equal(p.schema_version,PACKAGE_VERSION);
  assert.equal(p.source.sha256,createHash('sha256').update(csv).digest('hex'));
  assert.equal(p.source.source_rows,4);
  assert.equal(p.rows.length,4);
  assert.deepEqual(p.rows.map(r=>r.source_record),[2,3,4,5]);
  assert.equal(p.quality.review_rows,2);
  assert.deepEqual(p.review_queue.map(r=>r.reasons),[['DUPLICATE'],['INVALID_DATE']]);
  assert.equal(p.rows[0].status,'READY_FOR_HUMAN_REVIEW');
  assert.equal(p.approval,'NOT_GRANTED');
  assert.equal(validatePreprocessPackage(p),true);
  assert.equal(JSON.parse(serializePreprocessPackage(p)).source.sha256,p.source.sha256);
  assert.ok(!serializePreprocessPackage(p).includes('ORDER-A'),'unselected order ID must not leak to metadata JSON');
});

test('deterministic package, input unchanged, changed source changes SHA',()=>{
  const before=csv,a=preprocessMappedCsv(csv,{mapping});
  assert.deepEqual(preprocessMappedCsv(csv,{mapping}),a);
  assert.equal(csv,before);
  const b=preprocessMappedCsv(csv.replace('ORDER-C','ORDER-D'),{mapping});
  assert.notEqual(a.source.sha256,b.source.sha256);
});

test('ambiguous mapping, malformed CSV and visually deceptive headers fail closed',()=>{
  assert.throws(()=>preprocessMappedCsv(csv),/mapping/i);
  assert.throws(()=>preprocessMappedCsv(csv,{mapping:{date:'거래날짜',item:'품목',amount:'INVALID'}}),/원본 열/);
  assert.throws(()=>preprocessMappedCsv(csv.replace('결제금액,','결제\u200B금액,'),{mapping}),/보이지 않는 제어문자/);
});

test('strict schema rejects unapproved state, unknown keys and mismatched review queue',()=>{
  const p=preprocessMappedCsv(csv,{mapping});
  assert.throws(()=>validatePreprocessPackage({...p,approval:'APPROVED'}),/unsafe approval/);
  assert.throws(()=>validatePreprocessPackage({...p,extra_field:true}),/package shape/);
  assert.throws(()=>validatePreprocessPackage({...p,review_queue:[]}),/Quality and row count mismatch/);
  assert.throws(()=>validatePreprocessPackage({...p,source:{...p.source,sha256:'x'}}),/Invalid source provenance/);
  assert.throws(()=>serializePreprocessPackage({...p,rows:[]}),/Source row count mismatch/);
});

test('formula-like source is review-only and never auto-promoted',()=>{
  const text='거래날짜,품목,결제금액\n2026-10-01,=HYPERLINK(1),10';
  const p=preprocessMappedCsv(text,{mapping});
  assert.equal(p.quality.review_rows,1);
  assert.match(p.review_queue[0].reasons.join('|'),/FORMULA_PROTECTED/);
  assert.ok(p.rows[0].item.startsWith("'"));
  assert.equal(p.approval,'NOT_GRANTED');
});
