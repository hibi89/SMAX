import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv} from '../site/core.mjs';
import {normalizeSpreadsheetCsv} from '../site/csv-transform.mjs';

// The upload inspector and executable transformer must not disagree on whether
// a customer CSV is structurally safe or silently lose source record counts.
const mapping={date:'거래날짜',item:'품목',amount:'결제금액'};
function inspect(source){
  try{const result=parseCsv(source);return {accepted:true,count:result.rows.length};}
  catch{return {accepted:false};}
}
function convert(source){
  try{const result=normalizeSpreadsheetCsv(source,mapping);return {accepted:true,count:result.summary.inputRows};}
  catch{return {accepted:false};}
}
function assertParity(source,label){
  assert.deepEqual(inspect(source),convert(source),'CSV preflight/transform mismatch: '+label);
}
const base='거래날짜,품목,결제금액';
test('CSV inspection and real converter agree on structural edge cases',()=>{
  const cases=[
    base+'\n2026-10-01,연필,100',
    '\uFEFF'+base+'\r\n2026-10-01,"묶음, B",100\r\n',
    base+'\n2026-10-01,"여러\n줄",100',
    base+'\n2026-10-01,볼펜,100\n,,',
    base+'\n',base,
    '거래날짜,품목,품목\n2026-10-01,연필,100',
    '거래날짜,,결제금액\n2026-10-01,연필,100',
    base+'\n2026-10-01,연필',
    base+'\n2026-10-01,연필,100,extra',
    base+'\n2026-10-01,볼"펜,100',
    base+'\n2026-10-01,"연필"x,100',
    base+'\n2026-10-01,"연필,100',
    base+'\n2026-10-01,연필,100\n\n'
  ];
  cases.forEach((s,i)=>assertParity(s,'edge-'+i));
});
test('256 deterministic synthetic CSV variants retain structural parser parity',()=>{
  let seed=0x1234ABCD;
  const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
  const dates=['2026-10-01','2026/10/2','20260230','','0','2026-10-05'];
  const items=['연필','볼펜','묶음, A','줄1\n줄2','"인용"','','=SUM(A1)'];
  const amounts=['100','-20.10','₩1,200','abc',''];
  const cell=value=>/[,"\r\n]/.test(value)?'"'+value.replaceAll('"','""')+'"':value;
  for(let i=0;i<256;i++){
    const rows=[];
    const count=1+rand()%4;
    for(let n=0;n<count;n++){
      rows.push([dates[rand()%dates.length],items[rand()%items.length],amounts[rand()%amounts.length]].map(cell).join(','));
    }
    let input=base+'\r\n'+rows.join('\r\n');
    switch(i%10){
      case 0:input='\uFEFF'+input;break;
      case 1:input+='\r\n';break;
      case 2:input=input.replace('품목','품"목');break;
      case 3:input=base+'\r\n'+rows[0]+',extra';break;
      case 4:input=base+'\r\n'+rows[0]+'\r\n';break;
      case 5:input=base;break;
      case 6:input=input.replace(base,'거래날짜,거래날짜,결제금액');break;
      case 7:input+='\r\n\r\n';break;
      case 8:input+='\"';break;
      default:break;
    }
    assertParity(input,'seed-'+i);
  }
});
