import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,existsSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {preprocessDocx,validateDocxPackage,serializeDocxPackage} from '../preprocessing/docx.mjs';
import {runDocxCli} from '../preprocessing/docx-cli.mjs';
function crc32(bytes){let c=-1;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^-1)>>>0;}
function zip(entries){
  const local=[],central=[];let offset=0;
  for(const e of entries){
    const name=Buffer.from(e.name),raw=Buffer.from(e.content??''),comp=e.store?raw:deflateRawSync(raw);
    const a=Buffer.alloc(30),b=Buffer.alloc(46);
    a.writeUInt32LE(0x04034b50,0);a.writeUInt16LE(20,4);a.writeUInt16LE(e.flag??0x800,6);
    a.writeUInt16LE(e.store?0:8,8);a.writeUInt32LE(crc32(raw),14);
    a.writeUInt32LE(comp.length,18);a.writeUInt32LE(raw.length,22);a.writeUInt16LE(name.length,26);
    b.writeUInt32LE(0x02014b50,0);b.writeUInt16LE(20,4);b.writeUInt16LE(20,6);
    b.writeUInt16LE(e.flag??0x800,8);b.writeUInt16LE(e.store?0:8,10);
    b.writeUInt32LE(crc32(raw),16);b.writeUInt32LE(comp.length,20);
    b.writeUInt32LE(raw.length,24);b.writeUInt16LE(name.length,28);
    b.writeUInt32LE(e.externalAttr??0,38);b.writeUInt32LE(offset,42);
    const part=Buffer.concat([a,name,comp]);local.push(part);central.push(Buffer.concat([b,name]));offset+=part.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);
  end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,directory,end]);
}
const document=inside=>'<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+inside+'</w:body></w:document>';
const paragraph=s=>'<w:p><w:r><w:t>'+s+'</w:t></w:r></w:p>';
const entries=[{name:'[Content_Types].xml',content:'<Types/>'},{name:'word/document.xml',content:document(paragraph('한글 &amp; English')+paragraph('=SUM(1)'))}];
const fixture=(extra=[],doc=null)=>zip([...entries.map(e=>e.name==='word/document.xml'&&doc!==null?{...e,content:document(doc)}:e),...extra]);
test('DOCX paragraphs, entities and formula review preserve exact source SHA',()=>{
  const original=fixture(),p=preprocessDocx(original);
  assert.deepEqual(p.segments.map(s=>s.text),['한글 & English','=SUM(1)']);
  assert.equal(p.source.sha256,createHash('sha256').update(original).digest('hex'));
  assert.deepEqual(p.segments.map(s=>s.reason),[null,'FORMULA_LIKE_TEXT']);
  assert.equal(p.approval,'NOT_GRANTED');
  assert.equal(validateDocxPackage(p,original),true);
  assert.match(serializeDocxPackage(p,original),/SMAX_PREPROCESS_DOCX_V0/);
});
test('DOCX tables, tabs and breaks retain basic visible text in source order',()=>{
  const doc=paragraph('앞')+'<w:tbl><w:tr><w:tc>'+paragraph('표1')+'</w:tc><w:tc>'+paragraph('표2')+'</w:tc></w:tr></w:tbl>'+'<w:p><w:r><w:t>가</w:t><w:tab/><w:t>나</w:t><w:br/><w:t>다</w:t></w:r></w:p>';
  const p=preprocessDocx(fixture([],doc));
  assert.deepEqual(p.segments.map(s=>s.text),['앞','표1','표2','가\t나\n다']);
});
test('DOCX real paragraph indices preserve gaps caused by empty paragraphs',()=>{
  const p=preprocessDocx(fixture([],paragraph('A')+'<w:p/>'+paragraph('B')));
  assert.deepEqual(p.segments.map(s=>s.paragraph_index),[1,3]);
  assert.equal(validateDocxPackage(p),true);
});
test('DOCX rejects macros, external relationships, dangerous/unsupported parts',()=>{
  for(const e of [{name:'word/vbaProject.bin',content:'x'},
    {name:'word/_rels/document.xml.rels',content:'<Relationships><Relationship TargetMode="Exter&#x6e;al" Target="https://example.com"/></Relationships>'},
    {name:'word/media/picture1.png',content:'x'},
    {name:'word/footer1.xml',content:'<x/>'},
    {name:'word/comments.xml',content:'<x/>'},
    {name:'word/embeddings/oleObject1.bin',content:'x'}]){
    assert.throws(()=>preprocessDocx(fixture([e])),/forbidden|unsupported/);
  }
  assert.throws(()=>preprocessDocx(fixture([],paragraph('x').replace('x','<w:instrText>cmd</w:instrText>'))),/unsupported/);
});
test('DOCX rejects DTD, invalid XML, malformed ZIP, duplicate/unsafe paths and ZIP bombs',()=>{
  assert.throws(()=>preprocessDocx(Buffer.from('not a DOCX')),/DOCX|ZIP/);
  assert.throws(()=>preprocessDocx(fixture([],'<!DOCTYPE w:p [<!ENTITY x SYSTEM "file:///etc/passwd">]>'+paragraph('text'))),/unsafe XML/);
  assert.throws(()=>preprocessDocx(fixture([{name:'../secret',content:'x'}])),/unsafe ZIP path/);
  assert.throws(()=>preprocessDocx(fixture([{name:'WORD/document.XML',content:'x'}])),/duplicate ZIP entry/);
  assert.throws(()=>preprocessDocx(fixture([{name:'part.bin',content:'A'.repeat(8*1024*1024+1)}])),/exceeds 8 MiB/);
});
test('DOCX rejects encrypted flags, symlinks and invalid content types',()=>{
  assert.throws(()=>preprocessDocx(fixture([{name:'other',content:'x',flag:0x801}])),/unsupported ZIP entry/);
  assert.throws(()=>preprocessDocx(fixture([{name:'shortcut',content:'target',externalAttr:0xa0000000}])),/ZIP symlink/);
  const macro=zip([{name:'[Content_Types].xml',content:'<Types ContentType="application/vnd.ms-word.document.macroEnabled.12"/>'},entries[1]]);
  assert.throws(()=>preprocessDocx(macro),/macro or active/);
});
test('DOCX validator rejects forged reviews, SHA and approvals',()=>{
  const original=fixture(),p=preprocessDocx(original);
  const r=structuredClone(p);r.segments[1].status='READY_FOR_HUMAN_REVIEW';assert.throws(()=>validateDocxPackage(r),/review mismatch/);
  const a=structuredClone(p);a.approval='APPROVED';assert.throws(()=>validateDocxPackage(a),/package/);
  assert.throws(()=>validateDocxPackage(p,fixture([],paragraph('different'))),/SHA mismatch/);
  const d=structuredClone(p);d.segments[0].text='forged';assert.throws(()=>validateDocxPackage(d,original),/provenance mismatch/);
});
test('DOCX CLI writes new output and preserves input; rejects overwrite and invalid source',()=>{
  const dir=mkdtempSync(join(tmpdir(),'smax-docx-'));
  try{
    const input=join(dir,'demo.docx'),output=join(dir,'out.json'),original=fixture();writeFileSync(input,original);
    const r=runDocxCli(['--input',input,'--output',output]);
    assert.equal(r.status,'LOCAL_FILE_CREATED');
    const p=JSON.parse(readFileSync(output,'utf8'));
    assert.equal(p.source.sha256,r.source_sha256);assert.equal(validateDocxPackage(p,original),true);
    assert.deepEqual(readFileSync(input),original);
    assert.throws(()=>runDocxCli(['--input',input,'--output',output]),/EEXIST/);
    rmSync(output);writeFileSync(input,Buffer.from('broken'));
    assert.throws(()=>runDocxCli(['--input',input,'--output',output]),/DOCX|ZIP/);
    assert.equal(existsSync(output),false);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('DOCX CLI rejects oversized files and symlinks before output',t=>{
  const dir=mkdtempSync(join(tmpdir(),'smax-docx-'));
  try{
    const input=join(dir,'source.docx'),output=join(dir,'out.json'),link=join(dir,'link.docx');
    writeFileSync(input,Buffer.alloc(2*1024*1024+1));
    assert.throws(()=>runDocxCli(['--input',input,'--output',output]),/2 MiB/);
    writeFileSync(input,fixture());
    try{symlinkSync(input,link);}catch(e){if(['EPERM','EACCES','ENOSYS'].includes(e.code)){t.diagnostic('symlink unavailable');return;}throw e;}
    assert.throws(()=>runDocxCli(['--input',link,'--output',output]),/non-symlink/);
    assert.equal(existsSync(output),false);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('DOCX strict JSON Schema matches the generated output and denies unknown fields',()=>{
  const schema=JSON.parse(readFileSync(new URL('../preprocessing/SMAX_PREPROCESS_DOCX_V0.schema.json',import.meta.url)));
  const p=preprocessDocx(fixture());
  assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.properties.schema_version.const,p.schema_version);
  assert.equal(schema.properties.approval.const,'NOT_GRANTED');
  for(const node of [schema,schema.$defs.source,schema.$defs.paragraph,schema.$defs.quality])assert.equal(node.additionalProperties,false);
  assert.deepEqual(Object.keys(p).sort(),schema.required.slice().sort());
  assert.deepEqual(Object.keys(p.source).sort(),schema.$defs.source.required.slice().sort());
  assert.deepEqual(Object.keys(p.segments[0]).sort(),schema.$defs.paragraph.required.slice().sort());
});
