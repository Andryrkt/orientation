import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Domaine, Metier, Paginated } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

const DOMAINE_IMAGES: Record<string, string> = {
  'sciences-technologies': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
  'sante-medecine': 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=400&q=80',
  'economie-gestion': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  'droit-sciences-politiques': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
  'lettres-sciences-humaines': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80',
  'arts-communication': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80';

// Gradient par domaine
const DOMAINE_COLORS: Record<string, { gradient: string; glow: string; text: string }> = {
  'sciences-technologies': { gradient: 'from-blue-500 to-indigo-500', glow: 'rgba(99,102,241,0.3)', text: '#818cf8' },
  'sante-medecine': { gradient: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.3)', text: '#fb7185' },
  'economie-gestion': { gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  'droit-sciences-politiques': { gradient: 'from-purple-500 to-violet-500', glow: 'rgba(139,92,246,0.3)', text: '#c084fc' },
  'lettres-sciences-humaines': { gradient: 'from-teal-500 to-emerald-500', glow: 'rgba(20,184,166,0.3)', text: '#34d399' },
  'arts-communication': { gradient: 'from-fuchsia-500 to-pink-500', glow: 'rgba(217,70,239,0.3)', text: '#e879f9' },
};

const DEFAULT_COLOR = { gradient: 'from-slate-500 to-slate-600', glow: 'rgba(148,163,184,0.3)', text: '#94a3b8' };

function getColor(slug?: string) {
  if (!slug) return DEFAULT_COLOR;
  return DOMAINE_COLORS[slug] ?? DEFAULT_COLOR;
}

function formatSalary(val: number | null) {
  if (!val) return '—';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val.toString();
}

export function MetiersList() {
  const [searchParams] = useSearchParams();
  const [domaine, setDomaine] = useState(searchParams.get('domaine') ?? '');
  const [q, setQ] = useState('');
  const [niveauRequis, setNiveauRequis] = useState('');

  const { data: domaines } = useQuery({
    queryKey: ['domaines-filter'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['metiers', domaine, q, niveauRequis],
    queryFn: async () =>
      (
        await api.get<Paginated<Metier>>('/metiers', {
          params: {
            limit: 50,
            ...(domaine && { domaine }),
            ...(q && { q }),
            ...(niveauRequis && { niveauRequis }),
          },
        })
      ).data,
  });

  return (
    <div>
      {/* ── Banner ── */}
      <section className="relative overflow-hidden px-6 py-12 sm:py-16 rounded-[2rem] mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(10,8,24,0.4) 100%)',
          border: '1px solid rgba(129,140,248,0.15)',
          backdropFilter: 'blur(10px)',
        }}>
        {/* Glow orbs */}
        <div className="glow-orb w-72 h-72 -top-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)' }} />
        <div className="glow-orb w-48 h-48 -bottom-10 left-1/3"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8' }}>
            📂 Fiches Métiers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Découvre les métiers <span className="gradient-text">à Madagascar</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Explorez les opportunités de carrière, les compétences requises, les salaires locaux et les témoignages de professionnels.
          </p>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="🔍  Rechercher un métier..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="field-input flex-1 min-w-[200px]"
        />
        <select
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
          className="field-input"
        >
          <option value="">Tous les domaines</option>
          {domaines?.items.map((d) => (
            <option key={d.id} value={d.slug}>{d.nom}</option>
          ))}
        </select>
        <select
          value={niveauRequis}
          onChange={(e) => setNiveauRequis(e.target.value)}
          className="field-input"
        >
          <option value="">Tous les niveaux d'études</option>
          <option value="Bac">Bac</option>
          <option value="Licence">Licence</option>
          <option value="Master">Master</option>
          <option value="Doctorat">Doctorat</option>
        </select>
      </div>

      {/* ── Loading / Empty ── */}
      {isLoading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          Chargement...
        </div>
      )}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-500 py-8 text-center">Aucun métier ne correspond à ta recherche.</p>
      )}

      {/* ── Cards Grid ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data?.items.map((m) => {
          const color = getColor(m.domaine?.slug);
          const slugDomaine = m.domaine?.slug || '';
          const imageUrl = DOMAINE_IMAGES[slugDomaine] || DEFAULT_IMAGE;
          
          return (
            <Link
              key={m.id}
              to={`/metiers/${m.slug}`}
              className="group relative block rounded-2xl transition-all duration-300 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = color.glow.replace('0.3', '0.5');
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${color.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Background glow */}
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)` }} />

              {/* Photo d'en-tête de la vignette */}
              <div className="w-full h-36 relative overflow-hidden rounded-t-2xl">
                <img 
                  src={imageUrl} 
                  alt={m.nom}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Domain badge sur l'image */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(10, 8, 24, 0.75)', color: color.text, border: `1px solid ${color.glow}` }}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${color.gradient} inline-block`} />
                    {m.domaine?.nom}
                  </span>
                </div>

                {/* Favorite button sur l'image */}
                <FavoriteButton type="METIER" entityId={m.id} compact className="absolute top-3 right-3 scale-90" />
              </div>

              {/* Contenu textuel inférieur */}
              <div className="p-5 space-y-3">
                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors duration-200 line-clamp-1">
                  {m.nom}
                </h3>
                
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed h-8">
                  {m.description}
                </p>

                {/* Salary & Arrow */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                  {(m.salaireMin || m.salaireMax) ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold"
                      style={{ color: color.text }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatSalary(m.salaireMin)} – {formatSalary(m.salaireMax)} Ar/m.
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Salaire non spécifié</span>
                  )}

                  <div className="flex items-center gap-1 text-[11px] font-bold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    style={{ color: '#c084fc' }}>
                    Voir
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
