import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

export function ReinitialiserMotDePasse() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t('profile.password_mismatch'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSucces(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message ?? t('forgotPassword.resetError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="glow-orb w-64 h-64 top-10 left-10 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />
      <div className="glow-orb w-64 h-64 bottom-10 right-10 animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }} />

      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <span className="eyebrow mb-2">{t('login.eyebrow')}</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('forgotPassword.resetTitle')}</h1>
        </div>

        {!token ? (
          <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 text-sm rounded-xl px-4 py-3 text-center">
            {t('forgotPassword.invalidLink')}
          </div>
        ) : succes ? (
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 text-sm rounded-xl px-4 py-3 text-center">
            {t('forgotPassword.resetSuccess')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('profile.new_password')}
              </label>
              <input
                type="password"
                className="field-input"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('profile.confirm_password')}
              </label>
              <input
                type="password"
                className="field-input"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm shimmer-btn">
              {loading ? t('profile.saving_btn') : t('forgotPassword.resetSubmit_btn')}
            </button>
          </form>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 text-center">
          <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
            {t('forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
