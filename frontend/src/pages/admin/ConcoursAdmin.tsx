import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Concours, Domaine, Paginated } from '../../lib/types';

const TYPE_OPTIONS = [
  { value: 'UNIVERSITAIRE', label: 'Concours universitaire' },
  { value: 'ADMINISTRATIF', label: 'Concours administratif' },
];

function toDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

function toPayload(values: Record<string, unknown>) {
  const payload = { ...values };
  for (const key of ['domaineId', 'dateConcours', 'dateLimiteInscription']) {
    if (payload[key] === '') delete payload[key];
  }
  if (payload.nombrePlaces === '' || payload.nombrePlaces === undefined || Number.isNaN(payload.nombrePlaces)) {
    delete payload.nombrePlaces;
  }
  return payload;
}

export function ConcoursAdmin() {
  const { data: domaines } = useQuery({
    queryKey: ['all-domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const domaineOptions = (domaines?.items ?? []).map((d) => ({ value: d.id, label: d.nom }));

  return (
    <AdminResourcePage<Concours>
      title="Concours"
      apiPath="/concours"
      queryKey="admin-concours"
      emptyItem={{
        titre: '',
        type: '',
        organisateur: '',
        description: '',
        domaineId: '',
        niveauRequis: '',
        nombrePlaces: '',
        region: '',
        fraisInscription: '',
        dateConcours: '',
        dateLimiteInscription: '',
        conditions: '',
        lien: '',
      }}
      toFormValues={(item) => ({
        ...item,
        domaineId: item.domaineId ?? '',
        nombrePlaces: item.nombrePlaces ?? '',
        dateConcours: toDateInput(item.dateConcours),
        dateLimiteInscription: toDateInput(item.dateLimiteInscription),
      })}
      toPayload={toPayload}
      columns={[
        { key: 'titre', label: 'Titre' },
        {
          key: 'type',
          label: 'Type',
          render: (item) => (item.type === 'UNIVERSITAIRE' ? 'Universitaire' : 'Administratif'),
        },
        { key: 'organisateur', label: 'Organisateur' },
        {
          key: 'dateLimiteInscription',
          label: 'Date limite',
          render: (item) =>
            item.dateLimiteInscription ? new Date(item.dateLimiteInscription).toLocaleDateString('fr-FR') : '—',
        },
      ]}
      fields={[
        { name: 'titre', label: 'Titre', type: 'text', required: true },
        { name: 'type', label: 'Type de concours', type: 'select', options: TYPE_OPTIONS, required: true },
        { name: 'organisateur', label: 'Organisateur', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'domaineId', label: 'Domaine', type: 'select', options: domaineOptions },
        { name: 'niveauRequis', label: 'Niveau requis', type: 'text' },
        { name: 'nombrePlaces', label: 'Nombre de places', type: 'number' },
        { name: 'region', label: 'Région', type: 'text' },
        { name: 'fraisInscription', label: "Frais d'inscription", type: 'text' },
        { name: 'dateConcours', label: 'Date du concours', type: 'date' },
        { name: 'dateLimiteInscription', label: "Date limite d'inscription", type: 'date' },
        { name: 'conditions', label: 'Conditions de participation', type: 'textarea' },
        { name: 'lien', label: "Lien pour plus d'informations", type: 'text' },
      ]}
    />
  );
}
