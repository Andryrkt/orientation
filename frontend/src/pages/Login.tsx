import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifiant, password);
      navigate('/');
    } catch {
      setError('Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="page-title">Connexion</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Email ou téléphone</label>
          <input
            className="field-input"
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Mot de passe</label>
          <input
            type="password"
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          Se connecter
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-4 text-center">
        Pas encore de compte ? <Link to="/register" className="text-brand-600 hover:underline">S'inscrire</Link>
      </p>
    </div>
  );
}
