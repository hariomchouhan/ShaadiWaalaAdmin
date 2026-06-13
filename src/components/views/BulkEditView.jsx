import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Search, Save, Loader2, CheckCircle, Image as ImageIcon,
} from 'lucide-react';
import { updateProfile } from '../../services/profileService';
import { RELIGIONS } from '../../constants/options';

export default function BulkEditView({ profiles, onBack }) {
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingRows, setSavingRows] = useState({});

  useEffect(() => { setLocalProfiles(profiles); }, [profiles]);

  const filtered = useMemo(() =>
    localProfiles.filter((p) => (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())),
  [localProfiles, searchTerm]);

  const handleChange = (id, field, value) => {
    setLocalProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    if (field === 'gender' || field === 'community' || field === 'nri') {
      const p = localProfiles.find((x) => x.id === id);
      if (p) handleSaveRow({ ...p, [field]: value });
    }
  };

  const handleBlur = (profileId) => {
    const p = localProfiles.find((x) => x.id === profileId);
    if (p) handleSaveRow(p);
  };

  const handleSaveRow = async (profile) => {
    setSavingRows((prev) => ({ ...prev, [profile.id]: 'saving' }));
    try {
      const { id, ...data } = profile;
      await updateProfile(id, data);
      setSavingRows((prev) => ({ ...prev, [profile.id]: 'success' }));
      setTimeout(() => setSavingRows((prev) => ({ ...prev, [profile.id]: null })), 2000);
    } catch (e) {
      console.error(e);
      alert('Save failed for ' + profile.fullName);
      setSavingRows((prev) => ({ ...prev, [profile.id]: null }));
    }
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-brand-cream rounded-full"><ArrowLeft /></button>
          <h2 className="text-2xl font-display font-bold text-brand-dark">Universal Edit (Bulk)</h2>
          <div className="flex-1 max-w-sm ml-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="pl-9 p-2 border rounded-lg w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-brand-cream text-gray-700 font-bold uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-16">Img</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 w-28 bg-blue-50 border-x border-blue-100 text-blue-800">Gender</th>
                <th className="px-4 py-3 w-24 bg-purple-50 border-x border-purple-100 text-purple-800">NRI</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Caste</th>
                <th className="px-4 py-3 bg-yellow-50/50 border-x border-yellow-100">Reference</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-brand-cream/50 group">
                  <td className="px-4 py-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border">
                      {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-auto mt-2.5 text-gray-300" />}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="w-full p-1 border border-transparent hover:border-gray-300 rounded bg-transparent focus:bg-white focus:border-brand-primary outline-none transition-all font-medium"
                      value={p.fullName || ''}
                      onChange={(e) => handleChange(p.id, 'fullName', e.target.value)}
                      onBlur={() => handleBlur(p.id)}
                    />
                  </td>
                  <td className="px-4 py-2 bg-blue-50/30 border-x border-blue-50">
                    <select
                      className="w-full p-1.5 border border-blue-200 rounded bg-white text-blue-900 font-bold cursor-pointer outline-none"
                      value={p.gender || ''}
                      onChange={(e) => handleChange(p.id, 'gender', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 bg-purple-50/30 border-x border-purple-50">
                    <select
                      className="w-full p-1.5 border border-purple-200 rounded bg-white text-purple-900 font-bold cursor-pointer outline-none"
                      value={p.nri || ''}
                      onChange={(e) => handleChange(p.id, 'nri', e.target.value)}
                    >
                      <option value="">-</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input type="date" className="w-full p-1 border border-transparent hover:border-gray-300 rounded bg-transparent focus:bg-white outline-none text-xs text-gray-500" value={p.dob || ''} onChange={(e) => handleChange(p.id, 'dob', e.target.value)} onBlur={() => handleBlur(p.id)} />
                  </td>
                  <td className="px-4 py-2">
                    <select className="w-full p-1 border border-transparent hover:border-gray-300 rounded bg-transparent focus:bg-white outline-none text-xs" value={p.community || ''} onChange={(e) => handleChange(p.id, 'community', e.target.value)}>
                      <option value="">Select</option>
                      {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 bg-yellow-50/20 border-x border-yellow-50">
                    <input type="text" placeholder="Ref..." className="w-full p-1 border border-transparent hover:border-gray-300 rounded bg-transparent focus:bg-white outline-none text-xs text-gray-600 font-bold" value={p.reference || ''} onChange={(e) => handleChange(p.id, 'reference', e.target.value)} onBlur={() => handleBlur(p.id)} />
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" className="w-full p-1 border border-transparent hover:border-gray-300 rounded bg-transparent focus:bg-white outline-none text-xs" value={p.phone || ''} onChange={(e) => handleChange(p.id, 'phone', e.target.value)} onBlur={() => handleBlur(p.id)} />
                  </td>
                  <td className="px-4 py-2 text-center">
                    {savingRows[p.id] === 'saving' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-brand-primary mx-auto" />
                    ) : savingRows[p.id] === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <button onClick={() => handleSaveRow(p)} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-cream rounded transition-colors" title="Save Row">
                        <Save className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
