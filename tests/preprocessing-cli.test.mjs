import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,writeFileSync,readFileSync,rmSync,symlinkSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {runPreprocessCli} from '../preprocessing/cli.mjs';
import {runGenericCsvCli} from '../preprocessing/generic-cli.mjs';

const fixture=()=>{
  const dir=mkdtempSync(join(tmpdir(),'smax-preprocess-cli-'));
  const input=join(dir,'input.csv'),output=join(dir,'out.json');
  const bytes=Buffer.from('\uFEFF거래날짜,품목,결제금액\n2026-10-01,연필,100\n2026-02-30,책,200','utf8');
  writeFileSync(input,bytes);
  return {dir,input,output,bytes,close:()=>rmSync(dir,{recursive:true,force:true})};
};
const args=({input,output})=>['--input',input,'--output',output,
  '--date','거래날짜','--item','품목','--amount','결제금액'];

test('local CLI writes strict JSON and exact BOM-included file provenance without changing input',()=>{
  const f=fixture();try{
    const result=runPreprocessCli(args(f));
    assert.equal(result.status,'LOCAL_FILE_CREATED');
    assert.equal(result.rows,2);assert.equal(result.review_rows,1);
    const p=JSON.parse(readFileSync(f.output,'utf8'));
    assert.equal(p.source.sha256,createHash('sha256').update(f.bytes).digest('hex'));
    assert.equal(p.approval,'NOT_GRANTED');
    assert.deepEqual(p.review_queue.map(x=>x.reasons),[['INVALID_DATE']]);
    assert.deepEqual(readFileSync(f.input),f.bytes);
  }finally{f.close();}
});

test('CLI never overwrites existing output and fails on invalid UTF-8 bytes',()=>{
  const f=fixture();try{
    writeFileSync(f.output,'old value');
    assert.throws(()=>runPreprocessCli(args(f)),/EEXIST/);
    assert.equal(readFileSync(f.output,'utf8'),'old value');
    rmSync(f.output);
    writeFileSync(f.input,Buffer.from([0xff,0xfe]));
    assert.throws(()=>runPreprocessCli(args(f)),/encoded data was not valid/i);
    assert.equal(existsSync(f.output),false);
  }finally{f.close();}
});

test('CLI rejects missing mapping, unsupported output and source symlinks',t=>{
  const f=fixture();try{
    assert.throws(()=>runPreprocessCli(['--input',f.input]),/Specify all five options/);
    assert.throws(()=>runPreprocessCli(args(f).map(x=>x===f.output?f.input:x)),/separate/);
    const link=join(f.dir,'link.csv');
    try{symlinkSync(f.input,link)}catch(e){
      if(['EPERM','EACCES','ENOSYS'].includes(e.code)){t.skip('symlink unavailable');return}throw e;
    }
    assert.throws(()=>runPreprocessCli(args({...f,input:link})),/no symlink/);
  }finally{f.close();}
});

const genericArgs=({input,output},columnsPath)=>[
  '--input',input,'--columns',columnsPath,'--output',output
];
const genericMapping={columns:[
  {key:'record_date',source:'거래날짜',type:'date',required:true},
  {key:'item',source:'품목',type:'text',required:true},
  {key:'amount',source:'결제금액',type:'decimal',required:true}
]};

test('generic CLI writes V1 with BOM-inclusive provenance, original rows and review',()=>{
  const f=fixture();try{
    const mapPath=join(f.dir,'mapping.json');
    writeFileSync(mapPath,JSON.stringify(genericMapping));
    const result=runGenericCsvCli(genericArgs(f,mapPath));
    const p=JSON.parse(readFileSync(f.output,'utf8'));
    assert.equal(result.schema_version,'SMAX_PREPROCESS_GENERIC_CSV_V1');
    assert.equal(p.source.sha256,createHash('sha256').update(f.bytes).digest('hex'));
    assert.equal(p.source.bytes,f.bytes.length);
    assert.equal(p.approval,'NOT_GRANTED');
    assert.equal(p.rows.length,2);
    assert.equal(p.rows[1].issues[0].code,'INVALID_DATE');
    assert.equal(result.review_rows,1);
    assert.deepEqual(readFileSync(f.input),f.bytes);
  }finally{f.close();}
});

test('generic CLI never overwrites and refuses extra unapproved mapping keys',()=>{
  const f=fixture();try{
    const mapPath=join(f.dir,'mapping.json');
    writeFileSync(mapPath,JSON.stringify(genericMapping));
    writeFileSync(f.output,'existing');
    assert.throws(()=>runGenericCsvCli(genericArgs(f,mapPath)),/EEXIST/);
    assert.equal(readFileSync(f.output,'utf8'),'existing');
    rmSync(f.output);
    writeFileSync(mapPath,JSON.stringify({...genericMapping,approval:'APPROVED'}));
    assert.throws(()=>runGenericCsvCli(genericArgs(f,mapPath)),/only a columns array/);
    assert.equal(existsSync(f.output),false);
  }finally{f.close();}
});

test('generic CLI rejects invalid UTF-8 source and oversized config',()=>{
  const f=fixture();try{
    const mapPath=join(f.dir,'mapping.json');
    writeFileSync(mapPath,JSON.stringify(genericMapping));
    writeFileSync(f.input,Buffer.from([255,254]));
    assert.throws(()=>runGenericCsvCli(genericArgs(f,mapPath)),/encoded data was not valid/i);
    writeFileSync(f.input,f.bytes);
    writeFileSync(mapPath,' '.repeat(64*1024+1));
    assert.throws(()=>runGenericCsvCli(genericArgs(f,mapPath)),/at most 65536 bytes/);
    assert.equal(existsSync(f.output),false);
  }finally{f.close();}
});

test('generic CLI disallows mapping symlink and identical paths',t=>{
  const f=fixture();try{
    const mapPath=join(f.dir,'mapping.json'),link=join(f.dir,'mapping-link.json');
    writeFileSync(mapPath,JSON.stringify(genericMapping));
    assert.throws(()=>runGenericCsvCli(genericArgs(f,f.output)),/ENOENT|non-symlink/);
    try{symlinkSync(mapPath,link)}catch(e){
      if(['EPERM','EACCES','ENOSYS'].includes(e.code)){
        t.skip('symlink creation unavailable');return;
      }
      throw e;
    }
    assert.throws(()=>runGenericCsvCli(genericArgs(f,link)),/non-symlink/);
    assert.equal(existsSync(f.output),false);
  }finally{f.close();}
});
