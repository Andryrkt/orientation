import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Coach, Enseignant } from '../lib/types';
import { BackButton } from '../components/BackButton';

type ProfilType = 'coach' | 'enseignant';

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente de validation',
  APPROUVE: 'Publié',
  REJETE: 'Refusé',
};

const STATUT_CLASSES: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  APPROUVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REJETE: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
};

interface FormValues {
  bio: string;
  tags: string; // specialites (coach) ou matieres (enseignant)
  experience: string; // coach uniquement
  niveauxEtude: string; // enseignant uniquement
  etablissement: string; // enseignant uniquement
  disponibilites: string;
  telephone: string;
}

const EMPTY_VALUES: FormValues = {
  bio: '',
  tags: '',
  experience: '',
  niveauxEtude: '',
  etablissement: '',
  disponibilites: '',
  telephone: '',
};

function toValues(item: Coach | Enseignant, type: ProfilType): FormValues {
  return {
    bio: item.bio ?? '',
    tags: (type === 'coach' ? (item as Coach).specialites : (item as Enseignant).matieres)?.join(', ') ?? '',
    experience: type === 'coach' ? (item as Coach).experience ?? '' : '',
    niveauxEtude: type === 'enseignant' ? (item as Enseignant).niveauxEtude?.join(', ') ?? '' : '',
    etablissement: type === 'enseignant' ? (item as Enseignant).etablissement ?? '' : '',
    disponibilites: item.disponibilites ?? '',
    telephone: item.telephone ?? '',
  };
}

export function MonProfilProfessionnel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const estCoach = !!user?.estCoach;
  const estEnseignant = !!user?.estEnseignant;

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<ProfilType>('coach');
  const [editing, setEditing] = useState<{ type: ProfilType; id: string } | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);

  const { data: coachs } = useQuery({
    queryKey: ['mes-profils-coach'],
    queryFn: async () => (await api.get<Coach[]>('/coachs/mes-profils')).data,
    enabled: estCoach,
  });

  const { data: enseignants } = useQuery({
    queryKey: ['mes-profils-enseignant'],
    queryFn: async () => (await api.get<Enseignant[]>('/enseignants/mes-profils')).data,
    enabled: estEnseignant,
  });

  function openCreate(type: ProfilType) {
    setEditing(null);
    setFormType(type);
    setValues(EMPTY_VALUES);
    setError(null);
    setShowForm(true);
  }

  function openEdit(type: ProfilType, item: Coach | Enseignant) {
    setEditing({ type, id: item.id });
    setFormType(type);
    setValues(toValues(item, type));
    setError(null);
    setShowForm(true);
  }

  function buildPayload() {
    const base = {
      bio: values.bio || undefined,
      disponibilites: values.disponibilites || undefined,
      telephone: values.telephone || undefined,
    };
    if (formType === 'coach') {
      return {
        ...base,
        specialites: values.tags.split(',').map((s) => s.trim()).filter(Boolean),
        experience: values.experience || undefined,
      };
    }
    return {
      ...base,
      matieres: values.tags.split(',').map((s) => s.trim()).filter(Boolean),
      niveauxEtude: values.niveauxEtude.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
      etablissement: values.etablissement || undefined,
    };
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = buildPayload();
      if (editing) {
        const path = editing.type === 'coach' ? `/coachs/mine/${editing.id}` : `/enseignants/mine/${editing.id}`;
        return api.patch(path, payload);
      }
      const path = formType === 'coach' ? '/coachs' : '/enseignants';
      return api.post(path, payload);
    },
    onSuccess: () => {
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['mes-profils-coach'] });
      queryClient.invalidateQueries({ queryKey: ['mes-profils-enseignant'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Une erreur est survenue');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate();
  }

  function renderList(type: ProfilType, items: (Coach | Enseignant)[] | undefined, icon: string, label: string) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>{icon}</span> {label}
          </h2>
          <button
            type="button"
            onClick={() => openCreate(type)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
          >
            + Ajouter
          </button>
        </div>
        {!items || items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucun profil pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const statut = item.statutValidation ?? 'APPROUVE';
              const tags = type === 'coach' ? (item as Coach).specialites : (item as Enseignant).matieres;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openEdit(type, item)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {tags?.length ? tags.join(', ') : `${item.prenom} ${item.nom}`}
                    </span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${STATUT_CLASSES[statut]}`}>
                      {STATUT_LABELS[statut]}
                    </span>
                  </div>
                  {type === 'enseignant' && (item as Enseignant).etablissement && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{(item as Enseignant).etablissement}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton fallback="/mon-espace" />
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Mon profil professionnel</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Créez et gérez vos profils Coach et/ou Enseignant — vous pouvez en avoir plusieurs (ex: coach sportif et
          coach en orientation, ou Maths au lycée et Algèbre à l'université). Chaque création ou modification repasse
          par une validation avant d'être visible publiquement.
        </p>
      </div>

      {estCoach && renderList('coach', coachs, '🧑‍🏫', 'Mes profils Coach')}
      {estEnseignant && renderList('enseignant', enseignants, '📖', 'Mes profils Enseignant')}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editing ? 'Modifier' : 'Ajouter'} — {formType === 'coach' ? 'Profil Coach' : 'Profil Enseignant'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Fermer"
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">{error}</div>
              )}

              {!editing && estCoach && estEnseignant && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Type de profil</label>
                  <select
                    className="field-input"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ProfilType)}
                  >
                    <option value="coach">Coach</option>
                    <option value="enseignant">Enseignant</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Bio</label>
                <textarea
                  className="field-input"
                  rows={3}
                  value={values.bio}
                  onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {formType === 'coach' ? 'Spécialités' : 'Matières'} (séparées par des virgules)
                </label>
                <input
                  className="field-input"
                  value={values.tags}
                  onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
                />
              </div>

              {formType === 'coach' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Expérience</label>
                  <textarea
                    className="field-input"
                    rows={2}
                    value={values.experience}
                    onChange={(e) => setValues((v) => ({ ...v, experience: e.target.value }))}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Niveaux d'études (LYCEE, NOUVEAU_BACHELIER, UNIVERSITE)
                    </label>
                    <input
                      className="field-input"
                      value={values.niveauxEtude}
                      onChange={(e) => setValues((v) => ({ ...v, niveauxEtude: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Établissement de rattachement
                    </label>
                    <input
                      className="field-input"
                      value={values.etablissement}
                      onChange={(e) => setValues((v) => ({ ...v, etablissement: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Disponibilités</label>
                <input
                  className="field-input"
                  value={values.disponibilites}
                  onChange={(e) => setValues((v) => ({ ...v, disponibilites: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Téléphone</label>
                <input
                  className="field-input"
                  value={values.telephone}
                  onChange={(e) => setValues((v) => ({ ...v, telephone: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Envoi...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
