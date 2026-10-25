// SMAX SELF — deterministic, offline CSV standardization (no network or file writes).
// Call only after a person selects the exact three source columns. Never silently discard rows.

export const SPREADSHEET_OUTPUT_COLUMNS = Object.freeze([
  '거래일', '상품명', '금액', '원본레코드', '검토상태', '검토사유'
]);

export class CsvTransformError extends Error {
  constructor(message) { super(message); this.name = 'CsvTransformError'; }
}

function parseRecords(source) {
  if (typeof source !== 'string' || !source.replace(/^\uFEFF/, '').length) {
    throw new CsvTransformError('CSV 입력이 비어 있습니다.');
  }
  const text = source.replace(/^\uFEFF/, '');
  if (new TextEncoder().encode(text).length > 2 * 1024 * 1024) {
    throw new CsvTransformError('CSV는 2MB 이하만 지원합니다.');
  }
  const records = [];
  let row = [], cell = '', quoted = false, afterQuote = false;
  const pushCell = () => { row.push(cell); cell = ''; afterQuote = false; };
  const pushRow = () => { pushCell(); records.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { quoted = false; afterQuote = true; }
      else { cell += ch; }
    } else if (ch === ',') {
      pushCell();
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      pushRow();
    } else if (ch === '"') {
      if (afterQuote || cell.length) throw new CsvTransformError('잘못된 CSV 따옴표 형식입니다.');
      quoted = true;
    } else {
      if (afterQuote) throw new CsvTransformError('닫힌 따옴표 뒤에 허용되지 않은 문자가 있습니다.');
      cell += ch;
    }
  }
  if (quoted) throw new CsvTransformError('따옴표가 닫히지 않은 CSV입니다.');
  const endedWithNewline = /[\r\n]$/.test(text);
  if (!endedWithNewline || row.length || cell.length || afterQuote) pushRow();
  const headers = (records.shift() ?? []).map(v => v.trim());
  if (!headers.length || headers.some(v => !v)) throw new CsvTransformError('빈 CSV 열 이름이 있습니다.');
  if (new Set(headers.map(v => v.toLocaleLowerCase('ko-KR'))).size !== headers.length) {
    throw new CsvTransformError('중복된 CSV 열 이름이 있습니다.');
  }
  for (let i = 0; i < records.length; i++) {
    if (records[i].length !== headers.length) {
      throw new CsvTransformError(`${i + 2}번째 CSV 레코드의 열 개수가 헤더와 다릅니다.`);
    }
  }
  return { headers, records };
}

function dateISO(value) {
  const valueTrimmed = value.trim();
  let m = /^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})$/.exec(valueTrimmed);
  let parts = m ? [m[1], m[3], m[4]] : null;
  if (!parts) { m = /^(\d{4})(\d{2})(\d{2})$/.exec(valueTrimmed); parts = m?.slice(1) ?? null; }
  if (!parts) return null;
  const [y, mo, d] = parts.map(Number);
  const days = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (mo < 1 || mo > 12 || d < 1 || d > days[mo - 1]) return null;
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function normalizeAmount(value) {
  const raw = value.trim().replace(/^₩\s*/, '').replace(/\s*원$/, '').trim();
  if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(raw)) return null;
  return raw.replace(/,/g, '');
}

function excelSafe(value) {
  const s = String(value);
  // CSV quotes do not stop spreadsheet formula evaluation; prepend an apostrophe.
  return /^[\s\u0000-\u001F]*[=+@-]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s) ? `'${s}` : s;
}

function csvCell(value) {
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) { return `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}\r\n`; }

/**
 * Convert an explicitly mapped CSV to six standardized columns, preserving every record.
 * mapping = { date: '원본 날짜 열', item: '원본 상품 열', amount: '원본 금액 열' }
 * Rows requiring review are included (not auto-deleted or auto-corrected).
 * Returns { csv, rows, summary, state, mapping }; customer data stays in caller memory.
 */
export function normalizeSpreadsheetCsv(source, mapping) {
  const { headers, records } = parseRecords(source);
  if (!records.length) throw new CsvTransformError('헤더만 있고 처리할 데이터가 없습니다.');
  if (!mapping || typeof mapping !== 'object') throw new CsvTransformError('먼저 원본 열 매핑을 확인하세요.');
  const keys = ['date', 'item', 'amount'];
  const columns = keys.map(k => {
    const name = mapping[k];
    if (typeof name !== 'string' || !name || !headers.includes(name)) {
      throw new CsvTransformError(`필수 매핑 ${k}의 원본 열을 확인하세요.`);
    }
    return headers.indexOf(name);
  });
  if (new Set(columns).size !== columns.length) throw new CsvTransformError('서로 다른 표준 필드에 같은 원본 열을 지정할 수 없습니다.');

  const seen = new Set();
  const counts = { inputRows: records.length, outputRows: 0, reviewRows: 0, duplicateRows: 0, invalidDateRows: 0, invalidAmountRows: 0, missingRows: 0, formulaProtectedRows: 0 };
  const rows = records.map((record, i) => {
    const dateRaw = record[columns[0]].trim();
    const itemRaw = record[columns[1]].trim();
    const amountRaw = record[columns[2]].trim();
    const flags = [];
    const date = dateRaw ? dateISO(dateRaw) : null;
    const amount = amountRaw ? normalizeAmount(amountRaw) : null;
    if (!dateRaw || !itemRaw || !amountRaw) { flags.push('MISSING_REQUIRED'); counts.missingRows++; }
    if (dateRaw && !date) { flags.push('INVALID_DATE'); counts.invalidDateRows++; }
    if (amountRaw && amount === null) { flags.push('INVALID_AMOUNT'); counts.invalidAmountRows++; }
    const rawValues = [date ?? dateRaw, itemRaw, amount ?? amountRaw];
    const duplicateKey = JSON.stringify(rawValues);
    if (seen.has(duplicateKey)) { flags.push('DUPLICATE'); counts.duplicateRows++; }
    seen.add(duplicateKey);
    const safeValues = rawValues.map(excelSafe);
    if (safeValues.some((v, index) => v !== rawValues[index])) { flags.push('FORMULA_PROTECTED'); counts.formulaProtectedRows++; }
    if (flags.length) counts.reviewRows++;
    return [...safeValues, String(i + 2), flags.length ? 'NEEDS_REVIEW' : 'READY_FOR_HUMAN_REVIEW', flags.join('|')];
  });
  counts.outputRows = rows.length;
  return {
    csv: toCsv([SPREADSHEET_OUTPUT_COLUMNS, ...rows]),
    rows,
    summary: counts,
    state: counts.reviewRows ? 'NEEDS_REVIEW' : 'READY_FOR_HUMAN_REVIEW',
    mapping: { date: mapping.date, item: mapping.item, amount: mapping.amount }
  };
}
