import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {renderOwnerPortalHtml,ownerPortalScriptHash} from '../preprocessing/self-owner-portal.mjs';
import {createPortalFile,parsePortalArgs} from '../preprocessing/self-owner-portal-cli.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const temp=t=>{const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'smax-p18-')));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;};
test('P18 deterministic standalone HTML has a matching CSP SHA256',()=>{
 const html=renderOwnerPortalHtml();assert.equal(html,renderOwnerPortalHtml());
 const script=html.match(/<script>([\s\S]*?)<\/script>/u)?.[1];
 assert.ok(script);assert.equal(ownerPortalScriptHash(),createHash('sha256').update(script).digest('base64'));
 assert.ok(html.includes('sha256-'+ownerPortalScriptHash()));
 assert.match(html,/connect-src &#39;none&#39;/);assert.doesNotMatch(html,/src="https?:/u);
 assert.equal(fs.readFileSync(path.join(root,'site','owner.html'),'utf8'),html); // Static product entry matches source generator exactly.
});
test('P18 portal holds no customer sample rows, and labels approvals as ungranted',()=>{
 const html=renderOwnerPortalHtml();
 assert.doesNotMatch(html,/PRIVATE_CUSTOMER|SECRET_ROW|fetch\(|XMLHttpRequest/u);
 assert.match(html,/승인·원본 변경·집계 실행은 하지 않았습니다/u);
});
test('P18 explicitly creates one local file without overwriting it',t=>{
 const dir=temp(t),output=path.join(dir,'owner.html');
 const r=createPortalFile(['--output',output]);
 assert.equal(r.approval,'NOT_GRANTED');assert.equal(r.customer_data_read,false);
 assert.equal(fs.readFileSync(output,'utf8'),renderOwnerPortalHtml());
 assert.throws(()=>createPortalFile(['--output',output]),/EEXIST/u);
});
test('P18 rejects relative/unsafe/extra/duplicate arguments and symlinked output parent',t=>{
 const dir=temp(t),output=path.join(dir,'owner.html');
 for(const args of [[],['--output','owner.html'],['--output',output,'--approve'],['--force',output],
  ['--output',path.join(dir,'owner.csv')],['--output',output+'\nforged']])
  assert.throws(()=>parsePortalArgs(args),TypeError);
 const linked=path.join(dir,'symlink');
 try{fs.symlinkSync(dir,linked,'dir');}catch(e){if(['EPERM','EACCES'].includes(e.code))return t.skip('symlink not available');throw e;}
 assert.throws(()=>parsePortalArgs(['--output',path.join(linked,'a.html')]),TypeError);
});
test('P18 actual Node CLI writes exclusive document with no CSV or path disclosure',t=>{
 const dir=temp(t),output=path.join(dir,'owner.html');
 const cli=path.join(root,'preprocessing','self-owner-portal-cli.mjs');
 const ok=spawnSync(process.execPath,[cli,'--output',output],{encoding:'utf8',timeout:20000});
 assert.equal(ok.status,0,ok.stderr);assert.equal(JSON.parse(ok.stdout).status,'OFFLINE_OWNER_PORTAL_CREATED');
 const fail=spawnSync(process.execPath,[cli,'--output',output],{encoding:'utf8',timeout:20000});
 assert.equal(fail.status,1);assert.equal(fail.stdout,'');
 assert.doesNotMatch(fail.stderr,/owner\.html|PRIVATE_CUSTOMER/u);
 assert.match(fail.stderr,/SMAX_OWNER_PORTAL_BLOCKED/u);
});
