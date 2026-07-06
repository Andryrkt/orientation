import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AdminStats } from '../../lib/types';

const LABELS: Record<keyof AdminStats, string> = {
  utilisateurs: 'Utilisateurs',
  domaines: 'Domaines',
  metiers: 'Métiers',
  universites: 'Universités',
  mentions: 'Mentions',
  parcours: 'Parcours',
};

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get<AdminStats>('/admin/stats')).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>
      {isLoading && <p className="text-slate-400">Chargement...</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data &&
          (Object.keys(LABELS) as (keyof AdminStats)[]).map((key) => (
            <div key={key} className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-sm text-slate-500">{LABELS[key]}</p>
              <p className="text-3xl font-bold text-brand-700 mt-1">{data[key]}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
