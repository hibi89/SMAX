import test from 'node:test';
import assert from 'node:assert/strict';

test('SELF CSV upload / manual map / preview / download and stale-state safety', async () => {
  const listeners = {}, root = {innerHTML:''}, toast = {textContent:'',classList:{add(){},remove(){}}};
  const tabs = {
    '#tab-templates':{classList:{toggle(){}},setAttribute(){}},
    '#tab-chat':{classList:{toggle(){}},setAttribute(){}}
  };
  const links = [];
  const previous = {document:globalThis.document,window:globalThis.window,URL:globalThis.URL};
  const fakeDocument = {
    getElementById(id){return id==='work-area'?root:null},
    querySelector(q){return q==='#toast'?toast:tabs[q]??null},
    addEventListener(event,callback){listeners[event]=callback},
    createElement(name){
      assert.equal(name,'a');
      const link = {clicked:false,click(){this.clicked=true}};
      links.push(link);return link;
    }
  };
  globalThis.document=fakeDocument;
  globalThis.window={};
  globalThis.URL={createObjectURL:()=> 'blob:local-test',revokeObjectURL:()=>{}};
  try {
    await import('../site/app.mjs?csv-ui-regression');
    const click=(action,other={})=>listeners.click({target:{closest:()=>({dataset:{action,...other}})}});
    const change=target=>listeners.change({target});
    click('select',{id:'spreadsheet'});
    click('tab',{tab:'chat'});
    assert.match(root.innerHTML,/로컬 CSV 실제 변환/);
    assert.doesNotMatch(root.innerHTML,/data-action="download-csv"/);

    const csv='거래날짜,품목,결제금액\n2026-01-01,볼펜,100\n2026-01-01,볼펜,100\n2026-02-30,공책,abc';
    await change({id:'csv-upload',dataset:{},files:[{name:'sample.csv',size:csv.length,text:async()=>csv}]});
    assert.match(root.innerHTML,/3개 열 감지/);
    for(const [field,value] of Object.entries({date:'거래날짜',item:'품목',amount:'결제금액'})){
      await change({dataset:{action:'map',field},value});
    }
    click('run-csv');
    assert.match(root.innerHTML,/검토 필요 2행/);
    assert.match(root.innerHTML,/NEEDS_REVIEW/);
    assert.match(root.innerHTML,/data-action="download-csv"/);
    click('download-csv');
    assert.equal(links.at(-1).download,'SMAX_STANDARDIZED.csv');
    assert.equal(links.at(-1).clicked,true);

    await change({dataset:{action:'map',field:'amount'},value:'품목'});
    assert.doesNotMatch(root.innerHTML,/data-action="download-csv"/);
    click('run-csv');
    assert.match(root.innerHTML,/같은 원본 열/);

    await change({id:'csv-upload',dataset:{},files:[{name:'wrong.xlsx',size:4,text:async()=> 'fake'}]});
    assert.match(root.innerHTML,/CSV 파일만 지원/);
    assert.doesNotMatch(root.innerHTML,/data-action="download-csv"/);

    let release;
    const pending=change({id:'csv-upload',dataset:{},files:[{name:'later.csv',size:csv.length,text:()=>new Promise(resolve=>{release=resolve})}]});
    click('select',{id:'faq'});
    release(csv);
    await pending;
    assert.doesNotMatch(root.innerHTML,/로컬 CSV 실제 변환/);

    click('select',{id:'spreadsheet'});
    const attack='거래날짜,품목,결제금액\n2026-02-01,"<img src=x onerror=alert(1)>",100';
    await change({id:'csv-upload',dataset:{},files:[{name:'escape.csv',size:attack.length,text:async()=>attack}]});
    for(const [field,value] of Object.entries({date:'거래날짜',item:'품목',amount:'결제금액'})){
      await change({dataset:{action:'map',field},value});
    }
    click('run-csv');
    assert.match(root.innerHTML,/&lt;img/);
    assert.doesNotMatch(root.innerHTML,/<img src=x/);
  } finally {
    globalThis.document=previous.document;
    globalThis.window=previous.window;
    globalThis.URL=previous.URL;
  }
});
