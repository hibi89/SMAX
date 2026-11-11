/** SMAX SELF P9: owner-selected mapping handoff to actual PREP/SELF review services. */
import {createHash} from 'node:crypto';
import {validateOwnerDraft} from './self-owner-mapping.mjs';

const blocked=()=>{throw new TypeError('SMAX_OWNER_PREVIEW_BLOCKED');};
export function buildOwnerSelfPreview(source,draft,services){
 if(typeof source!=='string'||Buffer.byteLength(source,'utf8')>2*1024*1024||
   !services||!['parseCsvRecords','preprocessGenericCsv','buildSelfPreviewFromPrep']
     .every(name=>typeof services[name]==='function'))blocked();
 const parsed=services.parseCsvRecords(source);
 if(!parsed||!Array.isArray(parsed.headers)||!Array.isArray(parsed.records))blocked();
 const sha=createHash('sha256').update(source,'utf8').digest('hex');
 const cfg=validateOwnerDraft(parsed.headers,sha,draft);
 const pkg=services.preprocessGenericCsv(source,{columns:cfg.columns});
 const report=services.buildSelfPreviewFromPrep(source,pkg,{
   mapping:cfg.mapping,period:cfg.period
 });
 if(!report||report.source_sha256!==sha||
   !Number.isSafeInteger(report.source_rows)||report.source_rows!==parsed.records.length||
   !['READY_FOR_OWNER_REVIEW','REVIEW_HOLD'].includes(report.status)||
   report.preprocessing_approval!=='NOT_GRANTED'||report.owner_approval!=='NOT_GRANTED'||
   report.execution!=='NOT_PERFORMED'||report.outbound_transfer!==false||
   report.source_modified!==false||
   (report.status==='REVIEW_HOLD'&&report.summary!==null))blocked();
 // Existing PREP/SELF returns only aggregate evidence. Never return raw row/column values.
 return Object.freeze({...report,owner_mapping_sha256:sha,
   mapping_reviewed_for_preview:true,owner_authorization:false});
}
