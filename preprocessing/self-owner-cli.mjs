/** P8/P9 local entry: --form CSV NEW_HTML, or --preview CSV OWNER_JSON. */
import {createHash} from 'node:crypto';
import {constants,openSync,writeFileSync,closeSync} from 'node:fs';
import {dirname,extname,isAbsolute,resolve} from 'node:path';
import {realpathSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {readBoundedRegularFile} from './self-preview-cli.mjs';
import {parseCsvRecords} from '../site/csv-transform.mjs';
import {preprocessGenericCsv} from './generic-csv.mjs';
import {buildSelfPreviewFromPrep} from './self-preview-gate.mjs';
import {renderOwnerMappingHtml} from './self-owner-mapping.mjs';
import {buildOwnerSelfPreview} from './self-owner-preview.mjs';
const invalid=()=>{throw new TypeError('INVALID_OWNER_PREVIEW_INPUT');};
export function parseOwnerCliArgs(argv){
 if(!Array.isArray(argv)||argv.length!==3||
    !['--form','--preview'].includes(argv[0])||
    argv.slice(1).some(s=>typeof s!=='string'||!isAbsolute(s)||
       s.length>1024||/[\u0000-\u001f\u007f]/u.test(s)))invalid();
 const [mode,input,target]=argv;
 if(extname(input).toLowerCase()!=='.csv'||
    extname(target).toLowerCase()!==(mode==='--form'?'.html':'.json')||
    resolve(input).toLowerCase()===resolve(target).toLowerCase())invalid();
 return {mode,input,target};
}
function saveNewHtml(target,html){
 const dir=resolve(dirname(target));
 if(realpathSync(dir)!==dir)invalid();
 const fd=openSync(target,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL,0o600);
 try{writeFileSync(fd,html,{encoding:'utf8'});}
 finally{closeSync(fd);}
}
export function executeOwnerPreviewCli(argv,dependencies={
 readLocal:readBoundedRegularFile,parseCsvRecords,preprocessGenericCsv,buildSelfPreviewFromPrep
}){
 const {mode,input,target}=parseOwnerCliArgs(argv);
 const source=dependencies.readLocal(input,2*1024*1024);
 if(mode==='--form'){
  const parsed=dependencies.parseCsvRecords(source);
  const sha=createHash('sha256').update(source,'utf8').digest('hex');
  const html=renderOwnerMappingHtml(parsed.headers,sha);
  saveNewHtml(target,html);
  return {status:'FORM_CREATED_REVIEW_ONLY',source_sha256:sha,approved:false,
    source_modified:false,imported:false,outbound_transfer:false};
 }
 const draft=JSON.parse(dependencies.readLocal(target,64*1024));
 return buildOwnerSelfPreview(source,draft,dependencies);
}
export function main(argv=process.argv.slice(2)){
 try{
  const result=executeOwnerPreviewCli(argv);
  process.stdout.write(JSON.stringify(result)+'\n');
  return result.status==='REVIEW_HOLD'?2:0;
 }catch{
  process.stderr.write('{"status":"ERROR","code":"OWNER_PREVIEW_INPUT_BLOCKED"}\n');
  return 1;
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 process.exitCode=main();
}
