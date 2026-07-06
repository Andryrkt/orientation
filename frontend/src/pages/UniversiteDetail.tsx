import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Universite } from '../lib/types';

export function UniversiteDetail() {
  const { slug } = useParams();
  const { data: universite, isLoading } = useQuery({
    queryKey: ['universite', slug],
    queryFn: async () => (await api.get<Universite>(`/universites/${slug}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!universite) return <p className="text-slate-400">Université introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{universite.nom}</h1>
      <p className="text-slate-500 mb-4">
        {universite.adresse ? `${universite.adresse}, ` : ''}
        {universite.ville}{universite.region ? `, ${universite.region}` : ''}
      </p>
      <p className="text-slate-700 mb-6">{universite.description}</p>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-8">
        {universite.telephone && <span>Tél : {universite.telephone}</span>}
        {universite.email && <span>Email : {universite.email}</span>}
        {universite.siteWeb && (
          <a href={universite.siteWeb} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
            Site web
          </a>
        )}
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Mentions et parcours</h2>
      {(!universite.mentions || universite.mentions.length === 0) && (
        <p className="text-slate-400">Aucune mention renseignée pour le moment.</p>
      )}
      <div className="space-y-4">
        {universite.mentions?.map((mention) => (
          <div key={mention.id} className="bg-white border border-slate-200 rounded-lg p-5">
            <p className="text-xs font-medium text-brand-600 mb-1">{mention.niveau} — {mention.domaine?.nom}</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{mention.nom}</h3>
            <p className="text-slate-600 text-sm mb-3">{mention.description}</p>
            {mention.parcours && mention.parcours.length > 0 && (
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {mention.parcours.map((p) => (
                  <li key={p.id}>
                    <span className="font-medium">{p.nom}</span>
                    {p.duree ? ` — ${p.duree}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
