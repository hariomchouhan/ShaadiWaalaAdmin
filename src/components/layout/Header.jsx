import {
  Plus, Trash2, Download, UploadCloud, LogOut, Sparkles,
  FileText, FileSearch, FilePenLine,
} from 'lucide-react';
import { BRAND } from '../../config/brand';

const NAV_ITEMS = [
  { id: 'bulk-edit', icon: FilePenLine, label: 'Universal Edit' },
  { id: 'matcher', icon: FileSearch, label: 'Check Duplicates' },
  { id: 'reports', icon: FileText, label: 'Reports & Print' },
];

export default function Header({
  onNavigate,
  onDeleteAll,
  onOpenAI,
  onExport,
  onAdd,
  onLogout,
  isImporting,
  fileInputRef,
  onFileSelect,
}) {
  return (
    <header className="glass-nav sticky top-0 z-30 border-b border-brand-gold/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <h1 className="text-xl font-display font-bold text-brand-text leading-tight">
              {BRAND.name}
            </h1>
            <p className="text-[10px] text-brand-gold tracking-[0.2em] uppercase font-medium -mt-0.5">
              Admin · {BRAND.domain}
            </p>
          </div>
          <h1 className="sm:hidden text-lg font-display font-bold gold-gradient-text">
            {BRAND.name}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="p-2 rounded-sm border border-brand-gold/20 text-brand-brown hover:bg-brand-surface hover:border-brand-gold/40 hover:text-brand-gold transition-all duration-300"
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}

          <button
            onClick={onDeleteAll}
            className="p-2 rounded-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            title="Delete ALL"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenAI}
            className="p-2 rounded-sm border border-brand-gold/20 text-brand-brown hover:bg-brand-surface hover:text-brand-gold transition-all duration-300"
            title="AI Parser"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={onExport}
            className="p-2 rounded-sm border border-brand-gold/20 text-brand-brown hover:bg-brand-surface hover:text-brand-gold transition-all duration-300"
            title="Export CSV"
          >
            <Download className="w-5 h-5" />
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={onFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isImporting}
            />
            <button
              className="sw-btn-secondary px-3 py-2 text-sm"
              title="Import CSV"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>

          <button onClick={onAdd} className="sw-btn-primary px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Add
          </button>

          <button
            onClick={onLogout}
            className="ml-1 p-2 text-brand-muted hover:text-brand-gold transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
