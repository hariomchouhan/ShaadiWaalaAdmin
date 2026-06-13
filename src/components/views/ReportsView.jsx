import { useState, useMemo } from 'react';
import { ArrowLeft, FileSpreadsheet, Printer } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { downloadCSV } from '../../utils/csvUtils';
import { BRAND } from '../../config/brand';

export default function ReportsView({ profiles, onBack }) {
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

  const handleExportReport = () => {
    if (filteredReport.length === 0) return;

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
  };

  let displayCounter = 1;

  return (
    <div className="bg-white min-h-screen p-6 print-bg-white">
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
        <div className="flex items-center justify-between mb-6 no-print">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-brand-cream rounded-full">
              <ArrowLeft />
            </button>
            <h2 className="text-2xl font-display font-bold text-brand-dark">Print & Reports</h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportReport}
              disabled={filteredReport.length === 0}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-emerald-50 text-emerald-700 disabled:opacity-50 font-bold"
            >
              <FileSpreadsheet size={18} /> Download CSV
            </button>
            <button
              onClick={handlePrintTable}
              disabled={filteredReport.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 font-bold"
            >
              <Printer size={18} /> Print Document
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl mb-6 border no-print">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">List Type</label>
              <select
                  className="p-2 border rounded w-32 font-bold text-blue-800 bg-white"
                  value={nriFilter}
                  onChange={e => setNriFilter(e.target.value)}
              >
                  <option value="No">Indian</option>
                  <option value="Yes">NRI Only</option>
              </select>
            </div>

            <div className="border-l pl-4">
              <label className="block text-sm font-bold mb-1 text-gray-700">From</label>
              <input
                  type="number"
                  disabled={isMasterList}
                  className={`p-2 border rounded w-20 ${isMasterList ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                  value={startYear}
                  onChange={e => setStartYear(e.target.value)}
                  placeholder="1990"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">To</label>
              <input
                  type="number"
                  disabled={isMasterList}
                  className={`p-2 border rounded w-20 ${isMasterList ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                  value={endYear}
                  onChange={e => setEndYear(e.target.value)}
                  placeholder="1995"
              />
            </div>

            <div className="border-l pl-4">
              <label className="block text-sm font-bold mb-1 text-gray-700">Layout</label>
              <div className="flex bg-white border rounded p-1">
                <button
                    onClick={() => setPrintLayout('portrait')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${printLayout === 'portrait' ? 'bg-brand-cream text-brand-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Portrait
                </button>
                <button
                    onClick={() => setPrintLayout('landscape')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${printLayout === 'landscape' ? 'bg-brand-cream text-brand-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Landscape
                </button>
              </div>
            </div>

            {/* MASTER LIST CONTROLS */}
            <div className="flex flex-col justify-center gap-2 px-4 border-l">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isMasterList}
                        onChange={e => setIsMasterList(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                    />
                    <span className="text-purple-700 font-bold text-base">Master List</span>
                </label>

                <label className={`flex items-center gap-2 text-sm font-medium ${isMasterList ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                    <input
                        type="checkbox"
                        disabled={!isMasterList}
                        checked={splitGender}
                        onChange={e => setSplitGender(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-blue-800">Separate Boys/Girls</span>
                </label>
            </div>

            {/* NEW: BLANK ROWS CONTROLS */}
            <div className={`flex flex-col justify-center gap-2 px-4 border-l ${isMasterList ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                        type="checkbox"
                        disabled={isMasterList}
                        checked={showBlankRows}
                        onChange={e => setShowBlankRows(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-emerald-700 font-bold">Blank Notes Rows</span>
                </label>

                <div className="flex items-center gap-2 ml-6">
                    <span className="text-xs text-gray-500 font-bold">Lines per Group:</span>
                    <input
                        type="number"
                        disabled={isMasterList || !showBlankRows}
                        value={blankRowCount}
                        onChange={e => setBlankRowCount(e.target.value)}
                        className={`w-16 p-1 text-xs border rounded ${(!showBlankRows || isMasterList) ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                        min="0"
                        max="50"
                    />
                </div>
            </div>

            <div className="flex-1 text-right text-gray-500 text-sm pb-2">
              Found: <b className="text-gray-900 text-lg">{filteredReport.length}</b> records
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white print-table-wrapper">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase font-bold">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Place</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 bg-blue-50 text-blue-800">Caste</th>
                <th className="px-4 py-3 bg-yellow-50 text-yellow-800">Notes</th>
              </tr>
            </thead>

            {Object.keys(groupedReports).length > 0 ? (
                Object.entries(groupedReports).map(([groupName, profilesArr], groupIndex) => (
                  <tbody key={groupName} className={`divide-y border-t border-gray-200 ${groupIndex > 0 && isMasterList && splitGender ? 'page-break' : ''}`}>

                    {isMasterList && splitGender && (
                        <tr>
                            <td colSpan="9" className="text-center font-bold bg-blue-50 text-blue-900 uppercase text-lg py-2">
                                --- {groupName} ---
                            </td>
                        </tr>
                    )}

                    {profilesArr.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 font-bold text-gray-500 text-center">{displayCounter++}</td>
                        <td className="px-4 py-2 font-medium">
                            {p.fullName}
                            {p.maritalStatus && p.maritalStatus !== 'Unmarried' && (
                                <span className="status-tag">
                                    - {p.maritalStatus}
                                </span>
                            )}
                        </td>
                        <td className="px-4 py-2 text-xs">{p.gender}</td>
                        <td className="px-4 py-2">{formatDate(p.dob)}</td>
                        <td className="px-4 py-2">{p.location}</td>
                        <td className="px-4 py-2">{p.phone ? p.phone.replace(/,/g, ' / ') : ''}</td>
                        <td className="px-4 py-2 text-xs">{p.reference}</td>
                        <td className="px-4 py-2 font-bold text-blue-800 bg-blue-50/20">{p.community}</td>
                        <td className="px-4 py-2 bg-yellow-50/20"></td>
                      </tr>
                    ))}

                    {/* ONLY RENDER BLANK ROWS IF TOGGLED ON */}
                    {!isMasterList && showBlankRows && Number(blankRowCount) > 0 && [...Array(Number(blankRowCount))].map((_, i) => (
                        <tr key={`empty-${groupName}-${i}`} className="empty-row bg-gray-50/50">
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-gray-400 text-xs italic">{groupName}</td>
                            <td className="px-4 py-2"></td>
                        </tr>
                    ))}

                    {/* WE ALWAYS KEEP THE BLACK LINE SEPARATOR FOR CLEAN ORGANIZATION */}
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
                    <td colSpan="9" className="text-center py-8 text-gray-400 no-print">
                        Generate a report to see data
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
