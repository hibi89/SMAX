/** SMAX SELF P8: local owner-selected sales mapping, never automatic approval. */
import {createHash} from 'node:crypto';

export const OWNER_MAPPING_VERSION = 'SMAX_SELF_OWNER_MAPPING_DRAFT_V1';
const ROLES = Object.freeze(['date','channel','amount']);
const TYPES = Object.freeze({date:'date',channel:'text',amount:'decimal'});
const BAD = /[\u0000-\u001f\u007f-\u009f\p{Default_Ignorable_Code_Point}]/u;
const HEX = /^[a-f0-9]{64}$/u;
const isRecord = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const hasKeys = (x, keys) => isRecord(x) && Object.keys(x).length === keys.length &&
  keys.every(k => Object.hasOwn(x,k));
const invalid = () => { throw new TypeError('SMAX_OWNER_MAPPING_REVIEW_REQUIRED'); };
const escapeHtml = v => String(v).replace(/[&<>"']/g,ch =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);

export function validateSourceHeaders(headers){
  if(!Array.isArray(headers) || headers.length < 3 || headers.length > 64) invalid();
  const seen=new Set();
  for(const h of headers){
    if(typeof h !== 'string' || !h || h.trim() !== h || h.length > 80 ||
       BAD.test(h) || /^[=+@]/u.test(h)) invalid();
    const norm=h.normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[\s_-]/gu,'');
    if(!norm || seen.has(norm)) invalid();
    seen.add(norm);
  }
  return Object.freeze([...headers]);
}

export function validateOwnerDraft(headers, sha256, draft){
  const valid=validateSourceHeaders(headers);
  if(typeof sha256 !== 'string' || !HEX.test(sha256) ||
     !hasKeys(draft,['version','source_sha256','mapping','period']) ||
     draft.version!==OWNER_MAPPING_VERSION || draft.source_sha256 !== sha256 ||
     !['daily','monthly'].includes(draft.period) || !hasKeys(draft.mapping,ROLES)) invalid();
  const selected=ROLES.map(role => draft.mapping[role]);
  if(selected.some(x=>typeof x!=='string'||!valid.includes(x)) ||
     new Set(selected).size!==3) invalid();
  // All business semantics originate in the owner's explicit choices.
  return Object.freeze({columns: ROLES.map(role => Object.freeze({
    key:role, source:draft.mapping[role], type:TYPES[role], required:true
  })), mapping:Object.freeze({...draft.mapping}), period:draft.period});
}

const formScript = `(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const source_sha256 = el('sha').textContent;
  const warning = el('message');
  el('save').addEventListener('click', () => {
    const mapping = {
      date:el('date').value, channel:el('channel').value, amount:el('amount').value
    };
    if(!mapping.date || !mapping.channel || !mapping.amount ||
       new Set(Object.values(mapping)).size !== 3) {
      warning.textContent = '날짜·판매처·금액 열을 서로 다르게 직접 선택하세요.';
      return;
    }
    const draft = {
      version:'SMAX_SELF_OWNER_MAPPING_DRAFT_V1', source_sha256,
      mapping, period:el('period').value
    };
    const blob = new Blob([JSON.stringify(draft,null,2)+'\\n'],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download='smax-owner-mapping.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    warning.textContent = '검토 초안만 저장했습니다. 승인·집계 실행은 하지 않았습니다.';
  });
})();`;

export function renderOwnerMappingHtml(headers, sha256){
  const valid=validateSourceHeaders(headers);
  if(typeof sha256!=='string' || !HEX.test(sha256)) invalid();
  const options='<option value="" selected>선택 필요</option>'+valid.map(h=>
    `<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`).join('');
  const selects=ROLES.map(role=>
    `<label for="${role}">${{date:'날짜',channel:'판매처',amount:'금액'}[role]}</label>`+
    `<select id="${role}" required>${options}</select>`).join('\n');
  const cspHash=createHash('sha256').update(formScript,'utf8').digest('base64');
  const csp=`default-src 'none'; script-src 'sha256-${cspHash}'; style-src 'unsafe-inline'; `+
    `connect-src 'none'; img-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;
  return '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8">'+
    `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">`+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>SMAX² SELF 로컬 열 매핑</title><style>'+
    'body{max-width:660px;margin:2rem auto;padding:0 1rem;font:16px system-ui;color:#172554}'+
    'label,select{display:block;margin:.7rem 0}select,button{padding:.6rem;font:inherit}'+
    'button{background:#172554;color:white;border:0;border-radius:6px}'+
    'code{overflow-wrap:anywhere}</style></head><body><h1>SELF 로컬 열 매핑 초안</h1>'+
    '<p>원본 자료는 HTML에 들어 있지 않습니다. 열 이름만 로컬로 표시됩니다.</p>'+
    `<p>원본 SHA-256: <code id="sha">${sha256}</code></p>`+selects+
    '<label for="period">집계 기간</label><select id="period">'+
    '<option value="daily">일별</option><option value="monthly">월별</option></select>'+
    '<button type="button" id="save">매핑 초안 JSON 저장</button>'+
    '<p role="status" id="message"></p><p>저장한 초안을 별도 로컬 검증기에 입력해야 합니다. '+
    '사전 승인·외부 전송·자동 집계는 불가능합니다.</p>'+`<script>${formScript}</script></body></html>\n`;
}
