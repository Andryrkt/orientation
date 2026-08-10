import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Store } from 'lucide-react';
import { api } from '../lib/api';
import { Periode, PointDeVente, SaisieAujourdhui } from '../lib/types';

const PERIODES: { value: Periode; labelKey: string; key: 'midi' | 'apresMidi' }[] = [
  { value: 'MIDI', labelKey: 'saisieJournaliere.midi', key: 'midi' },
  { value: 'APRES_MIDI', labelKey: 'saisieJournaliere.apresMidi', key: 'apresMidi' },
];

function PeriodeCard({ periode, labelKey, statut }: { periode: Periode; labelKey: string; statut: { soumis: boolean; montantGagne?: number; montantDepense?: number } }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [montantGagne, setMontantGagne] = useState(statut.montantGagne?.toString() ?? '');
  const [montantDepense, setMontantDepense] = useState(statut.montantDepense?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);

  const showForm = editing || !statut.soumis;

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/saisies-journalieres', {
        periode,
        montantGagne: Number(montantGagne),
        montantDepense: Number(montantDepense),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saisie-aujourdhui'] });
      setEditing(false);
      setError(null);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">{t(labelKey)}</h3>

      {!showForm ? (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-500 mb-4 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> {t('saisieJournaliere.alreadySubmitted')}
          </div>
          <dl className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{t('saisieJournaliere.montantGagne')}</dt>
              <dd className="font-bold text-slate-900 dark:text-white">{statut.montantGagne?.toLocaleString('fr-FR')} Ar</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{t('saisieJournaliere.montantDepense')}</dt>
              <dd className="font-bold text-slate-900 dark:text-white">{statut.montantDepense?.toLocaleString('fr-FR')} Ar</dd>
            </div>
          </dl>
          <button
            onClick={() => {
              setMontantGagne(statut.montantGagne?.toString() ?? '');
              setMontantDepense(statut.montantDepense?.toString() ?? '');
              setEditing(true);
            }}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('saisieJournaliere.edit')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t('saisieJournaliere.montantGagne')}
            </label>
            <input
              type="number"
              min={0}
              className="field-input"
              value={montantGagne}
              onChange={(e) => setMontantGagne(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t('saisieJournaliere.montantDepense')}
            </label>
            <input
              type="number"
              min={0}
              className="field-input"
              value={montantDepense}
              onChange={(e) => setMontantDepense(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}
          <div className="flex gap-2">
            {statut.soumis && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                {t('saisieJournaliere.cancel')}
              </button>
            )}
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 py-2.5 text-sm">
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t('saisieJournaliere.submit')}
                </span>
              ) : (
                t('saisieJournaliere.submit')
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function SaisieJournaliere() {
  const { t } = useTranslation();

  const { data: pointDeVente, isLoading: loadingPdv } = useQuery({
    queryKey: ['point-de-vente-me'],
    queryFn: async () => (await api.get<PointDeVente | null>('/points-de-vente/me')).data,
  });

  const { data: aujourdhui, isLoading: loadingAujourdhui } = useQuery({
    queryKey: ['saisie-aujourdhui'],
    queryFn: async () => (await api.get<SaisieAujourdhui>('/saisies-journalieres/today')).data,
    enabled: !!pointDeVente,
  });

  if (loadingPdv) {
    return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  }

  if (!pointDeVente) {
    return (
      <div className="glass-card p-8 text-center max-w-lg mx-auto">
        <p className="text-slate-600 dark:text-slate-300">{t('saisieJournaliere.noPointDeVente')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t('saisieJournaliere.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t('saisieJournaliere.subtitle')}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Store className="w-4 h-4" /> {pointDeVente.nom}
        </div>
      </div>

      {loadingAujourdhui || !aujourdhui ? (
        <div className="p-8 text-center text-slate-500">Chargement...</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {PERIODES.map((p) => (
            <PeriodeCard key={p.value} periode={p.value} labelKey={p.labelKey} statut={aujourdhui[p.key]} />
          ))}
        </div>
      )}
    </div>
  );
}
