from playwright.sync_api import sync_playwright, TimeoutError
from pathlib import Path
import hashlib,json,subprocess,os,tempfile

ROOT=Path(__file__).resolve().parents[2]
html=(ROOT/'site'/'owner.html').read_text(encoding='utf8')
CHROMIUM=os.environ.get('SMAX_CHROMIUM_PATH')
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=CHROMIUM or None,args=['--no-sandbox'] if CHROMIUM else [])
    ctx=browser.new_context(accept_downloads=True)
    page=ctx.new_page()
    errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda e:requests.append(e.url))
    page.set_content(html,wait_until='load')
    assert page.locator('#save').is_disabled()
    checks.append('no auto download or approval')
    data='일자,판매처,금액,메모\n2026-11-01,온라인,100,PRIVATE_ROW\n'.encode('utf8')
    page.locator('#csv').set_input_files({'name':'synthetic.csv','mimeType':'text/csv','buffer':data})
    assert page.locator('#save').is_enabled(),page.locator('#status').inner_text()
    assert 'PRIVATE_ROW' not in page.content()
    checks.append('local CSV upload, no source row leakage')
    page.locator('#save').click()
    assert '서로 다른' in page.locator('#status').inner_text()
    checks.append('empty mapping blocked')
    page.select_option('#date','일자');page.select_option('#channel','판매처');page.select_option('#amount','판매처')
    page.locator('#save').click()
    assert '서로 다른' in page.locator('#status').inner_text()
    checks.append('duplicate field selection blocked')
    page.select_option('#amount','금액')
    with page.expect_download() as d:page.locator('#save').click()
    assert d.value.suggested_filename=='smax-owner-mapping.json'
    with tempfile.TemporaryDirectory(prefix='smax-p18-brow-') as outdir:
        dest=str(Path(outdir)/'smax-owner-mapping.json')
        d.value.save_as(dest)
        draft=json.loads(Path(dest).read_text())
        assert draft['source_sha256']==hashlib.sha256(data).hexdigest()
        assert draft['mapping']=={'date':'일자','channel':'판매처','amount':'금액'}
        assert draft['period']=='monthly'
        checks.append('real Chromium download matching Node SHA256')
        # Put the cross-validation inside this temp scope only, then retain JSON in memory for the next scenario.
    result=subprocess.run(['node','--input-type=module','-e', '''
import fs from 'node:fs'; import {validateOwnerDraft} from './preprocessing/self-owner-mapping.mjs';
import {createHash} from 'node:crypto';
const bytes=Buffer.from('일자,판매처,금액,메모\\n2026-11-01,온라인,100,PRIVATE_ROW\\n');
const draft=JSON.parse(fs.readFileSync(0,'utf8'));
const valid=validateOwnerDraft(['일자','판매처','금액','메모'],createHash('sha256').update(bytes).digest('hex'),draft);
console.log(JSON.stringify({valid:!!valid,source:valid.mapping.amount}));
'''],input=json.dumps(draft,ensure_ascii=False),text=True,capture_output=True,cwd=ROOT)
    assert result.returncode==0,result.stderr
    checks.append('real checked-in P8 validator accepts downloaded draft')
    # BOM exactly contributes to identity and physical bytes: compare with Node hash.
    page.set_content(html,wait_until='load')
    bom=b'\xef\xbb\xbf'+data
    page.locator('#csv').set_input_files({'name':'bom.csv','mimeType':'text/csv','buffer':bom})
    assert page.locator('#save').is_enabled(),page.locator('#status').inner_text()
    for field,value in [('date','일자'),('channel','판매처'),('amount','금액')]:page.select_option('#'+field,value)
    with page.expect_download() as d:page.locator('#save').click()
    with tempfile.TemporaryDirectory(prefix='smax-p18-bom-') as outdir:
        dest=str(Path(outdir)/'bom.json');d.value.save_as(dest)
        bomdraft=json.loads(Path(dest).read_text())
    assert bomdraft['source_sha256']==hashlib.sha256(bom).hexdigest()!=draft['source_sha256']
    checks.append('BOM-preserving physical-byte digest')
    # Header escaping; JS never puts raw header into HTML markup or raw row values.
    page.set_content(html,wait_until='load')
    hostile='일자,판매처,금액,<img src=x onerror=alert(1)>\n2026-11-01,온라인,100,PRIVATE_ROW\n'.encode()
    page.locator('#csv').set_input_files({'name':'untrusted.csv','mimeType':'text/csv','buffer':hostile})
    assert page.locator('#save').is_enabled(),page.locator('#status').inner_text()
    assert page.locator('#date option').count()==5
    assert page.locator('img').count()==0
    assert 'PRIVATE_ROW' not in page.content()
    checks.append('hostile header is inert DOM option; data rows hidden')
    for fname,buf in [
        ('dup.csv','일자,Ａ,A,금액\n2026-11-01,a,a,1\n'.encode()),
        ('hidden.csv','일자,판매처,금액\u200b\n2026-11-01,a,1\n'.encode()),
        ('formula.csv','일자,판매처,=CMD\n2026-11-01,a,1\n'.encode()),
        ('invalid.csv',b'\xff\xff\xff'),
        ('large.csv',b'A,B,C\n'+b'x'*(2*1024*1024)),
    ]:
        page.set_content(html,wait_until='load')
        page.locator('#csv').set_input_files({'name':fname,'mimeType':'text/csv','buffer':buf})
        assert page.locator('#save').is_disabled(),(fname,page.locator('#status').inner_text())
        checks.append(fname+' rejected')
    assert not errors,errors
    assert not requests,requests
    checks.append('zero JS exceptions / browser network requests')
    print(json.dumps({'chromium':browser.version,'pass':len(checks),'fail':0,'checks':checks,'scope':'set_content; file:// navigation blocked by policy'},ensure_ascii=False,indent=2))
    browser.close()
