import logo from '../../assets/logo.png';

const heights = {
  xs: 'h-7',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
  hero: 'h-20 sm:h-24',
};

export default function BrandLogo({ size = 'md', className = '', alt = 'ShaadiWaala' }) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`w-auto max-w-full object-contain ${heights[size] ?? heights.md} ${className}`}
      draggable={false}
    />
  );
}
