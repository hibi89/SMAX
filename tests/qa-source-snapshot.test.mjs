import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {snapshotReleaseSources, requireUnchangedReleaseSources} from '../scripts/qa-source-snapshot.mjs';

const dirs = ['site', 'scripts', 'tests', 'public-site', 'examples'];
const files = ['package.json', 'wrangler.jsonc', 'QA_SELF_WINDOWS.cmd'];
function fixture() {
  const root=mkdtempSync(join(tmpdir(),'smax-source-lock-'));
  for(const dir of dirs) mkdirSync(join(root,dir));
  for(const name of files) writeFileSync(join(root,name),'synthetic\n');
  writeFileSync(join(root,'site','app.mjs'),'export const value = 1;\n');
  return {root,close:()=>rmSync(root,{recursive:true,force:true})};
}

test('stable checkout produces repeatable SHA and unchanged release proof',()=>{
  const f=fixture(); try {
    const one=snapshotReleaseSources(f.root),two=snapshotReleaseSources(f.root);
    assert.deepEqual(one,two);assert.equal(one.files,4);assert.match(one.sha256,/^[a-f0-9]{64}$/);
    assert.doesNotThrow(()=>requireUnchangedReleaseSources(one,two));
  }finally{f.close();}
});

test('editing an existing source after test start invalidates the release',()=>{
  const f=fixture(); try {
    const before=snapshotReleaseSources(f.root);
    writeFileSync(join(f.root,'site','app.mjs'),'export const value = 2;\n');
    assert.throws(()=>requireUnchangedReleaseSources(before,snapshotReleaseSources(f.root)),/source changed during tests\/build/);
  }finally{f.close();}
});

test('adding a previously unlisted test or public asset invalidates the release',()=>{
  const f=fixture(); try {
    const before=snapshotReleaseSources(f.root);
    writeFileSync(join(f.root,'tests','new.test.mjs'),'// new test');
    assert.throws(()=>requireUnchangedReleaseSources(before,snapshotReleaseSources(f.root)),/source changed during tests\/build/);
  }finally{f.close();}
});

test('source snapshot refuses symlinks without reading external content',t=>{
  const f=fixture(); try {
    try{symlinkSync(join(f.root,'package.json'),join(f.root,'site','external'))}
    catch(e){if(['EPERM','EACCES','ENOSYS'].includes(e.code)){t.skip('symlink privileges unavailable');return}throw e}
    assert.throws(()=>snapshotReleaseSources(f.root),/source symlink/);
  }finally{f.close();}
});

test('missing or invalid release snapshots cannot be promoted',()=>{
  const f=fixture();try{
    assert.throws(()=>requireUnchangedReleaseSources(null,snapshotReleaseSources(f.root)),/source changed/);
    rmSync(join(f.root,'site'),{recursive:true,force:true});
    assert.throws(()=>snapshotReleaseSources(f.root),/ENOENT/);
  }finally{f.close();}
});
