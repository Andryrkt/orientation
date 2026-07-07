import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { BlogCommentaire, CommentaireStatut, Paginated } from '../../lib/types';

const STATUTS: { value: CommentaireStatut | ''; label: string }[] = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'APPROUVE', label: 'Approuvés' },
  { value: 'REJETE', label: 'Rejetés' },
  { value: '', label: 'Tous' },
];

export function BlogCommentairesAdmin() {
  const [statut, setStatut] = useState<CommentaireStatut | ''>('EN_ATTENTE');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog-commentaires', statut],
    queryFn: async () =>
      (
        await api.get<Paginated<BlogCommentaire>>('/admin/blog-commentaires', {
          params: { limit: 100, ...(statut && { statut }) },
        })
      ).data,
  });

  const moderate = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: CommentaireStatut }) =>
      api.patch(`/admin/blog-commentaires/${id}`, { statut }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-commentaires'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/blog-commentaires/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-commentaires'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Modération des commentaires</h1>

      <div className="flex gap-2 mb-6">
        {STATUTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatut(s.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
              statut === s.value
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && <p className="text-slate-400">Aucun commentaire.</p>}

      <div className="space-y-3">
        {data?.items.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-800">
                {c.utilisateur?.prenom} {c.utilisateur?.nom}
                {c.blog && (
                  <>
                    {' '}sur{' '}
                    <Link to={`/blog/${c.blog.slug}`} className="text-brand-600 hover:underline">
                      {c.blog.titre}
                    </Link>
                  </>
                )}
              </p>
              <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{c.contenu}</p>
            <div className="flex gap-3 text-sm">
              {c.statut !== 'APPROUVE' && (
                <button
                  onClick={() => moderate.mutate({ id: c.id, statut: 'APPROUVE' })}
                  className="text-green-600 hover:underline"
                >
                  Approuver
                </button>
              )}
              {c.statut !== 'REJETE' && (
                <button
                  onClick={() => moderate.mutate({ id: c.id, statut: 'REJETE' })}
                  className="text-amber-600 hover:underline"
                >
                  Rejeter
                </button>
              )}
              <button
                onClick={() => confirm('Supprimer ce commentaire ?') && remove.mutate(c.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
