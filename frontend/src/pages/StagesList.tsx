import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Domaine, Paginated, Stage } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function StagesList() {
  const [domaine, setDomaine] = useState('');
  const [region, setRegion] = useState('');

  const { data: domaines } = useQuery({
    queryKey: ['domaines-filter'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stages', domaine, region],
    queryFn: async () =>
      (
        await api.get<Paginated<Stage>>('/stages', {
          params: { limit: 50, ...(domaine && { domaine }), ...(region && { region }) },
        })
      ).data,
  });

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 bg-gradient-to-r from-sky-50/60 via-blue-50/40 to-slate-50/60 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-sky-100/50 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-blue-100/40 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100/30 inline-block text-xs font-semibold">
            💼 Expériences Professionnelles
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Trouve ton stage à Madagascar
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explorez les offres de stage en entreprise pour mettre en pratique vos connaissances et débuter votre insertion professionnelle.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filtrer par région..."
          value={region}
          onChange={(e) => setRegion(e.target.value)}
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
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucun stage disponible pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((s) => (
          <Link
            key={s.id}
            to={`/stages/${s.id}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="STAGE" entityId={s.id} compact className="absolute top-4 right-4" />
            <p className="text-xs font-medium text-brand-600 mb-1 pr-8">{s.domaine?.nom ?? s.entreprise}</p>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{s.titre}</h3>
            <p className="text-sm text-slate-500 mb-2">{s.entreprise}{s.region ? ` — ${s.region}` : ''}</p>
            <p className="text-slate-600 text-sm line-clamp-2">{s.description}</p>
            {s.dateLimiteCandidature && (
              <p className="text-xs text-slate-500 mt-3">
                Date limite de candidature : {formatDate(s.dateLimiteCandidature)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
