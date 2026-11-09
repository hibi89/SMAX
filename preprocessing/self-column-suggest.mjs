// SMAX² P7: explainable, local-only CSV sales column suggestions.
// Suggestions never authorize/choose a mapping, execution, payment or persistence.
export const SALES_COLUMN_SUGGEST_VERSION='SMAX_SELF_COLUMN_SUGGEST_V1';
const RULES=Object.freeze({
 date:['일자','날짜','거래일','판매일','주문일','거래날짜','orderdate','saledate','soldat','transactiondate','date'],
 channel:['판매처','판매채널','유통채널','판매경로','거래채널','channel','saleschannel','marketplace','salesplatform','store'],
 amount:['판매금액','매출금액','매출액','결제금액','결제액','판매액','금액','순매출','salesamount','saleamount','totalamount','revenue','amount']
});
const STOP=/[\u0000-\u001f\u007f-\u009f\p{Default_Ignorable_Code_Point}]/u;
const normal=s=>s.normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[\s_\-]/g,'');
const keys=['date','channel','amount'];
const SCORE=Object.freeze({EXACT_LABEL:100,PARTIAL_LABEL:60});

export function suggestSelfSalesColumns(headers) {
 if(!Array.isArray(headers)||headers.length<3||headers.length>64||
    headers.some(h=>typeof h!=='string'||!h||h!==h.trim()||
      h.length>80||STOP.test(h)||/^[=+@]/.test(h))){
   throw new TypeError('Invalid local CSV headers for sales mapping');
 }
 const normalized=headers.map(normal);
 if(normalized.some(x=>!x)||new Set(normalized).size!==normalized.length) {
   throw new TypeError('Confusable or duplicate local source column headers');
 }
 const suggestions={};
 const best=new Map();
 let candidatesReady=true;
 for(const field of keys){
   const aliases=RULES[field];
   const matches=[];
   for(let i=0;i<headers.length;i++){
     const value=normalized[i];
     const exact=aliases.includes(value);
     const partial=!exact&&aliases.some(alias=>alias.length>=4&&value.includes(alias));
     if(!exact&&!partial)continue;
     const match=exact?'EXACT_LABEL':'PARTIAL_LABEL';
     matches.push({source:headers[i],column_index:i,match,score:SCORE[match]});
   }
   matches.sort((a,b)=>b.score-a.score||a.column_index-b.column_index);
   suggestions[field]=matches.slice(0,3);
   const leader=matches[0];
   if(!leader||matches.length>1&&matches[1].score===leader.score) {
     candidatesReady=false;
   }else best.set(field,leader.column_index);
 }
 if(new Set(best.values()).size!==best.size)candidatesReady=false;
 return {
   version:SALES_COLUMN_SUGGEST_VERSION,
   status:candidatesReady?'CANDIDATES_FOR_OWNER_REVIEW':'AMBIGUOUS_MAPPING_REVIEW',
   source_column_count:headers.length,
   owner_approval:'NOT_GRANTED',
   mapping_applied:false,execution:'NOT_PERFORMED',
   outbound_transfer:false,source_modified:false,
   suggestions,
   scope:'열 이름 문자열 규칙만으로 후보를 찾았습니다. 데이터 값·의미·단위·정합성은 검증하지 않았으며 자동 매핑하거나 실행하지 않습니다. 반드시 소유자가 원본 열과 수치를 확인해 날짜·채널·금액을 각각 명시적으로 선택해야 합니다.'
 };
}
