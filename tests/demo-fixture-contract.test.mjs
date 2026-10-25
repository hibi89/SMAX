import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeSpreadsheetCsv} from '../site/csv-transform.mjs';
import {buildSalesReport} from '../site/sales-report.mjs';

test('embedded offline demo inputs exactly match checked-in synthetic CSV fixtures',()=>{
  const source=readFileSync(new URL('../site/app.mjs',import.meta.url),'utf8');
  const line=source.split(/\r?\n/).find(s=>s.startsWith('const sampleCsvByTemplate='));
  assert.ok(line?.endsWith(';'),'expected one-line auditable JSON demo fixtures');
  const data=JSON.parse(line.slice('const sampleCsvByTemplate='.length,-1));
  assert.deepEqual(Object.keys(data).sort(),['sales','spreadsheet']);
  for(const [id,fixture] of [['spreadsheet','SMAX_SELF_SAMPLE.csv'],['sales','SMAX_SALES_SAMPLE.csv']]){
    const entry=data[id];
    assert.match(entry.name,/^SMAX_DEMO_.*\.csv$/);
    assert.equal(entry.source,readFileSync(new URL('../examples/'+fixture,import.meta.url),'utf8'),id+' drifted from the QA fixture');
    assert.deepEqual(Object.keys(entry.mapping).sort(),id==='sales'?['amount','channel','date']:['amount','date','item']);
  }
  const csv=normalizeSpreadsheetCsv(data.spreadsheet.source,data.spreadsheet.mapping);
  assert.equal(csv.summary.inputRows,4);
  assert.equal(csv.summary.reviewRows,2);
  const sales=buildSalesReport(data.sales.source,data.sales.mapping,{period:'daily'});
  assert.equal(sales.summary.sourceRows,5);
  assert.equal(sales.summary.includedRows,2);
  assert.equal(sales.summary.excludedRows,3);
  assert.equal(sales.summary.netAmount,'79.90');
});
