import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv} from '../site/core.mjs';
import {normalizeSpreadsheetCsv} from '../site/csv-transform.mjs';
import {buildSalesReport} from '../site/sales-report.mjs';

const mapping = {date:'거래날짜',item:'품목',amount:'결제금액'};

test('mapping rejects hidden Unicode and control characters in CSV headers',()=>{
  const candidates=[
    ['zero width space','결제\u200B금액'],
    ['RTL override','결제\u202E금액'],
    ['isolate','결제\u2066금액'],
    ['quoted tab','"결제\t금액"'],
    ['embedded BOM','결제\uFEFF금액']
  ];
  for(const [label, extra] of candidates){
    const source='거래날짜,품목,결제금액,'+extra+'\n2026-10-27,연필,100,999';
    assert.throws(()=>parseCsv(source),/보이지 않는 제어문자/,label+' preflight');
    assert.throws(()=>normalizeSpreadsheetCsv(source,mapping),/보이지 않는 제어문자/,label+' converter');
  }
});

test('visual duplicates formed by Unicode compatibility or composed letters cannot be selected',()=>{
  const cases=[
    '거래날짜,품목,결제금액,ＡＢＣ,ABC\n2026-10-27,연필,100,x,y',
    '거래날짜,품목,결제금액,금액,금액\n2026-10-27,연필,100,x,y'
  ];
  for(const source of cases){
    assert.throws(()=>parseCsv(source),/중복된 CSV 열 이름/);
    assert.throws(()=>normalizeSpreadsheetCsv(source,mapping),/중복된 CSV 열 이름/);
  }
});

test('regular UTF-8 BOM, distinct Korean headers and original output remain usable',()=>{
  const source='\uFEFF거래날짜,품목,결제금액,주문번호\n2026-10-27,연필,100,A1';
  const inspected=parseCsv(source);
  assert.deepEqual(inspected.headers,['거래날짜','품목','결제금액','주문번호']);
  const result=normalizeSpreadsheetCsv(source,mapping);
  assert.equal(result.summary.inputRows,1);
  assert.equal(result.summary.reviewRows,0);
  assert.equal(result.rows[0][2],'100');
  assert.equal(result.csv.startsWith('\uFEFF'),true);
});

test('sales totals fail closed if other source headers could masquerade as selected channels',()=>{
  const mapped={date:'판매일',channel:'판매처',amount:'판매액'};
  const source='판매일,판매처,판매액,판매\u200B처\n2026-10-27,온라인,100,오프라인';
  assert.throws(()=>buildSalesReport(source,mapped,{period:'daily'}),/보이지 않는 제어문자/);
  const clean='판매일,판매처,판매액,주문번호\n2026-10-27,온라인,100,A1';
  assert.equal(buildSalesReport(clean,mapped,{period:'daily'}).summary.netAmount,'100.00');
});
