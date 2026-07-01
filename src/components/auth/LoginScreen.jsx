import { Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { BRAND } from '../../config/brand';
import { getAuthErrorMessage } from '../../services/authService';
import BrandLogo from '../common/BrandLogo';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-brand-gold/40" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border border-brand-gold/20" />
        </div>
        <div className="relative text-center max-w-md">
          <BrandLogo size="hero" variant="onDark" className="mx-auto mb-8" />
          <p className="text-brand-gold/90 text-sm tracking-[0.25em] uppercase mb-6">Elite & NRI Matrimony</p>
          <p className="text-white/60 text-lg leading-relaxed">
            Private admin portal for confidential profile management and matchmaking operations.
          </p>
          <div className="gold-divider my-8 opacity-50" />
          <p className="text-white/40 text-sm">{BRAND.domain}</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-brand-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <BrandLogo size="lg" variant="onDark" className="mx-auto mb-3" />
            <p className="text-brand-muted text-sm mt-1">{BRAND.tagline}</p>
          </div>

          <div className="sw-card p-6 sm:p-8">
            <div className="hidden lg:flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-brand-gold/15 flex items-center justify-center">
                <Lock className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-brand-text">Sign In</h2>
                <p className="text-xs text-brand-muted">Access your admin dashboard</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="sw-label">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="sw-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="sw-label">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="sw-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} className="sw-btn-primary w-full py-3 text-sm mt-2">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                  </span>
                ) : (
                  'Enter Admin Portal'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-brand-muted mt-6 lg:hidden">{BRAND.domain}</p>
        </div>
      </div>
    </div>
  );
}
