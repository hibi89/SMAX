// Strict read-only XLSX ZIP inspection. Does not parse worksheet data or extract files.
import {inflateRawSync} from 'node:zlib';

export const XLSX_PREFLIGHT_VERSION = 'SMAX_XLSX_PREFLIGHT_V0';
const MAX_SOURCE = 2 * 1024 * 1024;
const MAX_UNCOMPRESSED = 8 * 1024 * 1024;
const MAX_ENTRIES = 512;
const decoder = new TextDecoder('utf-8', {fatal: true});
const sig = (buf, offset) => buf.readUInt32LE(offset);
function fail(reason) { throw new TypeError('XLSX_PRECHECK: ' + reason); }
function crc32(data) {
  let crc = -1;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ -1) >>> 0;
}
function safeName(name) {
  if (!name || name.length > 256 || name.startsWith('/') || /^[A-Za-z]:/.test(name) || name.includes('\\') ||
      /[\u0000-\u001f\u007f]/.test(name) ||
      name.split('/').some(part => part === '..' || part === '.' || part === '') && !name.endsWith('/')) return false;
  const parts = name.endsWith('/') ? name.slice(0, -1).split('/') : name.split('/');
  return parts.length > 0 && parts.every(part => part && part !== '.' && part !== '..');
}
function scanManifestXml(name, data) {
  if (!(name.toLowerCase().endsWith('.xml') || name.toLowerCase().endsWith('.rels'))) return;
  const text = decoder.decode(data);
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(text)) fail('XML entity declaration is forbidden');
  // Relationship modes can include XML character references (e.g. Exter&#x6e;al).
  // Inspect the decoded attribute rather than only the raw XML spelling.
  const markers = text.match(/\bTargetMode\s*=/gi) || [];
  const attributes = [...text.matchAll(/\bTargetMode\s*=\s*(["'])(.*?)\1/gi)];
  if (markers.length !== attributes.length) fail('invalid relationship target mode');
  for (const match of attributes) {
    const mode = match[2].replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
      const known = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
      if (Object.hasOwn(known, entity)) return known[entity];
      const cp = entity[1].toLowerCase()==='x' ? parseInt(entity.slice(2),16) : parseInt(entity.slice(1),10);
      if (!cp || cp > 0x10ffff || cp >= 0xd800 && cp <= 0xdfff) fail('invalid relationship XML reference');
      return String.fromCodePoint(cp);
    });
    if (mode !== 'Internal') fail('external relationship is forbidden');
  }
}

/** Offline preflight only: validates ZIP bounds, content integrity and minimal XLSX parts.
 * No filesystem writes, outbound requests, formulas, XML interpretation or approval.
 */
export function preflightXlsx(input) {
  if (!(input instanceof Uint8Array)) fail('input must be binary bytes');
  const buf = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  if (buf.length < 22 || buf.length > MAX_SOURCE) fail('compressed input must be 22 bytes to 2 MiB');
  // EOCD can be preceded by at most 65535 bytes of archive comment.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); --i) {
    if (sig(buf, i) === 0x06054b50 && i + 22 + buf.readUInt16LE(i + 20) === buf.length) {
      eocd = i; break;
    }
  }
  if (eocd < 0) fail('ZIP end-of-central-directory missing');
  const disk = buf.readUInt16LE(eocd + 4);
  const centralDisk = buf.readUInt16LE(eocd + 6);
  const diskEntries = buf.readUInt16LE(eocd + 8);
  const entries = buf.readUInt16LE(eocd + 10);
  const directorySize = buf.readUInt32LE(eocd + 12);
  const directoryOffset = buf.readUInt32LE(eocd + 16);
  if (disk || centralDisk || diskEntries !== entries || entries === 0 || entries > MAX_ENTRIES ||
      entries === 65535 || directoryOffset === 0xffffffff || directorySize === 0xffffffff) {
    fail('unsupported ZIP disk, ZIP64 or entry count');
  }
  if (directoryOffset + directorySize !== eocd) fail('central directory length mismatch');
  let cursor = directoryOffset, total = 0;
  const names = new Set(), paths = [], occupied = [];
  for (let index = 0; index < entries; index++) {
    if (cursor + 46 > eocd || sig(buf, cursor) !== 0x02014b50) fail('invalid central directory header');
    const flag = buf.readUInt16LE(cursor + 8);
    const method = buf.readUInt16LE(cursor + 10);
    const checksum = buf.readUInt32LE(cursor + 16);
    const compressed = buf.readUInt32LE(cursor + 20);
    const inflated = buf.readUInt32LE(cursor + 24);
    const nameLen = buf.readUInt16LE(cursor + 28);
    const extraLen = buf.readUInt16LE(cursor + 30);
    const commentLen = buf.readUInt16LE(cursor + 32);
    const startDisk = buf.readUInt16LE(cursor + 34);
    const attributes = buf.readUInt32LE(cursor + 38);
    const localOffset = buf.readUInt32LE(cursor + 42);
    const next = cursor + 46 + nameLen + extraLen + commentLen;
    if (next > eocd || !nameLen || startDisk || localOffset === 0xffffffff ||
        compressed === 0xffffffff || inflated === 0xffffffff) fail('invalid ZIP entry metadata');
    if (flag & 1 || flag & 0x40 || (flag & ~0x0806)) fail('encrypted or unsupported ZIP flags');
    if (method !== 0 && method !== 8) fail('unsupported ZIP compression method');
    const name = decoder.decode(buf.subarray(cursor + 46, cursor + 46 + nameLen));
    if (!safeName(name)) fail('unsafe ZIP entry path');
    const key = name.toLocaleLowerCase('en-US');
    if (names.has(key)) fail('duplicate ZIP entry path');
    names.add(key);
    const fileType = (attributes >>> 16) & 0xf000;
    if (fileType === 0xa000) fail('ZIP symlink entry');
    if (/^(?:xl\/externalLinks\/|xl\/embeddings\/|xl\/vbaProject\.bin$)/i.test(name)) {
      fail('external link, embedding or macro is forbidden');
    }
    total += inflated;
    if (total > MAX_UNCOMPRESSED) fail('uncompressed input exceeds 8 MiB');
    if (localOffset + 30 > directoryOffset || sig(buf, localOffset) !== 0x04034b50) {
      fail('missing or invalid local ZIP header');
    }
    const localFlag = buf.readUInt16LE(localOffset + 6);
    const localMethod = buf.readUInt16LE(localOffset + 8);
    const localNameSize = buf.readUInt16LE(localOffset + 26);
    const localExtraSize = buf.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameSize + localExtraSize;
    if (localFlag !== flag || localMethod !== method ||
        dataOffset + compressed > directoryOffset ||
        decoder.decode(buf.subarray(localOffset + 30, localOffset + 30 + localNameSize)) !== name) {
      fail('local and central ZIP entries disagree');
    }
    if (buf.readUInt32LE(localOffset + 14) !== checksum ||
        buf.readUInt32LE(localOffset + 18) !== compressed ||
        buf.readUInt32LE(localOffset + 22) !== inflated) {
      fail('local ZIP sizes or CRC mismatch');
    }
    const data = buf.subarray(dataOffset, dataOffset + compressed);
    let unpacked;
    try {
      unpacked = method === 0 ? data : inflateRawSync(data, {maxOutputLength: inflated + 1});
    } catch { fail('compressed entry cannot be decoded within claimed bounds'); }
    if (unpacked.length !== inflated || crc32(unpacked) !== checksum) fail('ZIP content size or CRC mismatch');
    scanManifestXml(name, unpacked);
    occupied.push([localOffset, dataOffset + compressed]);
    paths.push(name);
    cursor = next;
  }
  if (cursor !== eocd) fail('central directory trailing data');
  occupied.sort((a,b) => a[0] - b[0]);
  if (occupied[0][0] !== 0 || occupied.some((range,i) => i > 0 && range[0] < occupied[i-1][1])) {
    fail('overlapping or prefixed ZIP entry');
  }
  if (!names.has('[content_types].xml') || !names.has('xl/workbook.xml') ||
      !paths.some(name => /^xl\/worksheets\/sheet[1-9]\d*\.xml$/i.test(name))) {
    fail('required XLSX package parts missing');
  }
  return Object.freeze({schema_version: XLSX_PREFLIGHT_VERSION, approval: 'NOT_GRANTED',
    format: 'XLSX_ZIP', compressed_bytes: buf.length, uncompressed_bytes: total,
    entry_count: entries, paths: Object.freeze(paths)});
}
