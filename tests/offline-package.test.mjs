import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, rmSync} from 'node:fs';
import {join, resolve, win32} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {Script} from 'node:vm';
import {fileURLToPath} from 'node:url';
import {bundleOfflineSelf, buildSelf} from '../scripts/build-self.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read = f=>readFileSync(join(root,'site',f),'utf8');
const input=()=>({
  html:read('index.html'),
  css:read('styles.css'),
  modules:['templates.mjs','core.mjs','csv-transform.mjs','sales-report.mjs','app.mjs'].map(read)
});
const getScript=html=>html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const digest=s=>createHash('sha256').update(s,'utf8').digest('base64');

test('offline SELF HTML is fully self-contained and has no remote runtime resources',()=>{
  const html=bundleOfflineSelf(input());
  assert.ok(html.startsWith('<!doctype html>'));
  assert.equal((html.match(/<script>/g)||[]).length,1);
  assert.equal((html.match(/<style>/g)||[]).length,1);
  assert.doesNotMatch(html, /<script\b[^>]+src=|<link\b[^>]+href=|<iframe\b/i);
  assert.doesNotMatch(html, /\bimport\s*\{|import\(|export\s+(?:function|const|class)/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(html, /로컬 CSV 실제 변환/);
  assert.match(html, /함께 만드는 AX광장/);
  const script=getScript(html);
  assert.ok(script);
  assert.match(html,new RegExp("script-src 'sha256-"+digest(script).replace(/[+]/g,'\\+')+"'"));
  assert.match(html,new RegExp("style-src 'sha256-"+digest(input().css).replace(/[+]/g,'\\+')+"'"));
  new Script(script,{filename:'SMAX_SELF_OFFLINE.html'});
});

test('bundler rejects modified import contract and embedded network code',()=>{
  const a=input();
  a.modules[4]=a.modules[4].replace('import {templates} from "./templates.mjs";','import {bad} from "./missing.mjs";');
  assert.throws(()=>bundleOfflineSelf(a),/Unexpected import/);
  const b=input();
  b.modules[2]+='\nfetch("https://example.com");';
  assert.throws(()=>bundleOfflineSelf(b),/network request APIs/);
});

test('bundler fails closed if source entrypoint or stylesheet changes',()=>{
  const a=input();
  a.html=a.html.replace('src="./app.mjs"','src="./renamed-app.mjs"');
  assert.throws(()=>bundleOfflineSelf(a),/module entrypoint/);
  const b=input();
  b.css+='</style><script>alert(1)</script>';
  assert.throws(()=>bundleOfflineSelf(b),/Unsafe closing tag/);
});

test('offline artifact built in temporary directory is deterministic and UTF-8',()=>{
  const folder=mkdtempSync(join(tmpdir(),'smax-build-test-'));
  try{
    const out=join(folder,'SMAX_SELF_OFFLINE.html');
    const first=buildSelf({output:out});
    const content=readFileSync(out,'utf8');
    assert.equal(first.bytes,Buffer.byteLength(content,'utf8'));
    assert.equal(first.sha256,createHash('sha256').update(content).digest('hex'));
    assert.equal(content,bundleOfflineSelf(input()));
    const second=buildSelf({output:out});
    assert.equal(second.sha256,first.sha256);
  }finally{rmSync(folder,{recursive:true,force:true});}
});

test('Windows-style paths keep the output under dist without POSIX separator assumptions',()=>{
  const windowsRoot='C:\\SMAX';
  const output=win32.join(windowsRoot,'dist','SMAX_SELF_OFFLINE.html');
  assert.equal(win32.dirname(output),win32.join(windowsRoot,'dist'));
  // The old implementation checked for '/' after a Windows path and rejected this valid output.
  assert.equal(output.startsWith(win32.join(windowsRoot,'dist')+'/'),false);
  const builderSource=readFileSync(join(root,'scripts','build-self.mjs'),'utf8');
  assert.match(builderSource,/dirname\(out\) !== join\(root,'dist'\)/);
  assert.match(builderSource,/mkdirSync\(dirname\(out\)/);
});


test('SELF preview uses current Smongi naming without claiming design approval',()=>{
  const html=bundleOfflineSelf(input());
  assert.match(html,/스몽이의 화면 적용 방식은 검토 중/);
  assert.doesNotMatch(html,/맥콩이 안내하는/);
  assert.match(html,/시연 화면입니다/);
});
