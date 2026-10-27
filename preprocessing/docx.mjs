// Strict local DOCX basic paragraph/table extractor. No active content or auto approval.
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';

export const DOCX_VERSION='SMAX_PREPROCESS_DOCX_V0';
const MAX_INPUT=2*1024*1024, MAX_INFLATED=8*1024*1024, MAX_ENTRIES=512;
const MAX_NODES=300000, MAX_PARAGRAPHS=10000;
const fatal=new TextDecoder('utf-8',{fatal:true});
const reject=s=>{throw new TypeError('DOCX_PREPROCESS: '+s);};
const sameKeys=(obj,keys)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&Object.getPrototypeOf(obj)===Object.prototype&&
  Object.keys(obj).sort().join('|')===keys.slice().sort().join('|');
const formula=/^[\s\u0000-\u001F\u007F-\u009F\p{Default_Ignorable_Code_Point}]*[=+@-]/u;
const number=/^-?\d+(?:\.\d+)?$/;
function crc32(data){
  let crc=-1;
  for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^-1)>>>0;
}
function decodeXml(s){
  if(/&(?!(?:amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);)/.test(s))reject('invalid XML entity');
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z]+);/g,(_,e)=>{
    const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
    if(Object.hasOwn(named,e))return named[e];
    if(e[0]!=='#')reject('unsupported entity');
    const n=e[1]==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10);
    if(!n||n>0x10ffff||n>=0xd800&&n<=0xdfff||n===0xfffe||n===0xffff||n<32&&![9,10,13].includes(n))reject('invalid XML codepoint');
    return String.fromCodePoint(n);
  });
}
function inspectZip(input){
  if(!(input instanceof Uint8Array)||input.byteLength<22||input.byteLength>MAX_INPUT)reject('DOCX must be 22 bytes to 2 MiB');
  const b=Buffer.from(input.buffer,input.byteOffset,input.byteLength);
  let eocd=-1;
  for(let i=b.length-22;i>=Math.max(0,b.length-22-65535);i--){
    if(b.readUInt32LE(i)===0x06054b50&&i+22+b.readUInt16LE(i+20)===b.length){eocd=i;break;}
  }
  if(eocd<0)reject('ZIP directory missing');
  const entries=b.readUInt16LE(eocd+10),centralSize=b.readUInt32LE(eocd+12),centralOff=b.readUInt32LE(eocd+16);
  if(b.readUInt16LE(eocd+4)||b.readUInt16LE(eocd+6)||b.readUInt16LE(eocd+8)!==entries||
     !entries||entries>MAX_ENTRIES||entries===65535||centralSize===0xffffffff||centralOff===0xffffffff||centralOff+centralSize!==eocd)
    reject('unsupported ZIP header, disk, ZIP64 or entry count');
  let pos=centralOff,total=0;const names=new Set(),spans=[],parts=new Map();
  for(let i=0;i<entries;i++){
    if(pos+46>eocd||b.readUInt32LE(pos)!==0x02014b50)reject('invalid ZIP central header');
    const flags=b.readUInt16LE(pos+8),method=b.readUInt16LE(pos+10),crc=b.readUInt32LE(pos+16);
    const zipped=b.readUInt32LE(pos+20),plain=b.readUInt32LE(pos+24),nl=b.readUInt16LE(pos+28);
    const ex=b.readUInt16LE(pos+30),co=b.readUInt16LE(pos+32),disk=b.readUInt16LE(pos+34);
    const external=b.readUInt32LE(pos+38),offset=b.readUInt32LE(pos+42);
    const next=pos+46+nl+ex+co;
    if(next>eocd||!nl||disk||[zipped,plain,offset].includes(0xffffffff)||flags&~0x0806||![0,8].includes(method))reject('unsupported ZIP entry');
    const name=fatal.decode(b.subarray(pos+46,pos+46+nl));
    if(name.length>256||name.startsWith('/')||name.includes('\\')||/^[A-Za-z]:/.test(name)||/[\u0000-\u001f\u007f]/.test(name)||
      name.split('/').some(x=>x==='..'||x==='.')||name.split('/').slice(0,-1).some(x=>!x)||!name)reject('unsafe ZIP path');
    const key=name.toLocaleLowerCase('en-US');if(names.has(key))reject('duplicate ZIP entry');names.add(key);
    if(((external>>>16)&0xf000)===0xa000)reject('ZIP symlink forbidden');
    if(/(?:^|\/)(?:vbaProject\.bin|activeX|embeddings|media|externalLinks|oleObject)(?:\/|$)/i.test(name)||
       /^word\/(?:header\d*|footer\d*|footnotes|endnotes|comments|people|glossary|charts|diagrams|drawings)/i.test(name))reject('unsupported DOCX rich or active part');
    total+=plain;if(total>MAX_INFLATED)reject('inflated ZIP exceeds 8 MiB');
    if(offset+30>centralOff||b.readUInt32LE(offset)!==0x04034b50)reject('invalid ZIP local header');
    const localName=b.readUInt16LE(offset+26),localExtra=b.readUInt16LE(offset+28);
    const start=offset+30+localName+localExtra;
    if(start+zipped>centralOff||b.readUInt16LE(offset+6)!==flags||b.readUInt16LE(offset+8)!==method||
       b.readUInt32LE(offset+14)!==crc||b.readUInt32LE(offset+18)!==zipped||b.readUInt32LE(offset+22)!==plain||
       fatal.decode(b.subarray(offset+30,offset+30+localName))!==name)reject('ZIP local header differs');
    let bytes;
    try{bytes=method===0?b.subarray(start,start+zipped):inflateRawSync(b.subarray(start,start+zipped),{maxOutputLength:plain+1});}
    catch{reject('ZIP entry decompression failed');}
    if(bytes.length!==plain||crc32(bytes)!==crc)reject('ZIP entry checksum differs');
    if(/\.(?:xml|rels)$/i.test(name)||name==='[Content_Types].xml'){
      const xml=fatal.decode(bytes);
      if(/macroEnabled|vbaProject|ActiveX|oleObject/i.test(xml))reject('macro or active content type forbidden');
      if(/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/u.test(xml))reject('unsafe XML character or declaration');
      // Reject external relationships, including escaped TargetMode spelling.
      if(/\.rels$/i.test(name)){
        const tokens=xml.match(/\bTargetMode\s*=/gi)||[];
        const modes=[...xml.matchAll(/\bTargetMode\s*=\s*(["'])(.*?)\1/gi)];
        if(tokens.length!==modes.length)reject('malformed relationship TargetMode');
        for(const m of modes)if(decodeXml(m[2])!=='Internal')reject('external relationship forbidden');
      }
    }
    spans.push([offset,start+zipped]);parts.set(name,bytes);pos=next;
  }
  if(pos!==eocd)reject('ZIP central directory trailing data');
  spans.sort((a,b)=>a[0]-b[0]);
  if(spans[0][0]!==0||spans.some((x,i)=>i>0&&x[0]<spans[i-1][1]))reject('ZIP overlapped or prefixed entries');
  if(!parts.has('[Content_Types].xml')||!parts.has('word/document.xml'))reject('required DOCX parts missing');
  return parts;
}
function paragraphsFromXml(bytes){
  const xml=fatal.decode(bytes);
  if(xml.length>MAX_INFLATED)reject('document XML exceeds limit');
  const output=[],stack=[];let i=0,nodes=0,paragraph=null,rootFound=false,bodyFound=false,paragraphOrdinal=0;
  const supportedText=new Set(['t','tab','br','cr']);
  while(i<xml.length){
    if(xml[i]!=='<'){
      let end=xml.indexOf('<',i);if(end===-1)end=xml.length;
      const s=decodeXml(xml.slice(i,end));
      if(stack.at(-1)?.local==='t'&&paragraph)paragraph.text+=s;
      else if(s.trim())reject('visible text outside w:t');
      i=end;continue;
    }
    if(xml.startsWith('<!--',i)){
      const end=xml.indexOf('-->',i+4);if(end<0)reject('unclosed XML comment');i=end+3;continue;
    }
    if(xml.startsWith('<?xml',i)&&!stack.length){const end=xml.indexOf('?>',i+5);if(end<0)reject('bad XML declaration');i=end+2;continue;}
    if(xml.startsWith('<!',i)||xml.startsWith('<?',i))reject('XML directives forbidden');
    let end=i+1,quote=null;
    for(;end<xml.length;end++){
      const c=xml[end];if(quote){if(c===quote)quote=null;}
      else if(c==='"'||c==="'")quote=c;
      else if(c==='>')break;
    }
    if(end>=xml.length||quote)reject('unterminated XML tag');
    const inner=xml.slice(i+1,end),closing=inner.startsWith('/'),selfClose=!closing&&/\/\s*$/.test(inner);
    const match=/^\/?([A-Za-z_][\w:.-]*)/.exec(inner);if(!match)reject('invalid XML name');
    const name=match[1],local=name.slice(name.lastIndexOf(':')+1),prefix=name.slice(0,name.lastIndexOf(':'));
    if(prefix!=='w'&&prefix!=='')reject('unsupported XML namespace in body');
    if(/^(?:instrText|delText|drawing|pict|object|fldSimple|altChunk|hyperlink|sdt|bookmarkStart|commentReference|footnoteReference|endnoteReference|sym|noBreakHyphen|softHyphen|del|ins|moveFrom|moveTo|delInstrText|subDoc|oMath|oMathPara)$/.test(local))reject('unsupported DOCX visible/active content');
    if(closing){
      if(!/^\/[A-Za-z_][\w:.-]*\s*$/.test(inner)||stack.at(-1)?.name!==name)reject('unbalanced XML tag');
      if(local==='p'){
        if(!paragraph)reject('DOCX paragraph mismatch');
        if(paragraph.text.trim()){
          if(output.length>=MAX_PARAGRAPHS)reject('paragraph limit exceeded');
          const flagged=paragraph.text.split('\n').some(s=>formula.test(s.trimStart())&&!number.test(s.trim()));
          output.push({source_path:'word/document.xml',paragraph_index:paragraphOrdinal,text:paragraph.text,
            status:flagged?'NEEDS_REVIEW':'READY_FOR_HUMAN_REVIEW',reason:flagged?'FORMULA_LIKE_TEXT':null});
        }
        paragraph=null;
      }
      stack.pop();
    }else{
      if(++nodes>MAX_NODES||stack.length>=64)reject('DOCX XML nodes/depth exceeded');
      if(!rootFound){if(name!=='w:document')reject('DOCX document root missing');rootFound=true;}
      if(name==='w:body')bodyFound=true;
      if(local==='p'){
        if(!bodyFound)reject('paragraph outside DOCX body');
        if(paragraph)reject('nested DOCX paragraph');
        if(++paragraphOrdinal>MAX_PARAGRAPHS)reject('too many source paragraphs');paragraph={text:''};
      }else if(supportedText.has(local)&&paragraph){
        if(local==='tab')paragraph.text+='\t';
        if(local==='br'||local==='cr')paragraph.text+='\n';
      }
      if(selfClose&&local==='p')paragraph=null;
      if(!selfClose)stack.push({name,local});
    }
    i=end+1;
  }
  if(stack.length||!rootFound||!bodyFound||!output.length)reject('incomplete or empty DOCX document');
  return output;
}
export function preprocessDocx(input){
  const parts=inspectZip(input),segments=paragraphsFromXml(parts.get('word/document.xml'));
  const src={format:'DOCX_ZIP',sha256:createHash('sha256').update(input).digest('hex'),bytes:input.byteLength,part:'word/document.xml'};
  return {schema_version:DOCX_VERSION,source:src,segments,
    quality:{paragraphs:segments.length,review_paragraphs:segments.filter(s=>s.reason!==null).length},
    processing_mode:'DETERMINISTIC_LOCAL',approval:'NOT_GRANTED'};
}
export function validateDocxPackage(pkg,original=null){
  if(!sameKeys(pkg,['schema_version','source','segments','quality','processing_mode','approval'])||
     pkg.schema_version!==DOCX_VERSION||pkg.processing_mode!=='DETERMINISTIC_LOCAL'||pkg.approval!=='NOT_GRANTED')reject('invalid DOCX package');
  const src=pkg.source;
  if(!sameKeys(src,['format','sha256','bytes','part'])||src.format!=='DOCX_ZIP'||src.part!=='word/document.xml'||
     typeof src.sha256!=='string'||!/^[a-f0-9]{64}$/.test(src.sha256)||!Number.isSafeInteger(src.bytes)||src.bytes<22||src.bytes>MAX_INPUT)
    reject('invalid provenance');
  if(!Array.isArray(pkg.segments)||pkg.segments.length<1||pkg.segments.length>MAX_PARAGRAPHS||!sameKeys(pkg.quality,['paragraphs','review_paragraphs']))reject('invalid DOCX records');
  let reviews=0;
  for(let i=0;i<pkg.segments.length;i++){
    const s=pkg.segments[i];
    if(!sameKeys(s,['source_path','paragraph_index','text','status','reason'])||s.source_path!==src.part||!Number.isSafeInteger(s.paragraph_index)||s.paragraph_index<1||s.paragraph_index>MAX_PARAGRAPHS||(i>0&&s.paragraph_index<=pkg.segments[i-1].paragraph_index)||typeof s.text!=='string'||!s.text.trim())reject('invalid paragraph');
    const suspicious=s.text.split('\n').some(line=>formula.test(line.trimStart())&&!number.test(line.trim()));
    if(s.status!==(suspicious?'NEEDS_REVIEW':'READY_FOR_HUMAN_REVIEW')||s.reason!==(suspicious?'FORMULA_LIKE_TEXT':null))reject('review mismatch');
    if(suspicious)reviews++;
  }
  if(pkg.quality.paragraphs!==pkg.segments.length||pkg.quality.review_paragraphs!==reviews)reject('quality mismatch');
  if(original!==null){
    if(!(original instanceof Uint8Array)||original.byteLength!==src.bytes||createHash('sha256').update(original).digest('hex')!==src.sha256)reject('source SHA mismatch');
    if(JSON.stringify(preprocessDocx(original))!==JSON.stringify(pkg))reject('extraction provenance mismatch');
  }
  return true;
}
export function serializeDocxPackage(pkg,original=null){validateDocxPackage(pkg,original);return JSON.stringify(pkg,null,2)+'\n';}
