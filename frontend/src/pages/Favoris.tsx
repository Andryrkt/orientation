import { Link } from 'react-router-dom';
import { useFavoris } from '../lib/use-favoris';

const TYPE_LABELS: Record<string, string> = {
  METIER: 'Métiers',
  UNIVERSITE: 'Universités',
  STAGE: 'Stages',
  BOURSE: 'Bourses',
  COACH: 'Coachs',
  CENTRE_FORMATION: 'Formation professionnelle',
};

const TYPE_LINK: Record<string, (slug: string) => string> = {
  METIER: (slug) => `/metiers/${slug}`,
  UNIVERSITE: (slug) => `/universites/${slug}`,
  STAGE: (id) => `/stages/${id}`,
  BOURSE: (id) => `/bourses/${id}`,
  COACH: (id) => `/coachs/${id}`,
  CENTRE_FORMATION: (slug) => `/centres-formation/${slug}`,
};

export function Favoris() {
  const { favoris, toggle } = useFavoris();

  const groups = favoris.reduce<Record<string, typeof favoris>>((acc, f) => {
    (acc[f.type] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="page-title">Mes favoris</h1>

      {favoris.length === 0 && (
        <p className="text-slate-400">
          Tu n'as pas encore de favoris. Ajoute des métiers, universités, formations professionnelles, stages, bourses ou coachs depuis leur page de détail.
        </p>
      )}

      <div className="space-y-8">
        {Object.entries(groups).map(([type, items]) => (
          <div key={type}>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3">{TYPE_LABELS[type] ?? type}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {items.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3"
                >
                  {f.entity ? (
                    <Link to={TYPE_LINK[type](f.entity.slug)} className="text-slate-800 dark:text-white font-medium hover:text-brand-600 dark:hover:text-blue-400">
                      {f.entity.nom}
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">Élément supprimé</span>
                  )}
                  <button
                    onClick={() => toggle(f.type, f.entityId)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline shrink-0 ml-3"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
