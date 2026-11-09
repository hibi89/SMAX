// SMAX² P6: noninteractive, offline, CSP-isolated HTML report for owner review.
// Accept only strict P5 batch drafts; never render source values or paths.
import {SELF_BATCH_VERSION} from './self-preview-batch.mjs';

export const SELF_HTML_VERSION = 'SMAX_PREP_SELF_LOCAL_HTML_V1';
const allowedStatuses = new Set(['READY_FOR_OWNER_REVIEW','REVIEW_HOLD']);
const exactKeys = (value, expected) => value !== null &&
  typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).sort().join('\0') === [...expected].sort().join('\0');
const integer = n => Number.isSafeInteger(n) && n >= 0;
const MONEY = /^-?(?:0|[1-9]\d*)\.\d{2}$/;

function cents(value) {
  if(typeof value!=='string'||!MONEY.test(value)||value.length>31){
    throw new TypeError('Unsafe aggregate monetary value');
  }
  const neg=value.startsWith('-');
  const [whole,frac]=(neg?value.slice(1):value).split('.');
  const number=BigInt(whole)*100n+BigInt(frac);
  return neg?-number:number;
}

function validateReport(report) {
  const keys=['version','status','preprocessing_approval','owner_approval','execution',
    'outbound_transfer','source_modified','item_count','source_rows','hold_sources',
    'items','summary'];
  if (!exactKeys(report,keys) || report.version!==SELF_BATCH_VERSION ||
      !allowedStatuses.has(report.status) ||
      report.owner_approval!=='NOT_GRANTED' ||
      report.preprocessing_approval!=='NOT_GRANTED' ||
      report.execution!=='NOT_PERFORMED' ||
      report.outbound_transfer!==false || report.source_modified!==false ||
      !integer(report.item_count) || !integer(report.source_rows) ||
      !integer(report.hold_sources) || report.item_count<1 || report.item_count>8 ||
      !Array.isArray(report.items) || report.items.length!==report.item_count) {
    throw new TypeError('Invalid or untrusted batch receipt');
  }
  let rows=0, holds=0;
  const ids=new Set(), hashes=new Set();
  for (const item of report.items) {
    if (!exactKeys(item,['id','source_sha256','source_rows','status']) ||
        typeof item.id !== 'string' || !/^[a-z][a-z0-9_]{0,31}$/.test(item.id) ||
        ids.has(item.id) || typeof item.source_sha256!=='string' ||
        !/^[a-f0-9]{64}$/.test(item.source_sha256) ||
        hashes.has(item.source_sha256) || !integer(item.source_rows) ||
        item.source_rows>20000 || !allowedStatuses.has(item.status)) {
      throw new TypeError('Invalid report row or source provenance');
    }
    ids.add(item.id);hashes.add(item.source_sha256);
    rows+=item.source_rows;
    holds+=item.status==='REVIEW_HOLD'?1:0;
  }
  if(rows!==report.source_rows || holds!==report.hold_sources ||
     (holds>0 && report.status!=='REVIEW_HOLD') ||
     (holds===0 && report.status!=='READY_FOR_OWNER_REVIEW')) {
    throw new TypeError('Inconsistent batch row or review counts');
  }
  if(holds){
    if(report.summary!==null)throw new TypeError('HOLD must hide all monetary totals');
  }else{
    const s=report.summary;
    if(!exactKeys(s,['period','positive_amount','negative_adjustment','net_amount']) ||
       !['daily','monthly'].includes(s.period)) {
      throw new TypeError('Invalid batch monetary summary');
    }
    const p=cents(s.positive_amount),n=cents(s.negative_adjustment),net=cents(s.net_amount);
    if(p<0n||n<0n||p-n!==net)throw new TypeError('Invalid monetary equality');
  }
}

function safe(value) {
  return String(value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
}

export function renderSelfBatchHtml(report) {
  validateReport(report);
  const hold=report.status==='REVIEW_HOLD';
  const title=hold?'검토 보류 — 일부 소스 확인 필요':'소유자 검토 대기 — 집계 초안';
  const status=hold?'검토 보류':'집계 초안 생성';
  const rows=report.items.map((item,index)=>
    '<tr><td>'+safe(index+1)+'</td><td>'+safe(item.id)+'</td><td>'+
    safe(item.status==='REVIEW_HOLD'?'검토 필요':'소유자 검토 대기')+
    '</td><td class="num">'+safe(item.source_rows)+'</td><td><code>'+
    safe(item.source_sha256)+'</code></td></tr>').join('');
  const totals=hold?
    '<p class="warning" role="status">검토가 필요한 데이터가 있어 금액 집계를 표시하지 않습니다.</p>':
    '<section aria-label="집계 초안"><h2>기간별 집계 초안 ('+
    safe(report.summary.period==='monthly'?'월간':'일간')+
    ')</h2><dl><div><dt>양수 금액 합계</dt><dd>'+
    safe(report.summary.positive_amount)+
    '</dd></div><div><dt>음수 조정 절댓값</dt><dd>'+
    safe(report.summary.negative_adjustment)+
    '</dd></div><div><dt>순합계</dt><dd><strong>'+
    safe(report.summary.net_amount)+'</strong></dd></div></dl></section>';
  return '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width, initial-scale=1">'+
    '<meta name="referrer" content="no-referrer">'+
    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; '+
    'script-src &#39;none&#39;; img-src &#39;none&#39;; '+
    'style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;">'+
    '<title>SMAX² — '+safe(title)+'</title><style>'+
    ':root{color-scheme:light;font-family:system-ui,-apple-system,sans-serif}'+
    'body{max-width:1020px;margin:2rem auto;padding:0 1rem;line-height:1.55;color:#1c2530}'+
    'h1{font-size:1.7rem;margin-bottom:.4rem}h2{font-size:1.15rem;margin-top:2rem}'+
    '.muted{color:#526173}.state{padding:.6rem 1rem;background:#eef4f5;border-radius:.5rem}'+
    '.warning{padding:1rem;background:#fff3e8;border-left:4px solid #c26b31}'+
    'table{border-collapse:collapse;width:100%;font-size:.9rem;display:block;overflow-x:auto}'+
    'th,td{padding:.7rem;border-bottom:1px solid #d4dce1;text-align:left}'+
    'th{background:#f5f8fa}td code{font-size:.78rem;overflow-wrap:anywhere}'+
    '.num{text-align:right}dl div{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #eee}'+
    'dt{color:#526173}dd{margin:0;font-variant-numeric:tabular-nums}'+
    'footer{margin-top:2rem;border-top:1px solid #d4dce1;color:#526173;font-size:.85rem;padding-top:1rem}'+
    '</style></head><body><main><header><p class="muted">SMAX² · 로컬 데이터 검토 보고서</p>'+
    '<h1>'+safe(title)+'</h1><p class="state" role="status">'+safe(status)+
    ' · 원본 '+safe(report.item_count)+'개 · 레코드 '+safe(report.source_rows)+
    '개 · 검토 소스 '+safe(report.hold_sources)+'개</p></header>'+
    '<section aria-label="선택한 원본의 검증 근거"><h2>소스별 처리 결과</h2>'+
    '<table><thead><tr><th scope="col">순번</th><th scope="col">식별자</th>'+
    '<th scope="col">상태</th><th scope="col">레코드</th><th scope="col">SHA-256</th>'+
    '</tr></thead><tbody>'+rows+'</tbody></table></section>'+totals+
    '<footer><p>이 결과는 원본 파일에서 계산한 집계 초안이며 승인·작업 실행·최종 회계 확정이 아닙니다.</p>'+
    '<p>원본 데이터, 고객명, 개별 거래내역은 표시하지 않았습니다. 외부 전송과 원본 변경은 수행하지 않습니다.</p>'+
    '<p>버전 '+SELF_HTML_VERSION+'</p></footer></main></body></html>\n';
}
