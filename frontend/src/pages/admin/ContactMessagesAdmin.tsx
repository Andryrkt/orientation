import { AdminResourcePage } from '../../components/admin/AdminResourcePage';

type ContactStatut = 'NOUVEAU' | 'LU' | 'TRAITE';

type ContactMessage = {
  id: string;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  statut: ContactStatut;
  createdAt: string;
  updatedAt: string;
};

const STATUT_LABELS: Record<ContactStatut, string> = {
  NOUVEAU: '🆕 Nouveau',
  LU: '👁 Lu',
  TRAITE: '✅ Traité',
};

const STATUT_CLASSES: Record<ContactStatut, string> = {
  NOUVEAU: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  LU: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  TRAITE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

export function ContactMessagesAdmin() {
  return (
    <AdminResourcePage<ContactMessage>
      title="Messages de contact"
      apiPath="/admin/contact"
      queryKey="admin-contact-messages"
      emptyItem={{
        nom: '',
        email: '',
        sujet: '',
        message: '',
        statut: 'NOUVEAU',
      }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'email', label: 'E-mail' },
        { key: 'sujet', label: 'Sujet' },
        {
          key: 'statut',
          label: 'Statut',
          render: (item) => (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUT_CLASSES[item.statut]}`}>
              {STATUT_LABELS[item.statut]}
            </span>
          ),
        },
        {
          key: 'createdAt',
          label: 'Reçu le',
          render: (item) => (
            <span className="text-slate-400 text-xs">
              {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'email', label: 'E-mail', type: 'text', required: true },
        { name: 'sujet', label: 'Sujet', type: 'text', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          options: [
            { value: 'NOUVEAU', label: '🆕 Nouveau' },
            { value: 'LU', label: '👁 Lu' },
            { value: 'TRAITE', label: '✅ Traité' },
          ],
        },
      ]}
    />
  );
}
