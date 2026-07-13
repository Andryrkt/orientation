import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Ticket, TicketMessage, TicketPriorite, TicketStatut } from '../lib/types';

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
  BASSE: 'Priorité Basse',
  MOYENNE: 'Priorité Moyenne',
  HAUTE: 'Priorité Haute',
};

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchTicket() {
    try {
      setLoading(true);
      const res = await api.get<Ticket>(`/tickets/${id}`);
      setTicket(res.data);
      setMessages(res.data.messages || []);
      setError(null);
    } catch {
      setError('Impossible de charger le ticket.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      setSubmitting(true);
      const res = await api.post<TicketMessage>(`/tickets/${id}/messages`, {
        message: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      
      // Mettre à jour aussi le statut du ticket localement s'il était OUVERT
      if (ticket && ticket.statut === 'OUVERT' && user?.role === 'ADMIN') {
        setTicket({ ...ticket, statut: 'EN_COURS' });
      }
    } catch {
      alert('Impossible d\'envoyer le message.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseTicket() {
    if (!id || !window.confirm('Voulez-vous vraiment fermer ce ticket ? Cette action est irréversible.')) return;

    try {
      setUpdating(true);
      await api.patch(`/tickets/${id}`, { statut: 'FERME' });
      if (ticket) {
        setTicket({ ...ticket, statut: 'FERME' });
      }
    } catch {
      alert('Impossible de fermer le ticket.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 font-medium">
          {error || 'Ticket introuvable.'}
        </div>
        <Link to="/tickets" className="btn-secondary px-5 py-2.5 rounded-xl font-bold inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/tickets" className="hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
          Support & Tickets
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-white font-semibold">Détails du ticket</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Volet principal : Discussion */}
        <div className="md:col-span-2 space-y-4 flex flex-col h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {/* Titre du ticket dans la discussion */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{ticket.sujet}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Corps de discussion */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {/* Description initiale du ticket */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                {ticket.utilisateur?.prenom?.[0] || 'U'}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {ticket.utilisateur?.prenom} {ticket.utilisateur?.nom} <span className="font-normal text-slate-400">(Auteur)</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-md whitespace-pre-line shadow-sm border border-slate-200/20">
                  {ticket.description || <span className="italic text-slate-400">Pas de description fournie.</span>}
                </div>
              </div>
            </div>

            {/* Messages suivants */}
            {messages.map((message) => {
              const isMe = message.auteurId === user?.id;
              return (
                <div key={message.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-500/10 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {message.auteur?.prenom?.[0] || 'S'}
                    </div>
                  )}
                  <div className={`space-y-1 ${isMe ? 'text-right' : ''}`}>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {isMe ? 'Vous' : `${message.auteur?.prenom} ${message.auteur?.nom}`}
                    </div>
                    <div
                      className={`text-sm rounded-2xl px-4 py-2.5 max-w-md whitespace-pre-line shadow-sm border ${
                        isMe
                          ? 'bg-purple-600 text-white border-purple-500 rounded-tr-none text-left'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/20 rounded-tl-none'
                      }`}
                    >
                      {message.message}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Formulaire de réponse */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            {ticket.statut === 'FERME' ? (
              <div className="text-center text-sm font-medium text-slate-500 py-2">
                Ce ticket est fermé. Vous ne pouvez plus y répondre.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={submitting || !newMessage.trim()}
                  className="btn-primary p-2.5 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50"
                  title="Envoyer"
                >
                  <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Volet latéral : Métadonnées / Actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Informations</h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-400">Statut</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${STATUT_CLASSES[ticket.statut]}`}>
                  {STATUT_LABELS[ticket.statut]}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400">Priorité</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-350 mt-1">
                  {PRIORITE_LABELS[ticket.priorite]}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Catégorie</div>
                <div className="text-sm font-bold text-slate-750 dark:text-slate-300 mt-1 uppercase">
                  {ticket.categorie}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Dernière mise à jour</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {new Date(ticket.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>

          {ticket.statut !== 'FERME' && (
            <button
              onClick={handleCloseTicket}
              disabled={updating}
              className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white hover:dark:text-white rounded-2xl py-3 text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fermer le ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
