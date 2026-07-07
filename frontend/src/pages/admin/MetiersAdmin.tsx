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
        riasecCodes: '',
        autresAppellations: '',
        sousDomaine: '',
        secteursActivite: '',
        codeRome: '',
        environnementTravail: '',
        competencesComportementales: '',
        languesRequises: '',
        niveauLangues: '',
        specialiteDiplome: '',
        formationsMadagascar: '',
        certifications: '',
        autoFormation: '',
        salaireSource: '',
        typeContrat: '',
        niveauDemande: '',
        regionsPresence: '',
        employeurs: '',
        traitsPersonnalite: '',
        valeursProfessionnelles: '',
        temoignagePrenom: '',
        temoignageAnneesExperience: undefined,
        temoignageCitation: '',
        temoignageCePlait: '',
        temoignageConseil: '',
      }}
      toFormValues={(item) => ({
        ...item,
        missions: (item.missions ?? []).join('\n'),
        competences: (item.competences ?? []).join(', '),
        riasecCodes: (item.riasecCodes ?? []).join(', '),
        autresAppellations: (item.autresAppellations ?? []).join(', '),
        secteursActivite: (item.secteursActivite ?? []).join(', '),
        environnementTravail: (item.environnementTravail ?? []).join(', '),
        competencesComportementales: (item.competencesComportementales ?? []).join(', '),
        languesRequises: (item.languesRequises ?? []).join(', '),
        formationsMadagascar: (item.formationsMadagascar ?? []).join('\n'),
        certifications: (item.certifications ?? []).join(', '),
        typeContrat: (item.typeContrat ?? []).join(', '),
        regionsPresence: (item.regionsPresence ?? []).join(', '),
        employeurs: (item.employeurs ?? []).join(', '),
        traitsPersonnalite: (item.traitsPersonnalite ?? []).join(', '),
        valeursProfessionnelles: (item.valeursProfessionnelles ?? []).join(', '),
      })}
      toPayload={(values) => {
        const list = (v: unknown) =>
          typeof v === 'string' ? v.split(',').map((c) => c.trim()).filter(Boolean) : [];
        const lines = (v: unknown) =>
          typeof v === 'string' ? v.split('\n').map((c) => c.trim()).filter(Boolean) : [];
        return {
          ...values,
          missions: lines(values.missions),
          competences: list(values.competences),
          riasecCodes: typeof values.riasecCodes === 'string'
            ? values.riasecCodes.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
            : [],
          autresAppellations: list(values.autresAppellations),
          secteursActivite: list(values.secteursActivite),
          environnementTravail: list(values.environnementTravail),
          competencesComportementales: list(values.competencesComportementales),
          languesRequises: list(values.languesRequises),
          formationsMadagascar: lines(values.formationsMadagascar),
          certifications: list(values.certifications),
          typeContrat: list(values.typeContrat),
          regionsPresence: list(values.regionsPresence),
          employeurs: list(values.employeurs),
          traitsPersonnalite: list(values.traitsPersonnalite),
          valeursProfessionnelles: list(values.valeursProfessionnelles),
        };
      }}
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
        { name: 'autresAppellations', label: 'Autres appellations (séparées par des virgules)', type: 'text' },
        { name: 'sousDomaine', label: 'Sous-domaine / spécialité', type: 'text' },
        { name: 'secteursActivite', label: "Secteurs d'activité (séparés par des virgules)", type: 'text' },
        { name: 'codeRome', label: 'Code ROME', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'missions', label: 'Missions (une par ligne)', type: 'textarea' },
        { name: 'environnementTravail', label: 'Environnement de travail (séparés par des virgules)', type: 'text' },
        { name: 'competences', label: 'Compétences techniques (séparées par des virgules)', type: 'text' },
        { name: 'competencesComportementales', label: 'Compétences comportementales (séparées par des virgules)', type: 'text' },
        { name: 'languesRequises', label: 'Langues requises (séparées par des virgules)', type: 'text' },
        { name: 'niveauLangues', label: 'Niveau requis en langues', type: 'text' },
        { name: 'niveauRequis', label: 'Niveau de diplôme requis', type: 'text' },
        { name: 'specialiteDiplome', label: 'Spécialité de diplôme recommandée', type: 'text' },
        { name: 'formationsMadagascar', label: 'Formations à Madagascar (une par ligne)', type: 'textarea' },
        { name: 'certifications', label: 'Certifications valorisées (séparées par des virgules)', type: 'text' },
        { name: 'autoFormation', label: 'Accès par auto-formation', type: 'text' },
        { name: 'salaireMin', label: 'Salaire minimum (Ar)', type: 'number' },
        { name: 'salaireMax', label: 'Salaire maximum (Ar)', type: 'number' },
        { name: 'salaireSource', label: 'Source des données salariales', type: 'text' },
        { name: 'typeContrat', label: 'Type de contrat habituel (séparés par des virgules)', type: 'text' },
        { name: 'avantages', label: 'Avantages en nature courants', type: 'text' },
        { name: 'niveauDemande', label: "Niveau de demande d'emploi à Madagascar", type: 'text' },
        { name: 'regionsPresence', label: 'Régions où le métier est présent (séparées par des virgules)', type: 'text' },
        { name: 'employeurs', label: 'Principaux employeurs (séparés par des virgules)', type: 'text' },
        { name: 'perspectivesEmploi', label: "Perspectives d'emploi", type: 'textarea' },
        { name: 'traitsPersonnalite', label: 'Traits de personnalité (séparés par des virgules)', type: 'text' },
        { name: 'valeursProfessionnelles', label: 'Valeurs professionnelles (séparées par des virgules)', type: 'text' },
        {
          name: 'riasecCodes',
          label: 'Codes RIASEC (ex: R, I) — pour les recommandations du questionnaire',
          type: 'text',
        },
        { name: 'temoignagePrenom', label: 'Témoignage — prénom', type: 'text' },
        { name: 'temoignageAnneesExperience', label: "Témoignage — années d'expérience", type: 'number' },
        { name: 'temoignageCePlait', label: 'Témoignage — ce qui lui plaît', type: 'textarea' },
        { name: 'temoignageConseil', label: 'Témoignage — son conseil', type: 'textarea' },
        { name: 'temoignageCitation', label: 'Témoignage — citation', type: 'textarea' },
      ]}
    />
  );
}
