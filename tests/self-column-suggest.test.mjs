import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestSelfSalesColumns,SALES_COLUMN_SUGGEST_VERSION} from '../preprocessing/self-column-suggest.mjs';

const ko=['판매일','판매처','판매금액','비고'];

test('Korean exact labels produce clear owner-review candidates',()=>{
 const report=suggestSelfSalesColumns(ko);
 assert.equal(report.version,SALES_COLUMN_SUGGEST_VERSION);
 assert.equal(report.status,'CANDIDATES_FOR_OWNER_REVIEW');
 assert.equal(report.suggestions.date[0].source,'판매일');
 assert.equal(report.suggestions.channel[0].source,'판매처');
 assert.equal(report.suggestions.amount[0].source,'판매금액');
 assert.equal(report.suggestions.amount[0].match,'EXACT_LABEL');
});
test('English labels normalize whitespace underscores and casing',()=>{
 const r=suggestSelfSalesColumns(['Order_Date','Sales_Channel','Sales_Amount']);
 assert.equal(r.status,'CANDIDATES_FOR_OWNER_REVIEW');
 assert.equal(r.suggestions.amount[0].source,'Sales_Amount');
});
test('Korean compound headers are candidates, but never auto selected',()=>{
 const r=suggestSelfSalesColumns(['기준거래일자','판매채널_구분','총매출금액원']);
 assert.equal(r.suggestions.amount[0].match,'PARTIAL_LABEL');
 assert.equal(r.mapping_applied,false);
 assert.equal(r.execution,'NOT_PERFORMED');
});
test('date ambiguity is explicit owner-review state',()=>{
 assert.equal(suggestSelfSalesColumns(['일자','판매일','판매처','금액']).status,
   'AMBIGUOUS_MAPPING_REVIEW');
});
test('missing semantic aliases cannot be invented',()=>{
 const r=suggestSelfSalesColumns(['col1','col2','col3']);
 assert.equal(r.status,'AMBIGUOUS_MAPPING_REVIEW');
 assert.deepEqual(r.suggestions.amount,[]);
});
test('approval, execution and transfer remain blocked even when matched',()=>{
 const r=suggestSelfSalesColumns(ko);
 assert.equal(r.owner_approval,'NOT_GRANTED');
 assert.equal(r.outbound_transfer,false);
 assert.equal(r.source_modified,false);
 assert.equal(r.mapping_applied,false);
});
test('source headers are not mutated',()=>{
 const headers=[...ko];
 suggestSelfSalesColumns(headers);
 assert.deepEqual(headers,ko);
});
test('results are deterministic',()=>{
 const a=suggestSelfSalesColumns(ko),b=suggestSelfSalesColumns(ko);
 assert.deepEqual(a,b);
});
test('duplicate header labels fail closed',()=>{
 assert.throws(()=>suggestSelfSalesColumns(['일자','일자','금액']),TypeError);
});
test('Unicode NFKC duplicates fail closed',()=>{
 assert.throws(()=>suggestSelfSalesColumns(['일자','ＡＭＯＵＮＴ','amount']),TypeError);
});
test('spreadsheet formula headers are blocked',()=>{
 assert.throws(()=>suggestSelfSalesColumns(['일자','판매처','=HYPERLINK(1)']),TypeError);
});
test('invisible Unicode controls are blocked',()=>{
 assert.throws(()=>suggestSelfSalesColumns(['일자','금액','판매\u200D처']),TypeError);
});
test('non-array and non-string values are blocked',()=>{
 assert.throws(()=>suggestSelfSalesColumns('일자,판매처,금액'),TypeError);
 assert.throws(()=>suggestSelfSalesColumns(['일자',4,'금액']),TypeError);
});
test('under 3 columns is refused',()=>{
 assert.throws(()=>suggestSelfSalesColumns(['일자','금액']),TypeError);
});
test('more than 64 columns is refused',()=>{
 assert.throws(()=>suggestSelfSalesColumns(Array.from({length:65},(_,i)=>'col'+i)),TypeError);
});
test('overlong, untrimmed and hidden ASCII headers are refused',()=>{
 for(const h of ['x'.repeat(81),' date ','client\tname']){
  assert.throws(()=>suggestSelfSalesColumns(['일자','금액',h]),TypeError);
 }
});
test('only top three candidates are retained for each role',()=>{
 const r=suggestSelfSalesColumns(['일자','판매일','날짜','거래일','판매처','금액']);
 assert.ok(r.suggestions.date.length<=3);
 assert.equal(r.status,'AMBIGUOUS_MAPPING_REVIEW');
});
test('no private row content can appear without having been supplied as a header',()=>{
 const wire=JSON.stringify(suggestSelfSalesColumns(['일자','판매처','금액','비고']));
 assert.doesNotMatch(wire,/PRIVATE_CUSTOMER_ROW_3493/);
});
