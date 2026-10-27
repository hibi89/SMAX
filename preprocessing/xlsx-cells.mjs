// Strict, local XLSX worksheet cells V0. Preserves raw scalars; never evaluates formulas.
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {preflightXlsx} from './xlsx-preflight.mjs';

export const XLSX_CELLS_VERSION='SMAX_PREPROCESS_XLSX_CELLS_V0';
const maxRows=10000, maxCells=100000, maxXmlNodes=300000;
const numberLiteral=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?$/;
// Mirror CSV export safety: hidden Unicode prefixes must not bypass human review.
const formulaLikeText=/^[\s\u0000-\u001F\u007F-\u009F\p{Default_Ignorable_Code_Point}]*[=+@-]/u;
const plainSignedNumber=/^-?\d+(?:\.\d+)?$/;
const decoder=new TextDecoder('utf-8',{fatal:true});
const fail=(s)=>{throw new TypeError('XLSX_CELLS: '+s)};
const localName=n=>n.substring(n.lastIndexOf(':')+1);
function unescapeXml(s){
  return s.replace(/&(?!(?:amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);)/g,()=>fail('invalid XML entity')).replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g,(_,e)=>{
    const literals={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
    if(Object.hasOwn(literals,e))return literals[e];
    if(!e.startsWith('#'))fail('unsupported XML named entity');
    const n=e[1]==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10);
    if(!n||n>0x10ffff||(n>=0xd800&&n<=0xdfff)||(n<32&&![9,10,13].includes(n)))fail('invalid XML codepoint');
    return String.fromCodePoint(n);
  });
}
function parseXml(bytes){
  const xml=decoder.decode(bytes);
  if(xml.length>8*1024*1024)fail('XML too large');
  let i=0,depth=0,count=0,root=null,stack=[];
  while(i<xml.length){
    if(xml[i]!=='<'){
      let n=xml.indexOf('<',i);if(n<0)n=xml.length;
      const text=xml.slice(i,n);
      if(stack.length)stack.at(-1).text+=unescapeXml(text);
      else if(text.trim())fail('text outside document');
      i=n;continue;
    }
    if(xml.startsWith('<!--',i)){
      const end=xml.indexOf('-->',i+4);if(end<0)fail('unterminated XML comment');
      i=end+3;continue;
    }
    if(xml.startsWith('<?xml',i)&&!root&&!stack.length){
      const end=xml.indexOf('?>',i+5);if(end<0)fail('unterminated XML declaration');
      i=end+2;continue;
    }
    if(xml.startsWith('<!',i)||xml.startsWith('<?',i))fail('unsupported XML declaration');
    let end=i+1,quote=null;
    for(;end<xml.length;end++){
      const c=xml[end];if(quote){if(c===quote)quote=null;}
      else if(c==='"'||c==="'")quote=c;
      else if(c==='>')break;
    }
    if(end===xml.length||quote)fail('unterminated XML tag');
    let inner=xml.slice(i+1,end),closing=inner.startsWith('/');
    if(closing){
      const n=inner.slice(1).trim();
      if(!/^[A-Za-z_][\w:.-]*$/.test(n)||stack.at(-1)?.name!==n)fail('unbalanced XML tag');
      stack.pop();depth--;i=end+1;continue;
    }
    const selfClose=/\/\s*$/.test(inner);
    if(selfClose)inner=inner.replace(/\/\s*$/,'');
    const head=/^([A-Za-z_][\w:.-]*)/.exec(inner);if(!head)fail('invalid XML element');
    const name=head[1],attributes=Object.create(null);let tail=inner.slice(name.length);
    while(tail.trim()){
      const m=/^\s+([A-Za-z_][\w:.-]*)\s*=\s*(["'])(.*?)\2/s.exec(tail);
      if(!m)fail('unsupported XML attribute');
      if(Object.hasOwn(attributes,m[1]))fail('duplicate XML attribute');
      attributes[m[1]]=unescapeXml(m[3]);tail=tail.slice(m[0].length);
    }
    if(++count>maxXmlNodes||++depth>64)fail('XML node or depth limit exceeded');
    const node={name,attributes,children:[],text:''};
    if(stack.length)stack.at(-1).children.push(node);
    else if(root)fail('multiple XML roots');else root=node;
    if(!selfClose)stack.push(node);else depth--;
    i=end+1;
  }
  if(stack.length||!root)fail('incomplete XML document');
  return root;
}
const children=(node,name)=>node.children.filter(n=>localName(n.name)===name);
function descendants(node,name){
  const found=[],stack=[node];while(stack.length){const n=stack.pop();if(localName(n.name)===name)found.push(n);for(let k=n.children.length-1;k>=0;k--)stack.push(n.children[k]);}return found;
}
function strictNumber(s,label){
  if(typeof s!=='string'||!/^(0|[1-9]\d*)$/.test(s))fail('invalid '+label);
  const n=Number(s);if(!Number.isSafeInteger(n))fail('large '+label);return n;
}
function readZipParts(bytes,wanted){
  const buf=Buffer.from(bytes.buffer,bytes.byteOffset,bytes.byteLength),answer=new Map();
  let eocd=-1;for(let i=buf.length-22;i>=Math.max(0,buf.length-22-65535);i--){
    if(buf.readUInt32LE(i)===0x06054b50&&i+22+buf.readUInt16LE(i+20)===buf.length){eocd=i;break;}
  }
  if(eocd<0)fail('ZIP directory missing');
  let cursor=buf.readUInt32LE(eocd+16);
  for(let i=0;i<buf.readUInt16LE(eocd+10);i++){
    const flag=buf.readUInt16LE(cursor+8),method=buf.readUInt16LE(cursor+10);
    const compressed=buf.readUInt32LE(cursor+20),length=buf.readUInt32LE(cursor+24);
    const n=buf.readUInt16LE(cursor+28),extra=buf.readUInt16LE(cursor+30),comment=buf.readUInt16LE(cursor+32);
    const name=decoder.decode(buf.subarray(cursor+46,cursor+46+n));
    if(wanted.has(name)){
      const off=buf.readUInt32LE(cursor+42),start=off+30+buf.readUInt16LE(off+26)+buf.readUInt16LE(off+28);
      const segment=buf.subarray(start,start+compressed);
      const content=method===0?segment:inflateRawSync(segment,{maxOutputLength:length+1});
      if(content.length!==length||flag&1)fail('ZIP entry changed after preflight');
      answer.set(name,content);
    }
    cursor+=46+n+extra+comment;
  }
  if(answer.size!==wanted.size)fail('required XML entry missing');
  return answer;
}
function parseSharedStrings(buffer){
  if(!buffer)return [];
  const root=parseXml(buffer);if(localName(root.name)!=='sst')fail('sharedStrings root missing');
  const items=children(root,'si');if(items.length>maxCells)fail('too many shared strings');
  return items.map(si=>descendants(si,'t').map(n=>n.text).join(''));
}
function parseSheet(bytes,path,shared,quality){
  const root=parseXml(bytes);if(localName(root.name)!=='worksheet')fail('worksheet root missing');
  const data=children(root,'sheetData');if(data.length!==1)fail('sheetData missing or duplicated');
  const rows=[],used=new Set();
  for(const row of children(data[0],'row')){
    const source_row=strictNumber(row.attributes.r,'row number');
    if(source_row<1||source_row>1048576||used.has(source_row))fail('duplicate or out of range row');
    used.add(source_row);if(++quality.rows>maxRows)fail('row count limit exceeded');
    const cells=[],seen=new Set();
    for(const cell of children(row,'c')){
      if(++quality.cells>maxCells)fail('cell count limit exceeded');
      const ref=cell.attributes.r;
      const coordinate=typeof ref==='string'?/^([A-Z]{1,3})([1-9]\d*)$/.exec(ref):null;
      if(!coordinate||Number(coordinate[2])!==source_row||seen.has(ref))
        fail('invalid, mismatched or duplicate cell coordinate');
      let column=0;for(const ch of coordinate[1])column=column*26+ch.charCodeAt(0)-64;
      if(column>16384)fail('column out of bounds');
      seen.add(ref);
      const type=cell.attributes.t??'n',v=children(cell,'v'),inline=children(cell,'is'),f=children(cell,'f');
      if(v.length>1||inline.length>1||f.length>1)fail('duplicate cell payload');
      // Fail closed on ambiguous OOXML cell representations instead of losing source values.
      // Formula cached <v> is supported but never trusted as the computed result.
      if((inline.length&&type!=='inlineStr')||(type==='inlineStr'&&(v.length||f.length)))
        fail('conflicting cell payload');
      const formula=f.length>0;let value=null,kind='blank',review=null;
      if(formula){review='FORMULA_UNEVALUATED';quality.review_cells++;}
      else if(type==='inlineStr'){
        if(inline.length!==1)fail('inline string payload missing');
        value=descendants(inline[0],'t').map(t=>t.text).join('');kind='text';
      }else if(type==='s'){
        if(v.length!==1)fail('shared string index missing');
        const idx=strictNumber(v[0].text.trim(),'shared string index');
        if(idx>=shared.length)fail('shared string index out of bounds');
        value=shared[idx];kind='text';
      }else if(type==='n'||type==='str'){
        if(v.length){
          value=v[0].text;kind=type==='n'?'number_text':'text';
          if(type==='n'&&!numberLiteral.test(value))fail('invalid numeric cell literal');
        }
      }else if(type==='b'){
        if(v.length!==1||!['0','1'].includes(v[0].text.trim()))fail('invalid boolean cell');
        value=v[0].text.trim()==='1';kind='boolean';
      }else if(type==='e'){
        value=v[0]?.text??null;kind='error';review='ERROR_CELL';quality.review_cells++;
      }else fail('unsupported cell type');
      if(!formula&&typeof value==='string'&&kind==='text'&&formulaLikeText.test(value)&&!plainSignedNumber.test(value)){
        review='FORMULA_LIKE_TEXT';quality.review_cells++;
      }
      cells.push({ref,kind,value,formula:formula?f[0].text:null,
        status:review?'NEEDS_REVIEW':'READY_FOR_HUMAN_REVIEW',reason:review});
    }
    rows.push({source_row,cells});
  }
  return {source_path:path,rows};
}
/** Validated ZIP -> bounded raw cell records. No guessed dates/financial meaning. */
export function extractXlsxCells(input){
  const preflight=preflightXlsx(input);
  const paths=preflight.paths.filter(p=>/^xl\/worksheets\/sheet[1-9]\d*\.xml$/i.test(p));
  if(paths.length>64)fail('too many worksheets');
  paths.sort((a,b)=>Number(/sheet(\d+)\.xml$/i.exec(a)[1])-Number(/sheet(\d+)\.xml$/i.exec(b)[1]));
  const sharedPath=preflight.paths.find(p=>p==='xl/sharedStrings.xml');
  const wanted=new Set([...paths,...(sharedPath?[sharedPath]:[])]);
  const entries=readZipParts(input,wanted);
  const shared=parseSharedStrings(sharedPath?entries.get(sharedPath):null);
  const quality={sheets:paths.length,rows:0,cells:0,review_cells:0};
  const sheets=paths.map(path=>parseSheet(entries.get(path),path,shared,quality));
  return {schema_version:XLSX_CELLS_VERSION,
    source:{format:'XLSX_ZIP',sha256:createHash('sha256').update(input).digest('hex'),bytes:input.byteLength,
      worksheet_paths:paths},sheets,quality,processing_mode:'DETERMINISTIC_LOCAL',approval:'NOT_GRANTED'};
}
