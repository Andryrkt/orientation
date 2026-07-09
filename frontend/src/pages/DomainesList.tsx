import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Domaine, Paginated } from '../lib/types';

const DOMAINE_THEMES = [
  { gradient: 'from-blue-500 to-indigo-500', glow: 'rgba(99,102,241,0.25)', text: '#818cf8', icon: '💻' },
  { gradient: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.25)', text: '#34d399', icon: '🌱' },
  { gradient: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.25)', text: '#fb7185', icon: '🏥' },
  { gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.25)', text: '#fbbf24', icon: '📊' },
  { gradient: 'from-purple-500 to-violet-500', glow: 'rgba(139,92,246,0.25)', text: '#c084fc', icon: '⚖️' },
  { gradient: 'from-cyan-500 to-sky-500', glow: 'rgba(6,182,212,0.25)', text: '#22d3ee', icon: '🎨' },
];

export function DomainesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  return (
    <div>
      {/* ── Banner ── */}
      <section className="relative overflow-hidden px-6 py-12 sm:py-16 rounded-[2rem] mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(129,140,248,0.08) 50%, rgba(10,8,24,0.4) 100%)',
          border: '1px solid rgba(139,92,246,0.15)',
          backdropFilter: 'blur(10px)',
        }}>
        <div className="glow-orb w-72 h-72 -top-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc' }}>
            🎓 Domaines de formation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Explore les grands domaines <span className="gradient-text">d'études</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Parcourez les filières et secteurs académiques pour structurer votre projet de formation scolaire ou universitaire.
          </p>
        </div>
      </section>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          Chargement...
        </div>
      )}

      {/* ── Cards Grid ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data?.items.map((d, i) => {
          const theme = DOMAINE_THEMES[i % DOMAINE_THEMES.length];
          return (
            <Link
              key={d.id}
              to={`/metiers?domaine=${d.slug}`}
              className="group relative block p-6 rounded-2xl transition-all duration-300 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = theme.glow.replace('0.25', '0.45');
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${theme.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

              {/* Icon pill */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                style={{ boxShadow: `0 4px 16px ${theme.glow}` }}>
                {theme.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-200">
                {d.nom}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">{d.description}</p>

              <div className="flex items-center gap-1 text-xs font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                style={{ color: theme.text }}>
                Explorer les métiers
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
