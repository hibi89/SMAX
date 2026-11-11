/** SMAX SELF P9: owner-selected mapping handoff to actual PREP/SELF review services. */
import {createHash} from 'node:crypto';
import {validateOwnerDraft} from './self-owner-mapping.mjs';

const blocked=()=>{throw new TypeError('SMAX_OWNER_PREVIEW_BLOCKED');};
const RECEIPT_FIELDS=['version','source_sha256','source_rows','preprocessing_approval',
 'owner_approval','execution','outbound_transfer','source_modified','status','reason',
 'review_rows','eligible_rows','summary'];
const SUMMARY_FIELDS=['period','group_count','included_rows','positive_amount',
 'negative_adjustment','net_amount'];
const exact=(obj,fields)=>obj!==null&&typeof obj==='object'&&!Array.isArray(obj)&&
 Object.keys(obj).sort().join('|')===[...fields].sort().join('|');
const UNSIGNED=/^(?:0|[1-9][0-9]*)\.[0-9]{2}$/u;
const SIGNED=/^-?(?:0|[1-9][0-9]*)\.[0-9]{2}$/u;
function moneyToCents(value,signed=false){
 if(typeof value!=='string'||value.length>31||
    !(signed?SIGNED:UNSIGNED).test(value))blocked();
 const neg=value.startsWith('-');
 const [whole,fract]=(neg?value.slice(1):value).split('.');
 const amount=BigInt(whole)*100n+BigInt(fract);
 return neg?-amount:amount;
}
function validatePreviewReceipt(report,rows,period){
 if(!exact(report,RECEIPT_FIELDS)||
    report.version!=='SMAX_PREP_SELF_SALES_PREVIEW_V1'||
    !Number.isSafeInteger(report.review_rows)||report.review_rows<0||
    report.review_rows>rows||!Number.isSafeInteger(report.eligible_rows)||
    report.eligible_rows<0||report.eligible_rows>rows)blocked();
 if(report.status==='REVIEW_HOLD'){
  if(!['PREP_REVIEW_QUEUE_NOT_EMPTY','SELF_REPORT_REVIEW_REQUIRED'].includes(report.reason)||
     report.review_rows===0||report.eligible_rows!==0||report.summary!==null)blocked();
  return;
 }
 const summary=report.summary;
 if(report.reason!=='LOCAL_DRAFT_ONLY'||report.review_rows!==0||
    report.eligible_rows!==rows||!exact(summary,SUMMARY_FIELDS)||
    summary.period!==period||!Number.isSafeInteger(summary.group_count)||
    summary.group_count<0||summary.group_count>rows||
    summary.included_rows!==rows)blocked();
 if(moneyToCents(summary.positive_amount)-moneyToCents(summary.negative_adjustment)!==
    moneyToCents(summary.net_amount,true))blocked();
}
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
 validatePreviewReceipt(report,parsed.records.length,cfg.period);
 // Reject unknown output fields before constructing user-visible JSON.
 // Existing PREP/SELF returns only aggregate evidence. Never return raw row/column values.
 return Object.freeze({...report,owner_mapping_sha256:sha,
   mapping_reviewed_for_preview:true,owner_authorization:false});
}
