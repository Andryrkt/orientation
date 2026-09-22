import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Domaine, Emploi, Paginated, Secteur } from '../../lib/types';

function toDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

function toPayload(values: Record<string, unknown>) {
  const payload = { ...values };
  for (const key of ['domaineId', 'secteurId', 'dateLimiteCandidature']) {
    if (payload[key] === '') delete payload[key];
  }
  return payload;
}

export function EmploisAdmin() {
  const { data: domaines } = useQuery({
    queryKey: ['all-domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });
  const { data: secteurs } = useQuery({
    queryKey: ['all-secteurs'],
    queryFn: async () => (await api.get<Paginated<Secteur>>('/secteurs?limit=100')).data,
  });

  const domaineOptions = (domaines?.items ?? []).map((d) => ({ value: d.id, label: d.nom }));
  const secteurOptions = (secteurs?.items ?? []).map((s) => ({ value: s.id, label: s.nom }));

  return (
    <AdminResourcePage<Emploi>
      title="Offres d'emploi"
      apiPath="/emplois"
      queryKey="admin-emplois"
      emptyItem={{
        titre: '',
        entreprise: '',
        description: '',
        domaineId: '',
        secteurId: '',
        typeContrat: '',
        region: '',
        niveauEtude: '',
        salaire: '',
        dateLimiteCandidature: '',
        lien: '',
      }}
      toFormValues={(item) => ({
        ...item,
        domaineId: item.domaineId ?? '',
        secteurId: item.secteurId ?? '',
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
        { name: 'titre', label: 'Titre du poste', type: 'text', required: true },
        { name: 'entreprise', label: 'Entreprise', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'secteurId', label: 'Secteur', type: 'select', options: secteurOptions },
        { name: 'domaineId', label: 'Domaine', type: 'select', options: domaineOptions },
        { name: 'typeContrat', label: 'Type de contrat', type: 'text' },
        { name: 'region', label: 'Région', type: 'text' },
        { name: 'niveauEtude', label: "Niveau d'étude", type: 'text' },
        { name: 'salaire', label: 'Salaire', type: 'text' },
        { name: 'dateLimiteCandidature', label: 'Date limite de candidature', type: 'date' },
        { name: 'lien', label: 'Lien pour postuler', type: 'text' },
      ]}
    />
  );
}
