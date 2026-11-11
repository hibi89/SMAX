/** P12: one local owner CSV + mapping draft -> verified offline review-only bundle. */
import {pathToFileURL} from 'node:url';
import {isAbsolute,extname,resolve} from 'node:path';
import {executeOwnerPreviewCli} from './self-owner-cli.mjs';
import {writeOwnerDelivery,verifyOwnerDelivery} from './self-owner-delivery.mjs';
import {renderSelfBatchHtml} from './self-preview-html.mjs';
const bad=()=>{throw new TypeError('OWNER_BUNDLE_BLOCKED');};
export function parseOwnerBundleArgs(argv){
 if(!Array.isArray(argv)||argv.length!==4||argv[0]!=='--package'||
    argv.slice(1).some(s=>typeof s!=='string'||!isAbsolute(s)||s.length>1024||
       /[\u0000-\u001f\u007f]/u.test(s)))bad();
 if(extname(argv[1]).toLowerCase()!=='.csv'||
    extname(argv[2]).toLowerCase()!=='.json'||
    new Set(argv.slice(1).map(s=>resolve(s).toLowerCase())).size!==3)bad();
 return {input:argv[1],draft:argv[2],output:argv[3]};
}
/** Revalidate an existing package without its original CSV, writes, or approval. */
export function parseOwnerVerifyArgs(argv){
 if(!Array.isArray(argv)||argv.length!==2||argv[0]!=='--verify'||
    typeof argv[1]!=='string'||!isAbsolute(argv[1])||argv[1].length>1024||
    /[\u0000-\u001f\u007f]/u.test(argv[1]))bad();
 return argv[1];
}
export function executeOwnerBundle(argv,services={
 executePreview:executeOwnerPreviewCli,write:writeOwnerDelivery,verify:verifyOwnerDelivery,
 render:renderSelfBatchHtml
}){
 if(Array.isArray(argv)&&argv[0]==='--verify'){
  const dir=parseOwnerVerifyArgs(argv);
  const verified=services.verify(dir,services.render);
  if(!verified||verified.customer_package_approved!==false||
     typeof verified.source_sha256!=='string'||
     !/^[a-f0-9]{64}$/u.test(verified.source_sha256))bad();
  return Object.freeze({
   status:'OFFLINE_OWNER_REVIEW_BUNDLE_REVERIFIED',
   source_sha256:verified.source_sha256,
   owner_approval:'NOT_GRANTED',source_modified:false,
   customer_package_approved:false,outbound_transfer:false
  });
 }
 const a=parseOwnerBundleArgs(argv);
 const preview=services.executePreview(['--preview',a.input,a.draft]);
 if(!preview||!['READY_FOR_OWNER_REVIEW','REVIEW_HOLD'].includes(preview.status))bad();
 const created=services.write(preview,a.output,services.render);
 const verified=services.verify(a.output,services.render);
 if(created.source_sha256!==verified.source_sha256||
    created.customer_package_approved!==false||
    verified.customer_package_approved!==false)bad();
 return Object.freeze({
  status:'OFFLINE_OWNER_REVIEW_BUNDLE_VERIFIED',
  source_sha256:verified.source_sha256,
  preview_status:preview.status,source_rows:preview.source_rows,
  owner_approval:'NOT_GRANTED',source_modified:false,
  customer_package_approved:false,outbound_transfer:false
 });
}
export function main(argv=process.argv.slice(2)){
 try{process.stdout.write(JSON.stringify(executeOwnerBundle(argv))+'\n');return 0;}
 catch{process.stderr.write('{"status":"ERROR","code":"OWNER_BUNDLE_BLOCKED"}\n');return 1;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
 process.exitCode=main();
