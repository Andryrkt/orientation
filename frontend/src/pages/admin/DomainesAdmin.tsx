import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Domaine } from '../../lib/types';

export function DomainesAdmin() {
  return (
    <AdminResourcePage<Domaine>
      title="Domaines"
      apiPath="/domaines"
      queryKey="admin-domaines"
      emptyItem={{ nom: '', description: '', icone: '', ordre: 0, riasecCodes: '' }}
      toFormValues={(item) => ({ ...item, riasecCodes: (item.riasecCodes ?? []).join(', ') })}
      toPayload={(values) => ({
        ...values,
        riasecCodes:
          typeof values.riasecCodes === 'string'
            ? values.riasecCodes.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
            : [],
      })}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'slug', label: 'Slug' },
        { key: 'ordre', label: 'Ordre' },
        { key: 'riasecCodes', label: 'RIASEC', render: (item) => (item.riasecCodes ?? []).join(', ') || '—' },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'icone', label: 'Icône', type: 'text' },
        { name: 'ordre', label: 'Ordre', type: 'number' },
        {
          name: 'riasecCodes',
          label: 'Codes RIASEC (ex: R, I) — pour les recommandations du questionnaire',
          type: 'text',
        },
      ]}
    />
  );
}
