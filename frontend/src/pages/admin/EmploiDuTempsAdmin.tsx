import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Enseignant, Filiere, JourSemaine, Paginated, Salle, SeanceCours } from '../../lib/types';

const JOURS: { value: JourSemaine; label: string }[] = [
  { value: 'LUNDI', label: 'Lundi' },
  { value: 'MARDI', label: 'Mardi' },
  { value: 'MERCREDI', label: 'Mercredi' },
  { value: 'JEUDI', label: 'Jeudi' },
  { value: 'VENDREDI', label: 'Vendredi' },
  { value: 'SAMEDI', label: 'Samedi' },
  { value: 'DIMANCHE', label: 'Dimanche' },
];

const FORM_VIDE = {
  matiere: '',
  filiereIds: [] as string[],
  enseignantId: '',
  jour: 'LUNDI' as JourSemaine,
  heureDebut: '',
  heureFin: '',
  salleId: '',
};

export function EmploiDuTempsAdmin() {
  const queryClient = useQueryClient();
  const [filiereFiltre, setFiliereFiltre] = useState('');
  const [enseignantFiltre, setEnseignantFiltre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-emploi-du-temps', filiereFiltre, enseignantFiltre],
    queryFn: async () =>
      (
        await api.get<Paginated<SeanceCours>>('/admin/emploi-du-temps', {
          params: { filiereId: filiereFiltre || undefined, enseignantId: enseignantFiltre || undefined },
        })
      ).data,
  });

  // Liste complète (jamais filtrée par filière/enseignant) pour calculer les salles libres/occupées
  // sur un créneau, indépendamment des filtres d'affichage du tableau.
  const { data: toutesLesSeances } = useQuery({
    queryKey: ['admin-emploi-du-temps-toutes'],
    queryFn: async () => (await api.get<Paginated<SeanceCours>>('/admin/emploi-du-temps')).data,
  });

  const { data: filieresData } = useQuery({
    queryKey: ['admin-filieres-edt'],
    queryFn: async () => (await api.get<Paginated<Filiere>>('/admin/filieres')).data,
  });

  const { data: enseignantsData } = useQuery({
    queryKey: ['enseignants-edt'],
    queryFn: async () => (await api.get<Paginated<Enseignant>>('/enseignants', { params: { limit: 100 } })).data,
  });

  const { data: sallesData } = useQuery({
    queryKey: ['admin-salles-edt'],
    queryFn: async () => (await api.get<Paginated<Salle>>('/admin/salles')).data,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-emploi-du-temps'] });
    queryClient.invalidateQueries({ queryKey: ['admin-emploi-du-temps-toutes'] });
  }

  function showApiError(err: unknown) {
    const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
  }

  function payload() {
    return {
      matiere: form.matiere.trim(),
      filiereIds: form.filiereIds,
      enseignantId: form.enseignantId,
      jour: form.jour,
      heureDebut: form.heureDebut,
      heureFin: form.heureFin,
      salleId: form.salleId,
    };
  }

  const creerMutation = useMutation({
    mutationFn: () => api.post('/admin/emploi-du-temps', payload()),
    onSuccess: () => {
      invalidate();
      fermerForm();
    },
    onError: showApiError,
  });

  const modifierMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/emploi-du-temps/${id}`, payload()),
    onSuccess: () => {
      invalidate();
      fermerForm();
    },
    onError: showApiError,
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/emploi-du-temps/${id}`),
    onSuccess: invalidate,
  });

  function fermerForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(FORM_VIDE);
    setError(null);
  }

  function ouvrirAjout() {
    setForm(FORM_VIDE);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function ouvrirEdition(s: SeanceCours) {
    setForm({
      matiere: s.matiere,
      filiereIds: s.filieres.map((f) => f.id),
      enseignantId: s.enseignantId,
      jour: s.jour,
      heureDebut: s.heureDebut,
      heureFin: s.heureFin,
      salleId: s.salleId,
    });
    setEditingId(s.id);
    setError(null);
    setShowForm(true);
  }

  function toggleFiliere(id: string) {
    setForm((f) => ({
      ...f,
      filiereIds: f.filiereIds.includes(id) ? f.filiereIds.filter((fid) => fid !== id) : [...f.filiereIds, id],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.filiereIds.length) {
      setError('Sélectionnez au moins une filière');
      return;
    }
    if (editingId) modifierMutation.mutate(editingId);
    else creerMutation.mutate();
  }

  const seancesParJour = JOURS.map((j) => ({
    ...j,
    seances: (data?.items ?? []).filter((s) => s.jour === j.value).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)),
  }));

  // Deux créneaux se chevauchent si debut1 < fin2 ET debut2 < fin1 (comparaison de chaînes
  // "HH:mm" valide puisque toujours au même format à 5 caractères).
  function seChevauchent(debut1: string, fin1: string, debut2: string, fin2: string) {
    return debut1 < fin2 && debut2 < fin1;
  }

  const creneauComplet = !!(form.jour && form.heureDebut && form.heureFin && form.heureFin > form.heureDebut);
  const seancesDuCreneauMemeJour = creneauComplet
    ? (toutesLesSeances?.items ?? []).filter(
        (s) => s.jour === form.jour && s.id !== editingId && seChevauchent(form.heureDebut, form.heureFin, s.heureDebut, s.heureFin),
      )
    : [];
  const sallesOccupeesSurCreneau = new Map(seancesDuCreneauMemeJour.map((s) => [s.salleId, s]));
  const toutesLesSalles = sallesData?.items ?? [];
  const sallesLibresSurCreneau = toutesLesSalles.filter((salle) => !sallesOccupeesSurCreneau.has(salle.id));

  const enseignantSelectionne = enseignantsData?.items.find((ens) => ens.id === form.enseignantId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Emploi du temps</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={filiereFiltre}
            onChange={(e) => setFiliereFiltre(e.target.value)}
          >
            <option value="">— Toutes les filières —</option>
            {filieresData?.items.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={enseignantFiltre}
            onChange={(e) => setEnseignantFiltre(e.target.value)}
          >
            <option value="">— Tous les enseignants —</option>
            {enseignantsData?.items.map((ens) => (
              <option key={ens.id} value={ens.id}>{ens.prenom} {ens.nom}</option>
            ))}
          </select>
          <button onClick={ouvrirAjout} className="px-3 py-1.5 bg-brand-600 text-white rounded-md text-xs font-medium hover:bg-brand-700">
            + Séance
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2 mb-4">{error}</div>
      )}

      {toutesLesSalles.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-sm rounded-md px-3 py-2 mb-4">
          Aucune salle n'est encore définie. Créez-en d'abord dans la page <a href="/admin/salles" className="underline font-medium">Salles</a>.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 mb-4 space-y-3">
          <div className="flex items-end gap-2 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Matière</label>
              <input
                list="matieres-suggestions"
                className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm w-44"
                placeholder="Ex: Anglais général"
                value={form.matiere}
                onChange={(e) => setForm({ ...form, matiere: e.target.value })}
                required
              />
              <datalist id="matieres-suggestions">
                {(enseignantSelectionne?.matieres ?? []).map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Enseignant</label>
              <select
                className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm"
                value={form.enseignantId}
                onChange={(e) => setForm({ ...form, enseignantId: e.target.value })}
                required
              >
                <option value="">—</option>
                {enseignantsData?.items.map((ens) => (
                  <option key={ens.id} value={ens.id}>{ens.prenom} {ens.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jour</label>
              <select
                className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm"
                value={form.jour}
                onChange={(e) => setForm({ ...form, jour: e.target.value as JourSemaine })}
                required
              >
                {JOURS.map((j) => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Heure début</label>
              <input
                type="time"
                className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm"
                value={form.heureDebut}
                onChange={(e) => setForm({ ...form, heureDebut: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Heure fin</label>
              <input
                type="time"
                className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm"
                value={form.heureFin}
                onChange={(e) => setForm({ ...form, heureFin: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Salle</label>
              <select
                className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1.5 text-sm"
                value={form.salleId}
                onChange={(e) => setForm({ ...form, salleId: e.target.value })}
                required
              >
                <option value="">—</option>
                {toutesLesSalles.map((salle) => (
                  <option key={salle.id} value={salle.id} disabled={creneauComplet && sallesOccupeesSurCreneau.has(salle.id)}>
                    {salle.nom} ({salle.capacite} places){creneauComplet && sallesOccupeesSurCreneau.has(salle.id) ? ' — occupée' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Filières concernées <span className="text-slate-400">(cochez-en plusieurs si la matière leur est commune)</span>
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {filieresData?.items.map((f) => (
                <label key={f.id} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={form.filiereIds.includes(f.id)} onChange={() => toggleFiliere(f.id)} />
                  {f.nom}
                </label>
              ))}
            </div>
          </div>

          {creneauComplet && toutesLesSalles.length > 0 && (
            <div className="text-xs space-y-0.5">
              {sallesLibresSurCreneau.length > 0 && (
                <p className="text-emerald-600 dark:text-emerald-400">
                  ✅ Salles libres pour ce créneau : {sallesLibresSurCreneau.map((s) => `${s.nom} (${s.capacite} places)`).join(', ')}
                </p>
              )}
              {sallesOccupeesSurCreneau.size > 0 && (
                <p className="text-amber-600 dark:text-amber-500">
                  ⚠️ Occupées : {Array.from(sallesOccupeesSurCreneau.values())
                    .map((s) => `${s.salle.nom} (${s.matiere}, ${s.enseignant.prenom} ${s.enseignant.nom}, ${s.heureDebut}-${s.heureFin})`)
                    .join(' · ')}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button type="submit" disabled={creerMutation.isPending || modifierMutation.isPending} className="px-3 py-1.5 bg-brand-600 text-white rounded-md text-xs font-medium hover:bg-brand-700 disabled:opacity-50">
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button type="button" onClick={fermerForm} className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:underline">
              Annuler
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-slate-400">Chargement...</p>}

      {!isLoading && (
        <div className="space-y-4">
          {seancesParJour.map((j) => (
            <div key={j.value} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {j.label}
              </div>
              {j.seances.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">Aucune séance</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {j.seances.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                          {s.heureDebut} – {s.heureFin}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium">{s.matiere}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.filieres.map((f) => f.nom).join(', ')}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.enseignant.prenom} {s.enseignant.nom}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.salle.nom} <span className="text-xs text-slate-400">({s.salle.capacite} places)</span></td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <button onClick={() => ouvrirEdition(s)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline mr-3">Modifier</button>
                          <button onClick={() => supprimerMutation.mutate(s.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
