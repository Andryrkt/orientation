import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

type FaqItem = {
  id: string;
  question: string;
  reponse: string;
  categorie: string;
  icone: string;
  ordre: number;
};

type FaqGroup = {
  categorie: string;
  icone: string;
  items: FaqItem[];
};

// Couleurs par défaut pour les catégories (dégrade en bleu/cyan selon l'index)
const CATEGORY_COLORS = [
  'from-blue-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-sky-500 to-cyan-500',
  'from-indigo-500 to-blue-500',
  'from-blue-600 to-indigo-600',
  'from-sky-500 to-blue-600',
];

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="border border-slate-200 dark:border-white/8 rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: isOpen ? 'rgba(0,82,255,0.03)' : undefined }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left group"
      >
        <span
          className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
            isOpen
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
          }`}
        >
          {item.question}
        </span>
        <span
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-blue-500 text-white rotate-180'
              : 'bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
      >
        <p className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
          {item.reponse}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: groups = [], isLoading } = useQuery<FaqGroup[]>({
    queryKey: ['faq-public'],
    queryFn: async () => (await api.get<FaqGroup[]>('/faq')).data,
  });

  function toggleItem(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const totalQuestions = groups.reduce((acc, g) => acc + g.items.length, 0);

  const filteredGroups = activeCategory
    ? groups.filter((g) => g.categorie === activeCategory)
    : groups;

  return (
    <div className="relative">
      {/* ── Lueurs de fond ── */}
      <div
        className="glow-orb w-80 h-80 -top-20 right-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="glow-orb w-72 h-72 bottom-20 left-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.1) 0%, transparent 70%)' }}
      />

      {/* ── Hero Banner ── */}
      <section
        className="relative overflow-hidden px-6 py-14 sm:py-20 rounded-[2rem] mb-12 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,163,255,0.12) 0%, rgba(0,82,255,0.08) 50%, rgba(10,8,24,0.4) 100%)',
          border: '1px solid rgba(0,163,255,0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="glow-orb w-72 h-72 -top-16 -right-16"
          style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.15) 0%, transparent 70%)' }}
        />
        <div className="relative z-10">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{
              background: 'rgba(0,163,255,0.15)',
              border: '1px solid rgba(0,163,255,0.3)',
              color: '#00A3FF',
            }}
          >
            ❓ Foire Aux Questions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            On répond à vos{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #0052FF, #00A3FF)' }}
            >
              questions
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Trouvez rapidement des réponses aux questions les plus fréquentes sur la plateforme Avenir assuré.
          </p>

          {!isLoading && (
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { value: totalQuestions, label: 'Questions répondues' },
                { value: groups.length, label: 'Catégories' },
                { value: '24h', label: 'Délai de réponse' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-blue-500">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Loader ── */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 text-slate-400 py-16">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Chargement des questions…
        </div>
      )}

      {/* ── Contenu ── */}
      {!isLoading && groups.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-white/8 rounded-2xl">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-slate-400 text-sm font-semibold">
            Aucune question disponible pour le moment.
          </p>
        </div>
      )}

      {!isLoading && groups.length > 0 && (
        <>
          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeCategory === null
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              Toutes les catégories
            </button>
            {groups.map((group) => (
              <button
                key={group.categorie}
                onClick={() => setActiveCategory(group.categorie === activeCategory ? null : group.categorie)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === group.categorie
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {group.icone} {group.categorie}
              </button>
            ))}
          </div>

          {/* Accordéons par catégorie */}
          <div className="space-y-10 mb-16">
            {filteredGroups.map((group, idx) => (
              <div key={group.categorie}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${
                      CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                    }`}
                  >
                    {group.icone}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{group.categorie}</h2>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                    {group.items.length} question{group.items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.items.map((item) => {
                    const key = item.id;
                    return (
                      <AccordionItem
                        key={key}
                        item={item}
                        isOpen={!!openItems[key]}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Encart Contact ── */}
      <section
        className="rounded-[2rem] p-10 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,82,255,0.1) 0%, rgba(0,163,255,0.08) 100%)',
          border: '1px solid rgba(0,163,255,0.15)',
        }}
      >
        <div
          className="glow-orb w-60 h-60 -top-10 -right-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.15) 0%, transparent 70%)' }}
        />
        <div className="relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #0052FF, #00A3FF)' }}
          >
            💬
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
            Notre équipe est là pour vous aider. Envoyez-nous un message et nous vous répondrons dans les 24h.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/contact" className="btn-primary px-6 py-2.5 text-sm">
              ✉️ Nous contacter
            </Link>
            <Link
              to="/guide"
              className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
            >
              📖 Guide d'utilisation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
