import { FormEvent, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';

export function Profil() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    region: user?.profil?.region ?? '',
    niveauEtude: user?.profil?.niveauEtude ?? '',
    bio: user?.profil?.bio ?? '',
    interets: (user?.profil?.interets ?? []).join(', '),
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await api.patch('/users/me', {
        ...form,
        interets: form.interets.split(',').map((i) => i.trim()).filter(Boolean),
      });
      await refreshUser();
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="page-title">Mon profil</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-slate-200 rounded-lg p-6">
        {saved && (
          <div className="bg-green-50 text-green-700 text-sm rounded-md px-3 py-2">Profil mis à jour.</div>
        )}
        <p className="text-sm text-slate-500">Email : {user.email}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Prénom</label>
            <input
              className="field-input"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
            <input
              className="field-input"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Région</label>
          <input
            className="field-input"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Niveau d'étude</label>
          <input
            className="field-input"
            value={form.niveauEtude}
            onChange={(e) => setForm({ ...form, niveauEtude: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Bio</label>
          <textarea
            className="field-input"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Centres d'intérêt (séparés par des virgules)
          </label>
          <input
            className="field-input"
            value={form.interets}
            onChange={(e) => setForm({ ...form, interets: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
