// Offline DOCX -> Strict JSON, always human review. No source overwrite.
import {constants,closeSync,fstatSync,lstatSync,openSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preprocessDocx,serializeDocxPackage} from './docx.mjs';

export function runDocxCli(argv=process.argv.slice(2)){
  const usage='node preprocessing/docx-cli.mjs --input source.docx --output new-result.json';
  if(argv.length===1&&argv[0]==='--help')return {usage};
  if(argv.length!==4)throw new Error('Specify input and output. Usage: '+usage);
  const opts=Object.create(null);
  for(let i=0;i<argv.length;i+=2){
    const k=argv[i],v=argv[i+1];
    if(!['--input','--output'].includes(k)||typeof v!=='string'||!v||v.startsWith('--')||Object.hasOwn(opts,k))throw new Error('Invalid DOCX CLI option');
    opts[k]=v;
  }
  if(!Object.hasOwn(opts,'--input')||!Object.hasOwn(opts,'--output'))throw new Error('Missing input or output');
  const input=resolve(opts['--input']),output=resolve(opts['--output']);
  if(input===output||extname(input).toLowerCase()!=='.docx'||extname(output).toLowerCase()!=='.json')throw new Error('Separate .docx input and .json output required');
  const s=lstatSync(input);
  if(!s.isFile()||s.isSymbolicLink()||s.size>2*1024*1024)throw new Error('DOCX input must be regular non-symlink file up to 2 MiB');
  const fd=openSync(input,constants.O_RDONLY|(constants.O_NOFOLLOW??0));
  let data;
  try{
    const stat=fstatSync(fd);
    if(!stat.isFile()||stat.size>2*1024*1024)throw new Error('Opened DOCX exceeds 2 MiB');
    data=readFileSync(fd);
  }finally{closeSync(fd);}
  if(data.length>2*1024*1024)throw new Error('DOCX read exceeds 2 MiB');
  const pkg=preprocessDocx(data);
  writeFileSync(output,serializeDocxPackage(pkg,data),{encoding:'utf8',flag:'wx',mode:0o600});
  return {status:'LOCAL_FILE_CREATED',output,paragraphs:pkg.quality.paragraphs,
    review_paragraphs:pkg.quality.review_paragraphs,source_sha256:pkg.source.sha256};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(runDocxCli()));}
  catch(e){console.error('DOCX_PREPROCESSING_FAILED: '+String(e?.message??e));process.exitCode=1;}
}
