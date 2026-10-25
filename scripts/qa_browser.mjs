// SMAX SELF developer-only end-to-end Chromium/Edge QA.
// No deployment, customer records, external calls or production accounts.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {verifySelfQaArtifact} from './self-qa-integrity.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i < 0 ? fallback : (args[i+1] ?? '');
}
const htmlPath = resolve(arg('--html', join(root, 'dist', 'SMAX_SELF_OFFLINE.html')));
const samplePath = resolve(arg('--sample', join(root, 'examples', 'SMAX_SELF_SAMPLE.csv')));
const reportPath = resolve(arg('--report', join(root, 'dist', 'SELF_QA_REPORT.json')));
const channel = arg('--channel', 'chromium');
const headed = args.includes('--headed');
const ids = ['spreadsheet','inventory','faq','sales','email','rag','quote','booking','web','reviews'];
const checks = [], errors = [], requests = [];
const fail = message => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

function observe(page) {
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => {
    if (/^https?:\/\//i.test(request.url())) requests.push(request.url());
  });
}
async function makeContext(browser, viewport) {
  const context = await browser.newContext({acceptDownloads:true, viewport});
  await context.setOffline(true);
  const page = await context.newPage();
  observe(page);
  await page.goto(pathToFileURL(htmlPath).href, {waitUntil:'load', timeout:15000});
  return {context,page};
}

async function main() {
  assert(['chromium','msedge'].includes(channel), 'Use --channel chromium or msedge');
  assert(existsSync(htmlPath) && htmlPath.endsWith('.html'), 'Offline HTML missing; run npm run qa:release first');
  assert(existsSync(samplePath) && samplePath.endsWith('.csv'), 'Synthetic CSV fixture missing');
  assert(existsSync(reportPath), 'Release QA report missing; run npm run qa:release first');
  const artifactEvidence = verifySelfQaArtifact(htmlPath, reportPath);
  let chromium;
  try {
    ({chromium} = await import('playwright'));
  } catch {
    fail('Developer prerequisite missing: npm install --no-save playwright && npx playwright install chromium');
  }
  const browser = await chromium.launch({
    ...(channel === 'msedge' ? {channel:'msedge'} : {}),
    headless: !headed
  });
  try {
    const {context,page} = await makeContext(browser, {width:1280,height:900});
    try {
      assert((await page.title()).startsWith('SMAX'), 'Title missing');
      assert(await page.locator('[data-action="select"][data-id]').count() === 10, 'Expected 10 templates');
      checks.push('Offline file and 10 templates open');
      await page.locator('[data-action="select"][data-id="spreadsheet"]').first().click();
      await page.locator('#tab-chat').click();
      await page.locator('#csv-upload').setInputFiles(samplePath);
      for (const [field,label] of Object.entries({date:'거래날짜',item:'품목',amount:'결제금액'})) {
        await page.locator('#map-'+field).selectOption({label});
      }
      await page.locator('[data-action="run-csv"]').click();
      const preview = await page.locator('.csv-result').innerText();
      assert(preview.includes('검토 필요 2행') && preview.includes('DUPLICATE') && preview.includes('INVALID_DATE'), 'CSV preview flags wrong');
      checks.push('4-row CSV mapping and 2 review rows');
      const [download] = await Promise.all([
        page.waitForEvent('download', {timeout:10000}),
        page.locator('[data-action="download-csv"]').click()
      ]);
      const output = readFileSync(await download.path());
      const text = output.toString('utf8');
      assert(download.suggestedFilename() === 'SMAX_STANDARDIZED.csv', 'CSV filename wrong');
      assert(output.subarray(0,3).equals(Buffer.from([239,187,191])), 'CSV BOM missing');
      assert(text.split(/\r?\n/).filter(Boolean).length === 5, 'Four input rows were not retained');
      assert((text.match(/NEEDS_REVIEW/g) ?? []).length === 2, 'Review count mismatch');
      checks.push('Real browser CSV download, UTF-8 BOM, 4 output rows');
      await page.locator('#map-amount').selectOption({label:'품목'});
      assert(await page.locator('[data-action="download-csv"]').count() === 0, 'Stale download remains');
      assert(await page.locator('[data-action="run-csv"]').isDisabled(), 'Duplicate mapping allowed');
      checks.push('Invalid remapping blocks stale export');
      await page.setViewportSize({width:375,height:812});
      assert(await page.locator('#csv-upload').count() === 1, 'Mobile upload missing');
      checks.push('Mobile-width upload present');
    } finally { await context.close(); }

    // Separate browser contexts avoid Chromium's automatic multiple-download cap.
    for (const id of ids) {
      const {context,page} = await makeContext(browser,{width:1280,height:900});
      try {
        await page.locator('[data-action="select"][data-id="'+id+'"]').first().click();
        await page.locator('#tab-chat').click();
        const [j] = await Promise.all([
          page.waitForEvent('download',{timeout:10000}),
          page.locator('[data-action="download-json"]').click()
        ]);
        const json = JSON.parse(readFileSync(await j.path(),'utf8'));
        assert(j.suggestedFilename() === 'AX_BLUEPRINT_'+id+'.json', 'Blueprint filename wrong: '+id);
        assert(json.templateId === id && json.state === 'NEEDS_REVIEW', 'Blueprint not review-only: '+id);
        const [g] = await Promise.all([
          page.waitForEvent('download',{timeout:10000}),
          page.locator('[data-action="download-guide"]').click()
        ]);
        const guide = readFileSync(await g.path(),'utf8');
        assert(g.suggestedFilename() === 'AI_BUILD_PROMPT_'+id+'.md', 'Guide filename wrong: '+id);
        assert(guide.includes('개인정보') && guide.includes('검증 체크리스트'), 'Guide safety/checklist missing: '+id);
      } finally { await context.close(); }
    }
    checks.push('All 10 template JSON and Markdown guides downloaded (20 files)');
    assert(!errors.length, 'JavaScript/console errors: '+errors.join('; '));
    assert(!requests.length, 'External requests: '+requests.join('; '));
    checks.push('0 JS errors and 0 outbound HTTP(S) requests');
    console.log(JSON.stringify({
      status:'PASS', browser:channel, browserVersion:browser.version(),
      htmlSha256:artifactEvidence.sha256, releaseQaArtifactMatch:'PASS',
      checks, syntheticFixture:true, guideDownloads:20,
      outboundHttpRequests:0, browserErrors:0
    },null,2));
  } finally { await browser.close(); }
}
main().catch(error => {
  console.error(JSON.stringify({status:'FAIL',reason:String(error?.message??error),checks,errors,requests},null,2));
  process.exitCode=1;
});
