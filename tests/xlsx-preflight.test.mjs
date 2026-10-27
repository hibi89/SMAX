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
const worksheet=(body)=>`<?xml version="1.0" encoding="utf-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
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

// Strict JSON package contract tests use only checked-in synthetic fixtures.
import {validateXlsxCellsPackage,serializeXlsxCellsPackage} from '../preprocessing/xlsx-package.mjs';
const verified =()=>{
  const source=xlsx(worksheet('<row r="1"><c r="A1" t="inlineStr"><is><t>name</t></is></c><c r="B1"><f>SUM(B2)</f><v>2</v></c></row><row r="2"><c r="A2" t="b"><v>1</v></c></row>'));
  return {source,pkg:extractXlsxCells(source)};
};
test('XLSX strict package validates structure and original source bytes',()=>{
  const {source,pkg}=verified();
  assert.equal(validateXlsxCellsPackage(pkg),true);
  assert.equal(validateXlsxCellsPackage(pkg,source),true);
  assert.deepEqual(JSON.parse(serializeXlsxCellsPackage(pkg,source)),pkg);
});
test('XLSX strict package prevents top-level approval and unknown fields',()=>{
  const {pkg}=verified();
  for(const approval of ['APPROVED','PENDING',null]){
    const q=structuredClone(pkg);q.approval=approval;
    assert.throws(()=>validateXlsxCellsPackage(q),/contract or approval/);
  }
  const q=structuredClone(pkg);q.new_flag='UNSAFE';
  assert.throws(()=>validateXlsxCellsPackage(q),/contract or approval/);
});
test('XLSX strict package rejects forged cell approval, errors and totals',()=>{
  const {pkg}=verified();
  const cases=[
    q=>q.sheets[0].rows[0].cells[0].status='APPROVED',
    q=>q.sheets[0].rows[0].cells[1].status='READY_FOR_HUMAN_REVIEW',
    q=>q.sheets[0].rows[0].cells[1].reason=null,
    q=>q.quality.review_cells=0,
    q=>q.quality.cells=999
  ];
  for(const edit of cases){const q=structuredClone(pkg);edit(q);
    assert.throws(()=>validateXlsxCellsPackage(q));
  }
});
test('XLSX strict package rejects cached formula or scalar promotion',()=>{
  const {pkg}=verified();
  const cases=[q=>q.sheets[0].rows[0].cells[1].value='2',
    q=>q.sheets[0].rows[0].cells[1].kind='number_text',
    q=>q.sheets[0].rows[1].cells[0].value='true'];
  for(const edit of cases){const q=structuredClone(pkg);edit(q);
    assert.throws(()=>validateXlsxCellsPackage(q));
  }
});
test('XLSX strict package rejects coordinate and path mismatches',()=>{
  const {pkg}=verified();
  const cases=[q=>q.sheets[0].rows[0].cells[0].ref='XFE1',
    q=>q.sheets[0].rows[0].cells[0].ref='A9',
    q=>q.sheets[0].source_path='../escape.xml',
    q=>q.source.worksheet_paths=['xl/worksheets/sheet2.xml']];
  for(const edit of cases){const q=structuredClone(pkg);edit(q);
    assert.throws(()=>validateXlsxCellsPackage(q));
  }
});
test('XLSX strict package detects duplicate row or cell provenance',()=>{
  const {pkg}=verified();
  const q=structuredClone(pkg);q.sheets[0].rows.push(structuredClone(q.sheets[0].rows[0]));
  assert.throws(()=>validateXlsxCellsPackage(q),/invalid source row/);
  const w=structuredClone(pkg);w.sheets[0].rows[0].cells.push(structuredClone(w.sheets[0].rows[0].cells[0]));
  assert.throws(()=>validateXlsxCellsPackage(w),/duplicate cell/);
});
test('XLSX strict package source parity detects semantically altered values',()=>{
  const {source,pkg}=verified();const q=structuredClone(pkg);
  q.sheets[0].rows[0].cells[0].value='tampered';
  assert.equal(validateXlsxCellsPackage(q),true); // Structural-only is not authenticity proof.
  assert.throws(()=>validateXlsxCellsPackage(q,source),/differs from source extraction/);
  assert.throws(()=>serializeXlsxCellsPackage(q,source),/differs from source extraction/);
});
test('XLSX strict package matches SHA and exact source type',()=>{
  const {source,pkg}=verified();
  const modified=Buffer.from(source);modified[5]^=1;
  assert.throws(()=>validateXlsxCellsPackage(pkg,modified),/source hash mismatch/);
  assert.throws(()=>validateXlsxCellsPackage(pkg,'source.xlsx'),/Uint8Array/);
});

test('XLSX numeric raw text is validated without lossy floating-point coercion',()=>{
 const literals=['-12.50','+.5','1.','1e-13','0','+42','1000000000000000000000000.00001'];
 const cells=literals.map((v,i)=>`<c r="A${i+1}"><v>${v}</v></c>`);
 const file=xlsx(worksheet(cells.map((c,i)=>`<row r="${i+1}">${c}</row>`).join('')));
 const pkg=extractXlsxCells(file);
 assert.deepEqual(pkg.sheets[0].rows.map(r=>r.cells[0].value),literals);
 assert.equal(validateXlsxCellsPackage(pkg,file),true);
});

test('XLSX parser refuses unsupported numeric literals instead of marking them trusted',()=>{
 for(const value of ['NaN','Infinity','=SUM(1)','+cmd','1,234','abc',' 1','1 ','.','1e','']){
   const file=xlsx(worksheet(`<row r="1"><c r="A1"><v>${value}</v></c></row>`));
   assert.throws(()=>extractXlsxCells(file),/invalid numeric cell literal/,value);
 }
});

test('XLSX package refuses a tampered numeric text even without source bytes',()=>{
 const pkg=extractXlsxCells(xlsx(worksheet('<row r="1"><c r="A1"><v>123</v></c></row>')));
 const cell=pkg.sheets.flatMap(s=>s.rows).flatMap(r=>r.cells).find(c=>c.kind==='number_text');
 assert.ok(cell,'Fixture must include numeric cells');
 for(const invalid of ['NaN','=SUM(1)','1,234','Infinity']){
   const q=structuredClone(pkg);
   q.sheets.flatMap(s=>s.rows).flatMap(r=>r.cells).find(c=>c.kind==='number_text').value=invalid;
   assert.throws(()=>validateXlsxCellsPackage(q),/invalid scalar type/,invalid);
 }
});

test('reject XML-entity-encoded external ZIP relationship target mode',()=>{
 const malicious='<Relationships><Relationship TargetMode="Exter&#x6e;al" Target="https://invalid.example/file"/></Relationships>';
 assert.throws(()=>preflightXlsx(withEntry({name:'xl/_rels/workbook.xml.rels',content:malicious})),/external relationship/);
});

test('reject decimal XML references and malformed relationship modes',()=>{
 for(const mode of ['&#69;xternal','Exter&#110;al','Extern&amp;al','External','internal','Broken&#0;']) {
   const rel=`<Relationships><Relationship TargetMode="${mode}" Target="../sheet.xml"/></Relationships>`;
   assert.throws(()=>preflightXlsx(withEntry({name:'xl/_rels/workbook.xml.rels',content:rel})),/external relationship|invalid relationship/,mode);
 }
});

test('allow explicit XML-encoded Internal relationship while remaining offline',()=>{
 const rel='<Relationships><Relationship TargetMode="Inte&#114;nal" Target="worksheets/sheet1.xml"/></Relationships>';
 const pf=preflightXlsx(withEntry({name:'xl/_rels/workbook.xml.rels',content:rel}));
 assert.equal(pf.entry_count,4);
});

test('reject external relationship in case-varied XML relationship filename',()=>{
 const rel='<Relationships><Relationship TargetMode="Exter&#110;al"/></Relationships>';
 assert.throws(()=>preflightXlsx(withEntry({name:'xl/_rels/workbook.xml.RELS',content:rel})),/external relationship/);
});


test('XLSX Unicode-obscured formula-like strings require review, but signed numeric text does not',()=>{
 const suspicious=['\u202E=2','\u2066@SUM(1)','\u034F+1','-SUM(2)'];
 for(const value of suspicious){
   const source=xlsx(worksheet(`<row r="1"><c r="A1" t="inlineStr"><is><t>${value}</t></is></c></row>`));
   const pkg=extractXlsxCells(source),cell=pkg.sheets[0].rows[0].cells[0];
   assert.equal(cell.value,value);
   assert.equal(cell.status,'NEEDS_REVIEW',JSON.stringify(value));
   assert.equal(cell.reason,'FORMULA_LIKE_TEXT',JSON.stringify(value));
   assert.equal(pkg.quality.review_cells,1);
   assert.equal(validateXlsxCellsPackage(pkg,source),true);
   const forged=structuredClone(pkg);
   forged.sheets[0].rows[0].cells[0].status='READY_FOR_HUMAN_REVIEW';
   assert.throws(()=>validateXlsxCellsPackage(forged),/review state mismatch/);
 }
 const source=xlsx(worksheet('<row r="1"><c r="A1" t="inlineStr"><is><t>-12.50</t></is></c></row>'));
 const pkg=extractXlsxCells(source),cell=pkg.sheets[0].rows[0].cells[0];
 assert.equal(cell.value,'-12.50');
 assert.equal(cell.status,'READY_FOR_HUMAN_REVIEW');
 assert.equal(cell.reason,null);
 assert.equal(pkg.quality.review_cells,0);
 assert.equal(validateXlsxCellsPackage(pkg,source),true);
});


test('XLSX conflicting cell payloads fail closed without breaking formula caches',()=>{
 const malformed=[
  '<c r="A1" t="inlineStr"><is><t>safe</t></is><v>99</v></c>',
  '<c r="A1" t="n"><v>12.5</v><is><t>hidden</t></is></c>',
  '<c r="A1"><f>SUM(A2)</f><v>2</v><is><t>hidden</t></is></c>'
 ];
 for(const cell of malformed){
  assert.throws(()=>extractXlsxCells(xlsx(worksheet(`<row r="1">${cell}</row>`))),/conflicting cell payload/);
 }
 for(const cell of [
  '<c r="A1" t="inlineStr"><is><t>safe</t></is></c>',
  '<c r="A1"><v>12.5</v></c>',
  '<c r="A1"><f>SUM(A2)</f><v>2</v></c>'
 ]){
  const source=xlsx(worksheet(`<row r="1">${cell}</row>`));
  assert.equal(validateXlsxCellsPackage(extractXlsxCells(source),source),true);
 }
});


test('XLSX phonetic annotations do not contaminate visible string values',()=>{
 const rich='<r><t>東</t></r><r><t>京</t></r><rPh sb="0" eb="2"><t>=とうきょう</t></rPh><phoneticPr fontId="1"/>';
 const source=xlsx(worksheet('<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="inlineStr"><is>'+rich+'</is></c></row>'),
  [{name:'xl/sharedStrings.xml',content:'<sst><si>'+rich+'</si></sst>'}]);
 const pkg=extractXlsxCells(source),cells=pkg.sheets[0].rows[0].cells;
 assert.deepEqual(cells.map(c=>c.value),['東京','東京']);
 assert.deepEqual(cells.map(c=>c.reason),[null,null]);
 assert.equal(pkg.quality.review_cells,0);
 assert.equal(validateXlsxCellsPackage(pkg,source),true);
});
