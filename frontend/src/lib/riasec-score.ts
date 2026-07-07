import { RIASEC_CODES } from './riasec';

export function serializeScore(score?: Record<string, number>): string {
  if (!score) return '';
  return Object.entries(score)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join(', ');
}

export function parseScore(text: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const part of text.split(',')) {
    const [code, value] = part.split(':').map((s) => s.trim());
    if (code && RIASEC_CODES.includes(code.toUpperCase()) && value && !isNaN(Number(value))) {
      result[code.toUpperCase()] = Number(value);
    }
  }
  return result;
}
