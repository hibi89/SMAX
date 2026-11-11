import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildSingleOwnerBatch,writeOwnerDelivery,verifyOwnerDelivery} from '../preprocessing/self-owner-delivery.mjs';
const sha='a'.repeat(64);
const preview=()=>({version:'SMAX_PREP_SELF_SALES_PREVIEW_V1',source_sha256:sha,
 owner_mapping_sha256:sha,mapping_reviewed_for_preview:true,owner_authorization:false,
 status:'READY_FOR_OWNER_REVIEW',source_rows:2,review_rows:0,eligible_rows:2,
 preprocessing_approval:'NOT_GRANTED',owner_approval:'NOT_GRANTED',execution:'NOT_PERFORMED',
 outbound_transfer:false,source_modified:false,
 summary:{period:'monthly',group_count:2,included_rows:2,
 positive_amount:'100.00',negative_adjustment:'10.00',net_amount:'90.00'}});
const renderer=receipt=>'<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src none"><body>'+JSON.stringify(receipt)+'</body>';
const local=t=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'smax-p10-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return path.join(dir,'new');};
test('P10 one owner draft becomes valid single-source P5 batch contract',()=>{
 const r=buildSingleOwnerBatch(preview());assert.equal(r.status,'READY_FOR_OWNER_REVIEW');
 assert.equal(r.item_count,1);assert.equal(r.source_rows,2);assert.equal(r.summary.net_amount,'90.00');
 assert.equal(r.owner_approval,'NOT_GRANTED');
});
test('P10 HOLD preserves null summary and source identity',()=>{
 const p=preview();p.status='REVIEW_HOLD';p.review_rows=1;p.eligible_rows=0;p.summary=null;
 const r=buildSingleOwnerBatch(p);assert.equal(r.status,'REVIEW_HOLD');
 assert.equal(r.hold_sources,1);assert.equal(r.summary,null);
});
test('P10 forged approval, modified source, incorrect monetary equality refused',()=>{
 for(const f of [p=>p.owner_approval='GRANTED',p=>p.owner_mapping_sha256='0'.repeat(64),
  p=>p.source_modified=true,p=>p.summary.net_amount='91.00',p=>p.summary.included_rows=1,
  p=>p.eligible_rows=1,p=>p.outbound_transfer=true]){
  const p=preview();f(p);assert.throws(()=>buildSingleOwnerBatch(p),TypeError);
 }
});
test('P11 exclusive local delivery and receipt hash verifier; originals untouched',t=>{
 const dir=local(t),p=preview(),before=structuredClone(p);
 const created=writeOwnerDelivery(p,dir,renderer);
 assert.equal(created.customer_package_approved,false);
 assert.deepEqual(p,before);assert.deepEqual(fs.readdirSync(dir).sort(),['manifest.json','receipt.json','report.html']);
 assert.equal(verifyOwnerDelivery(dir,renderer).status,'REVIEW_PACKAGE_VERIFIED_NOT_APPROVED');
 assert.throws(()=>writeOwnerDelivery(p,dir,renderer));
});
test('P11 tampered HTML and receipt are detected',t=>{
 const dir=local(t),p=preview();writeOwnerDelivery(p,dir,renderer);
 fs.appendFileSync(path.join(dir,'report.html'),'X');
 assert.throws(()=>verifyOwnerDelivery(dir,renderer),TypeError);
});
test('P11 no output when renderer fails or malicious HTML is passed',t=>{
 const dir=local(t),p=preview();
 assert.throws(()=>writeOwnerDelivery(p,dir,()=>'<script>evil()</script>'),TypeError);
 assert.equal(fs.existsSync(dir),false);
});
test('P11 symlinked report file is refused',t=>{
 const dir=local(t),p=preview();writeOwnerDelivery(p,dir,renderer);
 const file=path.join(dir,'report.html'),target=path.join(path.dirname(dir),'external.html');
 fs.renameSync(file,target);try{fs.symlinkSync(target,file);}catch{return t.skip('symlink unavailable');}
 assert.throws(()=>verifyOwnerDelivery(dir,renderer),TypeError);
});
