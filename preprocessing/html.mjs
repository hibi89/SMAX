// Read-only, deliberately bounded HTML text extraction. Never render or execute HTML.
import {createHash} from 'node:crypto';

export const HTML_VERSION='SMAX_PREPROCESS_HTML_V0';
const MAX_BYTES=2*1024*1024,MAX_SEGMENTS=10000;
const fail=reason=>{throw new TypeError('HTML_PREPROCESS: '+reason);};
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const fields=(x,names)=>isObject(x)&&Object.keys(x).sort().join('|')===names.slice().sort().join('|');
const allowed=new Set(['html','body','main','article','section','div','p','h1','h2','h3','h4','h5','h6','ul','ol','li','span','a','strong','em','b','i','table','thead','tbody','tr','td','th','blockquote','pre','code','br','hr']);
const blocks=new Set(['main','article','section','div','p','h1','h2','h3','h4','h5','h6','ul','ol','li','table','thead','tbody','tr','td','th','blockquote','pre','br','hr']);
const voids=new Set(['br','hr']);
const risk=/^[\s\u0000-\u001F\u007F-\u009F\p{Default_Ignorable_Code_Point}]*[=+@-]/u;
const signed=/^-?\d+(?:\.\d+)?$/;
function decode(s){
  let bad=false;
  const result=s.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[a-zA-Z]+);/g,(_,entity)=>{
    const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0'};
    if(Object.hasOwn(named,entity))return named[entity];
    if(!entity.startsWith('#')){bad=true;return '';}
    const n=entity[1]==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
    if(!n||n>0x10FFFF||(n>=0xD800&&n<=0xDFFF)||n===0xFFFE||n===0xFFFF||(n<32&&![9,10,13].includes(n))){bad=true;return '';}
    return String.fromCodePoint(n);
  });
  if(bad||/&(?:#|[A-Za-z])/.test(s.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[a-zA-Z]+);/g,'')))fail('unsupported or malformed HTML entity');
  return result;
}
function parseHtml(raw){
  const segments=[],stack=[],newlines=[];
  for(let n=raw.indexOf('\n');n>=0;n=raw.indexOf('\n',n+1))newlines.push(n);
  const lineAt=start=>{let lo=0,hi=newlines.length;while(lo<hi){const mid=(lo+hi)>>1;if(newlines[mid]<start)lo=mid+1;else hi=mid;}return lo+1;};
  let pending='',position=0,offset=0;
  function pushChunk(chunk,start){
    if(!chunk.trim()){
      if(pending)pending+=' ';
      return;
    }
    if(!pending){offset=start;position=lineAt(start);}
    pending+=chunk;
  }
  function flush(){
    const value=pending.trim();pending='';
    if(!value)return;
    if(segments.length>=MAX_SEGMENTS)fail('too many visible text segments');
    const flagged=value.split(/\n/).some(line=>risk.test(line.trimStart())&&!signed.test(line.trim()));
    segments.push({source_line:position,source_offset:offset,text:value,
      status:flagged?'NEEDS_REVIEW':'READY_FOR_HUMAN_REVIEW',reason:flagged?'FORMULA_LIKE_TEXT':null});
  }
  for(let i=raw.charCodeAt(0)===0xFEFF?1:0;i<raw.length;){
    if(raw[i]!=='<'){
      let end=raw.indexOf('<',i);if(end<0)end=raw.length;
      const content=decode(raw.slice(i,end));pushChunk(content,i);i=end;continue;
    }
    if(raw.startsWith('<!--',i)){
      const end=raw.indexOf('-->',i+4);if(end<0)fail('unfinished HTML comment');
      i=end+3;continue;
    }
    let j=i+1,quote=null;
    for(;j<raw.length;j++){
      const c=raw[j];if(quote){if(c===quote)quote=null;}
      else if(c==='"'||c==="'")quote=c;
      else if(c==='>')break;
    }
    if(j===raw.length||quote)fail('unterminated HTML tag');
    const markup=raw.slice(i,j+1);
    if(/^<!doctype\s+html\s*>$/i.test(markup)){if(stack.length)fail('misplaced doctype');i=j+1;continue;}
    if(/^<!|^<\?/.test(markup))fail('unsupported HTML declaration');
    const closing=markup.startsWith('</');
    const match=/^<\/?([A-Za-z][A-Za-z0-9-]*)\b/.exec(markup);
    if(!match)fail('invalid HTML markup');
    const tag=match[1].toLowerCase();
    if(!allowed.has(tag))fail('unsupported HTML tag: '+tag);
    const tail=markup.slice(closing?match[0].length:match[0].length,-1).trim();
    const selfClose=!closing&&tail.endsWith('/');
    if(closing){
      if(tail||stack.at(-1)!==tag)fail('unbalanced HTML tag');
      if(blocks.has(tag))flush();
      stack.pop();
    }else{
      // Attributes are never dereferenced or emitted; event-handler attributes are forbidden.
      const attributes=selfClose?tail.slice(0,-1).trim():tail;
      if(/(?:^|\s)on[a-z][\w-]*\s*=/i.test(attributes))fail('event-handler attribute forbidden');
      if(blocks.has(tag))flush();
      if(voids.has(tag)){if(attributes)fail('void tag attributes unsupported');}
      else if(selfClose)fail('self-closing non-void tag unsupported');
      else stack.push(tag);
    }
    i=j+1;
  }
  if(stack.length)fail('unclosed HTML tags');
  flush();
  if(!segments.length)fail('document contains no supported visible text');
  return segments;
}
export function preprocessHtml(bytes){
  if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>MAX_BYTES)fail('expected 1 to 2 MiB UTF-8 bytes');
  const raw_html=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
  const segments=parseHtml(raw_html);
  return {schema_version:HTML_VERSION,source:{format:'UTF8_HTML',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,raw_html},segments,
    quality:{segments:segments.length,review_segments:segments.filter(s=>s.status==='NEEDS_REVIEW').length},
    processing_mode:'DETERMINISTIC_LOCAL',approval:'NOT_GRANTED'};
}
export function validateHtmlPackage(pkg,bytes=null){
  if(!fields(pkg,['schema_version','source','segments','quality','processing_mode','approval'])||pkg.schema_version!==HTML_VERSION||pkg.processing_mode!=='DETERMINISTIC_LOCAL'||pkg.approval!=='NOT_GRANTED')fail('invalid package state');
  const src=pkg.source;
  if(!fields(src,['format','sha256','bytes','raw_html'])||src.format!=='UTF8_HTML'||typeof src.raw_html!=='string'||typeof src.sha256!=='string'||!/^[a-f0-9]{64}$/.test(src.sha256)||!Number.isSafeInteger(src.bytes)||src.bytes<1||src.bytes>MAX_BYTES)fail('invalid source metadata');
  if(!Array.isArray(pkg.segments)||!fields(pkg.quality,['segments','review_segments']))fail('invalid segments');
  const expected=parseHtml(src.raw_html);
  if(JSON.stringify(expected)!==JSON.stringify(pkg.segments)||pkg.quality.segments!==expected.length||pkg.quality.review_segments!==expected.filter(s=>s.reason!==null).length)fail('segment provenance or review mismatched');
  if(bytes!==null){
    if(!(bytes instanceof Uint8Array)||bytes.length!==src.bytes||createHash('sha256').update(bytes).digest('hex')!==src.sha256||new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes)!==src.raw_html)fail('source byte hash mismatched');
  }
  return true;
}
export function serializeHtmlPackage(pkg,bytes=null){validateHtmlPackage(pkg,bytes);return JSON.stringify(pkg,null,2)+'\n';}
