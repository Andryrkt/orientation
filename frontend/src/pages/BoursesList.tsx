import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Bourse, Domaine, Paginated } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function BoursesList() {
  const [domaine, setDomaine] = useState('');
  const [pays, setPays] = useState('');

  const { data: domaines } = useQuery({
    queryKey: ['domaines-filter'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['bourses', domaine, pays],
    queryFn: async () =>
      (
        await api.get<Paginated<Bourse>>('/bourses', {
          params: { limit: 50, ...(domaine && { domaine }), ...(pays && { pays }) },
        })
      ).data,
  });

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 bg-gradient-to-r from-amber-50/60 via-yellow-50/40 to-slate-50/60 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-100/50 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-yellow-100/40 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100/30 inline-block text-xs font-semibold">
            🎓 Financement &amp; Soutien
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Trouve une bourse d'études
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Découvrez des opportunités de bourses nationales et internationales adaptées à votre profil académique pour financer vos études.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filtrer par pays..."
          value={pays}
          onChange={(e) => setPays(e.target.value)}
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
        <p className="text-slate-400">Aucune bourse disponible pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((b) => (
          <Link
            key={b.id}
            to={`/bourses/${b.id}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="BOURSE" entityId={b.id} compact className="absolute top-4 right-4" />
            <p className="text-xs font-medium text-brand-600 mb-1 pr-8">{b.organisme}</p>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{b.nom}</h3>
            <p className="text-sm text-slate-500 mb-2">{b.pays}</p>
            {b.montant && <p className="text-slate-600 text-sm">{b.montant}</p>}
            {b.dateLimite && (
              <p className="text-xs text-slate-500 mt-3">
                Date limite : {formatDate(b.dateLimite)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
