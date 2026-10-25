import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import {bundleOfflineSelf} from '../scripts/build-self.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=name=>readFileSync(join(root,'site',name),'utf8');

function offlineFixture() {
  const html=bundleOfflineSelf({
    html:read('index.html'),
    css:read('styles.css'),
    modules:['templates.mjs','core.mjs','csv-transform.mjs','sales-report.mjs','app.mjs'].map(read)
  });
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script,'offline bundle must contain inline JavaScript');

  const listeners={},rootNode={innerHTML:''};
  const toast={textContent:'',classList:{add(){},remove(){}}};
  const tabs=Object.fromEntries(['#tab-templates','#tab-chat'].map(id=>[
    id,{classList:{toggle(){}},setAttribute(){}}
  ]));
  const links=[],blobs=[],revoke=[];
  const document={
    getElementById(id){return id==='work-area'?rootNode:null},
    querySelector(id){return id==='#toast'?toast:(tabs[id]??null)},
    addEventListener(event,handler){listeners[event]=handler},
    createElement(name){
      assert.equal(name,'a');
      const link={clicked:false,click(){this.clicked=true}};
      links.push(link);
      return link;
    }
  };
  class TestBlob {
    constructor(parts,options){this.parts=parts;this.options=options;blobs.push(this)}
  }
  const URL={
    createObjectURL(){return 'blob:private-test'},
    revokeObjectURL(value){revoke.push(value)}
  };
  const timeouts=[];
  runInNewContext(script,{
    document,window:{},TextEncoder,TextDecoder,Blob:TestBlob,URL,
    setTimeout(callback){timeouts.push(callback);return timeouts.length},
    clearTimeout(){}
  },{filename:'SMAX_SELF_OFFLINE.html',timeout:5000});
  assert.equal(typeof listeners.DOMContentLoaded,'function');
  listeners.DOMContentLoaded();

  function click(action,data={}){
    assert.equal(typeof listeners.click,'function');
    listeners.click({target:{closest(){return {dataset:{action,...data}}}}});
  }
  async function change(target){
    assert.equal(typeof listeners.change,'function');
    await listeners.change({target});
  }
  return {html,click,change,links,blobs,revoke,timeouts,rootNode};
}

test('real packaged inline application handles offline CSV and download in Node VM',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'spreadsheet'});
  env.click('tab',{tab:'chat'});
  assert.match(env.rootNode.innerHTML,/로컬 CSV 실제 변환/);
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-csv"/);

  const source='거래날짜,품목,결제금액\n2026-01-01,볼펜,100\n2026-01-01,볼펜,100\n0000-01-01,공책,200';
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'example.csv',size:Buffer.byteLength(source,'utf8'),text:async()=>source
  }]});
  assert.match(env.rootNode.innerHTML,/3개 열 감지/);
  for(const [field,value] of Object.entries({
    date:'거래날짜',item:'품목',amount:'결제금액'
  })){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-csv');
  assert.match(env.rootNode.innerHTML,/검토 필요 2행/);
  assert.match(env.rootNode.innerHTML,/DUPLICATE/);
  assert.match(env.rootNode.innerHTML,/INVALID_DATE/);
  env.click('download-csv');
  assert.equal(env.links.at(-1).download,'SMAX_STANDARDIZED.csv');
  assert.equal(env.links.at(-1).clicked,true);
  const csv=env.blobs.at(-1).parts[0];
  assert.ok(csv.startsWith('\uFEFF거래일,'));
  assert.equal(csv.trimEnd().split('\r\n').length,4,'3 source rows plus output header');
  env.timeouts.forEach(callback=>callback());
  assert.deepEqual(env.revoke,['blob:private-test']);
});

test('offline output cannot survive remapping or unrelated template selection',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'spreadsheet'});
  env.click('tab',{tab:'chat'});
  const source='거래날짜,품목,결제금액\n2026-10-25,연필,100';
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'demo.csv',size:source.length,text:async()=>source
  }]});
  const mapping={date:'거래날짜',item:'품목',amount:'결제금액'};
  for(const [field,value] of Object.entries(mapping)){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-csv');
  assert.match(env.rootNode.innerHTML,/data-action="download-csv"/);
  await env.change({dataset:{action:'map',field:'amount'},value:'품목'});
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-csv"/);
  env.click('select',{id:'faq'});
  assert.doesNotMatch(env.rootNode.innerHTML,/로컬 CSV 실제 변환/);
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-csv"/);
});


test('late async upload cannot resurrect a CSV after switching to another workflow',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'spreadsheet'});
  env.click('tab',{tab:'chat'});
  const source='거래날짜,품목,결제금액\n2026-10-25,연필,100';
  let release;
  const pending=env.change({id:'csv-upload',dataset:{},files:[{
    name:'slow.csv',size:Buffer.byteLength(source,'utf8'),
    text:()=>new Promise(resolve=>{release=resolve})
  }]});
  assert.equal(typeof release,'function');
  env.click('select',{id:'faq'});
  release(source);
  await pending;
  assert.doesNotMatch(env.rootNode.innerHTML,/로컬 CSV 실제 변환/);
  env.click('select',{id:'spreadsheet'});
  assert.doesNotMatch(env.rootNode.innerHTML,/3개 열 감지/);
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-csv"/);
});

test('spreadsheet-like formula content is escaped in bundled preview and output',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'spreadsheet'});
  env.click('tab',{tab:'chat'});
  const source='거래날짜,품목,결제금액\n2026-10-25,"\u200B=1+1",100';
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'synthetic.csv',size:Buffer.byteLength(source,'utf8'),text:async()=>source
  }]});
  for(const [field,value] of Object.entries({
    date:'거래날짜',item:'품목',amount:'결제금액'
  })){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-csv');
  assert.match(env.rootNode.innerHTML,/FORMULA_PROTECTED/);
  env.click('download-csv');
  assert.ok(env.blobs.at(-1).parts[0].includes("'\u200B=1+1"));
});


test('all ten guidance templates export a review-only blueprint and safe AI handoff',()=>{
  const env=offlineFixture();
  const ids=['spreadsheet','inventory','faq','sales','email','rag','quote','booking','web','reviews'];
  for(const id of ids){
    env.click('select',{id});
    env.click('tab',{tab:'chat'});
    env.click('download-json');
    const json=env.blobs.at(-1).parts[0];
    const output=JSON.parse(json);
    assert.equal(output.format,'SMAX_AX_BLUEPRINT_V0_1');
    assert.equal(output.templateId,id);
    assert.equal(output.state,'NEEDS_REVIEW');
    assert.match(output.source,/not a deployed automation/);
    assert.equal(env.links.at(-1).download,'AX_BLUEPRINT_'+id+'.json');

    env.click('download-guide');
    const markdown=env.blobs.at(-1).parts[0];
    assert.equal(env.links.at(-1).download,'AI_BUILD_PROMPT_'+id+'.md');
    assert.match(markdown,/실제 자료는 사용자 승인 전/);
    assert.match(markdown,/개인정보/);
    assert.match(markdown,/외부/);
    assert.match(markdown,/검증 체크리스트/);
  }
  assert.equal(env.links.filter(link=>link.clicked).length,20);
});


test('sales local report preserves rejected records and downloads both UTF-8 BOM CSV files',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'sales'});
  env.click('tab',{tab:'chat'});
  assert.match(env.rootNode.innerHTML,/로컬 매출 보고서/);
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-sales-report"/);
  const source='판매일,판매처,판매액\n2026-10-01,온라인,100\n2026-10-01,온라인,100\n2026-10-02,매장,-20.10\n2026-02-30,매장,9\n2026-10-03,=1+1,4';
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'sales.csv',size:Buffer.byteLength(source,'utf8'),text:async()=>source
  }]});
  for(const [field,value] of Object.entries({date:'판매일',channel:'판매처',amount:'판매액'})){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-sales');
  assert.match(env.rootNode.innerHTML,/잠정 반영 2행/);
  assert.match(env.rootNode.innerHTML,/제외\/검토 3행/);
  assert.match(env.rootNode.innerHTML,/79\.90원/);
  assert.match(env.rootNode.innerHTML,/data-action="download-sales-report"/);
  env.click('download-sales-report');
  assert.equal(env.links.at(-1).download,'SMAX_SALES_REPORT.csv');
  const report=env.blobs.at(-1).parts[0];
  assert.match(report,/^\uFEFF기간,판매채널,/);
  // Report CSV is grouped by date/channel, so overall 79.90 appears in the UI summary,
  // not as a synthetic grand-total row in the CSV.
  assert.match(report,/100\.00/);
  assert.match(report,/-20\.10/);
  env.click('download-sales-review');
  assert.equal(env.links.at(-1).download,'SMAX_SALES_REVIEW_ROWS.csv');
  const reviewed=env.blobs.at(-1).parts[0];
  assert.match(reviewed,/^\uFEFF원본레코드,/);
  assert.match(reviewed,/DUPLICATE/);
  assert.match(reviewed,/INVALID_DATE/);
  assert.match(reviewed,/FORMULA_PROTECTED/);
  assert.doesNotMatch(env.rootNode.innerHTML,/<script/i);
});

test('sales result is invalidated when period/mapping/template changes',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'sales'});
  env.click('tab',{tab:'chat'});
  const source='판매일,판매처,판매액\n2026-10-01,매장,5\n2026-10-02,온라인,10';
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'sales.csv',size:Buffer.byteLength(source,'utf8'),text:async()=>source
  }]});
  for(const [field,value] of Object.entries({date:'판매일',channel:'판매처',amount:'판매액'})){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-sales');
  assert.match(env.rootNode.innerHTML,/download-sales-report/);
  await env.change({dataset:{action:'sales-period'},value:'monthly'});
  assert.doesNotMatch(env.rootNode.innerHTML,/download-sales-report/);
  const count=env.links.length;
  env.click('download-sales-report');
  assert.equal(env.links.length,count,'stale download blocked');
  env.click('run-sales');
  assert.match(env.rootNode.innerHTML,/2026-10/);
  await env.change({dataset:{action:'map',field:'amount'},value:'판매처'});
  assert.doesNotMatch(env.rootNode.innerHTML,/download-sales-report/);
  env.click('select',{id:'spreadsheet'});
  assert.doesNotMatch(env.rootNode.innerHTML,/로컬 매출 보고서/);
  env.click('select',{id:'sales'});
  env.click('tab',{tab:'chat'});
  assert.doesNotMatch(env.rootNode.innerHTML,/2개 열 감지/);
  assert.doesNotMatch(env.rootNode.innerHTML,/download-sales-report/);
});


test('single offline bundle safely switches between both executable tools without stale exports',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'spreadsheet'});
  env.click('tab',{tab:'chat'});
  const csv=readFileSync(join(root,'examples','SMAX_SELF_SAMPLE.csv'),'utf8');
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'standard.csv',size:Buffer.byteLength(csv,'utf8'),text:async()=>csv
  }]});
  for(const [field,value] of Object.entries({date:'거래날짜',item:'품목',amount:'결제금액'})){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-csv');
  assert.match(env.rootNode.innerHTML,/검토 필요 2행/);
  env.click('download-csv');
  const count=env.links.length;
  assert.equal(env.links.at(-1).download,'SMAX_STANDARDIZED.csv');

  env.click('select',{id:'sales'});
  env.click('tab',{tab:'chat'});
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-csv"/);
  env.click('download-csv');
  assert.equal(env.links.length,count,'old spreadsheet export cannot be downloaded in sales workflow');
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-sales-report"/);
  const sales=readFileSync(join(root,'examples','SMAX_SALES_SAMPLE.csv'),'utf8');
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'sales.csv',size:Buffer.byteLength(sales,'utf8'),text:async()=>sales
  }]});
  for(const [field,value] of Object.entries({date:'판매일',channel:'판매처',amount:'판매액'})){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-sales');
  assert.match(env.rootNode.innerHTML,/잠정 반영 2행/);
  assert.match(env.rootNode.innerHTML,/제외\/검토 3행/);
  env.click('download-sales-report');
  env.click('download-sales-review');
  assert.equal(env.links.at(-2).download,'SMAX_SALES_REPORT.csv');
  assert.equal(env.links.at(-1).download,'SMAX_SALES_REVIEW_ROWS.csv');
  assert.ok(env.blobs.at(-2).parts[0].startsWith('\uFEFF기간,'));
  assert.ok(env.blobs.at(-1).parts[0].includes('FORMULA_PROTECTED'));

  env.click('select',{id:'spreadsheet'});
  env.click('tab',{tab:'chat'});
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-sales-report"/);
  const before=env.links.length;
  env.click('download-sales-report');
  env.click('download-sales-review');
  assert.equal(env.links.length,before,'old sales artifacts cannot leak into spreadsheet workflow');
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-csv"/);
});

test('sales rejects XLSX and oversized CSV without exposing stale report downloads',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'sales'});
  env.click('tab',{tab:'chat'});
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'wrong.xlsx',size:4,text:async()=>'fake'
  }]});
  assert.match(env.rootNode.innerHTML,/CSV 파일만 지원/);
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-sales-report"/);
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'huge.csv',size:2*1024*1024+1,text:async()=>{throw Error('must not read too-large file')}
  }]});
  assert.match(env.rootNode.innerHTML,/2MB 이하/);
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-sales-report"/);
});


test('sales period guide question synchronizes with the actual report and blueprint',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'sales'});
  env.click('tab',{tab:'chat'});
  assert.match(env.rootNode.innerHTML,/월별/);
  assert.doesNotMatch(env.rootNode.innerHTML,/>주별</);
  env.click('answer',{question:'period',answer:'월별'});
  assert.match(env.rootNode.innerHTML,/value="monthly" selected/);
  const source=readFileSync(join(root,'examples','SMAX_SALES_SAMPLE.csv'),'utf8');
  await env.change({id:'csv-upload',dataset:{},files:[{
    name:'sales.csv',size:Buffer.byteLength(source,'utf8'),text:async()=>source
  }]});
  for(const [field,value] of Object.entries({date:'판매일',channel:'판매처',amount:'판매액'})){
    await env.change({dataset:{action:'map',field},value});
  }
  env.click('run-sales');
  assert.match(env.rootNode.innerHTML,/잠정 반영 2행/);
  assert.match(env.rootNode.innerHTML,/<td>2026-10<\/td>/);
  assert.doesNotMatch(env.rootNode.innerHTML,/<td>2026-10-01<\/td>/);
  await env.change({dataset:{action:'sales-period'},value:'daily'});
  assert.doesNotMatch(env.rootNode.innerHTML,/download-sales-report/);
  env.click('download-json');
  const blueprint=JSON.parse(env.blobs.at(-1).parts[0]);
  assert.equal(blueprint.questions.find(q=>q.key==='period')?.answer,'일별');
  env.click('run-sales');
  assert.match(env.rootNode.innerHTML,/<td>2026-10-01<\/td>/);
});

test('packaged app rejects invalid CP949 bytes and accepts UTF-8 across both local workflows',async()=>{
  const env=offlineFixture();
  for(const id of ['spreadsheet','sales']){
    env.click('select',{id});
    env.click('tab',{tab:'chat'});
    const invalid=Uint8Array.from([0xbe,0xc8,0xb3,0xe7]);
    await env.change({id:'csv-upload',dataset:{},files:[{
      name:'legacy-cp949.csv',size:invalid.byteLength,
      arrayBuffer:async()=>invalid.buffer,
      text:async()=>{throw Error('raw file bytes should be decoded first');}
    }]});
    assert.match(env.rootNode.innerHTML,/해석 실패: 문자 인코딩 오류: CSV UTF-8/);
    assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-(?:csv|sales-report|sales-review)"/);
    const input=id==='spreadsheet'
      ? '거래날짜,품목,결제금액\n2026-01-01,볼펜,100'
      : '판매일,판매처,판매액\n2026-01-01,매장,100';
    const valid=Buffer.from(input,'utf8');
    await env.change({id:'csv-upload',dataset:{},files:[{
      name:'valid-utf8.csv',size:valid.byteLength,
      arrayBuffer:async()=>Uint8Array.from(valid).buffer
    }]});
    assert.match(env.rootNode.innerHTML,/3개 열 감지/);
    assert.doesNotMatch(env.rootNode.innerHTML,/문자 인코딩 오류/);
  }
});

test('one-click synthetic examples execute both local tools and never mix with owner files',async()=>{
  const env=offlineFixture();
  for(const id of ['spreadsheet','sales']){
    env.click('select',{id});
    env.click('tab',{tab:'chat'});
    assert.match(env.rootNode.innerHTML,/data-action="try-sample"/);
    env.click('try-sample');
    assert.match(env.rootNode.innerHTML,/합성 예제 체험 중/);
    assert.match(env.rootNode.innerHTML,/실제 거래·매출 자료가 아닙니다/);
    if(id==='spreadsheet'){
      assert.match(env.rootNode.innerHTML,/원본 4행/);
      assert.match(env.rootNode.innerHTML,/검토 필요 2행/);
      assert.match(env.rootNode.innerHTML,/data-action="download-csv"/);
      env.click('download-csv');
      assert.equal(env.links.at(-1).download,'SMAX_DEMO_STANDARDIZED.csv');
    }else{
      assert.match(env.rootNode.innerHTML,/원본 5행/);
      assert.match(env.rootNode.innerHTML,/잠정 반영 2행/);
      assert.match(env.rootNode.innerHTML,/제외\/검토 3행/);
      assert.match(env.rootNode.innerHTML,/79\.90원/);
      assert.match(env.rootNode.innerHTML,/data-action="download-sales-report"/);
      assert.match(env.rootNode.innerHTML,/data-action="download-sales-review"/);
      env.click('download-sales-report');
      assert.equal(env.links.at(-1).download,'SMAX_DEMO_SALES_REPORT.csv');
      env.click('download-sales-review');
      assert.equal(env.links.at(-1).download,'SMAX_DEMO_SALES_REVIEW_ROWS.csv');
    }
    const ownerCsv=id==='spreadsheet'
      ? '거래날짜,품목,결제금액\n2026-10-25,실제입력,200'
      : '판매일,판매처,판매액\n2026-10-25,실제매장,200';
    await env.change({id:'csv-upload',dataset:{},files:[{
      name:'owner.csv',size:Buffer.byteLength(ownerCsv,'utf8'),
      text:async()=>ownerCsv
    }]});
    assert.match(env.rootNode.innerHTML,/owner\.csv/);
    assert.doesNotMatch(env.rootNode.innerHTML,/합성 예제 체험 중/);
    assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-(?:csv|sales-report|sales-review)"/);
  }
  env.click('select',{id:'faq'});
  env.click('tab',{tab:'chat'});
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="try-sample"/);
});


test('synthetic demos watermark both blueprint JSON and AI guide; real uploads never inherit demo status',async()=>{
  const env=offlineFixture();
  for(const id of ['spreadsheet','sales']){
    env.click('select',{id});
    env.click('tab',{tab:'chat'});
    env.click('try-sample');
    env.click('download-json');
    assert.equal(env.links.at(-1).download,'SMAX_DEMO_AX_BLUEPRINT_'+id+'.json');
    const json=JSON.parse(env.blobs.at(-1).parts[0]);
    assert.equal(json.syntheticDemo,true);
    assert.match(json.demoNotice,/합성 예제 결과/);
    env.click('download-guide');
    assert.equal(env.links.at(-1).download,'SMAX_DEMO_AI_BUILD_PROMPT_'+id+'.md');
    assert.match(env.blobs.at(-1).parts[0],/^# 합성 예제 결과입니다/);
    const actual=id==='spreadsheet'
      ? '거래날짜,품목,결제금액\n2026-10-25,원본,100'
      : '판매일,판매처,판매액\n2026-10-25,매장,100';
    await env.change({id:'csv-upload',dataset:{},files:[{
      name:'real-utf8.csv',size:Buffer.byteLength(actual,'utf8'),text:async()=>actual
    }]});
    env.click('download-json');
    assert.equal(env.links.at(-1).download,'AX_BLUEPRINT_'+id+'.json');
    const real=JSON.parse(env.blobs.at(-1).parts[0]);
    assert.equal(Object.hasOwn(real,'syntheticDemo'),false);
    assert.equal(Object.hasOwn(real,'demoNotice'),false);
    env.click('download-guide');
    assert.equal(env.links.at(-1).download,'AI_BUILD_PROMPT_'+id+'.md');
    assert.doesNotMatch(env.blobs.at(-1).parts[0],/^# 합성 예제 결과/);
  }
});

test('synthetic demo cancels an earlier pending real-file byte read',async()=>{
  const env=offlineFixture();
  env.click('select',{id:'sales'});
  env.click('tab',{tab:'chat'});
  let release;
  const pending=env.change({id:'csv-upload',dataset:{},files:[{
    name:'slow-customer.csv',size:16,
    arrayBuffer:()=>new Promise(resolve=>{release=resolve})
  }]});
  assert.equal(typeof release,'function');
  env.click('try-sample');
  assert.match(env.rootNode.innerHTML,/합성 예제 체험 중/);
  release(Buffer.from('판매일,판매처,판매액\n2026-10-25,매장,999','utf8').buffer);
  await pending;
  assert.match(env.rootNode.innerHTML,/합성 예제 체험 중/);
  assert.doesNotMatch(env.rootNode.innerHTML,/slow-customer\.csv/);
  assert.match(env.rootNode.innerHTML,/79\.90원/);
});

test('only two executable SELF templates expose CSV upload; eight design guides remain download-only',async()=>{
  const ids=['spreadsheet','inventory','faq','sales','email','rag','quote','booking','web','reviews'];
  const runnable=new Set(['spreadsheet','sales']);
  const env=offlineFixture();
  for(const id of ids){
    env.click('select',{id});
    env.click('tab',{tab:'chat'});
    if(runnable.has(id)){
      assert.match(env.rootNode.innerHTML,/id="csv-upload"/);
      assert.match(env.rootNode.innerHTML,/data-action="try-sample"/);
      env.click('try-sample');
      assert.match(env.rootNode.innerHTML,/합성 예제 체험 중/);
      continue;
    }
    assert.doesNotMatch(env.rootNode.innerHTML,/id="csv-upload"/);
    assert.doesNotMatch(env.rootNode.innerHTML,/data-action="try-sample"/);
    assert.match(env.rootNode.innerHTML,/설계 가이드 전용입니다/);
    let fileRead=false;
    await env.change({id:'csv-upload',dataset:{},files:[{
      name:'ignored.csv',size:40,arrayBuffer:async()=>{fileRead=true;throw Error('must not read');}
    }]});
    assert.equal(fileRead,false,'unsupported template must not read CSV data: '+id);
    await env.change({dataset:{action:'map',field:'date'},value:'forged-column'});
    env.click('download-json');
    const blueprint=JSON.parse(env.blobs.at(-1).parts[0]);
    assert.equal(blueprint.templateId,id);
    assert.equal(blueprint.fields.some(field=>field.sourceColumn==='forged-column'),false);
    assert.equal(env.links.at(-1).download,'AX_BLUEPRINT_'+id+'.json');
    env.click('download-guide');
    assert.equal(env.links.at(-1).download,'AI_BUILD_PROMPT_'+id+'.md');
  }
});

test('offline synthetic CSV source downloads provide BOM UTF-8 training files without changing workflow state',async()=>{
  const env=offlineFixture();
  for(const [id,sourceFile,downloadName] of [
    ['spreadsheet','SMAX_SELF_SAMPLE.csv','SMAX_DEMO_SPREADSHEET.csv'],
    ['sales','SMAX_SALES_SAMPLE.csv','SMAX_DEMO_SALES.csv']
  ]){
    env.click('select',{id});
    env.click('tab',{tab:'chat'});
    assert.match(env.rootNode.innerHTML,/data-action="download-sample-input"/);
    const before=env.rootNode.innerHTML;
    env.click('download-sample-input');
    assert.equal(env.links.at(-1).download,downloadName);
    const value=env.blobs.at(-1).parts[0];
    assert.equal(value,'\uFEFF'+readFileSync(join(root,'examples',sourceFile),'utf8'));
    assert.equal(env.blobs.at(-1).options.type,'text/csv;charset=utf-8');
    assert.equal(env.rootNode.innerHTML,before,'downloading source example must not change state');
    // Owners must still map their columns manually after upload.
    const owner=id==='spreadsheet'
      ? '거래날짜,품목,결제금액\n2026-10-26,연필,100'
      : '판매일,판매처,판매액\n2026-10-26,온라인,100';
    await env.change({id:'csv-upload',dataset:{},files:[{
      name:'owner.csv',size:Buffer.byteLength(owner,'utf8'),text:async()=>owner
    }]});
    assert.match(env.rootNode.innerHTML,/owner\.csv/);
    assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-(?:csv|sales-report|sales-review)"/);
  }
  env.click('select',{id:'faq'});
  env.click('tab',{tab:'chat'});
  assert.doesNotMatch(env.rootNode.innerHTML,/data-action="download-sample-input"/);
  const count=env.links.length;
  env.click('download-sample-input');
  assert.equal(env.links.length,count,'forged sample download in guide-only workflow');
});
