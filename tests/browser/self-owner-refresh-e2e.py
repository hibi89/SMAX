from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import hashlib,json,base64,subprocess,os
ROOT=Path(__file__).resolve().parents[2]
src=(ROOT/'site/owner.html').read_text('utf8')
plain='일자,판매처,금액,메모\n2026-11-01,온라인,100,PERSONAL_ROW_32\n'.encode()
sha=hashlib.sha256(plain).hexdigest()
valid={"version":"SMAX_SELF_OWNER_MAPPING_DRAFT_V1","source_sha256":sha,"mapping":{"date":"일자","channel":"판매처","amount":"금액"},"period":"monthly"}
checks=[]
with sync_playwright() as p:
 exe=os.environ.get('SMAX_CHROMIUM_PATH')
 browser=p.chromium.launch(headless=True,executable_path=exe or None,args=['--no-sandbox'] if exe else [])
 ctx=browser.new_context(accept_downloads=True)
 page=ctx.new_page()
 errors=[]; requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:requests.append(r.url))
 def load():
  page.set_content(src,wait_until='load')
  expect(page.locator('#save')).to_be_disabled()
 def csv(data=plain):
  page.locator('#csv').set_input_files({'name':'source.csv','mimeType':'text/csv','buffer':data})
  expect(page.locator('#save')).to_be_enabled()
 def choose():
  for x,y in [('date','일자'),('channel','판매처'),('amount','금액')]:
   page.select_option('#'+x,y)
 def draft(data):
  page.locator('#draft-verify').set_input_files({'name':'owner.json','mimeType':'application/json','buffer':json.dumps(data,ensure_ascii=False).encode()})
  expect(page.locator('#draft-status')).to_contain_text('원본 SHA-256·열 매핑·기간 일치')
 def mutate_file_after_initial_hash():
  page.evaluate('''() => {
    const input=document.querySelector('#csv');
    const f=input.files[0]; const original=f.arrayBuffer.bind(f);
    let total=0;
    Object.defineProperty(f,'arrayBuffer',{configurable:true,value: async()=>{
      total++;
      const bytes=await original();
      if(total<=0)return bytes;
      const b=new Uint8Array(bytes);b[b.length-2]^=1;return b.buffer;
    }});
  }''')
 load()
 checks.append('CSP page load; initial save disabled')
 csv()
 checks.append('CSV parsed safely')
 assert 'PERSONAL_ROW_32' not in page.content()
 checks.append('source row absent in HTML')
 choose()
 with page.expect_download() as info:page.locator('#save').click()
 received=json.loads(info.value.path().read_text())
 assert received==valid
 checks.append('true bytes SHA validated at save; JSON content')
 def strict_native(draft, source_bytes):
  code = """import fs from 'node:fs';import {createHash} from 'node:crypto';
import {validateOwnerDraft} from './preprocessing/self-owner-mapping.mjs';
const {source,draft}=JSON.parse(fs.readFileSync(0,'utf8'));
const sha=createHash('sha256').update(Buffer.from(source,'base64')).digest('hex');
const out=validateOwnerDraft(['일자','판매처','금액','메모'],sha,draft);
if(out.mapping.amount!=='금액')throw new Error('mapping mismatch');
console.log(out.period);"""
  result=subprocess.run(['node','--input-type=module','-e',code],cwd=ROOT,input=json.dumps({'source':base64.b64encode(source_bytes).decode(),'draft':draft},ensure_ascii=False),text=True,capture_output=True)
  assert result.returncode==0,result.stderr
  return result.stdout.strip()
 assert strict_native(received,plain)=='monthly'
 checks.append('actual exact-SHA Node P8 validator accepts browser download')
 draft(valid)
 checks.append('normal JSON reverify with fresh source SHA')
 # mutated physical bytes after the initial parse: patch file object reading during recheck
 mutate_file_after_initial_hash()
 page.locator('#draft-verify').set_input_files({'name':'mutated.json','mimeType':'application/json','buffer':json.dumps(valid,ensure_ascii=False).encode()})
 expect(page.locator('#draft-status')).to_contain_text('검토 보류')
 checks.append('source changed since selection: JSON reverify blocked')
 # save should fail without a Blob download and invalidate stale selection
 page.locator('#save').click()
 expect(page.locator('#status')).to_contain_text('다시 선택')
 expect(page.locator('#save')).to_be_disabled()
 checks.append('source changed since selection: save blocked before download')
 # new CSV selection recovers to successful customer flow
 csv()
 choose()
 with page.expect_download() as info:page.locator('#save').click()
 assert json.loads(info.value.path().read_text())==valid
 checks.append('reselection recovers without reload')
 # Simulate user changing period while hash read is pending; completion must refuse stale choice
 page.evaluate('''() => {
   const f=document.querySelector('#csv').files[0];
   const old=f.arrayBuffer.bind(f);
   Object.defineProperty(f,'arrayBuffer',{configurable:true,value:()=>new Promise(resolve=>setTimeout(async()=>resolve(await old()),250))});
 }''')
 page.locator('#save').click()
 page.select_option('#period','daily')
 expect(page.locator('#status')).to_contain_text('다시 선택',timeout=3000)
 checks.append('async changed period during source recheck blocked')
 # upload a changed underlying source but with earlier saved mapping; reverify should refuse SHA mismatch
 csv(b'\xef\xbb\xbf'+plain)
 choose()
 page.locator('#draft-verify').set_input_files({'name':'old.json','mimeType':'application/json','buffer':json.dumps(valid,ensure_ascii=False).encode()})
 expect(page.locator('#draft-status')).to_contain_text('검토 보류')
 checks.append('BOM source rejects stale JSON')
 # Need actual Chromium file save success with BOM
 with page.expect_download() as info:page.locator('#save').click()
 bom=json.loads(info.value.path().read_text())
 assert bom['source_sha256']==hashlib.sha256(b'\xef\xbb\xbf'+plain).hexdigest()
 checks.append('BOM physical file SHA during download')
 assert strict_native(bom,b'\xef\xbb\xbf'+plain)=='daily'
 checks.append('BOM physical bytes accepted by exact Node P8 validator')
 # Invalid or forged customer JSON must always remain review-only.
 csv()
 choose()
 def verify_bad(obj, desc, raw=None):
  payload=raw if raw is not None else json.dumps(obj,ensure_ascii=False).encode('utf8')
  page.locator('#draft-verify').set_input_files({'name':'review.json','mimeType':'application/json','buffer':payload})
  expect(page.locator('#draft-status')).to_contain_text('검토 보류')
  checks.append(desc)
 verify_bad({**valid,'source_sha256':'0'*64},'wrong SHA rejected')
 verify_bad({**valid,'approved':True},'forged approval rejected')
 verify_bad({**valid,'mapping':{'date':'일자','channel':'판매처','amount':'판매처'}},'duplicate role rejected')
 verify_bad({**valid,'period':'yearly'},'unsupported period rejected')
 verify_bad({**valid,'mapping':{'date':'미존재','channel':'판매처','amount':'금액'}},'missing original header rejected')
 verify_bad(None,'invalid UTF8 draft rejected',b'\xff\xfe')
 page.locator('#draft-verify').set_input_files({'name':'oversize.json','mimeType':'application/json','buffer':b'x'*65537})
 expect(page.locator('#draft-status')).to_contain_text('64KiB 이하')
 checks.append('JSON size upper bound enforced')
 # CSV invalid UTF8 and invalid header do not permit any save.
 page.locator('#csv').set_input_files({'name':'bad.csv','mimeType':'text/csv','buffer':b'\xff'})
 expect(page.locator('#save')).to_be_disabled()
 checks.append('invalid CSV UTF8 blocked')
 page.locator('#csv').set_input_files({'name':'bad.csv','mimeType':'text/csv','buffer':'일자,판매처,금액\u200b\n2026-11-01,a,1\n'.encode()})
 expect(page.locator('#save')).to_be_disabled()
 checks.append('hidden header char blocked')
 page.locator('#csv').set_input_files({'name':'bad.csv','mimeType':'text/csv','buffer':'일자,판매처,=SUM(A1)\n2026-11-01,a,1\n'.encode()})
 expect(page.locator('#save')).to_be_disabled()
 checks.append('formula header blocked')
 assert not errors,errors
 checks.append('JS runtime no errors')
 assert not requests,requests
 checks.append('network requests zero')
 print(json.dumps({'chromium':browser.version,'passed':len(checks),'failed':0,'checks':checks},ensure_ascii=False,indent=2))
 browser.close()
