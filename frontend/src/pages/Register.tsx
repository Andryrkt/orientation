import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== confirmPassword) {
      setError(t('register.password_mismatch_error'));
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? t('register.registration_error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(idToken: string) {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle(idToken);
      navigate('/');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? t('auth.google_failed', 'Échec de la connexion avec Google.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-8">
      {/* Background glow orbs */}
      <div className="glow-orb w-64 h-64 top-10 right-10 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />
      <div className="glow-orb w-64 h-64 bottom-10 left-10 animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }} />

      <div className="glass-card w-full max-w-lg p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <span className="eyebrow mb-2">{t('register.eyebrow')}</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('register.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{t('register.subtitle')}</p>
        </div>

        {/* Bouton Inscription via Google */}
        <div className="mb-6">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
            disabled={loading}
          />
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs uppercase text-slate-600 dark:text-slate-400 font-medium tracking-wider relative z-10 shrink-0">
              {t('auth.or_continue_with', 'ou continuez avec')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 text-sm rounded-xl px-4 py-3 animate-dropdown">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('register.firstname_label')}</label>
              <input
                className="field-input"
                placeholder="ex: Jean"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('register.lastname_label')}</label>
              <input
                className="field-input"
                placeholder="ex: Rabe"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('register.email_label')}</label>
            <input
              type="email"
              placeholder="ex: jean.rabe@gmail.com"
              className="field-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('register.phone_label')}</label>
            <input
              placeholder="ex: +261 34 00 000 00"
              className="field-input"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('register.password_label')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('register.password_placeholder')}
                minLength={8}
                className="field-input pr-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('register.hide_password') : t('register.show_password')}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('register.password_confirm_label')}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="field-input pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? t('register.hide_confirm_password') : t('register.show_confirm_password')}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 text-sm shimmer-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {t('register.submitting_btn')}
              </span>
            ) : t('register.submit_btn')}
          </button>
        </form>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 text-center">
          {t('register.login_prompt')}{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
            {t('register.login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
