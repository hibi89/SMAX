// Windows QA contract is checked cross-platform without pretending to run Edge.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const script=readFileSync(new URL('../scripts/VERIFY_SELF_WINDOWS.ps1',import.meta.url),'utf8');
const launcher=readFileSync(new URL('../QA_SELF_WINDOWS.cmd',import.meta.url),'utf8');

test('Windows Node QA refuses stale reports without BOTH offline tool proofs',()=>{
  for(const key of [
    'allNodeTests','offlineBuild','cssAndScriptCsp','publicPrivateBoundary',
    'syntheticCsv4Rows2Review','syntheticSales5Rows3Review'
  ]) {
    assert.match(script,new RegExp(key));
  }
  assert.match(script,/\$entry\.Value -ne 'PASS'/);
  assert.match(script,/Get-FileHash -LiteralPath \$htmlPath -Algorithm SHA256/);
  assert.match(script,/\$actualBytes -ne \[long\]\$report\.bytes/);
  assert.match(script,/\$report\.verification\.saleApproval -ne 'NOT_GRANTED'/);
});

test('Optional Edge E2E fails closed; success can only be set after browser exit check',()=>{
  const guarded = script.indexOf('if ($EdgeE2E) {');
  const failed=script.indexOf('if ($browserExit -ne 0)',guarded);
  const success=script.indexOf('$ok = $true',guarded);
  assert.ok(guarded>=0 && failed>guarded && success>failed,'Edge failure check must precede success');
  assert.match(script,/npm\.cmd run qa:browser:node -- --channel msedge/);
  assert.match(script,/if \(-not \$ok\) \{ exit 1 \}/);
  assert.match(script,/Manual Windows usability/);
});

test('Windows command entrypoint runs Node by default and Edge only on explicit /edge',()=>{
  assert.match(launcher,/if \/I "%~1"=="\/edge" set "EDGE_ARG=-EdgeE2E"/);
  assert.match(launcher,/powershell\.exe -NoProfile -ExecutionPolicy RemoteSigned -File/);
  assert.match(launcher,/if not "%QA_EXIT%"=="0"/);
  assert.match(launcher,/exit \/b %QA_EXIT%/);
  assert.doesNotMatch(launcher,/\b(?:curl|wrangler)\s|powershell\s+-Command\s+IEX|npm(?:\.cmd)? run deploy/i);
});

test('Edge offline CSV download comparison respects Windows EOL without masking bad content',()=>{
  const browserScript=readFileSync(new URL('../scripts/qa_browser.mjs',import.meta.url),'utf8');
  const definition=browserScript.match(/function assertTrainingCsvDownload\(bytes, fixtureBytes, label\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(definition,'Edge must use a dedicated BOM-preserving fixture check');
  const check=new Function('Buffer','TextDecoder','assert',
    definition+'; return assertTrainingCsvDownload;')(Buffer,TextDecoder,
    (condition,message)=>{if(!condition)throw Error(message);});
  const bom=Buffer.from([239,187,191]);
  const lf=Buffer.from('열A,열B\n가,100\n나,200\n','utf8');
  const crlf=Buffer.from('열A,열B\r\n가,100\r\n나,200\r\n','utf8');
  assert.doesNotThrow(()=>check(Buffer.concat([bom,lf]),crlf,'spreadsheet'));
  assert.doesNotThrow(()=>check(Buffer.concat([bom,crlf]),lf,'sales'));
  assert.throws(()=>check(lf,crlf,'spreadsheet'),/BOM missing/);
  assert.throws(()=>check(Buffer.concat([bom,Buffer.from('열A,열B\n가,999\n나,200\n')]),lf,'sales'),/differs/);
  assert.throws(()=>check(Buffer.concat([bom,Buffer.from('열A,열B\n가,100\n')]),lf,'sales'),/differs/);
  assert.throws(()=>check(Buffer.concat([bom,Buffer.from([0xff])]),lf,'sales'),/The encoded data was not valid/);
  assert.match(browserScript,/assertTrainingCsvDownload\(\s*readFileSync\(await trainingSales\.path\(\)\)/);
  assert.match(browserScript,/assertTrainingCsvDownload\(\s*readFileSync\(await trainingCsv\.path\(\)\)/);
  assert.match(browserScript,/getComputedStyle\(el\)\.display/,
    'Real Edge E2E must verify the offline stylesheet was not blocked by CSP');
});

test('Node release QA blocks unnormalized inline CSS and script before any browser approval',()=>{
  const release=readFileSync(new URL('../scripts/qa-release.mjs',import.meta.url),'utf8');
  assert.match(release,/requireCheck\(!html\.includes\('\\r'\)/);
  assert.match(release,/requireCheck\(!js\.includes\('\\r'\)/);
  assert.match(release,/requireCheck\(!css\.includes\('\\r'\)/);
  assert.match(release,/b64sha256\(js\)/);
  assert.match(release,/b64sha256\(css\)/);
  assert.match(release,/LOCAL_NODE_PASS_BROWSER_NOT_TESTED/);
});
