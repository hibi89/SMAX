import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSalesReport} from '../site/sales-report.mjs';
const mapping={date:'판매일',channel:'판매처',amount:'판매액'};
const rows='판매일,판매처,판매액\n2026-10-01,온라인,100\n2026/10/01,온라인,1.25\n2026-10-01,매장,-20.10\n2026-10-02,매장,500\n';

test('daily grouping, exact currency cents and net-negative adjustment',()=>{
 const r=buildSalesReport(rows,mapping,{period:'daily'});
 assert.equal(r.state,'REQUIRES_HUMAN_REVIEW');
 assert.deepEqual(r.summary,{sourceRows:4,includedRows:4,excludedRows:0,groupCount:3,positiveAmount:'601.25',negativeAdjustment:'20.10',netAmount:'581.15'});
 assert.deepEqual(r.groups.map(g=>[g.period,g.channel,g.netAmount]),[['2026-10-01','매장','-20.10'],['2026-10-01','온라인','101.25'],['2026-10-02','매장','500.00']]);
 assert.equal(r.reportCsv.startsWith('\uFEFF기간,판매채널,'),true);
});

test('monthly aggregation is deterministic and does not merge distinct channels',()=>{
 const a=buildSalesReport(rows,mapping,{period:'monthly'});
 const b=buildSalesReport(rows,mapping,{period:'monthly'});
 assert.deepEqual(a,b);
 assert.equal(a.groups.length,2);
 assert.deepEqual(a.groups.map(g=>[g.period,g.channel,g.rows,g.netAmount]),[['2026-10','매장',2,'479.90'],['2026-10','온라인',2,'101.25']]);
});

test('duplicate, bad date, missing and formula rows excluded and retained for review',()=>{
 const input='판매일,판매처,판매액\n2026-10-01,매장,100\n2026/10/01,매장,100\n2026-02-30,온라인,200\n2026-10-02,,10\n2026-10-03,=HYPERLINK(0),55\n';
 const r=buildSalesReport(input,mapping,{period:'daily'});
 assert.equal(r.summary.sourceRows,5);
 assert.equal(r.summary.includedRows,1);
 assert.equal(r.summary.excludedRows,4);
 assert.equal(r.summary.netAmount,'100.00');
 assert.match(r.reviewCsv,/DUPLICATE/);
 assert.match(r.reviewCsv,/INVALID_DATE/);
 assert.match(r.reviewCsv,/MISSING_REQUIRED/);
 assert.match(r.reviewCsv,/FORMULA_PROTECTED/);
 assert.match(r.reviewCsv,/'=HYPERLINK/);
 assert.equal(r.excluded.length,4);
});

test('large amounts excluded with explicit reason instead of floating-point rounding',()=>{
 const r=buildSalesReport('판매일,판매처,판매액\n2026-10-01,매장,999999999999\n2026-10-01,온라인,1000000000000',mapping,{period:'monthly'});
 assert.equal(r.summary.sourceRows,2);
 assert.equal(r.summary.includedRows,1);
 assert.equal(r.summary.excludedRows,1);
 assert.equal(r.summary.netAmount,'999999999999.00');
 assert.match(r.reviewCsv,/AMOUNT_EXCEEDS_REPORT_LIMIT/);
});

test('unapproved or reused column mappings and period fail closed',()=>{
 assert.throws(()=>buildSalesReport(rows,mapping),/집계 주기/);
 assert.throws(()=>buildSalesReport(rows,mapping,{period:'yearly'}),/집계 주기/);
 assert.throws(()=>buildSalesReport(rows,{...mapping,channel:'없음'},{period:'daily'}),/필수 매핑/);
 assert.throws(()=>buildSalesReport(rows,{...mapping,channel:'판매일'},{period:'daily'}),/같은 원본 열/);
 assert.throws(()=>buildSalesReport(rows,{}, {period:'daily'}),/원본 열 매핑/);
});

test('quoted CSV channel names safely round-trip and preserve rows',()=>{
 const input='판매일,판매처,판매액\n2026-10-01,"도매,""특판""",100.01\n2026-10-02,"도매,""특판""",-0.02';
 const r=buildSalesReport(input,mapping,{period:'monthly'});
 assert.equal(r.summary.netAmount,'99.99');
 assert.equal(r.groups.length,1);
 assert.equal(r.groups[0].channel,'도매,"특판"');
 assert.match(r.reportCsv,/"도매,""특판"""/);
});

test('no input mutation and no implicit deduplication of different amounts',()=>{
 const m={...mapping};
 const input='판매일,판매처,판매액\n2026-10-01,매장,1\n2026-10-01,매장,2';
 const r=buildSalesReport(input,m,{period:'daily'});
 assert.equal(r.summary.includedRows,2);
 assert.equal(r.summary.netAmount,'3.00');
 assert.deepEqual(m,mapping);
});

test('two distinct order IDs with the same amount are both included; exact repetition is reviewed', () => {
  const source = '판매일,판매처,판매액,주문번호\n'
    + '2026-10-01,온라인,100,ORDER-A\n'
    + '2026-10-01,온라인,100,ORDER-B\n'
    + '2026-10-01,온라인,100,ORDER-B';
  const r = buildSalesReport(source, mapping, {period:'daily'});
  assert.equal(r.summary.sourceRows, 3);
  assert.equal(r.summary.includedRows, 2);
  assert.equal(r.summary.excludedRows, 1);
  assert.equal(r.summary.netAmount, '200.00');
  assert.deepEqual(r.excluded, [{sourceRecord:'4', reason:'DUPLICATE'}]);
  assert.equal(r.groups.length, 1);
  assert.equal(r.groups[0].rows, 2);
});

test('equal monetary values in different CSV formats cannot inflate preliminary revenue',()=>{
 const input='판매일,판매처,판매액,주문번호\n'
  +'2026-10-01,온라인,100,ORDER-A\n'
  +'2026-10-01,온라인,100.00,ORDER-A\n'
  +'2026-10-01,온라인,0100,ORDER-A\n'
  +'2026-10-01,온라인,"₩100원",ORDER-B\n'
  +'2026-10-01,온라인,100.01,ORDER-C';
 const r=buildSalesReport(input,mapping,{period:'daily'});
 assert.equal(r.summary.sourceRows,5);
 assert.equal(r.summary.includedRows,3);
 assert.equal(r.summary.excludedRows,2);
 assert.equal(r.summary.netAmount,'300.01');
 assert.deepEqual(r.excluded,[
   {sourceRecord:'3',reason:'DUPLICATE'},
   {sourceRecord:'4',reason:'DUPLICATE'}
 ]);
 assert.equal(r.groups[0].rows,3);
 assert.match(r.reviewCsv,/DUPLICATE/);
});

test('leading-zero monetary padding is accepted by value while over-limit values remain excluded',()=>{
 const input='판매일,판매처,판매액,주문번호\n'
  +'2026-10-01,온라인,0000000000001,ORDER-A\n'
  +'2026-10-01,온라인,1.00,ORDER-A\n'
  +'2026-10-01,온라인,0000000000001.20,ORDER-B\n'
  +'2026-10-01,매장,-0000000000002.00,ORDER-C\n'
  +'2026-10-01,온라인,1000000000000,ORDER-D\n'
  +'2026-10-01,온라인,0001000000000000,ORDER-E';
 const result=buildSalesReport(input,mapping,{period:'daily'});
 assert.equal(result.summary.sourceRows,6);
 assert.equal(result.summary.includedRows,3);
 assert.equal(result.summary.excludedRows,3);
 assert.equal(result.summary.positiveAmount,'2.20');
 assert.equal(result.summary.negativeAdjustment,'2.00');
 assert.equal(result.summary.netAmount,'0.20');
 assert.deepEqual(result.excluded,[
   {sourceRecord:'3',reason:'DUPLICATE'},
   {sourceRecord:'6',reason:'AMOUNT_EXCEEDS_REPORT_LIMIT'},
   {sourceRecord:'7',reason:'AMOUNT_EXCEEDS_REPORT_LIMIT'}
 ]);
 assert.match(result.reviewCsv,/0001000000000000,AMOUNT_EXCEEDS_REPORT_LIMIT/);
 assert.doesNotMatch(result.reviewCsv,/0000000000001.20/);
 const upper=buildSalesReport('판매일,판매처,판매액,주문번호\n'
   +'2026-10-02,온라인,000999999999999.99,MAX\n'
   +'2026-10-02,온라인,001000000000000.00,OVER',
   mapping,{period:'monthly'});
 assert.equal(upper.summary.includedRows,1);
 assert.equal(upper.summary.excludedRows,1);
 assert.equal(upper.summary.netAmount,'999999999999.99');
 assert.match(upper.reviewCsv,/AMOUNT_EXCEEDS_REPORT_LIMIT/);
});

test('default-ignorable formula prefixes in sales channel are excluded and retained in review CSV',()=>{
 const input='판매일,판매처,판매액,주문번호\n'
  +'2026-10-26,온라인,100,SAFE\n'
  +'2026-10-26,\u202E=1+1,200,SUSPECT\n'
  +'2026-10-26,\u200E@SUM(1),300,SUSPECT2';
 const r=buildSalesReport(input,mapping,{period:'daily'});
 assert.equal(r.summary.sourceRows,3);
 assert.equal(r.summary.includedRows,1);
 assert.equal(r.summary.excludedRows,2);
 assert.equal(r.summary.netAmount,'100.00');
 assert.deepEqual(r.excluded,[
   {sourceRecord:'3',reason:'FORMULA_PROTECTED'},
   {sourceRecord:'4',reason:'FORMULA_PROTECTED'}
 ]);
 assert.match(r.reviewCsv,/FORMULA_PROTECTED/);
 assert.match(r.reviewCsv,/\u202E=1\+1/);
 assert.match(r.reviewCsv,/\u200E@SUM\(1\)/);
 assert.doesNotMatch(r.reportCsv,/[\u202E\u200E]/);
});
