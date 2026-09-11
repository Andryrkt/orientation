import { useTranslation } from 'react-i18next';

const VALEUR_KEYS = ['ecoute', 'rigueur', 'bienveillance', 'engagement'];

export function QuiSommesNous() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-12">
      <section className="text-center">
        <span className="eyebrow mb-2">{t('about_page.eyebrow')}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Avenir <span className="gradient-text">Assuré</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          {t('about_page.text1')}
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mt-4">
          {t('about_page.text2')}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-6">
          {t('about_page.values_title')}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {VALEUR_KEYS.map((key) => (
            <div key={key} className="glass-card p-6">
              <p className="font-bold text-slate-800 dark:text-white mb-1">
                {t(`about_page.values.${key}.titre`)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t(`about_page.values.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
