import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateRawSync} from 'node:zlib';
import {preflightXlsx} from '../preprocessing/xlsx-preflight.mjs';
function crc32(data){let c=-1;for(const b of data){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^-1)>>>0;}
function makeZip(entries){
  const locals=[],directories=[];let offset=0;
  for(const entry of entries){
    const name=Buffer.from(entry.name,'utf8'),source=Buffer.from(entry.content??'','utf8');
    const compressed=entry.method===0?source:deflateRawSync(source);
    const local=Buffer.alloc(30),central=Buffer.alloc(46);
    local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(entry.flag??0x800,6);
    local.writeUInt16LE(entry.method??8,8);local.writeUInt32LE(crc32(source),14);
    local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(source.length,22);
    local.writeUInt16LE(name.length,26);
    central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);
    central.writeUInt16LE(entry.flag??0x800,8);central.writeUInt16LE(entry.method??8,10);
    central.writeUInt32LE(crc32(source),16);central.writeUInt32LE(compressed.length,20);
    central.writeUInt32LE(source.length,24);central.writeUInt16LE(name.length,28);
    central.writeUInt32LE((entry.externalAttr??0),38);central.writeUInt32LE(offset,42);
    const localBytes=Buffer.concat([local,name,compressed]);
    locals.push(localBytes);directories.push(Buffer.concat([central,name]));offset+=localBytes.length;
  }
  const dir=Buffer.concat(directories),eocd=Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50,0);eocd.writeUInt16LE(entries.length,8);
  eocd.writeUInt16LE(entries.length,10);eocd.writeUInt32LE(dir.length,12);eocd.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,dir,eocd]);
}
const parts=[
  {name:'[Content_Types].xml',content:'<Types/>'},
  {name:'xl/workbook.xml',content:'<workbook/>'},
  {name:'xl/worksheets/sheet1.xml',content:'<worksheet/>'},
];
const withEntry=(e)=>makeZip([...parts,e]);

test('valid ZIP XLSX minimal package accepted without extracting',()=>{
  const bytes=makeZip(parts),out=preflightXlsx(bytes);
  assert.equal(out.schema_version,'SMAX_XLSX_PREFLIGHT_V0');
  assert.equal(out.approval,'NOT_GRANTED');
  assert.equal(out.entry_count,3);
  assert.equal(out.compressed_bytes,bytes.length);
  assert.equal(out.paths.length,3);
});
test('reject malformed ZIP and non-binary source',()=>{
  assert.throws(()=>preflightXlsx('hello'),/binary bytes/);
  assert.throws(()=>preflightXlsx(Buffer.from('not a zip')),/2 MiB|directory missing/);
  assert.throws(()=>preflightXlsx(makeZip(parts).subarray(0,50)),/directory missing/);
});
test('reject path traversal, absolute, backslash and duplicate paths',()=>{
  for(const name of ['../escape.xml','/absolute.xml','xl\\escape.xml','xl/../escape.xml','C:/x.xml']){
    assert.throws(()=>preflightXlsx(withEntry({name,content:'a'})),/unsafe ZIP entry path/);
  }
  assert.throws(()=>preflightXlsx(withEntry({name:'XL/WORKBOOK.XML',content:'a'})),/duplicate ZIP entry/);
});
test('reject macro, external links, attachment and XML DTD',()=>{
  for(const name of ['xl/vbaProject.bin','xl/externalLinks/link1.xml','xl/embeddings/object.bin']){
    assert.throws(()=>preflightXlsx(withEntry({name,content:'test'})),/forbidden/);
  }
  assert.throws(()=>preflightXlsx(withEntry({name:'custom.xml',content:'<!DOCTYPE test [<!ENTITY x SYSTEM "file:///etc/passwd">]><a/>'})),/entity declaration/);
  assert.throws(()=>preflightXlsx(withEntry({name:'custom.rels',content:'<Relationship TargetMode="External" Target="https://example.com"/>'})),/external relationship/);
});
test('reject ZIP CRC tamper, overlapping offset and central-dir mismatch',()=>{
  let a=makeZip(parts);let bad=Buffer.from(a);bad[30 + Buffer.byteLength(parts[0].name) + 1]^=1;
  assert.throws(()=>preflightXlsx(bad),/CRC mismatch|cannot be decoded/);
  bad=Buffer.from(a);const eocd=bad.length-22;
  bad.writeUInt32LE(bad.readUInt32LE(eocd+16)+1,eocd+16);
  assert.throws(()=>preflightXlsx(bad),/central directory length mismatch/);
});
test('reject decompression bomb by claimed expanded size cap',()=>{
  const bomb=withEntry({name:'extra.xml',content:'A'.repeat(8*1024*1024+1)});
  assert.ok(bomb.length<2*1024*1024);
  assert.throws(()=>preflightXlsx(bomb),/exceeds 8 MiB/);
});
test('reject missing workbook or worksheet',()=>{
  assert.throws(()=>preflightXlsx(makeZip(parts.slice(0,2))),/required XLSX package/);
  assert.throws(()=>preflightXlsx(makeZip(parts.slice(1))),/required XLSX package/);
});
test('reject symlink archive entry',()=>{
  assert.throws(()=>preflightXlsx(withEntry({name:'shortcut',content:'target',externalAttr:0xa0000000})),/ZIP symlink/);
});
test('accept uncompressed ZIP entries with exact CRC',()=>{
  const bytes=makeZip(parts.map(part=>({...part,method:0})));
  const p=preflightXlsx(bytes);
  assert.equal(p.entry_count,3);
});

test('reject encrypted ZIP and unbounded descriptor-mode flags',()=>{
  for(const flag of [0x801,0x808]){
    assert.throws(()=>preflightXlsx(withEntry({name:'extra.xml',content:'safe',flag})),/unsupported ZIP flags/);
  }
});

// Native XLSX cell extraction smoke/edge cases, using a dependency-free local ZIP fixture.
import {extractXlsxCells,XLSX_CELLS_VERSION} from '../preprocessing/xlsx-cells.mjs';
const worksheet=(body)=>'<?xml version="1.0" encoding="utf-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+body+'</sheetData></worksheet>';
const xlsx=(sheetXml,extra=[])=>makeZip([
 {name:'[Content_Types].xml',content:'<Types/>'},
 {name:'xl/workbook.xml',content:'<workbook/>'},
 {name:'xl/worksheets/sheet1.xml',content:sheetXml},...extra
]);
test('XLSX cells extraction: inline string, decimal exact, boolean, sparse provenance',()=>{
 const file=xlsx(worksheet('<row r="1"><c r="A1" t="inlineStr"><is><t>한글 &amp; OK</t></is></c><c r="B1"><v>1000000000000.123</v></c></row><row r="3"><c r="C3" t="b"><v>1</v></c></row>'));
 const p=extractXlsxCells(file);
 assert.equal(p.schema_version,XLSX_CELLS_VERSION);
 assert.equal(p.approval,'NOT_GRANTED');
 assert.equal(p.quality.sheets,1);
 assert.equal(p.quality.rows,2);
 assert.equal(p.quality.cells,3);
 assert.equal(p.sheets[0].rows[0].cells[0].value,'한글 & OK');
 assert.equal(p.sheets[0].rows[0].cells[1].value,'1000000000000.123');
 assert.equal(p.sheets[0].rows[1].source_row,3);
 assert.equal(p.sheets[0].rows[1].cells[0].value,true);
});
test('XLSX sharedStrings supports rich runs and safe entity decoding',()=>{
 const file=xlsx(worksheet('<row r="1"><c r="B1" t="s"><v>0</v></c></row>'),
 [{name:'xl/sharedStrings.xml',content:'<sst><si><r><t>A&amp;</t></r><r><t>B</t></r></si></sst>'}]);
 assert.equal(extractXlsxCells(file).sheets[0].rows[0].cells[0].value,'A&B');
});
test('XLSX formulas are preserved but never evaluated or auto-approved',()=>{
 const file=xlsx(worksheet('<row r="1"><c r="A1"><f>SUM(A2:A3)</f><v>5</v></c></row>'));
 const p=extractXlsxCells(file),cell=p.sheets[0].rows[0].cells[0];
 assert.equal(cell.value,null);assert.equal(cell.formula,'SUM(A2:A3)');
 assert.equal(cell.status,'NEEDS_REVIEW');
 assert.equal(cell.reason,'FORMULA_UNEVALUATED');
 assert.equal(p.quality.review_cells,1);
});
test('XLSX formula-like text is review-only',()=>{
 const p=extractXlsxCells(xlsx(worksheet('<row r="1"><c r="A1" t="inlineStr"><is><t>=HYPERLINK(1)</t></is></c></row>')));
 assert.equal(p.sheets[0].rows[0].cells[0].reason,'FORMULA_LIKE_TEXT');
});
test('XLSX rejects malformed XML and unsafe declarations',()=>{
 for(const xml of [worksheet('<row r="1"><c r="A1">'),worksheet('<!DOCTYPE row><row r="1"/>'),worksheet('<row r="1"><c r="A1"><v>abc&foo;</v></c></row>')]){
  assert.throws(()=>extractXlsxCells(xlsx(xml)),/XML|XLSX_PRECHECK|entity|tag/i);
 }
});
test('XLSX rejects mismatched and duplicated cell coordinates',()=>{
 for(const payload of ['<row r="1"><c r="A11"><v>1</v></c></row>',
  '<row r="1"><c r="A1"/><c r="A1"/></row>',
  '<row r="1"><c r="XFE1"/></row>']){
  assert.throws(()=>extractXlsxCells(xlsx(worksheet(payload))),/coordinate|column out of bounds/);
 }
});
test('XLSX shared string bounds failure is not silently normalized',()=>{
 const file=xlsx(worksheet('<row r="1"><c r="A1" t="s"><v>7</v></c></row>'),
 [{name:'xl/sharedStrings.xml',content:'<sst><si><t>one</t></si></sst>'}]);
 assert.throws(()=>extractXlsxCells(file),/shared string index out of bounds/);
});
test('XLSX two worksheets retain distinct source paths',()=>{
 const p=extractXlsxCells(makeZip([
  {name:'[Content_Types].xml',content:'<Types/>'},
  {name:'xl/workbook.xml',content:'<workbook/>'},
  {name:'xl/worksheets/sheet2.xml',content:worksheet('<row r="5"><c r="A5"><v>2</v></c></row>')},
  {name:'xl/worksheets/sheet1.xml',content:worksheet('<row r="1"><c r="A1"><v>1</v></c></row>')}
 ]));
 assert.deepEqual(p.source.worksheet_paths,['xl/worksheets/sheet1.xml','xl/worksheets/sheet2.xml']);
 assert.equal(p.sheets[1].rows[0].source_row,5);
});
