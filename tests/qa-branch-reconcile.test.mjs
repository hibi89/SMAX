import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {reconcile} from '../scripts/qa-branch-reconcile.mjs';
const script=resolve(fileURLToPath(new URL('../scripts/qa-branch-reconcile.mjs',import.meta.url)));
function git(cwd,...args){const r=spawnSync('git',args,{cwd,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
function fixture(){
  const cwd=mkdtempSync(join(tmpdir(),'smax-branch-qa-'));
  git(cwd,'init','-b','main');git(cwd,'config','user.name','Fixture');git(cwd,'config','user.email','fixture@example.invalid');
  writeFileSync(join(cwd,'shared.md'),'base\n');git(cwd,'add','.');git(cwd,'commit','-m','base');
  git(cwd,'branch','frontend');return cwd;
}
test('common changes require review, main-only business docs preserved, no working-tree changes',()=>{
 const cwd=fixture();
 try{
  git(cwd,'checkout','frontend');writeFileSync(join(cwd,'shared.md'),'frontend\n');writeFileSync(join(cwd,'frontend.mjs'),'feature\n');git(cwd,'add','.');git(cwd,'commit','-m','feature');
  git(cwd,'checkout','main');writeFileSync(join(cwd,'shared.md'),'main\n');writeFileSync(join(cwd,'strategy.md'),'business\n');git(cwd,'add','.');git(cwd,'commit','-m','business');
  const dirtyBefore=git(cwd,'status','--porcelain');
  const result=reconcile({cwd,mainRef:'main',frontendRef:'frontend'});
  assert.equal(result.status,'REVIEW_REQUIRED');assert.deepEqual(result.sharedChanges,['shared.md']);
  assert.deepEqual(result.mainOnly,['strategy.md']);assert.deepEqual(result.frontendOnly,['frontend.mjs']);
  assert.equal(result.mergePerformed,false);assert.equal(result.releaseApproved,false);
  assert.equal(git(cwd,'status','--porcelain'),dirtyBefore);
 }finally{rmSync(cwd,{recursive:true,force:true});}
});
test('non-overlapping changes have review-only success, never merge',()=>{
 const cwd=fixture();try{
   git(cwd,'checkout','frontend');writeFileSync(join(cwd,'frontend.mjs'),'x');git(cwd,'add','.');git(cwd,'commit','-m','frontend');
   git(cwd,'checkout','main');writeFileSync(join(cwd,'strategy.md'),'x');git(cwd,'add','.');git(cwd,'commit','-m','main');
   const r=reconcile({cwd,mainRef:'main',frontendRef:'frontend'});
   assert.equal(r.status,'NO_SHARED_CHANGE_REVIEW');assert.equal(r.counts.sharedChanges,0);
 }finally{rmSync(cwd,{recursive:true,force:true});}
});
test('stale expected ref and malformed CLI fail closed',()=>{
 const cwd=fixture();try{
  assert.throws(()=>reconcile({cwd,mainRef:'main',frontendRef:'frontend',expectMain:'0000'}),/main snapshot changed/);
  const v=spawnSync(process.execPath,[script,'--main'],{cwd,encoding:'utf8'});
  assert.equal(v.status,3);assert.match(v.stderr,/BLOCKED/);
 }finally{rmSync(cwd,{recursive:true,force:true});}
});
