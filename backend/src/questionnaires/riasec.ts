export const RIASEC_DIMENSIONS = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecDimension = (typeof RIASEC_DIMENSIONS)[number];

export function emptyScores(): Record<string, number> {
  return Object.fromEntries(RIASEC_DIMENSIONS.map((d) => [d, 0]));
}

export function addScores(target: Record<string, number>, source: Record<string, number>) {
  for (const [dim, value] of Object.entries(source)) {
    if (RIASEC_DIMENSIONS.includes(dim as RiasecDimension) && typeof value === 'number') {
      target[dim] = (target[dim] ?? 0) + value;
    }
  }
}

export function topCodes(scores: Record<string, number>, count = 2): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([dim]) => dim);
}
