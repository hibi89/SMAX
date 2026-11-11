import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fixture=t=>{
 const base=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'smax-portal-p19-')));
 t.after(()=>fs.rmSync(base,{recursive:true,force:true}));
 fs.mkdirSync(path.join(base,'site'));
 fs.mkdirSync(path.join(base,'preprocessing'));
 for(const p of ['preprocessing/self-owner-portal.mjs','preprocessing/self-owner-portal-cli.mjs','site/owner.html'])
  fs.copyFileSync(path.join(root,p),path.join(base,p));
 return {base,site:path.join(base,'site','owner.html'),cli:path.join(base,'preprocessing','self-owner-portal-cli.mjs')};
};
const run=(cli,target)=>spawnSync(process.execPath,[cli,'--output',target],{encoding:'utf8',timeout:15000});
test('P19 valid source and inline CSP produce an exclusive, identical owner file',t=>{
 const f=fixture(t),dest=path.join(f.base,'output.html');
 const valid=run(f.cli,dest);
 assert.equal(valid.status,0,valid.stderr);
 assert.equal(JSON.parse(valid.stdout).approval,'NOT_GRANTED');
 assert.deepEqual(fs.readFileSync(dest),fs.readFileSync(f.site));
 assert.equal(run(f.cli,dest).status,1);
});
test('P19 invalid source/CSP must not leave an empty destination file',t=>{
 const f=fixture(t),target=path.join(f.base,'invalid.html');
 fs.writeFileSync(f.site,'<!doctype html><script>injected()</script>');
 const rejected=run(f.cli,target);
 assert.equal(rejected.status,1);
 assert.equal(rejected.stdout,'');
 assert.match(rejected.stderr,/SMAX_OWNER_PORTAL_BLOCKED/u);
 assert.equal(fs.existsSync(target),false);
});
