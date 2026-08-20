import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Page introuvable</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">La page que tu cherches n'existe pas.</p>
      <Link to="/" className="text-brand-600 dark:text-blue-400 hover:underline">Retour à l'accueil</Link>
    </div>
  );
}
