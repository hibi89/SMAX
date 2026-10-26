import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {preprocessMappedCsv,PACKAGE_VERSION} from '../preprocessing/index.mjs';

const schema=JSON.parse(readFileSync(new URL('../preprocessing/SMAX_PREPROCESS_CSV_V0.schema.json',import.meta.url),'utf8'));
test('cross-language JSON Schema matches the fixed package version and fail-closed fields',()=>{
  assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.properties.schema_version.const,PACKAGE_VERSION);
  assert.equal(schema.properties.approval.const,'NOT_GRANTED');
  assert.equal(schema.properties.processing_mode.const,'DETERMINISTIC_LOCAL');
  assert.equal(schema.additionalProperties,false);
  assert.equal(schema.$defs.row.additionalProperties,false);
  assert.equal(schema.$defs.review.additionalProperties,false);
  assert.equal(schema.properties.source.properties.sha256.pattern,'^[a-f0-9]{64}$');
});

test('JSON Schema field inventories align with the concrete CSV adapter output',()=>{
  const csv='거래날짜,품목,결제금액\n2026-10-01,연필,100';
  const output=preprocessMappedCsv(csv,{mapping:{date:'거래날짜',item:'품목',amount:'결제금액'}});
  const compare=(object,shape)=>assert.deepEqual(Object.keys(object).sort(),shape.required.slice().sort());
  compare(output,schema);
  compare(output.source,schema.properties.source);
  compare(output.mapping,schema.properties.mapping);
  compare(output.quality,schema.properties.quality);
  compare(output.rows[0],schema.$defs.row);
});
