import { useState, useMemo } from 'react';
import { FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { downloadCSV } from '../../utils/csvUtils';
import { BRAND } from '../../config/brand';
import PageHeader from '../layout/PageHeader';

export default function ReportsView({ profiles }) {
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [exclusiveRange, setExclusiveRange] = useState(true);
  const [nriFilter, setNriFilter] = useState('No'); // 'No' = Non-NRI, 'Yes' = NRI
  const [isMasterList, setIsMasterList] = useState(false); // MASTER LIST TOGGLE
  const [splitGender, setSplitGender] = useState(false); // SEPARATE BOYS/GIRLS
  const [printLayout, setPrintLayout] = useState('landscape'); // 'landscape' | 'portrait'

  // NEW: BLANK ROWS CONTROLS
  const [showBlankRows, setShowBlankRows] = useState(true);
  const [blankRowCount, setBlankRowCount] = useState(5);
  const [isExporting, setIsExporting] = useState(false);

  const filteredReport = useMemo(() => {
    if (!isMasterList && (!startYear || !endYear)) return [];

    const s = parseInt(startYear);
    const e = parseInt(endYear);

    let result = profiles.filter(p => {
      // STRICT NRI FILTER
      if (nriFilter === 'Yes' && p.nri !== 'Yes') return false;
      if (nriFilter === 'No' && p.nri === 'Yes') return false;

      // IF MASTER LIST: Bypass DOB
      if (isMasterList) return true;

      // IF REGULAR LIST: Check years
      if (!p.dob) return false;
      const year = new Date(p.dob).getFullYear();
      if (exclusiveRange) {
        return year >= s && year < e;
      }
      return year >= s && year <= e;
    });

    if (isMasterList) {
        // MASTER LIST: Sort alphabetically
        result.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    } else {
        // REGULAR LIST: Sort by Caste first, then Gender
        result.sort((a, b) => {
            const cA = a.community || 'Z';
            const cB = b.community || 'Z';
            if (cA !== cB) return cA.localeCompare(cB);

            const gA = a.gender || 'Z';
            const gB = b.gender || 'Z';
            return gA.localeCompare(gB);
        });
    }

    return result;
  }, [profiles, startYear, endYear, exclusiveRange, nriFilter, isMasterList]);

  // Group data: Caste (Regular), Single Group (Master), or Split Genders (Master + Split)
  const groupedReports = useMemo(() => {
      if (isMasterList) {
          if (splitGender) {
              return {
                  'Boys (Male)': filteredReport.filter(p => p.gender === 'Male'),
                  'Girls (Female)': filteredReport.filter(p => p.gender === 'Female')
              };
          }
          return { 'Master List': filteredReport };
      }

      const groups = {};
      filteredReport.forEach(p => {
          const caste = p.community || 'Other';
          if (!groups[caste]) groups[caste] = [];
          groups[caste].push(p);
      });
      return groups;
  }, [filteredReport, isMasterList, splitGender]);

  const handlePrintTable = () => {
    window.print();
  };

  const handleExportReport = async () => {
    if (filteredReport.length === 0 || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));

    const headers = ['S.No', 'Name', 'Gender', 'DOB', 'Place', 'Phone', 'Reference', 'Caste', 'Notes'];
    const rows = [headers.join(',')];

    let globalIdx = 1;

    Object.entries(groupedReports).forEach(([groupName, profilesArr]) => {
        // If it's a split Master List, inject a header row into the CSV
        if (isMasterList && splitGender) {
            rows.push([`""`, `""`, `""`, `""`, `"${groupName.toUpperCase()} LIST"`, `""`, `""`, `""`, `""`].join(','));
        }

        profilesArr.forEach(p => {
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
                `""`
            ].join(','));
        });

        if (!isMasterList) {
            // ONLY ADD BLANK ROWS IF TOGGLE IS ON
            const count = Number(blankRowCount) || 0;
            if (showBlankRows && count > 0) {
                for(let i = 0; i < count; i++) {
                    rows.push([`""`, `""`, `""`, `""`, `""`, `""`, `""`, `"${groupName}"`, `""`].join(','));
                }
            }
            // Always keep the visual separator line to split the castes
            rows.push([`""`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`, `"---"`].join(','));
        }
    });

    const filename = `${BRAND.name}_${nriFilter==='Yes'?'NRI':'NonNRI'}_${isMasterList ? 'MasterList' : `${startYear}_${endYear}`}.csv`;
    downloadCSV(rows, filename);
    } finally {
      setIsExporting(false);
    }
  };

  let displayCounter = 1;

  return (
    <div className="print-bg-white">
      <style>{`
        @media print {
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
          th { background-color: #e5e7eb !important; font-weight: bold; color: #000 !important; text-transform: uppercase; }

          .nowrap { white-space: nowrap !important; }

          th:nth-child(1) { width: 4%; text-align: center; }
          th:nth-child(2) { width: ${printLayout === 'portrait' ? '18%' : '18%'}; }
          th:nth-child(3) { width: ${printLayout === 'portrait' ? '6%' : '6%'}; }
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

      <div className="max-w-6xl mx-auto print-container">
        <div className="no-print mb-6">
          <PageHeader title="Print & Reports" subtitle="Generate caste-wise lists, master lists, and printable documents">
            <button onClick={handleExportReport} disabled={filteredReport.length === 0 || isExporting} className="sw-btn-secondary px-4 py-2.5 text-sm disabled:opacity-50">
              {isExporting ? (
                <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Exporting...</span>
              ) : (
                <><FileSpreadsheet size={16} /> Export CSV</>
              )}
            </button>
            <button onClick={handlePrintTable} disabled={filteredReport.length === 0} className="sw-btn-primary px-4 py-2.5 text-sm disabled:opacity-50">
              <Printer size={16} /> Print
            </button>
          </PageHeader>
        </div>

        <div className="sw-card p-4 sm:p-5 mb-6 no-print">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:flex xl:flex-wrap gap-4 xl:items-end">
            <div>
              <label className="sw-label">List Type</label>
              <select className="sw-select w-full sm:w-32 font-medium text-brand-brown" value={nriFilter} onChange={e => setNriFilter(e.target.value)}>
                  <option value="No">Indian</option>
                  <option value="Yes">NRI Only</option>
              </select>
            </div>

            <div className="xl:border-l xl:pl-4">
              <label className="sw-label">From Year</label>
              <input
                  type="number"
                  disabled={isMasterList}
                  className={`sw-input w-full sm:w-24 ${isMasterList ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={startYear}
                  onChange={e => setStartYear(e.target.value)}
                  placeholder="1990"
              />
            </div>

            <div>
              <label className="sw-label">To Year</label>
              <input
                  type="number"
                  disabled={isMasterList}
                  className={`sw-input w-full sm:w-24 ${isMasterList ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={endYear}
                  onChange={e => setEndYear(e.target.value)}
                  placeholder="1995"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 xl:border-l xl:pl-4">
              <label className="sw-label">Print Layout</label>
              <div className="flex bg-brand-surface border border-brand-gold/20 rounded-lg p-1">
                <button
                    onClick={() => setPrintLayout('portrait')}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${printLayout === 'portrait' ? 'bg-brand-gold text-white shadow-sm' : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'}`}
                >
                    Portrait
                </button>
                <button
                    onClick={() => setPrintLayout('landscape')}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${printLayout === 'landscape' ? 'bg-brand-gold text-white shadow-sm' : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'}`}
                >
                    Landscape
                </button>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col justify-center gap-2 xl:px-4 xl:border-l">
                <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-brand-text">
                    <input
                        type="checkbox"
                        checked={isMasterList}
                        onChange={e => setIsMasterList(e.target.checked)}
                        className="w-4 h-4 rounded border-brand-gold/30 text-brand-gold focus:ring-brand-gold/30 accent-brand-gold cursor-pointer"
                    />
                    <span className="font-semibold">Master List</span>
                </label>

                <label className={`flex items-center gap-2.5 text-sm ${isMasterList ? 'cursor-pointer text-brand-text' : 'opacity-40 cursor-not-allowed text-brand-muted'}`}>
                    <input
                        type="checkbox"
                        disabled={!isMasterList}
                        checked={splitGender}
                        onChange={e => setSplitGender(e.target.checked)}
                        className="w-4 h-4 rounded border-brand-gold/30 text-brand-gold focus:ring-brand-gold/30 accent-brand-gold"
                    />
                    <span>Separate Boys/Girls</span>
                </label>
            </div>

            <div className={`col-span-2 sm:col-span-1 flex flex-col justify-center gap-2 xl:px-4 xl:border-l ${isMasterList ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-brand-text">
                    <input
                        type="checkbox"
                        disabled={isMasterList}
                        checked={showBlankRows}
                        onChange={e => setShowBlankRows(e.target.checked)}
                        className="w-4 h-4 rounded border-brand-gold/30 text-brand-gold focus:ring-brand-gold/30 accent-brand-gold"
                    />
                    <span className="font-semibold">Blank Notes Rows</span>
                </label>

                <div className="flex items-center gap-2 ml-6">
                    <span className="text-xs text-brand-muted font-medium">Lines per group</span>
                    <input
                        type="number"
                        disabled={isMasterList || !showBlankRows}
                        value={blankRowCount}
                        onChange={e => setBlankRowCount(e.target.value)}
                        className={`sw-input w-16 py-1.5 text-xs ${(!showBlankRows || isMasterList) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        min="0"
                        max="50"
                    />
                </div>
            </div>

            <div className="col-span-2 sm:col-span-3 lg:col-span-4 xl:flex-1 xl:text-right flex items-end justify-end pb-1">
              <p className="text-sm text-brand-muted">
                Found <span className="font-display font-bold text-brand-gold text-xl">{filteredReport.length}</span> records
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto sw-card p-0 print-table-wrapper">
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

            {Object.keys(groupedReports).length > 0 ? (
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
                                <span className="status-tag">
                                    - {p.maritalStatus}
                                </span>
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
                    <td colSpan="9" className="text-center py-12 text-brand-muted no-print">
                        <p className="font-display text-lg text-brand-text/80 mb-1">No report generated yet</p>
                        <p className="text-sm">Select a year range or enable Master List to preview records</p>
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
