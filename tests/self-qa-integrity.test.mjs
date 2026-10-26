import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {verifySelfQaArtifact} from '../scripts/self-qa-integrity.mjs';

function fixture(overrides={}, body='<html>synthetic offline fixture</html>') {
  const root = mkdtempSync(join(tmpdir(), 'smax-qa-integrity-'));
  const html = join(root, 'SMAX_SELF_OFFLINE.html');
  const report = join(root, 'SELF_QA_REPORT.json');
  const buffer = Buffer.from(body, 'utf8');
  writeFileSync(html, buffer);
  const data = {
    status:'LOCAL_NODE_PASS_BROWSER_NOT_TESTED',
    sha256:createHash('sha256').update(buffer).digest('hex'),
    bytes:buffer.length,
    sourceSnapshotSha256:'a'.repeat(64),
    sourceFileCount:16,
    verification:{allNodeTests:'PASS', offlineBuild:'PASS', publicPrivateBoundary:'PASS', cssAndScriptCsp:'PASS', syntheticCsv4Rows2Review:'PASS', syntheticSales5Rows3Review:'PASS'},
    ...overrides
  };
  writeFileSync(report, JSON.stringify(data), 'utf8');
  return {root,html,report,data,close:()=>rmSync(root,{recursive:true,force:true})};
}

test('matching release report allows the exact HTML artifact',()=>{
  const f=fixture();
  try{assert.deepEqual(verifySelfQaArtifact(f.html,f.report),{sha256:f.data.sha256,bytes:f.data.bytes});}
  finally{f.close();}
});

test('tampered HTML is rejected before browser launch',()=>{
  const f=fixture();
  try{writeFileSync(f.html,'<html>tampered</html>');assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/does not match/);}
  finally{f.close();}
});

test('incorrect byte count is rejected even with matching SHA',()=>{
  const f=fixture({bytes:999});
  try{assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/does not match/);}
  finally{f.close();}
});

test('failed release status cannot be promoted to browser PASS',()=>{
  const f=fixture({status:'FAIL'});
  try{assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/not a passing/);}
  finally{f.close();}
});

test('missing release check blocks browser PASS',()=>{
  const f=fixture({verification:{allNodeTests:'PASS',offlineBuild:'PASS'}});
  try{assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/not a passing/);}
  finally{f.close();}
});

test('missing or corrupt report cannot pass',()=>{
  const f=fixture();
  try{
    assert.throws(()=>verifySelfQaArtifact(f.html,join(f.root,'not-found.json')),/ENOENT/);
    writeFileSync(f.report,'{broken');
    assert.throws(()=>verifySelfQaArtifact(f.html,f.report),SyntaxError);
  }finally{f.close();}
});

test('older QA report without sales fixture proof cannot reach browser PASS',()=>{
  const f=fixture({verification:{allNodeTests:'PASS',offlineBuild:'PASS',publicPrivateBoundary:'PASS',cssAndScriptCsp:'PASS',syntheticCsv4Rows2Review:'PASS'}});
  try{assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/not a passing/);}
  finally{f.close();}
});

test('older QA report without original CSV fixture proof is also rejected',()=>{
  const f=fixture({verification:{allNodeTests:'PASS',offlineBuild:'PASS',publicPrivateBoundary:'PASS',cssAndScriptCsp:'PASS',syntheticSales5Rows3Review:'PASS'}});
  try{assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/not a passing/);}
  finally{f.close();}
});

test('old, missing, or malformed source snapshot cannot qualify for browser E2E',()=>{
  for(const bad of [undefined,'not-a-sha','F'.repeat(64),'a'.repeat(63)]){
    const f=fixture({sourceSnapshotSha256:bad});
    try{assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/source snapshot/);}
    finally{f.close();}
  }
});

test('source file count must be a positive integer',()=>{
  for(const invalid of [0,-1,'16',null,0.5]){
    const f=fixture({sourceFileCount:invalid});
    try{assert.throws(()=>verifySelfQaArtifact(f.html,f.report),/source snapshot/);}
    finally{f.close();}
  }
});
