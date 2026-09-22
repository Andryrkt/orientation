import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../lib/theme-context';

/* ── Mini-RIASEC Teaser : aperçu ludique du test RIASEC avant de le lancer ── */
export function MiniRiasecTeaser() {
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const profiles = [
    {
      type: t('home.riasec_teaser.profiles.R.type'),
      letter: 'R',
      activity: t('home.riasec_teaser.profiles.R.activity'),
      desc: t('home.riasec_teaser.profiles.R.desc'),
      color: 'from-blue-500 to-indigo-500',
      glow: 'rgba(59, 130, 246, 0.3)',
      icon: '🛠️'
    },
    {
      type: t('home.riasec_teaser.profiles.I.type'),
      letter: 'I',
      activity: t('home.riasec_teaser.profiles.I.activity'),
      desc: t('home.riasec_teaser.profiles.I.desc'),
      color: 'from-purple-500 to-indigo-500',
      glow: 'rgba(168, 85, 247, 0.3)',
      icon: '🔬'
    },
    {
      type: t('home.riasec_teaser.profiles.A.type'),
      letter: 'A',
      activity: t('home.riasec_teaser.profiles.A.activity'),
      desc: t('home.riasec_teaser.profiles.A.desc'),
      color: 'from-pink-500 to-rose-500',
      glow: 'rgba(236, 72, 153, 0.3)',
      icon: '🎨'
    },
    {
      type: t('home.riasec_teaser.profiles.S.type'),
      letter: 'S',
      activity: t('home.riasec_teaser.profiles.S.activity'),
      desc: t('home.riasec_teaser.profiles.S.desc'),
      color: 'from-emerald-500 to-teal-500',
      glow: 'rgba(52, 211, 153, 0.3)',
      icon: '🤝'
    },
    {
      type: t('home.riasec_teaser.profiles.E.type'),
      letter: 'E',
      activity: t('home.riasec_teaser.profiles.E.activity'),
      desc: t('home.riasec_teaser.profiles.E.desc'),
      color: 'from-amber-500 to-orange-500',
      glow: 'rgba(245, 158, 11, 0.3)',
      icon: '🚀'
    },
    {
      type: t('home.riasec_teaser.profiles.C.type'),
      letter: 'C',
      activity: t('home.riasec_teaser.profiles.C.activity'),
      desc: t('home.riasec_teaser.profiles.C.desc'),
      color: 'from-cyan-500 to-teal-500',
      glow: 'rgba(34, 211, 238, 0.3)',
      icon: '📋'
    }
  ];

  return (
    <section className="relative overflow-hidden p-8 sm:p-12 rounded-[2.5rem] border"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
      }}>
      {/* Lights inside the card */}
      {selectedProfile !== null && (
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-60 pointer-events-none transition-all duration-1000 animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${profiles[selectedProfile].glow} 0%, transparent 70%)`
          }}
        />
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow mb-2">{t('home.riasec_teaser.eyebrow')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('home.riasec_teaser.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
            {t('home.riasec_teaser.desc')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {profiles.map((profile, index) => {
            const isSelected = selectedProfile === index;
            return (
              <button
                key={profile.letter}
                onClick={() => setSelectedProfile(index)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? 'border-blue-500/40 bg-blue-500/5'
                    : theme === 'dark'
                      ? 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/4'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-350 hover:bg-slate-100/50'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 25px ${profile.glow}` : 'none'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{profile.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {profile.type}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 text-slate-500 dark:text-slate-400">Type {profile.letter}</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{profile.activity}</p>
              </button>
            );
          })}
        </div>

        {selectedProfile !== null && (
          <div className="mt-8 p-6 rounded-2xl border bg-black/10 dark:bg-white/3 border-blue-500/20 animate-dropdown">
            <div className={`absolute top-4 right-6 text-6xl sm:text-7xl font-black select-none pointer-events-none ${
              theme === 'dark' ? 'text-white/5' : 'text-slate-900/5'
            }`}>
              {profiles[selectedProfile].letter}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profiles[selectedProfile].color} flex items-center justify-center text-2xl`}>
                {profiles[selectedProfile].icon}
              </span>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t('home.riasec_teaser.dominant_profile')}<span className="gradient-text">{profiles[selectedProfile].type}</span>
                </h4>
                <p className="text-xs text-slate-500">{t('home.riasec_teaser.riasec_model')}</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              {profiles[selectedProfile].desc}
            </p>

            <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${
              theme === 'dark' ? 'border-white/5' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{t('home.riasec_teaser.match_indication')}</span>
                <span className="badge">{t('home.riasec_teaser.match_strong')}</span>
              </div>
              <Link to="/questionnaire" className="btn-primary py-2.5 px-5 text-xs shimmer-btn">
                {t('home.riasec_teaser.take_full_test_btn')}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
