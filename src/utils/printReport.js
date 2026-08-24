import { BRAND } from '../config/brand';
import { formatDate } from './dateUtils';
import { getReportFilterSummary, getReportNotes } from './reportFilters';
import logoUrl from '../assets/logo.png';

/** Keep each printed table short so Chrome paginates instead of clipping a giant layer. */
const ROWS_PER_TABLE = 50;

function esc(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function theadHtml() {
  return `<thead>
    <tr>
      <th>S.No</th>
      <th>Name</th>
      <th>Gender</th>
      <th>DOB</th>
      <th>Place</th>
      <th>Phone</th>
      <th>Reference</th>
      <th>Caste</th>
      <th>Notes</th>
    </tr>
  </thead>`;
}

function profileRowHtml(p, index) {
  const marital = p.maritalStatus && p.maritalStatus !== 'Unmarried'
    ? ` <span class="status-tag">- ${esc(p.maritalStatus)}</span>`
    : '';
  const phone = p.phone ? esc(String(p.phone).replace(/,/g, ' / ')) : '';
  const notes = esc(getReportNotes(p)).replace(/\n/g, '<br>');
  return `<tr>
    <td class="num">${index}</td>
    <td>${esc(p.fullName || '')}${marital}</td>
    <td>${esc(p.gender || '')}</td>
    <td>${esc(formatDate(p.dob))}</td>
    <td>${esc(p.location || '')}</td>
    <td>${phone}</td>
    <td>${esc(p.reference || '')}</td>
    <td>${esc(p.community || '')}</td>
    <td class="notes">${notes}</td>
  </tr>`;
}

function emptyRowHtml(groupName) {
  return `<tr class="empty-row">
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    <td class="empty-caste">${esc(groupName)}</td>
    <td></td>
  </tr>`;
}

function buildRowItems(groupedReports, appliedFilters) {
  const showBlankRows = appliedFilters?.showBlankRows ?? true;
  const blankRowCount = Number(appliedFilters?.blankRowCount) || 0;
  const isMasterList = appliedFilters?.isMasterList ?? false;
  const splitGender = appliedFilters?.splitGender ?? false;

  const items = [];
  let globalIdx = 1;

  Object.entries(groupedReports).forEach(([groupName, profilesArr], groupIndex) => {
    if (groupIndex > 0 && isMasterList && splitGender) {
      items.push({ type: 'pageBreak' });
    }
    if (isMasterList && splitGender) {
      items.push({ type: 'group', groupName });
    }

    profilesArr.forEach((p) => {
      items.push({ type: 'profile', profile: p, index: globalIdx++ });
    });

    if (!isMasterList && showBlankRows && blankRowCount > 0) {
      for (let i = 0; i < blankRowCount; i++) {
        items.push({ type: 'empty', groupName });
      }
    }

    if (!isMasterList) {
      items.push({ type: 'separator' });
    }
  });

  return items;
}

function itemToRowHtml(item) {
  if (item.type === 'group') {
    return `<tr class="group-row"><td colspan="9">— ${esc(item.groupName)} —</td></tr>`;
  }
  if (item.type === 'profile') {
    return profileRowHtml(item.profile, item.index);
  }
  if (item.type === 'empty') {
    return emptyRowHtml(item.groupName);
  }
  if (item.type === 'separator') {
    return `<tr class="print-separator"><td colspan="9"></td></tr>`;
  }
  return '';
}

function tablesHtml(items) {
  const chunks = [];
  let current = [];
  let pendingBreak = false;

  const flush = (pageBreak) => {
    if (!current.length) return;
    chunks.push({ rows: current, pageBreak });
    current = [];
  };

  items.forEach((item) => {
    if (item.type === 'pageBreak') {
      flush(pendingBreak);
      pendingBreak = true;
      return;
    }
    current.push(item);
    if (current.length >= ROWS_PER_TABLE) {
      flush(pendingBreak);
      pendingBreak = false;
    }
  });
  flush(pendingBreak);

  return chunks.map(({ rows, pageBreak }) => {
    const body = rows.map(itemToRowHtml).join('');
    return `<table class="${pageBreak ? 'page-break' : ''}">
      ${theadHtml()}
      <tbody>${body}</tbody>
    </table>`;
  }).join('\n');
}

/**
 * Print the filtered report in a standalone document.
 * Chrome clips long tables when ancestors use overflow/flex (the on-screen admin layout).
 */
export function printReport({ groupedReports, appliedFilters }) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Allow popups to print the report.');
    return;
  }

  const printLayout = appliedFilters?.printLayout ?? 'landscape';
  const isPortrait = printLayout === 'portrait';
  const summary = appliedFilters ? getReportFilterSummary(appliedFilters) : 'Report';
  const items = buildRowItems(groupedReports, appliedFilters);
  const tables = tablesHtml(items);
  const absLogo = new URL(logoUrl, window.location.href).href;
  const builtCount = items.filter((item) => item.type === 'profile').length;

  w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(BRAND.name)} Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      height: auto;
      overflow: visible;
      background: #fff;
      color: #2d1f18;
      font-family: 'DM Sans', system-ui, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 72px;
      font-weight: 700;
      color: #c5a059;
      opacity: 0.08;
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 0.04em;
    }
    .content { position: relative; z-index: 1; }
    .report-header {
      text-align: center;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 2px solid #c5a059;
    }
    .report-header img { height: 44px; width: auto; margin: 0 auto 6px; display: block; }
    .report-meta { font-size: 9pt; color: #6b5d50; margin: 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: ${isPortrait ? '8.5pt' : '10pt'};
      margin: 0 0 8px;
    }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    th, td {
      border: 1px solid #d4b87a;
      padding: ${isPortrait ? '4px 3px' : '8px 6px'};
      word-wrap: break-word;
      overflow-wrap: anywhere;
      vertical-align: top;
    }
    th {
      background-color: #f3ede4;
      font-weight: 700;
      color: #4a3728;
      text-transform: uppercase;
      border-color: #c5a059;
      text-align: left;
    }
    th:nth-child(1), td.num { width: 4%; text-align: center; }
    th:nth-child(2) { width: 18%; }
    th:nth-child(3) { width: 6%; }
    th:nth-child(4) { width: ${isPortrait ? '11%' : '9%'}; }
    th:nth-child(5) { width: ${isPortrait ? '14%' : '16%'}; }
    th:nth-child(6) { width: ${isPortrait ? '13%' : '12%'}; }
    th:nth-child(7) { width: ${isPortrait ? '12%' : '11%'}; }
    th:nth-child(8) { width: ${isPortrait ? '9%' : '8%'}; }
    th:nth-child(9) { width: ${isPortrait ? '13%' : '16%'}; }
    .status-tag { color: #dc2626; font-weight: 700; font-size: 11px; }
    .notes { white-space: pre-wrap; font-size: 0.92em; }
    .empty-row td { height: ${isPortrait ? '24px' : '32px'}; }
    .empty-caste { color: #6b5d50; font-size: 11px; font-style: italic; }
    .print-separator td {
      background: #000;
      height: 12px;
      padding: 0;
      border: none;
    }
    .group-row td {
      text-align: center;
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      background: #f3ede4;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.04em;
      padding: 10px 6px;
    }
    .page-break { break-before: page; page-break-before: always; }
    @page { size: A4 ${printLayout}; margin: 10mm; }
    @media print {
      html, body { height: auto !important; overflow: visible !important; background: #fff; }
    }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">${esc(BRAND.name)}</div>
  <div class="content">
    <div class="report-header">
      <img src="${absLogo}" alt="${esc(BRAND.name)}" />
      <p class="report-meta">${esc(summary)} · ${builtCount} records · ${esc(BRAND.domain)}</p>
    </div>
    ${tables}
  </div>
  <script>setTimeout(function() { window.focus(); window.print(); }, 600);</script>
</body>
</html>`);
  w.document.close();
}
