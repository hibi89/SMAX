// SMAX² P5: bounded multi-source PREP -> SELF summary; explicit local manifest only.
// Does not perform approvals, files writes, reconciliation, purchase or network actions.
import {resolve, dirname, sep, isAbsolute} from 'node:path';
import {realpathSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {readBoundedRegularFile, executeSelfPreviewCli} from './self-preview-cli.mjs';
import {SELF_PREVIEW_GATE_VERSION} from './self-preview-gate.mjs';

export const SELF_BATCH_VERSION = 'SMAX_PREP_SELF_LOCAL_BATCH_V1';
export const MAX_PREVIEW_ITEMS = 8;
const INT_RE = /^-?(?:0|[1-9]\d*)\.\d{2}$/;
const REASONS = new Set(['PREP_REVIEW_QUEUE_NOT_EMPTY','SELF_REPORT_REVIEW_REQUIRED']);

const exactKeys = (v, keys) => v !== null && typeof v === 'object' &&
    !Array.isArray(v) && Object.keys(v).sort().join('\0') === [...keys].sort().join('\0');

function resolveWithin(folder, supplied, extension) {
  if (typeof supplied !== 'string' || supplied.length < 1 || supplied.length > 512 ||
      /[\\:\u0000-\u001f\u007f]/.test(supplied) ||
      isAbsolute(supplied) || supplied.startsWith('-') ||
      supplied.split('/').some(segment=>segment === '..' || segment === '.' || !segment) ||
      !supplied.toLowerCase().endsWith(extension)) {
    throw new TypeError('Batch source must be a relative, explicitly named local file');
  }
  const candidate = resolve(folder, supplied);
  const root = realpathSync(folder);
  const resolved = realpathSync(candidate);
  if (!resolved.startsWith(root + sep) || resolved === root) {
    throw new TypeError('Batch path escaped explicit manifest directory');
  }
  return candidate;
}

export function parseSelfBatchArgs(argv) {
  if (!Array.isArray(argv) || argv.length !== 2 || argv[0] !== '--manifest' ||
      typeof argv[1] !== 'string' || !argv[1] ||
      argv[1].startsWith('-') || /[\u0000-\u001f\u007f]/.test(argv[1])) {
    throw new TypeError('Only --manifest <local.json> is allowed');
  }
  return argv[1];
}

export function parseSelfBatchManifest(raw) {
  const doc = JSON.parse(raw);
  if (!exactKeys(doc, ['version','sources']) || doc.version !== 1 ||
      !Array.isArray(doc.sources) || doc.sources.length < 1 ||
      doc.sources.length > MAX_PREVIEW_ITEMS) {
    throw new TypeError('Invalid versioned self-preview batch manifest');
  }
  const keys = new Set();
  for(const entry of doc.sources) {
    if (!exactKeys(entry, ['id','input','config']) ||
        typeof entry.id !== 'string' || !/^[a-z][a-z0-9_]{0,31}$/.test(entry.id) ||
        keys.has(entry.id) || typeof entry.input !== 'string' ||
        typeof entry.config !== 'string') {
      throw new TypeError('Invalid batch item contract or duplicate ID');
    }
    keys.add(entry.id);
  }
  return doc;
}

function parseCents(cents) {
  if(typeof cents !== 'string' || !INT_RE.test(cents) || cents.length > 31) {
    throw new TypeError('Untrusted monetary draft in batch receipt');
  }
  const negative = cents[0] === '-';
  const base = negative ? cents.slice(1) : cents;
  const [whole, fraction] = base.split('.');
  const result = BigInt(whole) * 100n + BigInt(fraction);
  return negative ? -result : result;
}
function money(v) {
  const sign = v < 0n ? '-' : '';
  const x = v < 0n ? -v : v;
  return sign + String(x/100n) + '.' + String(x%100n).padStart(2,'0');
}

function validateDraft(report) {
  if (!report || report.version !== SELF_PREVIEW_GATE_VERSION ||
      report.preprocessing_approval !== 'NOT_GRANTED' ||
      report.owner_approval !== 'NOT_GRANTED' || report.execution !== 'NOT_PERFORMED' ||
      report.outbound_transfer !== false || report.source_modified !== false ||
      !/^[a-f0-9]{64}$/.test(report.source_sha256) ||
      !Number.isSafeInteger(report.source_rows) || report.source_rows < 0 ||
      report.source_rows > 20000 || !Number.isSafeInteger(report.review_rows) ||
      report.review_rows < 0 || report.review_rows > report.source_rows) {
    throw new TypeError('Batch source has an invalid or unsafe PREP/SELF receipt');
  }
  if(report.status === 'REVIEW_HOLD') {
    if (!REASONS.has(report.reason) || report.summary !== null ||
        report.eligible_rows !== 0) {
      throw new TypeError('Batch source has a forged HOLD receipt');
    }
  } else if(report.status === 'READY_FOR_OWNER_REVIEW') {
    if (report.reason !== 'LOCAL_DRAFT_ONLY' || report.review_rows !== 0 ||
        !report.summary || report.summary.included_rows !== report.source_rows ||
        report.eligible_rows !== report.source_rows ||
        !['daily','monthly'].includes(report.summary.period) ||
        !Number.isSafeInteger(report.summary.group_count) ||
        report.summary.group_count < 0) {
      throw new TypeError('Batch source has a forged READY receipt');
    }
    const summary = report.summary;
    const p=parseCents(summary.positive_amount);
    const n=parseCents(summary.negative_adjustment);
    const net=parseCents(summary.net_amount);
    if (p<0n || n<0n || p-n!==net) {
      throw new TypeError('Batch financial receipt arithmetic mismatch');
    }
  } else {
    throw new TypeError('Unsupported status from PREP/SELF');
  }
}

export function runSelfPreviewBatch(manifest, manifestFile, runOne = executeSelfPreviewCli) {
  if(!exactKeys(manifest,['version','sources']) || manifest.version !== 1 ||
     !Array.isArray(manifest.sources) || manifest.sources.length < 1 ||
     manifest.sources.length > MAX_PREVIEW_ITEMS) {
    throw new TypeError('Invalid batch contract');
  }
  // Revalidate structured manifest; no user-authored JS or unknown fields.
  parseSelfBatchManifest(JSON.stringify(manifest));
  if(typeof manifestFile !== 'string' || !manifestFile) {
    throw new TypeError('Missing local manifest path');
  }
  const base = dirname(resolve(manifestFile));
  const seenPaths = new Set(), seenHashes = new Set();
  const items = [];
  let rows=0, holds=0, positive=0n, negative=0n;
  let period = null;
  for(const entry of manifest.sources) {
    const csv=resolveWithin(base,entry.input,'.csv');
    const config=resolveWithin(base,entry.config,'.json');
    if (seenPaths.has(csv)) {
      throw new TypeError('Repeated source in one batch is not allowed');
    }
    seenPaths.add(csv);
    const report = runOne(['--input',csv,'--config',config]);
    validateDraft(report);
    if(seenHashes.has(report.source_sha256)) {
      throw new TypeError('Duplicate content SHA detected across batch');
    }
    seenHashes.add(report.source_sha256);
    rows += report.source_rows;
    if(report.status==='REVIEW_HOLD'){
      holds++;
    }else{
      if(period === null) period = report.summary.period;
      if(period !== report.summary.period) {
        throw new TypeError('Mixed daily/monthly aggregation requires separate batches');
      }
      positive += parseCents(report.summary.positive_amount);
      negative += parseCents(report.summary.negative_adjustment);
    }
    items.push({id:entry.id, source_sha256:report.source_sha256,
                source_rows:report.source_rows, status:report.status});
  }
  // Never publish partial monetary totals when even one source is under review.
  return {
    version:SELF_BATCH_VERSION,
    status:holds?'REVIEW_HOLD':'READY_FOR_OWNER_REVIEW',
    preprocessing_approval:'NOT_GRANTED',
    owner_approval:'NOT_GRANTED',execution:'NOT_PERFORMED',
    outbound_transfer:false,source_modified:false,
    item_count:items.length,source_rows:rows,hold_sources:holds,
    items,summary:holds?null:{
      period,positive_amount:money(positive),negative_adjustment:money(negative),
      net_amount:money(positive-negative)
    }
  };
}

export function main(argv=process.argv.slice(2)) {
  try {
    const manifestFile=parseSelfBatchArgs(argv);
    const manifest=parseSelfBatchManifest(readBoundedRegularFile(manifestFile,64*1024));
    const result=runSelfPreviewBatch(manifest,manifestFile);
    process.stdout.write(JSON.stringify(result)+'\n');
    return result.status==='READY_FOR_OWNER_REVIEW'?0:2;
  } catch (_error) {
    process.stderr.write('{"status":"ERROR","code":"INVALID_LOCAL_BATCH_INPUT"}\n');
    return 1;
  }
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  process.exitCode=main();
}
