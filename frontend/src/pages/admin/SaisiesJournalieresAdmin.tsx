import { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatMontant } from '../../lib/format';
import { Paginated, PointDeVente, ResumeSaisiePointDeVente, ResumeSemaine, SaisieJournaliere } from '../../lib/types';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function ilYA30JoursIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
}

const PERIODE_LABELS: Record<string, string> = { MIDI: 'Midi', APRES_MIDI: 'Après-midi' };

function EcartCaisseBadge({ saisie }: { saisie: SaisieJournaliere }) {
  if (saisie.montantCompte == null) return <span className="text-slate-300 text-xs">—</span>;
  const soldeTheorique = saisie.fondDeCaisse + saisie.montantGagne - saisie.montantDepense;
  const ecart = saisie.montantCompte - soldeTheorique;
  const titre = `Théorique : ${formatMontant(soldeTheorique)} · Compté : ${formatMontant(saisie.montantCompte)}`;

  if (ecart === 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600" title={titre}>
        ✅ Caisse juste
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600" title={titre}>
      ⚠️ Écart {ecart > 0 ? '+' : ''}{formatMontant(ecart)}
    </span>
  );
}

function ContrePoidsBadge({ saisie }: { saisie: SaisieJournaliere }) {
  const aDesMouvements =
    (saisie.mouvementsGagne !== null && saisie.mouvementsGagne !== undefined) ||
    (saisie.mouvementsDepense !== null && saisie.mouvementsDepense !== undefined);
  const ecartGagne = saisie.montantGagne - (saisie.mouvementsGagne ?? 0);
  const ecartDepense = saisie.montantDepense - (saisie.mouvementsDepense ?? 0);
  const concordant = ecartGagne === 0 && ecartDepense === 0;
  const titre = `Détail saisi : ${formatMontant(saisie.mouvementsGagne ?? 0)} gagné, ${formatMontant(saisie.mouvementsDepense ?? 0)} dépensé`;

  if (!aDesMouvements) return <span className="text-slate-300 text-xs">—</span>;
  if (concordant) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600" title={titre}>
        ✅ Concordant
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600" title={titre}>
      ⚠️ Écart {ecartGagne !== 0 ? `gagné ${ecartGagne > 0 ? '+' : ''}${formatMontant(ecartGagne)}` : ''}
      {ecartGagne !== 0 && ecartDepense !== 0 ? ' / ' : ''}
      {ecartDepense !== 0 ? `dépensé ${ecartDepense > 0 ? '+' : ''}${formatMontant(ecartDepense)}` : ''}
    </span>
  );
}

interface JourneeGroupee {
  cle: string;
  date: string;
  pointDeVente: SaisieJournaliere['pointDeVente'];
  saisies: SaisieJournaliere[];
  totalFondDeCaisse: number;
  totalGagne: number;
  totalDepense: number;
}

function grouperParJournee(items: SaisieJournaliere[]): JourneeGroupee[] {
  const groupes = new Map<string, JourneeGroupee>();
  for (const s of items) {
    const cle = `${s.pointDeVenteId}__${s.date}`;
    const groupe =
      groupes.get(cle) ??
      { cle, date: s.date, pointDeVente: s.pointDeVente, saisies: [], totalFondDeCaisse: 0, totalGagne: 0, totalDepense: 0 };
    groupe.saisies.push(s);
    groupe.totalFondDeCaisse += s.fondDeCaisse;
    groupe.totalGagne += s.montantGagne;
    groupe.totalDepense += s.montantDepense;
    groupes.set(cle, groupe);
  }
  return Array.from(groupes.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

function formatSemaine(debut: string, fin: string) {
  const optionsCourt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const optionsLong: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const dDebut = new Date(debut);
  const dFin = new Date(fin);
  return `${dDebut.toLocaleDateString('fr-FR', optionsCourt)} – ${dFin.toLocaleDateString('fr-FR', optionsLong)}`;
}

export function SaisiesJournalieresAdmin() {
  const [tab, setTab] = useState<'resume' | 'historique'>('resume');
  const [dateFrom, setDateFrom] = useState(ilYA30JoursIso());
  const [dateTo, setDateTo] = useState(todayIso());
  const [pointDeVenteId, setPointDeVenteId] = useState('');
  const [page, setPage] = useState(1);
  const [journeesOuvertes, setJourneesOuvertes] = useState<Set<string>>(new Set());

  function toggleJournee(cle: string) {
    setJourneesOuvertes((prev) => {
      const next = new Set(prev);
      if (next.has(cle)) next.delete(cle);
      else next.add(cle);
      return next;
    });
  }

  const { data: pointsDeVente } = useQuery({
    queryKey: ['admin-points-de-vente-filtre'],
    queryFn: async () => (await api.get<Paginated<PointDeVente>>('/admin/points-de-vente')).data,
  });

  const { data: resume, isLoading: loadingResume } = useQuery({
    queryKey: ['admin-saisies-resume', dateFrom, dateTo, pointDeVenteId],
    queryFn: async () =>
      (
        await api.get<ResumeSaisiePointDeVente[]>('/admin/saisies-journalieres/resume', {
          params: { dateFrom, dateTo, pointDeVenteId: pointDeVenteId || undefined },
        })
      ).data,
    enabled: tab === 'resume',
  });

  const { data: historique, isLoading: loadingHistorique } = useQuery({
    queryKey: ['admin-saisies-historique', dateFrom, dateTo, pointDeVenteId, page],
    queryFn: async () =>
      (
        await api.get<Paginated<SaisieJournaliere>>('/admin/saisies-journalieres', {
          params: { dateFrom, dateTo, pointDeVenteId: pointDeVenteId || undefined, page, limit: 20 },
        })
      ).data,
    enabled: tab === 'historique',
  });

  const { data: totauxParSemaine, isLoading: loadingSemaine } = useQuery({
    queryKey: ['admin-saisies-resume-semaine', dateFrom, dateTo, pointDeVenteId],
    queryFn: async () =>
      (
        await api.get<ResumeSemaine[]>('/admin/saisies-journalieres/resume-semaine', {
          params: { dateFrom, dateTo, pointDeVenteId: pointDeVenteId || undefined },
        })
      ).data,
    enabled: tab === 'resume',
  });

  const totalGagne = resume?.reduce((sum, r) => sum + r.totalGagne, 0) ?? 0;
  const totalDepense = resume?.reduce((sum, r) => sum + r.totalDepense, 0) ?? 0;
  const journees = useMemo(() => grouperParJournee(historique?.items ?? []), [historique]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Saisies journalières</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={pointDeVenteId}
            onChange={(e) => {
              setPointDeVenteId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">— Tous les stands —</option>
            {pointsDeVente?.items.map((pdv) => (
              <option key={pdv.id} value={pdv.id}>
                {pdv.nom}
                {!pdv.actif ? ' (inactif)' : ''}
              </option>
            ))}
          </select>
          <label className="text-slate-500 dark:text-slate-400">Du</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          />
          <label className="text-slate-500 dark:text-slate-400">au</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab('resume')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'resume' ? 'border-brand-600 text-brand-700 dark:text-brand-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Résumé
        </button>
        <button
          onClick={() => setTab('historique')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'historique' ? 'border-brand-600 text-brand-700 dark:text-brand-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Historique détaillé
        </button>
      </div>

      {tab === 'resume' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total gagné (période)</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{formatMontant(totalGagne)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total dépensé (période)</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{formatMontant(totalDepense)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">Solde net</p>
              <p className="text-3xl font-bold text-brand-700 mt-1">{formatMontant(totalGagne - totalDepense)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Stand</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Total gagné</th>
                  <th className="px-4 py-3 font-medium">Total dépensé</th>
                  <th className="px-4 py-3 font-medium">Solde</th>
                  <th className="px-4 py-3 font-medium">Saisie du jour manquante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingResume && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
                )}
                {!loadingResume && resume?.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Aucun stand actif</td></tr>
                )}
                {resume?.map((r) => (
                  <tr key={r.pointDeVente.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{r.pointDeVente.nom}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.pointDeVente.ville ?? '—'}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatMontant(r.totalGagne)}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatMontant(r.totalDepense)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                      {formatMontant(r.totalGagne - r.totalDepense)}
                    </td>
                    <td className="px-4 py-3">
                      {r.manquantAujourdhui.length === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">Complet</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                          {r.manquantAujourdhui.map((p) => PERIODE_LABELS[p]).join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto mt-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Semaine</th>
                  <th className="px-4 py-3 font-medium">Total gagné</th>
                  <th className="px-4 py-3 font-medium">Total dépensé</th>
                  <th className="px-4 py-3 font-medium">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingSemaine && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
                )}
                {!loadingSemaine && totauxParSemaine?.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Aucune saisie</td></tr>
                )}
                {totauxParSemaine?.map((s) => (
                  <tr key={s.semaineDebut} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{formatSemaine(s.semaineDebut, s.semaineFin)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatMontant(s.totalGagne)}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatMontant(s.totalDepense)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{formatMontant(s.totalGagne - s.totalDepense)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'historique' && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium" />
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Stand</th>
                  <th className="px-4 py-3 font-medium">Périodes saisies</th>
                  <th className="px-4 py-3 font-medium">Fond de caisse (jour)</th>
                  <th className="px-4 py-3 font-medium">Gagné (jour)</th>
                  <th className="px-4 py-3 font-medium">Dépensé (jour)</th>
                  <th className="px-4 py-3 font-medium">Solde (jour)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingHistorique && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
                )}
                {!loadingHistorique && journees.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Aucune saisie</td></tr>
                )}
                {journees.map((j) => {
                  const ouvert = journeesOuvertes.has(j.cle);
                  return (
                    <Fragment key={j.cle}>
                      <tr onClick={() => toggleJournee(j.cle)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                        <td className="px-4 py-3 text-slate-400">
                          {ouvert ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {new Date(j.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{j.pointDeVente?.nom ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                          {j.saisies.map((s) => PERIODE_LABELS[s.periode]).join(', ')}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">{formatMontant(j.totalFondDeCaisse)}</td>
                        <td className="px-4 py-3 text-emerald-600 font-medium">{formatMontant(j.totalGagne)}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">{formatMontant(j.totalDepense)}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                          {formatMontant(j.totalGagne - j.totalDepense)}
                        </td>
                      </tr>
                      {ouvert && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <table className="w-full text-sm bg-slate-50 dark:bg-slate-800/40">
                              <thead className="text-left text-slate-400">
                                <tr>
                                  <th className="pl-12 pr-4 py-2 font-medium">Période</th>
                                  <th className="px-4 py-2 font-medium">Fond de caisse</th>
                                  <th className="px-4 py-2 font-medium">Gagné</th>
                                  <th className="px-4 py-2 font-medium">Dépensé</th>
                                  <th className="px-4 py-2 font-medium">Solde théorique</th>
                                  <th className="px-4 py-2 font-medium">Compté</th>
                                  <th className="px-4 py-2 font-medium">Saisi par</th>
                                  <th className="px-4 py-2 font-medium">Contre-poids</th>
                                  <th className="px-4 py-2 font-medium">Écart caisse</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {j.saisies.map((s) => (
                                  <tr key={s.id}>
                                    <td className="pl-12 pr-4 py-2 text-slate-600 dark:text-slate-300">{PERIODE_LABELS[s.periode]}</td>
                                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{formatMontant(s.fondDeCaisse)}</td>
                                    <td className="px-4 py-2 text-emerald-600">{formatMontant(s.montantGagne)}</td>
                                    <td className="px-4 py-2 text-red-600">{formatMontant(s.montantDepense)}</td>
                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium">
                                      {formatMontant(s.fondDeCaisse + s.montantGagne - s.montantDepense)}
                                    </td>
                                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                                      {s.montantCompte != null ? formatMontant(s.montantCompte) : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                                      {s.saisiPar ? `${s.saisiPar.prenom} ${s.saisiPar.nom}` : '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                      <ContrePoidsBadge saisie={s} />
                                    </td>
                                    <td className="px-4 py-2">
                                      <EcartCaisseBadge saisie={s} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>

            {historique && historique.total > historique.limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Page {historique.page} sur {Math.ceil(historique.total / historique.limit)} ({historique.total} saisies)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={page >= Math.ceil(historique.total / historique.limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
