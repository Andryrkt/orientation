import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Domaine, Metier, Paginated } from '../../lib/types';

// Champs tableau édités comme une liste séparée par des virgules dans le formulaire.
const COMMA_LIST_FIELDS = [
  'competences',
  'riasecCodes',
  'autresAppellations',
  'secteursActivite',
  'environnementTravail',
  'competencesComportementales',
  'languesRequises',
  'certifications',
  'typeContrat',
  'regionsPresence',
  'employeurs',
  'traitsPersonnalite',
  'valeursProfessionnelles',
  'volumeHoraire',
  'tendances',
  'centresInteret',
] as const;

// Champs tableau édités comme une liste avec un élément par ligne dans le formulaire.
const LINE_LIST_FIELDS = ['missions', 'formationsMadagascar', 'sources'] as const;

function toFormValues(item: Record<string, unknown>): Record<string, unknown> {
  const values: Record<string, unknown> = { ...item };
  for (const key of COMMA_LIST_FIELDS) {
    values[key] = (((item[key] as string[]) ?? []) as string[]).join(', ');
  }
  for (const key of LINE_LIST_FIELDS) {
    values[key] = (((item[key] as string[]) ?? []) as string[]).join('\n');
  }
  return values;
}

function toPayload(values: Record<string, unknown>): Record<string, unknown> {
  const list = (v: unknown) =>
    typeof v === 'string' ? v.split(',').map((c) => c.trim()).filter(Boolean) : [];
  const lines = (v: unknown) =>
    typeof v === 'string' ? v.split('\n').map((c) => c.trim()).filter(Boolean) : [];
  const payload: Record<string, unknown> = { ...values };
  for (const key of COMMA_LIST_FIELDS) {
    payload[key] = key === 'riasecCodes'
      ? list(values[key]).map((c) => c.toUpperCase())
      : list(values[key]);
  }
  for (const key of LINE_LIST_FIELDS) {
    payload[key] = lines(values[key]);
  }
  return payload;
}

interface ParsePdfResponse {
  fields: Record<string, unknown>;
  matchedDomaineId?: string;
  warnings: string[];
}

export function MetiersAdmin() {
  const { data: domaines } = useQuery({
    queryKey: ['all-domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const domaineOptions = (domaines?.items ?? []).map((d) => ({ value: d.id, label: d.nom }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handlePdfSelected(
    e: React.ChangeEvent<HTMLInputElement>,
    openCreateWith: (values: Record<string, unknown>) => void,
  ) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<ParsePdfResponse>('/metiers/parse-pdf', formData);
      openCreateWith(toFormValues({ ...data.fields, domaineId: data.matchedDomaineId ?? '' }));
      if (data.warnings.length > 0) {
        alert(
          `PDF importé — merci de relire attentivement avant d'enregistrer :\n\n${data.warnings.join('\n')}`,
        );
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      alert(
        `Échec de l'import du PDF : ${Array.isArray(message) ? message.join(', ') : message ?? 'erreur inconnue'}`,
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <AdminResourcePage<Metier>
      title="Métiers"
      apiPath="/metiers"
      queryKey="admin-metiers"
      extraHeaderActions={(openCreateWith) => (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handlePdfSelected(e, openCreateWith)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {importing ? 'Analyse du PDF...' : '📄 Importer un PDF'}
          </button>
        </>
      )}
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
        environnementAutre: '',
        volumeHoraire: '',
        penibilitePhysique: undefined,
        penibiliteStress: undefined,
        penibiliteRisques: undefined,
        postesEvolution: '',
        mobiliteInternationale: '',
        tendances: '',
        centresInteret: '',
        profilIntroExtraverti: '',
        temoignageVille: '',
        temoignageSecteurEmployeur: '',
        temoignageDifficultes: '',
        temoignageAccordPublication: '',
        sources: '',
        fiabilite: '',
        observations: '',
      }}
      toFormValues={(item) => toFormValues(item as unknown as Record<string, unknown>)}
      toPayload={toPayload}
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
        { name: 'environnementAutre', label: 'Environnement de travail — autre précision', type: 'text' },
        { name: 'competences', label: 'Compétences techniques (séparées par des virgules)', type: 'text' },
        {
          name: 'competencesComportementales',
          label: 'Compétences comportementales / soft skills — aptitudes à développer pour bien exercer le métier (séparées par des virgules)',
          type: 'text',
        },
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
        { name: 'volumeHoraire', label: 'Volume horaire typique (séparés par des virgules)', type: 'text' },
        { name: 'penibilitePhysique', label: 'Pénibilité — physique / effort corporel (1 à 5)', type: 'number' },
        { name: 'penibiliteStress', label: 'Pénibilité — stress et pression (1 à 5)', type: 'number' },
        { name: 'penibiliteRisques', label: 'Pénibilité — risques professionnels (1 à 5)', type: 'number' },
        { name: 'avantages', label: 'Avantages en nature courants', type: 'text' },
        { name: 'niveauDemande', label: "Niveau de demande d'emploi à Madagascar", type: 'text' },
        { name: 'regionsPresence', label: 'Régions où le métier est présent (séparées par des virgules)', type: 'text' },
        { name: 'employeurs', label: 'Principaux employeurs (séparés par des virgules)', type: 'text' },
        { name: 'perspectivesEmploi', label: "Perspectives d'emploi", type: 'textarea' },
        { name: 'postesEvolution', label: 'Évolution professionnelle et hiérarchique', type: 'textarea' },
        { name: 'mobiliteInternationale', label: 'Mobilité internationale / opportunités institutionnelles', type: 'textarea' },
        { name: 'tendances', label: 'Tendances du secteur (séparées par des virgules)', type: 'text' },
        {
          name: 'traitsPersonnalite',
          label: 'Traits de personnalité type — profil qui réussit naturellement dans ce métier, pour matcher un élève (séparés par des virgules)',
          type: 'text',
        },
        { name: 'centresInteret', label: "Centres d'intérêt typiques (séparés par des virgules)", type: 'text' },
        { name: 'valeursProfessionnelles', label: 'Valeurs professionnelles (séparées par des virgules)', type: 'text' },
        { name: 'profilIntroExtraverti', label: 'Adéquation introverti / extraverti', type: 'textarea' },
        {
          name: 'riasecCodes',
          label: 'Codes RIASEC (ex: R, I) — pour les recommandations du questionnaire',
          type: 'text',
        },
        { name: 'temoignagePrenom', label: 'Témoignage — prénom', type: 'text' },
        { name: 'temoignageAnneesExperience', label: "Témoignage — années d'expérience", type: 'number' },
        { name: 'temoignageVille', label: 'Témoignage — ville', type: 'text' },
        { name: 'temoignageSecteurEmployeur', label: 'Témoignage — secteur / employeur', type: 'text' },
        { name: 'temoignageCePlait', label: 'Témoignage — ce qui lui plaît', type: 'textarea' },
        { name: 'temoignageDifficultes', label: 'Témoignage — difficultés rencontrées', type: 'textarea' },
        { name: 'temoignageConseil', label: 'Témoignage — son conseil', type: 'textarea' },
        { name: 'temoignageCitation', label: 'Témoignage — citation', type: 'textarea' },
        {
          name: 'temoignageAccordPublication',
          label: 'Témoignage — accord de publication (OUI_PHOTO, OUI_PRENOM, OUI_ANONYME, NON)',
          type: 'text',
        },
        { name: 'sources', label: 'Sources consultées (une par ligne, ex : Type — Référence — Date)', type: 'textarea' },
        {
          name: 'fiabilite',
          label: 'Évaluation de la fiabilité (TRES_FIABLE, FIABLE, A_VERIFIER, PARTIELLE)',
          type: 'text',
        },
        { name: 'observations', label: 'Observations complémentaires', type: 'textarea' },
      ]}
    />
  );
}
