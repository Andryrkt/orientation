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
  const [dateRdv, setDateRdv] = useState('');
  const [heureRdv, setHeureRdv] = useState('');
  const [messageRdv, setMessageRdv] = useState('');
  const [rdvSent, setRdvSent] = useState(false);

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

  const rdvMutation = useMutation({
    mutationFn: () =>
      api.post('/rendez-vous', {
        cible: 'COACH',
        coachId: id,
        dateSouhaitee: new Date(`${dateRdv}T${heureRdv}`).toISOString(),
        message: messageRdv || undefined,
      }),
    onSuccess: () => {
      setRdvSent(true);
      setDateRdv('');
      setHeureRdv('');
      setMessageRdv('');
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

  function handleRdvSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    rdvMutation.mutate();
  }

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!coach) return <p className="text-slate-400">Coach introuvable.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{coach.prenom} {coach.nom}</h1>
        <FavoriteButton type="COACH" entityId={coach.id} className="shrink-0" />
      </div>

      {coach.noteMoyenne !== null && (
        <p className="text-amber-600 dark:text-amber-400 mb-4">★ {coach.noteMoyenne.toFixed(1)} ({coach.avisCount} avis)</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {coach.specialites.map((s) => (
          <span key={s} className="text-xs bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full px-2 py-1">
            {s}
          </span>
        ))}
      </div>

      {coach.bio && <p className="text-slate-700 dark:text-slate-300 mb-4">{coach.bio}</p>}
      {coach.experience && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-1">Expérience</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{coach.experience}</p>
        </div>
      )}
      {coach.disponibilites && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-1">Disponibilités</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{coach.disponibilites}</p>
        </div>
      )}
      {(coach.email || coach.telephone) && (
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-8">
          {coach.email && <span>Email : {coach.email}</span>}
          {coach.telephone && <span>Tél : {coach.telephone}</span>}
        </div>
      )}

      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">📅 Prendre rendez-vous</h2>

      {user ? (
        rdvSent ? (
          <div className="mb-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-sm rounded-lg px-4 py-3">
            Ta demande a été envoyée à {coach.prenom}. Tu recevras une réponse prochainement dans "Mes rendez-vous".
          </div>
        ) : (
          <form onSubmit={handleRdvSubmit} className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  className="field-input"
                  value={dateRdv}
                  onChange={(e) => setDateRdv(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Heure souhaitée
                </label>
                <input
                  type="time"
                  required
                  className="field-input"
                  value={heureRdv}
                  onChange={(e) => setHeureRdv(e.target.value)}
                />
              </div>
            </div>
            <textarea
              className="field-input"
              rows={2}
              placeholder="Un mot sur le sujet que tu veux aborder (optionnel)..."
              value={messageRdv}
              onChange={(e) => setMessageRdv(e.target.value)}
            />
            {rdvMutation.isError && (
              <p className="text-sm text-red-600 dark:text-red-400">Une erreur est survenue, réessaie.</p>
            )}
            <button type="submit" disabled={rdvMutation.isPending} className="btn-primary">
              {rdvMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </form>
        )
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          <button onClick={() => navigate('/login')} className="text-brand-600 dark:text-blue-400 hover:underline">
            Connecte-toi
          </button>{' '}
          pour prendre rendez-vous.
        </p>
      )}

      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Avis</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNote(n)}
                className={`text-2xl ${n <= note ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}
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
          {sent && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Merci pour ton avis !</p>}
          <button
            type="submit"
            disabled={avisMutation.isPending}
            className="btn-primary mt-2"
          >
            Envoyer mon avis
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          <button onClick={() => navigate('/login')} className="text-brand-600 dark:text-blue-400 hover:underline">
            Connecte-toi
          </button>{' '}
          pour laisser un avis.
        </p>
      )}

      {coach.avis && coach.avis.length > 0 ? (
        <div className="space-y-4">
          {coach.avis.map((a) => (
            <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {a.utilisateur?.prenom} {a.utilisateur?.nom}
                </p>
                <span className="text-amber-500 text-sm">{'★'.repeat(a.note)}</span>
              </div>
              {a.commentaire && <p className="text-sm text-slate-600 dark:text-slate-400">{a.commentaire}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">Aucun avis pour le moment.</p>
      )}
    </div>
  );
}
