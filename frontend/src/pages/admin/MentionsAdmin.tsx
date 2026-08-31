import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Domaine, Mention, Paginated, Universite } from '../../lib/types';

const NIVEAU_OPTIONS = [
  { value: 'BTS', label: 'BTS' },
  { value: 'LICENCE', label: 'Licence' },
  { value: 'MASTER', label: 'Master' },
  { value: 'DOCTORAT', label: 'Doctorat' },
];

const CONDITION_ADMISSION_OPTIONS = [
  { value: 'SELECTION_DOSSIER', label: 'Sélection de dossier' },
  { value: 'EXAMEN_ENTREE', label: "Examen d'entrée" },
  { value: 'TEST_ACCES', label: "Test d'accès" },
  { value: 'CONCOURS', label: 'Concours' },
];

export function MentionsAdmin() {
  const { data: universites } = useQuery({
    queryKey: ['all-universites'],
    queryFn: async () => (await api.get<Paginated<Universite>>('/universites?limit=100')).data,
  });
  const { data: domaines } = useQuery({
    queryKey: ['all-domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const universiteOptions = (universites?.items ?? []).map((u) => ({ value: u.id, label: u.nom }));
  const domaineOptions = (domaines?.items ?? []).map((d) => ({ value: d.id, label: d.nom }));

  return (
    <AdminResourcePage<Mention>
      title="Mentions"
      apiPath="/mentions"
      queryKey="admin-mentions"
      emptyItem={{
        universiteId: '',
        domaineId: '',
        nom: '',
        description: '',
        niveau: 'LICENCE',
        conditionAdmission: '',
        droitInscription: undefined,
        fraisAnnuel: undefined,
        fraisAnnexe: undefined,
      }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'universite', label: 'Université', render: (item) => item.universite?.nom ?? '—' },
        { key: 'domaine', label: 'Domaine', render: (item) => item.domaine?.nom ?? '—' },
        { key: 'niveau', label: 'Niveau' },
      ]}
      fields={[
        { name: 'universiteId', label: 'Université', type: 'select', required: true, options: universiteOptions },
        { name: 'domaineId', label: 'Domaine', type: 'select', required: true, options: domaineOptions },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'niveau', label: 'Niveau', type: 'select', options: NIVEAU_OPTIONS },
        { name: 'conditionAdmission', label: "Condition d'admission", type: 'select', options: CONDITION_ADMISSION_OPTIONS },
        { name: 'droitInscription', label: "Droit d'inscription", type: 'number' },
        { name: 'fraisAnnuel', label: 'Frais annuel', type: 'number' },
        { name: 'fraisAnnexe', label: 'Frais annexe', type: 'number' },
      ]}
    />
  );
}
