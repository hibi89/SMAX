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
    modules:['templates.mjs','core.mjs','csv-transform.mjs','app.mjs'].map(read)
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
    document,window:{},TextEncoder,Blob:TestBlob,URL,
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
