// SMAX² P6: no-write offline HTML presentation of the exact P5 batch receipt.
import {pathToFileURL} from 'node:url';
import {readBoundedRegularFile} from './self-preview-cli.mjs';
import {parseSelfBatchArgs,parseSelfBatchManifest,runSelfPreviewBatch} from './self-preview-batch.mjs';
import {renderSelfBatchHtml} from './self-preview-html.mjs';

export function executeHtmlPreview(argv, readLocal=readBoundedRegularFile, runBatch=runSelfPreviewBatch) {
  const path=parseSelfBatchArgs(argv);
  const manifest=parseSelfBatchManifest(readLocal(path,64*1024));
  const report=runBatch(manifest,path);
  return {html:renderSelfBatchHtml(report),status:report.status};
}
export function main(argv=process.argv.slice(2)) {
  try {
    const result=executeHtmlPreview(argv);
    process.stdout.write(result.html);
    return result.status==='REVIEW_HOLD'?2:0;
  }catch(_error) {
    process.stderr.write('{"status":"ERROR","code":"INVALID_LOCAL_HTML_PREVIEW_INPUT"}\n');
    return 1;
  }
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  process.exitCode=main();
}
