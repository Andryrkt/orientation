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
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-8">
      {/* Background glow orbs */}
      <div className="glow-orb w-64 h-64 top-10 right-10 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />
      <div className="glow-orb w-64 h-64 bottom-10 left-10 animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }} />

      <div className="glass-card w-full max-w-lg p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <span className="eyebrow mb-2">Rejoignez-nous</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Inscription</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Créez votre compte OrientMad en quelques instants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 text-sm rounded-xl px-4 py-3 animate-dropdown">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Prénom</label>
              <input
                className="field-input"
                placeholder="ex: Jean"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Nom</label>
              <input
                className="field-input"
                placeholder="ex: Rabe"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="ex: jean.rabe@gmail.com"
              className="field-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Téléphone (optionnel)</label>
            <input
              placeholder="ex: +261 34 00 000 00"
              className="field-input"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Mot de passe</label>
            <input
              type="password"
              placeholder="•••••••• (8 caractères min.)"
              minLength={8}
              className="field-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 text-sm shimmer-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Création en cours...
              </span>
            ) : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 text-center">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
