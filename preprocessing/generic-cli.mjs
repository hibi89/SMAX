// Generic CSV V1 local CLI. Explicit mapping; no network or input overwrite.
import {constants,closeSync,fstatSync,lstatSync,openSync,readFileSync,writeFileSync} from 'node:fs';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preprocessGenericCsv,serializeGenericCsvPackage} from './generic-csv.mjs';

const MAX_CSV_BYTES=2*1024*1024;
const MAX_CONFIG_BYTES=64*1024;
const usage='node preprocessing/generic-cli.mjs --input source.csv --columns mapping.json --output new-result.json';
function loadUtf8File(path,maxBytes,label){
  const entry=lstatSync(path);
  if(!entry.isFile()||entry.isSymbolicLink()||entry.size>maxBytes){
    throw new Error(label+' must be a regular non-symlink file of at most '+maxBytes+' bytes');
  }
  const fd=openSync(path,constants.O_RDONLY|(constants.O_NOFOLLOW??0));
  let bytes;
  try {
    const current=fstatSync(fd);
    if(!current.isFile()||current.size>maxBytes){
      throw new Error(label+' changed or exceeds its size limit');
    }
    bytes=readFileSync(fd);
  } finally {closeSync(fd);}
  if(bytes.length>maxBytes)throw new Error(label+' exceeds its size limit');
  return new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
}
export function runGenericCsvCli(argv=process.argv.slice(2)){
  if(argv.length===1&&argv[0]==='--help')return {usage};
  const keys=['--input','--columns','--output'],params=Object.create(null);
  if(argv.length!==6)throw new Error('Specify all three options. Usage: '+usage);
  for(let i=0;i<argv.length;i+=2){
    const key=argv[i],value=argv[i+1];
    if(!keys.includes(key)||typeof value!=='string'||!value||
      value.startsWith('--')||Object.hasOwn(params,key)){
      throw new Error('Invalid or duplicate option. Usage: '+usage);
    }
    params[key]=value;
  }
  if(keys.some(key=>!Object.hasOwn(params,key)))throw new Error('Missing option. Usage: '+usage);
  const input=resolve(params['--input']);
  const mapping=resolve(params['--columns']);
  const output=resolve(params['--output']);
  if(new Set([input,mapping,output]).size!==3||
    extname(input).toLowerCase()!=='.csv'||
    extname(mapping).toLowerCase()!=='.json'||
    extname(output).toLowerCase()!=='.json'){
    throw new Error('Use separate CSV input, JSON mapping and new JSON output paths');
  }
  // Decode the raw file with a fatal UTF-8 decoder; retaining BOM guarantees
  // the source hash and byte count describe the original on-disk CSV.
  const source=loadUtf8File(input,MAX_CSV_BYTES,'CSV input');
  const mappingText=loadUtf8File(mapping,MAX_CONFIG_BYTES,'Mapping');
  const config=JSON.parse(mappingText.replace(/^\uFEFF/,''));
  if(!config||typeof config!=='object'||Array.isArray(config)||
    Object.keys(config).length!==1||!Object.hasOwn(config,'columns')){
    throw new TypeError('Mapping must contain only a columns array');
  }
  const result=preprocessGenericCsv(source,{columns:config.columns});
  const json=serializeGenericCsvPackage(result);
  // wx is exclusive: never follow or overwrite an existing destination.
  writeFileSync(output,json,{encoding:'utf8',flag:'wx',mode:0o600});
  return {status:'LOCAL_FILE_CREATED',schema_version:result.schema_version,
    output,rows:result.quality.output_rows,review_rows:result.quality.review_rows,
    source_sha256:result.source.sha256};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(runGenericCsvCli()));}
  catch(error){console.error('GENERIC_PREPROCESSING_FAILED: '+String(error?.message??error));process.exitCode=1;}
}
