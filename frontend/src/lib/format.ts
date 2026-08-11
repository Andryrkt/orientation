function grouperMilliers(chiffres: string): string {
  return chiffres.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatMontant(n: number): string {
  const arrondi = Math.round(n);
  const signe = arrondi < 0 ? '-' : '';
  return `${signe}${grouperMilliers(Math.abs(arrondi).toString())} Ar`;
}

/** Formate une chaîne de chiffres saisie par l'utilisateur avec des espaces tous les 3 chiffres (sans unité). */
export function formatNombreSaisi(valeur: string): string {
  return grouperMilliers(valeur.replace(/\D/g, ''));
}

/** Extrait uniquement les chiffres d'une saisie utilisateur (pour stocker/soumettre la valeur brute). */
export function extraireChiffres(valeur: string): string {
  return valeur.replace(/\D/g, '');
}
