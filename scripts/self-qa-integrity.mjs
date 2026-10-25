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
      report.verification?.cssAndScriptCsp !== 'PASS') {
    throw new Error('SELF release QA report is not a passing local build');
  }
  const html = readFileSync(htmlPath);
  const sha256 = createHash('sha256').update(html).digest('hex');
  if (report.sha256 !== sha256 || report.bytes !== html.length) {
    throw new Error('SELF offline HTML does not match release QA SHA-256 and byte count');
  }
  return {sha256, bytes:html.length};
}
