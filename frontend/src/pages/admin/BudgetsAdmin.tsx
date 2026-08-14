import { Fragment, FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatMontant } from '../../lib/format';
import { BudgetDetailLigne, BudgetLigne, DroitInscription, Filiere, Paginated, ResumeBudgets } from '../../lib/types';

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DETAIL_VIDE = { description: '', tauxUnitaire: '', quantite: '', unite: '', nombrePeriodes: '', ajustementMontant: '', ajustementNote: '' };

function moisActuelIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function moisPrecedent(annee: number, mois: number) {
  return mois === 1 ? { annee: annee - 1, mois: 12 } : { annee, mois: mois - 1 };
}

function DetailBudgetCategorie({ categorie, annee, mois }: { categorie: string; annee: number; mois: number }) {
  const queryClient = useQueryClient();
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [form, setForm] = useState(DETAIL_VIDE);
  const [showAjout, setShowAjout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: lignes, isLoading } = useQuery({
    queryKey: ['admin-budgets-detail', categorie, annee, mois],
    queryFn: async () =>
      (await api.get<BudgetDetailLigne[]>('/admin/budgets/detail', { params: { categorie, annee, mois } })).data,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-budgets-detail', categorie, annee, mois] });
    queryClient.invalidateQueries({ queryKey: ['admin-budgets', annee, mois] });
  }

  function showApiError(err: unknown) {
    const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
  }

  function payloadDepuisForm() {
    return {
      categorie,
      annee,
      mois,
      description: form.description.trim(),
      tauxUnitaire: Number(form.tauxUnitaire),
      quantite: Number(form.quantite),
      unite: form.unite.trim() || undefined,
      nombrePeriodes: Number(form.nombrePeriodes),
      ajustementMontant: form.ajustementMontant ? Number(form.ajustementMontant) : undefined,
      ajustementNote: form.ajustementNote.trim() || undefined,
    };
  }

  const creerMutation = useMutation({
    mutationFn: () => api.post('/admin/budgets/detail', payloadDepuisForm()),
    onSuccess: () => {
      invalidate();
      setShowAjout(false);
      setForm(DETAIL_VIDE);
      setError(null);
    },
    onError: showApiError,
  });

  const modifierMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/budgets/detail/${id}`, payloadDepuisForm()),
    onSuccess: () => {
      invalidate();
      setEnEdition(null);
      setForm(DETAIL_VIDE);
      setError(null);
    },
    onError: showApiError,
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/budgets/detail/${id}`),
    onSuccess: invalidate,
  });

  function ouvrirAjout() {
    setEnEdition(null);
    setForm(DETAIL_VIDE);
    setShowAjout(true);
  }

  function ouvrirEdition(ligne: BudgetDetailLigne) {
    setShowAjout(false);
    setEnEdition(ligne.id);
    setForm({
      description: ligne.description,
      tauxUnitaire: String(ligne.tauxUnitaire),
      quantite: String(ligne.quantite),
      unite: ligne.unite ?? '',
      nombrePeriodes: String(ligne.nombrePeriodes),
      ajustementMontant: ligne.ajustementMontant !== null ? String(ligne.ajustementMontant) : '',
      ajustementNote: ligne.ajustementNote ?? '',
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (enEdition) modifierMutation.mutate(enEdition);
    else creerMutation.mutate();
  }

  const aperçuMontant =
    form.tauxUnitaire && form.quantite && form.nombrePeriodes
      ? Math.round(Number(form.tauxUnitaire) * Number(form.quantite) * Number(form.nombrePeriodes)) + (form.ajustementMontant ? Number(form.ajustementMontant) : 0)
      : null;

  return (
    <div className="pl-12 pr-4 py-3 space-y-3">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs rounded-md px-3 py-2">{error}</div>
      )}

      {isLoading && <p className="text-xs text-slate-400">Chargement...</p>}

      {!isLoading && lignes && lignes.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-left text-slate-400">
            <tr>
              <th className="pr-3 py-1 font-medium">Description</th>
              <th className="pr-3 py-1 font-medium">Calcul</th>
              <th className="pr-3 py-1 font-medium">Ajustement</th>
              <th className="pr-3 py-1 font-medium">Montant</th>
              <th className="pr-3 py-1" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {lignes.map((l) => (
              <tr key={l.id}>
                <td className="pr-3 py-1.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{l.description}</td>
                <td className="pr-3 py-1.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formatMontant(l.tauxUnitaire)} × {l.quantite}{l.unite ? ` ${l.unite}` : ''} × {l.nombrePeriodes}
                </td>
                <td className="pr-3 py-1.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {l.ajustementMontant ? (
                    <span title={l.ajustementNote ?? ''}>
                      {l.ajustementMontant >= 0 ? '+' : ''}{formatMontant(l.ajustementMontant)}
                    </span>
                  ) : '—'}
                </td>
                <td className="pr-3 py-1.5 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">{formatMontant(l.montant)}</td>
                <td className="pr-3 py-1.5 text-right whitespace-nowrap">
                  <button onClick={() => ouvrirEdition(l)} className="text-brand-600 dark:text-brand-400 hover:underline mr-2">Modifier</button>
                  <button onClick={() => supprimerMutation.mutate(l.id)} className="text-red-600 dark:text-red-400 hover:underline">Retirer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!isLoading && lignes && lignes.length === 0 && !showAjout && (
        <p className="text-xs text-slate-400">Aucune ligne de détail pour cette catégorie.</p>
      )}

      {(showAjout || enEdition) && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/60 rounded-md p-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Description</label>
            <input
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-xs w-40"
              placeholder="Ex: Prof Histoire"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Taux (Ar)</label>
            <input
              type="number" min={0}
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-xs w-24"
              value={form.tauxUnitaire}
              onChange={(e) => setForm({ ...form, tauxUnitaire: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Quantité</label>
            <input
              type="number" min={0} step="0.5"
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-xs w-20"
              placeholder="ex: 13"
              value={form.quantite}
              onChange={(e) => setForm({ ...form, quantite: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Unité</label>
            <input
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-xs w-28"
              placeholder="ex: h/semaine"
              value={form.unite}
              onChange={(e) => setForm({ ...form, unite: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Nb périodes</label>
            <input
              type="number" min={0} step="0.5"
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-xs w-20"
              placeholder="ex: 4"
              value={form.nombrePeriodes}
              onChange={(e) => setForm({ ...form, nombrePeriodes: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Ajustement (Ar)</label>
            <input
              type="number"
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-xs w-24"
              placeholder="+/- optionnel"
              value={form.ajustementMontant}
              onChange={(e) => setForm({ ...form, ajustementMontant: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Note d'ajustement</label>
            <input
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-xs w-full"
              placeholder="ex: 1/2 journée le 6e jour"
              value={form.ajustementNote}
              onChange={(e) => setForm({ ...form, ajustementNote: e.target.value })}
            />
          </div>
          {aperçuMontant !== null && (
            <span className="text-xs text-slate-500 dark:text-slate-400 pb-1.5">= <strong className="text-slate-700 dark:text-slate-200">{formatMontant(aperçuMontant)}</strong></span>
          )}
          <button type="submit" disabled={creerMutation.isPending || modifierMutation.isPending} className="px-3 py-1.5 bg-brand-600 text-white rounded-md text-xs font-medium hover:bg-brand-700 disabled:opacity-50">
            {enEdition ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" onClick={() => { setShowAjout(false); setEnEdition(null); }} className="px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:underline">
            Annuler
          </button>
        </form>
      )}

      {!showAjout && !enEdition && (
        <button onClick={ouvrirAjout} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
          + Ajouter une ligne de détail
        </button>
      )}
    </div>
  );
}

export function BudgetsAdmin() {
  const queryClient = useQueryClient();
  const [periode, setPeriode] = useState(moisActuelIso());
  const [annee, mois] = periode.split('-').map(Number);
  const [ligneEnEdition, setLigneEnEdition] = useState<string | null>(null);
  const [montantEdition, setMontantEdition] = useState('');
  const [showAjout, setShowAjout] = useState(false);
  const [nouvelleCategorie, setNouvelleCategorie] = useState('');
  const [nouveauMontant, setNouveauMontant] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [categorieOuverte, setCategorieOuverte] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-budgets', annee, mois],
    queryFn: async () => (await api.get<ResumeBudgets>('/admin/budgets', { params: { annee, mois } })).data,
  });

  const { data: categoriesConnues } = useQuery({
    queryKey: ['admin-budgets-categories'],
    queryFn: async () => (await api.get<string[]>('/admin/budgets/categories')).data,
  });

  const { data: droitInscription } = useQuery({
    queryKey: ['droit-inscription'],
    queryFn: async () => (await api.get<DroitInscription>('/droit-inscription')).data,
  });

  const { data: filieresData } = useQuery({
    queryKey: ['admin-filieres-budgets'],
    queryFn: async () => (await api.get<Paginated<Filiere>>('/admin/filieres')).data,
  });

  // Estimation "pire des cas" : combien d'inscriptions faudrait-il si chaque étudiant payait le
  // moins cher possible (la filière la moins chère + le droit d'inscription).
  const filieresActives = filieresData?.items.filter((f) => f.actif) ?? [];
  const prixFiliereMinimum = filieresActives.length > 0 ? Math.min(...filieresActives.map((f) => f.prix)) : null;
  const montantMinimumParEtudiant =
    prixFiliereMinimum !== null && droitInscription ? prixFiliereMinimum + droitInscription.montant : null;

  function etudiantsNecessaires(montant: number) {
    if (!montantMinimumParEtudiant || montantMinimumParEtudiant <= 0) return null;
    return Math.ceil(montant / montantMinimumParEtudiant);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-budgets', annee, mois] });
    queryClient.invalidateQueries({ queryKey: ['admin-budgets-categories'] });
  }

  function showApiError(err: unknown) {
    const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
  }

  const upsertMutation = useMutation({
    mutationFn: (payload: { categorie: string; montant: number }) =>
      api.post('/admin/budgets', { ...payload, annee, mois }),
    onSuccess: () => {
      invalidate();
      setLigneEnEdition(null);
      setShowAjout(false);
      setNouvelleCategorie('');
      setNouveauMontant('');
      setError(null);
    },
    onError: showApiError,
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/budgets/${id}`),
    onSuccess: invalidate,
  });

  const dupliquerMutation = useMutation({
    mutationFn: () => {
      const source = moisPrecedent(annee, mois);
      return api.post('/admin/budgets/dupliquer', {
        anneeSource: source.annee,
        moisSource: source.mois,
        anneeCible: annee,
        moisCible: mois,
      });
    },
    onSuccess: invalidate,
  });

  function ouvrirEdition(ligne: BudgetLigne) {
    setLigneEnEdition(ligne.categorie);
    setMontantEdition(ligne.montantBudget?.toString() ?? '');
    setShowAjout(false);
  }

  function validerEdition(categorie: string) {
    if (!montantEdition) return;
    upsertMutation.mutate({ categorie, montant: Number(montantEdition) });
  }

  function handleAjout(e: FormEvent) {
    e.preventDefault();
    if (!nouvelleCategorie.trim() || !nouveauMontant) return;
    upsertMutation.mutate({ categorie: nouvelleCategorie.trim(), montant: Number(nouveauMontant) });
  }

  function toggleCategorie(categorie: string) {
    setCategorieOuverte((prev) => (prev === categorie ? null : categorie));
  }

  const categoriesDejaListees = new Set(data?.items.map((i) => i.categorie) ?? []);
  const categoriesSuggerees = categoriesConnues?.filter((c) => !categoriesDejaListees.has(c)) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Budgétisation</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <input
            type="month"
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
          />
          <button
            onClick={() => dupliquerMutation.mutate()}
            disabled={dupliquerMutation.isPending}
            className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            title={`Copier les budgets de ${MOIS_LABELS[moisPrecedent(annee, mois).mois - 1]} ${moisPrecedent(annee, mois).annee}`}
          >
            Reprendre le mois précédent
          </button>
          <button
            onClick={() => {
              setShowAjout((o) => !o);
              setLigneEnEdition(null);
            }}
            className="px-3 py-1.5 bg-brand-600 text-white rounded-md text-xs font-medium hover:bg-brand-700"
          >
            + Catégorie
          </button>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
        {MOIS_LABELS[mois - 1]} {annee}
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2 mb-4">{error}</div>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Budget total prévu</p>
            <p className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-1">{formatMontant(data.totalBudget)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Dépensé réel</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{formatMontant(data.totalDepense)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Écart</p>
            <p className={`text-3xl font-bold mt-1 ${data.ecartTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.ecartTotal >= 0 ? '+' : ''}{formatMontant(data.ecartTotal)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Étudiants nécessaires</p>
            {etudiantsNecessaires(data.totalBudget) !== null ? (
              <>
                <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mt-1">≈ {etudiantsNecessaires(data.totalBudget)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  au tarif le plus bas : {formatMontant(montantMinimumParEtudiant!)} / étudiant
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400 mt-1">Filières ou droit d'inscription non définis</p>
            )}
          </div>
        </div>
      )}

      {showAjout && (
        <form onSubmit={handleAjout} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 mb-4 flex items-end gap-2 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Catégorie</label>
            <input
              list="categories-connues"
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm"
              value={nouvelleCategorie}
              onChange={(e) => setNouvelleCategorie(e.target.value)}
              required
            />
            <datalist id="categories-connues">
              {categoriesSuggerees.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Budget prévu (Ar)</label>
            <input
              type="number"
              min={0}
              className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm w-40"
              value={nouveauMontant}
              onChange={(e) => setNouveauMontant(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={upsertMutation.isPending} className="px-3 py-1.5 bg-brand-600 text-white rounded-md text-xs font-medium hover:bg-brand-700 disabled:opacity-50">
            Ajouter
          </button>
          <button type="button" onClick={() => setShowAjout(false)} className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:underline">
            Annuler
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium" />
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Budget prévu</th>
              <th className="px-4 py-3 font-medium">Dépensé réel</th>
              <th className="px-4 py-3 font-medium">Écart</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Aucune dépense ni budget pour ce mois</td></tr>
            )}
            {data?.items.map((ligne) => {
              const ouvert = categorieOuverte === ligne.categorie;
              const aDuDetail = ligne.detailsCount > 0;
              return (
                <Fragment key={ligne.categorie}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-400 cursor-pointer" onClick={() => toggleCategorie(ligne.categorie)}>
                      {ouvert ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td
                      className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                      onClick={() => toggleCategorie(ligne.categorie)}
                    >
                      {ligne.categorie}
                      {aDuDetail && (
                        <span className="ml-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                          ({ligne.detailsCount} ligne{ligne.detailsCount > 1 ? 's' : ''})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {aDuDetail ? (
                        <div>
                          <span className="text-slate-700 dark:text-slate-300" title="Calculé à partir du détail — dépliez la ligne pour le modifier">
                            {formatMontant(ligne.montantBudget!)}
                          </span>
                          {etudiantsNecessaires(ligne.montantBudget!) !== null && (
                            <p className="text-[10px] text-slate-400">≈ {etudiantsNecessaires(ligne.montantBudget!)} étudiants</p>
                          )}
                        </div>
                      ) : ligneEnEdition === ligne.categorie ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            autoFocus
                            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 text-sm w-28"
                            value={montantEdition}
                            onChange={(e) => setMontantEdition(e.target.value)}
                          />
                          <button
                            onClick={() => validerEdition(ligne.categorie)}
                            disabled={upsertMutation.isPending}
                            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            OK
                          </button>
                          <button onClick={() => setLigneEnEdition(null)} className="text-xs text-slate-400 hover:underline">
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => ouvrirEdition(ligne)} className="text-slate-700 dark:text-slate-300 hover:underline">
                            {ligne.montantBudget !== null ? formatMontant(ligne.montantBudget) : <span className="text-slate-400">— définir —</span>}
                          </button>
                          {ligne.montantBudget !== null && etudiantsNecessaires(ligne.montantBudget) !== null && (
                            <p className="text-[10px] text-slate-400">≈ {etudiantsNecessaires(ligne.montantBudget)} étudiants</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-medium whitespace-nowrap">{formatMontant(ligne.montantDepense)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {ligne.ecart !== null ? (
                        <span className={ligne.ecart >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                          {ligne.ecart >= 0 ? '+' : ''}{formatMontant(ligne.ecart)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {ligne.montantBudget === null ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                          Sans budget
                        </span>
                      ) : ligne.ecart !== null && ligne.ecart < 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600">⚠️ Dépassement</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">✅ Dans le budget</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {ligne.id && !aDuDetail && (
                        <button
                          onClick={() => supprimerMutation.mutate(ligne.id!)}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Retirer le budget
                        </button>
                      )}
                    </td>
                  </tr>
                  {ouvert && (
                    <tr>
                      <td colSpan={7} className="p-0 bg-slate-50 dark:bg-slate-800/40">
                        <DetailBudgetCategorie categorie={ligne.categorie} annee={annee} mois={mois} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
