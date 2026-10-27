// Strict V0 XLSX cell package validator. Local/offline; source parity is optional.
import {createHash} from 'node:crypto';
import {extractXlsxCells, XLSX_CELLS_VERSION} from './xlsx-cells.mjs';

const reject = msg => { throw new TypeError('XLSX_PACKAGE: '+msg); };
const object = x => x!==null && typeof x==='object' && !Array.isArray(x) && (Object.getPrototypeOf(x)===Object.prototype || Object.getPrototypeOf(x)===null);
const keys = (x,names) => object(x) && Object.keys(x).length===names.length && names.every(n=>Object.hasOwn(x,n));
const integer = (v,min,max) => Number.isSafeInteger(v) && v>=min && v<=max;
const sheetPattern = /^xl\/worksheets\/sheet([1-9]\d*)\.xml$/;
const cellPattern = /^([A-Z]{1,3})([1-9]\d*)$/;
const formulaText = /^[\s\u200B\u200E\u200F]*[=+@]/;
const cellFields = ['ref','kind','value','formula','status','reason'];
function reference(ref,row){
  const m=cellPattern.exec(ref);
  if(!m || Number(m[2])!==row)reject('cell coordinate mismatch');
  let column=0;
  for(const c of m[1])column=column*26+c.charCodeAt(0)-64;
  if(column<1||column>16384)reject('cell column out of bounds');
}
/** Returns true on valid strict structure; pass original Uint8Array to also prove exact source parity. */
export function validateXlsxCellsPackage(pkg, originalBytes=null){
  if(!keys(pkg,['schema_version','source','sheets','quality','processing_mode','approval']) ||
      pkg.schema_version!==XLSX_CELLS_VERSION || pkg.processing_mode!=='DETERMINISTIC_LOCAL' || pkg.approval!=='NOT_GRANTED')reject('invalid package contract or approval');
  const src=pkg.source;
  if(!keys(src,['format','sha256','bytes','worksheet_paths']) || src.format!=='XLSX_ZIP' ||
      typeof src.sha256!=='string'||!/^[a-f0-9]{64}$/.test(src.sha256) || !integer(src.bytes,22,2*1024*1024) ||
      !Array.isArray(src.worksheet_paths) || !integer(src.worksheet_paths.length,1,64))reject('invalid source provenance');
  const paths=src.worksheet_paths;
  const numbered=[];
  for(const p of paths){
    if(typeof p!=='string')reject('invalid worksheet path');
    const m=sheetPattern.exec(p);if(!m)reject('invalid worksheet path');
    const n=Number(m[1]);if(!Number.isSafeInteger(n))reject('invalid worksheet number');
    numbered.push(n);
  }
  if(numbered.some((n,i)=>i>0&&n<=numbered[i-1]))reject('unordered or repeated worksheet paths');
  if(!Array.isArray(pkg.sheets)||pkg.sheets.length!==paths.length)reject('worksheet count mismatch');
  let rowCount=0,cellCount=0,reviewCount=0;
  for(let i=0;i<pkg.sheets.length;i++){
    const sheet=pkg.sheets[i];
    if(!keys(sheet,['source_path','rows'])||sheet.source_path!==paths[i]||!Array.isArray(sheet.rows))reject('worksheet provenance mismatch');
    const rowIds=new Set();
    for(const row of sheet.rows){
      if(!keys(row,['source_row','cells'])||!integer(row.source_row,1,1048576)||!Array.isArray(row.cells)||rowIds.has(row.source_row))reject('invalid source row');
      rowIds.add(row.source_row);
      if(++rowCount>10000)reject('too many rows');
      const references=new Set();
      for(const cell of row.cells){
        if(!keys(cell,cellFields)||typeof cell.ref!=='string'||references.has(cell.ref))reject('invalid or duplicate cell');
        reference(cell.ref,row.source_row);references.add(cell.ref);
        if(++cellCount>100000)reject('too many cells');
        if(cell.formula!==null&&typeof cell.formula!=='string')reject('invalid formula');
        const kinds=['blank','text','number_text','boolean','error'];
        if(!kinds.includes(cell.kind))reject('invalid cell kind');
        if(cell.kind==='blank'&&cell.value!==null || (cell.kind==='text'||cell.kind==='number_text')&&typeof cell.value!=='string' ||
           cell.kind==='boolean'&&typeof cell.value!=='boolean' || cell.kind==='error'&&cell.value!==null&&typeof cell.value!=='string')reject('invalid scalar type');
        let reason=null;
        if(cell.formula!==null){
          if(cell.kind!=='blank'||cell.value!==null)reject('formula result trusted');
          reason='FORMULA_UNEVALUATED';
        }else if(cell.kind==='error')reason='ERROR_CELL';
        else if(cell.kind==='text'&&formulaText.test(cell.value))reason='FORMULA_LIKE_TEXT';
        if(cell.reason!==reason||cell.status!==(reason?'NEEDS_REVIEW':'READY_FOR_HUMAN_REVIEW'))reject('review state mismatch');
        if(reason)reviewCount++;
      }
    }
  }
  const q=pkg.quality;
  if(!keys(q,['sheets','rows','cells','review_cells']) || q.sheets!==paths.length || q.rows!==rowCount ||
      q.cells!==cellCount || q.review_cells!==reviewCount)reject('quality totals mismatch');
  if(originalBytes!==null){
    if(!(originalBytes instanceof Uint8Array))reject('source bytes must be Uint8Array');
    if(originalBytes.byteLength!==src.bytes || createHash('sha256').update(originalBytes).digest('hex')!==src.sha256)reject('source hash mismatch');
    const exact=extractXlsxCells(originalBytes);
    if(JSON.stringify(exact)!==JSON.stringify(pkg))reject('package differs from source extraction');
  }
  return true;
}
export function serializeXlsxCellsPackage(pkg,originalBytes=null){
  validateXlsxCellsPackage(pkg,originalBytes);
  return JSON.stringify(pkg,null,2)+'\n';
}
