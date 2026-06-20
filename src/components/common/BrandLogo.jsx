import logo from '../../assets/logo.png';

const heights = {
  xs: 'h-7',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
  hero: 'h-20 sm:h-24',
};

const darkWrapPadding = {
  xs: 'px-2 py-1',
  sm: 'px-2.5 py-1.5',
  md: 'px-3 py-2',
  lg: 'px-3.5 py-2.5',
  xl: 'px-4 py-3',
  hero: 'px-5 py-4 sm:px-6 sm:py-5',
};

export default function BrandLogo({
  size = 'md',
  variant = 'default',
  className = '',
  alt = 'ShaadiWaala',
}) {
  const heightClass = heights[size] ?? heights.md;
  const img = (
    <img
      src={logo}
      alt={alt}
      className={`w-auto max-w-full object-contain ${heightClass}`}
      draggable={false}
    />
  );

  if (variant === 'onDark') {
    return (
      <div
        className={`brand-logo-on-dark inline-flex items-center justify-center ${darkWrapPadding[size] ?? darkWrapPadding.md} ${className}`}
      >
        {img}
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={alt}
      className={`w-auto max-w-full object-contain ${heightClass} ${className}`}
      draggable={false}
    />
  );
}
