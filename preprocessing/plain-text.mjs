// Strict local plain UTF-8 document preprocessing V0. No LLM, I/O or auto-approval.
import {createHash} from 'node:crypto';

export const TEXT_PACKAGE_VERSION='SMAX_PREPROCESS_TEXT_V0';
const MAX_BYTES=2*1024*1024,MAX_SEGMENTS=10000;
const reject=msg=>{throw new TypeError('TEXT_PREPROCESS: '+msg);};
const exact=(o,names)=>o&&typeof o==='object'&&!Array.isArray(o)&&
  Object.keys(o).sort().join('|')===[...names].sort().join('|');
const suspicious=/^[\s\u0000-\u001F\u007F-\u009F\p{Default_Ignorable_Code_Point}]*[=+@-]/u;
const signedNumber=/^-?\d+(?:\.\d+)?$/;
function risk(paragraph){
  return paragraph.split('\n').some(line=>{
    const trimmed=line.replace(/^[\s\u0000-\u001F\u007F-\u009F\p{Default_Ignorable_Code_Point}]*/u,'');
    return suspicious.test(line)&&!signedNumber.test(trimmed);
  });
}
function segmentsFromText(text){
  const lines=text.split(/\r\n|\r|\n/),separators=[...text.matchAll(/\r\n|\r|\n/g)].map(m=>m[0]);
  const result=[];let start=0,active=[],firstLine=1,firstOffset=0,offset=0;
  function flush(){
    if(!active.length)return;
    if(result.length>=MAX_SEGMENTS)reject('too many text segments');
    const content=active.join('\n');
    const formula=risk(content);
    result.push({source_line:firstLine,source_offset:firstOffset,text:content,
      status:formula?'NEEDS_REVIEW':'READY_FOR_HUMAN_REVIEW',
      reason:formula?'FORMULA_LIKE_TEXT':null});
    active=[];
  }
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(line.trim()){
      if(!active.length){firstLine=i+1;firstOffset=offset;}
      active.push(line);
    }else flush();
    offset+=line.length+(separators[i]?.length??0);
  }
  flush();return result;
}
/** Preserve complete raw text and exact source bytes, with paragraph/line provenance. */
export function preprocessPlainText(bytes){
  if(!(bytes instanceof Uint8Array)||!bytes.byteLength||bytes.byteLength>MAX_BYTES)
    reject('expected UTF-8 bytes from 1 to 2 MiB');
  const raw_text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
  if(!raw_text.replace(/^\uFEFF/,'').trim())reject('empty text');
  // Keep the BOM in the raw source; offsets are against raw_text, not stripped text.
  const segments=segmentsFromText(raw_text);
  const review_segments=segments.filter(s=>s.status==='NEEDS_REVIEW').length;
  return {schema_version:TEXT_PACKAGE_VERSION,
    source:{format:'UTF8_TEXT',sha256:createHash('sha256').update(bytes).digest('hex'),
      bytes:bytes.byteLength,raw_text},segments,
    quality:{segments:segments.length,review_segments},
    processing_mode:'DETERMINISTIC_LOCAL',approval:'NOT_GRANTED'};
}
export function validatePlainTextPackage(pkg,originalBytes=null){
  if(!exact(pkg,['schema_version','source','segments','quality','processing_mode','approval'])||
    pkg.schema_version!==TEXT_PACKAGE_VERSION||pkg.processing_mode!=='DETERMINISTIC_LOCAL'||
    pkg.approval!=='NOT_GRANTED')reject('invalid document contract or approval');
  const src=pkg.source;
  if(!exact(src,['format','sha256','bytes','raw_text'])||src.format!=='UTF8_TEXT'||
    typeof src.sha256!=='string'||!/^[a-f0-9]{64}$/.test(src.sha256)||
    !Number.isSafeInteger(src.bytes)||src.bytes<1||src.bytes>MAX_BYTES||
    typeof src.raw_text!=='string')reject('invalid source provenance');
  if(!Array.isArray(pkg.segments)||!pkg.segments.length||pkg.segments.length>MAX_SEGMENTS||
    !exact(pkg.quality,['segments','review_segments']))reject('invalid segment collections');
  const expected=segmentsFromText(src.raw_text);
  if(JSON.stringify(expected)!==JSON.stringify(pkg.segments)||
    pkg.quality.segments!==expected.length||
    pkg.quality.review_segments!==expected.filter(s=>s.status==='NEEDS_REVIEW').length)
    reject('segments or review counters disagree with raw text');
  if(originalBytes!==null){
    if(!(originalBytes instanceof Uint8Array)||
      originalBytes.length!==src.bytes||
      createHash('sha256').update(originalBytes).digest('hex')!==src.sha256||
      new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(originalBytes)!==src.raw_text)
      reject('source bytes differ from package');
  }
  return true;
}
export function serializePlainTextPackage(pkg,bytes=null){
  validatePlainTextPackage(pkg,bytes);
  return JSON.stringify(pkg,null,2)+'\n';
}
