import { AdminResourcePage } from '../../components/admin/AdminResourcePage';

type FaqItem = {
  id: string;
  question: string;
  reponse: string;
  categorie: string;
  icone: string;
  ordre: number;
  publie: boolean;
  createdAt: string;
  updatedAt: string;
};

export function FaqAdmin() {
  return (
    <AdminResourcePage<FaqItem>
      title="FAQ — Questions fréquentes"
      apiPath="/admin/faq"
      queryKey="admin-faq"
      emptyItem={{
        question: '',
        reponse: '',
        categorie: '',
        icone: '❓',
        ordre: 0,
        publie: true,
      }}
      toFormValues={(item) => ({
        ...item,
        ordre: item.ordre ?? 0,
      })}
      toPayload={(values) => ({
        ...values,
        ordre: Number(values.ordre) || 0,
        publie: values.publie === true || values.publie === 'true',
      })}
      columns={[
        {
          key: 'icone',
          label: '',
          render: (item) => <span className="text-xl">{item.icone}</span>,
        },
        { key: 'question', label: 'Question' },
        { key: 'categorie', label: 'Catégorie' },
        {
          key: 'ordre',
          label: 'Ordre',
          render: (item) => <span className="text-slate-400 text-xs">{item.ordre}</span>,
        },
        {
          key: 'publie',
          label: 'Publié',
          render: (item) => (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                item.publie
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-white/5 text-slate-400'
              }`}
            >
              {item.publie ? '✅ Publié' : '⏸ Brouillon'}
            </span>
          ),
        },
      ]}
      fields={[
        {
          name: 'question',
          label: 'Question',
          type: 'text',
          required: true,
        },
        {
          name: 'reponse',
          label: 'Réponse',
          type: 'textarea',
          required: true,
        },
        {
          name: 'categorie',
          label: 'Catégorie',
          type: 'text',
          required: true,
          // Suggestion des catégories existantes
        },
        {
          name: 'icone',
          label: 'Icône (emoji)',
          type: 'text',
        },
        {
          name: 'ordre',
          label: 'Ordre d\'affichage (dans la catégorie)',
          type: 'number',
        },
        {
          name: 'publie',
          label: 'Statut de publication',
          type: 'select',
          options: [
            { value: 'true', label: '✅ Publié' },
            { value: 'false', label: '⏸ Brouillon (non visible)' },
          ],
        },
      ]}
    />
  );
}
