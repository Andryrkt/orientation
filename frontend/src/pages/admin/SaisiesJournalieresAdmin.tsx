import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Saisies journalières</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <select
            className="border border-slate-300 rounded-md px-2 py-1"
            value={pointDeVenteId}
            onChange={(e) => {
              setPointDeVenteId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">— Tous les points de vente —</option>
            {pointsDeVente?.items.map((pdv) => (
              <option key={pdv.id} value={pdv.id}>
                {pdv.nom}
                {!pdv.actif ? ' (inactif)' : ''}
              </option>
            ))}
          </select>
          <label className="text-slate-500">Du</label>
          <input
            type="date"
            className="border border-slate-300 rounded-md px-2 py-1"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          />
          <label className="text-slate-500">au</label>
          <input
            type="date"
            className="border border-slate-300 rounded-md px-2 py-1"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button
          onClick={() => setTab('resume')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'resume' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Résumé
        </button>
        <button
          onClick={() => setTab('historique')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'historique' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Historique détaillé
        </button>
      </div>

      {tab === 'resume' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Total gagné (période)</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{formatMontant(totalGagne)}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Total dépensé (période)</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{formatMontant(totalDepense)}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Solde net</p>
              <p className="text-3xl font-bold text-brand-700 mt-1">{formatMontant(totalGagne - totalDepense)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Point de vente</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Total gagné</th>
                  <th className="px-4 py-3 font-medium">Total dépensé</th>
                  <th className="px-4 py-3 font-medium">Solde</th>
                  <th className="px-4 py-3 font-medium">Saisie du jour manquante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingResume && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
                )}
                {!loadingResume && resume?.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Aucun point de vente actif</td></tr>
                )}
                {resume?.map((r) => (
                  <tr key={r.pointDeVente.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700 font-medium">{r.pointDeVente.nom}</td>
                    <td className="px-4 py-3 text-slate-700">{r.pointDeVente.ville ?? '—'}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatMontant(r.totalGagne)}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatMontant(r.totalDepense)}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
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

          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto mt-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Semaine</th>
                  <th className="px-4 py-3 font-medium">Total gagné</th>
                  <th className="px-4 py-3 font-medium">Total dépensé</th>
                  <th className="px-4 py-3 font-medium">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingSemaine && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
                )}
                {!loadingSemaine && totauxParSemaine?.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Aucune saisie</td></tr>
                )}
                {totauxParSemaine?.map((s) => (
                  <tr key={s.semaineDebut} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700 font-medium">{formatSemaine(s.semaineDebut, s.semaineFin)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatMontant(s.totalGagne)}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatMontant(s.totalDepense)}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{formatMontant(s.totalGagne - s.totalDepense)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'historique' && (
        <>
          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Point de vente</th>
                  <th className="px-4 py-3 font-medium">Période</th>
                  <th className="px-4 py-3 font-medium">Gagné</th>
                  <th className="px-4 py-3 font-medium">Dépensé</th>
                  <th className="px-4 py-3 font-medium">Solde</th>
                  <th className="px-4 py-3 font-medium">Saisi par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingHistorique && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
                )}
                {!loadingHistorique && historique?.items.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Aucune saisie</td></tr>
                )}
                {historique?.items.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{s.pointDeVente?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{PERIODE_LABELS[s.periode]}</td>
                    <td className="px-4 py-3 text-emerald-600">{formatMontant(s.montantGagne)}</td>
                    <td className="px-4 py-3 text-red-600">{formatMontant(s.montantDepense)}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {formatMontant(s.montantGagne - s.montantDepense)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.saisiPar ? `${s.saisiPar.prenom} ${s.saisiPar.nom}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {historique && historique.total > historique.limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
                <span className="text-slate-500">
                  Page {historique.page} sur {Math.ceil(historique.total / historique.limit)} ({historique.total} saisies)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={page >= Math.ceil(historique.total / historique.limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-40"
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
