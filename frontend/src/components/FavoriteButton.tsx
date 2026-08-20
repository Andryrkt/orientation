import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { useFavoris } from '../lib/use-favoris';
import { FavorisableType } from '../lib/types';

interface FavoriteButtonProps {
  type: FavorisableType;
  entityId: string;
  className?: string;
  compact?: boolean;
}

export function FavoriteButton({ type, entityId, className, compact }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavori, toggle, isLoading } = useFavoris();
  const navigate = useNavigate();

  const active = user ? isFavori(type, entityId) : false;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggle(type, entityId);
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors disabled:opacity-50 ${
          active
            ? 'bg-brand-50 dark:bg-blue-500/10 border-brand-300 dark:border-blue-400 text-brand-600 dark:text-blue-400'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-blue-400 hover:border-brand-300 dark:hover:border-blue-400'
        } ${className ?? ''}`}
      >
        {active ? '★' : '☆'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-md px-3 py-1.5 border transition-colors disabled:opacity-50 ${
        active
          ? 'bg-brand-50 dark:bg-blue-500/10 border-brand-300 dark:border-blue-400 text-brand-700 dark:text-blue-300'
          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
      } ${className ?? ''}`}
    >
      <span>{active ? '★' : '☆'}</span>
      {active ? 'Favori' : 'Ajouter aux favoris'}
    </button>
  );
}
