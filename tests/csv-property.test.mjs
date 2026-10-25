import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSpreadsheetCsv } from '../site/csv-transform.mjs';

// Deterministic synthetic input only: no real customer data or network operations.
function seedRandom(initial = 0x12AB34CD) {
  let state = initial >>> 0;
  return max => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % max;
  };
}
const escapeCsv = value => {
  const text = String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
};
const cells = [
  '', '연필', '상품,중', '여러\n줄', '인용"문자', '=1+2', '+SUM(A1:A2)',
  '\u200B=1+2', '0000-01-01', '2026/10/25', '999원', '₩1,200', '-42',
  '  공백  ', '메모\r\n두 줄'
];

test('seeded 256 CSV inputs keep every original record and produce stable output', () => {
  const random = seedRandom();
  const mapping = { date: '날짜', item: '품명', amount: '매출' };
  for (let sample = 0; sample < 256; sample++) {
    const n = 1 + random(12);
    const rows = Array.from({ length: n }, () => [
      random(3) ? '2026-10-25' : cells[random(cells.length)],
      cells[random(cells.length)],
      cells[random(cells.length)]
    ]);
    const lines = [['날짜', '품명', '매출'], ...rows].map(row => row.map(escapeCsv).join(','));
    const source = lines.join(random(2) ? '\r\n' : '\n') + (random(2) ? '\n' : '');
    const first = normalizeSpreadsheetCsv(source, mapping);
    const second = normalizeSpreadsheetCsv(source, mapping);
    assert.equal(first.rows.length, n, 'lost record in sample ' + sample);
    assert.equal(first.summary.inputRows, n, 'input count mismatch in sample ' + sample);
    assert.equal(first.summary.outputRows, n, 'output count mismatch in sample ' + sample);
    assert.equal(first.csv, second.csv, 'non-deterministic output in sample ' + sample);
    assert.ok(first.csv.startsWith('\uFEFF거래일,'), 'BOM missing in sample ' + sample);
    assert.equal(first.rows.filter(row => row[4] === 'NEEDS_REVIEW').length,
      first.summary.reviewRows, 'review count mismatch in sample ' + sample);
  }
});
