const MADAGASCAR_TIMEZONE = 'Indian/Antananarivo';

/** Date calendaire du jour (00:00 UTC) dans le fuseau horaire de Madagascar, pour les colonnes @db.Date. */
export function dateDuJourMadagascar(): Date {
  const isoDate = new Intl.DateTimeFormat('en-CA', { timeZone: MADAGASCAR_TIMEZONE }).format(new Date());
  return new Date(`${isoDate}T00:00:00Z`);
}

/** Lundi (00:00 UTC) de la semaine ISO contenant la date donnée. */
export function lundiDeLaSemaine(date: Date): Date {
  const jour = date.getUTCDay();
  const decalage = jour === 0 ? -6 : 1 - jour;
  const lundi = new Date(date);
  lundi.setUTCDate(date.getUTCDate() + decalage);
  lundi.setUTCHours(0, 0, 0, 0);
  return lundi;
}
