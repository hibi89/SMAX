/** Native P14 acceptance: uses checked-in PREP/SELF/P6 services and real disk files. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {OWNER_MAPPING_VERSION} from '../preprocessing/self-owner-mapping.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ownerCli=path.join(root,'preprocessing','self-owner-cli.mjs');
const bundleCli=path.join(root,'preprocessing','self-owner-delivery-cli.mjs');
const sha256=x=>createHash('sha256').update(x).digest('hex');
function tmp(t){
 const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'smax-real-e2e-')));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 return dir;
}
function run(cli,args){
 const r=spawnSync(process.execPath,[cli,...args],{
  cwd:root,encoding:'utf8',timeout:20000,windowsHide:true});
 assert.equal(r.error,undefined,String(r.error));
 return r;
}
function draft(csv){
 return {version:OWNER_MAPPING_VERSION,source_sha256:sha256(csv),period:'monthly',
  mapping:{date:'일자',channel:'판매처',amount:'금액'}};
}
const source='일자,판매처,금액,메모\n2026-11-01,온라인,100,PRIVATE_CUSTOMER_42\n2026-11-02,매장,-10,SECRET_42\n';

test('P14 no-double real CSV -> HTML map -> PREP/SELF preview -> package -> verify',t=>{
 const dir=tmp(t),input=path.join(dir,'source.csv'),json=path.join(dir,'draft.json');
 const form=path.join(dir,'form.html'),output=path.join(dir,'bundle');
 fs.writeFileSync(input,source,'utf8');
 fs.writeFileSync(json,JSON.stringify(draft(source)),'utf8');
 const before=fs.readFileSync(input);
 const a=run(ownerCli,['--form',input,form]);
 assert.equal(a.status,0,a.stderr);
 const formHtml=fs.readFileSync(form,'utf8');
 assert.match(formHtml,/매핑 초안 JSON 저장/);
 assert.doesNotMatch(formHtml,/PRIVATE_CUSTOMER_42|SECRET_42/);
 const b=run(ownerCli,['--preview',input,json]);
 assert.equal(b.status,0,b.stderr);
 const preview=JSON.parse(b.stdout);
 assert.equal(preview.status,'READY_FOR_OWNER_REVIEW');
 assert.equal(preview.summary.net_amount,'90.00');
 assert.equal(preview.owner_approval,'NOT_GRANTED');
 assert.doesNotMatch(b.stdout,/PRIVATE_CUSTOMER_42|SECRET_42|온라인|매장/);
 const c=run(bundleCli,['--package',input,json,output]);
 assert.equal(c.status,0,c.stderr);
 assert.equal(JSON.parse(c.stdout).customer_package_approved,false);
 assert.deepEqual(fs.readdirSync(output).sort(),['manifest.json','receipt.json','report.html']);
 assert.match(fs.readFileSync(path.join(output,'report.html'),'utf8'),/90\.00/);
 assert.doesNotMatch(fs.readFileSync(path.join(output,'report.html'),'utf8'),
  /PRIVATE_CUSTOMER_42|SECRET_42|온라인|매장/);
 const v=run(bundleCli,['--verify',output]);
 assert.equal(v.status,0,v.stderr);
 assert.equal(JSON.parse(v.stdout).status,'OFFLINE_OWNER_REVIEW_BUNDLE_REVERIFIED');
 assert.deepEqual(fs.readFileSync(input),before);
 assert.equal(run(bundleCli,['--package',input,json,output]).status,1);
 fs.appendFileSync(path.join(output,'report.html'),'tampered');
 const altered=run(bundleCli,['--verify',output]);
 assert.equal(altered.status,1);
 assert.equal(altered.stdout,'');
 assert.match(altered.stderr,/OWNER_BUNDLE_BLOCKED/);
});

test('P14 mismatched original SHA fails closed before output folder creation',t=>{
 const dir=tmp(t),input=path.join(dir,'source.csv'),json=path.join(dir,'draft.json');
 const output=path.join(dir,'bundle');
 fs.writeFileSync(json,JSON.stringify(draft(source)));
 fs.writeFileSync(input,source+'2026-11-03,온라인,10,CHANGED\n');
 const r=run(bundleCli,['--package',input,json,output]);
 assert.equal(r.status,1);
 assert.equal(r.stdout,'');
 assert.equal(fs.existsSync(output),false);
 assert.doesNotMatch(r.stderr,/CHANGED|PRIVATE_CUSTOMER/);
});

test('P14 PREP review HOLD hides monetary data, even in packaged report',t=>{
 const dir=tmp(t),input=path.join(dir,'source.csv'),json=path.join(dir,'draft.json');
 const output=path.join(dir,'bundle');
 const invalid='일자,판매처,금액,메모\n2026-02-30,온라인,100,PRIVATE_CUSTOMER_42\n';
 fs.writeFileSync(input,invalid);
 fs.writeFileSync(json,JSON.stringify(draft(invalid)));
 const result=run(bundleCli,['--package',input,json,output]);
 assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(result.stdout).preview_status,'REVIEW_HOLD');
 const receipt=JSON.parse(fs.readFileSync(path.join(output,'receipt.json'),'utf8'));
 assert.equal(receipt.summary,null);
 assert.equal(receipt.owner_approval,'NOT_GRANTED');
 assert.doesNotMatch(fs.readFileSync(path.join(output,'report.html'),'utf8'),
  /100\.00|PRIVATE_CUSTOMER_42/);
 assert.equal(run(bundleCli,['--verify',output]).status,0);
});

test('P15 BOM-inclusive source bytes bind owner mapping, preview and bundle',t=>{
 const dir=tmp(t),input=path.join(dir,'bom-source.csv'),json=path.join(dir,'draft.json');
 const form=path.join(dir,'form.html'),out=path.join(dir,'bundle');
 const bomSource='\uFEFF'+source;
 const raw=Buffer.from(bomSource,'utf8');
 fs.writeFileSync(input,raw);
 fs.writeFileSync(json,JSON.stringify(draft(bomSource)));
 const expectHash=sha256(raw);
 const created=run(ownerCli,['--form',input,form]);
 assert.equal(created.status,0,created.stderr);
 assert.equal(JSON.parse(created.stdout).source_sha256,expectHash);
 const preview=run(ownerCli,['--preview',input,json]);
 assert.equal(preview.status,0,preview.stderr);
 assert.equal(JSON.parse(preview.stdout).source_sha256,expectHash);
 const packaged=run(bundleCli,['--package',input,json,out]);
 assert.equal(packaged.status,0,packaged.stderr);
 assert.equal(JSON.parse(packaged.stdout).source_sha256,expectHash);
 assert.equal(JSON.parse(run(bundleCli,['--verify',out]).stdout).source_sha256,expectHash);
 assert.deepEqual(fs.readFileSync(input),raw);
 // A draft for BOM-stripped text must not authenticate an original BOM file.
 const forged=path.join(dir,'stripped-draft.json'),rejected=path.join(dir,'reject-package');
 fs.writeFileSync(forged,JSON.stringify(draft(source)));
 const blocked=run(bundleCli,['--package',input,forged,rejected]);
 assert.equal(blocked.status,1);
 assert.equal(blocked.stdout,'');
 assert.equal(fs.existsSync(rejected),false);
});
