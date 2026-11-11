import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {renderOwnerPortalHtml, ownerPortalScriptHash} from '../preprocessing/self-owner-portal.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html=fs.readFileSync(path.join(root,'site/owner.html'),'utf8');
const sourceScript=html.match(/<script>([\s\S]*?)<\/script>/u)?.[1];
const temporary=t=>{const p=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'smax-p20-')));t.after(()=>fs.rmSync(p,{recursive:true,force:true}));return p;};
const run=(cli,p)=>spawnSync(process.execPath,[cli,'--output',p],{encoding:'utf8',timeout:10000});
test('P20 CSP checksum matches the exact new source and retains no-network contract',()=>{
 assert.ok(sourceScript);
 assert.equal(renderOwnerPortalHtml(),html);
 assert.equal(ownerPortalScriptHash(),createHash('sha256').update(sourceScript).digest('base64'));
 assert.match(html,/connect-src &#39;none&#39;/);
 assert.match(html,/async function verifyDraft\(\)/u);
 assert.match(html,/save\.addEventListener\('click',async\(\)=>/u);
 assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|PRIVATE_CUSTOMER_DATA/u);
});
test('P20 embedded exact SHA256 implementation preserves raw bytes 0..2MiB',()=>{
 const start=sourceScript.indexOf('function sha256(bytes){');
 const end=sourceScript.indexOf('async function inspect(){');
 assert.ok(start>=0&&end>start);
 const sha=vm.runInNewContext(sourceScript.slice(start,end)+'\nsha256;');
 for(const n of [0,1,55,56,63,64,65,127,128,255,1024,65535,1048576,2*1024*1024]){
  const input=Buffer.alloc(n);for(let i=0;i<input.length;i++)input[i]=(n+i*19)&255;
  assert.equal(sha(input),createHash('sha256').update(input).digest('hex'),'input size '+n);
 }
});
test('P20 real Native CLI generates the vetted page only once',t=>{
 const dir=temporary(t),output=path.join(dir,'owner.html');
 const cli=path.join(root,'preprocessing/self-owner-portal-cli.mjs');
 const result=run(cli,output);
 assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(result.stdout).approval,'NOT_GRANTED');
 assert.deepEqual(fs.readFileSync(output),fs.readFileSync(path.join(root,'site/owner.html')));
 assert.equal(run(cli,output).status,1);
});
test('P20 invalid CSP in an isolated copy rejects before creating a destination',t=>{
 const dir=temporary(t);
 fs.mkdirSync(path.join(dir,'preprocessing'));fs.mkdirSync(path.join(dir,'site'));
 for(const p of ['preprocessing/self-owner-portal.mjs','preprocessing/self-owner-portal-cli.mjs','site/owner.html'])
  fs.copyFileSync(path.join(root,p),path.join(dir,p));
 fs.appendFileSync(path.join(dir,'site/owner.html'),'<!-- forged -->');
 // A comment outside the inline script does not invalidate the script hash: mutate inline script itself.
 const file=path.join(dir,'site/owner.html');
 const old=fs.readFileSync(file,'utf8');fs.writeFileSync(file,old.replace('async function verifyDraft(){','async function verifyDraft(){/*tampered*/'));
 const output=path.join(dir,'not-created.html');
 const r=run(path.join(dir,'preprocessing/self-owner-portal-cli.mjs'),output);
 assert.equal(r.status,1);assert.equal(r.stdout,'');
 assert.match(r.stderr,/SMAX_OWNER_PORTAL_BLOCKED/u);
 assert.equal(fs.existsSync(output),false);
});
