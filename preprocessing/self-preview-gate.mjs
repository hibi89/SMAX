// SMAX² PREP -> SELF sales preview gate; no approval, payment, execution or persistence.
// Only a genuinely re-derived, owner-selected local CSV is accepted.
import {preprocessGenericCsv, validateGenericCsvPackage} from './generic-csv.mjs';
import {buildSalesReport} from '../site/sales-report.mjs';

export const SELF_PREVIEW_GATE_VERSION = 'SMAX_PREP_SELF_SALES_PREVIEW_V1';
const MAPPING_FIELDS = Object.freeze(['date', 'channel', 'amount']);
const EXPECTED_TYPES = Object.freeze({
  date: new Set(['date']),
  channel: new Set(['text']),
  amount: new Set(['decimal', 'integer'])
});

function exactObject(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).sort().join('\0') === [...keys].sort().join('\0');
}

function validateInputs(source, pkg, options) {
  if (typeof source !== 'string' || Buffer.byteLength(source, 'utf8') > 2 * 1024 * 1024) {
    throw new TypeError('PREP source must be local CSV text <=2 MiB');
  }
  if (!pkg || !Array.isArray(pkg.rows) || pkg.rows.length > 20000) {
    throw new TypeError('PREP package has invalid or unbounded row count');
  }
  validateGenericCsvPackage(pkg);
  if (!exactObject(options, ['mapping', 'period'])) throw new TypeError('Explicit mapping and period required');
  if (!exactObject(options.mapping, MAPPING_FIELDS)) throw new TypeError('Explicit date/channel/amount mapping required');
  if (!['daily', 'monthly'].includes(options.period)) throw new TypeError('Unsupported SELF report period');
  const names = MAPPING_FIELDS.map(key => options.mapping[key]);
  if (names.some(name => typeof name !== 'string' || !name || !pkg.source.headers.includes(name)) ||
      new Set(names).size !== MAPPING_FIELDS.length) {
    throw new TypeError('Missing, duplicate or unrecognized source mapping');
  }
  const fields = pkg.fields;
  for (const key of MAPPING_FIELDS) {
    const column = fields.find(field => field.source === options.mapping[key]);
    if (!column || column.required !== true || !EXPECTED_TYPES[key].has(column.type)) {
      throw new TypeError('PREP mapped field must be required and type-compatible with SELF');
    }
  }
  // Package-only validation cannot authenticate original bytes. Re-derive.
  const rederived = preprocessGenericCsv(source, {columns: fields});
  if (JSON.stringify(pkg) !== JSON.stringify(rederived)) {
    throw new TypeError('PREP receipt or source differs from independently re-derived source');
  }
}

/**
 * Local read-only preview; output never authorizes execution.
 * PREP package and raw source are not modified; no individual source values
 * or generated CSV are included.
 */
export function buildSelfPreviewFromPrep(source, pkg, options) {
  validateInputs(source, pkg, options);
  const base = {
    version: SELF_PREVIEW_GATE_VERSION,
    source_sha256: pkg.source.sha256,
    source_rows: pkg.source.source_rows,
    preprocessing_approval: 'NOT_GRANTED',
    owner_approval: 'NOT_GRANTED',
    execution: 'NOT_PERFORMED',
    outbound_transfer: false,
    source_modified: false
  };
  if (pkg.quality.review_rows > 0) {
    return {
      ...base, status: 'REVIEW_HOLD',
      reason: 'PREP_REVIEW_QUEUE_NOT_EMPTY',
      review_rows: pkg.quality.review_rows,
      eligible_rows: 0, summary: null
    };
  }
  const report = buildSalesReport(source, options.mapping, {period: options.period});
  if (report.summary.sourceRows !== pkg.source.source_rows) {
    throw new TypeError('PREP and SELF source row counts disagree');
  }
  if (report.summary.excludedRows !== 0) {
    return {
      ...base, status: 'REVIEW_HOLD',
      reason: 'SELF_REPORT_REVIEW_REQUIRED',
      review_rows: report.summary.excludedRows,
      eligible_rows: 0, summary: null
    };
  }
  return {
    ...base, status: 'READY_FOR_OWNER_REVIEW', reason: 'LOCAL_DRAFT_ONLY',
    review_rows: 0, eligible_rows: report.summary.includedRows,
    summary: {
      period: options.period,
      group_count: report.summary.groupCount,
      included_rows: report.summary.includedRows,
      positive_amount: report.summary.positiveAmount,
      negative_adjustment: report.summary.negativeAdjustment,
      net_amount: report.summary.netAmount
    }
  };
}
