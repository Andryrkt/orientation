import { FormEvent, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Editor from 'react-simple-wysiwyg';
import { useAuth } from '../lib/auth-context';
import { useFavoris } from '../lib/use-favoris';
import { api } from '../lib/api';
import { Blog, Paginated, RendezVous, ResultatOrientation } from '../lib/types';
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

function NewArticleForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [categorie, setCategorie] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/blogs', { titre, contenu, categorie: categorie || undefined, image: image || undefined }),
    onSuccess: () => {
      onCreated();
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
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">Nouvel article</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Votre article sera visible publiquement après validation par un modérateur.
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
              {createMutation.isPending ? 'Envoi...' : 'Soumettre pour modération'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MonEspace() {
  const { user } = useAuth();
  const { favoris } = useFavoris();
  const queryClient = useQueryClient();
  const [showArticleForm, setShowArticleForm] = useState(false);

  const isEmploye = user?.role === 'SECRETAIRE' || user?.role === 'MODERATEUR' || user?.role === 'MODERATEUR_FINANCE';
  const isCoachOuEnseignant = user?.role === 'COACH' || user?.role === 'TEACHER';

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

  if (!user) return null;

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

          <div className="sm:col-span-2">
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
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${BLOG_STATUT_CLASSES[a.statut]}`}>
                        {BLOG_STATUT_LABELS[a.statut]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {showArticleForm && (
        <NewArticleForm
          onClose={() => setShowArticleForm(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['mes-articles'] })}
        />
      )}
    </div>
  );
}
