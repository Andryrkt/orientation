import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatMontant } from '../../lib/format';
import { Paginated, PointDeVente, ResumeSaisiePointDeVente } from '../../lib/types';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function ilYA30JoursIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
}

// Date d'ancrage arbitrairement ancienne pour simuler "depuis le début" avec les endpoints existants
// (qui attendent un dateFrom explicite plutôt qu'une plage illimitée).
const DEPUIS_LE_DEBUT = '2000-01-01';

const RACCOURCIS = [
  { to: '/admin/points-de-vente', label: 'Points de vente', description: 'Gérer les points de vente et leurs secrétaires' },
  { to: '/admin/saisies-journalieres', label: 'Saisies journalières', description: 'Recettes et dépenses des points de vente' },
  { to: '/admin/depenses-globales', label: 'Dépenses globales', description: "Charges de l'entreprise (loyer, salaires...)" },
  { to: '/admin/investissements', label: 'Investissements', description: 'Dons, prêts et apports reçus des bailleurs' },
];

export function FinancesDashboard() {
  const [dateFrom, setDateFrom] = useState(ilYA30JoursIso());
  const [dateTo, setDateTo] = useState(todayIso());
  const [pointDeVenteId, setPointDeVenteId] = useState('');

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
  });

  const { data: depensesGlobales, isLoading: loadingDepensesGlobales } = useQuery({
    queryKey: ['admin-depenses-globales-total', dateFrom, dateTo],
    queryFn: async () =>
      (await api.get<{ total: number }>('/admin/depenses-globales/total', { params: { dateFrom, dateTo } })).data,
  });

  const { data: investissements, isLoading: loadingInvestissements } = useQuery({
    queryKey: ['admin-investissements-total', dateFrom, dateTo],
    queryFn: async () =>
      (await api.get<{ total: number }>('/admin/investissements/total', { params: { dateFrom, dateTo } })).data,
  });

  // Trésorerie réelle : calculée depuis le début (indépendamment du filtre de période ci-dessus),
  // car c'est le solde actuellement disponible en caisse, pas un flux sur une période.
  const aujourdhui = todayIso();
  const { data: resumeDepuisDebut, isLoading: loadingResumeDepuisDebut } = useQuery({
    queryKey: ['admin-saisies-resume-depuis-debut', pointDeVenteId],
    queryFn: async () =>
      (
        await api.get<ResumeSaisiePointDeVente[]>('/admin/saisies-journalieres/resume', {
          params: { dateFrom: DEPUIS_LE_DEBUT, dateTo: aujourdhui, pointDeVenteId: pointDeVenteId || undefined },
        })
      ).data,
  });
  const { data: depensesGlobalesDepuisDebut, isLoading: loadingDepensesGlobalesDepuisDebut } = useQuery({
    queryKey: ['admin-depenses-globales-total-depuis-debut'],
    queryFn: async () =>
      (
        await api.get<{ total: number }>('/admin/depenses-globales/total', {
          params: { dateFrom: DEPUIS_LE_DEBUT, dateTo: aujourdhui },
        })
      ).data,
  });
  const { data: investissementsDepuisDebut, isLoading: loadingInvestissementsDepuisDebut } = useQuery({
    queryKey: ['admin-investissements-total-depuis-debut'],
    queryFn: async () =>
      (
        await api.get<{ total: number }>('/admin/investissements/total', {
          params: { dateFrom: DEPUIS_LE_DEBUT, dateTo: aujourdhui },
        })
      ).data,
  });

  const totalGagneVentes = resume?.reduce((sum, r) => sum + r.totalGagne, 0) ?? 0;
  const totalDepenseVentes = resume?.reduce((sum, r) => sum + r.totalDepense, 0) ?? 0;
  const totalDepensesGlobales = depensesGlobales?.total ?? 0;
  const totalInvestissements = investissements?.total ?? 0;
  const soldeNetEntreprise = totalGagneVentes - totalDepenseVentes - totalDepensesGlobales;
  const chargement = loadingResume || loadingDepensesGlobales || loadingInvestissements;

  const chargementTresorerie =
    loadingResumeDepuisDebut || loadingDepensesGlobalesDepuisDebut || loadingInvestissementsDepuisDebut;
  const gagneVentesDepuisDebut = resumeDepuisDebut?.reduce((sum, r) => sum + r.totalGagne, 0) ?? 0;
  const depenseVentesDepuisDebut = resumeDepuisDebut?.reduce((sum, r) => sum + r.totalDepense, 0) ?? 0;
  const depensesGlobalesTotalDepuisDebut = depensesGlobalesDepuisDebut?.total ?? 0;
  const investissementsTotalDepuisDebut = investissementsDepuisDebut?.total ?? 0;
  const tresorerieCaisse =
    gagneVentesDepuisDebut - depenseVentesDepuisDebut - depensesGlobalesTotalDepuisDebut + investissementsTotalDepuisDebut;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de bord Finances</h1>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble consolidée sur la période sélectionnée</p>
        </div>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <select
            className="border border-slate-300 rounded-md px-2 py-1"
            value={pointDeVenteId}
            onChange={(e) => setPointDeVenteId(e.target.value)}
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
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <label className="text-slate-500">au</label>
          <input
            type="date"
            className="border border-slate-300 rounded-md px-2 py-1"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-brand-900 rounded-xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-brand-200">Trésorerie réelle en caisse (depuis le début{pointDeVenteId ? ' — point de vente sélectionné' : ''})</p>
          <p className="text-4xl font-black text-white mt-1">
            {chargementTresorerie ? '…' : formatMontant(tresorerieCaisse)}
          </p>
        </div>
        <p className="text-xs text-brand-300 max-w-xs text-right">
          Ventes − dépenses (points de vente et globales) + investissements reçus, cumulés depuis la première saisie.
          Indépendant du filtre de période ci-dessus.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Résultat d'exploitation</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Recettes ventes</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{chargement ? '…' : formatMontant(totalGagneVentes)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Dépenses ventes</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{chargement ? '…' : formatMontant(totalDepenseVentes)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Dépenses globales</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{chargement ? '…' : formatMontant(totalDepensesGlobales)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Solde net entreprise</p>
          <p className="text-3xl font-bold text-brand-700 mt-1">{chargement ? '…' : formatMontant(soldeNetEntreprise)}</p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Financement externe — hors résultat d'exploitation
      </p>
      <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-sm mb-8">
        <p className="text-sm text-slate-500">Investissements reçus (période)</p>
        <p className="text-3xl font-bold text-blue-600 mt-1">
          {loadingInvestissements ? '…' : formatMontant(totalInvestissements)}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Dons, prêts et apports en capital reçus — non inclus dans le solde net entreprise ci-dessus.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Accès rapide</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RACCOURCIS.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="bg-white rounded-lg border border-slate-200 p-5 hover:border-brand-400 hover:shadow-sm transition-all"
          >
            <p className="font-semibold text-slate-800">{r.label}</p>
            <p className="text-sm text-slate-500 mt-1">{r.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
