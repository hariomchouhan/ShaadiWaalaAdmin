import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { parseCSV, downloadCSV } from '../../utils/csvUtils';

export default function DuplicateCheckerView({ profiles, onBack }) {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [selectedNameCol, setSelectedNameCol] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const rows = parseCSV(evt.target.result);
      if (rows.length > 1) {
        setCsvHeaders(rows[0]);
        setCsvRows(rows.slice(1));
        const likelyName = rows[0].find((h) => h.toLowerCase().includes('name'));
        if (likelyName) setSelectedNameCol(likelyName);
      }
    };
    reader.readAsText(file);
  };

  const runCheck = () => {
    if (!selectedNameCol || csvRows.length === 0) return;
    const colIndex = csvHeaders.indexOf(selectedNameCol);
    if (colIndex === -1) return;
    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const dbNameSet = new Set(profiles.map((p) => norm(p.fullName)));
    const results = csvRows.map((row) => {
      const rawName = row[colIndex];
      if (!rawName) return null;
      const isFound = dbNameSet.has(norm(rawName));
      return { name: rawName, status: isFound ? 'Found' : 'Missing', details: row };
    }).filter(Boolean);
    setAnalysisResult(results);
  };

  const handleExportMissing = () => {
    if (!analysisResult) return;
    const missing = analysisResult.filter((r) => r.status === 'Missing');
    if (missing.length === 0) return alert('No missing records!');
    downloadCSV(
      [csvHeaders.join(','), ...missing.map((m) => m.details.map((c) => `"${c}"`).join(','))],
      'missing_names.csv'
    );
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-brand-cream rounded-full"><ArrowLeft /></button>
          <h2 className="text-2xl font-display font-bold text-brand-dark">Duplicate Checker</h2>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">Step 1: Upload your Excel/CSV</h3>
          <input type="file" accept=".csv" onChange={handleFile} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
        </div>

        {csvHeaders.length > 0 && (
          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Step 2: Which column has names?</h3>
            <div className="flex gap-3">
              <select className="p-2 border rounded-lg flex-1" value={selectedNameCol} onChange={(e) => setSelectedNameCol(e.target.value)}>
                <option value="">Select Column...</option>
                {csvHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <button onClick={runCheck} className="sw-btn-primary px-6 py-2">Check Matches</button>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold">Results ({analysisResult.length})</h3>
              <button onClick={handleExportMissing} className="text-sm bg-brand-cream text-brand-primary px-3 py-1 rounded font-medium hover:bg-brand-primary/10">
                Download &quot;Missing&quot; List
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">Name in File</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analysisResult.map((res, i) => (
                    <tr key={i} className={res.status === 'Found' ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="px-4 py-2">{res.name}</td>
                      <td className="px-4 py-2 font-bold">
                        {res.status === 'Found' ? (
                          <span className="text-green-700 flex items-center gap-1"><CheckCircle size={14} /> Found in Portal</span>
                        ) : (
                          <span className="text-red-700 flex items-center gap-1"><XCircle size={14} /> Missing</span>
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
