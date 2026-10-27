// Offline HTML -> Strict JSON; the original file is never changed.
import {constants,closeSync,fstatSync,lstatSync,openSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preprocessHtml,serializeHtmlPackage} from './html.mjs';

export function runHtmlCli(argv=process.argv.slice(2)){
  const usage='node preprocessing/html-cli.mjs --input local.html --output new.json';
  if(argv.length===1&&argv[0]==='--help')return {usage};
  if(argv.length!==4)throw new Error('Specify input and output. Usage: '+usage);
  const opts=Object.create(null);
  for(let i=0;i<argv.length;i+=2){
    const name=argv[i],value=argv[i+1];
    if(!['--input','--output'].includes(name)||typeof value!=='string'||!value||value.startsWith('--')||Object.hasOwn(opts,name))throw new Error('Invalid HTML CLI option');
    opts[name]=value;
  }
  if(!Object.hasOwn(opts,'--input')||!Object.hasOwn(opts,'--output'))throw new Error('Missing input/output');
  const input=resolve(opts['--input']),output=resolve(opts['--output']);
  if(input===output||!['.html','.htm'].includes(extname(input).toLowerCase())||extname(output).toLowerCase()!=='.json')throw new Error('Separate HTML input and JSON output required');
  const stat=lstatSync(input);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>2*1024*1024)throw new Error('HTML input must be regular non-symlink file up to 2 MiB');
  const fd=openSync(input,constants.O_RDONLY|(constants.O_NOFOLLOW??0));
  let bytes;
  try{
    const f=fstatSync(fd);
    if(!f.isFile()||f.size>2*1024*1024)throw new Error('HTML opened file exceeds 2 MiB');
    bytes=readFileSync(fd);
  }finally{closeSync(fd);}
  if(bytes.length>2*1024*1024)throw new Error('HTML read exceeds 2 MiB');
  const pkg=preprocessHtml(bytes);
  writeFileSync(output,serializeHtmlPackage(pkg,bytes),{encoding:'utf8',flag:'wx',mode:0o600});
  return {status:'LOCAL_FILE_CREATED',output,segments:pkg.quality.segments,review_segments:pkg.quality.review_segments,source_sha256:pkg.source.sha256};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(runHtmlCli()));}
  catch(e){console.error('HTML_PREPROCESSING_FAILED: '+String(e?.message??e));process.exitCode=1;}
}
