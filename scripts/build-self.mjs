// SMAX SELF: produce one offline HTML file without changing or publishing private source.
// Run: npm run build:self. The output is intentionally NOT tracked by Git.
import {createHash} from 'node:crypto';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const paths = ['templates.mjs','core.mjs','csv-transform.mjs','sales-report.mjs','app.mjs'];
const scriptTag = '<script type="module" src="./app.mjs"></script>';
const stylesheetTag = '<link rel="stylesheet" href="./styles.css">';

function exactlyOnce(text, fragment, label) {
  const parts = text.split(fragment);
  if (parts.length !== 2) throw Error(label + ': expected exactly one match; source changed');
  return parts;
}
function hash(text) {
  return createHash('sha256').update(text, 'utf8').digest('base64');
}

/**
 * Pure build operation. Inputs come only from the private repo.
 * No inline template payload is accepted from customer CSV data.
 */
export function bundleOfflineSelf({html, css, modules}) {
  if (typeof html !== 'string' || typeof css !== 'string' || !Array.isArray(modules) || modules.length !== 5) {
    throw Error('Invalid SELF source contract');
  }
  const expectedImports = new Set([
    'import {templates} from "./templates.mjs";',
    'import {searchTemplates,parseCsv,suggestFieldMap,buildBlueprint,buildHandoff} from "./core.mjs";',
    'import {normalizeSpreadsheetCsv} from "./csv-transform.mjs";',
    'import {buildSalesReport} from "./sales-report.mjs";'
  ]);
  const scripts = modules.map((code,index) => {
    if (typeof code !== 'string') throw Error('Missing module source: '+index);
    const lines = code.split(/\r?\n/), output=[];
    for (const line of lines) {
      if (/^\s*import\s/.test(line)) {
        if(index===3 && line.trim()==="import { normalizeSpreadsheetCsv, CsvTransformError } from './csv-transform.mjs';") continue;
        if(index!==4 || !expectedImports.delete(line.trim())) throw Error('Unexpected import: '+line);
        continue;
      }
      if (/^\s*export\s/.test(line)) {
        if (!/^export (?:const|class|function)\s/.test(line)) throw Error('Unexpected export: '+line);
        output.push(line.replace(/^export /,''));
      } else output.push(line);
    }
    return output.join('\n');
  });
  if (expectedImports.size) throw Error('Application imports changed; update bundler explicitly');
  if (modules.slice(0,3).some(c => /^\s*import\s/m.test(c))) {
    throw Error('A dependency module gained an import');
  }
  if (modules.some(c => /\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/.test(c))) {
    throw Error('Offline SELF cannot contain network request APIs');
  }
  const bundled = [
    'document.addEventListener("DOMContentLoaded", () => {',
    '"use strict";',
    ...scripts,
    '});'
  ].join('\n;\n');
  // Git for Windows may convert CSS line endings from LF to CRLF on checkout.
  // HTML parsing normalizes CRLF to LF before inline-style CSP hashing.
  // Hash and embed the SAME LF-canonical CSS so Edge validates it offline.
  const inlineCss = css.replace(/\r\n?/g, '\n');
  if (/<\/script/i.test(bundled) || /<\/style/i.test(inlineCss)) {
    throw Error('Unsafe closing tag inside bundled source');
  }
  const csp = "default-src 'none'; script-src 'sha256-"+hash(bundled)+
    "'; style-src 'sha256-"+hash(inlineCss)+
    "'; img-src 'self' data:; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'";
  // Git for Windows can also rewrite the outer HTML file to CRLF.
  // Canonicalize the shell so identical private source produces identical
  // offline HTML bytes and SHA-256 regardless of the checkout platform.
  let result = html.replace(/\r\n?/g, '\n');
  result = exactlyOnce(result,stylesheetTag,'stylesheet').join('<style>'+inlineCss+'</style>');
  result = exactlyOnce(result,scriptTag,'module entrypoint').join('<script>'+bundled+'</script>');
  const current = result.match(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/g);
  if (!current || current.length!==1) throw Error('Missing or duplicate CSP meta');
  result = result.replace(current[0],'<meta http-equiv="Content-Security-Policy" content="'+csp+'">');
  if (/(?:<script[^>]+src=|<link[^>]+href=|<base\b|<form\b)/i.test(result)) {
    throw Error('Offline artifact contains unsupported remote/linked resources');
  }
  return result;
}

export function buildSelf({output}={}) {
  const read = p => readFileSync(join(root,'site',p),'utf8');
  const html = bundleOfflineSelf({
    html:read('index.html'),css:read('styles.css'),modules:paths.map(read)
  });
  const out = output ? resolve(output) : join(root,'dist','SMAX_SELF_OFFLINE.html');
  // Use OS-native path handling: a POSIX '/' suffix rejects all Windows paths.
  // The production default is fixed in dist; explicit output is solely for controlled tests.
  if (!output && dirname(out) !== join(root,'dist')) throw Error('Invalid output path');
  mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,html,'utf8');
  return {file:out,bytes:Buffer.byteLength(html,'utf8'),sha256:createHash('sha256').update(html).digest('hex')};
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=buildSelf();
  console.log(JSON.stringify({status:'OFFLINE_SELF_BUILT',...result}));
}
