import { useState } from 'react';
import {
  LayoutGrid, FilePenLine, /* FileSearch, */ FileText, Sparkles, Plus,
  /* UploadCloud, Download, */ LogOut, Menu, X, /* Loader2, */
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import BrandLogo from '../common/BrandLogo';

const NAV = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Profiles' },
  { id: 'bulk-edit', icon: FilePenLine, label: 'Bulk Edit' },
  // { id: 'matcher', icon: FileSearch, label: 'Duplicates' },
  { id: 'reports', icon: FileText, label: 'Reports' },
];

export default function AppShell({
  activeView,
  onNavigate,
  onLogout,
  onOpenAI,
  onAdd,
  onExport,
  fileInputRef,
  onFileSelect,
  isImporting,
  isExporting,
  profileCount = 0,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const nav = (id) => { onNavigate(id); closeMobile(); };

  const SidebarContent = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <BrandLogo size="lg" className="rounded-md mb-2 bg-brand-gold/40 p-2 shadow-gold/20" />
        <p className="text-[10px] text-brand-gold/80 tracking-[0.15em] uppercase">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">Menu</p>
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => nav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30 shadow-gold/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-brand-gold' : ''}`} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">Actions</p>
        <button onClick={() => { onOpenAI(); closeMobile(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-brand-gold hover:bg-white/5 transition-colors">
          <Sparkles className="w-5 h-5" /> AI Parser
        </button>
        <button onClick={() => { onAdd(); closeMobile(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-brand-gold hover:bg-white/5 transition-colors">
          <Plus className="w-5 h-5" /> New Profile
        </button>
        {/* <div className="relative">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={onFileSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" disabled={isImporting || isExporting} />
          <button disabled={isImporting || isExporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-brand-gold hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin shrink-0" /> : <UploadCloud className="w-5 h-5 shrink-0" />}
            {isImporting ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
        <button
          onClick={() => { onExport(); closeMobile(); }}
          disabled={isExporting || isImporting}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-brand-gold hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin shrink-0" /> : <Download className="w-5 h-5 shrink-0" />}
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button> */}
      </div>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
        <p className="text-center text-[10px] text-white/30 mt-3">{BRAND.domain}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-surface flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sidebar-gradient fixed inset-y-0 left-0 z-40 no-print">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 no-print">
          <div className="absolute inset-0 bg-brand-brown/70 backdrop-blur-sm" onClick={closeMobile} />
          <aside className="absolute inset-y-0 left-0 w-[min(100%,280px)] sidebar-gradient shadow-2xl">
            <button onClick={closeMobile} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 xl:ml-72 print:ml-0 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden glass-nav sticky top-0 z-30 px-4 h-14 flex items-center justify-between shrink-0 no-print">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-brand-brown hover:text-brand-gold rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <BrandLogo size="sm" className="rounded" />
          <button onClick={onAdd} className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-lg">
            <Plus className="w-6 h-6" />
          </button>
        </header>

        {/* Desktop top strip for dashboard */}
        {activeView === 'dashboard' && (
          <div className="hidden lg:block hero-gradient border-b border-brand-gold/10 px-6 xl:px-8 py-6 shrink-0 no-print">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-1">Welcome back</p>
                <h1 className="sw-page-title">Candidate Profiles</h1>
                <p className="sw-page-subtitle">Manage elite & NRI matrimonial records privately</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="sw-card px-4 py-3 text-center min-w-[100px]">
                  <p className="text-2xl font-display font-bold text-brand-gold">{profileCount}</p>
                  <p className="text-[10px] uppercase tracking-wider text-brand-muted">Loaded</p>
                </div>
                <button onClick={onOpenAI} className="sw-btn-secondary px-4 py-2.5 text-sm">
                  <Sparkles className="w-4 h-4" /> AI Parse
                </button>
                <button onClick={onAdd} className="sw-btn-primary px-5 py-2.5 text-sm">
                  <Plus className="w-4 h-4" /> Add Profile
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 xl:px-8 py-5 sm:py-6 lg:py-8 print:p-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
