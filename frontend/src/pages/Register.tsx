import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inscription</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Prénom</label>
            <input
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
            <input
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone (optionnel)</label>
          <input
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Mot de passe</label>
          <input
            type="password"
            minLength={8}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          Créer mon compte
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-4 text-center">
        Déjà inscrit ? <Link to="/login" className="text-brand-600 hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
