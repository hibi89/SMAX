import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,readdirSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runSelfPreviewBatch,parseSelfBatchManifest,SELF_BATCH_VERSION} from '../preprocessing/self-preview-batch.mjs';
import {SELF_PREVIEW_GATE_VERSION} from '../preprocessing/self-preview-gate.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const command=join(root,'preprocessing','self-preview-batch.mjs');
const columns=[
  {key:'date',source:'일자',type:'date',required:true},
  {key:'channel',source:'판매처',type:'text',required:true},
  {key:'amount',source:'금액',type:'decimal',required:true}
];
const opts={columns,mapping:{date:'일자',channel:'판매처',amount:'금액'},period:'monthly'};
const first='일자,판매처,금액,비고\n2026-11-01,온라인,100,PRIVATE_4857\n2026-11-02,매장,-10,SENSITIVE\n';
const second='일자,판매처,금액,비고\n2026-11-03,온라인,200,SECRET_9183\n';
const manifest={
  version:1,sources:[
    {id:'shop_a',input:'a.csv',config:'a.json'},
    {id:'shop_b',input:'b.csv',config:'b.json'}
  ]
};
function fixture(fn) {
  const dir=mkdtempSync(join(tmpdir(),'smax-batch-'));
  const a=join(dir,'a.csv'),b=join(dir,'b.csv'),
    ac=join(dir,'a.json'),bc=join(dir,'b.json'),m=join(dir,'batch.json');
  writeFileSync(a,first);writeFileSync(b,second);
  writeFileSync(ac,JSON.stringify(opts));writeFileSync(bc,JSON.stringify(opts));
  writeFileSync(m,JSON.stringify(manifest));
  try {return fn({dir,a,b,ac,bc,m})}
  finally{rmSync(dir,{recursive:true,force:true})}
}
function invoke(m) {
  return spawnSync(process.execPath,[command,'--manifest',m],{
    cwd:root,encoding:'utf8',timeout:30_000,maxBuffer:512*1024
  });
}
function mockReady(hash='a'.repeat(64),amount='100.00'){
  return {
    version:SELF_PREVIEW_GATE_VERSION, source_sha256:hash,source_rows:1,
    preprocessing_approval:'NOT_GRANTED',owner_approval:'NOT_GRANTED',
    execution:'NOT_PERFORMED',outbound_transfer:false,source_modified:false,
    status:'READY_FOR_OWNER_REVIEW',reason:'LOCAL_DRAFT_ONLY',review_rows:0,
    eligible_rows:1,summary:{
      period:'monthly',group_count:1,included_rows:1,
      positive_amount:amount,negative_adjustment:'0.00',net_amount:amount
    }
  };
}

test('two clean CSV datasets yield exact BigInt total, never approval',()=>{
  fixture(({m})=>{
    const p=invoke(m);
    assert.equal(p.status,0,p.stderr);
    const j=JSON.parse(p.stdout);
    assert.equal(j.version,SELF_BATCH_VERSION);
    assert.equal(j.status,'READY_FOR_OWNER_REVIEW');
    assert.equal(j.item_count,2);
    assert.equal(j.source_rows,3);
    assert.equal(j.hold_sources,0);
    assert.equal(j.summary.positive_amount,'300.00');
    assert.equal(j.summary.negative_adjustment,'10.00');
    assert.equal(j.summary.net_amount,'290.00');
    assert.equal(j.owner_approval,'NOT_GRANTED');
    assert.equal(j.execution,'NOT_PERFORMED');
    assert.equal(j.outbound_transfer,false);
    assert.equal(j.source_modified,false);
  });
});
test('batch output excludes customer text and all source paths',()=>{
  fixture(({m,a,b})=>{
    const p=invoke(m);
    const joined=p.stdout+p.stderr;
    for(const secret of ['PRIVATE_4857','SECRET_9183','SENSITIVE','온라인','매장',
                          a,b,'source_cells','reportCsv']) assert.equal(joined.includes(secret),false);
  });
});
test('review of any source holds all financial output, not partial sum',()=>{
  fixture(({m,b})=>{
    writeFileSync(b,'일자,판매처,금액,비고\n2026-02-30,온라인,200,x\n');
    const p=invoke(m);
    assert.equal(p.status,2,p.stderr);
    const doc=JSON.parse(p.stdout);
    assert.equal(doc.status,'REVIEW_HOLD');
    assert.equal(doc.hold_sources,1);
    assert.equal(doc.summary,null);
    assert.equal(doc.items[0].status,'READY_FOR_OWNER_REVIEW');
    assert.equal(doc.items[1].status,'REVIEW_HOLD');
  });
});
test('duplicate source bytes with distinct filenames cannot be double counted',()=>{
  fixture(({m,b})=>{
    writeFileSync(b,first);
    const p=invoke(m);
    assert.equal(p.status,1);
    assert.equal(p.stdout,'');
    assert.match(p.stderr,/INVALID_LOCAL_BATCH_INPUT/);
  });
});
test('duplicate physical path in manifest cannot double count',()=>{
  fixture(({m})=>{
    const altered={version:1,sources:[
      {id:'one',input:'a.csv',config:'a.json'},
      {id:'two',input:'a.csv',config:'a.json'}
    ]};
    writeFileSync(m,JSON.stringify(altered));
    const result=invoke(m);
    assert.equal(result.status,1);
    assert.equal(result.stdout,'');
  });
});
test('different period configurations cannot silently merge',()=>{
  fixture(({m,bc})=>{
    writeFileSync(bc,JSON.stringify({...opts,period:'daily'}));
    const p=invoke(m);
    assert.equal(p.status,1);
    assert.equal(p.stdout,'');
  });
});
test('unsafe approval, action or outbound fields denied from manifest',()=>{
  fixture(({m})=>{
    for(const extra of [{approve:true},{execute:'shell'},{upload:true},{output:'public.json'}]){
      writeFileSync(m,JSON.stringify({...manifest,...extra}));
      const p=invoke(m);
      assert.equal(p.status,1,p.stderr);
      assert.equal(p.stdout,'');
    }
  });
});
test('relative path traversal, absolute paths, Windows drives and wrong extensions denied',()=>{
  fixture(({m,a})=>{
    for(const path of ['../a.csv',a,'C:\\a.csv','./a.csv','./b.json','a.txt','b//a.csv']){
      writeFileSync(m,JSON.stringify({version:1,sources:[
        {id:'only',input:path,config:'a.json'}
      ]}));
      const p=invoke(m);
      assert.equal(p.status,1,'path '+path);
      assert.equal(p.stdout,'');
    }
  });
});
test('symlink pointing outside manifest folder denied',()=>{
  fixture(({m,dir})=>{
    const link=join(dir,'escape.csv');
    try{symlinkSync(join(dir,'a.csv'),link)}
    catch(e){if(['EPERM','EACCES'].includes(e.code))return;throw e}
    writeFileSync(m,JSON.stringify({version:1,sources:[
      {id:'test',input:'escape.csv',config:'a.json'}
    ]}));
    const p=invoke(m);
    assert.equal(p.status,1,p.stderr);
  });
});
test('source and configs never changed and no output files are written',()=>{
  fixture(({m,a,b,ac,bc,dir})=>{
    const saved=[a,b,ac,bc,m].map(p=>readFileSync(p));
    const names=readdirSync(dir);
    const p=invoke(m);
    assert.equal(p.status,0,p.stderr);
    assert.deepEqual(names,readdirSync(dir));
    for(const [i,p] of [a,b,ac,bc,m].entries())assert.deepEqual(saved[i],readFileSync(p));
  });
});
test('manifest limits, malformed keys and repeated ID rejected',()=>{
  for(const invalid of [
    {version:1,sources:[]},
    {version:1,sources:new Array(9).fill({id:'a',input:'x.csv',config:'x.json'})},
    {version:1,sources:[{id:'A',input:'x.csv',config:'x.json'}]},
    {version:1,sources:[{id:'valid',input:'x.csv',config:'x.json',manual:true}]},
    {version:1,sources:[{id:'same',input:'x.csv',config:'x.json'},
                        {id:'same',input:'y.csv',config:'y.json'}]},
    {version:'1',sources:manifest.sources}
  ]) assert.throws(()=>parseSelfBatchManifest(JSON.stringify(invalid)),TypeError);
});
test('corrupted child receipt is rejected before any totals',()=>{
  fixture(({m})=>{
    const raw=parseSelfBatchManifest(JSON.stringify(manifest));
    const fake=mockReady();
    fake.summary.net_amount='999.99';
    assert.throws(()=>runSelfPreviewBatch(raw,m,()=>fake),/arithmetic/);
    const forged=mockReady();
    forged.owner_approval='GRANTED';
    assert.throws(()=>runSelfPreviewBatch(raw,m,()=>forged),/invalid or unsafe/);
  });
});
test('injected duplicate fake SHA is rejected',()=>{
  fixture(({m})=>{
    const raw=parseSelfBatchManifest(JSON.stringify(manifest));
    assert.throws(()=>runSelfPreviewBatch(raw,m,()=>mockReady()),/Duplicate content SHA/);
  });
});
test('malformed monetary receipts are rejected (NaN/exponent/injected digits)',()=>{
  fixture(({m})=>{
    const doc={version:1,sources:[manifest.sources[0]]};
    for(const number of ['NaN','1e5','1,000.00','Infinity','100.000',
                         '1'.repeat(40)+'.00']){
      const fake=mockReady('b'.repeat(64),number);
      fake.summary.net_amount=number;
      assert.throws(()=>runSelfPreviewBatch(doc,m,()=>fake),/monetary/);
    }
  });
});
test('strict malformed UTF8 manifest and oversized manifest exit 1',()=>{
  fixture(({m})=>{
    writeFileSync(m,Buffer.from([0xff,0xfe,0]));
    assert.equal(invoke(m).status,1);
    writeFileSync(m,Buffer.alloc(64*1024+1,0x61));
    assert.equal(invoke(m).status,1);
  });
});
test('single item is supported and respects owner choice',()=>{
  fixture(({m})=>{
    writeFileSync(m,JSON.stringify({version:1,sources:[manifest.sources[0]]}));
    const p=invoke(m);
    assert.equal(p.status,0,p.stderr);
    const body=JSON.parse(p.stdout);
    assert.equal(body.source_rows,2);
    assert.equal(body.item_count,1);
    assert.equal(body.summary.net_amount,'90.00');
  });
});
test('CLI rejects reordered flags, extra args, and no manifest',()=>{
  for(const args of [
    [],['--output','x.json'],['--manifest','x.json','--approve'],
    ['--input','x.csv','--config','x.json']
  ]){
    const p=spawnSync(process.execPath,[command,...args],{
      cwd:root,encoding:'utf8',timeout:30_000
    });
    assert.equal(p.status,1,p.stderr);
    assert.equal(p.stdout,'');
    assert.match(p.stderr,/INVALID_LOCAL_BATCH_INPUT/);
  }
});
