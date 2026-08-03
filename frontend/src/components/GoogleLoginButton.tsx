import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GoogleLoginButtonProps {
  onSuccess: (idToken: string) => void | Promise<void>;
  onError?: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleLoginButton({ onSuccess, onError, disabled }: GoogleLoginButtonProps) {
  const { t } = useTranslation();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [loadingScript, setLoadingScript] = useState(true);
  const [hasClientId, setHasClientId] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) {
      setHasClientId(false);
      setLoadingScript(false);
      return;
    }

    setHasClientId(true);

    const handleCredentialResponse = (response: { credential: string }) => {
      if (response && response.credential) {
        onSuccess(response.credential);
      } else {
        if (onError) onError(t('auth.google_failed', 'Échec de l\'authentification Google'));
      }
    };

    const initGoogleGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%',
          });
        }
        setLoadingScript(false);
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGsi();
    } else {
      const existingScript = document.getElementById('google-gsi-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleGsi;
        script.onerror = () => {
          setLoadingScript(false);
          setErrorMsg(t('auth.google_script_error', 'Impossible de charger le service Google.'));
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', initGoogleGsi);
      }
    }
  }, [clientId, onSuccess, onError, t]);

  const handleManualClick = () => {
    if (!clientId) {
      alert(
        'La connexion Google requiert VITE_GOOGLE_CLIENT_ID dans le fichier .env.\n' +
        'Veuillez ajouter votre Client ID Google OAuth2 dans le fichier .env pour activer le bouton officiel.'
      );
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {hasClientId && (
        <div ref={googleBtnRef} className={`w-full min-h-[44px] flex justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`} />
      )}

      {(!hasClientId || loadingScript || errorMsg) && (
        <button
          type="button"
          onClick={handleManualClick}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-medium text-sm transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('auth.continue_with_google', 'Continuer avec Google')}</span>
        </button>
      )}

      {errorMsg && <p className="text-xs text-rose-500 mt-1.5">{errorMsg}</p>}
    </div>
  );
}
