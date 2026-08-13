import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatMontant } from '../../lib/format';
import { MouvementCaisse, Paginated, PointDeVente, User } from '../../lib/types';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function ilYA30JoursIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
}

export function EtudiantsAdmin() {
  const [dateFrom, setDateFrom] = useState(ilYA30JoursIso());
  const [dateTo, setDateTo] = useState(todayIso());
  const [pointDeVenteId, setPointDeVenteId] = useState('');
  const [saisiParId, setSaisiParId] = useState('');
  const [page, setPage] = useState(1);

  const { data: pointsDeVente } = useQuery({
    queryKey: ['admin-points-de-vente-filtre'],
    queryFn: async () => (await api.get<Paginated<PointDeVente>>('/admin/points-de-vente')).data,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<Paginated<User>>('/admin/users?limit=100')).data,
  });
  const secretaires = usersData?.items.filter((u) => u.role === 'SECRETAIRE') ?? [];

  const { data: etudiants, isLoading } = useQuery({
    queryKey: ['admin-etudiants', dateFrom, dateTo, pointDeVenteId, saisiParId, page],
    queryFn: async () =>
      (
        await api.get<Paginated<MouvementCaisse>>('/admin/etudiants', {
          params: {
            dateFrom,
            dateTo,
            pointDeVenteId: pointDeVenteId || undefined,
            saisiParId: saisiParId || undefined,
            page,
            limit: 20,
          },
        })
      ).data,
  });

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Étudiants inscrits</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={pointDeVenteId}
            onChange={(e) => resetPage(setPointDeVenteId)(e.target.value)}
          >
            <option value="">— Tous les points de vente —</option>
            {pointsDeVente?.items.map((pdv) => (
              <option key={pdv.id} value={pdv.id}>
                {pdv.nom}
                {!pdv.actif ? ' (inactif)' : ''}
              </option>
            ))}
          </select>
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={saisiParId}
            onChange={(e) => resetPage(setSaisiParId)(e.target.value)}
          >
            <option value="">— Toutes les secrétaires —</option>
            {secretaires.map((s) => (
              <option key={s.id} value={s.id}>
                {s.prenom} {s.nom}
              </option>
            ))}
          </select>
          <label className="text-slate-500 dark:text-slate-400">Du</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={dateFrom}
            onChange={(e) => resetPage(setDateFrom)(e.target.value)}
          />
          <label className="text-slate-500 dark:text-slate-400">au</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={dateTo}
            onChange={(e) => resetPage(setDateTo)(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Étudiant</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Filières</th>
              <th className="px-4 py-3 font-medium">Montant total</th>
              <th className="px-4 py-3 font-medium">Reste à payer</th>
              <th className="px-4 py-3 font-medium">Point de vente</th>
              <th className="px-4 py-3 font-medium">Ajouté par</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
            )}
            {!isLoading && etudiants?.items.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Aucun étudiant sur cette période</td></tr>
            )}
            {etudiants?.items.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                  {m.prenom} {m.nom}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{m.contact ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                  {m.filieresInscrites.length > 0
                    ? m.filieresInscrites.map((fi) => fi.filiere.nom).join(', ')
                    : '—'}
                </td>
                <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap">
                  {m.montantTotal !== null ? formatMontant(m.montantTotal) : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {m.montantRestant !== null ? (
                    <span className={m.montantRestant > 0 ? 'text-amber-600 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                      {formatMontant(m.montantRestant)}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{m.pointDeVente?.nom ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {m.saisiPar ? `${m.saisiPar.prenom} ${m.saisiPar.nom}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {etudiants && etudiants.total > etudiants.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Page {etudiants.page} sur {Math.ceil(etudiants.total / etudiants.limit)} ({etudiants.total} étudiants)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                disabled={page >= Math.ceil(etudiants.total / etudiants.limit)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
