import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Loader2, Search, Store, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatMontant } from '../lib/format';
import { MontantInput } from '../components/MontantInput';
import { DroitInscription, Filiere, InscriptionFiliereSuivi, MouvementCaisse, MouvementsAujourdhui, MouvementsPeriode, Periode, PointDeVente, SaisieAujourdhui, TypeMouvement } from '../lib/types';

const PERIODES: { value: Periode; labelKey: string; key: 'midi' | 'apresMidi' }[] = [
  { value: 'MIDI', labelKey: 'saisieJournaliere.midi', key: 'midi' },
  { value: 'APRES_MIDI', labelKey: 'saisieJournaliere.apresMidi', key: 'apresMidi' },
];

// "date" est une chaîne YYYY-MM-DD sans heure : construire la date à partir des composantes locales
// pour éviter un décalage de jour si `new Date(dateStr)` était interprété en UTC.
function formatDateAffichage(dateStr: string) {
  const [annee, mois, jour] = dateStr.split('-').map(Number);
  const date = new Date(annee, mois - 1, jour);
  const texte = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

type DureeRaccourci = '4_SEMAINES' | '5_SEMAINES' | '1_MOIS';

// Calcule une date au format YYYY-MM-DD à partir d'une date de départ + une durée, en construisant
// les dates via leurs composantes locales pour éviter tout décalage de fuseau horaire.
function ajouterDuree(dateDebutStr: string, duree: DureeRaccourci): string {
  const [annee, mois, jour] = dateDebutStr.split('-').map(Number);
  const date = new Date(annee, mois - 1, jour);
  if (duree === '4_SEMAINES') date.setDate(date.getDate() + 28);
  else if (duree === '5_SEMAINES') date.setDate(date.getDate() + 35);
  else date.setMonth(date.getMonth() + 1);
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
  const [recherche, setRecherche] = useState('');
  const [rechercheDebattue, setRechercheDebattue] = useState('');
  // Un étudiant qui revient payer son reste à payer : ce paiement se rattache à cette inscription
  // existante plutôt que d'en créer une nouvelle (voir `payerLeReste`).
  const [paiementPour, setPaiementPour] = useState<MouvementCaisse | null>(null);
  // Inscription source d'une duplication (renouvellement) : simple aide visuelle, la nouvelle
  // inscription créée reste indépendante (pas de lien comme pour un paiement complémentaire).
  const [dupliqueDe, setDupliqueDe] = useState<MouvementCaisse | null>(null);
  const [ajoutFiliereOuvert, setAjoutFiliereOuvert] = useState(false);

  useEffect(() => {
    const minuteur = setTimeout(() => setRechercheDebattue(recherche.trim()), 300);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  const { data: resultatsRecherche } = useQuery({
    queryKey: ['recherche-etudiants', rechercheDebattue],
    queryFn: async () => (await api.get<MouvementCaisse[]>('/saisies-journalieres/mouvements/recherche', { params: { q: rechercheDebattue } })).data,
    enabled: rechercheDebattue.length >= 2,
  });

  function dupliquer(m: MouvementCaisse) {
    setPaiementPour(null);
    setDupliqueDe(m);
    setNom(m.nom ?? '');
    setPrenom(m.prenom ?? '');
    setContact(m.contact ?? '');
    setFiliereIds(m.filieresInscrites.map((fi) => fi.filiereId));
    setNumeroRecu('');
    setRecherche('');
  }

  function payerLeReste(m: MouvementCaisse) {
    setPaiementPour(m);
    setDupliqueDe(null);
    setNom(m.nom ?? '');
    setPrenom(m.prenom ?? '');
    setContact(m.contact ?? '');
    setFiliereIds([]);
    setNumeroRecu('');
    setReduction('');
    setNoteReduction('');
    setMontant('');
    setRecherche('');
    setDetailsOuverts(true);
  }

  const inscriptionActive = type === 'GAGNE' && detailsOuverts;
  const detailInscriptionRenseigne = inscriptionActive && !!(nom.trim() || prenom.trim() || contact.trim() || numeroRecu.trim() || filiereIds.length > 0);
  const sommeFilieres = filieres?.filter((f) => filiereIds.includes(f.id)).reduce((s, f) => s + f.prix, 0) ?? 0;
  // Une filière déjà suivie via l'inscription d'origine ou un paiement complémentaire précédent
  // (ajout de filière antérieur) ne doit pas être proposée une deuxième fois.
  const filieresDejaInscritesIds = new Set([
    ...(paiementPour?.filieresInscrites.map((fi) => fi.filiereId) ?? []),
    ...(paiementPour?.paiementsComplementaires?.flatMap((p) => p.filieresInscrites?.map((fi) => fi.filiereId) ?? []) ?? []),
  ]);
  const filieresDisponiblesPourAjout = filieres?.filter((f) => !filieresDejaInscritesIds.has(f.id)) ?? [];
  // Renouvellement d'un étudiant déjà inscrit ("Dupliquer") : le droit d'inscription n'est pas
  // refacturé, une seule fois par étudiant.
  const droitInscriptionApplicable = dupliqueDe ? 0 : droitInscription ?? 0;
  const montantTotalCalcule = paiementPour
    ? (paiementPour.montantTotal ?? 0) + sommeFilieres
    : sommeFilieres + droitInscriptionApplicable - (Number(reduction) || 0);
  // Solde tel que connu par le serveur avant ce paiement (les nouvelles filières cochées ne sont
  // pas encore enregistrées) — distinct du solde final affiché une fois ce paiement pris en compte.
  const resteActuelAvantPaiement = paiementPour?.montantRestantActuel ?? 0;
  const resteAPayer = paiementPour
    ? resteActuelAvantPaiement + sommeFilieres - (Number(montant) || 0)
    : montantTotalCalcule - (Number(montant) || 0);

  function resetDetails() {
    setNom('');
    setPrenom('');
    setContact('');
    setNumeroRecu('');
    setFiliereIds([]);
    setReduction('');
    setNoteReduction('');
    setPaiementPour(null);
    setDupliqueDe(null);
    setAjoutFiliereOuvert(false);
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
        note: note.trim() || undefined,
        ...(paiementPour
          ? {
              numeroRecu: numeroRecu.trim() || undefined,
              inscriptionParentId: paiementPour.id,
              filiereIds: filiereIds.length ? filiereIds : undefined,
            }
          : inscriptionActive
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
              sansDroitInscription: dupliqueDe ? true : undefined,
            }
          : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mouvements-aujourdhui'] });
      queryClient.invalidateQueries({ queryKey: ['filieres-inscrites-suivi'] });
      queryClient.invalidateQueries({ queryKey: ['recherche-etudiants'] });
      setMontant('');
      setNote('');
      resetDetails();
    },
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/saisies-journalieres/mouvements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mouvements-aujourdhui'] });
      queryClient.invalidateQueries({ queryKey: ['filieres-inscrites-suivi'] });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!montant) return;
    if (paiementPour) {
      ajouterMutation.mutate();
      return;
    }
    if (!note.trim() && !detailInscriptionRenseigne) return;
    if (detailInscriptionRenseigne && (!nom.trim() || !prenom.trim())) return;
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
                {(m.nom || m.prenom || m.filieresInscrites.length > 0 || m.montantTotal != null) && (
                  <span className="block text-slate-500 dark:text-slate-400 mt-0.5">
                    {[m.prenom, m.nom].filter(Boolean).join(' ')}
                    {m.filieresInscrites.length > 0 ? ` · ${m.filieresInscrites.map((fi) => fi.filiere.nom).join(' + ')}` : ''}
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
            required={!detailInscriptionRenseigne}
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
            {detailsOuverts && paiementPour && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between bg-emerald-500/10 rounded-md px-2.5 py-2">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {t('saisieJournaliere.paiementComplementaireTitre')} — {[paiementPour.prenom, paiementPour.nom].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('saisieJournaliere.resteAPayerActuel')} : {formatMontant(resteActuelAvantPaiement)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetDetails}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:underline shrink-0 ml-2"
                  >
                    {t('saisieJournaliere.annulerSelection')}
                  </button>
                </div>
                <p className="text-xs text-slate-400">{t('saisieJournaliere.paiementComplementaireHint')}</p>

                {filieresDisponiblesPourAjout.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setAjoutFiliereOuvert((o) => !o)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {ajoutFiliereOuvert ? '▾' : '▸'} {t('saisieJournaliere.ajouterFiliere')}
                    </button>
                    {ajoutFiliereOuvert && (
                      <div className="mt-1.5 space-y-1 max-h-32 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md p-2">
                        {filieresDisponiblesPourAjout.map((f) => (
                          <label key={f.id} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={filiereIds.includes(f.id)} onChange={() => toggleFiliere(f.id)} />
                            {f.nom} — {formatMontant(f.prix)}
                          </label>
                        ))}
                        <p className="text-[10px] text-slate-400 pt-1">{t('saisieJournaliere.ajouterFiliereHint')}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={t('saisieJournaliere.mouvementsNumeroRecu')}
                    value={numeroRecu}
                    onChange={(e) => setNumeroRecu(e.target.value)}
                    className="field-input text-xs py-1.5"
                  />
                  <MontantInput
                    placeholder={t('saisieJournaliere.mouvementsMontantPaye')}
                    value={montant}
                    onChange={setMontant}
                    className="field-input text-xs py-1.5"
                    required
                  />
                  {sommeFilieres > 0 && (
                    <div className="field-input text-xs py-1.5 flex items-center justify-between text-slate-500 dark:text-slate-400 col-span-2">
                      <span>{t('saisieJournaliere.mouvementsMontantTotal')}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMontant(montantTotalCalcule)}</span>
                    </div>
                  )}
                  <div className="field-input text-xs py-1.5 flex items-center justify-between text-slate-500 dark:text-slate-400 col-span-2">
                    <span>{t('saisieJournaliere.mouvementsResteAPayer')}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMontant(Math.max(0, resteAPayer))}</span>
                  </div>
                </div>
              </div>
            )}
            {detailsOuverts && !paiementPour && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dupliqueDe && (
                  <div className="col-span-2 flex items-center justify-between bg-blue-500/10 rounded-md px-2.5 py-2">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {t('saisieJournaliere.dupliqueDeTitre')} — {[dupliqueDe.prenom, dupliqueDe.nom].filter(Boolean).join(' ')}
                      {dupliqueDe.numeroRecu ? ` · Reçu ${dupliqueDe.numeroRecu}` : ''}
                    </p>
                    <button
                      type="button"
                      onClick={resetDetails}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:underline shrink-0 ml-2"
                    >
                      {t('saisieJournaliere.annulerSelection')}
                    </button>
                  </div>
                )}
                <div className="col-span-2 relative">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('saisieJournaliere.rechercherEtudiant')}
                      value={recherche}
                      onChange={(e) => setRecherche(e.target.value)}
                      className="field-input text-xs py-1.5 pl-7 w-full"
                    />
                  </div>
                  {rechercheDebattue.length >= 2 && (
                    <div className="mt-1 border border-slate-300 dark:border-slate-600 rounded-md max-h-40 overflow-y-auto">
                      {resultatsRecherche?.length ? (
                        resultatsRecherche.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs border-b last:border-b-0 border-slate-200 dark:border-slate-700">
                            <span className="text-slate-600 dark:text-slate-300">
                              {[m.prenom, m.nom].filter(Boolean).join(' ')}
                              {m.filieresInscrites.length > 0 ? ` · ${m.filieresInscrites.map((fi) => fi.filiere.nom).join(' + ')}` : ''}
                              {m.numeroRecu ? ` · Reçu ${m.numeroRecu}` : ''}
                            </span>
                            <span className="flex items-center gap-2 shrink-0">
                              {!!m.montantRestantActuel && m.montantRestantActuel > 0 && (
                                <button
                                  type="button"
                                  onClick={() => payerLeReste(m)}
                                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                                >
                                  {t('saisieJournaliere.payerLeReste')}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => dupliquer(m)}
                                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                              >
                                {t('saisieJournaliere.dupliquer')}
                              </button>
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 px-2 py-1.5">{t('saisieJournaliere.rechercheAucunResultat')}</p>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={t('saisieJournaliere.mouvementsNom')}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="field-input text-xs py-1.5"
                  required={detailInscriptionRenseigne}
                />
                <input
                  type="text"
                  placeholder={t('saisieJournaliere.mouvementsPrenom')}
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="field-input text-xs py-1.5"
                  required={detailInscriptionRenseigne}
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
                  {dupliqueDe ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400" title={t('saisieJournaliere.ajouterFiliereHint')}>
                      {t('saisieJournaliere.dejaPaye')}
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMontant(droitInscription ?? 0)}</span>
                  )}
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

const RACCOURCIS_DUREE: { value: DureeRaccourci; labelKey: string }[] = [
  { value: '4_SEMAINES', labelKey: 'saisieJournaliere.duree4Semaines' },
  { value: '5_SEMAINES', labelKey: 'saisieJournaliere.duree5Semaines' },
  { value: '1_MOIS', labelKey: 'saisieJournaliere.duree1Mois' },
];

function LigneSuiviInscription({ insc }: { insc: InscriptionFiliereSuivi }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // Pré-rempli si déjà enregistré côté serveur ; sinon l'utilisateur peut saisir les deux dates
  // (début et fin) en une seule fois avant même d'avoir sauvegardé la date de début.
  const [dateDebut, setDateDebut] = useState(insc.dateDebutCours?.slice(0, 10) ?? '');
  const [dateFin, setDateFin] = useState(insc.dateFinCours?.slice(0, 10) ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      api.patch(`/saisies-journalieres/filieres-inscrites/${insc.id}/dates-cours`, {
        dateDebutCours: dateDebut || undefined,
        dateFinCours: dateFin || undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['filieres-inscrites-suivi'] }),
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-white/5 rounded-md px-3 py-2 text-sm">
      <div>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {[insc.mouvement.prenom, insc.mouvement.nom].filter(Boolean).join(' ')}
        </span>
        <span className="text-slate-500 dark:text-slate-400"> · {insc.filiere.nom}</span>
        {insc.mouvement.numeroRecu && <span className="text-slate-500 dark:text-slate-400"> · Reçu {insc.mouvement.numeroRecu}</span>}
        <span className="block text-xs text-slate-400 mt-0.5">
          {t('saisieJournaliere.inscritLe')} {formatDateAffichage(insc.mouvement.date.slice(0, 10))}
        </span>
      </div>

      <div className="flex flex-wrap items-start gap-1.5">
        <div className="flex flex-col items-start">
          <input
            type="date"
            value={dateDebut}
            onChange={(ev) => setDateDebut(ev.target.value)}
            title={t('saisieJournaliere.dateDebut')}
            className="field-input text-xs py-1.5 w-auto"
          />
          {/* Le champ natif affiche le format de la langue du navigateur (parfois mm/jj/aaaa) : ce
              texte donne toujours une lecture sans ambiguïté de la date réellement sélectionnée. */}
          {dateDebut && <span className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{formatDateAffichage(dateDebut)}</span>}
        </div>
        {RACCOURCIS_DUREE.map((r) => (
          <button
            key={r.value}
            type="button"
            disabled={!dateDebut}
            onClick={() => setDateFin(ajouterDuree(dateDebut, r.value))}
            className="text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t(r.labelKey)}
          </button>
        ))}
        <div className="flex flex-col items-start">
          <input
            type="date"
            value={dateFin}
            onChange={(ev) => setDateFin(ev.target.value)}
            title={t('saisieJournaliere.dateFin')}
            className="field-input text-xs py-1.5 w-auto"
          />
          {dateFin && <span className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{formatDateAffichage(dateFin)}</span>}
        </div>
        <button
          type="button"
          disabled={!dateDebut || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          {t('saisieJournaliere.enregistrer')}
        </button>
      </div>
    </div>
  );
}

function EtudiantsSansDateDebut() {
  const { t } = useTranslation();

  // Chaque ligne est une inscription (étudiant, filière) : un même étudiant inscrit dans plusieurs
  // filières peut apparaître plusieurs fois, une par filière dont la date de début ou de fin manque.
  const { data: inscriptions, isLoading } = useQuery({
    queryKey: ['filieres-inscrites-suivi'],
    queryFn: async () => (await api.get<InscriptionFiliereSuivi[]>('/saisies-journalieres/filieres-inscrites/suivi')).data,
  });

  if (isLoading) return null;
  if (!inscriptions || inscriptions.length === 0) return null;

  return (
    <div className="glass-card p-6 mt-6">
      <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">{t('saisieJournaliere.etudiantsSansDateDebut')}</h2>
      <p className="text-xs text-slate-400 mb-4">{t('saisieJournaliere.etudiantsSansDateDebutHint')}</p>
      <div className="space-y-2">
        {inscriptions.map((insc) => (
          <LigneSuiviInscription key={insc.id} insc={insc} />
        ))}
      </div>
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Store className="w-4 h-4" /> {pointDeVente.nom}
          </div>
          {aujourdhui && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="w-4 h-4" /> {t('saisieJournaliere.todayLabel')} — {formatDateAffichage(aujourdhui.date)}
            </div>
          )}
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

      <EtudiantsSansDateDebut />
    </div>
  );
}
