// SMAX SELF: one-command local release QA. This NEVER deploys or authorizes a sale.
// node scripts/qa-release.mjs  (or npm run qa:release)
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSpreadsheetCsv } from '../site/csv-transform.mjs';
import { buildSalesReport } from '../site/sales-report.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist');
const artifact = join(dist, 'SMAX_SELF_OFFLINE.html');
const report = join(dist, 'SELF_QA_REPORT.json');

const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');
const b64sha256 = text => createHash('sha256').update(text, 'utf8').digest('base64');
function requireCheck(condition, description) {
  if (!condition) throw Error('RELEASE_QA_FAILED: ' + description);
}
function run(label) {
  const args = label === 'unit' ? ['--test'] : ['scripts/build-self.mjs'];
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  requireCheck(result.status === 0, label + ' returned ' + result.status);
}

try {
  // Test discovery is platform-independent, unlike "tests/*.test.mjs" via Windows cmd.
  for (const test of [
    'core.test.mjs', 'csv-preflight-parity.test.mjs', 'csv-transform.test.mjs', 'csv-hardening.test.mjs', 'csv-property.test.mjs', 'csv-ui.test.mjs',
    'public-boundary.test.mjs', 'offline-package.test.mjs', 'offline-ui-smoke.test.mjs', 'sales-report.test.mjs', 'self-qa-integrity.test.mjs', 'windows-qa-contract.test.mjs'
  ]) {
    requireCheck(existsSync(join(root, 'tests', test)), 'expected test missing: ' + test);
  }
  run('unit');
  run('build');

  requireCheck(existsSync(artifact), 'offline HTML was not generated');
  const html = readFileSync(artifact, 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/g) ?? [];
  const style = html.match(/<style>([\s\S]*?)<\/style>/g) ?? [];
  requireCheck(script.length === 1 && style.length === 1, 'expected exactly one inline script and stylesheet');
  const js = script[0].slice('<script>'.length, -'</script>'.length);
  const css = style[0].slice('<style>'.length, -'</style>'.length);
  requireCheck(html.includes("script-src 'sha256-" + b64sha256(js) + "'"), 'inline script CSP hash mismatch');
  requireCheck(html.includes("style-src 'sha256-" + b64sha256(css) + "'"), 'inline stylesheet CSP hash mismatch');
  requireCheck(html.includes("connect-src 'none'"), 'offline network CSP missing');
  requireCheck(html.includes("form-action 'none'"), 'offline form CSP missing');
  requireCheck(!/<script\b[^>]+src=|<link\b[^>]+href=|<iframe\b/i.test(html), 'external asset reference found');

  const publicSite = readFileSync(join(root, 'public-site', 'index.html'), 'utf8');
  const wrangler = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8'));
  requireCheck(wrangler.assets.directory === './public-site', 'Cloudflare assets must not include paid SELF');
  requireCheck(!/<script\b|<input\b|<form\b/i.test(publicSite), 'public preview must remain static');

  const sample = readFileSync(join(root, 'examples', 'SMAX_SELF_SAMPLE.csv'), 'utf8');
  const converted = normalizeSpreadsheetCsv(sample, { date: '거래날짜', item: '품목', amount: '결제금액' });
  requireCheck(converted.summary.inputRows === 4, 'sample input row count changed');
  requireCheck(converted.summary.outputRows === 4, 'CSV transform dropped rows');
  requireCheck(converted.summary.reviewRows === 2, 'review count changed');
  requireCheck(converted.csv.startsWith('\uFEFF거래일,'), 'UTF-8 BOM missing');

  // A successful shipping QA must also cover the executable second tool (sales).
  // Synthetic-only, exact mapping, review rows retained separately; no external data.
  const salesSample = readFileSync(join(root,'examples','SMAX_SALES_SAMPLE.csv'),'utf8');
  const sales = buildSalesReport(salesSample,
    {date:'판매일', channel:'판매처', amount:'판매액'}, {period:'daily'});
  requireCheck(sales.summary.sourceRows === 5 && sales.summary.includedRows === 2 &&
    sales.summary.excludedRows === 3, 'Sales release fixture inclusion/exclusion changed');
  requireCheck(sales.summary.netAmount === '79.90', 'Sales release fixture net amount changed');
  requireCheck(sales.reportCsv.startsWith('\uFEFF기간,') &&
    sales.reviewCsv.startsWith('\uFEFF원본레코드,'), 'Sales release fixture BOM missing');
  for (const flag of ['DUPLICATE','INVALID_DATE','FORMULA_PROTECTED']) {
    requireCheck(sales.reviewCsv.includes(flag), 'Sales release fixture lost review flag: '+flag);
  }
  const monthly = buildSalesReport(salesSample,
    {date:'판매일', channel:'판매처', amount:'판매액'}, {period:'monthly'});
  requireCheck(monthly.summary.netAmount === '79.90' &&
    monthly.groups.every(group => group.period === '2026-10'),
    'Sales monthly release fixture changed');

  mkdirSync(dist, { recursive: true });
  const result = {
    status: 'LOCAL_NODE_PASS_BROWSER_NOT_TESTED',
    file: 'dist/SMAX_SELF_OFFLINE.html',
    sha256: sha256(html),
    bytes: Buffer.byteLength(html, 'utf8'),
    node: process.version,
    verification: {
      allNodeTests: 'PASS',
      offlineBuild: 'PASS',
      cssAndScriptCsp: 'PASS',
      publicPrivateBoundary: 'PASS',
      syntheticCsv4Rows2Review: 'PASS',
      syntheticSales5Rows3Review: 'PASS',
      chromiumEdgeFileProtocol: 'NOT_RUN',
      windowsManualQA: 'NOT_RUN',
      saleApproval: 'NOT_GRANTED'
    }
  };
  writeFileSync(report, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ ...result, report: 'dist/SELF_QA_REPORT.json' }, null, 2));
} catch (error) {
  // Fail closed: remove any stale product generated by a previous successful build.
  // A failed QA run must not leave an apparently deliverable HTML behind.
  try { rmSync(artifact, { force: true }); } catch {}
  // Never allow a stale successful report to be confused with a failed run.
  try {
    mkdirSync(dist, { recursive: true });
    writeFileSync(report, JSON.stringify({
      status: 'FAIL', reason: String(error?.message ?? error),
      saleApproval: 'NOT_GRANTED'
    }, null, 2) + '\n', 'utf8');
  } catch {}
  console.error(error);
  process.exitCode = 1;
}
