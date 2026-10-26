// Generic CSV preprocessing V1: explicit schema, all original cells and record lineage.
import {createHash} from 'node:crypto';
import {parseCsvRecords} from '../site/csv-transform.mjs';

export const GENERIC_CSV_VERSION='SMAX_PREPROCESS_GENERIC_CSV_V1';
const TYPES=new Set(['text','date','decimal','integer','boolean']);
const unsafeHeader=/[\u0000-\u001F\u007F-\u009F\p{Default_Ignorable_Code_Point}]/u;
const SAFE_KEY=/^[a-z][a-z0-9_]{0,63}$/;
const normalizeKey=x=>x.normalize('NFKC').toLocaleLowerCase('ko-KR');
const ISSUE_CODES=new Set(['MISSING_REQUIRED','INVALID_DATE','INVALID_DECIMAL',
  'INVALID_INTEGER','INVALID_BOOLEAN','FORMULA_RISK','DUPLICATE_SOURCE_ROW']);

export function validateGenericColumns(columns,headers){
  if(!Array.isArray(columns)||columns.length<1||columns.length>64)throw new TypeError('Define 1-64 mapped fields');
  const keys=new Set(),sources=new Set();
  return columns.map((entry)=>{
    if(!entry||typeof entry!=='object'||Array.isArray(entry)||
      Object.keys(entry).sort().join('|')!=='key|required|source|type'){
      throw new TypeError('Mapped fields require only key/source/type/required');
    }
    const {key,source,type,required}=entry;
    if(typeof key!=='string'||!SAFE_KEY.test(key)||keys.has(key)||
      typeof source!=='string'||!source||unsafeHeader.test(source)||
      !headers.includes(source)||sources.has(normalizeKey(source))||
      !TYPES.has(type)||typeof required!=='boolean'){
      throw new TypeError('Invalid, duplicated or unrecognized mapped field');
    }
    keys.add(key);sources.add(normalizeKey(source));
    return {key,source,type,required};
  });
}
function parseDate(text){
  let m=/^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})$/.exec(text);
  const values=m?[m[1],m[3],m[4]]:(/^(\d{4})(\d{2})(\d{2})$/.exec(text)?.slice(1)??null);
  if(!values)return null;
  const [year,month,day]=values.map(Number);
  const leap=year%4===0&&(year%100!==0||year%400===0);
  const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  if(year<1||month<1||month>12||day<1||day>days[month-1])return null;
  return String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
}
function parseDecimal(text){
  if(!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(text))return null;
  return text.replace(/,/g,'').replace(/^\+/,'');
}
function parseInteger(text){
  if(!/^[+-]?\d+$/.test(text))return null;
  const negative=text.startsWith('-'),num=text.replace(/^[+-]/,'').replace(/^0+(?=\d)/,'');
  return negative && num!=='0'?'-'+num:num;
}
function parseBoolean(text){
  if(text==='true'||text==='1')return true;
  if(text==='false'||text==='0')return false;
  return null;
}
function formulaRisk(text){
  const t=text.replace(/^[\s\u0000-\u001F\u007F-\u009F\p{Default_Ignorable_Code_Point}]*/u,'');
  return /^[=+@-]/.test(t) && !/^-?\d+(?:\.\d+)?$/.test(t);
}
const digest=x=>createHash('sha256').update(x,'utf8').digest('hex');

/**
 * Strictly local, 1-to-64 column mapped CSV. Nothing is silently dropped.
 * The raw full source row is retained for traceability and must be treated
 * as potentially sensitive material by consumers.
 */
export function preprocessGenericCsv(source,{columns}={}){
  if(typeof source!=='string')throw new TypeError('CSV must be decoded UTF-8 text');
  const {headers,records}=parseCsvRecords(source);
  if(!records.length)throw new TypeError('CSV has no data records');
  const fields=validateGenericColumns(columns,headers);
  const positions=fields.map(field=>headers.indexOf(field.source));
  const counts={input_rows:records.length,output_rows:records.length,review_rows:0,
    exact_duplicate_rows:0,missing_required_cells:0,invalid_cells:0,formula_risk_cells:0};
  const seen=new Set();
  const rows=[],review_queue=[];
  for(let i=0;i<records.length;i++){
    const cells=records[i];const values=Object.create(null),issues=[];
    const add=(field,code)=>issues.push({field,code});
    for(let j=0;j<fields.length;j++){
      const field=fields[j],raw=cells[positions[j]],trimmed=raw.trim();
      let value=trimmed;
      if(!trimmed){
        value=null;
        if(field.required){add(field.key,'MISSING_REQUIRED');counts.missing_required_cells++;}
      } else if(field.type==='date'){
        value=parseDate(trimmed);
        if(value===null){add(field.key,'INVALID_DATE');counts.invalid_cells++;}
      } else if(field.type==='decimal'){
        value=parseDecimal(trimmed);
        if(value===null){add(field.key,'INVALID_DECIMAL');counts.invalid_cells++;}
      } else if(field.type==='integer'){
        value=parseInteger(trimmed);
        if(value===null){add(field.key,'INVALID_INTEGER');counts.invalid_cells++;}
      } else if(field.type==='boolean'){
        value=parseBoolean(trimmed);
        if(value===null){add(field.key,'INVALID_BOOLEAN');counts.invalid_cells++;}
      }
      // Prevent tainted values from silently entering a spreadsheet exporter.
      if(formulaRisk(raw)){add(field.key,'FORMULA_RISK');counts.formula_risk_cells++;}
      values[field.key]=value;
    }
    const identity=JSON.stringify(cells); // All columns, not merely mapped subset.
    if(seen.has(identity)){add(null,'DUPLICATE_SOURCE_ROW');counts.exact_duplicate_rows++;}
    seen.add(identity);
    const record={source_record:i+2,source_cells:[...cells],values:{...values},
      status:issues.length?'NEEDS_REVIEW':'READY_FOR_HUMAN_REVIEW',issues};
    rows.push(record);
    if(issues.length){counts.review_rows++;review_queue.push({source_record:record.source_record,issues:issues.map(x=>({...x}))});}
  }
  const output={
    schema_version:GENERIC_CSV_VERSION,
    source:{format:'UTF8_CSV',sha256:digest(source),bytes:Buffer.byteLength(source,'utf8'),
      headers:[...headers],source_rows:records.length},
    fields,rows,review_queue,quality:counts,processing_mode:'DETERMINISTIC_LOCAL',approval:'NOT_GRANTED'
  };
  validateGenericCsvPackage(output);
  return output;
}
function sameKeys(x,keys){
  return x&&typeof x==='object'&&!Array.isArray(x)&&
    Object.keys(x).sort().join('\u0000')===[...keys].sort().join('\u0000');
}
const nat=n=>Number.isSafeInteger(n)&&n>=0;
export function validateGenericCsvPackage(p){
  if(!sameKeys(p,['schema_version','source','fields','rows','review_queue','quality','processing_mode','approval'])||
    p.schema_version!==GENERIC_CSV_VERSION||p.processing_mode!=='DETERMINISTIC_LOCAL'||p.approval!=='NOT_GRANTED'){
    throw new TypeError('Unsupported or unsafe generic CSV package');
  }
  const s=p.source;
  if(!sameKeys(s,['format','sha256','bytes','headers','source_rows'])||
    s.format!=='UTF8_CSV'||!/^[a-f0-9]{64}$/.test(s.sha256)||!nat(s.bytes)||
    !nat(s.source_rows)||!Array.isArray(s.headers)||!s.headers.length||
    s.headers.some(h=>typeof h!=='string'||!h)||new Set(s.headers.map(normalizeKey)).size!==s.headers.length){
    throw new TypeError('Invalid source provenance');
  }
  validateGenericColumns(p.fields,s.headers);
  const cols=p.fields;
  const countKeys=['input_rows','output_rows','review_rows','exact_duplicate_rows',
    'missing_required_cells','invalid_cells','formula_risk_cells'];
  if(!sameKeys(p.quality,countKeys)||countKeys.some(k=>!nat(p.quality[k]))||
    !Array.isArray(p.rows)||!Array.isArray(p.review_queue)||
    p.quality.input_rows!==s.source_rows||p.quality.output_rows!==p.rows.length||
    p.rows.length!==s.source_rows)throw new TypeError('Quality counts or row collections invalid');
  const expected=[],seen=new Set();
  let dup=0,missing=0,invalid=0,formula=0;
  for(let i=0;i<p.rows.length;i++){
    const row=p.rows[i];
    if(!sameKeys(row,['source_record','source_cells','values','status','issues'])||
      row.source_record!==i+2||!Array.isArray(row.source_cells)||
      row.source_cells.length!==s.headers.length||row.source_cells.some(x=>typeof x!=='string')||
      !sameKeys(row.values,cols.map(c=>c.key))||!Array.isArray(row.issues)){
      throw new TypeError('Invalid row shape or provenance');
    }
    const all=JSON.stringify(row.source_cells);
    const duplicate=seen.has(all);seen.add(all);
    // Recalculate expected normalized fields and issues from preserved source cells.
    // A downstream consumer must not be able to silently forge ready/clean values.
    const expectedIssues=[];
    const addExpected=(field,code)=>expectedIssues.push({field,code});
    for(const field of cols){
      const raw=row.source_cells[s.headers.indexOf(field.source)],t=raw.trim();
      let expected=t;
      if(!t){
        expected=null;
        if(field.required)addExpected(field.key,'MISSING_REQUIRED');
      }else if(field.type==='date'){
        expected=parseDate(t);
        if(expected===null)addExpected(field.key,'INVALID_DATE');
      }else if(field.type==='decimal'){
        expected=parseDecimal(t);
        if(expected===null)addExpected(field.key,'INVALID_DECIMAL');
      }else if(field.type==='integer'){
        expected=parseInteger(t);
        if(expected===null)addExpected(field.key,'INVALID_INTEGER');
      }else if(field.type==='boolean'){
        expected=parseBoolean(t);
        if(expected===null)addExpected(field.key,'INVALID_BOOLEAN');
      }
      if(formulaRisk(raw))addExpected(field.key,'FORMULA_RISK');
      if(row.values[field.key]!==expected)throw new TypeError('Mapped value disagrees with source cells');
    }
    if(duplicate)addExpected(null,'DUPLICATE_SOURCE_ROW');
    if(JSON.stringify(row.issues)!==JSON.stringify(expectedIssues)){
      throw new TypeError('Review issues disagree with original values');
    }
    const codes=[];
    for(const issue of row.issues){
      if(!sameKeys(issue,['field','code'])||!ISSUE_CODES.has(issue.code)||
        !(issue.field===null||cols.some(c=>c.key===issue.field))||
        (issue.code==='DUPLICATE_SOURCE_ROW')!==(issue.field===null)){
        throw new TypeError('Unrecognized review issue');
      }
      codes.push(issue.code);
      if(issue.code==='MISSING_REQUIRED')missing++;
      else if(issue.code==='FORMULA_RISK')formula++;
      else if(issue.code.startsWith('INVALID_'))invalid++;
    }
    if(duplicate!==codes.includes('DUPLICATE_SOURCE_ROW'))throw new TypeError('Duplicate source proof mismatch');
    if(duplicate)dup++;
    if((row.status==='NEEDS_REVIEW')!==(codes.length>0))throw new TypeError('Review state mismatch');
    if(codes.length)expected.push({source_record:row.source_record,issues:row.issues});
  }
  if(expected.length!==p.review_queue.length||p.quality.review_rows!==expected.length||
    p.quality.exact_duplicate_rows!==dup||p.quality.missing_required_cells!==missing||
    p.quality.invalid_cells!==invalid||p.quality.formula_risk_cells!==formula||
    p.review_queue.some((r,i)=>JSON.stringify(r)!==JSON.stringify(expected[i]))){
    throw new TypeError('Review queue or counters disagree');
  }
  return true;
}
export function serializeGenericCsvPackage(output){
  validateGenericCsvPackage(output);
  return JSON.stringify(output,null,2)+'\n';
}
