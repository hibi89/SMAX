// Offline XLSX -> human-review-only Strict JSON. No source overwrite or network.
import {constants,closeSync,fstatSync,lstatSync,openSync,readFileSync,writeFileSync} from 'node:fs';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractXlsxCells} from './xlsx-cells.mjs';
import {serializeXlsxCellsPackage} from './xlsx-package.mjs';

const MAX_BYTES=2*1024*1024;
const usage='node preprocessing/xlsx-cli.mjs --input source.xlsx --output new-result.json';

export function runXlsxCli(argv=process.argv.slice(2)){
  if(argv.length===1&&argv[0]==='--help')return {usage};
  if(argv.length!==4)throw new Error('Specify input and output. Usage: '+usage);
  const params=Object.create(null);
  for(let i=0;i<argv.length;i+=2){
    const name=argv[i],value=argv[i+1];
    if(!['--input','--output'].includes(name)||typeof value!=='string'||!value||
       value.startsWith('--')||Object.hasOwn(params,name)){
      throw new Error('Invalid or duplicate option. Usage: '+usage);
    }
    params[name]=value;
  }
  if(!Object.hasOwn(params,'--input')||!Object.hasOwn(params,'--output')){
    throw new Error('Missing input or output. Usage: '+usage);
  }
  const input=resolve(params['--input']),output=resolve(params['--output']);
  if(input===output||extname(input).toLowerCase()!=='.xlsx'||extname(output).toLowerCase()!=='.json'){
    throw new Error('Use separate .xlsx source and new .json output paths');
  }
  const stat=lstatSync(input);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>MAX_BYTES){
    throw new Error('Input must be a regular non-symlink XLSX file of at most 2 MiB');
  }
  const fd=openSync(input,constants.O_RDONLY|(constants.O_NOFOLLOW??0));
  let bytes;
  try{
    const current=fstatSync(fd);
    if(!current.isFile()||current.size>MAX_BYTES){
      throw new Error('Opened XLSX is not a regular file or exceeds 2 MiB');
    }
    bytes=readFileSync(fd);
  }finally{closeSync(fd);}
  if(bytes.length>MAX_BYTES)throw new Error('XLSX read exceeds 2 MiB');
  const pkg=extractXlsxCells(bytes);
  // Source parity is checked again before emitting a result.
  const json=serializeXlsxCellsPackage(pkg,bytes);
  writeFileSync(output,json,{encoding:'utf8',flag:'wx',mode:0o600});
  return {status:'LOCAL_FILE_CREATED',schema_version:pkg.schema_version,output,
    sheets:pkg.quality.sheets,rows:pkg.quality.rows,cells:pkg.quality.cells,
    review_cells:pkg.quality.review_cells,source_sha256:pkg.source.sha256};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(runXlsxCli()));}
  catch(error){console.error('XLSX_PREPROCESSING_FAILED: '+String(error?.message??error));process.exitCode=1;}
}
