import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { CentreFormation, Universite } from '../lib/types';
import { BackButton } from '../components/BackButton';

type EtablissementType = 'universite' | 'centre-formation';

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
  nom: string;
  description: string;
  adresse: string;
  ville: string;
  region: string;
  telephone: string;
  email: string;
  contact: string;
  siteWeb: string;
  photos: string[];
}

const EMPTY_VALUES: FormValues = {
  nom: '',
  description: '',
  adresse: '',
  ville: '',
  region: '',
  telephone: '',
  email: '',
  contact: '',
  siteWeb: '',
  photos: [],
};

function toValues(item: Universite | CentreFormation): FormValues {
  return {
    nom: item.nom,
    description: 'description' in item ? item.description ?? '' : '',
    adresse: item.adresse ?? '',
    ville: item.ville ?? '',
    region: item.region ?? '',
    telephone: 'telephone' in item ? item.telephone ?? '' : '',
    email: 'email' in item ? item.email ?? '' : '',
    contact: 'contact' in item ? item.contact ?? '' : '',
    siteWeb: item.siteWeb ?? '',
    photos: 'photos' in item && Array.isArray(item.photos) ? (item.photos as string[]) : [],
  };
}

export function MesEtablissements() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<EtablissementType>('universite');
  const [editing, setEditing] = useState<{ type: EtablissementType; id: string } | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: universites } = useQuery({
    queryKey: ['mes-universites'],
    queryFn: async () => (await api.get<Universite[]>('/universites/mes-etablissements')).data,
  });

  const { data: centres } = useQuery({
    queryKey: ['mes-centres-formation'],
    queryFn: async () => (await api.get<CentreFormation[]>('/centres-formation/mes-etablissements')).data,
  });

  function openCreate(type: EtablissementType) {
    setEditing(null);
    setFormType(type);
    setValues(EMPTY_VALUES);
    setError(null);
    setShowForm(true);
  }

  function openEdit(type: EtablissementType, item: Universite | CentreFormation) {
    setEditing({ type, id: item.id });
    setFormType(type);
    setValues(toValues(item));
    setError(null);
    setShowForm(true);
  }

  function buildPayload() {
    const base = {
      nom: values.nom,
      adresse: values.adresse || undefined,
      ville: values.ville || undefined,
      region: values.region || undefined,
      siteWeb: values.siteWeb || undefined,
    };
    if (formType === 'universite') {
      return {
        ...base,
        description: values.description || undefined,
        telephone: values.telephone || undefined,
        email: values.email || undefined,
        photos: values.photos,
      };
    }
    return { ...base, contact: values.contact || undefined };
  }

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string }>('/uploads/image', formData);
      const fullUrl = `${api.defaults.baseURL ?? ''}${data.url}`;
      setValues((v) => ({ ...v, photos: [...v.photos, fullUrl] }));
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? "Échec de l'envoi de la photo");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function removePhoto(index: number) {
    setValues((v) => ({ ...v, photos: v.photos.filter((_, i) => i !== index) }));
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = buildPayload();
      if (editing) {
        const path = editing.type === 'universite' ? `/universites/mine/${editing.id}` : `/centres-formation/mine/${editing.id}`;
        return api.patch(path, payload);
      }
      const path = formType === 'universite' ? '/universites' : '/centres-formation';
      return api.post(path, payload);
    },
    onSuccess: () => {
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['mes-universites'] });
      queryClient.invalidateQueries({ queryKey: ['mes-centres-formation'] });
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

  function renderList(type: EtablissementType, items: (Universite | CentreFormation)[] | undefined, icon: string, label: string) {
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
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune fiche pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const statut = item.statutValidation ?? 'APPROUVE';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openEdit(type, item)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{item.nom}</span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${STATUT_CLASSES[statut]}`}>
                      {STATUT_LABELS[statut]}
                    </span>
                  </div>
                  {item.ville && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.ville}</p>}
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Mes établissements</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Ajoutez ou modifiez vos universités et centres de formation professionnelle. Chaque fiche créée ou modifiée
          repasse par une validation avant d'être visible publiquement.
        </p>
      </div>

      {renderList('universite', universites, '🎓', 'Universités')}
      {renderList('centre-formation', centres, '🛠️', 'Formations professionnelles')}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editing ? 'Modifier' : 'Ajouter'} — {formType === 'universite' ? 'Université' : 'Formation professionnelle'}
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

              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Type d'établissement</label>
                  <select
                    className="field-input"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as EtablissementType)}
                  >
                    <option value="universite">Université</option>
                    <option value="centre-formation">Formation professionnelle</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  className="field-input"
                  value={values.nom}
                  onChange={(e) => setValues({ ...values, nom: e.target.value })}
                />
              </div>

              {formType === 'universite' && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
                  <textarea
                    className="field-input"
                    rows={3}
                    value={values.description}
                    onChange={(e) => setValues({ ...values, description: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Adresse</label>
                <input
                  type="text"
                  className="field-input"
                  value={values.adresse}
                  onChange={(e) => setValues({ ...values, adresse: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Ville</label>
                  <input
                    type="text"
                    className="field-input"
                    value={values.ville}
                    onChange={(e) => setValues({ ...values, ville: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Région</label>
                  <input
                    type="text"
                    className="field-input"
                    value={values.region}
                    onChange={(e) => setValues({ ...values, region: e.target.value })}
                  />
                </div>
              </div>

              {formType === 'universite' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Téléphone</label>
                    <input
                      type="text"
                      className="field-input"
                      value={values.telephone}
                      onChange={(e) => setValues({ ...values, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      className="field-input"
                      value={values.email}
                      onChange={(e) => setValues({ ...values, email: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Contact</label>
                  <input
                    type="text"
                    className="field-input"
                    value={values.contact}
                    onChange={(e) => setValues({ ...values, contact: e.target.value })}
                  />
                </div>
              )}

              {formType === 'universite' && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Photos</label>
                  {values.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {values.photos.map((url, i) => (
                        <div key={url + i} className="relative">
                          <img src={url} alt="" className="h-16 w-16 rounded-md object-cover border border-slate-300 dark:border-slate-700" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            aria-label="Supprimer la photo"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="inline-block px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    {uploadingPhoto ? 'Envoi...' : '+ Ajouter une photo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Site web</label>
                <input
                  type="text"
                  className="field-input"
                  value={values.siteWeb}
                  onChange={(e) => setValues({ ...values, siteWeb: e.target.value })}
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
