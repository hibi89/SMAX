import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=mode=>JSON.parse(readFileSync(new URL('../preprocessing/SMAX_PREPROCESS_'+mode+'_V0.schema.json',import.meta.url),'utf8'));
for(const [mode,raw] of [['TEXT','raw_text'],['HTML','raw_html']]){
  test(mode+' schema requires strict, source-preserving, non-approved output',()=>{
    const s=read(mode);
    assert.equal(s.$schema,'https://json-schema.org/draft/2020-12/schema');
    assert.equal(s.properties.schema_version.const,'SMAX_PREPROCESS_'+mode+'_V0');
    assert.equal(s.properties.approval.const,'NOT_GRANTED');
    for(const node of [s,s.$defs.source,s.$defs.segment,s.$defs.quality])assert.equal(node.additionalProperties,false);
    assert.ok(s.$defs.source.required.includes(raw));
    assert.equal(s.properties.segments.maxItems,10000);
    assert.equal(s.$defs.source.properties.bytes.maximum,2*1024*1024);
    assert.equal(s.$defs.segment.oneOf.length,2);
  });
}
