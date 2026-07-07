import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Questionnaire } from '../../lib/types';

export function QuestionnairesAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questionnaires'],
    queryFn: async () => (await api.get<Questionnaire[]>('/admin/questionnaires')).data,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/questionnaires', { titre, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questionnaires'] });
      setShowForm(false);
      setTitre('');
      setDescription('');
    },
  });

  const toggleActifMutation = useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      api.patch(`/questionnaires/${id}`, { actif }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questionnaires'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/questionnaires/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questionnaires'] }),
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(message ?? 'Suppression impossible.');
    },
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Questionnaires d'orientation</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700"
        >
          + Nouveau questionnaire
        </button>
      </div>

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-6">
        Rappel du cahier des charges : la méthodologie (référentiel, pondération des scores) doit être
        validée par un spécialiste en psychologie de l'orientation avant la mise en production.
      </p>

      {isLoading && <p className="text-slate-400">Chargement...</p>}

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              <th className="px-4 py-3 font-medium">Résultats</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/admin/questionnaires/${q.id}`} className="text-brand-600 hover:underline font-medium">
                    {q.titre}
                  </Link>
                </td>
                <td className="px-4 py-3">{q._count?.questions ?? 0}</td>
                <td className="px-4 py-3">{q._count?.resultats ?? 0}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActifMutation.mutate({ id: q.id, actif: !q.actif })}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      q.actif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {q.actif ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => confirm('Supprimer ce questionnaire ?') && removeMutation.mutate(q.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Nouveau questionnaire</h2>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Titre</label>
                <input
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
