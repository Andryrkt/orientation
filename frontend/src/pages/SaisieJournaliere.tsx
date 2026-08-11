import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Store, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatMontant } from '../lib/format';
import { MontantInput } from '../components/MontantInput';
import { DroitInscription, Filiere, MouvementsAujourdhui, MouvementsPeriode, Periode, PointDeVente, SaisieAujourdhui, TypeMouvement } from '../lib/types';

const PERIODES: { value: Periode; labelKey: string; key: 'midi' | 'apresMidi' }[] = [
  { value: 'MIDI', labelKey: 'saisieJournaliere.midi', key: 'midi' },
  { value: 'APRES_MIDI', labelKey: 'saisieJournaliere.apresMidi', key: 'apresMidi' },
];

function MouvementsWidget({
  periode,
  mouvements,
  filieres,
  droitInscription,
}: {
  periode: Periode;
  mouvements?: MouvementsPeriode;
  filieres?: Filiere[];
  droitInscription?: number;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [type, setType] = useState<TypeMouvement>('GAGNE');
  const [montant, setMontant] = useState('');
  const [note, setNote] = useState('');
  const [detailsOuverts, setDetailsOuverts] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [contact, setContact] = useState('');
  const [numeroRecu, setNumeroRecu] = useState('');
  const [filiereIds, setFiliereIds] = useState<string[]>([]);
  const [reduction, setReduction] = useState('');
  const [noteReduction, setNoteReduction] = useState('');

  const inscriptionActive = type === 'GAGNE' && detailsOuverts;
  const sommeFilieres = filieres?.filter((f) => filiereIds.includes(f.id)).reduce((s, f) => s + f.prix, 0) ?? 0;
  const montantTotalCalcule = sommeFilieres + (droitInscription ?? 0) - (Number(reduction) || 0);
  const resteAPayer = montantTotalCalcule - (Number(montant) || 0);

  function resetDetails() {
    setNom('');
    setPrenom('');
    setContact('');
    setNumeroRecu('');
    setFiliereIds([]);
    setReduction('');
    setNoteReduction('');
  }

  function toggleFiliere(id: string) {
    setFiliereIds((prochain) => (prochain.includes(id) ? prochain.filter((f) => f !== id) : [...prochain, id]));
  }

  const ajouterMutation = useMutation({
    mutationFn: () =>
      api.post('/saisies-journalieres/mouvements', {
        periode,
        type,
        montant: Number(montant),
        note,
        ...(inscriptionActive
          ? {
              nom: nom.trim() || undefined,
              prenom: prenom.trim() || undefined,
              contact: contact.trim() || undefined,
              numeroRecu: numeroRecu.trim() || undefined,
              filiereIds: filiereIds.length ? filiereIds : undefined,
              montantRestant: resteAPayer,
              montantTotal: montantTotalCalcule,
              reduction: reduction ? Number(reduction) : undefined,
              noteReduction: reduction ? noteReduction.trim() : undefined,
            }
          : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mouvements-aujourdhui'] });
      setMontant('');
      setNote('');
      resetDetails();
    },
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/saisies-journalieres/mouvements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mouvements-aujourdhui'] }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!montant || !note.trim()) return;
    if (inscriptionActive && Number(reduction) > 0 && !noteReduction.trim()) return;
    ajouterMutation.mutate();
  }

  return (
    <details className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-600 dark:text-slate-300">
        {t('saisieJournaliere.mouvements')}
      </summary>
      <p className="text-xs text-slate-400 mt-2 mb-3">{t('saisieJournaliere.mouvementsHint')}</p>

      {mouvements && mouvements.items.length > 0 && (
        <div className="space-y-1.5 mb-3 max-h-52 overflow-y-auto">
          {mouvements.items.map((m) => (
            <div key={m.id} className="flex items-start justify-between text-xs bg-slate-100 dark:bg-white/5 rounded-md px-2.5 py-1.5">
              <span className={m.type === 'GAGNE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                {m.type === 'GAGNE' ? '+' : '−'} {formatMontant(m.montant)}
                {m.note ? ` · ${m.note}` : ''}
                {(m.nom || m.prenom || m.filieres.length > 0 || m.montantTotal != null) && (
                  <span className="block text-slate-500 dark:text-slate-400 mt-0.5">
                    {[m.prenom, m.nom].filter(Boolean).join(' ')}
                    {m.filieres.length > 0 ? ` · ${m.filieres.map((f) => f.nom).join(' + ')}` : ''}
                    {m.numeroRecu ? ` · Reçu ${m.numeroRecu}` : ''}
                    {m.montantTotal != null
                      ? ` · ${formatMontant(m.montant)} / ${formatMontant(m.montantTotal)}${m.montantRestant != null ? ` (reste ${formatMontant(m.montantRestant)})` : ''}`
                      : ''}
                    {m.reduction ? ` · réduction ${formatMontant(m.reduction)}${m.noteReduction ? ` (${m.noteReduction})` : ''}` : ''}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => supprimerMutation.mutate(m.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors shrink-0 ml-2"
                aria-label={t('saisieJournaliere.mouvementsDelete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {(!mouvements || mouvements.items.length === 0) && (
        <p className="text-xs text-slate-400 mb-3">{t('saisieJournaliere.mouvementsEmpty')}</p>
      )}

      {mouvements && mouvements.items.length > 0 && (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
          {t('saisieJournaliere.mouvementsTotal')} : +{formatMontant(mouvements.totalGagne)} / −{formatMontant(mouvements.totalDepense)}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TypeMouvement)}
            className="field-input text-xs py-1.5 w-auto"
          >
            <option value="GAGNE">{t('saisieJournaliere.mouvementsTypeGagne')}</option>
            <option value="DEPENSE">{t('saisieJournaliere.mouvementsTypeDepense')}</option>
          </select>
          {!inscriptionActive && (
            <MontantInput
              placeholder={t('saisieJournaliere.mouvementsMontant')}
              value={montant}
              onChange={setMontant}
              className="field-input text-xs py-1.5 w-28"
              required
            />
          )}
          <input
            type="text"
            placeholder={t('saisieJournaliere.mouvementsNote')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="field-input text-xs py-1.5 flex-1 min-w-[100px]"
            required
          />
          <button type="submit" disabled={ajouterMutation.isPending} className="btn-secondary text-xs py-1.5 px-3">
            {t('saisieJournaliere.mouvementsAdd')}
          </button>
        </div>

        {type === 'GAGNE' && (
          <div>
            <button
              type="button"
              onClick={() => setDetailsOuverts((o) => !o)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {detailsOuverts ? '▾' : '▸'} {t('saisieJournaliere.mouvementsDetailsInscription')}
            </button>
            {detailsOuverts && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="text"
                  placeholder={t('saisieJournaliere.mouvementsNom')}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="field-input text-xs py-1.5"
                />
                <input
                  type="text"
                  placeholder={t('saisieJournaliere.mouvementsPrenom')}
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="field-input text-xs py-1.5"
                />
                <input
                  type="text"
                  placeholder={t('saisieJournaliere.mouvementsContact')}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="field-input text-xs py-1.5"
                />
                <input
                  type="text"
                  placeholder={t('saisieJournaliere.mouvementsNumeroRecu')}
                  value={numeroRecu}
                  onChange={(e) => setNumeroRecu(e.target.value)}
                  className="field-input text-xs py-1.5"
                />
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('saisieJournaliere.mouvementsFiliere')}</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md p-2">
                    {filieres?.map((f) => (
                      <label key={f.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filiereIds.includes(f.id)}
                          onChange={() => toggleFiliere(f.id)}
                        />
                        {f.nom} — {formatMontant(f.prix)}
                      </label>
                    ))}
                    {!filieres?.length && (
                      <p className="text-xs text-slate-400">Aucune filière disponible</p>
                    )}
                  </div>
                </div>
                <div className="field-input text-xs py-1.5 flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('saisieJournaliere.mouvementsDroitInscription')}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMontant(droitInscription ?? 0)}</span>
                </div>
                <MontantInput
                  placeholder={t('saisieJournaliere.mouvementsReduction')}
                  value={reduction}
                  onChange={setReduction}
                  className="field-input text-xs py-1.5"
                />
                {Number(reduction) > 0 && (
                  <input
                    type="text"
                    placeholder={t('saisieJournaliere.mouvementsNoteReduction')}
                    value={noteReduction}
                    onChange={(e) => setNoteReduction(e.target.value)}
                    className="field-input text-xs py-1.5 col-span-2"
                    required
                  />
                )}
                <MontantInput
                  placeholder={t('saisieJournaliere.mouvementsMontantPaye')}
                  value={montant}
                  onChange={setMontant}
                  className="field-input text-xs py-1.5"
                  required
                />
                <div className="field-input text-xs py-1.5 flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('saisieJournaliere.mouvementsMontantTotal')}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMontant(montantTotalCalcule)}</span>
                </div>
                <div className="field-input text-xs py-1.5 flex items-center justify-between text-slate-500 dark:text-slate-400 col-span-2">
                  <span>{t('saisieJournaliere.mouvementsResteAPayer')}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMontant(resteAPayer)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </details>
  );
}

function PeriodeCard({
  periode,
  labelKey,
  statut,
  mouvements,
  filieres,
  droitInscription,
}: {
  periode: Periode;
  labelKey: string;
  statut: { soumis: boolean; montantGagne?: number; montantDepense?: number };
  mouvements?: MouvementsPeriode;
  filieres?: Filiere[];
  droitInscription?: number;
}) {
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
              <dd className="font-bold text-slate-900 dark:text-white">
                {statut.montantGagne !== undefined ? formatMontant(statut.montantGagne) : ''}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{t('saisieJournaliere.montantDepense')}</dt>
              <dd className="font-bold text-slate-900 dark:text-white">
                {statut.montantDepense !== undefined ? formatMontant(statut.montantDepense) : ''}
              </dd>
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
            <MontantInput className="field-input" value={montantGagne} onChange={setMontantGagne} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t('saisieJournaliere.montantDepense')}
            </label>
            <MontantInput className="field-input" value={montantDepense} onChange={setMontantDepense} required />
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

      <MouvementsWidget periode={periode} mouvements={mouvements} filieres={filieres} droitInscription={droitInscription} />
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

  const { data: mouvementsAujourdhui } = useQuery({
    queryKey: ['mouvements-aujourdhui'],
    queryFn: async () => (await api.get<MouvementsAujourdhui>('/saisies-journalieres/mouvements/aujourdhui')).data,
    enabled: !!pointDeVente,
  });

  const { data: filieres } = useQuery({
    queryKey: ['filieres'],
    queryFn: async () => (await api.get<Filiere[]>('/filieres')).data,
    enabled: !!pointDeVente,
  });

  const { data: droitInscription } = useQuery({
    queryKey: ['droit-inscription'],
    queryFn: async () => (await api.get<DroitInscription>('/droit-inscription')).data,
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
            <PeriodeCard
              key={p.value}
              periode={p.value}
              labelKey={p.labelKey}
              statut={aujourdhui[p.key]}
              mouvements={mouvementsAujourdhui?.[p.key]}
              filieres={filieres}
              droitInscription={droitInscription?.montant}
            />
          ))}
        </div>
      )}
    </div>
  );
}
