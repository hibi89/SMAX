import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSpreadsheetCsv } from '../site/csv-transform.mjs';

const map = {date:'거래날짜',item:'품목',amount:'결제금액'};
test('rejects year zero and retains original row for review', () => {
  const r = normalizeSpreadsheetCsv('거래날짜,품목,결제금액\n0000-01-01,연필,100',map);
  assert.equal(r.summary.invalidDateRows,1);
  assert.equal(r.rows[0][0],'0000-01-01');
  assert.equal(r.rows[0][4],'NEEDS_REVIEW');
});
test('invisible separator prefix cannot hide spreadsheet control syntax', () => {
  const r = normalizeSpreadsheetCsv('거래날짜,품목,결제금액\n2026-02-01,\u200B=1+1,100\n2026-02-02,\u2060+42,100',map);
  assert.equal(r.summary.formulaProtectedRows,2);
  for(const row of r.rows) {
    assert.equal(row[1][0],"'");
    assert.match(row[5],/FORMULA_PROTECTED/);
  }
});

test('default-ignorable Unicode controls before spreadsheet operators are protected and reviewed', () => {
  const cases = [
    ['\u200E','=1+1'], ['\u200F','+1+1'], ['\u202E','@SUM(1)'],
    ['\u2066','=2+2'], ['\u2069','-1+1'], ['\u034F','=3+3'],
    ['\u180E','+4+4']
  ];
  const records = cases.map(([prefix,expression], i) =>
    '2026-10-'+String(i+1).padStart(2,'0')+','+prefix+expression+',100');
  const csv = '거래날짜,품목,결제금액\n'+records.join('\n')+'\n2026-10-20,정상,-123';
  const r = normalizeSpreadsheetCsv(csv, map);
  assert.equal(r.summary.outputRows, cases.length + 1);
  assert.equal(r.summary.formulaProtectedRows, cases.length);
  assert.equal(r.summary.reviewRows, cases.length);
  cases.forEach(([prefix,expression],i) => {
    assert.equal(r.rows[i][1], "'" + prefix + expression);
    assert.equal(r.rows[i][4], 'NEEDS_REVIEW');
    assert.match(r.rows[i][5], /FORMULA_PROTECTED/);
    assert.equal(r.rows[i][3], String(i+2), 'logical source record index preserved');
  });
  assert.equal(r.rows.at(-1)[1], '정상');
  assert.equal(r.rows.at(-1)[2], '-123', 'legitimate negative amount unaffected');
  assert.equal(r.rows.at(-1)[4], 'READY_FOR_HUMAN_REVIEW');
});
