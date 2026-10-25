import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, lstatSync} from 'node:fs';
import {resolve, relative, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const settings = JSON.parse(readFileSync(join(repo,'wrangler.jsonc'),'utf8'));
const publicRoot = resolve(repo, settings.assets?.directory || '');
const html = readFileSync(join(publicRoot,'index.html'),'utf8');

function allPublicFiles(root, prefix='') {
  return readdirSync(root).flatMap(name => {
    const file = join(root,name);
    const item = lstatSync(file);
    assert.equal(item.isSymbolicLink(), false, 'public assets must not symlink outside directory');
    const rel = join(prefix,name);
    return item.isDirectory() ? allPublicFiles(file,rel) : [rel];
  });
}
test('Cloudflare static deployment is public-only by default', () => {
  assert.equal(settings.assets.directory, './public-site');
  assert.equal(relative(repo,publicRoot), 'public-site');
  const files=allPublicFiles(publicRoot);
  assert.ok(files.includes('index.html'));
  assert.ok(files.every(f => /\.(?:html|css|png|webp|jpe?g|svg)$/i.test(f)), 'no scripts, JSON, source maps or business docs in public assets');
  assert.ok(!files.some(f => /(?:^|\/)(?:app|core|csv-transform|sales-report|templates)\.mjs$/i.test(f)));
});
test('public page has no executable SELF core, file upload, third-party requests or payment links', () => {
  assert.doesNotMatch(html, /<script\b|<form\b|<input\b|<iframe\b|<object\b/i);
  assert.doesNotMatch(html, /(?:\.mjs\b|\.js\b|\.map\b|csv-transform|sales-report|normalizeSpreadsheetCsv|buildSalesReport|SMAX_AX_BLUEPRINT)/i);
  assert.doesNotMatch(html, /https?:\/\/|fetch\s*\(|XMLHttpRequest|sendBeacon|serviceWorker|<link[^>]+rel=["']preload/i);
  assert.match(html, /script-src 'none'/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
});
test('marketing headings, correct limitations and links are present', () => {
  assert.match(html, /SMAX²/);
  assert.match(html, /SMAX SQUARE/);
  assert.match(html, /함께 만드는 AX광장/);
  assert.match(html, /현재 구매할 수 없습니다/);
  assert.match(html, /완성형 프로그램은 아닙니다/);
  assert.match(html, /CSV 표준화·잠정 매출 집계 2종/);
  assert.match(html, /나머지 8종은 설계·교육 가이드 전용/);
  assert.doesNotMatch(html, /CSV 변환 1종은 로컬 실동작 검증 중/);
  assert.equal((html.match(/<article class="card">/g)||[]).length,10);
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const link of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(ids.has(link[1]), 'broken in-page link: '+link[1]);
  }
});
