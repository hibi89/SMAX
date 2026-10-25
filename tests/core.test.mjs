import test from 'node:test';
import assert from 'node:assert/strict';
import {templates} from '../site/templates.mjs';
import {searchTemplates,parseCsv,buildBlueprint,buildHandoff,suggestFieldMap} from '../site/core.mjs';
test('catalog has 10 distinct templates',()=>{assert.equal(templates.length,10);assert.equal(new Set(templates.map(x=>x.id)).size,10)});
test('colloquial Korean matching',()=>{for(const [s,id] of [['메일로 엑셀 오면 자동 폴더 저장','email'],['손님 질문이 매일 비슷해서 귀찮아','faq'],['매일 재고와 발주 수량 확인','inventory'],['우리회사 규정 물어보면 답해줘','rag']])assert.equal(searchTemplates(s,templates)[0].template.id,id,s)});
test('no results on unrelated input',()=>{assert.equal(searchTemplates('외계선박 추진연구',templates).length,0)});
test('quote and multiline CSV parsing',()=>{assert.deepEqual(parseCsv('이름,설명\n"하나,둘","줄1\n줄2"').rows[0],['하나,둘','줄1\n줄2']);assert.throws(()=>parseCsv('x\n"a'))});
test('field mapping only clear exact aliases',()=>{const m=suggestFieldMap(['거래날짜','상품명','금액'],templates[0]);assert.equal(m.date.selected,'거래날짜');assert.equal(m.item.selected,'상품명');assert.equal(m.amount.selected,'금액')});
test('unanswered questions block completion',()=>{const b=buildBlueprint(templates[0]);assert.equal(b.state,'NEEDS_REVIEW');assert.ok(buildHandoff(templates[0],b).includes('미확정'))});

test('CSV upload inspection rejects malformed syntax, duplicate headers and wrong record widths before mapping',()=>{
  for(const [source, reason] of [
    ['날짜,품목,금액\n2026-01-01,볼"펜,100', /따옴표/],
    ['날짜,품목,금액\n2026-01-01,"볼펜"잔여,100', /닫힌 따옴표/],
    ['날짜,품목,금액\n2026-01-01,볼펜', /열 개수/],
    ['날짜,날짜,금액\n2026-01-01,볼펜,100', /중복된 CSV 열/],
    ['날짜,,금액\n2026-01-01,볼펜,100', /빈 열/],
    ['날짜,품목,금액\n2026-01-01,볼펜,100\n\n', /열 개수/]
  ]) assert.throws(()=>parseCsv(source),reason);
});
test('CSV upload inspection preserves BOM, CRLF, empty field records and multiline quoted cells',()=>{
  const parsed=parseCsv('\uFEFF날짜,품목,금액\r\n2026-01-01,"세트, A",100\r\n,,\r\n2026-01-02,"줄1\n줄2",200\r\n');
  assert.deepEqual(parsed.headers,['날짜','품목','금액']);
  assert.equal(parsed.rows.length,3,'must not silently discard an empty-valued source record');
  assert.deepEqual(parsed.rows[1],['','','']);
  assert.equal(parsed.rows[2][1],'줄1\n줄2');
});
test('CSV upload inspection blocks header-only files before mapping',()=>{
  assert.throws(()=>parseCsv('거래날짜,품목,결제금액\n'),/헤더만 있고 처리할 데이터/);
  assert.throws(()=>parseCsv('거래날짜,품목,결제금액'),/헤더만 있고 처리할 데이터/);
});

test('unverified guide-only field annotations can never masquerade as confirmed source mappings',()=>{
  const guide=templates.find(t=>t.id==='faq');
  const filled=Object.fromEntries(guide.questions.map(q=>[q.key,q.options[0]]));
  const names=Object.fromEntries(guide.fields.map((f,i)=>[f.key,'현장기입'+i]));
  const draft=buildBlueprint(guide,filled,names,{guideOnly:true});
  assert.equal(draft.guideOnly,true);
  assert.equal(draft.state,'NEEDS_REVIEW','all answers and names must not make a guide verified');
  assert.equal(draft.missing.length,0);
  for(const field of draft.fields){
    assert.match(field.sourceColumn,/^현장기입/);
    assert.equal(field.needsReview,true);
    assert.equal(field.fieldVerification,'UNVERIFIED_MANUAL_FIELD_NAME');
  }
  const handoff=buildHandoff(guide,draft);
  assert.match(handoff,/미검증 설계 항목명/);
  assert.match(handoff,/현장 확인 필요/);
  const runnable=templates.find(t=>t.id==='spreadsheet');
  const executable=buildBlueprint(runnable,{},Object.fromEntries(runnable.fields.map(f=>[f.key,f.label])));
  assert.equal(executable.guideOnly,false);
  assert.ok(executable.fields.every(f=>f.fieldVerification==='HUMAN_SELECTED_SOURCE_COLUMN'&&!f.needsReview));
});
