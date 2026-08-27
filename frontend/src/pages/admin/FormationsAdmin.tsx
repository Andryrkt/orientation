import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { CentreFormation, Formation, Paginated } from '../../lib/types';

export function FormationsAdmin() {
  const { data: centres } = useQuery({
    queryKey: ['all-centres-formation'],
    queryFn: async () => (await api.get<Paginated<CentreFormation>>('/centres-formation?limit=100')).data,
  });

  const centreOptions = (centres?.items ?? []).map((c) => ({
    value: c.id,
    label: `${c.nom}${c.ville ? ` — ${c.ville}` : ''}`,
  }));

  return (
    <AdminResourcePage<Formation>
      title="Formations"
      apiPath="/formations"
      queryKey="admin-formations"
      emptyItem={{
        centreId: '',
        nom: '',
        description: '',
        duree: '',
        niveauRequis: '',
      }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'centre', label: 'Centre', render: (item) => item.centre?.nom ?? '—' },
        { key: 'duree', label: 'Durée' },
      ]}
      fields={[
        { name: 'centreId', label: 'Centre de formation', type: 'select', required: true, options: centreOptions },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'duree', label: 'Durée', type: 'text' },
        { name: 'niveauRequis', label: 'Niveau requis', type: 'text' },
      ]}
    />
  );
}
