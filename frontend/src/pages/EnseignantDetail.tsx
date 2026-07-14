import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Enseignant } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function EnseignantDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [sent, setSent] = useState(false);

  const { data: enseignant, isLoading } = useQuery({
    queryKey: ['enseignant', id],
    queryFn: async () => (await api.get<Enseignant>(`/enseignants/${id}`)).data,
  });

  const avisMutation = useMutation({
    mutationFn: () => api.post(`/enseignants/${id}/avis`, { note, commentaire: commentaire || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enseignant', id] });
      setSent(true);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    avisMutation.mutate();
  }

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!enseignant) return <p className="text-slate-400">Enseignant introuvable.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{enseignant.prenom} {enseignant.nom}</h1>
          {enseignant.etablissement && (
            <p className="text-base text-purple-600 dark:text-purple-400 font-bold mt-1">
              🏫 Établissement : {enseignant.etablissement}
            </p>
          )}
        </div>
        <FavoriteButton type="ENSEIGNANT" entityId={enseignant.id} className="shrink-0" />
      </div>

      {enseignant.noteMoyenne !== null && (
        <p className="text-amber-600 mb-4">★ {enseignant.noteMoyenne.toFixed(1)} ({enseignant.avisCount} avis)</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {enseignant.matieres.map((m) => (
          <span key={m} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-1">
            {m}
          </span>
        ))}
      </div>

      {enseignant.bio && <p className="text-slate-700 mb-4">{enseignant.bio}</p>}
      {enseignant.disponibilites && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-1">Disponibilités</h3>
          <p className="text-slate-600 text-sm">{enseignant.disponibilites}</p>
        </div>
      )}
      {(enseignant.email || enseignant.telephone) && (
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-8">
          {enseignant.email && <span>Email : {enseignant.email}</span>}
          {enseignant.telephone && <span>Tél : {enseignant.telephone}</span>}
        </div>
      )}

      <p className="text-xs text-slate-400 mb-8">
        La prise de contact direct pour des cours ou conseils académiques est soumise à la charte d'OrientMad.
      </p>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Avis</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNote(n)}
                className={`text-2xl ${n <= note ? 'text-amber-500' : 'text-slate-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="field-input"
            rows={3}
            placeholder="Ton avis (optionnel)..."
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
          {sent && <p className="text-sm text-green-700 mt-2">Merci pour ton avis !</p>}
          <button
            type="submit"
            disabled={avisMutation.isPending}
            className="btn-primary mt-2"
          >
            Envoyer mon avis
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500 mb-8">
          <button onClick={() => navigate('/login')} className="text-brand-600 hover:underline">
            Connecte-toi
          </button>{' '}
          pour laisser un avis.
        </p>
      )}

      {enseignant.avis && enseignant.avis.length > 0 ? (
        <div className="space-y-4">
          {enseignant.avis.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-800">
                  {a.utilisateur?.prenom} {a.utilisateur?.nom}
                </p>
                <span className="text-amber-500 text-sm">{'★'.repeat(a.note)}</span>
              </div>
              {a.commentaire && <p className="text-sm text-slate-600">{a.commentaire}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">Aucun avis pour le moment.</p>
      )}
    </div>
  );
}
