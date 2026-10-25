import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSpreadsheetCsv, SPREADSHEET_OUTPUT_COLUMNS, CsvTransformError } from '../site/csv-transform.mjs';

const mapping = { date: '거래날짜', item: '품목', amount: '결제금액' };
const convert = (source, selected = mapping) => normalizeSpreadsheetCsv(source, selected);

test('golden: normalize date, KRW amounts, and retain record order', () => {
  const result = convert('거래날짜,품목,결제금액\r\n2026/1/2,연필,"₩1,200원"\r\n20260203,공책,300\r\n');
  assert.deepEqual(result.rows, [
    ['2026-01-02', '연필', '1200', '2', 'READY_FOR_HUMAN_REVIEW', ''],
    ['2026-02-03', '공책', '300', '3', 'READY_FOR_HUMAN_REVIEW', '']
  ]);
  assert.equal(result.summary.inputRows, 2);
  assert.equal(result.summary.outputRows, 2);
  assert.equal(result.summary.reviewRows, 0);
  assert.ok(result.csv.startsWith('\uFEFF' + SPREADSHEET_OUTPUT_COLUMNS.join(',')));
  assert.equal(result.state, 'READY_FOR_HUMAN_REVIEW');
});

test('quoted commas, multiline values, and escaped quotes round-trip safely', () => {
  const result = convert('거래날짜,품목,결제금액\n2026-02-04,"세트, ""A""\n특가",1000');
  assert.equal(result.rows[0][1], '세트, "A"\n특가');
  assert.ok(result.csv.includes('"세트, ""A""\n특가"'));
});

test('duplicates are flagged, never removed', () => {
  const result = convert('거래날짜,품목,결제금액\n2026-01-01,볼펜,100\n2026/1/1,볼펜,100');
  assert.equal(result.rows.length, 2);
  assert.equal(result.summary.duplicateRows, 1);
  assert.equal(result.rows[1][4], 'NEEDS_REVIEW');
  assert.match(result.rows[1][5], /DUPLICATE/);
});

test('empty record and missing field are not silently discarded', () => {
  const result = convert('거래날짜,품목,결제금액\n,,\n2026-01-01,볼펜,');
  assert.equal(result.rows.length, 2);
  assert.equal(result.summary.missingRows, 2);
  assert.equal(result.summary.reviewRows, 2);
});

test('invalid date and money remain visible for human review', () => {
  const result = convert('거래날짜,품목,결제금액\n2026-02-30,공책,"1,2,3"\n2024-02-29,연필,-500');
  assert.equal(result.summary.invalidDateRows, 1);
  assert.equal(result.summary.invalidAmountRows, 1);
  assert.equal(result.rows[0][0], '2026-02-30');
  assert.equal(result.rows[0][2], '1,2,3');
  assert.equal(result.rows[1][0], '2024-02-29');
  assert.equal(result.rows[1][2], '-500');
});

test('CSV formula injection text is neutralized and marked', () => {
  const result = convert('거래날짜,품목,결제금액\n2026-02-01," =HYPERLINK(""x"",""y"")",100');
  assert.equal(result.rows[0][1], "'=HYPERLINK(\"x\",\"y\")");
  assert.equal(result.summary.formulaProtectedRows, 1);
  assert.match(result.rows[0][5], /FORMULA_PROTECTED/);
});

test('unapproved or reused mapping is rejected', () => {
  const s = '거래날짜,품목,결제금액\n2026-01-01,볼펜,100';
  assert.throws(() => convert(s, { ...mapping, amount: '없음' }), CsvTransformError);
  assert.throws(() => convert(s, { ...mapping, amount: '품목' }), /같은 원본 열/);
  assert.throws(() => convert(s, {}), /필수 매핑/);
});

test('malformed columns and duplicate headers fail closed', () => {
  assert.throws(() => convert('거래날짜,품목,결제금액\n2026-01-01,볼펜'), /열 개수/);
  assert.throws(() => convert('거래날짜,품목,품목\n2026-01-01,볼펜,100'), /중복된/);
  assert.throws(() => convert('거래날짜,품목,결제금액\n"2026-01-01,볼펜,100'), /따옴표/);
  assert.throws(() => convert('거래날짜,품목,결제금액\n2026-01-01,볼"펜,100'), /따옴표/);
});

test('review-only CSV exports flagged rows while preserving complete standardized output', () => {
  const input='거래날짜,품목,결제금액\n2026-10-01,연필,100\n2026-10-01,연필,100\n2026-02-30,공책,200\n2026-10-02,펜,30';
  const result=convert(input);
  assert.equal(result.summary.outputRows,4);
  assert.equal(result.summary.reviewRows,2);
  assert.equal(result.csv.trimEnd().split('\r\n').length,5);
  assert.equal(result.reviewCsv.trimEnd().split('\r\n').length,3);
  assert.ok(result.reviewCsv.startsWith('\uFEFF'+SPREADSHEET_OUTPUT_COLUMNS.join(',')));
  assert.match(result.reviewCsv,/DUPLICATE/);
  assert.match(result.reviewCsv,/INVALID_DATE/);
  assert.match(result.reviewCsv,/,3,NEEDS_REVIEW,/);
  assert.match(result.reviewCsv,/,4,NEEDS_REVIEW,/);
  assert.doesNotMatch(result.reviewCsv,/연필,100,2,READY_FOR_HUMAN_REVIEW/);
  const clean=convert('거래날짜,품목,결제금액\n2026-10-01,연필,100');
  assert.equal(clean.summary.reviewRows,0);
  assert.equal(clean.reviewCsv.trimEnd().split('\r\n').length,1,'no issues produces header-only review CSV');
});

test('no records and oversize files are rejected', () => {
  assert.throws(() => convert('거래날짜,품목,결제금액\n'), /데이터가 없습니다/);
  assert.throws(() => convert('거래날짜,품목,결제금액\n' + 'x'.repeat(2 * 1024 * 1024)), /2MB/);
});

test('pure and repeatable: no input mutation or persistence', () => {
  const m = { ...mapping };
  const source = '거래날짜,품목,결제금액\n2026-01-01,볼펜,100';
  const first = convert(source, m);
  assert.deepEqual(convert(source, m), first);
  assert.deepEqual(m, mapping);
});

test('unmapped order IDs distinguish transactions with identical mapped dates, items and amounts', () => {
  const source = '거래날짜,품목,결제금액,주문번호\n'
    + '2026/10/01,연필,100,ORDER-A\n'
    + '2026-10-01,연필,100,ORDER-B\n'
    + '2026-10-01,연필,100,ORDER-B';
  const r = convert(source);
  assert.equal(r.summary.inputRows, 3);
  assert.equal(r.summary.outputRows, 3, 'all original records must survive standardization');
  assert.equal(r.summary.duplicateRows, 1, 'only the third row repeats the same full source identity');
  assert.deepEqual(r.rows.map(row => row[4]), [
    'READY_FOR_HUMAN_REVIEW', 'READY_FOR_HUMAN_REVIEW', 'NEEDS_REVIEW'
  ]);
  assert.equal(r.rows[2][5], 'DUPLICATE');
  const threeColumn = convert('거래날짜,품목,결제금액\n2026/10/01,연필,100\n2026-10-01,연필,100');
  assert.equal(threeColumn.summary.duplicateRows, 1, 'the old 3-column normalized duplicate contract remains intact');
});

test('monetarily equivalent representations share a duplicate key without altering output amounts',()=>{
  const input='거래날짜,품목,결제금액\n'
    +'2026-10-01,연필,100\n'
    +'2026-10-01,연필,100.00\n'
    +'2026-10-01,연필,0100\n'
    +'2026-10-01,연필,"₩100원"\n'
    +'2026-10-01,연필,100.01\n'
    +'2026-10-01,연필,0\n'
    +'2026-10-01,연필,-0.00';
  const r=convert(input);
  assert.equal(r.summary.outputRows,7);
  assert.equal(r.summary.duplicateRows,4);
  assert.deepEqual(r.rows.map(row=>row[4]),[
    'READY_FOR_HUMAN_REVIEW','NEEDS_REVIEW','NEEDS_REVIEW','NEEDS_REVIEW',
    'READY_FOR_HUMAN_REVIEW','READY_FOR_HUMAN_REVIEW','NEEDS_REVIEW'
  ]);
  assert.deepEqual(r.rows.map(row=>row[2]),[
    '100','100.00','0100','100','100.01','0','-0.00'
  ],'currency display representation is never rewritten just for duplicate checks');
  assert.match(r.reviewCsv,/DUPLICATE/);
});

test('different order IDs preserve separate valid transactions even for equivalent money',()=>{
  const input='거래날짜,품목,결제금액,주문번호\n'
    +'2026-10-01,연필,100,ORDER-A\n'
    +'2026-10-01,연필,100.00,ORDER-B\n'
    +'2026-10-01,연필,0100,ORDER-A';
  const r=convert(input);
  assert.equal(r.summary.inputRows,3);
  assert.equal(r.summary.duplicateRows,1);
  assert.equal(r.summary.reviewRows,1);
  assert.equal(r.rows[2][5],'DUPLICATE');
  assert.equal(r.rows[1][4],'READY_FOR_HUMAN_REVIEW');
});
