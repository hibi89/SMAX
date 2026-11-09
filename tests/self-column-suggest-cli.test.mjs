import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,readdirSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {executeColumnSuggest} from '../preprocessing/self-column-suggest-cli.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const command=join(root,'preprocessing','self-column-suggest-cli.mjs');
const csv='판매일,판매처,판매금액,비고\n2026-11-01,온라인,100,PRIVATE_CLIENT_2991\n';
function fixture(fn){
 const dir=mkdtempSync(join(tmpdir(),'smax-column-suggest-'));
 const input=join(dir,'source.csv');
 writeFileSync(input,csv);
 try{return fn({dir,input})}finally{rmSync(dir,{recursive:true,force:true})}
}
function cli(args){
 return spawnSync(process.execPath,[command,...args],{
  cwd:root,encoding:'utf8',timeout:30000,maxBuffer:512*1024
 });
}
test('local CSV reports owner selection candidates, never a mapping decision',()=>{
 fixture(({input})=>{
  const result=cli(['--input',input]);
  assert.equal(result.status,2,result.stderr);
  const report=JSON.parse(result.stdout);
  assert.equal(report.status,'CANDIDATES_FOR_OWNER_REVIEW');
  assert.equal(report.suggestions.amount[0].source,'판매금액');
  assert.equal(report.source_rows,1);
  assert.equal(report.mapping_applied,false);
  assert.equal(report.owner_approval,'NOT_GRANTED');
  assert.equal(report.execution,'NOT_PERFORMED');
 });
});
test('only header metadata, never customer row contents, appear in output',()=>{
 fixture(({input})=>{
  const result=cli(['--input',input]);
  const str=result.stdout+result.stderr;
  for(const token of ['PRIVATE_CLIENT_2991','온라인,100','100,PRIVATE'])assert.equal(str.includes(token),false);
 });
});
test('ambiguous headers require owner review instead of auto-selection',()=>{
 fixture(({input})=>{
  writeFileSync(input,'일자,판매일,판매처,금액\n2026-11-01,2026-11-01,매장,100\n');
  const report=JSON.parse(cli(['--input',input]).stdout);
  assert.equal(report.status,'AMBIGUOUS_MAPPING_REVIEW');
  assert.equal(report.mapping_applied,false);
 });
});
test('CSV with unrelated names yields empty suggestions, not invented aliases',()=>{
 fixture(({input})=>{
  writeFileSync(input,'foo,bar,baz\nA,B,C\n');
  const report=JSON.parse(cli(['--input',input]).stdout);
  assert.equal(report.status,'AMBIGUOUS_MAPPING_REVIEW');
  assert.deepEqual(report.suggestions.date,[]);
 });
});
test('strict local-only file flags, extra flags and non CSV paths denied',()=>{
 fixture(({input})=>{
  for(const args of [
    [],['--config',input],['--input',input,'--execute','true'],
    ['--input',input,'--approve'],['--input',input.replace(/\.csv$/,'.txt')]
  ]){
   const res=cli(args);
   assert.equal(res.status,1,res.stderr);
   assert.equal(res.stdout,'');
  }
 });
});
test('input file unchanged, no reports silently written',()=>{
 fixture(({input,dir})=>{
  const before=readFileSync(input),names=readdirSync(dir);
  const res=cli(['--input',input]);
  assert.equal(res.status,2,res.stderr);
  assert.deepEqual(before,readFileSync(input));
  assert.deepEqual(names,readdirSync(dir));
 });
});
test('unsupported binary and invalid UTF8 are sanitized',()=>{
 fixture(({input})=>{
  writeFileSync(input,Buffer.from([0xff,0xfe,0]));
  const result=cli(['--input',input]);
  assert.equal(result.status,1);
  assert.equal(result.stdout,'');
  assert.match(result.stderr,/INVALID_LOCAL_COLUMN_SOURCE/);
  assert.doesNotMatch(result.stderr,/source\.csv/);
 });
});
test('oversized CSV refused before unbounded read',()=>{
 fixture(({input})=>{
  writeFileSync(input,Buffer.alloc(2*1024*1024+1,0x61));
  assert.equal(cli(['--input',input]).status,1);
 });
});
test('symlinks never bypass existing safe regular-file boundary',()=>{
 fixture(({input,dir})=>{
  const link=join(dir,'linked.csv');
  try{symlinkSync(input,link)}
  catch(err){if(err.code==='EPERM'||err.code==='EACCES')return;throw err}
  const result=cli(['--input',link]);
  assert.equal(result.status,1,result.stderr);
 });
});
test('pure CLI function respects explicit file reader injection without network',()=>{
 const out=executeColumnSuggest(['--input','owner.csv'],()=>csv);
 assert.equal(out.status,'CANDIDATES_FOR_OWNER_REVIEW');
 assert.equal(out.source_rows,1);
 assert.equal(out.outbound_transfer,false);
});
