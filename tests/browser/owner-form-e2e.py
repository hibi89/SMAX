"""Optional P17 smoke: real Node P8 HTML -> Chromium -> JSON -> real Node validator.

Run from any directory: python tests/browser/owner-form-e2e.py
Requires Python Playwright and a Chromium executable (SMAX_CHROMIUM_PATH optional).
Synthetic data only. Does NOT validate file://, P9/P12, Windows, or full repo QA.
"""
import json
import os
from pathlib import Path
import subprocess
import tempfile

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
CSV = '일자,판매처,금액,메모\n2026-11-01,온라인,100,PRIVATE_ROW_ONLY\n'
HEADERS = ['일자', '판매처', '금액', '메모']


def node(module_code: str, payload: str = ''):
    result = subprocess.run(
        ['node', '--input-type=module', '--eval', module_code], cwd=ROOT,
        input=payload, text=True, capture_output=True, timeout=20, check=True,
    )
    return json.loads(result.stdout)


def main():
    generated = node('''
import {createHash} from 'node:crypto';
import {renderOwnerMappingHtml} from './preprocessing/self-owner-mapping.mjs';
const csv = '일자,판매처,금액,메모\\n2026-11-01,온라인,100,PRIVATE_ROW_ONLY\\n';
const sha = createHash('sha256').update(csv).digest('hex');
console.log(JSON.stringify({html:renderOwnerMappingHtml(['일자','판매처','금액','메모'],sha),sha}));
''')
    html, sha = generated['html'], generated['sha']
    assert 'PRIVATE_ROW_ONLY' not in html
    checks = []
    with tempfile.TemporaryDirectory(prefix='smax-p17-browser-') as output:
        with sync_playwright() as playwright:
            executable = os.environ.get('SMAX_CHROMIUM_PATH')
            browser = playwright.chromium.launch(
                headless=True,
                executable_path=executable if executable else None,
                args=['--no-sandbox'] if executable else [],
            )
            try:
                context = browser.new_context(accept_downloads=True)
                page = context.new_page()
                runtime_errors, requests = [], []
                page.on('pageerror', lambda err: runtime_errors.append(str(err)))
                page.on('request', lambda req: requests.append(req.url))
                # This tests real Chromium JS/CSP/download, not OS-level file:// access.
                page.set_content(html, wait_until='load')
                page.locator('#save').click()
                assert '서로 다르게' in page.locator('#message').inner_text()
                checks.append('empty mapping blocked')
                page.select_option('#date', '일자')
                page.select_option('#channel', '판매처')
                page.select_option('#amount', '판매처')
                page.locator('#save').click()
                assert '서로 다르게' in page.locator('#message').inner_text()
                checks.append('duplicate mapping blocked')
                page.select_option('#amount', '금액')
                page.select_option('#period', 'monthly')
                with page.expect_download() as download_info:
                    page.locator('#save').click()
                download = download_info.value
                assert download.suggested_filename == 'smax-owner-mapping.json'
                output_path = Path(output) / download.suggested_filename
                download.save_as(output_path)
                draft = json.loads(output_path.read_text('utf8'))
                assert draft['source_sha256'] == sha
                assert draft['period'] == 'monthly'
                assert draft['mapping'] == {'date':'일자','channel':'판매처','amount':'금액'}
                checks.append('real Chromium JSON download SHA-bound')
                assert '승인·집계 실행은 하지 않았습니다' in page.locator('#message').inner_text()
                checks.append('not automatically approved')
                assert not runtime_errors, runtime_errors
                checks.append('zero JS exceptions')
                assert not requests, requests
                checks.append('zero browser requests')
                assert 'PRIVATE_ROW_ONLY' not in page.content()
                checks.append('zero synthetic source-row leakage in HTML')
                browser_version = browser.version
            finally:
                browser.close()
        native = node('''
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {validateOwnerDraft} from './preprocessing/self-owner-mapping.mjs';
const csv = '일자,판매처,금액,메모\\n2026-11-01,온라인,100,PRIVATE_ROW_ONLY\\n';
const sha = createHash('sha256').update(csv).digest('hex');
const draft = JSON.parse(fs.readFileSync(0,'utf8'));
const clean = validateOwnerDraft(['일자','판매처','금액','메모'],sha,draft);
if(clean.period!=='monthly'||clean.mapping.amount!=='금액')throw Error('INVALID_OWNER_SELECTED_MAPPING');
for(const forged of [
 {...draft,source_sha256:'0'.repeat(64)},
 {...draft,mapping:{...draft.mapping,date:'판매처'}},
 {...draft,approved:true}
]){
 let rejected=false;
 try{validateOwnerDraft(['일자','판매처','금액','메모'],sha,forged)}catch{rejected=true}
 if(!rejected)throw Error('FORGED_MAPPING_ACCEPTED');
}
console.log(JSON.stringify({nativeAccepted:true,forgeriesRejected:3}));
''', json.dumps(draft, ensure_ascii=False))
        assert native['nativeAccepted']
        checks.append('downloaded draft accepted by exact Node P8 validator')
        assert native['forgeriesRejected'] == 3
        checks.append('3 forged drafts blocked by exact Node P8 validator')
    print(json.dumps({'result':'PASS','checks':len(checks),'details':checks,
                      'chromium':browser_version,'file_url_tested':False,
                      'full_repo_tested':False}, ensure_ascii=False))


if __name__ == '__main__':
    main()
