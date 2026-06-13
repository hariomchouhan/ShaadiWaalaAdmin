import { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import LoginScreen from './components/auth/LoginScreen';
import Header from './components/layout/Header';
import Notification from './components/common/Notification';
import ProfileCard from './components/profiles/ProfileCard';
import ProfileFilters from './components/profiles/ProfileFilters';
import ProfileFormModal from './components/profiles/ProfileFormModal';
import ProfileViewModal from './components/profiles/ProfileViewModal';
import AIModal from './components/modals/AIModal';
import DeleteConfirmModal from './components/modals/DeleteConfirmModal';
import ImportConfirmModal from './components/modals/ImportConfirmModal';
import BulkEditView from './components/views/BulkEditView';
import DuplicateCheckerView from './components/views/DuplicateCheckerView';
import ReportsView from './components/views/ReportsView';

import { useAuth } from './hooks/useAuth';
import { useNotification } from './hooks/useNotification';
import { useProfiles } from './hooks/useProfiles';
import { isFirebaseConfigured } from './config/firebase';
import { PROFILE_SCHEMA } from './constants/profileSchema';
import { getAgeNumber } from './utils/dateUtils';
import { compressImage } from './utils/imageUtils';
import { parseCSV, downloadCSV } from './utils/csvUtils';
import { printBiodata } from './utils/printBiodata';
import {
  createProfile, updateProfile, deleteProfile, deleteAllProfiles, batchImportProfiles,
} from './services/profileService';
import { uploadProfilePhotoFromBase64 } from './services/storageService';
import { extractProfileFromText } from './services/aiService';

export default function App() {
  const { isAuthenticated, authLoading, login, logout } = useAuth();
  const { notification, showNotification } = useNotification();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const { profiles, loading, isLoadingMore, hasMore, refresh } = useProfiles(isAuthenticated, searchTerm);

  const [activeFilters, setActiveFilters] = useState({ gender: '', minAge: '', maxAge: '', community: '' });
  const [showFilters, setShowFilters] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [importConfirmation, setImportConfirmation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [aiInputText, setAiInputText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('Basic Details');

  const fileInputRef = useRef(null);
  const galleryRef = useRef(null);

  const filteredProfiles = useMemo(() =>
    profiles.filter((p) => {
      if (activeFilters.gender && p.gender !== activeFilters.gender) return false;
      if (activeFilters.community && !p.community?.toLowerCase().includes(activeFilters.community.toLowerCase())) return false;
      const age = getAgeNumber(p.dob);
      if (activeFilters.minAge && (age === null || age < parseInt(activeFilters.minAge))) return false;
      if (activeFilters.maxAge && (age === null || age > parseInt(activeFilters.maxAge))) return false;
      return true;
    }),
  [profiles, activeFilters]);

  const getNextRefId = () => {
    let maxId = 0;
    profiles.forEach((p) => {
      const id = parseInt(p.refId, 10);
      if (!isNaN(id) && id > maxId) maxId = id;
    });
    return maxId + 1;
  };

  useEffect(() => {
    if (!isEditModalOpen) return;
    const handleGlobalPaste = async (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            showNotification('Uploading pasted image...', 'info');
            try {
              const b64 = await compressImage(file);
              const fileName = `pasted_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
              const url = await uploadProfilePhotoFromBase64(b64, fileName);
              setFormData((prev) => {
                const isGalleryFocused = document.activeElement === galleryRef.current;
                if (isGalleryFocused || prev.avatar) {
                  showNotification('Added to Extra Photos!');
                  return { ...prev, gallery: [...(prev.gallery || []), url] };
                }
                showNotification('Main Photo Updated!');
                return { ...prev, avatar: url };
              });
            } catch (err) {
              console.error(err);
              showNotification('Paste upload failed', 'error');
            }
            return;
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isEditModalOpen, showNotification]);

  const handleAIExtraction = async () => {
    setIsProcessingAI(true);
    try {
      const cleaned = await extractProfileFromText(aiInputText);
      setFormData({ refId: getNextRefId(), ...cleaned });
      setIsAIModalOpen(false);
      setCurrentProfile(null);
      setIsEditModalOpen(true);
      showNotification('Data extracted successfully!');
    } catch (e) {
      showNotification('Extraction failed: ' + e.message, 'error');
    }
    setIsProcessingAI(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured) return showNotification('Firebase not configured', 'error');
    try {
      if (currentProfile) {
        await updateProfile(currentProfile.id, formData);
        showNotification('Updated!');
      } else {
        await createProfile(formData);
        showNotification('Created!');
      }
      setIsEditModalOpen(false);
      refresh();
    } catch (err) {
      console.error(err);
      showNotification('Save failed', 'error');
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget === 'ALL') {
        await deleteAllProfiles();
        showNotification('All profiles deleted permanently.', 'error');
      } else {
        await deleteProfile(deleteTarget);
        showNotification('Profile deleted.');
      }
      setDeleteTarget(null);
      setIsViewModalOpen(false);
      refresh();
    } catch (e) {
      console.error(e);
      showNotification('Delete failed', 'error');
    }
  };

  const handleManualUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showNotification('Uploading...', 'success');
    try {
      const b64 = await compressImage(file);
      const url = await uploadProfilePhotoFromBase64(b64, `avatar_${Date.now()}.jpg`);
      setFormData((prev) => ({ ...prev, avatar: url }));
      showNotification('Main Photo Updated!');
    } catch (err) {
      console.error(err);
      showNotification('Upload failed', 'error');
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    showNotification(`Uploading ${files.length} photos...`, 'success');
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const b64 = await compressImage(file);
        const url = await uploadProfilePhotoFromBase64(b64, `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
        uploadedUrls.push(url);
      }
      setFormData((prev) => ({ ...prev, gallery: [...(prev.gallery || []), ...uploadedUrls] }));
      showNotification(`${files.length} photos added!`);
    } catch (err) {
      console.error(err);
      showNotification('Gallery upload failed', 'error');
    }
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) { setImportConfirmation({ file: f }); e.target.value = null; }
  };

  const executeImport = async () => {
    if (!importConfirmation?.file) return;
    const file = importConfirmation.file;
    setImportConfirmation(null);
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const rows = parseCSV(ev.target.result);
        if (rows.length < 2) throw new Error('File empty');
        const headers = rows[0].map((h) => h.toLowerCase().trim());
        const map = {};
        PROFILE_SCHEMA.forEach((f) => {
          if (f.csvHeader) {
            const idx = headers.findIndex((h) => h === f.csvHeader.toLowerCase());
            if (idx !== -1) map[f.key] = idx;
          }
        });

        let currentMaxId = 0;
        profiles.forEach((p) => {
          const id = parseInt(p.refId, 10);
          if (!isNaN(id) && id > currentMaxId) currentMaxId = id;
        });

        const toImport = [];
        for (const rowData of rows.slice(1)) {
          if (rowData.length < 2 && !rowData[0]) continue;
          const d = { refId: ++currentMaxId };
          let hasData = false;
          Object.keys(map).forEach((key) => {
            const idx = map[key];
            if (rowData[idx]) { d[key] = rowData[idx]; hasData = true; }
          });
          if (hasData) toImport.push(d);
        }

        const count = await batchImportProfiles(toImport);
        showNotification(`Success! ${count} imported.`);
        refresh();
      } catch (err) {
        console.error(err);
        showNotification('Import failed.', 'error');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (profiles.length === 0) return;
    const headers = PROFILE_SCHEMA.map((f) => f.csvHeader || f.label);
    const keys = PROFILE_SCHEMA.map((f) => f.key);
    downloadCSV(
      [headers.join(','), ...profiles.map((row) => keys.map((k) => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))],
      'shaadiwaala_data.csv'
    );
  };

  const openAddProfile = () => {
    setFormData({ refId: getNextRefId() });
    setCurrentProfile(null);
    setIsEditModalOpen(true);
  };

  const openEditProfile = (profile) => {
    setFormData({ ...profile });
    setCurrentProfile(profile);
    setIsEditModalOpen(true);
  };

  const openViewProfile = (profile) => {
    setCurrentProfile(profile);
    setIsViewModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4">
        <div className="bg-brand-bg rounded-sm card-shadow p-8 max-w-md text-center border border-brand-gold/15">
          <h2 className="text-xl font-display font-bold text-brand-text mb-2">Firebase Not Configured</h2>
          <p className="text-gray-600 text-sm mb-4">
            Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to <code className="bg-gray-100 px-1 rounded">.env</code> and add your Firebase credentials.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginScreen onLogin={login} />;

  if (activeView === 'reports') return <ReportsView profiles={profiles} onBack={() => setActiveView('dashboard')} />;
  if (activeView === 'matcher') return <DuplicateCheckerView profiles={profiles} onBack={() => setActiveView('dashboard')} />;
  if (activeView === 'bulk-edit') return <BulkEditView profiles={profiles} onBack={() => setActiveView('dashboard')} />;

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text font-sans">
      <Notification notification={notification} />

      <Header
        onNavigate={setActiveView}
        onDeleteAll={() => setDeleteTarget('ALL')}
        onOpenAI={() => setIsAIModalOpen(true)}
        onExport={handleExportCSV}
        onImportClick={() => fileInputRef.current?.click()}
        onAdd={openAddProfile}
        onLogout={logout}
        isImporting={isImporting}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProfileFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          onClearFilters={() => setActiveFilters({ gender: '', minAge: '', maxAge: '', community: '' })}
        />

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-gold" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProfiles.map((p) => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  onView={openViewProfile}
                  onEdit={openEditProfile}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            {isLoadingMore && (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                <span className="text-xs text-gray-400">Loading next 50...</span>
              </div>
            )}

            {!hasMore && !loading && filteredProfiles.length > 0 && (
              <div className="text-center py-6 text-gray-400 text-xs">All profiles loaded</div>
            )}
          </>
        )}
      </main>

      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        aiInputText={aiInputText}
        setAiInputText={setAiInputText}
        onExtract={handleAIExtraction}
        isProcessing={isProcessingAI}
      />

      <ProfileFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        currentProfile={currentProfile}
        onManualUpload={handleManualUpload}
        onGalleryUpload={handleGalleryUpload}
        onRemoveGalleryImage={removeGalleryImage}
        galleryRef={galleryRef}
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
      />

      {isViewModalOpen && currentProfile && (
        <ProfileViewModal
          profile={currentProfile}
          onClose={() => setIsViewModalOpen(false)}
          onPrint={() => printBiodata(currentProfile)}
        />
      )}

      {importConfirmation && (
        <ImportConfirmModal onCancel={() => setImportConfirmation(null)} onConfirm={executeImport} />
      )}

      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
