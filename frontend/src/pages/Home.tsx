import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
const FEATURES = [
  { title: 'Métiers', desc: "Explore les métiers, leurs débouchés et les compétences requises.", to: '/metiers', icon: IconBriefcase },
  { title: 'Domaines', desc: 'Parcours les grands domaines de formation et leurs filières associées.', to: '/domaines', icon: IconAcademic },
  { title: 'Universités', desc: 'Trouve les établissements et parcours de formation à Madagascar.', to: '/universites', icon: IconBuilding },
  { title: 'Centres de formation', desc: 'Découvre les centres et instituts spécialisés près de chez toi.', to: '/centres-formation', icon: IconBuilding },
  { title: 'Coachs', desc: "Échange avec des coachs d'orientation pour affiner ton choix.", to: '/coachs', icon: IconUsers },
  { title: 'Blog & conseils', desc: "Des articles et témoignages pour t'aider à choisir ta voie.", to: '/blog', icon: IconDocument },
];

const STEPS = [
  { title: 'Explore', desc: 'Parcours les métiers, domaines et universités à Madagascar.' },
  { title: 'Réponds au questionnaire', desc: "Identifie tes intérêts et affinités grâce à notre test d'orientation." },
  { title: 'Décide', desc: 'Compare les résultats, échange avec un coach et fais ton choix en confiance.' },
];

const STATS = [
  { value: '100%', label: 'Gratuit' },
  { value: '6', label: 'Domaines couverts' },
  { value: 'Mada.', label: 'Contenu 100% local' },
];

function FeatureCard({ title, desc, to, icon: Icon }: { title: string; desc: string; to: string; icon: () => ReactNode }) {
  return (
    <Link to={to} className="card block p-6">
      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <Icon />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </Link>
  );
}

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden -mx-4 px-4 py-16 sm:py-20 rounded-3xl">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-slate-50" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-100/70 blur-3xl -z-10" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl -z-10" />

        <div className="text-center max-w-3xl mx-auto">
          <span className="eyebrow mb-4 px-3 py-1 rounded-full bg-brand-50">
            Orientation scolaire &amp; professionnelle
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Trouve ta voie avec <span className="text-brand-600">OrientMad</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            La plateforme de référence pour l'orientation scolaire, universitaire et professionnelle
            à Madagascar : métiers, formations, universités et bien plus.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link to="/metiers" className="btn-primary">
              Découvrir les métiers
            </Link>
            <Link to="/questionnaire" className="btn-secondary">
              Faire le questionnaire
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="eyebrow mb-2">Explore</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tout pour construire ton avenir</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="eyebrow mb-2">Comment ça marche</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Trois étapes vers ta décision</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center px-2">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1.5">{step.title}</h3>
              <p className="text-slate-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden -mx-4 px-4 py-14 rounded-3xl mb-4">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-600 to-brand-800" />
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Prêt à découvrir ta voie ?
          </h2>
          <p className="text-brand-100 mb-7">
            Crée ton compte gratuitement et accède au questionnaire d'orientation, à tes favoris et bien plus.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="px-6 py-3 bg-white text-brand-700 rounded-lg font-medium hover:bg-brand-50 transition-colors">
              Créer un compte
            </Link>
            <Link to="/universites" className="px-6 py-3 border border-white/40 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
              Explorer les universités
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
