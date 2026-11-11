/** SMAX P10/P11 offline owner-review evidence package; never an approval or sale. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const OWNER_DELIVERY_VERSION='SMAX_SELF_OWNER_DELIVERY_V1';
const SHA=x=>createHash('sha256').update(x).digest('hex');
const HEX=/^[0-9a-f]{64}$/u;
const MONEY=/^(?:0|[1-9][0-9]*)\.[0-9]{2}$/u;
const MAX_BYTES=256*1024;
const fail=()=>{throw new TypeError('SMAX_OWNER_DELIVERY_BLOCKED');};
const nat=n=>Number.isSafeInteger(n)&&n>=0;
function cents(x){
 if(typeof x!=='string'||x.length>31||!MONEY.test(x))fail();
 const [whole,fract]=x.split('.');return BigInt(whole)*100n+BigInt(fract);
}
function validatePreview(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||p.version!=='SMAX_PREP_SELF_SALES_PREVIEW_V1'||
   !['READY_FOR_OWNER_REVIEW','REVIEW_HOLD'].includes(p.status)||
   !HEX.test(p.source_sha256)||p.owner_mapping_sha256!==p.source_sha256||
   !nat(p.source_rows)||p.source_rows>20000||!nat(p.review_rows)||
   p.review_rows>p.source_rows||p.mapping_reviewed_for_preview!==true||
   p.owner_authorization!==false||p.preprocessing_approval!=='NOT_GRANTED'||
   p.owner_approval!=='NOT_GRANTED'||p.execution!=='NOT_PERFORMED'||
   p.outbound_transfer!==false||p.source_modified!==false)fail();
 if(p.status==='REVIEW_HOLD'){
  if(p.summary!==null||p.eligible_rows!==0||p.review_rows===0)fail();
  return;
 }
 const s=p.summary;
 if(p.review_rows!==0||p.eligible_rows!==p.source_rows||!s||
   !['daily','monthly'].includes(s.period)||!nat(s.group_count)||
   s.included_rows!==p.source_rows||!MONEY.test(s.net_amount)&&!/^-[1-9][0-9]*\.[0-9]{2}$/u.test(s.net_amount))fail();
 const plus=cents(s.positive_amount),minus=cents(s.negative_adjustment);
 const net=s.net_amount.startsWith('-')?-cents(s.net_amount.slice(1)):cents(s.net_amount);
 if(plus-minus!==net)fail();
}
export function buildSingleOwnerBatch(preview){
 validatePreview(preview);
 const hold=preview.status==='REVIEW_HOLD';
 return Object.freeze({
  version:'SMAX_PREP_SELF_LOCAL_BATCH_V1',status:preview.status,
  preprocessing_approval:'NOT_GRANTED',owner_approval:'NOT_GRANTED',
  execution:'NOT_PERFORMED',outbound_transfer:false,source_modified:false,
  item_count:1,source_rows:preview.source_rows,hold_sources:hold?1:0,
  items:[{id:'owner_csv',source_sha256:preview.source_sha256,
    source_rows:preview.source_rows,status:preview.status}],
  summary:hold?null:{period:preview.summary.period,
   positive_amount:preview.summary.positive_amount,
   negative_adjustment:preview.summary.negative_adjustment,
   net_amount:preview.summary.net_amount}
 });
}
function assertLocalDir(dirname){
 if(typeof dirname!=='string'||!path.isAbsolute(dirname)||dirname.length>1024)fail();
 const abs=path.resolve(dirname),parent=path.dirname(abs);
 if(parent===abs||fs.realpathSync(parent)!==parent)fail();
 return abs;
}
function readBounded(p){
 const st=fs.lstatSync(p);
 if(!st.isFile()||st.isSymbolicLink()||st.size<1||st.size>MAX_BYTES)fail();
 const bytes=fs.readFileSync(p);
 const after=fs.lstatSync(p);
 if(!after.isFile()||after.isSymbolicLink()||after.size!==st.size||
   after.mtimeMs!==st.mtimeMs||after.ino!==st.ino||after.dev!==st.dev||
   bytes.length!==st.size)fail();
 return bytes;
}
export function writeOwnerDelivery(preview,outputDir,renderHtml){
 if(typeof renderHtml!=='function')fail();
 const receipt=buildSingleOwnerBatch(preview),html=renderHtml(receipt);
 if(typeof html!=='string'||!html.startsWith('<!doctype html>')||
   !html.includes('Content-Security-Policy')||Buffer.byteLength(html)>MAX_BYTES)fail();
 const dir=assertLocalDir(outputDir);
 // New exclusive directory; never overwrite or remove any existing path.
 fs.mkdirSync(dir,{recursive:false,mode:0o700});
 const receiptBytes=Buffer.from(JSON.stringify(receipt)+'\n'),htmlBytes=Buffer.from(html);
 const manifest={version:OWNER_DELIVERY_VERSION,status:'REVIEW_ONLY_NOT_APPROVED',
  source_sha256:preview.source_sha256,receipt_sha256:SHA(receiptBytes),
  html_sha256:SHA(htmlBytes),owner_approval:'NOT_GRANTED',source_modified:false,
  outbound_transfer:false,customer_package_approved:false};
 fs.writeFileSync(path.join(dir,'receipt.json'),receiptBytes,{flag:'wx',mode:0o600});
 fs.writeFileSync(path.join(dir,'report.html'),htmlBytes,{flag:'wx',mode:0o600});
 // Manifest is the final publish marker, but interruption is not a crash-atomic transaction.
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest)+'\n',{flag:'wx',mode:0o600});
 return {status:'REVIEW_PACKAGE_CREATED_NOT_APPROVED',source_sha256:preview.source_sha256,
  source_modified:false,outbound_transfer:false,customer_package_approved:false};
}
export function verifyOwnerDelivery(outputDir,renderHtml){
 if(typeof renderHtml!=='function')fail();
 const dir=assertLocalDir(outputDir),d=fs.lstatSync(dir);
 if(!d.isDirectory()||d.isSymbolicLink())fail();
 const names=fs.readdirSync(dir).sort();
 if(JSON.stringify(names)!==JSON.stringify(['manifest.json','receipt.json','report.html']))fail();
 const manifestBytes=readBounded(path.join(dir,'manifest.json'));
 const receiptBytes=readBounded(path.join(dir,'receipt.json'));
 const htmlBytes=readBounded(path.join(dir,'report.html'));
 let m,r;
 try{m=JSON.parse(manifestBytes.toString('utf8'));r=JSON.parse(receiptBytes.toString('utf8'));}catch{fail();}
 if(!m||Object.keys(m).length!==9||m.version!==OWNER_DELIVERY_VERSION||
   m.status!=='REVIEW_ONLY_NOT_APPROVED'||m.owner_approval!=='NOT_GRANTED'||
   m.source_modified!==false||m.outbound_transfer!==false||
   m.customer_package_approved!==false||m.receipt_sha256!==SHA(receiptBytes)||
   m.html_sha256!==SHA(htmlBytes)||!HEX.test(m.source_sha256)||
   r?.items?.[0]?.source_sha256!==m.source_sha256)fail();
 if(renderHtml(r)!==htmlBytes.toString('utf8'))fail();
 return {status:'REVIEW_PACKAGE_VERIFIED_NOT_APPROVED',source_sha256:m.source_sha256,
  source_modified:false,customer_package_approved:false};
}
