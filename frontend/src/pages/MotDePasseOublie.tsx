import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

export function MotDePasseOublie() {
  const { t } = useTranslation();
  const [identifiant, setIdentifiant] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { identifiant });
    } finally {
      // Toujours afficher le même message, que l'email existe ou non (ne pas révéler quels
      // comptes existent).
      setEnvoye(true);
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('forgotPassword.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{t('forgotPassword.subtitle')}</p>
        </div>

        {envoye ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 text-sm rounded-xl px-4 py-3">
              {t('forgotPassword.sentMessage')}
            </div>
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-500 dark:hover:text-purple-300 transition-colors text-sm">
              {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('login.email_label')}
              </label>
              <input
                type="text"
                placeholder="ex: jean@avenirassure.mg ou +261340000000"
                className="field-input"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm shimmer-btn">
              {loading ? t('forgotPassword.sending_btn') : t('forgotPassword.submit_btn')}
            </button>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
                {t('forgotPassword.backToLogin')}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
