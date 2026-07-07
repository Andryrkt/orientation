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
            ? 'bg-brand-50 border-brand-300 text-brand-600'
            : 'bg-white border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-300'
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
          ? 'bg-brand-50 border-brand-300 text-brand-700'
          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
      } ${className ?? ''}`}
    >
      <span>{active ? '★' : '☆'}</span>
      {active ? 'Favori' : 'Ajouter aux favoris'}
    </button>
  );
}
