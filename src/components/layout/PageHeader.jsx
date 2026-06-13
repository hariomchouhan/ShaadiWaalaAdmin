export default function PageHeader({ title, subtitle, badge, children }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {badge && <span className="sw-badge mb-2">{badge}</span>}
          <h1 className="sw-page-title">{title}</h1>
          {subtitle && <p className="sw-page-subtitle">{subtitle}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
      <div className="gold-divider mt-5 opacity-60" />
    </div>
  );
}
