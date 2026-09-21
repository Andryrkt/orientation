export const NIVEAU_LABELS: Record<string, string> = {
  BTS: 'BTS',
  LICENCE: 'Licence',
  MASTER: 'Master',
  DOCTORAT: 'Doctorat',
};

export const CONDITION_ADMISSION_LABELS: Record<string, string> = {
  SELECTION_DOSSIER: 'Sélection de dossier',
  EXAMEN_ENTREE: "Examen d'entrée",
  TEST_ACCES: "Test d'accès",
  CONCOURS: 'Concours',
};

export function formatArgent(val: number | null) {
  if (val == null) return null;
  return `${val.toLocaleString('fr-FR')} Ar`;
}
