import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../lib/theme-context';

/* ── Données RIASEC pour le Teaser ── */
const RIASEC_PROFILES = [
  {
    type: 'Réaliste',
    letter: 'R',
    activity: 'Bricoler, fabriquer, cultiver ou réparer des objets physiques.',
    desc: 'Tu aimes le concret, l’action et le travail en extérieur ou manuel. Les métiers de l’ingénierie, de l’agriculture, de la logistique ou de la tech technique te conviendront parfaitement !',
    color: 'from-blue-500 to-indigo-500',
    glow: 'rgba(59, 130, 246, 0.3)',
    icon: '🛠️'
  },
  {
    type: 'Investigateur',
    letter: 'I',
    activity: 'Résoudre des énigmes, faire de la recherche ou analyser des théories.',
    desc: 'Tu es de nature curieuse, analytique et tu aimes comprendre le fonctionnement des choses. Les carrières scientifiques, médicales, de recherche ou de développement informatique t’attendent !',
    color: 'from-purple-500 to-indigo-500',
    glow: 'rgba(168, 85, 247, 0.3)',
    icon: '🔬'
  },
  {
    type: 'Artistique',
    letter: 'A',
    activity: 'Créer, dessiner, imaginer des concepts, jouer de la musique.',
    desc: 'Tu possèdes une forte imagination, tu aimes l’originalité et tu as besoin de t’exprimer librement. Explore les métiers du design, de la communication, de la mode ou du journalisme !',
    color: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.3)',
    icon: '🎨'
  },
  {
    type: 'Social',
    letter: 'S',
    activity: 'Enseigner, soigner, conseiller ou venir en aide aux autres.',
    desc: 'Tu as le contact facile, tu es empathique et tu aimes te sentir utile. Les domaines de la santé, de l’éducation, des ressources humaines ou du social sont faits pour toi !',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(52, 211, 153, 0.3)',
    icon: '🤝'
  },
  {
    type: 'Entreprenant',
    letter: 'E',
    activity: 'Négocier, convaincre, diriger une équipe, lancer un projet.',
    desc: 'Tu as l’esprit d’initiative, du leadership et le goût du challenge. Tu t’épanouiras dans le commerce, l’entrepreneuriat, le management de projet ou la finance !',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.3)',
    icon: '🚀'
  },
  {
    type: 'Conventionnel',
    letter: 'C',
    activity: 'Organiser des données, gérer un budget, planifier des tâches.',
    desc: 'Tu évalues les détails, tu es méthodique, organisé et tu aimes la précision. Les carrières en comptabilité, en administration, en gestion ou en droit te correspondront très bien !',
    color: 'from-cyan-500 to-teal-500',
    glow: 'rgba(34, 211, 238, 0.3)',
    icon: '📋'
  }
];

/* ── Icônes SVG ── */
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v10a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V5a2 2 0 012-2h4a2 2 0 012 2v1M3 12h18" />
    </svg>
  );
}
function IconAcademic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 9.75V15c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V9.75M21 7.5v6" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V6a1 1 0 011-1h6a1 1 0 011 1v15M4 21h16M12 10h8a1 1 0 011 1v10M8 8h.01M8 12h.01M8 16h.01" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M13 7a4 4 0 11-8 0 4 4 0 018 0zM22 20v-1a3.99 3.99 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M9 8h1M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
    </svg>
  );
}

/* ── Data ── */
const FEATURES = [
  {
    title: 'Métiers',
    desc: 'Explore les métiers, leurs débouchés et les compétences requises.',
    to: '/metiers',
    icon: IconBriefcase,
    gradient: 'from-purple-500 to-indigo-500',
    glow: 'rgba(168,85,247,0.25)',
    badge: '15+ fiches',
  },
  {
    title: 'Domaines',
    desc: 'Parcours les grands domaines de formation et leurs filières.',
    to: '/domaines',
    icon: IconAcademic,
    gradient: 'from-indigo-500 to-cyan-500',
    glow: 'rgba(129,140,248,0.25)',
    badge: '6 domaines',
  },
  {
    title: 'Universités',
    desc: 'Trouve les établissements et parcours de formation à Madagascar.',
    to: '/universites',
    icon: IconBuilding,
    gradient: 'from-cyan-500 to-teal-500',
    glow: 'rgba(34,211,238,0.25)',
    badge: '4+ universités',
  },
  {
    title: 'Centres de formation',
    desc: 'Découvre les centres et instituts spécialisés près de chez toi.',
    to: '/centres-formation',
    icon: IconBuilding,
    gradient: 'from-pink-500 to-rose-500',
    glow: 'rgba(236,72,153,0.25)',
    badge: 'Formations pro',
  },
  {
    title: 'Coachs',
    desc: "Échange avec des coachs d'orientation pour affiner ton choix.",
    to: '/coachs',
    icon: IconUsers,
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(52,211,153,0.25)',
    badge: 'Accompagnement',
  },
  {
    title: 'Blog & conseils',
    desc: "Des articles et témoignages pour t'aider à choisir ta voie.",
    to: '/blog',
    icon: IconDocument,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(251,191,36,0.25)',
    badge: 'Conseils',
  },
];

const STEPS = [
  { title: 'Explore', desc: 'Parcours les métiers, domaines et universités à Madagascar.', num: '01' },
  { title: 'Réponds au questionnaire', desc: "Identifie tes intérêts grâce à notre test d'orientation RIASEC.", num: '02' },
  { title: 'Décide', desc: 'Compare tes résultats, échange avec un coach et fais ton choix.', num: '03' },
];

const STATS = [
  { value: '100%', label: 'Gratuit', icon: '✦' },
  { value: '6', label: 'Domaines', icon: '◈' },
  { value: '15+', label: 'Fiches métiers', icon: '◉' },
  { value: 'Mada.', label: 'Contenu local', icon: '◆' },
];

/* ── Feature Card ── */
function FeatureCard({
  title, desc, to, icon: Icon, gradient, glow, badge,
}: { title: string; desc: string; to: string; icon: () => ReactNode; gradient: string; glow: string; badge: string }) {
  const { theme } = useTheme();
  return (
    <Link
      to={to}
      className="group relative block p-6 rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.75)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15, 23, 42, 0.06)',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${glow.replace('0.25', '0.5')}`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLElement).style.boxShadow = theme === 'dark'
          ? `0 20px 40px rgba(0,0,0,0.4), 0 0 40px ${glow}`
          : `0 20px 40px rgba(15,23,42,0.04), 0 0 30px ${glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.06)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
      />

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
        style={{ boxShadow: `0 4px 16px ${glow}` }}
      >
        <Icon />
      </div>

      {/* Badge */}
      <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
        style={{ 
          background: glow, 
          color: theme === 'dark' ? '#e2e8f0' : '#1e293b', 
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)' 
        }}>
        {badge}
      </span>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-200">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>

      {/* Arrow */}
      <div className="flex items-center gap-1 text-xs font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        style={{ color: '#c084fc' }}>
        Explorer
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

/* ── Mini-RIASEC Teaser ── */
function MiniRiasecTeaser() {
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const { theme } = useTheme();

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
            background: `radial-gradient(circle, ${RIASEC_PROFILES[selectedProfile].glow} 0%, transparent 70%)`
          }}
        />
      )}
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow mb-2">Quiz d'essai</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quel est ton profil d'orientation ?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
            Clique sur l'activité qui te plaît le plus pour découvrir un aperçu de ton tempérament professionnel.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {RIASEC_PROFILES.map((profile, index) => {
            const isSelected = selectedProfile === index;
            return (
              <button
                key={profile.type}
                onClick={() => setSelectedProfile(index)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                  isSelected 
                    ? 'border-purple-500/40 bg-purple-500/5' 
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
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
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
          <div className={`p-6 sm:p-8 rounded-2xl border animate-dropdown relative overflow-hidden ${
            theme === 'dark' ? 'border-white/8 bg-white/2' : 'border-slate-200 bg-white'
          }`}>
            <div className={`absolute top-4 right-6 text-6xl sm:text-7xl font-black select-none pointer-events-none ${
              theme === 'dark' ? 'text-white/5' : 'text-slate-900/5'
            }`}>
              {RIASEC_PROFILES[selectedProfile].letter}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${RIASEC_PROFILES[selectedProfile].color} flex items-center justify-center text-2xl`}>
                {RIASEC_PROFILES[selectedProfile].icon}
              </span>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                  Profil dominant : <span className="gradient-text">{RIASEC_PROFILES[selectedProfile].type}</span>
                </h4>
                <p className="text-xs text-slate-500">Modèle de personnalité RIASEC</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              {RIASEC_PROFILES[selectedProfile].desc}
            </p>

            <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${
              theme === 'dark' ? 'border-white/5' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Correspondance indicative :</span>
                <span className="badge">Forte</span>
              </div>
              <Link to="/questionnaire" className="btn-primary py-2.5 px-5 text-xs shimmer-btn">
                Faire le test d'orientation complet
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

/* ── Home Page ── */
export function Home() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <div className="space-y-24 pb-12">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden -mx-4 px-4 pt-20 pb-24 text-center">
        {/* Background glows */}
        <div className="glow-orb w-[600px] h-[600px] -top-48 left-1/2 -translate-x-1/2 animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -left-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -right-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold transition-all duration-300 hover:border-purple-500/50"
            style={{
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.25)',
              color: '#c084fc',
              boxShadow: '0 0 15px rgba(168,85,247,0.1)',
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            {t('footer.copyright')}
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="text-slate-900 dark:text-white">{t('home.hero_title_gradient')}</span>
            <br />
            <span className="gradient-text animate-text-shine">OrientMad</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.hero_subtitle')} {t('home.hero_desc')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/metiers" className="btn-primary px-7 py-3.5 text-base">
              {t('home.explore_btn')}
            </Link>
            <Link to="/questionnaire" className="btn-secondary px-7 py-3.5 text-base">
              {t('home.take_test_btn')}
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-flex flex-wrap justify-center gap-x-10 gap-y-6 px-8 py-5 rounded-2xl"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15, 23, 42, 0.04)',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(15, 23, 42, 0.08)',
              backdropFilter: 'blur(10px)',
            }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">{s.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section>
        <div className="section-header">
          <span className="eyebrow mb-2">Explore</span>
          <h2 className="section-title">{t('home.explore_section_title')}</h2>
          <p className="section-subtitle">{t('home.explore_section_desc')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── Mini-RIASEC Teaser ── */}
      <MiniRiasecTeaser />

      {/* ── Steps ── */}
      <section>
        <div className="section-header">
          <span className="eyebrow mb-2">Comment ça marche</span>
          <h2 className="section-title">Trois étapes vers ta décision</h2>
          <p className="section-subtitle">Un accompagnement simple, progressif et efficace.</p>
        </div>
        <div className="relative grid sm:grid-cols-3 gap-8 lg:gap-12">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-8 left-[16%] right-[16%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), rgba(129,140,248,0.3), transparent)' }} />

          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center group">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-black text-white group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: i === 0 ? 'linear-gradient(135deg,#a855f7,#818cf8)' : i === 1 ? 'linear-gradient(135deg,#818cf8,#22d3ee)' : 'linear-gradient(135deg,#22d3ee,#34d399)',
                  boxShadow: `0 4px 20px rgba(168,85,247,${0.3 - i * 0.05})`,
                }}
              >
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden -mx-4 px-6 py-20 rounded-[2.5rem] text-center">
        {/* Background */}
        <div className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(129,140,248,0.1) 50%, rgba(34,211,238,0.1) 100%)' }} />
        <div className="absolute inset-0 -z-10"
          style={{ background: 'rgba(10,8,24,0.5)', backdropFilter: 'blur(2px)' }} />
        <div style={{ border: '1px solid rgba(168,85,247,0.15)' }}
          className="absolute inset-0 -z-10 rounded-[2.5rem]" />

        {/* Glows */}
        <div className="glow-orb w-80 h-80 -top-20 left-1/4"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 -bottom-20 right-1/4"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">
            Prêt à découvrir <span className="gradient-text font-black">ta voie</span> ?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Créez votre compte gratuitement pour accéder au questionnaire d'orientation complet,
            enregistrer vos favoris et entrer en contact avec nos coachs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-4 text-base">
              Créer un compte gratuit
            </Link>
            <Link to="/universites" className="btn-secondary px-8 py-4 text-base">
              Explorer les universités
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
