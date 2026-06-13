import { useState } from 'react';
import { CheckCircle, XCircle, UploadCloud, Loader2 } from 'lucide-react';
import { parseCSV, downloadCSV } from '../../utils/csvUtils';
import PageHeader from '../layout/PageHeader';

export default function DuplicateCheckerView({ profiles, loading = false }) {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [selectedNameCol, setSelectedNameCol] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setIsReadingFile(true);
    setAnalysisResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const rows = parseCSV(evt.target.result);
        if (rows.length > 1) {
          setCsvHeaders(rows[0]);
          setCsvRows(rows.slice(1));
          const likelyName = rows[0].find((h) => h.toLowerCase().includes('name'));
          if (likelyName) setSelectedNameCol(likelyName);
        }
      } finally {
        setIsReadingFile(false);
      }
    };
    reader.onerror = () => setIsReadingFile(false);
    reader.readAsText(file);
  };

  const runCheck = async () => {
    if (!selectedNameCol || csvRows.length === 0 || isChecking) return;
    setIsChecking(true);
    await new Promise((r) => setTimeout(r, 50));
    const colIndex = csvHeaders.indexOf(selectedNameCol);
    if (colIndex === -1) { setIsChecking(false); return; }
    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const dbNameSet = new Set(profiles.map((p) => norm(p.fullName)));
    setAnalysisResult(csvRows.map((row) => {
      const rawName = row[colIndex];
      if (!rawName) return null;
      return { name: rawName, status: dbNameSet.has(norm(rawName)) ? 'Found' : 'Missing', details: row };
    }).filter(Boolean));
    setIsChecking(false);
  };

  const handleExportMissing = async () => {
    if (!analysisResult || isExporting) return;
    const missing = analysisResult.filter((r) => r.status === 'Missing');
    if (missing.length === 0) return alert('No missing records!');
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      downloadCSV(
        [csvHeaders.join(','), ...missing.map((m) => m.details.map((c) => `"${c}"`).join(','))],
        'missing_names.csv'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const foundCount = analysisResult?.filter((r) => r.status === 'Found').length ?? 0;
  const missingCount = analysisResult ? analysisResult.length - foundCount : 0;

  return (
    <div>
      <PageHeader
        title="Duplicate Checker"
        subtitle="Compare an external CSV against your portal database"
      />

      <div className="space-y-5">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-brand-muted sw-card p-4">
            <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
            Loading portal profiles...
          </div>
        )}

        <div className="sw-card p-5 sm:p-6 border-brand-gold/20 bg-brand-gold/5 relative">
          <h3 className="font-display font-bold text-brand-text mb-1">Step 1 — Upload CSV</h3>
          <p className="text-xs text-brand-muted mb-4">Excel export saved as .csv works perfectly</p>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/30 rounded-xl p-6 cursor-pointer hover:bg-brand-gold/5 transition-colors relative ${isReadingFile ? 'pointer-events-none opacity-70' : ''}`}>
            {isReadingFile ? (
              <>
                <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-2" />
                <span className="text-sm font-medium text-brand-text">Reading file...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-brand-gold mb-2" />
                <span className="text-sm font-medium text-brand-text">Choose CSV file</span>
              </>
            )}
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" disabled={isReadingFile} />
          </label>
        </div>

        {csvHeaders.length > 0 && (
          <div className="sw-card p-5 sm:p-6">
            <h3 className="font-display font-bold text-brand-text mb-4">Step 2 — Select name column</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select className="sw-select flex-1" value={selectedNameCol} onChange={(e) => setSelectedNameCol(e.target.value)}>
                <option value="">Select column...</option>
                {csvHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <button onClick={runCheck} disabled={isChecking || !selectedNameCol} className="sw-btn-primary px-6 py-2.5 text-sm shrink-0 disabled:opacity-50">
                {isChecking ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Checking...</span>
                ) : (
                  'Check Matches'
                )}
              </button>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="sw-card overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-gold/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface/50">
              <div className="flex flex-wrap gap-3">
                <span className="sw-badge">{analysisResult.length} total</span>
                <span className="sw-badge bg-green-50 text-green-700 border-green-200">{foundCount} found</span>
                <span className="sw-badge bg-red-50 text-red-600 border-red-200">{missingCount} missing</span>
              </div>
              <button onClick={handleExportMissing} disabled={isExporting} className="sw-btn-secondary text-sm py-2 px-4 disabled:opacity-50">
                {isExporting ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</span>
                ) : (
                  'Download Missing List'
                )}
              </button>
            </div>
            <div className="max-h-[480px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="bg-brand-surface sticky top-0 text-[10px] uppercase tracking-wider text-brand-muted font-semibold">
                  <tr>
                    <th className="px-5 py-3 text-left">Name in File</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gold/10">
                  {analysisResult.map((res, i) => (
                    <tr key={i} className={res.status === 'Found' ? 'bg-green-50/50' : 'bg-red-50/40'}>
                      <td className="px-5 py-3 text-brand-text">{res.name}</td>
                      <td className="px-5 py-3">
                        {res.status === 'Found' ? (
                          <span className="inline-flex items-center gap-1.5 text-green-700 font-medium text-sm"><CheckCircle size={15} /> In Portal</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-600 font-medium text-sm"><XCircle size={15} /> Missing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
