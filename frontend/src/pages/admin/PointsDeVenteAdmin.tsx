import { Fragment, FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Paginated, PointDeVente, User } from '../../lib/types';

type FormState = { nom: string; adresse: string; ville: string };
const EMPTY_FORM: FormState = { nom: '', adresse: '', ville: '' };

export function PointsDeVenteAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PointDeVente | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [gererId, setGererId] = useState<string | null>(null);
  const [nouvelleSecretaireId, setNouvelleSecretaireId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-points-de-vente'],
    queryFn: async () => (await api.get<Paginated<PointDeVente>>('/admin/points-de-vente')).data,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<Paginated<User>>('/admin/users?limit=100')).data,
  });
  const secretaires = usersData?.items.filter((u) => u.role === 'SECRETAIRE') ?? [];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-points-de-vente'] });
  }

  function showApiError(err: unknown) {
    const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
  }

  const createMutation = useMutation({
    mutationFn: (payload: FormState) => api.post('/admin/points-de-vente', payload),
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setForm(EMPTY_FORM);
      setError(null);
    },
    onError: showApiError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FormState> }) =>
      api.patch(`/admin/points-de-vente/${id}`, payload),
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setEditing(null);
      setError(null);
    },
    onError: showApiError,
  });

  const toggleActifMutation = useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      api.patch(`/admin/points-de-vente/${id}/${actif ? 'reactivate' : 'deactivate'}`),
    onSuccess: invalidate,
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, utilisateurId }: { id: string; utilisateurId: string }) =>
      api.post(`/admin/points-de-vente/${id}/secretaires`, { utilisateurId }),
    onSuccess: () => {
      invalidate();
      setNouvelleSecretaireId('');
    },
    onError: showApiError,
  });

  const unassignMutation = useMutation({
    mutationFn: ({ id, utilisateurId }: { id: string; utilisateurId: string }) =>
      api.delete(`/admin/points-de-vente/${id}/secretaires/${utilisateurId}`),
    onSuccess: invalidate,
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(pdv: PointDeVente) {
    setEditing(pdv);
    setForm({ nom: pdv.nom, adresse: pdv.adresse ?? '', ville: pdv.ville ?? '' });
    setError(null);
    setShowForm(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Points de vente</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700"
        >
          + Ajouter
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Secrétaires</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Chargement...</td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucun point de vente</td>
              </tr>
            )}
            {data?.items.map((pdv) => (
              <Fragment key={pdv.id}>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{pdv.nom}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{pdv.ville ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        pdv.actif ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {pdv.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {pdv.secretaires && pdv.secretaires.length > 0
                      ? pdv.secretaires.map((s) => `${s.prenom} ${s.nom}`).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setGererId(gererId === pdv.id ? null : pdv.id)}
                      className="text-brand-600 dark:text-brand-400 hover:underline mr-3"
                    >
                      Secrétaires
                    </button>
                    <button onClick={() => openEdit(pdv)} className="text-brand-600 dark:text-brand-400 hover:underline mr-3">
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleActifMutation.mutate({ id: pdv.id, actif: !pdv.actif })}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      {pdv.actif ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
                {gererId === pdv.id && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 bg-slate-50 dark:bg-slate-800/40">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Secrétaires assignées
                      </p>
                      <ul className="space-y-1 mb-3">
                        {(pdv.secretaires ?? []).map((s) => (
                          <li key={s.id} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                            <span>{s.prenom} {s.nom} ({s.email})</span>
                            <button
                              onClick={() => unassignMutation.mutate({ id: pdv.id, utilisateurId: s.id })}
                              className="text-red-600 dark:text-red-400 hover:underline text-xs"
                            >
                              Retirer
                            </button>
                          </li>
                        ))}
                        {(pdv.secretaires ?? []).length === 0 && (
                          <li className="text-sm text-slate-400">Aucune secrétaire assignée</li>
                        )}
                      </ul>
                      <div className="flex items-center gap-2">
                        <select
                          className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-sm"
                          value={nouvelleSecretaireId}
                          onChange={(e) => setNouvelleSecretaireId(e.target.value)}
                        >
                          <option value="">— Choisir une secrétaire —</option>
                          {secretaires.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.prenom} {s.nom} ({s.email})
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={!nouvelleSecretaireId}
                          onClick={() => assignMutation.mutate({ id: pdv.id, utilisateurId: nouvelleSecretaireId })}
                          className="px-3 py-1 bg-brand-600 text-white rounded-md text-xs font-medium hover:bg-brand-700 disabled:opacity-50"
                        >
                          Assigner
                        </button>
                      </div>
                      {secretaires.length === 0 && (
                        <p className="text-xs text-slate-400 mt-2">
                          Aucun utilisateur n'a le rôle SECRETAIRE. Attribuez-le depuis la page Utilisateurs.
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editing ? 'Modifier' : 'Ajouter'} — Point de vente
              </h2>
              {error && <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nom</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Adresse</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Ville</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
