import { useState, useEffect, useMemo } from 'react';
import { Search, Save, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { updateProfile } from '../../services/profileService';
import { RELIGIONS } from '../../constants/options';
import { profileMatchesSearch } from '../../utils/searchUtils';
import PageHeader from '../layout/PageHeader';

export default function BulkEditView({ profiles, loading = false }) {
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingRows, setSavingRows] = useState({});

  useEffect(() => { setLocalProfiles(profiles); }, [profiles]);

  const filtered = useMemo(() =>
    localProfiles.filter((p) => profileMatchesSearch(p, searchTerm)),
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
    if (savingRows[profile.id] === 'saving') return;
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
    <div>
      <PageHeader
        title="Bulk Edit"
        subtitle="Edit multiple profiles inline — changes save on blur or instantly for dropdowns"
        badge={`${filtered.length} profiles`}
      >
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search anything in profile..."
            className="sw-input pl-9 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          <p className="text-sm text-brand-muted">Loading profiles...</p>
        </div>
      ) : (
      <div className="sw-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-brand-surface text-brand-muted font-semibold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-brand-gold/15">
              <tr>
                <th className="px-4 py-3 w-14">Photo</th>
                <th className="px-4 py-3 min-w-[140px]">Name</th>
                <th className="px-4 py-3 w-28">Gender</th>
                <th className="px-4 py-3 w-24">NRI</th>
                <th className="px-4 py-3 w-32">DOB</th>
                <th className="px-4 py-3 w-28">Caste</th>
                <th className="px-4 py-3 min-w-[100px]">Reference</th>
                <th className="px-4 py-3 min-w-[110px]">Phone</th>
                <th className="px-4 py-3 w-16 text-center">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/10">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-brand-gold/5 transition-colors">
                  <td className="px-4 py-2">
                    <div className="w-10 h-10 bg-brand-surface rounded-lg overflow-hidden border border-brand-gold/10">
                      {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-auto mt-2.5 text-brand-gold/30" />}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" className="w-full px-2 py-1.5 border border-transparent hover:border-brand-gold/20 rounded-lg bg-transparent focus:bg-brand-bg focus:border-brand-gold outline-none font-medium text-brand-text" value={p.fullName || ''} onChange={(e) => handleChange(p.id, 'fullName', e.target.value)} onBlur={() => handleBlur(p.id)} />
                  </td>
                  <td className="px-4 py-2">
                    <select className="sw-select py-1.5 text-xs" value={p.gender || ''} onChange={(e) => handleChange(p.id, 'gender', e.target.value)}>
                      <option value="">—</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select className="sw-select py-1.5 text-xs" value={p.nri || ''} onChange={(e) => handleChange(p.id, 'nri', e.target.value)}>
                      <option value="">—</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input type="date" className="w-full px-2 py-1.5 border border-transparent hover:border-brand-gold/20 rounded-lg bg-transparent focus:bg-brand-bg outline-none text-xs" value={p.dob || ''} onChange={(e) => handleChange(p.id, 'dob', e.target.value)} onBlur={() => handleBlur(p.id)} />
                  </td>
                  <td className="px-4 py-2">
                    <select className="sw-select py-1.5 text-xs" value={p.community || ''} onChange={(e) => handleChange(p.id, 'community', e.target.value)}>
                      <option value="">—</option>
                      {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" className="w-full px-2 py-1.5 border border-transparent hover:border-brand-gold/20 rounded-lg bg-transparent focus:bg-brand-bg outline-none text-xs" value={p.reference || ''} onChange={(e) => handleChange(p.id, 'reference', e.target.value)} onBlur={() => handleBlur(p.id)} />
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" className="w-full px-2 py-1.5 border border-transparent hover:border-brand-gold/20 rounded-lg bg-transparent focus:bg-brand-bg outline-none text-xs" value={p.phone || ''} onChange={(e) => handleChange(p.id, 'phone', e.target.value)} onBlur={() => handleBlur(p.id)} />
                  </td>
                  <td className="px-4 py-2 text-center">
                    {savingRows[p.id] === 'saving' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-brand-gold mx-auto" />
                    ) : savingRows[p.id] === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-brand-gold mx-auto" />
                    ) : (
                      <button
                        onClick={() => handleSaveRow(p)}
                        disabled={savingRows[p.id] === 'saving'}
                        className="p-1.5 sw-btn-ghost disabled:opacity-40"
                        title="Save"
                      >
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
      )}
    </div>
  );
}
