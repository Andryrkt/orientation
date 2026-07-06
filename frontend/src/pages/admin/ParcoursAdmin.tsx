import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Mention, Paginated, Parcours } from '../../lib/types';

export function ParcoursAdmin() {
  const { data: mentions } = useQuery({
    queryKey: ['all-mentions'],
    queryFn: async () => (await api.get<Paginated<Mention>>('/mentions?limit=100')).data,
  });

  const mentionOptions = (mentions?.items ?? []).map((m) => ({
    value: m.id,
    label: `${m.nom} — ${m.universite?.nom ?? ''}`,
  }));

  return (
    <AdminResourcePage<Parcours>
      title="Parcours"
      apiPath="/parcours"
      queryKey="admin-parcours"
      emptyItem={{
        mentionId: '',
        nom: '',
        description: '',
        duree: '',
        conditionsAcces: '',
        debouches: '',
        fraisAnnuels: undefined,
      }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'mention', label: 'Mention', render: (item) => item.mention?.nom ?? '—' },
        { key: 'duree', label: 'Durée' },
      ]}
      fields={[
        { name: 'mentionId', label: 'Mention', type: 'select', required: true, options: mentionOptions },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'duree', label: 'Durée', type: 'text' },
        { name: 'conditionsAcces', label: "Conditions d'accès", type: 'textarea' },
        { name: 'debouches', label: 'Débouchés', type: 'textarea' },
        { name: 'fraisAnnuels', label: 'Frais annuels (Ar)', type: 'number' },
      ]}
    />
  );
}
