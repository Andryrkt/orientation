import { RIASEC_CODES, RIASEC_LABELS } from '../lib/riasec';

const COLORS: Record<string, string> = {
  R: '#2a78d6',
  I: '#1baf7a',
  A: '#eda100',
  S: '#008300',
  E: '#4a3aa7',
  C: '#e34948',
};

interface RiasecChartProps {
  scores: Record<string, number>;
}

export function RiasecChart({ scores }: RiasecChartProps) {
  const max = Math.max(1, ...RIASEC_CODES.map((c) => scores[c] ?? 0));

  return (
    <div className="space-y-3">
      {RIASEC_CODES.map((code) => {
        const value = scores[code] ?? 0;
        const width = Math.round((value / max) * 100);
        return (
          <div key={code} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-slate-600">{RIASEC_LABELS[code]}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${width}%`, backgroundColor: COLORS[code] }}
              />
            </div>
            <span className="w-8 shrink-0 text-sm font-medium text-slate-700 text-right">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
