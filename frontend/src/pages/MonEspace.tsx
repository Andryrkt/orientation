import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Editor from 'react-simple-wysiwyg';
import { useAuth } from '../lib/auth-context';
import { useFavoris } from '../lib/use-favoris';
import { api } from '../lib/api';
import { Blog, DemandeRole, DemandeRoleType, Paginated, RendezVous, ResultatOrientation } from '../lib/types';
import { RIASEC_LABELS } from '../lib/riasec';
import { BLOG_CATEGORIES } from '../lib/blog-categories';

const BLOG_STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente de modération',
  APPROUVE: 'Approuvé',
  REJETE: 'Rejeté',
};

const BLOG_STATUT_CLASSES: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  APPROUVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REJETE: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
};

const DEMANDE_STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CLARIFICATION_DEMANDEE: 'Complément demandé',
  APPROUVEE: 'Approuvée',
  REJETEE: 'Refusée',
};

const DEMANDE_STATUT_CLASSES: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  CLARIFICATION_DEMANDEE: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  APPROUVEE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REJETEE: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
};

const DEMANDE_TYPE_LABELS: Record<DemandeRoleType, string> = {
  COACH: 'Coach',
  ENSEIGNANT: 'Enseignant',
  ETUDIANT: 'Étudiant',
  GESTIONNAIRE_ETABLISSEMENT: "Gestionnaire d'établissement",
};

const NIVEAUX_ETUDE_OPTIONS: { value: string; label: string }[] = [
  { value: 'LYCEE', label: 'Lycée' },
  { value: 'NOUVEAU_BACHELIER', label: 'Nouveau Bachelier' },
  { value: 'UNIVERSITE', label: 'Université' },
];

interface DemandeFormValues {
  message: string;
  telephone: string;
  bio: string;
  disponibilites: string;
  specialites: string;
  experience: string;
  matieres: string;
  niveauxEtude: string;
  etablissement: string;
  niveauEtude: string;
}

const EMPTY_DEMANDE_FORM: DemandeFormValues = {
  message: '',
  telephone: '',
  bio: '',
  disponibilites: '',
  specialites: '',
  experience: '',
  matieres: '',
  niveauxEtude: '',
  etablissement: '',
  niveauEtude: '',
};

function splitList(value: string): string[] | undefined {
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function buildDemandeFieldsPayload(values: DemandeFormValues) {
  return {
    message: values.message || undefined,
    telephone: values.telephone || undefined,
    bio: values.bio || undefined,
    disponibilites: values.disponibilites || undefined,
    specialites: splitList(values.specialites),
    experience: values.experience || undefined,
    matieres: splitList(values.matieres),
    niveauxEtude: splitList(values.niveauxEtude),
    etablissement: values.etablissement || undefined,
    niveauEtude: values.niveauEtude || undefined,
  };
}

function DemandeFieldsInputs({
  values,
  onChange,
  showCoach,
  showEnseignant,
  showEtudiant,
}: {
  values: DemandeFormValues;
  onChange: (patch: Partial<DemandeFormValues>) => void;
  showCoach: boolean;
  showEnseignant: boolean;
  showEtudiant?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          className="field-input"
          placeholder="Téléphone (optionnel)"
          value={values.telephone}
          onChange={(e) => onChange({ telephone: e.target.value })}
        />
        <input
          type="text"
          className="field-input"
          placeholder="Disponibilités (ex : soirs et week-ends)"
          value={values.disponibilites}
          onChange={(e) => onChange({ disponibilites: e.target.value })}
        />
      </div>
      <textarea
        className="field-input"
        rows={2}
        placeholder="Présentation / bio (optionnel)"
        value={values.bio}
        onChange={(e) => onChange({ bio: e.target.value })}
      />
      {showCoach && (
        <div className="grid sm:grid-cols-2 gap-3 border-l-2 border-brand-200 dark:border-brand-800 pl-3">
          <input
            type="text"
            className="field-input"
            placeholder="Spécialités coach (séparées par des virgules)"
            value={values.specialites}
            onChange={(e) => onChange({ specialites: e.target.value })}
          />
          <input
            type="text"
            className="field-input"
            placeholder="Expérience (coach)"
            value={values.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
          />
        </div>
      )}
      {showEnseignant && (
        <div className="grid sm:grid-cols-2 gap-3 border-l-2 border-brand-200 dark:border-brand-800 pl-3">
          <input
            type="text"
            className="field-input"
            placeholder="Matières enseignées (séparées par des virgules)"
            value={values.matieres}
            onChange={(e) => onChange({ matieres: e.target.value })}
          />
          <input
            type="text"
            className="field-input"
            placeholder="Niveaux d'études (ex : LYCEE, UNIVERSITE)"
            value={values.niveauxEtude}
            onChange={(e) => onChange({ niveauxEtude: e.target.value })}
          />
          <input
            type="text"
            className="field-input sm:col-span-2"
            placeholder="Établissement de rattachement (optionnel)"
            value={values.etablissement}
            onChange={(e) => onChange({ etablissement: e.target.value })}
          />
        </div>
      )}
      {showEtudiant && (
        <div className="border-l-2 border-brand-200 dark:border-brand-800 pl-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Niveau d'étude *
          </label>
          <select
            className="field-input"
            value={values.niveauEtude}
            onChange={(e) => onChange({ niveauEtude: e.target.value })}
            required
          >
            <option value="">— Sélectionner —</option>
            {NIVEAUX_ETUDE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}
      <textarea
        className="field-input"
        rows={2}
        placeholder="Motivation (optionnel)"
        value={values.message}
        onChange={(e) => onChange({ message: e.target.value })}
      />
    </div>
  );
}

function DemandeRow({ demande, onCompleted }: { demande: DemandeRole; onCompleted: () => void }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<DemandeFormValues>({
    message: demande.message ?? '',
    telephone: demande.telephone ?? '',
    bio: demande.bio ?? '',
    disponibilites: demande.disponibilites ?? '',
    specialites: (demande.specialites ?? []).join(', '),
    experience: demande.experience ?? '',
    matieres: (demande.matieres ?? []).join(', '),
    niveauxEtude: (demande.niveauxEtude ?? []).join(', '),
    etablissement: demande.etablissement ?? '',
    niveauEtude: demande.niveauEtude ?? '',
  });
  const [error, setError] = useState<string | null>(null);

  const resubmitMutation = useMutation({
    mutationFn: () => api.patch(`/demandes-role/${demande.id}`, buildDemandeFieldsPayload(values)),
    onSuccess: () => {
      setEditing(false);
      setError(null);
      onCompleted();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Une erreur est survenue');
    },
  });

  return (
    <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800 dark:text-white">{DEMANDE_TYPE_LABELS[demande.type]}</span>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${DEMANDE_STATUT_CLASSES[demande.statut]}`}>
          {DEMANDE_STATUT_LABELS[demande.statut]}
        </span>
      </div>
      {demande.reponse && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
          <span className="font-semibold">Réponse de l'équipe : </span>{demande.reponse}
        </p>
      )}
      {demande.statut === 'CLARIFICATION_DEMANDEE' && (
        <div className="mt-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm font-semibold text-brand-600 dark:text-blue-400 hover:underline"
            >
              Compléter ma demande →
            </button>
          ) : (
            <div className="space-y-2 pt-1">
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              <DemandeFieldsInputs
                values={values}
                onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
                showCoach={demande.type === 'COACH'}
                showEnseignant={demande.type === 'ENSEIGNANT'}
                showEtudiant={demande.type === 'ETUDIANT'}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={resubmitMutation.isPending || (demande.type === 'ETUDIANT' && !values.niveauEtude)}
                  onClick={() => resubmitMutation.mutate()}
                  className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50"
                >
                  {resubmitMutation.isPending ? 'Envoi...' : 'Renvoyer la demande'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DevenirCoachEnseignant({
  estCoach,
  estEnseignant,
  demandes,
  onSubmitted,
}: {
  estCoach: boolean;
  estEnseignant: boolean;
  demandes: DemandeRole[];
  onSubmitted: () => void;
}) {
  const [selection, setSelection] = useState<DemandeRoleType[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inclut aussi APPROUVEE : évite de réafficher le choix juste après l'approbation, le temps
  // que le profil utilisateur (estCoach/estEnseignant) soit rechargé.
  const typesEnCours = new Set(
    demandes
      .filter((d) => d.statut === 'EN_ATTENTE' || d.statut === 'CLARIFICATION_DEMANDEE' || d.statut === 'APPROUVEE')
      .map((d) => d.type),
  );
  const typesDisponibles: DemandeRoleType[] = (['COACH', 'ENSEIGNANT'] as DemandeRoleType[]).filter(
    (t) => !(t === 'COACH' ? estCoach : estEnseignant) && !typesEnCours.has(t),
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      for (const type of selection) {
        await api.post('/demandes-role', { type, message: message || undefined });
      }
    },
    onSuccess: () => {
      setSelection([]);
      setMessage('');
      setError(null);
      onSubmitted();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Une erreur est survenue');
    },
  });

  function toggle(type: DemandeRoleType) {
    setSelection((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  return (
    <div className="space-y-3">
      {(estCoach || estEnseignant) && (
        <div className="flex flex-wrap gap-2">
          {estCoach && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ✅ Vous êtes Coach
            </span>
          )}
          {estEnseignant && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ✅ Vous êtes Enseignant
            </span>
          )}
        </div>
      )}

      {(estCoach || estEnseignant) && (
        <Link
          to="/mon-profil-professionnel"
          className="block px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          🎓 Gérer mon profil professionnel →
        </Link>
      )}

      {demandes.length > 0 && (
        <div className="space-y-2 mb-2">
          {demandes.map((d) => (
            <DemandeRow key={d.id} demande={d} onCompleted={onSubmitted} />
          ))}
        </div>
      )}

      {typesDisponibles.length > 0 && (
        <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Une fois approuvé, vous pourrez renseigner votre profil (bio, spécialités/matières, disponibilités...) vous-même — il sera revu par un admin avant d'être visible publiquement.
          </p>
          <div className="flex flex-wrap gap-3">
            {typesDisponibles.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={selection.includes(type)}
                  onChange={() => toggle(type)}
                  className="rounded"
                />
                {DEMANDE_TYPE_LABELS[type]}
              </label>
            ))}
          </div>
          <textarea
            className="field-input"
            rows={2}
            placeholder="Motivation (optionnel)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="button"
            disabled={selection.length === 0 || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      )}
    </div>
  );
}

function DevenirEtudiant({
  estEtudiant,
  demandes,
  onSubmitted,
}: {
  estEtudiant: boolean;
  demandes: DemandeRole[];
  onSubmitted: () => void;
}) {
  const [message, setMessage] = useState('');
  const [niveauEtude, setNiveauEtude] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inclut aussi APPROUVEE : évite de réafficher le formulaire de demande juste après
  // l'approbation, le temps que le profil utilisateur (estEtudiant/estGestionnaire) soit rechargé.
  const demandeEnCours = demandes.find(
    (d) => d.statut === 'EN_ATTENTE' || d.statut === 'CLARIFICATION_DEMANDEE' || d.statut === 'APPROUVEE',
  );

  const submitMutation = useMutation({
    mutationFn: () => api.post('/demandes-role', { type: 'ETUDIANT', message: message || undefined, niveauEtude }),
    onSuccess: () => {
      setMessage('');
      setNiveauEtude('');
      setError(null);
      onSubmitted();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Une erreur est survenue');
    },
  });

  if (estEtudiant) {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/budget"
          className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          💰 Simulateur de budget →
        </Link>
        <Link
          to="/ressources"
          className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          📚 Ressources d'apprentissage →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {demandes.length > 0 && (
        <div className="space-y-2 mb-2">
          {demandes.map((d) => (
            <DemandeRow key={d.id} demande={d} onCompleted={onSubmitted} />
          ))}
        </div>
      )}

      {!demandeEnCours && (
        <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Niveau d'étude *
            </label>
            <select
              className="field-input"
              value={niveauEtude}
              onChange={(e) => setNiveauEtude(e.target.value)}
              required
            >
              <option value="">— Sélectionner —</option>
              {NIVEAUX_ETUDE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <textarea
            className="field-input"
            rows={2}
            placeholder="Motivation (optionnel)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="button"
            disabled={submitMutation.isPending || !niveauEtude}
            onClick={() => submitMutation.mutate()}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Envoi...' : "Demander l'accès étudiant"}
          </button>
        </div>
      )}
    </div>
  );
}

function DevenirGestionnaireEtablissement({
  estGestionnaire,
  demandes,
  onSubmitted,
}: {
  estGestionnaire: boolean;
  demandes: DemandeRole[];
  onSubmitted: () => void;
}) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inclut aussi APPROUVEE : évite de réafficher le formulaire de demande juste après
  // l'approbation, le temps que le profil utilisateur (estEtudiant/estGestionnaire) soit rechargé.
  const demandeEnCours = demandes.find(
    (d) => d.statut === 'EN_ATTENTE' || d.statut === 'CLARIFICATION_DEMANDEE' || d.statut === 'APPROUVEE',
  );

  const submitMutation = useMutation({
    mutationFn: () => api.post('/demandes-role', { type: 'GESTIONNAIRE_ETABLISSEMENT', message: message || undefined }),
    onSuccess: () => {
      setMessage('');
      setError(null);
      onSubmitted();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Une erreur est survenue');
    },
  });

  if (estGestionnaire) {
    return (
      <Link
        to="/mes-etablissements"
        className="block px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        🏛️ Gérer mes établissements →
      </Link>
    );
  }

  return (
    <div className="space-y-3">
      {demandes.length > 0 && (
        <div className="space-y-2 mb-2">
          {demandes.map((d) => (
            <DemandeRow key={d.id} demande={d} onCompleted={onSubmitted} />
          ))}
        </div>
      )}

      {!demandeEnCours && (
        <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Devenez gestionnaire pour ajouter ou tenir à jour la fiche d'une université ou d'un centre de formation professionnelle. Toute fiche créée ou modifiée passe par une validation avant publication.
          </p>
          <textarea
            className="field-input"
            rows={2}
            placeholder="Motivation, établissement(s) concerné(s)... (optionnel)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="button"
            disabled={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Envoi...' : 'Demander à devenir gestionnaire'}
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ title, icon, children, action }: { title: string; icon: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function ArticleForm({
  article,
  onClose,
  onSaved,
}: {
  article?: Blog;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [titre, setTitre] = useState(article?.titre ?? '');
  const [contenu, setContenu] = useState(article?.contenu ?? '');
  const [categorie, setCategorie] = useState(article?.categorie ?? '');
  const [image, setImage] = useState(article?.image ?? '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => {
      const payload = { titre, contenu, categorie: categorie || undefined, image: image || undefined };
      return article ? api.patch(`/blogs/${article.id}/mine`, payload) : api.post('/blogs', payload);
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
    },
  });

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string }>('/uploads/image', formData);
      setImage(`${api.defaults.baseURL ?? ''}${data.url}`);
    } finally {
      setUploadingImage(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!titre.trim() || !contenu.trim()) return;
    createMutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative animate-dropdown max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
          {article ? "Modifier l'article" : 'Nouvel article'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {article
            ? "Toute modification renvoie l'article en modération avant sa republication."
            : 'Votre article sera visible publiquement après validation par un modérateur.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Titre *</label>
            <input type="text" required value={titre} onChange={(e) => setTitre(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Catégorie</label>
            <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="field-input">
              <option value="">—</option>
              {BLOG_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Image de couverture</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="field-input flex-1"
              />
              <label className="shrink-0 px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                {uploadingImage ? 'Envoi...' : 'Téléverser'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Contenu *</label>
            <div className="border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden bg-white text-slate-800">
              <Editor value={contenu} onChange={(e) => setContenu(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary px-5 py-2 text-sm font-bold rounded-xl disabled:opacity-50"
            >
              {createMutation.isPending ? 'Envoi...' : article ? 'Enregistrer et renvoyer en modération' : 'Soumettre pour modération'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MonEspace() {
  const { user, refreshUser } = useAuth();
  const { favoris } = useFavoris();
  const queryClient = useQueryClient();
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Blog | null>(null);

  // Le profil (estEtudiantValide, coachProfil, enseignantProfil, estGestionnaireEtablissement)
  // n'est chargé qu'une fois au démarrage de l'app — on le resynchronise à chaque visite de "Mon
  // espace" pour refléter une demande approuvée entre-temps sans exiger un rechargement complet.
  useEffect(() => {
    refreshUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmploye = user?.role === 'SECRETAIRE' || user?.role === 'MODERATEUR' || user?.role === 'MODERATEUR_FINANCE';
  // Déterminé par la capacité du compte, pas par le rôle système — un compte peut être coach,
  // enseignant, ou les deux à la fois, et gérer plusieurs profils de chaque.
  const estCoach = !!user?.estCoach;
  const estEnseignant = !!user?.estEnseignant;
  const isCoachOuEnseignant = estCoach || estEnseignant;
  const estEtudiantValide = !!user?.estEtudiantValide;
  const estGestionnaireEtablissement = !!user?.estGestionnaireEtablissement;

  const { data: resultats } = useQuery({
    queryKey: ['resultats-orientation'],
    queryFn: async () => (await api.get<ResultatOrientation[]>('/resultats-orientation')).data,
    enabled: !!user && !isEmploye,
  });

  const { data: rendezVous } = useQuery({
    queryKey: ['mes-rendez-vous'],
    queryFn: async () => (await api.get<Paginated<RendezVous>>('/rendez-vous?limit=100')).data,
    enabled: !!user && !isEmploye,
  });

  const { data: rendezVousATraiter } = useQuery({
    queryKey: ['rendez-vous-a-traiter'],
    queryFn: async () => (await api.get<Paginated<RendezVous>>('/rendez-vous?vue=a-traiter&limit=100')).data,
    enabled: !!user && isCoachOuEnseignant,
  });

  const { data: mesArticles } = useQuery({
    queryKey: ['mes-articles'],
    queryFn: async () => (await api.get<Blog[]>('/blogs/mes-articles')).data,
    enabled: !!user && !isEmploye,
  });

  const { data: mesDemandesRole } = useQuery({
    queryKey: ['mes-demandes-role'],
    queryFn: async () => (await api.get<DemandeRole[]>('/demandes-role/mes-demandes')).data,
    enabled: !!user && !isEmploye,
    // Le statut peut changer côté admin pendant que l'utilisateur navigue ailleurs dans l'app —
    // on revérifie donc à chaque retour sur Mon espace plutôt que de servir le cache React Query.
    refetchOnMount: 'always',
  });

  if (!user) return null;

  const demandesCoachEnseignant = (mesDemandesRole ?? []).filter(
    (d) => d.type !== 'ETUDIANT' && d.type !== 'GESTIONNAIRE_ETABLISSEMENT',
  );
  const demandesEtudiant = (mesDemandesRole ?? []).filter((d) => d.type === 'ETUDIANT');
  const demandesGestionnaire = (mesDemandesRole ?? []).filter((d) => d.type === 'GESTIONNAIRE_ETABLISSEMENT');

  const dernierResultat = resultats?.[0];
  const profilLabel = dernierResultat?.profilDominant
    ?.split('')
    .map((code) => RIASEC_LABELS[code])
    .filter(Boolean)
    .join(' / ');

  const rdvEnAttente = rendezVous?.items.filter((r) => r.statut === 'EN_ATTENTE').length ?? 0;
  const rdvATraiterEnAttente = rendezVousATraiter?.items.filter((r) => r.statut === 'EN_ATTENTE').length ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Bonjour {user.prenom} 👋</h1>
        <p className="text-slate-500 dark:text-slate-400">Votre espace personnel.</p>
      </div>

      {isEmploye ? (
        <Card title="Mon compte" icon="👤">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {user.prenom} {user.nom} — {user.email}
          </p>
          <Link to="/profil" className="text-sm text-brand-600 dark:text-blue-400 hover:underline">
            Gérer mon mot de passe →
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Aperçu
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {isCoachOuEnseignant && (
                <Card title="Rendez-vous à traiter" icon="📅">
                  <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">{rdvATraiterEnAttente}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">demande(s) en attente</p>
                  <Link to="/rendez-vous-a-traiter" className="text-sm text-brand-600 dark:text-blue-400 hover:underline">
                    Voir les demandes →
                  </Link>
                </Card>
              )}

              <Card title="Mes rendez-vous" icon="🗓️">
                <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">{rdvEnAttente}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">en attente de réponse</p>
                <Link to="/mes-rendez-vous" className="text-sm text-brand-600 dark:text-blue-400 hover:underline">
                  Voir mes rendez-vous →
                </Link>
              </Card>

              <Card title="Mes favoris" icon="⭐">
                <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">{favoris?.length ?? 0}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">élément(s) enregistré(s)</p>
                <Link to="/favoris" className="text-sm text-brand-600 dark:text-blue-400 hover:underline">
                  Voir mes favoris →
                </Link>
              </Card>

              <Card title="Mon profil d'orientation" icon="🧭">
                {profilLabel ? (
                  <>
                    <p className="text-lg font-black text-slate-800 dark:text-white mb-1">{profilLabel}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Dernier résultat</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Aucun test complété.</p>
                )}
                <Link to="/mes-resultats" className="text-sm text-brand-600 dark:text-blue-400 hover:underline">
                  Voir mes résultats →
                </Link>
              </Card>

              <Card title="Mon CV" icon="📄">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Générez un CV professionnel basé sur votre profil.
                </p>
                <Link to="/mon-cv" className="text-sm text-brand-600 dark:text-blue-400 hover:underline">
                  Créer / modifier mon CV →
                </Link>
              </Card>

              <Card title="Mon profil" icon="⚙️">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {user.prenom} {user.nom} — {user.email}
                </p>
                <Link to="/profil" className="text-sm text-brand-600 dark:text-blue-400 hover:underline">
                  Modifier mes informations →
                </Link>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Statuts &amp; demandes
            </h2>
            <div className="space-y-4">
              <Card title="Vie étudiante" icon="🎒">
                <DevenirEtudiant
                  estEtudiant={estEtudiantValide}
                  demandes={demandesEtudiant}
                  onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['mes-demandes-role'] })}
                />
              </Card>

              <Card title={isCoachOuEnseignant ? 'Coach / Enseignant' : 'Devenir coach ou enseignant'} icon="🎓">
                <DevenirCoachEnseignant
                  estCoach={estCoach}
                  estEnseignant={estEnseignant}
                  demandes={demandesCoachEnseignant}
                  onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['mes-demandes-role'] })}
                />
              </Card>

              <Card title="Gestionnaire d'établissement" icon="🏛️">
                <DevenirGestionnaireEtablissement
                  estGestionnaire={estGestionnaireEtablissement}
                  demandes={demandesGestionnaire}
                  onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['mes-demandes-role'] })}
                />
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Mon activité
            </h2>
            <Card
              title="Mes articles"
              icon="✍️"
              action={
                <button
                  type="button"
                  onClick={() => setShowArticleForm(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                >
                  + Nouvel article
                </button>
              }
            >
              {!mesArticles || mesArticles.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Vous n'avez pas encore publié d'article.</p>
              ) : (
                <div className="space-y-2">
                  {mesArticles.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5"
                    >
                      <span className="text-sm font-medium text-slate-800 dark:text-white truncate">{a.titre}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${BLOG_STATUT_CLASSES[a.statut]}`}>
                          {BLOG_STATUT_LABELS[a.statut]}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingArticle(a)}
                          className="text-xs font-semibold text-brand-600 dark:text-blue-400 hover:underline"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </div>
      )}

      {showArticleForm && (
        <ArticleForm
          onClose={() => setShowArticleForm(false)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['mes-articles'] })}
        />
      )}

      {editingArticle && (
        <ArticleForm
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['mes-articles'] })}
        />
      )}
    </div>
  );
}
