import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {preprocessHtml,validateHtmlPackage,serializeHtmlPackage} from '../preprocessing/html.mjs';
const buffer=s=>Buffer.from(s,'utf8');
test('HTML block text & entities preserve provenance',()=>{
 const bytes=buffer('<!DOCTYPE html><html><body><h1>제목</h1><p>문구 &amp; 상점</p><p>=SUM(1)</p></body></html>');
 const pkg=preprocessHtml(bytes);
 assert.deepEqual(pkg.segments.map(s=>s.text),['제목','문구 & 상점','=SUM(1)']);
 assert.deepEqual(pkg.segments.map(s=>s.reason),[null,null,'FORMULA_LIKE_TEXT']);
 assert.equal(pkg.source.sha256,createHash('sha256').update(bytes).digest('hex'));
 assert.equal(pkg.approval,'NOT_GRANTED');
 assert.equal(preprocessHtml(buffer('<p>A&amp;B</p>')).segments[0].text,'A&B');
 assert.equal(preprocessHtml(buffer('\uFEFF<p>Hi</p>')).segments[0].text,'Hi');
 assert.equal(validateHtmlPackage(pkg,bytes),true);
 assert.match(serializeHtmlPackage(pkg,bytes),/SMAX_PREPROCESS_HTML_V0/);
});
test('HTML source offsets point into the original markup, not normalized text',()=>{
 const bytes=buffer('<html>\n<body><p>Alpha <b>Beta</b></p><p>-12.50</p></body></html>');
 const pkg=preprocessHtml(bytes);
 assert.deepEqual(pkg.segments.map(s=>s.text),['Alpha Beta','-12.50']);
 assert.equal(pkg.segments[0].source_line,2);
 assert.equal(pkg.segments[0].source_offset,bytes.toString('utf8').indexOf('Alpha'));
 assert.equal(pkg.quality.review_segments,0);
});
test('HTML rejects scripts, unknown tags, event-handler attributes',()=>{
 for(const input of ['<script>alert(1)</script>','<iframe src="x"></iframe>','<p onclick="alert(1)">x</p>','<div><p>open</div>']){
   assert.throws(()=>preprocessHtml(buffer(input)),/unsupported|forbidden|unbalanced/);
 }
});
test('HTML rejects malformed entities and invalid source data',()=>{
 for(const input of ['<p>&bogus;</p>','<p>&#xD800;</p>','<p>&abc</p>','<p>x'])assert.throws(()=>preprocessHtml(buffer(input)),/unsupported|unclosed/);
 assert.throws(()=>preprocessHtml(Buffer.from([255])),/encoded data was not valid/i);
});
test('HTML validator refuses forged approval, review status and source hash',()=>{
 const bytes=buffer('<p>+CMD</p>');const pkg=preprocessHtml(bytes);
 const forg=structuredClone(pkg);forg.segments[0].reason=null;forg.segments[0].status='READY_FOR_HUMAN_REVIEW';
 assert.throws(()=>validateHtmlPackage(forg),/review mismatched/);
 const approved=structuredClone(pkg);approved.approval='APPROVED';assert.throws(()=>validateHtmlPackage(approved),/state/);
 assert.throws(()=>validateHtmlPackage(pkg,buffer('<p>+XXX</p>')),/source byte hash/);
});
import {mkdtempSync,readFileSync,writeFileSync,rmSync,symlinkSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runHtmlCli} from '../preprocessing/html-cli.mjs';
test('HTML CLI local file produces JSON and refuses overwrite/corrupt input',()=>{
 const dir=mkdtempSync(join(tmpdir(),'smax-html-'));
 try{
  const input=join(dir,'page.html'),output=join(dir,'out.json'),bytes=buffer('<p>local</p>');
  writeFileSync(input,bytes);
  const result=runHtmlCli(['--input',input,'--output',output]);
  assert.equal(result.status,'LOCAL_FILE_CREATED');
  const pkg=JSON.parse(readFileSync(output,'utf8'));
  assert.equal(pkg.source.sha256,createHash('sha256').update(bytes).digest('hex'));
  assert.equal(validateHtmlPackage(pkg,bytes),true);
  assert.deepEqual(readFileSync(input),bytes);
  assert.throws(()=>runHtmlCli(['--input',input,'--output',output]),/EEXIST/);
  rmSync(output);
  writeFileSync(input,buffer('<script>blocked</script>'));
  assert.throws(()=>runHtmlCli(['--input',input,'--output',output]),/unsupported/);
  assert.equal(existsSync(output),false);
 }finally{rmSync(dir,{force:true,recursive:true});}
});
test('HTML CLI rejects symlink and oversized file',()=>{
 const dir=mkdtempSync(join(tmpdir(),'smax-html-'));
 try{
  const input=join(dir,'page.html'),output=join(dir,'out.json'),link=join(dir,'linked.html');
  writeFileSync(input,Buffer.alloc(2*1024*1024+1,0x61));
  assert.throws(()=>runHtmlCli(['--input',input,'--output',output]),/2 MiB/);
  writeFileSync(input,buffer('<p>ok</p>'));
  symlinkSync(input,link);
  assert.throws(()=>runHtmlCli(['--input',link,'--output',output]),/non-symlink/);
  assert.equal(existsSync(output),false);
 }finally{rmSync(dir,{force:true,recursive:true});}
});
