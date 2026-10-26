// Local CLI for controlled hackathon pilots. No network or automatic source overwrite.
import {lstatSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preprocessMappedCsv,serializePreprocessPackage} from './index.mjs';

const usage = 'node preprocessing/cli.mjs --input input.csv --output new-output.json --date 원본날짜열 --item 원본항목열 --amount 원본금액열';
export function runPreprocessCli(argv=process.argv.slice(2)) {
  if (argv.length===1 && argv[0]==='--help') return {usage};
  const keys=['--input','--output','--date','--item','--amount'],params={};
  if(argv.length!==10)throw new Error('Specify all five options. Usage: '+usage);
  for(let i=0;i<argv.length;i+=2){
    const key=argv[i],value=argv[i+1];
    if(!keys.includes(key)||!value||value.startsWith('--')||Object.hasOwn(params,key)) {
      throw new Error('Invalid or duplicate option. Usage: '+usage);
    }
    params[key]=value;
  }
  if(keys.some(key=>!Object.hasOwn(params,key)))throw new Error('Missing input/output or mapping option');
  const input=resolve(params['--input']),output=resolve(params['--output']);
  if(input===output || extname(input).toLowerCase()!=='.csv' ||
     extname(output).toLowerCase()!=='.json')throw new Error('Use separate .csv input and .json output paths');
  const stat=lstatSync(input);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>2*1024*1024) {
    throw new Error('Input must be a regular local CSV file, no symlink, up to 2 MiB');
  }
  const bytes=readFileSync(input);
  // Preserve a leading BOM so source.sha256 matches the original on-disk UTF-8 bytes.
  const source=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
  const result=preprocessMappedCsv(source,{
    mapping:{date:params['--date'],item:params['--item'],amount:params['--amount']}
  });
  const json=serializePreprocessPackage(result);
  writeFileSync(output,json,{encoding:'utf8',flag:'wx',mode:0o600});
  return {status:'LOCAL_FILE_CREATED',output,rows:result.quality.output_rows,
    review_rows:result.quality.review_rows,schema_version:result.schema_version};
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{console.log(JSON.stringify(runPreprocessCli()));}
  catch(error){console.error('PREPROCESSING_FAILED: '+String(error?.message??error));process.exitCode=1;}
}
