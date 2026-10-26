import {templates} from "./templates.mjs";
import {searchTemplates,parseCsv,suggestFieldMap,buildBlueprint,buildHandoff} from "./core.mjs";
import {normalizeSpreadsheetCsv} from "./csv-transform.mjs";
import {buildSalesReport} from "./sales-report.mjs";
const root=document.getElementById("work-area");
const $=sel=>document.querySelector(sel);
const categories=["전체",...new Set(templates.map(t=>t.category))];
const state={tab:"templates",category:"전체",query:"",selected:null,answers:{},headers:[],mappings:{},searchTerm:"",fileMessage:"",csvSource:null,csvName:"",csvPreview:null,csvError:"",salesPreview:null,salesError:"",salesPeriod:"daily",csvGeneration:0,demoMode:false,csvRowsSample:[]};
const sampleCsvByTemplate={"spreadsheet":{"name":"SMAX_DEMO_SPREADSHEET.csv","source":"거래날짜,품목,결제금액\n2026/10/24,연필,\"₩1,200원\"\n2026-10-25,공책,3500\n2026-10-25,공책,3500\n2026-02-30,리필,미확인\n","mapping":{"date":"거래날짜","item":"품목","amount":"결제금액"}},"sales":{"name":"SMAX_DEMO_SALES.csv","source":"판매일,판매처,판매액\r\n2026-10-01,온라인,100\r\n2026-10-01,온라인,100\r\n2026-10-02,매장,-20.10\r\n2026-02-30,매장,9\r\n2026-10-03,=1+1,4\r\n","mapping":{"date":"판매일","channel":"판매처","amount":"판매액"}}};
const icons={spreadsheet:"↗",inventory:"◫",faq:"◇",sales:"▥",email:"✉",rag:"▤",quote:"▧",booking:"◷",web:"◎",reviews:"♡"};
const h=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const getTemplate=()=>templates.find(t=>t.id===state.selected);
const toast=msg=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__smaxToast);window.__smaxToast=setTimeout(()=>t.classList.remove("show"),2800)};
function forgetCsv({preservePeriod=false}={}){state.csvGeneration++;state.demoMode=false;state.csvSource=null;state.csvName="";state.csvPreview=null;state.csvError="";state.salesPreview=null;state.salesError="";if(!preservePeriod)state.salesPeriod="daily";state.headers=[];state.mappings={};state.csvRowsSample=[];state.fileMessage=""}
function updateSalesPeriodFromAnswer(answer){
  if(answer!=="일별"&&answer!=="월별")return false;
  state.salesPeriod=answer==="월별"?"monthly":"daily";
  state.salesPreview=null;state.salesError="";
  return true;
}
function selectTemplate(id){const t=templates.find(x=>x.id===id);if(!t)return;state.selected=id;state.answers={};forgetCsv();render()}
function card(t){return '<button type="button" class="template-card '+(state.selected===t.id?"selected":"")+'" data-action="select" data-id="'+h(t.id)+'"><div class="template-top"><span class="template-icon">'+h(icons[t.id]||"▣")+'</span><span class="draft-tag">'+(t.id==="spreadsheet"||t.id==="sales"?"로컬 CSV 실행·가이드":"설계 가이드 초안")+'</span></div><strong>'+h(t.title)+'</strong><p>'+h(t.summary)+'</p><span class="card-end"><span>'+h(t.category)+'</span><span>자세히 보기 ↗</span></span></button>'}
function renderTemplates(){const results=state.query.trim()?searchTemplates(state.query,templates,10).map(r=>r.template):templates;const filtered=results.filter(t=>state.category==="전체"||t.category===state.category);const selected=getTemplate();return '<div class="studio-grid"><div><div class="workspace-title"><div><h3>템플릿 라이브러리</h3><p>원하는 작업을 선택하세요. 말하듯 검색해도 됩니다.</p></div></div><div class="search-wrap"><span class="search-glyph" aria-hidden="true">⌕</span><input id="template-search" class="input" type="search" autocomplete="off" placeholder="예: 메일로 들어온 엑셀 정리하고 싶어" value="'+h(state.query)+'" aria-label="템플릿 검색"></div><div class="categories">'+categories.map(c=>'<button type="button" class="chip '+(state.category===c?"active":"")+'" data-action="category" data-name="'+h(c)+'">'+h(c)+'</button>').join("")+'</div><div class="result-info">'+filtered.length+'개 템플릿 · 검색은 사전 정의된 동의어와 규칙 기반입니다</div>'+(filtered.length?'<div class="template-grid">'+filtered.map(card).join("")+'</div>':'<div class="empty-state"><h3>일치하는 템플릿을 찾지 못했어요.</h3><p>다른 말로 검색하거나 카테고리를 변경해보세요. 무료 제안 기능은 준비 중입니다.</p></div>')+'</div>'+detailPanel(selected)+'</div>'}
function detailPanel(t){if(!t)return '<aside class="side-panel"><div class="side-label">HOW TO BEGIN</div><h3>직접 만들고, 배우는 AX</h3><p>왼쪽에서 템플릿을 선택하면 필요한 데이터와 자동화 과정이 표시됩니다.</p><div class="mini-step"><b>01</b> 업무 선택</div><div class="mini-step"><b>02</b> 질문에 답변</div><div class="mini-step"><b>03</b> 설계서와 AI 구축 가이드</div><p class="tiny">현재 모든 유형은 개발 중인 설계 초안입니다.</p></aside>';return '<aside class="side-panel"><div class="side-label">TEMPLATE PREVIEW</div><h3>'+h(t.title)+'</h3><p>'+h(t.summary)+'</p><div class="side-label">필요 데이터</div><ul>'+t.fields.map(f=>'<li>'+h(f.label)+'</li>').join("")+'</ul><div class="side-label">실행 안내 단계</div>'+t.steps.map((s,i)=>'<div class="mini-step"><b>'+String(i+1).padStart(2,"0")+'</b> '+h(s)+'</div>').join("")+'<div class="side-actions"><button type="button" class="button-sm" data-action="tab" data-tab="chat">챗봇 패널에서 시작 →</button><button type="button" class="button-outline" data-action="clear">선택 해제</button></div><p class="tiny">이 가이드는 계획 초안이며 외부 도구가 자동 실행되지는 않습니다.</p></aside>'}
function renderChat(){const t=getTemplate();const intro='<div class="bubble assistant">안녕하세요. 어떤 업무를 자동화하고 싶으세요? 편하게 적어주시면 관련 템플릿을 찾아드릴게요. (범용 AI 챗봇이 아닌 규칙형 안내입니다.)</div>';let lines=intro;let choices="";
if(!t){if(state.searchTerm){lines+='<div class="bubble user">'+h(state.searchTerm)+'</div>';const ranked=searchTemplates(state.searchTerm,templates,3);if(ranked.length){lines+='<div class="bubble assistant">이 업무와 관련 있을 만한 템플릿을 찾았어요. 하나를 선택하면 필요한 항목을 확인하겠습니다.</div>';choices=ranked.map(r=>'<button class="choice" type="button" data-action="select" data-id="'+h(r.template.id)+'">'+h(r.template.title)+'</button>').join("")}else{lines+='<div class="bubble assistant">일치하는 템플릿이 아직 없습니다. 더 구체적으로 입력하거나 템플릿 패널에서 직접 찾아보세요. 신규 템플릿 제안 기능은 준비 중입니다.</div>'}}else{lines+='<div class="bubble assistant">먼저 어떤 작업인지 알려주세요. 예: 손님들이 같은 질문을 반복해요.</div>'}}
else{lines+='<div class="bubble user">'+h(t.title)+' 템플릿으로 시작할게요.</div><div class="bubble assistant">'+h(t.summary)+'<br>필요한 조건을 하나씩 확인하겠습니다.</div>';for(const q of t.questions){if(state.answers[q.key]){lines+='<div class="bubble assistant">'+h(q.prompt)+'</div><div class="bubble user">'+h(state.answers[q.key])+'</div>'}}const next=t.questions.find(q=>!state.answers[q.key]);if(next){lines+='<div class="bubble assistant">'+h(next.prompt)+'</div>';choices=next.options.map(o=>'<button type="button" class="choice" data-action="answer" data-question="'+h(next.key)+'" data-answer="'+h(o)+'">'+h(o)+'</button>').join("")}else{lines+='<div class="bubble assistant">기본 질문에 답하셨습니다. '+(Object.hasOwn(sampleCsvByTemplate,t.id)?'오른쪽에서 CSV를 선택하고 열 매핑을 확인한 뒤 로컬 기능을 실행하세요.':'오른쪽에서 필요한 항목명만 입력해 설계서를 구체화하세요. 이 템플릿은 자동 실행되지 않습니다.')+'</div>'}}
return '<div class="chat-wrap"><div><div class="chat-panel"><div class="chat-header"><div><strong>SMAX 가이드</strong><small>'+(t?h(t.title):"자동화 아이디어 찾기")+'</small></div><button type="button" class="button-outline" data-action="reset-chat">다른 작업</button></div><div class="chat-messages">'+lines+(choices?'<div class="choice-list">'+choices+'</div>':"")+'</div><div class="chat-compose"><input id="chat-input" class="input" type="text" maxlength="280" autocomplete="off" placeholder="'+(t?"간단한 답변이나 추가 조건 입력":"어떤 업무를 바꾸고 싶나요?")+'" aria-label="SMAX 가이드 메시지"><button class="button-sm" data-action="chat-send" type="button">입력</button></div></div><p class="chat-caption">규칙에 없는 요청은 정확히 이해하지 못할 수 있습니다. 추천 결과를 직접 확인하세요.</p></div>'+editorPanel(t)+'</div>'}
function salesResultPanel(){
  const keys=["date","channel","amount"],picked=keys.map(k=>state.mappings[k]);
  const ready=!!state.csvSource&&picked.every(v=>v&&state.headers.includes(v))&&new Set(picked).size===3;
  const result=state.salesPreview;
  const table=result?'<div class="csv-scroll"><table class="csv-table"><thead><tr>'+["기간","판매채널","건수","양수합계","음수조정","순합계"].map(x=>'<th>'+x+'</th>').join("")+'</tr></thead><tbody>'+result.groups.slice(0,5).map(g=>'<tr>'+[g.period,g.channel,String(g.rows),g.positiveAmount,g.negativeAdjustment,g.netAmount].map(v=>'<td>'+h(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>':"";
  const excludedPreview=result?.excluded.length
    ? '<div class="csv-scroll"><table class="csv-table" aria-label="잠정 매출 제외 거래 검토"><thead><tr><th>원본레코드</th><th>제외·검토 사유</th></tr></thead><tbody>'+
      result.excluded.slice(0,5).map(row=>'<tr><td>'+h(row.sourceRecord)+'</td><td>'+h(row.reason)+'</td></tr>').join("")+
      '</tbody></table></div>'
    : "";
  return '<section class="csv-result" aria-label="로컬 매출 집계">'+
    '<h4>로컬 매출 보고서 (잠정 집계)</h4><p class="tiny">판매일·판매채널·판매금액 열을 직접 확인하세요. 검토가 필요한 행은 합계에서 제외하며, 원본 번호/사유를 별도 파일로 보존합니다. 음수는 반품으로 추정하지 않고 조정액으로 표시합니다. 반품·취소 정책에 관한 설계 답변은 이 집계 계산을 변경하지 않습니다. 세무·회계 신고용이 아닙니다.</p>'+
    '<label for="sales-period">집계 주기</label><select id="sales-period" class="sales-period-select" data-action="sales-period"><option value="daily" '+(state.salesPeriod==="daily"?"selected":"")+'>일별</option><option value="monthly" '+(state.salesPeriod==="monthly"?"selected":"")+'>월별</option></select>'+
    '<button type="button" class="button-sm" data-action="run-sales" '+(ready?"":"disabled")+'>매핑 확인 후 매출 집계</button>'+
    (state.salesError?'<p class="csv-error" role="alert">'+h(state.salesError)+'</p>':"")+
    (result?'<p class="tiny" role="status">원본 '+result.summary.sourceRows+'행 · 잠정 반영 '+result.summary.includedRows+'행 · 제외/검토 '+result.summary.excludedRows+'행 · 그룹 '+result.summary.groupCount+'개 · 순합계 '+h(result.summary.netAmount)+'원</p>'+
      (result.excluded.some(row=>row.reason.split("|").includes("DUPLICATE"))?'<p class="tiny" role="note">중복 의심 거래가 잠정 합계에서 제외되었습니다. 판매일·판매채널·금액이 같아도 별개 주문일 수 있습니다. CSV에 주문번호 등 구분 열이 없으면 자동 구분할 수 없으므로 제외/검토 CSV의 원본레코드 번호를 실제 거래와 반드시 대조하세요.</p>':"")+
      '<p class="tiny">처음 5개 그룹 미리보기. 전체 내용은 보고서/검토 파일을 각각 다운로드하세요. 인력 최종 검토 전 확정 매출이 아닙니다.</p>'+table+
      (result.excluded.length?'<p class="tiny">제외·검토 대상 처음 '+Math.min(5,result.excluded.length)+'건의 원본레코드와 사유입니다. 전체 검토 대상은 아래 CSV를 내려받아 원본 거래와 비교하세요.</p>'+excludedPreview:'')+
      '<button type="button" class="button-outline" data-action="download-sales-report">잠정 집계 CSV 다운로드 ↓</button>'+
      '<button type="button" class="button-outline" data-action="download-sales-review">제외/검토 행 CSV 다운로드 ↓</button>':
      '<p class="tiny">CSV 최대 2MB, XLSX 직접 입력 미지원. 파일과 수동 열 매핑이 완료돼야 실행할 수 있습니다.</p>')+
    '</section>';
}

function csvResultPanel(t){
  if(t.id==="sales")return salesResultPanel();
  if(t.id!=="spreadsheet")return "";
  const keys=["date","item","amount"],picked=keys.map(k=>state.mappings[k]);
  const ready=!!state.csvSource&&picked.every(v=>v&&state.headers.includes(v))&&new Set(picked).size===3;
  const result=state.csvPreview;
  const preview=result?'<div class="csv-scroll"><table class="csv-table"><thead><tr>'+["거래일","상품명","금액","원본레코드","검토상태","검토사유"].map(x=>'<th>'+x+'</th>').join("")+'</tr></thead><tbody>'+result.rows.slice(0,5).map(row=>'<tr>'+row.map(v=>'<td>'+h(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>':"";
  return '<section class="csv-result" aria-label="CSV 실제 변환"><h4>로컬 CSV 실제 변환</h4><p class="tiny">엑셀·CSV 통합 템플릿의 첫 실동작 기능입니다. 3개 열을 직접 확인한 뒤 변환하세요. 원본 파일은 수정하지 않습니다.</p>'+
    '<button type="button" class="button-sm" data-action="run-csv" '+(ready?'':'disabled')+'>매핑 확인 후 변환·미리보기</button>'+
    (state.csvError?'<p class="csv-error" role="alert">'+h(state.csvError)+'</p>':'')+
    (result?'<p class="tiny" role="status">원본 '+result.summary.inputRows+'행 → 결과 '+result.summary.outputRows+'행 · 검토 필요 '+result.summary.reviewRows+'행 · 중복 '+result.summary.duplicateRows+'행</p>'+
      (result.summary.duplicateRows?'<p class="tiny" role="note">중복 의심은 확정 중복이 아닙니다. 주문번호 등 원본의 추가 열도 비교하지만 구분 열이 없다면 별개 거래를 중복으로 표시할 수 있습니다. 원본레코드 번호와 검토 CSV를 대조하세요.</p>':"")+
      '<p class="tiny">처음 5행 미리보기 · NEEDS_REVIEW 행은 삭제되지 않으며 검토 사유가 함께 저장됩니다.</p>'+preview+
      '<button type="button" class="button-outline" data-action="download-csv">전체 결과 CSV 다운로드 ↓</button>'+
      (result.summary.reviewRows?'<button type="button" class="button-outline" data-action="download-csv-review">검토 필요 행만 CSV 다운로드 ↓</button>':''):
      '<p class="tiny">파일 선택과 원본 열 매핑을 마친 후 실행할 수 있습니다. CSV 최대 2MB, XLSX 직접 입력 미지원.</p>')+
    '</section>';
}
function editorPanel(t){
  if(!t)return '<aside class="editor-panel"><span class="side-label">YOUR WORKFLOW</span><h3>시작할 준비가 됐나요?</h3><p>원하는 업무를 입력하고 템플릿을 선택하면 개인별 업무 질문과 설계서 초안 만들기를 이어갈 수 있습니다.</p><p class="tiny">실제 계정 로그인, 이메일 발송 및 외부 서비스 연동은 이 데모에서 실행하지 않습니다.</p></aside>';
  const b=buildBlueprint(t,state.answers,state.mappings,{guideOnly:!Object.hasOwn(sampleCsvByTemplate,t.id)});
  const executable=Object.hasOwn(sampleCsvByTemplate,t.id);
  // Data remains in the browser: the bounded sample is display-only and cannot
  // authorize a mapping. Escape untrusted cells and strip invisible controls.
  const previewCell=value=>h(String(value??"").replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g," ").slice(0,80));
  // Favor explicit human-selected columns, even when they are past column 12.
  // Keep the displayed table bounded and preserve original left-to-right order.
  const selectedIndexes=new Set(t.fields.map(f=>state.headers.indexOf(state.mappings[f.key])).filter(i=>i>=0));
  const previewIndexes=[...selectedIndexes];
  for(let i=0;i<state.headers.length&&previewIndexes.length<12;i++){
    if(!selectedIndexes.has(i))previewIndexes.push(i);
  }
  previewIndexes.sort((a,b)=>a-b);
  const previewColumns=previewIndexes.map(i=>state.headers[i]);
  const rawPreview=executable&&state.csvRowsSample.length
    ? '<div class="csv-raw-preview"><p class="tiny">원본 CSV 값 미리보기 · 최대 3행/12열/셀 80자 (표시만 축약, 원본 데이터는 유지). 선택한 열은 12번째 뒤에 있어도 우선 표시합니다. 이 값으로 열 매핑을 직접 확인하세요.</p><div class="csv-scroll"><table class="csv-table" aria-label="원본 CSV 값 미리보기"><thead><tr>'+previewColumns.map(name=>'<th>'+previewCell(name)+'</th>').join("")+'</tr></thead><tbody>'+state.csvRowsSample.map(row=>'<tr>'+previewIndexes.map(i=>'<td>'+previewCell(row[i])+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></div>'
    : "";
  const maps=executable
    ? (state.headers.length
      ? '<div><label>확인된 CSV 열 매핑</label>'+t.fields.map(f=>'<div class="mapped-row"><label for="map-'+h(f.key)+'">'+h(f.label)+'</label><select data-action="map" id="map-'+h(f.key)+'" data-field="'+h(f.key)+'"><option value="">직접 확인 후 선택</option>'+state.headers.map(v=>'<option '+(state.mappings[f.key]===v?"selected":"")+' value="'+h(v)+'">'+h(v)+'</option>').join("")+'</select></div>').join("")+rawPreview+'</div>'
      : "<p class='tiny'>CSV 파일을 선택하면 실제 열 이름을 확인하고 직접 매핑할 수 있습니다. 파일 본문은 서버로 전송하지 않습니다.</p>")
    : "";
  const inputPanel=executable
    ? '<label class="upload-label" for="csv-upload">CSV 자료 선택 (로컬 처리)</label><input type="file" id="csv-upload" accept=".csv,text/csv" aria-label="CSV 파일 선택">'+
      '<button type="button" class="button-outline" data-action="try-sample">합성 예제 바로 체험</button>'+
      '<button type="button" class="button-outline" data-action="download-sample-input">연습용 원본 CSV 다운로드 ↓</button>'+
      '<p class="tiny">예제에만 자동 매핑을 적용합니다. 실제 거래·매출 데이터가 아니며 내 파일은 직접 열을 확인해야 합니다.</p>'+
      '<p class="tiny">'+h(state.fileMessage||"CSV만 지원하는 초기 버전 · XLSX 파일은 아직 지원하지 않음")+'</p>'+maps
    : '<p class="tiny" role="status">이 템플릿은 설계 가이드 전용입니다. 실제 CSV 변환·업로드 기능은 제공하지 않습니다. 입력하는 항목명은 검증된 데이터 매핑이 아닌 설계 초안입니다.</p>'+
      '<div class="guide-field-editor"><label>설계에 사용할 항목명 (직접 입력)</label>'+
      t.fields.map(f=>'<div class="mapped-row"><label for="guide-field-'+h(f.key)+'">'+h(f.label)+'</label>'+
        '<input type="text" class="input" id="guide-field-'+h(f.key)+'" data-action="guide-field" data-field="'+h(f.key)+'" maxlength="120" autocomplete="off" placeholder="'+h(f.label)+'에 대응하는 항목명" value="'+h(state.mappings[f.key]||'')+'"></div>').join('')+
      '<p class="tiny">실제 개인정보·API 키·고객내용을 입력하지 마세요. 항목명만 기재하면 설계서와 AI 구축 가이드에 반영됩니다. 자동화 실행은 하지 않습니다.</p></div>';
  return '<aside class="editor-panel"><div class="side-label">MY AX BLUEPRINT</div><h3>'+h(t.title)+'</h3><p>답변 완료 '+Object.keys(state.answers).filter(k=>state.answers[k]).length+'/'+t.questions.length+' · 설계 상태: <span class="status-warning">'+(b.state==="NEEDS_REVIEW"?"검토 필요":"사람의 최종 검토 필요")+'</span></p>'+
    inputPanel+
    '<div class="review-notice">자동 매핑을 확정하거나 외부 데이터를 전송하지 않습니다. 생성되는 파일은 구축을 위한 초안입니다.</div><button type="button" class="button-sm" data-action="download-json">AX 설계서 JSON 내려받기 ↓</button><button type="button" class="button-outline" data-action="download-guide">AI 구축 가이드 내려받기 ↓</button><p class="tiny">다운로드는 브라우저 안에서 수행됩니다. 인증키·개인정보는 외부 AI에 무심코 전달하지 마세요.</p>'+csvResultPanel(t)+'</aside>';
}
function render(){root.innerHTML=state.tab==="templates"?renderTemplates():renderChat();$("#tab-templates").classList.toggle("active",state.tab==="templates");$("#tab-chat").classList.toggle("active",state.tab==="chat");$("#tab-templates").setAttribute("aria-selected",String(state.tab==="templates"));$("#tab-chat").setAttribute("aria-selected",String(state.tab==="chat"))}
// File.text() silently replaces invalid UTF-8 bytes; never let damaged business
// data reach mapping or reporting. Legacy CSV must be saved as UTF-8.
async function readUtf8Csv(file) {
  const encodingError='문자 인코딩 오류: CSV UTF-8 형식으로 다시 저장한 후 선택하세요. (일반 CSV/CP949는 미지원)';
  if (typeof file.arrayBuffer === 'function') {
    const bytes=await file.arrayBuffer();
    try {return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
    catch (error) {
      if (error instanceof TypeError || error?.name === 'TypeError') throw new Error(encodingError);
      throw error;
    }
  }
  // Compatibility with test doubles lacking arrayBuffer.
  const text=await file.text();
  if (text.includes('\uFFFD')) throw new Error(encodingError);
  return text;
}
function download(filename,data,mime){const blob=new Blob([data],{type:mime});const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast("파일을 준비했습니다. 미확정 항목을 확인하세요.")}
document.addEventListener("click",event=>{const el=event.target.closest("[data-action]");if(!el)return;const action=el.dataset.action;if(action==="tab"){state.tab=el.dataset.tab;render()}else if(action==="category"){state.category=el.dataset.name;render()}else if(action==="select"){selectTemplate(el.dataset.id)}else if(action==="download-sample-input"){
  const t=getTemplate(),sample=sampleCsvByTemplate[t?.id];
  if(!sample)return;
  download(sample.name,"\uFEFF"+sample.source,"text/csv;charset=utf-8");
}else if(action==="try-sample"){
  const t=getTemplate(), sample=sampleCsvByTemplate[t?.id];if(!sample)return;
  forgetCsv({preservePeriod:true});
  try{
    const csv=parseCsv(sample.source);
    state.csvSource=sample.source;state.csvName=sample.name;state.headers=csv.headers;state.csvRowsSample=csv.rows.slice(0,3).map(row=>row.slice());state.demoMode=true;
    state.mappings={...sample.mapping}; // Preset mappings apply ONLY to synthetic demo data.
    if(t.id==="spreadsheet")state.csvPreview=normalizeSpreadsheetCsv(sample.source,state.mappings);
    else state.salesPreview=buildSalesReport(sample.source,state.mappings,{period:state.salesPeriod});
    state.fileMessage="합성 예제 체험 중 · 실제 거래·매출 자료가 아닙니다 · 본인 파일 선택 시 이 결과는 삭제됩니다.";
  }catch(e){forgetCsv({preservePeriod:true});state.fileMessage="예제 실행 실패: "+(e instanceof Error?e.message:"알 수 없는 오류");}
  render();
}else if(action==="clear"){state.selected=null;state.answers={};forgetCsv();render()}else if(action==="reset-chat"){state.selected=null;state.answers={};forgetCsv();state.searchTerm="";state.tab="chat";render()}else if(action==="answer"){if(getTemplate()?.id==="sales"&&el.dataset.question==="period"&&!updateSalesPeriodFromAnswer(el.dataset.answer))return;state.answers[el.dataset.question]=el.dataset.answer;render()}else if(action==="chat-send")sendChat();else if(action==="run-csv"){
  if(getTemplate()?.id!=="spreadsheet")return;
  state.csvPreview=null;state.csvError="";
  try{
    if(!state.csvSource)throw Error("CSV 파일을 먼저 선택하세요.");
    state.csvPreview=normalizeSpreadsheetCsv(state.csvSource,state.mappings);
  }catch(e){state.csvError=e instanceof Error?e.message:"CSV 변환에 실패했습니다.";}
  render();
}else if(action==="download-csv"){
  if(getTemplate()?.id!=="spreadsheet"||!state.csvPreview)return;
  download(state.demoMode?"SMAX_DEMO_STANDARDIZED.csv":"SMAX_STANDARDIZED.csv",state.csvPreview.csv,"text/csv;charset=utf-8");
}else if(action==="download-csv-review"){
  if(getTemplate()?.id!=="spreadsheet"||!state.csvPreview?.summary.reviewRows)return;
  download(state.demoMode?"SMAX_DEMO_STANDARDIZED_REVIEW.csv":"SMAX_STANDARDIZED_REVIEW.csv",state.csvPreview.reviewCsv,"text/csv;charset=utf-8");
}else if(action==="run-sales"){
  if(getTemplate()?.id!=="sales")return;
  state.salesPreview=null;state.salesError="";
  try{
    if(!state.csvSource)throw Error("CSV 파일을 먼저 선택하세요.");
    state.salesPreview=buildSalesReport(state.csvSource,state.mappings,{period:state.salesPeriod});
  }catch(e){state.salesError=e instanceof Error?e.message:"매출 집계에 실패했습니다.";}
  render();
}else if(action==="download-sales-report"){
  if(getTemplate()?.id!=="sales"||!state.salesPreview)return;
  download(state.demoMode?"SMAX_DEMO_SALES_REPORT.csv":"SMAX_SALES_REPORT.csv",state.salesPreview.reportCsv,"text/csv;charset=utf-8");
}else if(action==="download-sales-review"){
  if(getTemplate()?.id!=="sales"||!state.salesPreview)return;
  download(state.demoMode?"SMAX_DEMO_SALES_REVIEW_ROWS.csv":"SMAX_SALES_REVIEW_ROWS.csv",state.salesPreview.reviewCsv,"text/csv;charset=utf-8");
}else if(action==="download-json"||action==="download-guide"){
  const t=getTemplate();if(!t)return;
  const b=buildBlueprint(t,state.answers,state.mappings,{guideOnly:!Object.hasOwn(sampleCsvByTemplate,t.id)});
  const demoNotice="합성 예제 결과입니다. 실제 고객 데이터나 업무 설계서로 사용하지 마세요.";
  if(state.demoMode){b.syntheticDemo=true;b.demoNotice=demoNotice;}
  const prefix=state.demoMode?"SMAX_DEMO_":"";
  if(action==="download-json")download(prefix+"AX_BLUEPRINT_"+t.id+".json",JSON.stringify(b,null,2),"application/json;charset=utf-8");
  else download(prefix+"AI_BUILD_PROMPT_"+t.id+".md",(state.demoMode?"# "+demoNotice+"\n\n":"")+buildHandoff(t,b),"text/markdown;charset=utf-8");
}});
function sendChat(){const input=$("#chat-input");const msg=input&&input.value.trim();if(!msg)return;if(!state.selected){state.searchTerm=msg.slice(0,280)}else{const t=getTemplate(),next=t.questions.find(q=>!state.answers[q.key]);if(next){if(t.id==="sales"&&next.key==="period"&&!updateSalesPeriodFromAnswer(msg)){toast("매출 집계는 일별 또는 월별만 지원합니다.");return;}state.answers[next.key]=msg.slice(0,280);}else{toast("기본 질문은 완료됐습니다. 다른 업무는 '다른 작업'을 선택하세요.");return}}render()}
document.addEventListener("input",event=>{if(event.target.id==="template-search"){const pos=event.target.selectionStart;state.query=event.target.value.slice(0,120);render();const box=$("#template-search");if(box){box.focus();box.setSelectionRange(pos,pos)}}});
document.addEventListener("keydown",event=>{if(event.target.id==="chat-input"&&event.key==="Enter"){event.preventDefault();sendChat()}});
document.addEventListener("change",async event=>{
  if(event.target.dataset.action==="guide-field"){
    const t=getTemplate();
    if(!t || Object.hasOwn(sampleCsvByTemplate,t.id))return;
    const field=t.fields.find(f=>f.key===event.target.dataset.field);
    if(!field)return;
    const input=String(event.target.value??"").replace(/[\r\n\u0000-\u001f\u007f]/g," ").trim().slice(0,120);
    state.mappings[field.key]=input;
    render();
    return;
  }
  if(event.target.dataset.action==="map"){
    if(!sampleCsvByTemplate[getTemplate()?.id])return;
    state.mappings[event.target.dataset.field]=event.target.value;
    state.csvPreview=null;state.csvError="";state.salesPreview=null;state.salesError="";render();return;
  }
  if(event.target.dataset.action==="sales-period"){
    if(!["daily","monthly"].includes(event.target.value))return;
    state.salesPeriod=event.target.value;state.salesPreview=null;state.salesError="";if(getTemplate()?.id==="sales")state.answers.period=state.salesPeriod==="monthly"?"월별":"일별";render();return;
  }
  if(event.target.id==="csv-upload"){
    if(!sampleCsvByTemplate[getTemplate()?.id])return;
    const file=event.target.files?.[0];if(!file)return;
    forgetCsv({preservePeriod:true});
    if(file.size>2*1024*1024){state.fileMessage="오류: CSV는 2MB 이하만 지원합니다.";render();return;}
    if(!/\.csv$/i.test(file.name)){state.fileMessage="오류: 현재는 CSV 파일만 지원합니다.";render();return;}
    const generation=state.csvGeneration, selected=state.selected;
    try{
      const source=await readUtf8Csv(file);
      if(generation!==state.csvGeneration||selected!==state.selected)return;
      const csv=parseCsv(source);if(!csv.headers.length)throw Error("빈 파일입니다.");
      state.csvSource=source;state.csvName=file.name;
      state.headers=csv.headers;state.csvRowsSample=csv.rows.slice(0,3).map(row=>row.slice());state.mappings={};
      const t=getTemplate(),suggestions=suggestFieldMap(csv.headers,t);
      const suggested=t.fields.filter(f=>!!suggestions[f.key].selected).length;
      state.fileMessage=file.name+" · "+csv.headers.length+"개 열 감지 / "+suggested+"개 자동 후보 (변환 전 직접 선택)";
      render();
    }catch(e){
      if(generation!==state.csvGeneration||selected!==state.selected)return;
      forgetCsv({preservePeriod:true});state.fileMessage="해석 실패: "+(e instanceof Error?e.message:"알 수 없는 오류");render();
    }
  }
});
render();