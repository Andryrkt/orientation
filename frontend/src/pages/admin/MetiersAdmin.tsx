import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Domaine, Metier, Paginated } from '../../lib/types';

export function MetiersAdmin() {
  const { data: domaines } = useQuery({
    queryKey: ['all-domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const domaineOptions = (domaines?.items ?? []).map((d) => ({ value: d.id, label: d.nom }));

  return (
    <AdminResourcePage<Metier>
      title="Métiers"
      apiPath="/metiers"
      queryKey="admin-metiers"
      emptyItem={{
        domaineId: '',
        nom: '',
        description: '',
        missions: '',
        competences: '',
        salaireMin: undefined,
        salaireMax: undefined,
        niveauRequis: '',
        perspectivesEmploi: '',
      }}
      toFormValues={(item) => ({ ...item, competences: (item.competences ?? []).join(', ') })}
      toPayload={(values) => ({
        ...values,
        competences: typeof values.competences === 'string'
          ? values.competences.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
      })}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'domaine', label: 'Domaine', render: (item) => item.domaine?.nom ?? '—' },
        {
          key: 'salaire',
          label: 'Salaire (Ar)',
          render: (item) =>
            item.salaireMin || item.salaireMax
              ? `${item.salaireMin ?? '?'} - ${item.salaireMax ?? '?'}`
              : '—',
        },
      ]}
      fields={[
        { name: 'domaineId', label: 'Domaine', type: 'select', required: true, options: domaineOptions },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'missions', label: 'Missions', type: 'textarea' },
        { name: 'competences', label: 'Compétences (séparées par des virgules)', type: 'text' },
        { name: 'salaireMin', label: 'Salaire minimum (Ar)', type: 'number' },
        { name: 'salaireMax', label: 'Salaire maximum (Ar)', type: 'number' },
        { name: 'niveauRequis', label: 'Niveau requis', type: 'text' },
        { name: 'perspectivesEmploi', label: "Perspectives d'emploi", type: 'textarea' },
      ]}
    />
  );
}
