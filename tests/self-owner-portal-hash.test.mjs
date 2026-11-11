import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../site/owner.html',import.meta.url),'utf8');
const embedded=html.match(/<script>([\s\S]*?)<\/script>/u)?.[1];
if(!embedded)throw new TypeError('Standalone portal script missing');
const start=embedded.indexOf('function sha256(bytes){');
const end=embedded.indexOf('async function inspect(){');
if(start<0||end<=start)throw new TypeError('Expected exact offline SHA256 function missing');
const sha=vm.runInNewContext(embedded.slice(start,end)+'\nsha256;');
const lengths=[0,1,2,3,4,7,15,31,32,33,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,127,128,129,1000,4096,65535,100000,1048576,2*1024*1024];

test('P18 original embedded offline SHA-256 matches Node for 53 binary sizes',()=>{
 for(const n of lengths){
  const input=Buffer.alloc(n);for(let i=0;i<n;i++)input[i]=(i*31+n)&255;
  const expected=createHash('sha256').update(input).digest('hex');
  assert.equal(sha(input),expected,'physical byte length='+n);
 }
});
