import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Bourse, Domaine, Paginated } from '../../lib/types';

function toDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

function toPayload(values: Record<string, unknown>) {
  const payload = { ...values };
  for (const key of ['domaineId', 'dateLimite']) {
    if (payload[key] === '') delete payload[key];
  }
  return payload;
}

export function BoursesAdmin() {
  const { data: domaines } = useQuery({
    queryKey: ['all-domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const domaineOptions = (domaines?.items ?? []).map((d) => ({ value: d.id, label: d.nom }));

  return (
    <AdminResourcePage<Bourse>
      title="Bourses"
      apiPath="/bourses"
      queryKey="admin-bourses"
      emptyItem={{
        nom: '',
        organisme: '',
        pays: '',
        domaineId: '',
        niveauEtude: '',
        montant: '',
        dateLimite: '',
        conditions: '',
        lien: '',
      }}
      toFormValues={(item) => ({
        ...item,
        domaineId: item.domaineId ?? '',
        dateLimite: toDateInput(item.dateLimite),
      })}
      toPayload={toPayload}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'organisme', label: 'Organisme' },
        { key: 'pays', label: 'Pays' },
        {
          key: 'dateLimite',
          label: 'Date limite',
          render: (item) => (item.dateLimite ? new Date(item.dateLimite).toLocaleDateString('fr-FR') : '—'),
        },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'organisme', label: 'Organisme', type: 'text', required: true },
        { name: 'pays', label: 'Pays', type: 'text' },
        { name: 'domaineId', label: 'Domaine', type: 'select', options: domaineOptions },
        { name: 'niveauEtude', label: "Niveau d'étude", type: 'text' },
        { name: 'montant', label: 'Montant', type: 'text' },
        { name: 'dateLimite', label: 'Date limite', type: 'date' },
        { name: 'conditions', label: 'Conditions', type: 'textarea' },
        { name: 'lien', label: 'Lien', type: 'text' },
      ]}
    />
  );
}
