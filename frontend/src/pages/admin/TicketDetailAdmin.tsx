import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Ticket, TicketMessage, TicketPriorite, TicketStatut } from '../../lib/types';

const STATUT_LABELS: Record<TicketStatut, string> = {
  OUVERT: 'Ouvert',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  FERME: 'Fermé',
};

const PRIORITE_LABELS: Record<TicketPriorite, string> = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
};

export function TicketDetailAdmin() {
  const { id } = useParams<{ id: string }>();
  
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
      
      // Si le statut était OUVERT, il passe à EN_COURS côté backend lors d'un message admin
      if (ticket && ticket.statut === 'OUVERT') {
        setTicket({ ...ticket, statut: 'EN_COURS' });
      }
    } catch {
      alert('Impossible d\'envoyer le message.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateStatus(statut: TicketStatut) {
    if (!id || !ticket) return;

    try {
      setUpdating(true);
      await api.patch(`/tickets/${id}`, { statut });
      setTicket({ ...ticket, statut });
    } catch {
      alert('Impossible de modifier le statut.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdatePriority(priorite: TicketPriorite) {
    if (!id || !ticket) return;

    try {
      setUpdating(true);
      await api.patch(`/tickets/${id}`, { priorite });
      setTicket({ ...ticket, priorite });
    } catch {
      alert('Impossible de modifier la priorité.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-650"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error || 'Ticket introuvable.'}
        </div>
        <Link to="/admin/tickets" className="btn-secondary px-5 py-2.5 rounded-xl font-bold inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/admin/tickets" className="hover:text-brand-600 transition-colors font-medium">
          Tickets / Support
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Traiter le ticket</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Discussion */}
        <div className="md:col-span-2 space-y-4 flex flex-col h-[600px] bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{ticket.sujet}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Par {ticket.utilisateur?.prenom} {ticket.utilisateur?.nom} le {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-slate-50/30">
            {/* Description initiale */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                {ticket.utilisateur?.prenom?.[0] || 'U'}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500">
                  {ticket.utilisateur?.prenom} {ticket.utilisateur?.nom} <span className="font-normal text-slate-400">(Auteur)</span>
                </div>
                <div className="bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-md whitespace-pre-line shadow-sm">
                  {ticket.description || <span className="italic text-slate-400">Pas de description fournie.</span>}
                </div>
              </div>
            </div>

            {/* Discussion */}
            {messages.map((message) => {
              // Si le message est posté par l'auteur d'origine du ticket
              const isUser = message.auteurId === ticket.utilisateurId;
              return (
                <div key={message.id} className={`flex gap-3 ${!isUser ? 'justify-end' : ''}`}>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {message.auteur?.prenom?.[0] || 'U'}
                    </div>
                  )}
                  <div className={`space-y-1 ${!isUser ? 'text-right' : ''}`}>
                    <div className="text-xs font-semibold text-slate-500">
                      {!isUser ? `Support (${message.auteur?.prenom})` : `${message.auteur?.prenom} ${message.auteur?.nom}`}
                    </div>
                    <div
                      className={`text-sm rounded-2xl px-4 py-2.5 max-w-md whitespace-pre-line shadow-sm border ${
                        !isUser
                          ? 'bg-brand-600 text-white border-brand-500 rounded-tr-none text-left'
                          : 'bg-white border-slate-250 text-slate-800 rounded-tl-none'
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

          <div className="p-4 border-t border-slate-100 bg-white shrink-0">
            {ticket.statut === 'FERME' ? (
              <div className="text-center text-sm font-medium text-slate-500 py-2">
                Ce ticket est fermé. Vous ne pouvez plus répondre. Modifiez son statut pour le rouvrir.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre réponse en tant que Support..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !newMessage.trim()}
                  className="bg-brand-600 hover:bg-brand-700 text-white p-2.5 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Panneau latéral d'actions */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Actions & Paramètres</h3>

            {/* Statut */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Statut du ticket</label>
              <select
                value={ticket.statut}
                disabled={updating}
                onChange={(e) => handleUpdateStatus(e.target.value as TicketStatut)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="OUVERT">Ouvert</option>
                <option value="EN_COURS">En cours</option>
                <option value="RESOLU">Résolu</option>
                <option value="FERME">Fermé</option>
              </select>
            </div>

            {/* Priorité */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">Priorité</label>
              <select
                value={ticket.priorite}
                disabled={updating}
                onChange={(e) => handleUpdatePriority(e.target.value as TicketPriorite)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2">
              <div>
                <strong>Auteur :</strong> {ticket.utilisateur?.prenom} {ticket.utilisateur?.nom} ({ticket.utilisateur?.email})
              </div>
              <div>
                <strong>Catégorie :</strong> <span className="uppercase">{ticket.categorie}</span>
              </div>
              <div>
                <strong>Dernière modif :</strong>{' '}
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
      </div>
    </div>
  );
}
