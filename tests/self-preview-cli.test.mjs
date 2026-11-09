import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const executable = join(root, 'preprocessing', 'self-preview-cli.mjs');
const columns = [
  {key:'date',source:'일자',type:'date',required:true},
  {key:'channel',source:'판매처',type:'text',required:true},
  {key:'amount',source:'금액',type:'decimal',required:true}
];
const config = {
  columns, mapping:{date:'일자',channel:'판매처',amount:'금액'}, period:'monthly'
};
const cleanCsv = '일자,판매처,금액,메모\n' +
  '2026-11-01,온라인,100,TOP_SECRET_CUSTOMER_94\n' +
  '2026-11-02,매장,-10,private_internal\n';

function withFixture(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'smax-self-preview-'));
  const input = join(dir, 'source input.csv');
  const cfg = join(dir, 'config.json');
  writeFileSync(input, cleanCsv);
  writeFileSync(cfg, JSON.stringify(config));
  try { return fn({dir, input, cfg}); }
  finally { rmSync(dir, {recursive:true, force:true}); }
}

function invoke(args) {
  return spawnSync(process.execPath, [executable, ...args], {
    cwd:root, encoding:'utf8', timeout:30_000, maxBuffer:512 * 1024
  });
}
const run = (input,cfg) => invoke(['--input',input,'--config',cfg]);

test('native process outputs local ready draft without executing or approving',()=>{
  withFixture(({input,cfg})=>{
    const result = run(input,cfg);
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.stderr,'');
    const document=JSON.parse(result.stdout);
    assert.equal(document.status,'READY_FOR_OWNER_REVIEW');
    assert.equal(document.preprocessing_approval,'NOT_GRANTED');
    assert.equal(document.owner_approval,'NOT_GRANTED');
    assert.equal(document.execution,'NOT_PERFORMED');
    assert.equal(document.outbound_transfer,false);
    assert.equal(document.summary.net_amount,'90.00');
    assert.equal(document.summary.positive_amount,'100.00');
    assert.equal(document.summary.negative_adjustment,'10.00');
  });
});
test('private cells and channel names absent from stdout and stderr',()=>{
  withFixture(({input,cfg})=>{
    const result=run(input,cfg);
    const output=result.stdout+result.stderr;
    for (const prohibited of [
      'TOP_SECRET_CUSTOMER_94','private_internal','온라인','매장',
      'source_cells','reportCsv','reviewCsv'
    ]) assert.equal(output.includes(prohibited),false,prohibited);
  });
});
test('does not create, overwrite, or edit customer input and config',()=>{
  withFixture(({dir,input,cfg})=>{
    const before=[readFileSync(input),readFileSync(cfg)];
    const files=readdirSync(dir);
    const result=run(input,cfg);
    assert.equal(result.status,0,result.stderr);
    assert.deepEqual(readdirSync(dir),files);
    assert.deepEqual(readFileSync(input),before[0]);
    assert.deepEqual(readFileSync(cfg),before[1]);
  });
});
test('PREP invalid dates hold the complete workflow',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(input,
      '일자,판매처,금액\n2026-11-01,온라인,10\n2026-02-30,매장,20\n');
    const result=run(input,cfg);
    assert.equal(result.status,2,result.stderr);
    const body=JSON.parse(result.stdout);
    assert.equal(body.status,'REVIEW_HOLD');
    assert.equal(body.reason,'PREP_REVIEW_QUEUE_NOT_EMPTY');
    assert.equal(body.summary,null);
  });
});
test('unmapped spreadsheet formula causes review and no totals',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(input,'일자,판매처,금액,메모\n2026-11-01,온라인,10,=HYPERLINK(1)\n');
    const result=run(input,cfg);
    assert.equal(result.status,2,result.stderr);
    assert.equal(JSON.parse(result.stdout).reason,'PREP_REVIEW_QUEUE_NOT_EMPTY');
  });
});
test('SELF normalization duplicate causes review even when PREP is clean',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(input,
      '일자,판매처,금액,메모\n2026-11-01,온라인,10,x\n2026/11/01,온라인,10,x\n');
    const result=run(input,cfg);
    assert.equal(result.status,2,result.stderr);
    assert.equal(JSON.parse(result.stdout).reason,'SELF_REPORT_REVIEW_REQUIRED');
  });
});
test('SELF out-of-range money causes review without partial totals',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(input,'일자,판매처,금액\n2026-11-01,온라인,1000000000000\n');
    const result=run(input,cfg);
    assert.equal(result.status,2,result.stderr);
    assert.equal(JSON.parse(result.stdout).summary,null);
  });
});
test('JSON configuration cannot request automation, approval or output paths',()=>{
  withFixture(({input,cfg,dir})=>{
    for(const extra of [
      {approve:true}, {execute:'shell'}, {output:join(dir,'unsafe.json')}
    ]){
      writeFileSync(cfg,JSON.stringify({...config,...extra}));
      const result=run(input,cfg);
      assert.equal(result.status,1,result.stderr);
      assert.equal(result.stdout,'');
      assert.doesNotMatch(result.stderr,/TOP_SECRET|source input\.csv/);
      assert.equal(readdirSync(dir).length,2);
    }
  });
});
test('invalid schema mapping and missing required field fail closed',()=>{
  withFixture(({input,cfg})=>{
    for(const other of [
      {...config, mapping:{date:'일자',channel:'일자',amount:'금액'}},
      {...config, period:'weekly'},
      {...config, columns:columns.filter(x=>x.key!=='amount')},
      {...config, columns:columns.map(x=>x.key==='date'?{...x,type:'text'}:x)}
    ]){
      writeFileSync(cfg,JSON.stringify(other));
      const result=run(input,cfg);
      assert.equal(result.status,1,result.stderr);
      assert.equal(result.stdout,'');
    }
  });
});
test('strict UTF8 decoding refuses invalid binary input',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(input,Buffer.from([0xff,0xfe,0,15,66]));
    const result=run(input,cfg);
    assert.equal(result.status,1,result.stderr);
    assert.equal(result.stdout,'');
  });
});
test('large input and large config are refused before unbounded read',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(input,Buffer.alloc(2*1024*1024+1,0x61));
    assert.equal(run(input,cfg).status,1);
    writeFileSync(input,cleanCsv);
    writeFileSync(cfg,Buffer.alloc(64*1024+1,0x61));
    assert.equal(run(input,cfg).status,1);
  });
});
test('input symlink is not treated as an ordinary local source',()=>{
  withFixture(({input,cfg,dir})=>{
    const link=join(dir,'symlink.csv');
    try { symlinkSync(input,link); }
    catch (err) {
      if (err.code==='EPERM' || err.code==='EACCES') return;
      throw err;
    }
    assert.equal(run(link,cfg).status,1);
  });
});
test('config symlink is not accepted',()=>{
  withFixture(({input,cfg,dir})=>{
    const link=join(dir,'symlink.json');
    try { symlinkSync(cfg,link); }
    catch (err) {
      if (err.code==='EPERM' || err.code==='EACCES') return;
      throw err;
    }
    assert.equal(run(input,link).status,1);
  });
});
test('malformed CLI arguments, extra flags and repeated options rejected',()=>{
  withFixture(({input,cfg})=>{
    for(const args of [
      [], ['--input',input], ['--config',cfg,'--input',input],
      ['--input',input,'--config',cfg,'--output','out.json'],
      ['--input',input,'--config',cfg,'--approve'],
      ['--input','-danger.csv','--config',cfg]
    ]){
      const result=invoke(args);
      assert.equal(result.status,1,result.stderr);
      assert.equal(result.stdout,'');
      assert.match(result.stderr,/INVALID_LOCAL_PREVIEW_INPUT/);
    }
  });
});
test('daily output uses owner-selected aggregation period',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(cfg,JSON.stringify({...config,period:'daily'}));
    const result=run(input,cfg);
    assert.equal(result.status,0,result.stderr);
    const body=JSON.parse(result.stdout);
    assert.equal(body.summary.period,'daily');
    assert.equal(body.summary.net_amount,'90.00');
  });
});
test('source with UTF8 BOM is processed without silent data deletion',()=>{
  withFixture(({input,cfg})=>{
    writeFileSync(input,'\uFEFF'+cleanCsv);
    const result=run(input,cfg);
    assert.equal(result.status,0,result.stderr);
    assert.equal(JSON.parse(result.stdout).source_rows,2);
  });
});
