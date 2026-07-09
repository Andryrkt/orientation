import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <Link
      to={to}
      className="group relative block p-6 rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${glow.replace('0.25', '0.5')}`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 40px ${glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
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
        style={{ background: glow, color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
        {badge}
      </span>

      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-200">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>

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

/* ── Home Page ── */
export function Home() {
  return (
    <div className="space-y-24 pb-12">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden -mx-4 px-4 pt-20 pb-24 text-center">
        {/* Background glows */}
        <div className="glow-orb w-[600px] h-[600px] -top-48 left-1/2 -translate-x-1/2"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -left-20"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
            style={{
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.25)',
              color: '#c084fc',
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Orientation scolaire &amp; professionnelle à Madagascar
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Trouve ta voie avec</span>
            <br />
            <span className="gradient-text">OrientMad</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme de référence pour l'orientation scolaire, universitaire et professionnelle
            à Madagascar : métiers, formations, universités et bien plus.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/metiers" className="btn-primary px-7 py-3.5 text-base">
              Découvrir les métiers
            </Link>
            <Link to="/questionnaire" className="btn-secondary px-7 py-3.5 text-base">
              Faire le questionnaire
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-flex flex-wrap justify-center gap-x-10 gap-y-6 px-8 py-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(10px)',
            }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white mb-0.5">{s.value}</p>
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
          <h2 className="section-title">Tout pour construire ton avenir</h2>
          <p className="section-subtitle">Découvrez nos ressources pour affiner votre parcours d'études et de carrière.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

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
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Prêt à découvrir <span className="gradient-text">ta voie</span> ?
          </h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
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
