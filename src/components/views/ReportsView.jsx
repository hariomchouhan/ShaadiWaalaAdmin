import { useState, useMemo } from 'react';
import { FileSpreadsheet, Printer, Loader2, SlidersHorizontal } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { downloadCSV } from '../../utils/csvUtils';
import { BRAND } from '../../config/brand';
import PageHeader from '../layout/PageHeader';
import logoUrl from '../../assets/logo.png';
import ReportFilterDrawer from './ReportFilterDrawer';
import {
  DEFAULT_REPORT_FILTERS,
  buildReportData,
  getReportFilterSummary,
} from '../../utils/reportFilters';

export default function ReportsView({ profiles }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const { filteredReport, groupedReports } = useMemo(() => {
    if (!appliedFilters) return { filteredReport: [], groupedReports: {} };
    return buildReportData(profiles, appliedFilters);
  }, [profiles, appliedFilters]);

  const openDrawer = () => {
    setDraftFilters(appliedFilters ? { ...appliedFilters } : { ...DEFAULT_REPORT_FILTERS });
    setDrawerOpen(true);
  };

  const handleApply = () => {
    setAppliedFilters({ ...draftFilters });
    setDrawerOpen(false);
  };

  const handleClear = () => {
    setDraftFilters({ ...DEFAULT_REPORT_FILTERS });
  };

  const handlePrintTable = () => {
    window.print();
  };

  const handleExportReport = async () => {
    if (!appliedFilters || filteredReport.length === 0 || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));

      const { isMasterList, splitGender, showBlankRows, blankRowCount, nriFilter, startYear, endYear } = appliedFilters;
      const headers = ['S.No', 'Name', 'Gender', 'DOB', 'Place', 'Phone', 'Reference', 'Caste', 'Notes'];
      const rows = [headers.join(',')];
      let globalIdx = 1;

      Object.entries(groupedReports).forEach(([groupName, profilesArr]) => {
        if (isMasterList && splitGender) {
          rows.push([`""`, `""`, `""`, `""`, `"${groupName.toUpperCase()} LIST"`, `""`, `""`, `""`, `""`].join(','));
        }

        profilesArr.forEach((p) => {
          let displayName = p.fullName || '';
          if (p.maritalStatus && p.maritalStatus !== 'Unmarried') {
            displayName += ` - ${p.maritalStatus}`;
          }

          rows.push([
            globalIdx++,
            `"${displayName.replace(/"/g, '""')}"`,
            `"${p.gender || ''}"`,
            formatDate(p.dob) || '',
            `"${(p.location || '').replace(/"/g, '""')}"`,
            `"${(p.phone || '').replace(/,/g, ' / ').replace(/"/g, '""')}"`,
            `"${(p.reference || '').replace(/"/g, '""')}"`,
            `"${p.community || ''}"`,
            `""`,
          ].join(','));
        });

        if (!isMasterList) {
          const count = Number(blankRowCount) || 0;
          if (showBlankRows && count > 0) {
            for (let i = 0; i < count; i++) {
              rows.push([`""`, `""`, `""`, `""`, `""`, `""`, `""`, `"${groupName}"`, `""`].join(','));
            }
          }
          rows.push([`""`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`].join(','));
        }
      });

      const filename = `${BRAND.name}_${nriFilter === 'Yes' ? 'NRI' : 'NonNRI'}_${isMasterList ? 'MasterList' : `${startYear}_${endYear}`}.csv`;
      downloadCSV(rows, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const printLayout = appliedFilters?.printLayout ?? 'landscape';
  const showBlankRows = appliedFilters?.showBlankRows ?? true;
  const blankRowCount = appliedFilters?.blankRowCount ?? 5;
  const isMasterList = appliedFilters?.isMasterList ?? false;
  const splitGender = appliedFilters?.splitGender ?? false;

  let displayCounter = 1;
  const hasResults = appliedFilters && Object.keys(groupedReports).length > 0;

  return (
    <div className="print-bg-white relative">
      <div className="print-watermark hidden print:block" aria-hidden="true">ShaadiWaala</div>
      <style>{`
        @media print {
          .print-watermark {
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
            user-select: none;
            letter-spacing: 0.04em;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container { position: relative; z-index: 1; }
          @page { size: A4 ${printLayout}; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .no-print { display: none !important; }

          .print-bg-white { padding: 0 !important; background: white !important; }
          .print-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-table-wrapper { border: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; }

          table {
              width: 100%;
              border-collapse: collapse;
              font-size: ${printLayout === 'portrait' ? '8.5pt' : '10pt'};
              table-layout: fixed;
          }
          th, td {
              border: 1px solid #000 !important;
              padding: ${printLayout === 'portrait' ? '4px 3px' : '8px 6px'} !important;
              word-wrap: break-word !important;
              overflow-wrap: anywhere !important;
              word-break: break-word !important;
              overflow: hidden !important;
          }
          th { background-color: #f3ede4 !important; font-weight: bold; color: #4a3728 !important; text-transform: uppercase; border-color: #c5a059 !important; }
          td { border-color: #d4b87a !important; }
          .print-report-header {
              display: block !important;
              text-align: center;
              padding-bottom: 12px;
              margin-bottom: 12px;
              border-bottom: 2px solid #c5a059;
          }
          .print-report-header img { height: 44px; width: auto; margin: 0 auto 6px; }
          .print-report-meta { font-size: 9pt; color: #6b5d50; }

          th:nth-child(1) { width: 4%; text-align: center; }
          th:nth-child(2) { width: 18%; }
          th:nth-child(3) { width: 6%; }
          th:nth-child(4) { width: ${printLayout === 'portrait' ? '11%' : '9%'}; }
          th:nth-child(5) { width: ${printLayout === 'portrait' ? '14%' : '16%'}; }
          th:nth-child(6) { width: ${printLayout === 'portrait' ? '13%' : '12%'}; }
          th:nth-child(7) { width: ${printLayout === 'portrait' ? '12%' : '11%'}; }
          th:nth-child(8) { width: ${printLayout === 'portrait' ? '9%' : '8%'}; }
          th:nth-child(9) { width: ${printLayout === 'portrait' ? '13%' : '16%'}; }

          .print-separator td {
              background-color: #000 !important;
              height: 12px !important;
              padding: 0 !important;
              border: none !important;
          }
          .empty-row td { height: ${printLayout === 'portrait' ? '24px' : '32px'} !important; }
          .status-tag { color: #dc2626 !important; font-weight: bold; font-size: 11px; margin-left: 4px; }

          .page-break { break-before: page !important; page-break-before: always !important; }
        }
      `}</style>

      <ReportFilterDrawer
        open={drawerOpen}
        draft={draftFilters}
        setDraft={setDraftFilters}
        onApply={handleApply}
        onClose={() => setDrawerOpen(false)}
        onClear={handleClear}
      />

      <div className="max-w-6xl mx-auto print-container">
        <div className="no-print mb-6">
          <PageHeader title="Print & Reports" subtitle="Generate caste-wise lists, master lists, and printable documents">
            <button type="button" onClick={openDrawer} className="sw-btn-secondary px-4 py-2.5 text-sm">
              <SlidersHorizontal size={16} />
              {appliedFilters ? 'Edit Filters' : 'Filters'}
            </button>
            <button
              onClick={handleExportReport}
              disabled={!hasResults || isExporting}
              className="sw-btn-secondary px-4 py-2.5 text-sm disabled:opacity-50"
            >
              {isExporting ? (
                <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Exporting...</span>
              ) : (
                <><FileSpreadsheet size={16} /> Export CSV</>
              )}
            </button>
            <button
              onClick={handlePrintTable}
              disabled={!hasResults}
              className="sw-btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <Printer size={16} /> Print
            </button>
          </PageHeader>
        </div>

        {appliedFilters && (
          <div className="sw-card px-4 py-3 mb-4 no-print flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="sw-badge">{getReportFilterSummary(appliedFilters)}</span>
              <span className="text-brand-muted">
                <span className="font-display font-bold text-brand-gold">{filteredReport.length}</span> records
              </span>
            </div>
            <button type="button" onClick={openDrawer} className="text-xs font-medium text-brand-gold hover:underline">
              Change filters
            </button>
          </div>
        )}

        <div className="overflow-x-auto sw-card p-0 print-table-wrapper">
          <div className="hidden print:block print-report-header">
            <img src={logoUrl} alt={BRAND.name} />
            <p className="print-report-meta">
              {appliedFilters ? getReportFilterSummary(appliedFilters) : 'Report'} · {filteredReport.length} records · {BRAND.domain}
            </p>
          </div>
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-brand-brown-deep text-xs uppercase font-semibold text-brand-brown border-b border-brand-gold/15">
              <tr>
                <th className="px-3 sm:px-4 py-3">S.No</th>
                <th className="px-3 sm:px-4 py-3">Name</th>
                <th className="px-3 sm:px-4 py-3">Gender</th>
                <th className="px-3 sm:px-4 py-3">DOB</th>
                <th className="px-3 sm:px-4 py-3">Place</th>
                <th className="px-3 sm:px-4 py-3">Phone</th>
                <th className="px-3 sm:px-4 py-3">Reference</th>
                <th className="px-3 sm:px-4 py-3 bg-brand-gold/10 text-brand-brown">Caste</th>
                <th className="px-3 sm:px-4 py-3 bg-brand-gold/5 text-brand-brown">Notes</th>
              </tr>
            </thead>

            {hasResults ? (
              Object.entries(groupedReports).map(([groupName, profilesArr], groupIndex) => (
                <tbody key={groupName} className={`divide-y divide-brand-gold/10 ${groupIndex > 0 && isMasterList && splitGender ? 'page-break' : ''}`}>
                  {isMasterList && splitGender && (
                    <tr>
                      <td colSpan="9" className="text-center font-display font-bold bg-brand-gold/15 text-brand-brown uppercase text-base sm:text-lg py-3 tracking-wide">
                        — {groupName} —
                      </td>
                    </tr>
                  )}

                  {profilesArr.map((p) => (
                    <tr key={p.id} className="hover:bg-brand-surface/50 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 font-semibold text-brand-muted text-center">{displayCounter++}</td>
                      <td className="px-3 sm:px-4 py-2.5 font-medium text-brand-text">
                        {p.fullName}
                        {p.maritalStatus && p.maritalStatus !== 'Unmarried' && (
                          <span className="status-tag">- {p.maritalStatus}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-xs text-brand-muted">{p.gender}</td>
                      <td className="px-3 sm:px-4 py-2.5">{formatDate(p.dob)}</td>
                      <td className="px-3 sm:px-4 py-2.5">{p.location}</td>
                      <td className="px-3 sm:px-4 py-2.5">{p.phone ? p.phone.replace(/,/g, ' / ') : ''}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-xs text-brand-muted">{p.reference}</td>
                      <td className="px-3 sm:px-4 py-2.5 font-semibold text-brand-brown bg-brand-gold/5">{p.community}</td>
                      <td className="px-3 sm:px-4 py-2.5 bg-brand-surface/30"></td>
                    </tr>
                  ))}

                  {!isMasterList && showBlankRows && Number(blankRowCount) > 0 && [...Array(Number(blankRowCount))].map((_, i) => (
                    <tr key={`empty-${groupName}-${i}`} className="empty-row bg-brand-surface/40">
                      <td className="px-3 sm:px-4 py-2"></td>
                      <td className="px-3 sm:px-4 py-2"></td>
                      <td className="px-3 sm:px-4 py-2"></td>
                      <td className="px-3 sm:px-4 py-2"></td>
                      <td className="px-3 sm:px-4 py-2"></td>
                      <td className="px-3 sm:px-4 py-2"></td>
                      <td className="px-3 sm:px-4 py-2"></td>
                      <td className="px-3 sm:px-4 py-2 text-brand-muted/60 text-xs italic">{groupName}</td>
                      <td className="px-3 sm:px-4 py-2"></td>
                    </tr>
                  ))}

                  {!isMasterList && (
                    <tr className="print-separator">
                      <td colSpan="9"></td>
                    </tr>
                  )}
                </tbody>
              ))
            ) : (
              <tbody>
                <tr>
                  <td colSpan="9" className="text-center py-16 text-brand-muted no-print">
                    {!appliedFilters ? (
                      <>
                        <SlidersHorizontal className="w-10 h-10 text-brand-gold/40 mx-auto mb-3" />
                        <p className="font-display text-lg text-brand-text/80 mb-1">No report generated yet</p>
                        <p className="text-sm mb-4">Open filters, choose your options, and click Apply</p>
                        <button type="button" onClick={openDrawer} className="sw-btn-primary px-5 py-2.5 text-sm">
                          Open Filters
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-display text-lg text-brand-text/80 mb-1">No records found</p>
                        <p className="text-sm mb-4">Try different filters or year range</p>
                        <button type="button" onClick={openDrawer} className="sw-btn-secondary px-5 py-2.5 text-sm">
                          Edit Filters
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
