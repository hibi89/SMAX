import json, hashlib, os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[2]
html=(ROOT/'site'/'owner.html').read_text(encoding='utf8')
raw='일자,판매처,금액,메모\n2026-11-01,온라인,100,PRIVATE_ROW_779\n'.encode()
sha=hashlib.sha256(raw).hexdigest()
draft={'version':'SMAX_SELF_OWNER_MAPPING_DRAFT_V1','source_sha256':sha,'mapping':{'date':'일자','channel':'판매처','amount':'금액'},'period':'monthly'}
check=[]
with sync_playwright() as p:
 exe=os.environ.get('SMAX_CHROMIUM_PATH')
 b=p.chromium.launch(executable_path=exe or None,headless=True,args=['--no-sandbox'] if exe else [])
 context=b.new_context(accept_downloads=True)
 page=context.new_page(); errors=[]; requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda req:requests.append(req.url))
 page.set_content(html,wait_until='load')
 assert page.locator('#save').is_disabled()
 check.append('initial no automatic download')
 page.locator('#csv').set_input_files({'name':'source.csv','mimeType':'text/csv','buffer':raw})
 expect(page.locator('#save')).to_be_enabled(timeout=5000)
 check.append('uploaded real CSV and parsed headers')
 assert 'PRIVATE_ROW_779' not in page.content()
 check.append('no private row leaked')
 page.locator('#save').click(); assert '서로 다른' in page.locator('#status').inner_text()
 check.append('empty mapping blocked')
 for id,val in [('date','일자'),('channel','판매처'),('amount','금액')]:page.select_option('#'+id,val)
 with page.expect_download() as d:page.locator('#save').click()
 dl=d.value
 downloaded=json.loads(dl.path().read_text())
 assert downloaded==draft
 check.append('downloaded JSON byte SHA + fields valid')
 def upload(obj,name='map.json'):
  buff=obj if isinstance(obj,bytes) else json.dumps(obj,ensure_ascii=False).encode()
  page.evaluate("document.getElementById('draft-status').textContent='TEST_PENDING'")
  page.locator('#draft-verify').set_input_files({'name':name,'mimeType':'application/json','buffer':buff})
  expect(page.locator('#draft-status')).not_to_have_text('TEST_PENDING',timeout=5000)
  expect(page.locator('#draft-status')).not_to_have_text('매핑 초안을 확인 중입니다.',timeout=5000)
  return page.locator('#draft-status').inner_text()
 assert '원본 SHA-256·열 매핑·기간 일치' in upload(downloaded)
 check.append('same CSV JSON reverified')
 assert '검토 보류' in upload({**draft,'source_sha256':'0'*64})
 check.append('wrong physical SHA refused')
 assert '검토 보류' in upload({**draft,'approved':True})
 check.append('unknown approval refused')
 assert '검토 보류' in upload({**draft,'mapping':{'date':'일자','channel':'판매처','amount':'판매처'}})
 check.append('duplicate owner roles refused')
 assert '검토 보류' in upload({**draft,'mapping':{'date':'잘못된열','channel':'판매처','amount':'금액'}})
 check.append('unrecognized column refused')
 assert '검토 보류' in upload({**draft,'period':'yearly'})
 check.append('unsupported period refused')
 assert '검토 보류' in upload(b'\xff\xfe\x00\x13')
 check.append('invalid UTF-8 JSON refused')
 assert '64KiB 이하' in upload(b'A'*65537)
 check.append('oversized JSON refused')
 bom=b'\xef\xbb\xbf'+raw
 page.locator('#csv').set_input_files({'name':'bom.csv','mimeType':'text/csv','buffer':bom})
 expect(page.locator('#save')).to_be_enabled(timeout=5000)
 assert '검토 보류' in upload(draft)
 check.append('BOM file rejects old hash')
 assert '원본 SHA-256·열 매핑·기간 일치' in upload({**draft,'source_sha256':hashlib.sha256(bom).hexdigest()})
 check.append('BOM physical hash accepted')
 page.locator('#csv').set_input_files({'name':'new.csv','mimeType':'text/csv','buffer':raw+b'2026-11-02,a,1,x\n'})
 expect(page.locator('#save')).to_be_enabled(timeout=5000)
 assert '검토 보류' in upload(draft)
 check.append('updated source must refuse stale draft')
 assert not errors,errors
 check.append('zero JS exceptions')
 assert not requests,requests
 check.append('zero browser requests')
 print(json.dumps({'chromium':b.version,'passed':len(check),'failed':0,'checks':check,'file_navigation':'NOT_TESTED — sandbox blocks file://'},ensure_ascii=False,indent=2))
 b.close()
