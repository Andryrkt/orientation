import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Domaine, Metier, Paginated } from '../../lib/types';

// Champs tableau édités comme une liste séparée par des virgules dans le formulaire.
const COMMA_LIST_FIELDS = [
  'competences',
  'riasecCodes',
  'seriesBacMadagascar',
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
const LINE_LIST_FIELDS = ['missions', 'formationsMadagascar', 'sources', 'etapesEvolution'] as const;

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
        imageBanniere: '',
        missions: '',
        competences: '',
        salaireMin: undefined,
        salaireMax: undefined,
        niveauRequis: '',
        perspectivesEmploi: '',
        riasecCodes: '',
        seriesBacMadagascar: '',
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
        etapesEvolution: '',
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
        { key: 'domaine', label: 'Domaine professionnel', render: (item) => item.domaine?.nom ?? '—' },
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
        // ── Identification ──
        { name: 'domaineId', label: 'Domaine professionnel', type: 'select', required: true, options: domaineOptions, section: 'Identification' },
        { name: 'nom', label: 'Nom', type: 'text', required: true, section: 'Identification' },
        { name: 'autresAppellations', label: 'Autres appellations (séparées par des virgules)', type: 'text', section: 'Identification' },
        { name: 'sousDomaine', label: 'Sous-domaine / spécialité', type: 'text', section: 'Identification' },
        { name: 'secteursActivite', label: "Secteurs d'activité (séparés par des virgules)", type: 'text', section: 'Identification' },
        { name: 'codeRome', label: 'Code ROME', type: 'text', section: 'Identification' },

        // ── Présentation ──
        { name: 'description', label: 'Description', type: 'textarea', section: 'Présentation' },
        {
          name: 'imageBanniere',
          label: "Image de bannière — si vide, l'image par défaut du domaine est utilisée",
          type: 'image',
          section: 'Présentation',
        },

        // ── Le métier ──
        { name: 'missions', label: 'Missions (une par ligne)', type: 'textarea', section: 'Le métier' },
        { name: 'competences', label: 'Compétences techniques (séparées par des virgules)', type: 'text', section: 'Le métier' },
        {
          name: 'competencesComportementales',
          label: 'Compétences comportementales / soft skills — aptitudes à développer pour bien exercer le métier (séparées par des virgules)',
          type: 'text',
          section: 'Le métier',
        },
        { name: 'languesRequises', label: 'Langues requises (séparées par des virgules)', type: 'text', section: 'Le métier' },
        { name: 'niveauLangues', label: 'Niveau requis en langues', type: 'text', section: 'Le métier' },
        {
          name: 'traitsPersonnalite',
          label: 'Traits de personnalité type — profil qui réussit naturellement dans ce métier, pour matcher un élève (séparés par des virgules)',
          type: 'text',
          section: 'Le métier',
        },
        { name: 'valeursProfessionnelles', label: 'Valeurs professionnelles (séparées par des virgules)', type: 'text', section: 'Le métier' },
        { name: 'centresInteret', label: "Centres d'intérêt typiques (séparés par des virgules)", type: 'text', section: 'Le métier' },
        { name: 'profilIntroExtraverti', label: 'Adéquation introverti / extraverti', type: 'textarea', section: 'Le métier' },
        {
          name: 'riasecCodes',
          label: 'Codes RIASEC (ex: R, I) — pour les recommandations du questionnaire',
          type: 'text',
          section: 'Le métier',
        },

        // ── Où l'exercer ? ──
        { name: 'environnementTravail', label: 'Environnement de travail (séparés par des virgules)', type: 'text', section: "Où l'exercer ?" },
        { name: 'environnementAutre', label: 'Environnement de travail — autre précision', type: 'text', section: "Où l'exercer ?" },
        { name: 'typeContrat', label: 'Type de contrat habituel (séparés par des virgules)', type: 'text', section: "Où l'exercer ?" },
        { name: 'volumeHoraire', label: 'Volume horaire typique (séparés par des virgules)', type: 'text', section: "Où l'exercer ?" },
        { name: 'avantages', label: 'Avantages en nature courants', type: 'text', section: "Où l'exercer ?" },

        // ── Accès au métier ──
        { name: 'niveauRequis', label: 'Niveau de diplôme requis', type: 'text', section: 'Accès au métier' },
        { name: 'specialiteDiplome', label: 'Spécialité de diplôme recommandée', type: 'text', section: 'Accès au métier' },
        {
          name: 'seriesBacMadagascar',
          label: 'Séries du Bac malgache donnant accès à ce métier (ex: C, D, S, A, Technique)',
          type: 'text',
          section: 'Accès au métier',
        },
        { name: 'formationsMadagascar', label: 'Formations à Madagascar (une par ligne)', type: 'textarea', section: 'Accès au métier' },
        { name: 'certifications', label: 'Certifications valorisées (séparées par des virgules)', type: 'text', section: 'Accès au métier' },
        { name: 'autoFormation', label: 'Accès par auto-formation', type: 'text', section: 'Accès au métier' },

        // ── Carrières ──
        { name: 'salaireMin', label: 'Salaire minimum (Ar)', type: 'number', section: 'Carrières' },
        { name: 'salaireMax', label: 'Salaire maximum (Ar)', type: 'number', section: 'Carrières' },
        { name: 'salaireSource', label: 'Source des données salariales', type: 'text', section: 'Carrières' },
        { name: 'niveauDemande', label: "Niveau de demande d'emploi à Madagascar", type: 'text', section: 'Carrières' },
        { name: 'regionsPresence', label: 'Régions où le métier est présent (séparées par des virgules)', type: 'text', section: 'Carrières' },
        { name: 'employeurs', label: 'Principaux employeurs (séparés par des virgules)', type: 'text', section: 'Carrières' },
        { name: 'perspectivesEmploi', label: "Perspectives d'emploi", type: 'textarea', section: 'Carrières' },
        { name: 'postesEvolution', label: 'Évolution professionnelle et hiérarchique', type: 'textarea', section: 'Carrières' },
        {
          name: 'etapesEvolution',
          label:
            "Étapes de carrière détaillées (une par ligne, format : Poste | Expérience ou niveau requis) — ex : « Développeur junior | 0-2 ans d'expérience ». Le poste est automatiquement mis en lien vers sa fiche métier s'il est reconnu.",
          type: 'textarea',
          section: 'Carrières',
        },
        { name: 'mobiliteInternationale', label: 'Mobilité internationale / opportunités institutionnelles', type: 'textarea', section: 'Carrières' },
        { name: 'tendances', label: 'Tendances du secteur (séparées par des virgules)', type: 'text', section: 'Carrières' },
        { name: 'penibilitePhysique', label: 'Pénibilité — physique / effort corporel (1 à 5)', type: 'number', section: 'Carrières' },
        { name: 'penibiliteStress', label: 'Pénibilité — stress et pression (1 à 5)', type: 'number', section: 'Carrières' },
        { name: 'penibiliteRisques', label: 'Pénibilité — risques professionnels (1 à 5)', type: 'number', section: 'Carrières' },

        // ── Témoignage professionnel ──
        { name: 'temoignagePrenom', label: 'Témoignage — prénom', type: 'text', section: 'Témoignage professionnel' },
        { name: 'temoignageAnneesExperience', label: "Témoignage — années d'expérience", type: 'number', section: 'Témoignage professionnel' },
        { name: 'temoignageVille', label: 'Témoignage — ville', type: 'text', section: 'Témoignage professionnel' },
        { name: 'temoignageSecteurEmployeur', label: 'Témoignage — secteur / employeur', type: 'text', section: 'Témoignage professionnel' },
        { name: 'temoignageCePlait', label: 'Témoignage — ce qui lui plaît', type: 'textarea', section: 'Témoignage professionnel' },
        { name: 'temoignageDifficultes', label: 'Témoignage — difficultés rencontrées', type: 'textarea', section: 'Témoignage professionnel' },
        { name: 'temoignageConseil', label: 'Témoignage — son conseil', type: 'textarea', section: 'Témoignage professionnel' },
        { name: 'temoignageCitation', label: 'Témoignage — citation', type: 'textarea', section: 'Témoignage professionnel' },
        {
          name: 'temoignageAccordPublication',
          label: 'Témoignage — accord de publication (OUI_PHOTO, OUI_PRENOM, OUI_ANONYME, NON)',
          type: 'text',
          section: 'Témoignage professionnel',
        },

        // ── Sources et fiabilité ──
        { name: 'sources', label: 'Sources consultées (une par ligne, ex : Type — Référence — Date)', type: 'textarea', section: 'Sources et fiabilité' },
        {
          name: 'fiabilite',
          label: 'Évaluation de la fiabilité (TRES_FIABLE, FIABLE, A_VERIFIER, PARTIELLE)',
          type: 'text',
          section: 'Sources et fiabilité',
        },
        { name: 'observations', label: 'Observations complémentaires', type: 'textarea', section: 'Sources et fiabilité' },
      ]}
    />
  );
}
