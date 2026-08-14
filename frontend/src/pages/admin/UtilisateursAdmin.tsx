import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Paginated, Role, User } from '../../lib/types';

const ROLES: Role[] = ['VISITOR', 'STUDENT', 'COACH', 'TEACHER', 'SECRETAIRE', 'MODERATEUR', 'MODERATEUR_FINANCE', 'ADMIN'];

type EmployeForm = { nom: string; prenom: string; email: string; telephone: string; password: string; role: 'SECRETAIRE' | 'MODERATEUR' | 'MODERATEUR_FINANCE' };
const EMPTY_FORM: EmployeForm = { nom: '', prenom: '', email: '', telephone: '', password: '', role: 'SECRETAIRE' };

function CreerEmployeModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EmployeForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => api.post('/admin/users', { ...form, telephone: form.telephone || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Créer un compte employé</h2>
          {error && <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Prénom</label>
              <input
                className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
                required
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nom</label>
              <input
                className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Téléphone (optionnel)</label>
            <input
              className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Mot de passe</label>
            <input
              type="text"
              className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-1">Transmettez-le à l'employé — il pourra le changer ensuite depuis son profil.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Rôle</label>
            <select
              className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as EmployeForm['role'] })}
            >
              <option value="SECRETAIRE">Secrétaire (saisies journalières)</option>
              <option value="MODERATEUR">Modérateur (commentaires du blog)</option>
              <option value="MODERATEUR_FINANCE">Modérateur finance (back-office FIRST ACADEMY)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Créer le compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReinitialiserMotDePasseModal({ user, onClose }: { user: User; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => api.patch(`/admin/users/${user.id}/password`, { newPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSucces(true);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    resetMutation.mutate();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md">
        {succes ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mot de passe réinitialisé</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Nouveau mot de passe pour <strong>{user.prenom} {user.nom}</strong> : <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{newPassword}</code>
            </p>
            <p className="text-xs text-slate-400">Transmettez-le à la personne — elle pourra le changer ensuite depuis son profil.</p>
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700">Fermer</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Réinitialiser le mot de passe — {user.prenom} {user.nom}
            </h2>
            {error && <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nouveau mot de passe temporaire</label>
              <input
                type="text"
                className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                Annuler
              </button>
              <button type="submit" disabled={resetMutation.isPending} className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">
                Réinitialiser
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function UtilisateursAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<Paginated<User>>('/admin/users?limit=100')).data,
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Utilisateurs</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700"
        >
          + Créer un employé
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">Chargement...</td>
              </tr>
            )}
            {data?.items.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{u.prenom} {u.nom}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-sm"
                    value={u.role}
                    onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as Role })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setResetPasswordUser(u)}
                    className="text-brand-600 dark:text-brand-400 hover:underline mr-3"
                  >
                    Réinitialiser mot de passe
                  </button>
                  <button
                    onClick={() => confirm('Supprimer cet utilisateur ?') && remove.mutate(u.id)}
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <CreerEmployeModal onClose={() => setShowForm(false)} />}
      {resetPasswordUser && (
        <ReinitialiserMotDePasseModal user={resetPasswordUser} onClose={() => setResetPasswordUser(null)} />
      )}
    </div>
  );
}
