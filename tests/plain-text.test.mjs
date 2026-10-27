import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,symlinkSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {preprocessPlainText,validatePlainTextPackage,serializePlainTextPackage} from '../preprocessing/plain-text.mjs';
import {runTextCli} from '../preprocessing/text-cli.mjs';
const encode=text=>Buffer.from(text,'utf8');
test('text paragraphs retain raw source, line and character offsets',()=>{
  const b=encode('\uFEFF첫째 줄\r\n다음 줄\r\n\r\n=HYPERLINK(1)\n\n-12.5');
  const p=preprocessPlainText(b);
  assert.equal(p.source.sha256,createHash('sha256').update(b).digest('hex'));
  assert.equal(p.source.raw_text,'\uFEFF첫째 줄\r\n다음 줄\r\n\r\n=HYPERLINK(1)\n\n-12.5');
  assert.deepEqual(p.segments.map(s=>s.source_line),[1,4,6]);
  assert.deepEqual(p.segments.map(s=>s.reason),[null,'FORMULA_LIKE_TEXT',null]);
  assert.equal(p.quality.review_segments,1);
  assert.equal(p.approval,'NOT_GRANTED');
  assert.equal(validatePlainTextPackage(p,b),true);
  assert.match(serializePlainTextPackage(p,b),/SMAX_PREPROCESS_TEXT_V0/);
});
test('text source and approval tampering fail validation',()=>{
  const b=encode('Valid text\n\n=2');const p=preprocessPlainText(b);
  const forged=structuredClone(p);forged.segments[1].status='READY_FOR_HUMAN_REVIEW';
  assert.throws(()=>validatePlainTextPackage(forged),/segments or review/);
  const approved=structuredClone(p);approved.approval='APPROVED';
  assert.throws(()=>validatePlainTextPackage(approved),/approval/);
  assert.throws(()=>validatePlainTextPackage(p,encode('different')),/source bytes differ/);
});
test('invalid UTF-8, empty text and overly large input fail closed',()=>{
  assert.throws(()=>preprocessPlainText(Buffer.from([0xff])),/encoded data was not valid/);
  assert.throws(()=>preprocessPlainText(encode(' \r\n  ')),/empty text/);
  assert.throws(()=>preprocessPlainText(Buffer.alloc(2*1024*1024+1,0x61)),/2 MiB/);
});
test('local text CLI creates exclusive output and retains source hash',()=>{
  const dir=mkdtempSync(join(tmpdir(),'smax-text-'));
  try{
    const input=join(dir,'source.md'),output=join(dir,'result.json'),b=encode('1. Hello\n\n=SUM(1)');
    writeFileSync(input,b);
    const result=runTextCli(['--input',input,'--output',output]);
    const pkg=JSON.parse(readFileSync(output,'utf8'));
    assert.equal(result.status,'LOCAL_FILE_CREATED');
    assert.equal(pkg.source.sha256,createHash('sha256').update(b).digest('hex'));
    assert.equal(result.review_segments,1);
    assert.deepEqual(readFileSync(input),b);
    assert.throws(()=>runTextCli(['--input',input,'--output',output]),/EEXIST/);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('text CLI rejects symlinks and invalid source without output',()=>{
  const dir=mkdtempSync(join(tmpdir(),'smax-text-'));
  try{
    const input=join(dir,'source.txt'),out=join(dir,'result.json'),link=join(dir,'link.txt');
    writeFileSync(input,Buffer.from([0xff]));
    assert.throws(()=>runTextCli(['--input',input,'--output',out]),/encoded data was not valid/);
    assert.equal(existsSync(out),false);
    try{symlinkSync(input,link)}catch(e){if(['EPERM','EACCES','ENOSYS'].includes(e.code))return;throw e;}
    assert.throws(()=>runTextCli(['--input',link,'--output',out]),/non-symlink/);
    assert.equal(existsSync(out),false);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
