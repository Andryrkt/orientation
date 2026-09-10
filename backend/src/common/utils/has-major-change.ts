// Détermine si une modification touche au moins un champ "majeur" (contenu affiché publiquement,
// donc à revalider) plutôt que seulement des champs mineurs (coordonnées, disponibilités...).
// Sert à alléger la modération : une simple correction de téléphone ne remet pas toute la fiche
// en attente si elle était déjà publiée.
export function hasMajorChange<T extends Record<string, unknown>>(
  existing: T,
  incoming: Partial<Record<keyof T, unknown>>,
  majorFields: readonly (keyof T)[],
): boolean {
  return majorFields.some((field) => {
    if (!(field in incoming)) return false;
    const newVal = incoming[field];
    const oldVal = existing[field];
    if (Array.isArray(newVal) && Array.isArray(oldVal)) {
      const a = [...newVal].sort();
      const b = [...oldVal].sort();
      return JSON.stringify(a) !== JSON.stringify(b);
    }
    return newVal !== oldVal;
  });
}
