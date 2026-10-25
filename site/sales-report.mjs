// SMAX SELF - deterministic, local-only sales summary draft.
// Source columns are mapped explicitly; no source rows are silently discarded.
// This is NOT an accounting/tax return or a finalized sales ledger.
import { normalizeSpreadsheetCsv, CsvTransformError } from './csv-transform.mjs';

const REPORT_COLUMNS = Object.freeze(['기간', '판매채널', '집계행수', '양수금액합계(원)', '음수조정절댓값(원)', '순합계(원)']);
const REVIEW_COLUMNS = Object.freeze(['원본레코드', '거래일', '판매채널', '금액', '검토사유']);

function toSalesReportCsv(rows) {
  const cell = v => {
    const text = String(v);
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  };
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
function parseCents(amount) {
  if (!/^-?\d{1,12}(?:\.\d{1,2})?$/.test(amount)) return null;
  const negative = amount.startsWith('-');
  const [whole, fraction = ''] = (negative ? amount.slice(1) : amount).split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0') || '0');
  return negative ? -cents : cents;
}
function formatCents(cents) {
  const negative = cents < 0n;
  const value = negative ? -cents : cents;
  return (negative ? '-' : '') + String(value / 100n) + '.' + String(value % 100n).padStart(2, '0');
}

/**
 * Explicit mapping: {date:'원본 날짜 열',channel:'원본 채널 열',amount:'원본 금액 열'}.
 * period: 'daily' or 'monthly'. All rows that need review are preserved in reviewCsv
 * and excluded from preliminary totals; valid-looking rows still require human review.
 * Negative amounts are labeled "negative adjustments", never silently assumed refunds.
 */
export function buildSalesReport(source, mapping, {period} = {}) {
  if (period !== 'daily' && period !== 'monthly') {
    throw new CsvTransformError('집계 주기를 일별(daily) 또는 월별(monthly) 중 명시하세요.');
  }
  if (!mapping || typeof mapping !== 'object' ||
      ['date', 'channel', 'amount'].some(key => typeof mapping[key] !== 'string' || !mapping[key])) {
    throw new CsvTransformError('판매일·판매채널·판매금액의 원본 열 매핑을 확인하세요.');
  }
  const normalized = normalizeSpreadsheetCsv(source, {
    date: mapping.date, item: mapping.channel, amount: mapping.amount
  });
  const groups = new Map();
  const reviewRows = [];
  let includedRows = 0;
  let positive = 0n, negativeAdjustments = 0n;
  for (const row of normalized.rows) {
    const [date, channel, amount, sourceRecord, state, flags] = row;
    const cents = state === 'READY_FOR_HUMAN_REVIEW' ? parseCents(amount) : null;
    if (cents === null) {
      const reason = [flags, state === 'READY_FOR_HUMAN_REVIEW' ? 'AMOUNT_EXCEEDS_REPORT_LIMIT' : ''].filter(Boolean).join('|');
      reviewRows.push([sourceRecord, date, channel, amount, reason]);
      continue;
    }
    const bucket = period === 'monthly' ? date.slice(0, 7) : date;
    const key = JSON.stringify([bucket, channel]);
    if (!groups.has(key)) groups.set(key, {period: bucket, channel, count: 0, positiveCents: 0n, negativeCents: 0n});
    const group = groups.get(key);
    group.count++;
    includedRows++;
    if (cents < 0n) {group.negativeCents += -cents;negativeAdjustments += -cents;}
    else {group.positiveCents += cents;positive += cents;}
  }
  const summaries = [...groups.values()].sort((a, b) => a.period.localeCompare(b.period) || a.channel.localeCompare(b.channel, 'ko')).map(g => ({
    period: g.period, channel: g.channel, rows: g.count,
    positiveAmount: formatCents(g.positiveCents), negativeAdjustment: formatCents(g.negativeCents),
    netAmount: formatCents(g.positiveCents - g.negativeCents)
  }));
  return {
    state: 'REQUIRES_HUMAN_REVIEW', period,
    summary: {
      sourceRows: normalized.summary.inputRows, includedRows, excludedRows: reviewRows.length,
      groupCount: summaries.length, positiveAmount: formatCents(positive),
      negativeAdjustment: formatCents(negativeAdjustments), netAmount: formatCents(positive - negativeAdjustments)
    },
    groups: summaries, excluded: reviewRows.map(row => ({sourceRecord: row[0], reason: row[4]})),
    reportCsv: toSalesReportCsv([REPORT_COLUMNS, ...summaries.map(g => [g.period, g.channel, String(g.rows), g.positiveAmount, g.negativeAdjustment, g.netAmount])]),
    reviewCsv: toSalesReportCsv([REVIEW_COLUMNS, ...reviewRows])
  };
}
