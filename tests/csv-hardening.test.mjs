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
