/** P18: create a new local standalone portal. Never overwrite or export CSV. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {renderOwnerPortalHtml} from './self-owner-portal.mjs';
const bad=()=>{throw new TypeError('SMAX_OWNER_PORTAL_BLOCKED');};
export function parsePortalArgs(argv){
 if(!Array.isArray(argv)||argv.length!==2||argv[0]!=='--output'||
    typeof argv[1]!=='string'||argv[1].length>1024||!path.isAbsolute(argv[1])||
    /[\u0000-\u001f\u007f]/u.test(argv[1])||
    path.extname(argv[1]).toLowerCase()!=='.html')bad();
 const filename=path.resolve(argv[1]),parent=path.dirname(filename);
 if(parent===filename||fs.realpathSync(parent)!==parent)bad();
 return filename;
}
export function createPortalFile(argv){
 const filename=parsePortalArgs(argv);
 const fd=fs.openSync(filename,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL,0o600);
 try{fs.writeFileSync(fd,renderOwnerPortalHtml(),'utf8');}
 finally{fs.closeSync(fd);}
 return Object.freeze({status:'OFFLINE_OWNER_PORTAL_CREATED',approval:'NOT_GRANTED',
   customer_data_read:false,outbound_transfer:false});
}
export function main(argv=process.argv.slice(2)){
 try{process.stdout.write(JSON.stringify(createPortalFile(argv))+'\n');return 0;}
 catch{process.stderr.write('{"status":"ERROR","code":"SMAX_OWNER_PORTAL_BLOCKED"}\n');return 1;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)process.exitCode=main();
