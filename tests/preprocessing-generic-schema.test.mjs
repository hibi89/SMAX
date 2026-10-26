import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GENERIC_CSV_VERSION,preprocessGenericCsv,validateGenericCsvPackage} from '../preprocessing/generic-csv.mjs';

const schema=JSON.parse(readFileSync(new URL('../preprocessing/SMAX_PREPROCESS_GENERIC_CSV_V1.schema.json',import.meta.url),'utf8'));
test('Generic JSON Schema version, limits, outputs and strict object boundary match adapter',()=>{
  assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.properties.schema_version.const,GENERIC_CSV_VERSION);
  assert.equal(schema.properties.fields.maxItems,64);
  assert.equal(schema.properties.approval.const,'NOT_GRANTED');
  for(const part of [schema,schema.properties.source,schema.$defs.row,schema.$defs.issue]){
    assert.equal(part.additionalProperties,false);
  }
  const p=preprocessGenericCsv('열A,열B\nx,3',{columns:[
    {key:'name',source:'열A',type:'text',required:true},
    {key:'count',source:'열B',type:'integer',required:true}
  ]});
  const keys=(object,shape)=>assert.deepEqual(Object.keys(object).sort(),shape.required.slice().sort());
  keys(p,schema);
  keys(p.source,schema.properties.source);
  keys(p.quality,schema.properties.quality);
  keys(p.rows[0],schema.$defs.row);
  keys(p.fields[0],schema.properties.fields.items);
  assert.equal(validateGenericCsvPackage(p),true);
});
test('strict validator cannot accept tampered clean values or hidden review issues',()=>{
  const p=preprocessGenericCsv('값\n=SUM(1)',{columns:[{key:'value',source:'값',type:'text',required:true}]});
  assert.throws(()=>validateGenericCsvPackage({
    ...p,rows:[{...p.rows[0],values:{value:'safe'}}]
  }),/Mapped value disagrees/);
  assert.throws(()=>validateGenericCsvPackage({
    ...p,rows:[{...p.rows[0],issues:[]}],review_queue:[]
  }),/Review issues disagree/);
});
