import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SERVICE_KEYS = [
  { emoji: '🎓', key: 'scolaire' },
  { emoji: '🎯', key: 'post_bac' },
  { emoji: '💼', key: 'professionnelle' },
  { emoji: '🔍', key: 'demandeurs_emploi' },
  { emoji: '🚀', key: 'entrepreneuriale' },
  { emoji: '🔄', key: 'transition' },
];

export function Services() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 pb-12">
      <section className="text-center max-w-2xl mx-auto">
        <span className="eyebrow mb-2">{t('services_page.eyebrow')}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          {t('services_page.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          {t('services_page.subtitle')}
        </p>
      </section>

      <div className="space-y-8">
        {SERVICE_KEYS.map((service) => {
          const propose = t(`services_page.items.${service.key}.propose`, { returnObjects: true }) as string[];
          return (
            <section key={service.key} id={service.key} className="glass-card p-8 sm:p-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl shrink-0">{service.emoji}</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t(`services_page.items.${service.key}.titre`)}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                {t(`services_page.items.${service.key}.intro`)}
              </p>

              <p className="text-sm font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-2">
                {t('services_page.ce_quon_propose')}
              </p>
              <ul className="space-y-1.5 mb-5">
                {propose.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-blue-500 dark:text-blue-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('services_page.pour_qui')}</span>
                {t(`services_page.items.${service.key}.pourQui`)}
              </p>

              <Link to="/contact" className="btn-primary px-6 py-2.5 text-sm">
                {t('services_page.cta_rdv')}
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
