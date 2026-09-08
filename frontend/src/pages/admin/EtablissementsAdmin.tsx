import { useState } from 'react';
import { UniversitesAdmin } from './UniversitesAdmin';
import { CentresFormationAdmin } from './CentresFormationAdmin';

const TABS = [
  { key: 'universites', label: 'Universités' },
  { key: 'centres-formation', label: 'Formation professionnelle' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function EtablissementsAdmin() {
  const [tab, setTab] = useState<TabKey>('universites');

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'universites' ? <UniversitesAdmin /> : <CentresFormationAdmin />}
    </div>
  );
}
