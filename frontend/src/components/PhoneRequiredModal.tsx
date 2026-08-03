import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PhoneRequiredModalProps {
  isOpen: boolean;
  email?: string;
  prenom?: string;
  onSendOtp: (telephone: string) => Promise<{ devCode?: string }>;
  onSubmit: (telephone: string, otpCode: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export function PhoneRequiredModal({
  isOpen,
  email,
  prenom,
  onSendOtp,
  onSubmit,
  onClose,
  loading = false,
}: PhoneRequiredModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [telephone, setTelephone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  async function handleSendOtp(e?: FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    if (!telephone.trim()) {
      setError(t('auth.phone_required_error', 'Veuillez saisir votre numéro de téléphone.'));
      return;
    }
    setSendingOtp(true);
    try {
      const res = await onSendOtp(telephone.trim());
      if (res?.devCode) {
        setDevCodeHint(res.devCode);
      }
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? t('auth.otp_send_error', 'Échec de l\'envoi du code WhatsApp. Vérifiez le numéro.'));
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleSubmitOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError(t('auth.otp_format_error', 'Veuillez saisir le code à 6 chiffres reçu sur WhatsApp.'));
      return;
    }
    try {
      await onSubmit(telephone.trim(), otpCode.trim());
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? t('auth.otp_verify_error', 'Code OTP WhatsApp invalide ou expiré.'));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 sm:p-8 relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-dropdown">
        
        {/* En-tête avec indicateur d'étape */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
            {step === 1 ? '💬' : '🔐'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === 1
              ? t('auth.phone_modal_title', 'Numéro WhatsApp requis')
              : t('auth.otp_modal_title', 'Vérification WhatsApp')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
            {step === 1 ? (
              <>
                {prenom ? `${t('auth.welcome_google', 'Bienvenue')} ${prenom} ! ` : ''}
                {t('auth.phone_modal_subtitle', 'Veuillez renseigner votre numéro WhatsApp pour sécuriser votre compte (')}
                <span className="font-semibold text-purple-600 dark:text-purple-400">{email}</span>).
              </>
            ) : (
              <>
                {t('auth.otp_sent_to', 'Un code à 6 chiffres a été envoyé par WhatsApp au ')}
                <span className="font-semibold text-slate-900 dark:text-white">{telephone}</span>.
              </>
            )}
          </p>
        </div>

        {/* Indice Dev Mode */}
        {devCodeHint && step === 2 && (
          <div className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              <strong>[Dev Mode]</strong> Code WhatsApp simulé : <code className="font-mono font-bold bg-purple-200 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">{devCodeHint}</code>
            </span>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 text-xs rounded-xl px-3.5 py-2.5 mb-4 animate-dropdown">
            ⚠️ {error}
          </div>
        )}

        {/* ÉTAPE 1 : Saisie du numéro de téléphone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('auth.phone_label', 'Numéro WhatsApp (avec indicatif)')}
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
                  💬
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {t('auth.phone_modal_hint', 'Nous allons vous envoyer un code de confirmation immédiat sur WhatsApp.')}
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sendingOtp || loading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                {t('auth.modal_cancel', 'Annuler')}
              </button>
              <button
                type="submit"
                disabled={sendingOtp || loading}
                className="flex-1 btn-primary py-2.5 px-4 text-sm font-medium shimmer-btn bg-emerald-600 hover:bg-emerald-500 border-emerald-600"
              >
                {sendingOtp ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    {t('auth.sending_otp', 'Envoi...')}
                  </span>
                ) : (
                  t('auth.send_whatsapp_otp', 'Envoyer le code 💬')
                )}
              </button>
            </div>
          </form>
        )}

        {/* ÉTAPE 2 : Saisie du code OTP */}
        {step === 2 && (
          <form onSubmit={handleSubmitOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('auth.otp_label', 'Code de vérification (6 chiffres)')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  className="field-input text-center text-xl tracking-[0.5em] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:underline text-purple-600 dark:text-purple-400"
              >
                ← {t('auth.change_phone', 'Changer de numéro')}
              </button>
              
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={resendCooldown > 0 || sendingOtp}
                className="hover:underline text-emerald-600 dark:text-emerald-400 disabled:opacity-50 disabled:no-underline font-medium"
              >
                {resendCooldown > 0
                  ? `${t('auth.resend_in', 'Renvoyer dans')} ${resendCooldown}s`
                  : t('auth.resend_code', 'Renvoyer le code')}
              </button>
            </div>

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
                  t('auth.modal_confirm_otp', 'Valider & Finaliser')
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
