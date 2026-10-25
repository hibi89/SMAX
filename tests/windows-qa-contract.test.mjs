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
