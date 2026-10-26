import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {reconcile,reconcileThreeWay} from '../scripts/qa-branch-reconcile.mjs';
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

test('three-branch reconciliation classifies main-only strategy and identical engine blobs without merging',()=>{
  const cwd=fixture();
  try{
    git(cwd,'branch','backend');
    git(cwd,'checkout','frontend');
    writeFileSync(join(cwd,'shared.md'),'frontend\n');
    writeFileSync(join(cwd,'engine.mjs'),'same-engine\n');
    writeFileSync(join(cwd,'different.mjs'),'frontend\n');
    writeFileSync(join(cwd,'frontend-only.mjs'),'frontend\n');
    git(cwd,'add','.');git(cwd,'commit','-m','frontend work');

    git(cwd,'checkout','backend');
    writeFileSync(join(cwd,'engine.mjs'),'same-engine\n');
    writeFileSync(join(cwd,'different.mjs'),'backend\n');
    writeFileSync(join(cwd,'backend-only.md'),'backend\n');
    git(cwd,'add','.');git(cwd,'commit','-m','backend work');

    git(cwd,'checkout','main');
    writeFileSync(join(cwd,'shared.md'),'main\n');
    writeFileSync(join(cwd,'main-strategy.md'),'preserve business decisions\n');
    git(cwd,'add','.');git(cwd,'commit','-m','main business');

    const before=git(cwd,'status','--porcelain');
    const heads=Object.fromEntries(['main','frontend','backend'].map(ref=>[ref,git(cwd,'rev-parse',ref)]));
    const result=reconcileThreeWay({cwd,mainRef:'main',frontendRef:'frontend',backendRef:'backend',
      expectMain:heads.main,expectFrontend:heads.frontend,expectBackend:heads.backend});
    assert.equal(result.status,'REVIEW_REQUIRED');
    assert.equal(result.mergePerformed,false);
    assert.equal(result.releaseApproved,false);
    assert.deepEqual(result.groups.mainOnly,['main-strategy.md']);
    assert.deepEqual(result.groups.mainFrontend,['shared.md']);
    assert.deepEqual(result.groups.frontendBackend,['different.mjs','engine.mjs']);
    assert.deepEqual(result.groups.backendOnly,['backend-only.md']);
    assert.deepEqual(result.identicalShared,['engine.mjs']);
    assert.deepEqual(result.divergentShared,['different.mjs','shared.md']);
    assert.equal(result.counts.mainOnly,1);
    assert.equal(git(cwd,'status','--porcelain'),before,'audit must not modify the checkout');
    for(const ref of ['main','frontend','backend'])assert.equal(git(cwd,'rev-parse',ref),heads[ref]);
    assert.throws(()=>reconcileThreeWay({cwd,mainRef:'main',frontendRef:'frontend',backendRef:'backend',
      expectBackend:'0000'}),/backend snapshot changed/);
  }finally{rmSync(cwd,{recursive:true,force:true});}
});

test('three-branch audit retains legacy two-branch report and rejects missing ref',()=>{
  const cwd=fixture();
  try{
    const legacy=reconcile({cwd,mainRef:'main',frontendRef:'frontend'});
    assert.equal(legacy.mergePerformed,false);
    assert.equal(legacy.releaseApproved,false);
    assert.deepEqual(legacy.sharedChanges,[]);
    assert.throws(()=>reconcileThreeWay({cwd,mainRef:'main',frontendRef:'frontend',backendRef:'missing'}),
      /git rev-parse failed/);
  }finally{rmSync(cwd,{recursive:true,force:true});}
});
