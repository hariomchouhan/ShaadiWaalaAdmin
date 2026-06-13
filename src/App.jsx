import { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import LoginScreen from './components/auth/LoginScreen';
import AppShell from './components/layout/AppShell';
import BrandLogo from './components/common/BrandLogo';
import Notification from './components/common/Notification';
import OperationOverlay from './components/common/OperationOverlay';
import ProfileCard from './components/profiles/ProfileCard';
import ProfileFilters from './components/profiles/ProfileFilters';
import MemberFilterDrawer from './components/profiles/MemberFilterDrawer';
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
import {
  DEFAULT_MEMBER_FILTERS,
  applyMemberFilters,
  hasActiveMemberFilters,
} from './utils/memberFilters';
import { compressImage } from './utils/imageUtils';
import { parseCSV, downloadCSV } from './utils/csvUtils';
import { printBiodata } from './utils/printBiodata';
import {
  createProfile, updateProfile, deleteProfile, batchImportProfiles,
} from './services/profileService';
import { uploadProfilePhotoFromBase64 } from './services/storageService';
import { extractProfile } from './services/aiService';

export default function App() {
  const { isAuthenticated, authLoading, login, logout } = useAuth();
  const { notification, showNotification } = useNotification();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const { profiles, loading, isLoadingMore, hasMore, refresh } = useProfiles(isAuthenticated, searchTerm);

  const [appliedMemberFilters, setAppliedMemberFilters] = useState(null);
  const [draftMemberFilters, setDraftMemberFilters] = useState(DEFAULT_MEMBER_FILTERS);
  const [memberFilterDrawerOpen, setMemberFilterDrawerOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [importConfirmation, setImportConfirmation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [aiInputText, setAiInputText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [galleryUpload, setGalleryUpload] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('Basic Details');

  const fileInputRef = useRef(null);
  const galleryRef = useRef(null);

  const filteredProfiles = useMemo(() => {
    let result = profiles;
    if (appliedMemberFilters && hasActiveMemberFilters(appliedMemberFilters)) {
      result = applyMemberFilters(result, appliedMemberFilters);
    }
    return result;
  }, [profiles, appliedMemberFilters]);

  const openMemberFilters = () => {
    setDraftMemberFilters(appliedMemberFilters ? { ...appliedMemberFilters } : { ...DEFAULT_MEMBER_FILTERS });
    setMemberFilterDrawerOpen(true);
  };

  const handleApplyMemberFilters = () => {
    setAppliedMemberFilters({ ...draftMemberFilters });
    setMemberFilterDrawerOpen(false);
  };

  const clearMemberFilters = () => {
    setDraftMemberFilters({ ...DEFAULT_MEMBER_FILTERS });
    setAppliedMemberFilters(null);
  };

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
            setIsUploadingAvatar(true);
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
            } finally {
              setIsUploadingAvatar(false);
            }
            return;
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isEditModalOpen, showNotification]);

  const handleAIExtraction = async ({ text, file } = {}) => {
    setIsProcessingAI(true);
    try {
      const cleaned = await extractProfile({ text, file });
      setFormData({ refId: getNextRefId(), ...cleaned });
      setIsAIModalOpen(false);
      setAiInputText('');
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
    if (isSavingProfile) return;
    if (!isFirebaseConfigured) return showNotification('Firebase not configured', 'error');
    setIsSavingProfile(true);
    try {
      if (currentProfile) {
        await updateProfile(currentProfile.id, formData);
        showNotification('Profile updated successfully!');
      } else {
        await createProfile(formData);
        showNotification('Profile saved successfully!');
      }
      setIsEditModalOpen(false);
      refresh();
    } catch (err) {
      console.error(err);
      showNotification('Save failed. Please try again.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProfile(deleteTarget);
      showNotification('Profile deleted.');
      setDeleteTarget(null);
      setIsViewModalOpen(false);
      refresh();
    } catch (e) {
      console.error(e);
      showNotification('Delete failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || isUploadingAvatar || galleryUpload?.active || isSavingProfile) return;
    e.target.value = '';
    setIsUploadingAvatar(true);
    showNotification('Uploading photo...', 'info');
    try {
      const b64 = await compressImage(file);
      const url = await uploadProfilePhotoFromBase64(b64, `avatar_${Date.now()}.jpg`);
      setFormData((prev) => ({ ...prev, avatar: url }));
      showNotification('Main photo updated!');
    } catch (err) {
      console.error(err);
      showNotification('Upload failed', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || isUploadingAvatar || galleryUpload?.active || isSavingProfile) return;
    e.target.value = '';
    setGalleryUpload({ active: true, current: 0, total: files.length });
    showNotification(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}...`, 'info');
    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        setGalleryUpload({ active: true, current: i + 1, total: files.length });
        const b64 = await compressImage(files[i]);
        const url = await uploadProfilePhotoFromBase64(b64, `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
        uploadedUrls.push(url);
      }
      setFormData((prev) => ({ ...prev, gallery: [...(prev.gallery || []), ...uploadedUrls] }));
      showNotification(`${files.length} photo${files.length > 1 ? 's' : ''} added!`);
    } catch (err) {
      console.error(err);
      showNotification('Gallery upload failed', 'error');
    } finally {
      setGalleryUpload(null);
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
    if (!importConfirmation?.file || isImporting) return;
    const file = importConfirmation.file;
    setImportConfirmation(null);
    setIsImporting(true);
    setImportProgress({ current: 0, total: 0, label: 'Reading CSV file...' });

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

        setImportProgress({ current: 0, total: toImport.length, label: 'Importing profiles to Firebase...' });
        const count = await batchImportProfiles(toImport, (p) => {
          setImportProgress({ ...p, label: 'Importing profiles to Firebase...' });
        });
        showNotification(`Success! ${count} profile${count === 1 ? '' : 's'} imported.`);
        refresh();
      } catch (err) {
        console.error(err);
        showNotification('Import failed.', 'error');
      } finally {
        setIsImporting(false);
        setImportProgress(null);
      }
    };
    reader.onerror = () => {
      showNotification('Could not read CSV file.', 'error');
      setIsImporting(false);
      setImportProgress(null);
    };
    reader.readAsText(file);
  };

  const handleExportCSV = async () => {
    if (profiles.length === 0 || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      const headers = PROFILE_SCHEMA.map((f) => f.csvHeader || f.label);
      const keys = PROFILE_SCHEMA.map((f) => f.key);
      downloadCSV(
        [headers.join(','), ...profiles.map((row) => keys.map((k) => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))],
        'shaadiwaala_data.csv'
      );
      showNotification(`Exported ${profiles.length} profiles.`);
    } finally {
      setIsExporting(false);
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-surface gap-4">
        <BrandLogo size="lg" className="rounded-md opacity-90" />
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        <p className="text-sm text-brand-muted">Loading...</p>
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4">
        <div className="bg-brand-bg rounded-sm card-shadow p-8 max-w-md text-center border border-brand-gold/15">
          <h2 className="text-xl font-display font-bold text-brand-text mb-2">Firebase Not Configured</h2>
          <p className="text-gray-600 text-sm mb-4">
            Copy <code className="bg-brand-brown-deep px-1.5 py-0.5 rounded text-brand-brown">.env.example</code> to <code className="bg-brand-brown-deep px-1.5 py-0.5 rounded text-brand-brown">.env</code> and add your Firebase credentials.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginScreen onLogin={login} />;

  const shellProps = {
    activeView,
    onNavigate: setActiveView,
    onLogout: logout,
    onOpenAI: () => setIsAIModalOpen(true),
    onAdd: openAddProfile,
    onExport: handleExportCSV,
    fileInputRef,
    onFileSelect: handleFileSelect,
    isImporting,
    isExporting,
    profileCount: profiles.length,
  };

  const modals = (
    <>
      <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} aiInputText={aiInputText} setAiInputText={setAiInputText} onExtract={handleAIExtraction} isProcessing={isProcessingAI} />
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
        isSaving={isSavingProfile}
        isUploadingAvatar={isUploadingAvatar}
        galleryUpload={galleryUpload}
      />
      {isViewModalOpen && currentProfile && (
        <ProfileViewModal profile={currentProfile} onClose={() => setIsViewModalOpen(false)} onPrint={() => printBiodata(currentProfile)} />
      )}
      {importConfirmation && (
        <ImportConfirmModal
          onCancel={() => setImportConfirmation(null)}
          onConfirm={executeImport}
          isImporting={isImporting}
        />
      )}
      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={executeDelete}
        isDeleting={isDeleting}
      />
      <OperationOverlay
        open={isImporting}
        title="Importing CSV"
        message={importProgress?.label || 'Processing your file...'}
        progress={importProgress?.total ? importProgress : null}
        indeterminate={!importProgress?.total}
      />
      <OperationOverlay
        open={isExporting}
        title="Exporting CSV"
        message="Preparing your download..."
        indeterminate
      />
    </>
  );

  return (
    <AppShell {...shellProps}>
      <Notification notification={notification} />

      {activeView === 'dashboard' && (
        <>
          <div className="lg:hidden mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-1">Profiles</p>
            <h1 className="font-display text-2xl font-bold text-brand-text">Candidates</h1>
            <p className="text-sm text-brand-muted mt-0.5">{filteredProfiles.length} loaded</p>
          </div>

          <MemberFilterDrawer
            open={memberFilterDrawerOpen}
            draft={draftMemberFilters}
            setDraft={setDraftMemberFilters}
            onApply={handleApplyMemberFilters}
            onClose={() => setMemberFilterDrawerOpen(false)}
            onClear={clearMemberFilters}
          />

          <ProfileFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenFilters={openMemberFilters}
            appliedMemberFilters={appliedMemberFilters}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
              <div className="text-center">
                <p className="text-sm font-medium text-brand-text">Loading profiles...</p>
                <p className="text-xs text-brand-muted mt-1">Fetching data from Firebase</p>
              </div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="sw-card p-12 text-center">
              {searchTerm.trim() || hasActiveMemberFilters(appliedMemberFilters) ? (
                <>
                  <p className="font-display text-xl text-brand-text mb-2">No matching profiles</p>
                  <p className="text-sm text-brand-muted mb-6">
                    {searchTerm.trim()
                      ? `No profile contains "${searchTerm.trim()}". Try different keywords or filters.`
                      : 'No profiles match your selected filters. Try adjusting the criteria.'}
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); clearMemberFilters(); }}
                    className="sw-btn-secondary px-6 py-2.5 text-sm"
                  >
                    Clear search & filters
                  </button>
                </>
              ) : (
                <>
                  <p className="font-display text-xl text-brand-text mb-2">No profiles yet</p>
                  <p className="text-sm text-brand-muted mb-6">Add a candidate or import a CSV to get started</p>
                  <button onClick={openAddProfile} className="sw-btn-primary px-6 py-2.5 text-sm">Add First Profile</button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                {filteredProfiles.map((p) => (
                  <ProfileCard key={p.id} profile={p} onView={openViewProfile} onEdit={openEditProfile} onDelete={setDeleteTarget} />
                ))}
              </div>
              {isLoadingMore && (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold" />
                  <span className="text-xs text-brand-muted mt-2 block">Loading next batch...</span>
                </div>
              )}
              {!hasMore && !loading && (
                <p className="text-center py-8 text-xs text-brand-muted">All profiles loaded</p>
              )}
            </>
          )}
        </>
      )}

      {activeView === 'bulk-edit' && <BulkEditView profiles={profiles} loading={loading} />}
      {activeView === 'matcher' && <DuplicateCheckerView profiles={profiles} loading={loading} />}
      {activeView === 'reports' && <ReportsView profiles={profiles} />}

      {modals}
    </AppShell>
  );
}
