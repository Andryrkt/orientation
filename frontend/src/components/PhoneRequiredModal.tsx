import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PhoneRequiredModalProps {
  isOpen: boolean;
  email?: string;
  prenom?: string;
  onSubmit: (telephone: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export function PhoneRequiredModal({
  isOpen,
  email,
  prenom,
  onSubmit,
  onClose,
  loading = false,
}: PhoneRequiredModalProps) {
  const { t } = useTranslation();
  const [telephone, setTelephone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!telephone.trim()) {
      setError(t('auth.phone_required_error', 'Veuillez saisir votre numéro de téléphone.'));
      return;
    }
    try {
      await onSubmit(telephone.trim());
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? t('auth.phone_submit_error', 'Une erreur est survenue lors de l\'enregistrement.'));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 sm:p-8 relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-dropdown">
        
        {/* En-tête */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            📱
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('auth.phone_modal_title', 'Numéro de téléphone requis')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
            {prenom ? `${t('auth.welcome_google', 'Bienvenue')} ${prenom} ! ` : ''}
            {t('auth.phone_modal_subtitle', 'Pour finaliser votre inscription avec Google (')}
            <span className="font-semibold text-purple-600 dark:text-purple-400">{email}</span>
            {t('auth.phone_modal_subtitle_end', '), veuillez renseigner votre numéro de téléphone.')}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 text-xs rounded-xl px-3.5 py-2.5 animate-dropdown">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t('auth.phone_label', 'Numéro de téléphone')}
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="ex: +261 34 00 000 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                autoFocus
                required
                className="field-input pl-10"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                📞
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              {t('auth.phone_modal_hint', 'Ce numéro servira à vous contacter et sécuriser votre compte.')}
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              {t('auth.modal_cancel', 'Annuler')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-2.5 px-4 text-sm font-medium shimmer-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {t('auth.modal_submitting', 'Validation...')}
                </span>
              ) : (
                t('auth.modal_confirm', 'Finaliser l\'inscription')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
