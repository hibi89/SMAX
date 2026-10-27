// Offline TXT/MD to strict JSON; never overwrites input or an existing output.
import {constants,closeSync,fstatSync,lstatSync,openSync,readFileSync,writeFileSync} from 'node:fs';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preprocessPlainText,serializePlainTextPackage} from './plain-text.mjs';

const MAX_BYTES=2*1024*1024;
const usage='node preprocessing/text-cli.mjs --input local.txt --output new-result.json';
export function runTextCli(argv=process.argv.slice(2)){
  if(argv.length===1&&argv[0]==='--help')return {usage};
  if(argv.length!==4)throw new TypeError('Specify input and output. Usage: '+usage);
  const args=Object.create(null);
  for(let i=0;i<argv.length;i+=2){
    const k=argv[i],v=argv[i+1];
    if(!['--input','--output'].includes(k)||typeof v!=='string'||!v||
      v.startsWith('--')||Object.hasOwn(args,k))throw new TypeError('Invalid options. Usage: '+usage);
    args[k]=v;
  }
  if(!Object.hasOwn(args,'--input')||!Object.hasOwn(args,'--output'))
    throw new TypeError('Missing options. Usage: '+usage);
  const input=resolve(args['--input']),output=resolve(args['--output']);
  if(input===output||!['.txt','.md'].includes(extname(input).toLowerCase())||
    extname(output).toLowerCase()!=='.json')throw new TypeError('Separate .txt/.md input and .json output required');
  const s=lstatSync(input);
  if(!s.isFile()||s.isSymbolicLink()||s.size>MAX_BYTES)
    throw new TypeError('Input must be a regular non-symlink file up to 2 MiB');
  const fd=openSync(input,constants.O_RDONLY|(constants.O_NOFOLLOW??0));
  let bytes;
  try{
    const current=fstatSync(fd);
    if(!current.isFile()||current.size>MAX_BYTES)throw new TypeError('Opened input exceeds 2 MiB');
    bytes=readFileSync(fd);
  }finally{closeSync(fd);}
  if(bytes.length>MAX_BYTES)throw new TypeError('Read exceeds 2 MiB');
  const pkg=preprocessPlainText(bytes),result=serializePlainTextPackage(pkg,bytes);
  writeFileSync(output,result,{encoding:'utf8',flag:'wx',mode:0o600});
  return {status:'LOCAL_FILE_CREATED',output,segments:pkg.quality.segments,
    review_segments:pkg.quality.review_segments,source_sha256:pkg.source.sha256};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(runTextCli()));}
  catch(e){console.error('TEXT_PREPROCESSING_FAILED: '+String(e?.message??e));process.exitCode=1;}
}
