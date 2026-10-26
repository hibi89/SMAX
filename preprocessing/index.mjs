// SMAX PREPROCESSING V0 - portable, deterministic adapter around existing SELF CSV engine.
// No LLM calls, HTTP, storage, guessed mappings, confidence claims or automatic approval.
import {createHash} from 'node:crypto';
import {normalizeSpreadsheetCsv} from '../site/csv-transform.mjs';

export const PACKAGE_VERSION = 'SMAX_PREPROCESS_CSV_V0';
export const APPROVAL = 'NOT_GRANTED';
const statuses = new Set(['READY_FOR_HUMAN_REVIEW','NEEDS_REVIEW']);
const own = (obj,keys,label) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) ||
    Object.keys(obj).sort().join('\0') !== [...keys].sort().join('\0')) {
    throw new TypeError('Invalid '+label+' shape');
  }
};
const natural = n => Number.isSafeInteger(n) && n >= 0;

/**
 * V0 is deliberately limited to human-mapped UTF-8 CSV date/item/amount records.
 * All rows survive, including review flags. Unselected source columns are NOT
 * included in the JSON package; the source hash and record number preserve lineage.
 */
export function preprocessMappedCsv(source,{mapping}={}) {
  if (typeof source !== 'string') throw new TypeError('CSV source must be UTF-8 decoded text');
  own(mapping,['date','item','amount'],'mapping');
  for (const name of Object.values(mapping)) {
    if (typeof name !== 'string' || !name.trim()) throw new TypeError('Mapping columns must be explicit non-empty strings');
  }
  const output=normalizeSpreadsheetCsv(source,mapping);
  const rows=output.rows.map(row=>({
    source_record:Number(row[3]),date:row[0],item:row[1],amount:row[2],
    status:row[4],reasons:row[5]?row[5].split('|'):[]
  }));
  const review_queue=rows.filter(row=>row.status==='NEEDS_REVIEW').map(row=>({
    source_record:row.source_record,reasons:[...row.reasons]
  }));
  const s=output.summary;
  const pack={
    schema_version:PACKAGE_VERSION,
    source:{
      format:'UTF8_CSV',
      sha256:createHash('sha256').update(source,'utf8').digest('hex'),
      bytes:Buffer.byteLength(source,'utf8'),
      source_rows:s.inputRows
    },
    mapping:{date:mapping.date,item:mapping.item,amount:mapping.amount},
    rows,review_queue,
    quality:{
      input_rows:s.inputRows,output_rows:s.outputRows,review_rows:s.reviewRows,
      duplicate_rows:s.duplicateRows,invalid_date_rows:s.invalidDateRows,
      invalid_amount_rows:s.invalidAmountRows,missing_rows:s.missingRows,
      formula_protected_rows:s.formulaProtectedRows
    },
    processing_mode:'DETERMINISTIC_LOCAL',
    approval:APPROVAL
  };
  validatePreprocessPackage(pack);
  return pack;
}

export function validatePreprocessPackage(value) {
  own(value,['schema_version','source','mapping','rows','review_queue','quality','processing_mode','approval'],'package');
  if (value.schema_version!==PACKAGE_VERSION || value.processing_mode!=='DETERMINISTIC_LOCAL' ||
    value.approval!==APPROVAL) throw new TypeError('Unsupported schema or unsafe approval');
  own(value.source,['format','sha256','bytes','source_rows'],'source');
  if (value.source.format!=='UTF8_CSV' || !/^[a-f0-9]{64}$/.test(value.source.sha256) ||
    !natural(value.source.bytes) || !natural(value.source.source_rows)) throw new TypeError('Invalid source provenance');
  own(value.mapping,['date','item','amount'],'mapping');
  if (Object.values(value.mapping).some(x=>typeof x!=='string'||!x.trim()) ||
    new Set(Object.values(value.mapping)).size!==3) throw new TypeError('Invalid human field mapping');
  if (!Array.isArray(value.rows)||!Array.isArray(value.review_queue)) throw new TypeError('Invalid rows and review queue');
  const seen=new Set(),expectedReview=[];
  for(const row of value.rows){
    own(row,['source_record','date','item','amount','status','reasons'],'row');
    if (!Number.isSafeInteger(row.source_record)||row.source_record<2||seen.has(row.source_record) ||
      !['date','item','amount'].every(k=>typeof row[k]==='string') ||
      !statuses.has(row.status)||!Array.isArray(row.reasons) ||
      row.reasons.some(r=>typeof r!=='string'||!/^[A-Z][A-Z0-9_]*$/.test(r))) {
      throw new TypeError('Invalid row provenance or value');
    }
    if ((row.status==='NEEDS_REVIEW')!==(row.reasons.length>0)) {
      throw new TypeError('Review flag and reasons disagree');
    }
    seen.add(row.source_record);
    if(row.status==='NEEDS_REVIEW')expectedReview.push([row.source_record,row.reasons]);
  }
  if(value.rows.length!==value.source.source_rows)throw new TypeError('Source row count mismatch');
  for(let i=0;i<value.rows.length;i++){
    if(value.rows[i].source_record!==i+2)throw new TypeError('Source record ordering mismatch');
  }
  own(value.quality,['input_rows','output_rows','review_rows','duplicate_rows','invalid_date_rows',
    'invalid_amount_rows','missing_rows','formula_protected_rows'],'quality');
  if(Object.values(value.quality).some(n=>!natural(n)) ||
    value.quality.input_rows!==value.source.source_rows ||
    value.quality.output_rows!==value.rows.length ||
    value.quality.review_rows!==expectedReview.length ||
    value.review_queue.length!==expectedReview.length)throw new TypeError('Quality and row count mismatch');
  for(let i=0;i<expectedReview.length;i++){
    const x=value.review_queue[i];
    own(x,['source_record','reasons'],'review entry');
    if(x.source_record!==expectedReview[i][0] ||
      JSON.stringify(x.reasons)!==JSON.stringify(expectedReview[i][1])) {
      throw new TypeError('Review queue and source rows disagree');
    }
  }
  return true;
}

export function serializePreprocessPackage(value) {
  validatePreprocessPackage(value);
  return JSON.stringify(value,null,2)+'\n';
}
