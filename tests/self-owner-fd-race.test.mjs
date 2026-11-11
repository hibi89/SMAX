import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildSingleOwnerBatch,writeOwnerDelivery,verifyOwnerDelivery} from '../preprocessing/self-owner-delivery.mjs';
const sha='a'.repeat(64);
const ready=()=>({version:'SMAX_PREP_SELF_SALES_PREVIEW_V1',source_sha256:sha,
 owner_mapping_sha256:sha,mapping_reviewed_for_preview:true,owner_authorization:false,
 status:'READY_FOR_OWNER_REVIEW',source_rows:2,review_rows:0,eligible_rows:2,
 preprocessing_approval:'NOT_GRANTED',owner_approval:'NOT_GRANTED',execution:'NOT_PERFORMED',
 outbound_transfer:false,source_modified:false,
 summary:{period:'monthly',group_count:2,included_rows:2,
 positive_amount:'100.00',negative_adjustment:'10.00',net_amount:'90.00'}});
const render=x=>'<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src none"><body>'+JSON.stringify(x)+'</body>';
const temp=t=>{const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'smax-p16-')));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return {root,dir:path.join(root,'new')};};

test('P16 original P11/P10 contract and read-only package verifier',t=>{
 const {dir}=temp(t),p=ready(),original=JSON.stringify(p);
 const receipt=buildSingleOwnerBatch(p);
 assert.equal(receipt.summary.net_amount,'90.00');
 assert.equal(writeOwnerDelivery(p,dir,render).customer_package_approved,false);
 assert.equal(verifyOwnerDelivery(dir,render).status,'REVIEW_PACKAGE_VERIFIED_NOT_APPROVED');
 assert.equal(JSON.stringify(p),original);
 assert.deepEqual(fs.readdirSync(dir).sort(),['manifest.json','receipt.json','report.html']);
 assert.throws(()=>writeOwnerDelivery(p,dir,render));
});
test('P16 HOLD omits financial totals and still verifies',t=>{
 const {dir}=temp(t),p=ready();p.status='REVIEW_HOLD';p.review_rows=1;p.eligible_rows=0;p.summary=null;
 writeOwnerDelivery(p,dir,render);
 const r=JSON.parse(fs.readFileSync(path.join(dir,'receipt.json'),'utf8'));
 assert.equal(r.summary,null);
 assert.equal(verifyOwnerDelivery(dir,render).customer_package_approved,false);
});
test('P16 refuses appended/tampered manifest, receipt, or report',t=>{
 const {dir}=temp(t);writeOwnerDelivery(ready(),dir,render);
 for(const name of ['manifest.json','receipt.json','report.html']){
  const p=path.join(dir,name),before=fs.readFileSync(p);
  fs.appendFileSync(p,'X');assert.throws(()=>verifyOwnerDelivery(dir,render));
  fs.writeFileSync(p,before);
 }
 assert.equal(verifyOwnerDelivery(dir,render).status,'REVIEW_PACKAGE_VERIFIED_NOT_APPROVED');
});
test('P16 rejects preexisting symbolic-link destination',t=>{
 const {root,dir}=temp(t);writeOwnerDelivery(ready(),dir,render);
 const original=path.join(dir,'report.html'),outside=path.join(root,'outside.html');
 fs.renameSync(original,outside);
 try{fs.symlinkSync(outside,original);}catch(e){if(['EPERM','ENOTSUP'].includes(e.code))return t.skip();throw e}
 assert.throws(()=>verifyOwnerDelivery(dir,render));
});
test('P16 rejects switched symlink just before opening the report',t=>{
 if(!fs.constants.O_NOFOLLOW)return t.skip('O_NOFOLLOW unavailable');
 const {root,dir}=temp(t);writeOwnerDelivery(ready(),dir,render);
 const target=path.join(dir,'report.html'),outside=path.join(root,'outside.html');
 fs.writeFileSync(outside,fs.readFileSync(target));
 const origOpen=fs.openSync;let injected=false;
 try{
  fs.openSync=function(p,...rest){
   if(p===target&&!injected){injected=true;fs.rmSync(target);fs.symlinkSync(outside,target)}
   return origOpen.call(this,p,...rest);
  };
  assert.throws(()=>verifyOwnerDelivery(dir,render));
  assert.equal(injected,true);
 }finally{fs.openSync=origOpen;}
});
test('P16 refuses path replaced after opening an already validated FD',t=>{
 const {root,dir}=temp(t);writeOwnerDelivery(ready(),dir,render);
 const target=path.join(dir,'report.html'),outside=path.join(root,'moved.html');
 const origRead=fs.readSync;let injected=false;
 try{
  fs.readSync=function(fd,...args){
   if(!injected){
    const st=fs.fstatSync(fd),a=fs.statSync(target);
    if(st.dev===a.dev&&st.ino===a.ino){
     injected=true;fs.renameSync(target,outside);fs.writeFileSync(target,fs.readFileSync(outside));
    }
   }
   return origRead.call(this,fd,...args);
  };
  assert.throws(()=>verifyOwnerDelivery(dir,render));
  assert.equal(injected,true);
 }finally{fs.readSync=origRead;}
});
test('P16 rejects directory symlinks and extra output files',t=>{
 const {root,dir}=temp(t);writeOwnerDelivery(ready(),dir,render);
 fs.writeFileSync(path.join(dir,'unexpected.txt'),'new');
 assert.throws(()=>verifyOwnerDelivery(dir,render));
 fs.rmSync(path.join(dir,'unexpected.txt'));
 try{fs.symlinkSync(dir,path.join(root,'link'),'dir')}catch(e){if(['EPERM','ENOTSUP'].includes(e.code))return t.skip();throw e}
 assert.throws(()=>verifyOwnerDelivery(path.join(root,'link'),render));
});
