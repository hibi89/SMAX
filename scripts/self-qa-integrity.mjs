// Validate that the browser E2E target is exactly the SELF artifact that passed local release QA.
// This is a local consistency check, not a cryptographic signature or a sale authorization.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

export function verifySelfQaArtifact(htmlPath, reportPath) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  if (report.status !== 'LOCAL_NODE_PASS_BROWSER_NOT_TESTED' ||
      report.verification?.allNodeTests !== 'PASS' ||
      report.verification?.offlineBuild !== 'PASS' ||
      report.verification?.publicPrivateBoundary !== 'PASS' ||
      report.verification?.cssAndScriptCsp !== 'PASS' ||
      report.verification?.syntheticCsv4Rows2Review !== 'PASS' ||
      report.verification?.syntheticSales5Rows3Review !== 'PASS') {
    throw new Error('SELF release QA report is not a passing local build');
  }
  // Older reports cannot validate a build produced without the source-lock QA gate.
  if (!/^[a-f0-9]{64}$/.test(report.sourceSnapshotSha256 ?? '') ||
      !Number.isSafeInteger(report.sourceFileCount) || report.sourceFileCount < 1) {
    throw new Error('SELF release QA report lacks a valid source snapshot');
  }
  const html = readFileSync(htmlPath);
  const sha256 = createHash('sha256').update(html).digest('hex');
  if (report.sha256 !== sha256 || report.bytes !== html.length) {
    throw new Error('SELF offline HTML does not match release QA SHA-256 and byte count');
  }
  return {sha256, bytes:html.length};
}
