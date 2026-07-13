import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Ticket, TicketPriorite, TicketStatut } from '../lib/types';

const STATUT_LABELS: Record<TicketStatut, string> = {
  OUVERT: 'Ouvert',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  FERME: 'Fermé',
};

const STATUT_CLASSES: Record<TicketStatut, string> = {
  OUVERT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  EN_COURS: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  RESOLU: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  FERME: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
};

const PRIORITE_LABELS: Record<TicketPriorite, string> = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
};

const PRIORITE_CLASSES: Record<TicketPriorite, string> = {
  BASSE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  MOYENNE: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  HAUTE: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
};

const CATEGORIES = ['TECHNIQUE', 'ORIENTATION', 'COMPTE', 'AUTRE'];

export function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres
  const [statutFilter, setStatutFilter] = useState<string>('');
  
  // Modal de création
  const [modalOpen, setModalOpen] = useState(false);
  const [sujet, setSujet] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('AUTRE');
  const [priorite, setPriorite] = useState<TicketPriorite>('MOYENNE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statutFilter]);

  async function fetchTickets() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statutFilter) params.append('statut', statutFilter);
      
      const res = await api.get<{ items: Ticket[] }>(`/tickets?${params.toString()}`);
      setTickets(res.data.items);
      setError(null);
    } catch {
      setError('Impossible de charger les tickets.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!sujet.trim()) return;

    try {
      setSubmitting(true);
      await api.post('/tickets', {
        sujet,
        description,
        categorie,
        priorite,
      });
      
      // Reset form
      setSujet('');
      setDescription('');
      setCategorie('AUTRE');
      setPriorite('MOYENNE');
      setModalOpen(false);
      
      // Refresh
      fetchTickets();
    } catch {
      alert('Erreur lors de la création du ticket.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Support & Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Posez vos questions ou signalez un problème. Notre équipe vous répondra au plus vite.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary self-start sm:self-center px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Créer un ticket
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Statut :</label>
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Tous les tickets</option>
          <option value="OUVERT">Ouverts</option>
          <option value="EN_COURS">En cours</option>
          <option value="RESOLU">Résolus</option>
          <option value="FERME">Fermés</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aucun ticket</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Vous n'avez pas encore créé de ticket correspondant à ce filtre. Ouvrez un ticket pour contacter notre équipe.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 hover:dark:border-purple-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {ticket.categorie}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUT_CLASSES[ticket.statut]}`}>
                    {STATUT_LABELS[ticket.statut]}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${PRIORITE_CLASSES[ticket.priorite]}`}>
                    {PRIORITE_LABELS[ticket.priorite]}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {ticket.sujet}
                </h3>
                {ticket.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-2xl">
                    {ticket.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 text-xs text-slate-400 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                <div className="text-left md:text-right">
                  <div>Modifié le</div>
                  <div className="font-semibold text-slate-600 dark:text-slate-350">
                    {new Date(ticket.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal de création */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-dropdown">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">Nouveau ticket</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Veuillez décrire le problème ou votre question en détail.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sujet *</label>
                <input
                  type="text"
                  required
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder="Ex: Problème d'accès à mon profil"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Catégorie</label>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Priorité</label>
                  <select
                    value={priorite}
                    onChange={(e) => setPriorite(e.target.value as TicketPriorite)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BASSE">Basse</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description / Détails *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre demande avec autant de détails que possible..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-sm font-bold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Création...' : 'Créer le ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
