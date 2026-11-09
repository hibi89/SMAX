// SMAX² P7 local-only header inspection; no automatic column selection.
import {pathToFileURL} from 'node:url';
import {extname} from 'node:path';
import {parseCsvRecords} from '../site/csv-transform.mjs';
import {readBoundedRegularFile} from './self-preview-cli.mjs';
import {suggestSelfSalesColumns} from './self-column-suggest.mjs';

export function executeColumnSuggest(argv, readLocal = readBoundedRegularFile) {
 if(!Array.isArray(argv)||argv.length!==2||argv[0]!=='--input'||
    typeof argv[1]!=='string'||!argv[1]||argv[1].startsWith('-')||
    argv[1].length>1024||/[\u0000-\u001f\u007f]/u.test(argv[1])||
    extname(argv[1]).toLowerCase()!=='.csv'){
   throw new TypeError('Expected explicitly selected local .csv');
 }
 const source=readLocal(argv[1],2*1024*1024);
 const parsed=parseCsvRecords(source);
 const out=suggestSelfSalesColumns(parsed.headers);
 return {...out,source_rows:parsed.records.length};
}
export function main(argv=process.argv.slice(2)){
 try{
  const result=executeColumnSuggest(argv);
  process.stdout.write(JSON.stringify(result)+'\n');
  // Owner must select actual mapping after viewing candidates.
  return 2;
 }catch(_error){
  process.stderr.write('{"status":"ERROR","code":"INVALID_LOCAL_COLUMN_SOURCE"}\n');
  return 1;
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 process.exitCode=main();
}
