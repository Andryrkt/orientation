import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Ticket, TicketPriorite, TicketStatut } from '../../lib/types';

const STATUT_LABELS: Record<TicketStatut, string> = {
  OUVERT: 'Ouvert',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  FERME: 'Fermé',
};

const STATUT_CLASSES: Record<TicketStatut, string> = {
  OUVERT: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  EN_COURS: 'bg-blue-50 text-blue-700 border border-blue-200',
  RESOLU: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  FERME: 'bg-slate-50 text-slate-700 border border-slate-200',
};

const PRIORITE_LABELS: Record<TicketPriorite, string> = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
};

const PRIORITE_CLASSES: Record<TicketPriorite, string> = {
  BASSE: 'bg-slate-100 text-slate-800',
  MOYENNE: 'bg-amber-100 text-amber-800',
  HAUTE: 'bg-rose-100 text-rose-800',
};

export function TicketsAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [statutFilter, setStatutFilter] = useState('');
  const [prioriteFilter, setPrioriteFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statutFilter, prioriteFilter, search]);

  async function fetchTickets() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statutFilter) params.append('statut', statutFilter);
      if (prioriteFilter) params.append('priorite', prioriteFilter);
      if (search) params.append('q', search);

      const res = await api.get<{ items: Ticket[] }>(`/tickets?${params.toString()}`);
      setTickets(res.data.items);
      setError(null);
    } catch {
      setError('Impossible de charger les tickets.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Gestion des Tickets / Support</h1>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Rechercher par sujet ou description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Tous les statuts</option>
              <option value="OUVERT">Ouverts</option>
              <option value="EN_COURS">En cours</option>
              <option value="RESOLU">Résolus</option>
              <option value="FERME">Fermés</option>
            </select>
          </div>

          <div>
            <select
              value={prioriteFilter}
              onChange={(e) => setPrioriteFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Toutes les priorités</option>
              <option value="BASSE">Priorité Basse</option>
              <option value="MOYENNE">Priorité Moyenne</option>
              <option value="HAUTE">Priorité Haute</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Auteur</th>
              <th className="px-6 py-3 font-medium">Catégorie</th>
              <th className="px-6 py-3 font-medium">Sujet</th>
              <th className="px-6 py-3 font-medium">Statut</th>
              <th className="px-6 py-3 font-medium">Priorité</th>
              <th className="px-6 py-3 font-medium">Dernière mise à jour</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  Chargement des tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">
                  Aucun ticket trouvé.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                    {t.utilisateur?.prenom} {t.utilisateur?.nom}
                  </td>
                  <td className="px-6 py-4 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                    {t.categorie}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-slate-700 font-medium">
                    {t.sujet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUT_CLASSES[t.statut]}`}>
                      {STATUT_LABELS[t.statut]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${PRIORITE_CLASSES[t.priorite]}`}>
                      {PRIORITE_LABELS[t.priorite]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(t.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/tickets/${t.id}`}
                      className="text-brand-600 hover:text-brand-800 font-semibold hover:underline"
                    >
                      Traiter →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
