// SMAX² PREP -> SELF guarded native offline command-line preview.
// No writes, network, external model, unapproved automation or raw-data stdout.
import {constants, closeSync, fstatSync, lstatSync, openSync, readSync} from 'node:fs';
import {TextDecoder} from 'node:util';
import {pathToFileURL} from 'node:url';
import {preprocessGenericCsv} from './generic-csv.mjs';
import {buildSelfPreviewFromPrep} from './self-preview-gate.mjs';

const CSV_LIMIT = 2 * 1024 * 1024;
const CONFIG_LIMIT = 64 * 1024;
const MAPPING_KEYS = ['date', 'channel', 'amount'];
const safeKeys = (x, keys) => (
  x !== null && typeof x === 'object' && !Array.isArray(x) &&
  Object.keys(x).sort().join('\0') === [...keys].sort().join('\0')
);

export function parseSelfPreviewArgs(args) {
  if (!Array.isArray(args) || args.length !== 4 ||
      args[0] !== '--input' || args[2] !== '--config') {
    throw new TypeError('Only --input <csv> --config <json> are allowed');
  }
  const input = args[1], config = args[3];
  if ([input, config].some(x => typeof x !== 'string' || x.length < 1 ||
        x.length > 1024 || x.startsWith('-') || /[\u0000-\u001f\u007f]/u.test(x))) {
    throw new TypeError('Invalid local file path');
  }
  return {input, config};
}

function sameFile(a, b) {
  return a.dev === b.dev && a.ino === b.ino &&
    a.size === b.size && a.mtimeNs === b.mtimeNs && a.ctimeNs === b.ctimeNs;
}

export function readBoundedRegularFile(path, maxBytes) {
  if (typeof path !== 'string' || !Number.isSafeInteger(maxBytes) ||
      maxBytes < 1 || maxBytes > CSV_LIMIT) {
    throw new TypeError('Invalid file preflight contract');
  }
  const before = lstatSync(path, {bigint: true});
  if (!before.isFile() || before.isSymbolicLink() ||
      before.size > BigInt(maxBytes)) {
    throw new TypeError('File must be a regular local file within byte limit');
  }
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd, {bigint: true});
    if (!opened.isFile() || !sameFile(before, opened)) {
      throw new TypeError('Source changed between path preflight and open');
    }
    // Bounded by the file size plus one; never read an unbounded growing file.
    const bytes = Buffer.alloc(Number(opened.size) + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (count === 0) break;
      length += count;
    }
    const after = fstatSync(fd, {bigint: true});
    const onPath = lstatSync(path, {bigint: true});
    if (length !== Number(opened.size) || !sameFile(opened, after) ||
        !sameFile(after, onPath) || length > maxBytes) {
      throw new TypeError('Local source changed or exceeded size limit during read');
    }
    return new TextDecoder('utf-8', {fatal: true}).decode(bytes.subarray(0, length));
  } finally {
    closeSync(fd);
  }
}

export function parseSelfPreviewConfig(raw) {
  const data = JSON.parse(raw);
  if (!safeKeys(data, ['columns', 'mapping', 'period']) ||
      !safeKeys(data.mapping, MAPPING_KEYS) ||
      !['daily', 'monthly'].includes(data.period) ||
      !Array.isArray(data.columns) || data.columns.length < 3 ||
      data.columns.length > 64) {
    throw new TypeError('Invalid PREP to SELF preview configuration');
  }
  return data;
}

export function executeSelfPreviewCli(argv, readLocalFile = readBoundedRegularFile) {
  const {input, config} = parseSelfPreviewArgs(argv);
  const cfg = parseSelfPreviewConfig(readLocalFile(config, CONFIG_LIMIT));
  const source = readLocalFile(input, CSV_LIMIT);
  const pkg = preprocessGenericCsv(source, {columns: cfg.columns});
  return buildSelfPreviewFromPrep(source, pkg, {mapping: cfg.mapping, period: cfg.period});
}

export function main(argv = process.argv.slice(2)) {
  try {
    const result = executeSelfPreviewCli(argv);
    process.stdout.write(JSON.stringify(result) + '\n');
    return result.status === 'READY_FOR_OWNER_REVIEW' ? 0 : 2;
  } catch (_error) {
    // File paths, cell values, parser messages, and secrets must not leak.
    process.stderr.write('{"status":"ERROR","code":"INVALID_LOCAL_PREVIEW_INPUT"}\n');
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
