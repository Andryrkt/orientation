import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Coach } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function CoachDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [sent, setSent] = useState(false);

  const { data: coach, isLoading } = useQuery({
    queryKey: ['coach', id],
    queryFn: async () => (await api.get<Coach>(`/coachs/${id}`)).data,
  });

  const avisMutation = useMutation({
    mutationFn: () => api.post(`/coachs/${id}/avis`, { note, commentaire: commentaire || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach', id] });
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
  if (!coach) return <p className="text-slate-400">Coach introuvable.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900">{coach.prenom} {coach.nom}</h1>
        <FavoriteButton type="COACH" entityId={coach.id} className="shrink-0" />
      </div>

      {coach.noteMoyenne !== null && (
        <p className="text-amber-600 mb-4">★ {coach.noteMoyenne.toFixed(1)} ({coach.avisCount} avis)</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {coach.specialites.map((s) => (
          <span key={s} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-1">
            {s}
          </span>
        ))}
      </div>

      {coach.bio && <p className="text-slate-700 mb-4">{coach.bio}</p>}
      {coach.experience && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-1">Expérience</h3>
          <p className="text-slate-600 text-sm">{coach.experience}</p>
        </div>
      )}
      {coach.disponibilites && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-1">Disponibilités</h3>
          <p className="text-slate-600 text-sm">{coach.disponibilites}</p>
        </div>
      )}
      {(coach.email || coach.telephone) && (
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-8">
          {coach.email && <span>Email : {coach.email}</span>}
          {coach.telephone && <span>Tél : {coach.telephone}</span>}
        </div>
      )}

      <p className="text-xs text-slate-400 mb-8">
        La prise de rendez-vous en ligne sera disponible dans une prochaine version.
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
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            rows={3}
            placeholder="Ton avis (optionnel)..."
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
          {sent && <p className="text-sm text-green-700 mt-2">Merci pour ton avis !</p>}
          <button
            type="submit"
            disabled={avisMutation.isPending}
            className="mt-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
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

      {coach.avis && coach.avis.length > 0 ? (
        <div className="space-y-4">
          {coach.avis.map((a) => (
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
