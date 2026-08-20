import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifiant, password);
      navigate('/');
    } catch (err) {
      const response = (err as { response?: { data?: { message?: string | string[] } } })?.response;
      if (!response) {
        // Pas de réponse du serveur (backend indisponible, ex: conteneur en cours de redémarrage) — à ne pas confondre avec un mauvais mot de passe
        setError(t('login.server_unreachable_error'));
      } else {
        setError(t('login.invalid_credentials_error'));
      }
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
    <div className="relative min-h-[60vh] flex items-center justify-center px-4 py-8">
      {/* Background glow orbs */}
      <div className="glow-orb w-64 h-64 top-10 left-10 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />
      <div className="glow-orb w-64 h-64 bottom-10 right-10 animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }} />

      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <span className="eyebrow mb-2">{t('login.eyebrow')}</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('login.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{t('login.subtitle')}</p>
        </div>

        {/* Bouton Connexion Google */}
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
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('login.email_label')}</label>
            <input
              type="text"
              placeholder="ex: jean@avenirassure.mg"
              className="field-input"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{t('login.password_label')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="field-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <Link to="/mot-de-passe-oublie" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
                {t('login.forgot_password_link')}
              </Link>
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
                {t('login.submitting_btn')}
              </span>
            ) : t('login.submit_btn')}
          </button>
        </form>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 text-center">
          {t('login.register_prompt')}{' '}
          <Link to="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
            {t('login.register_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
