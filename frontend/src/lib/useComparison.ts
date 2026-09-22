import { useCallback, useEffect, useState } from 'react';

// Sélection de comparaison (métiers, formations...) persistée en localStorage, pour qu'elle
// survive à la navigation entre la liste et la page de comparaison.
export function useComparison(storageKey: string, max = 3) {
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(selected));
    } catch {
      // Stockage indisponible (navigation privée, quota...) : la sélection reste en mémoire.
    }
  }, [storageKey, selected]);

  const isSelected = useCallback((id: string) => selected.includes(id), [selected]);

  const toggle = useCallback(
    (id: string) => {
      setSelected((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= max) return prev;
        return [...prev, id];
      });
    },
    [max],
  );

  const clear = useCallback(() => setSelected([]), []);

  return { selected, isSelected, toggle, clear, count: selected.length, max };
}
