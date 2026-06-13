import { Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { BRAND } from '../../config/brand';
import { getAuthErrorMessage } from '../../services/authService';

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
    <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4">
      <div className="bg-brand-bg rounded-sm card-shadow p-8 w-full max-w-md border border-brand-gold/15">
        <div className="text-center mb-8">
          <div className="bg-brand-gold w-14 h-14 rounded-sm flex items-center justify-center mx-auto mb-5 shadow-gold">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <span className="text-brand-gold text-xs tracking-[0.25em] uppercase font-medium">
            Elite & NRI Matrimony
          </span>
          <h1 className="text-3xl font-display font-bold text-brand-text mt-2">
            <span className="gold-gradient-text">{BRAND.name}</span>
          </h1>
          <p className="text-brand-muted text-sm mt-2">{BRAND.tagline}</p>
          <div className="gold-divider my-4" />
          <p className="text-xs text-brand-muted">{BRAND.domain}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="sw-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shaadiwaala.in"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="sw-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="sw-btn-primary w-full py-3 text-sm disabled:opacity-60">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </span>
            ) : (
              'Login to Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
