export function formatMontant(n: number): string {
  const arrondi = Math.round(n);
  const signe = arrondi < 0 ? '-' : '';
  const chiffres = Math.abs(arrondi).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${signe}${chiffres} Ar`;
}
