import { useState } from 'react';
import { UniversitesList } from './UniversitesList';
import { CentresFormationList } from './CentresFormationList';

const TABS = [
  { key: 'universites', label: '🏛️ Universités' },
  { key: 'centres-formation', label: '🛠️ Formation professionnelle' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function EtablissementsList() {
  const [tab, setTab] = useState<TabKey>('universites');

  return (
    <div>
      <div className="inline-flex rounded-full border border-slate-200 dark:border-white/15 overflow-hidden mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
              tab === t.key ? 'bg-blue-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'universites' ? <UniversitesList /> : <CentresFormationList />}
    </div>
  );
}
