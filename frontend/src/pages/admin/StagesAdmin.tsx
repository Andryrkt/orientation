import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Domaine, Paginated, Stage } from '../../lib/types';

function toDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

function toPayload(values: Record<string, unknown>) {
  const payload = { ...values };
  for (const key of ['domaineId', 'dateDebut', 'dateLimiteCandidature']) {
    if (payload[key] === '') delete payload[key];
  }
  return payload;
}

export function StagesAdmin() {
  const { data: domaines } = useQuery({
    queryKey: ['all-domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const domaineOptions = (domaines?.items ?? []).map((d) => ({ value: d.id, label: d.nom }));

  return (
    <AdminResourcePage<Stage>
      title="Stages"
      apiPath="/stages"
      queryKey="admin-stages"
      emptyItem={{
        titre: '',
        entreprise: '',
        description: '',
        domaineId: '',
        duree: '',
        dateDebut: '',
        dateLimiteCandidature: '',
        region: '',
        niveauEtude: '',
        remuneration: '',
      }}
      toFormValues={(item) => ({
        ...item,
        domaineId: item.domaineId ?? '',
        dateDebut: toDateInput(item.dateDebut),
        dateLimiteCandidature: toDateInput(item.dateLimiteCandidature),
      })}
      toPayload={toPayload}
      columns={[
        { key: 'titre', label: 'Titre' },
        { key: 'entreprise', label: 'Entreprise' },
        { key: 'region', label: 'Région' },
        {
          key: 'dateLimiteCandidature',
          label: 'Date limite',
          render: (item) =>
            item.dateLimiteCandidature ? new Date(item.dateLimiteCandidature).toLocaleDateString('fr-FR') : '—',
        },
      ]}
      fields={[
        { name: 'titre', label: 'Titre', type: 'text', required: true },
        { name: 'entreprise', label: 'Entreprise', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'domaineId', label: 'Domaine', type: 'select', options: domaineOptions },
        { name: 'duree', label: 'Durée', type: 'text' },
        { name: 'dateDebut', label: 'Date de début', type: 'date' },
        { name: 'dateLimiteCandidature', label: 'Date limite de candidature', type: 'date' },
        { name: 'region', label: 'Région', type: 'text' },
        { name: 'niveauEtude', label: "Niveau d'étude", type: 'text' },
        { name: 'remuneration', label: 'Rémunération', type: 'text' },
      ]}
    />
  );
}
