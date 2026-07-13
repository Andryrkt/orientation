import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';

interface Ressource {
  id: string;
  titre: string;
  description: string | null;
  contenu: string;
  type: 'COURS' | 'DOCUMENT';
  niveauEtude: string;
  categorie: string;
  fichierUrl: string | null;
  dureeLecture: string | null;
  createdAt: string;
}

export function RessourcesApprentissage() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();

  // Déterminer le niveau d'études initial
  const getInitialLevel = () => {
    const rawLevel = user?.profil?.niveauEtude?.toUpperCase() ?? '';
    if (rawLevel.includes('LYC') || rawLevel.includes('BACC') || rawLevel.includes('SEC') || rawLevel.includes('TERM') || rawLevel.includes('PREM') || rawLevel.includes('COLL')) {
      return 'LYCEE';
    }
    if (rawLevel.includes('BACH') || rawLevel.includes('NOUV')) {
      return 'NOUVEAU_BACHELIER';
    }
    if (rawLevel.includes('UNIV') || rawLevel.includes('LIC') || rawLevel.includes('MAST') || rawLevel.includes('DOC') || rawLevel.includes('SUP')) {
      return 'UNIVERSITE';
    }
    return null; // Affiche l'onboarding si non renseigné
  };

  const [selectedLevel, setSelectedLevel] = useState<'LYCEE' | 'NOUVEAU_BACHELIER' | 'UNIVERSITE' | null>(getInitialLevel());
  const [activeTab, setActiveTab] = useState<'LEARNING' | 'DOCS'>('LEARNING');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [readerResource, setReaderResource] = useState<Ressource | null>(null);

  // Mutation pour sauvegarder le niveau d'études dans le profil
  const updateLevelMutation = useMutation({
    mutationFn: async (level: string) => {
      await api.patch('/users/me', { niveauEtude: level });
      await refreshUser();
    },
    onSuccess: (_, variables) => {
      setSelectedLevel(variables as any);
      if (variables === 'UNIVERSITE' || variables === 'NOUVEAU_BACHELIER') {
        setActiveTab('DOCS');
      } else {
        setActiveTab('LEARNING');
      }
    }
  });

  // Récupérer les ressources selon les filtres
  const { data: ressourcesData, isLoading } = useQuery({
    queryKey: ['ressources', selectedLevel, activeTab, search, activeCategory],
    queryFn: async () => {
      if (!selectedLevel) return { items: [] as Ressource[] };
      const typeFilter = activeTab === 'LEARNING' ? 'COURS' : 'DOCUMENT';
      const res = await api.get<{ items: Ressource[] }>('/ressources', {
        params: {
          niveauEtude: selectedLevel,
          type: typeFilter,
          search: search || undefined,
          categorie: activeCategory !== 'All' ? activeCategory : undefined,
          limit: 100
        }
      });
      return res.data;
    },
    enabled: !!selectedLevel
  });

  const categories = selectedLevel === 'LYCEE'
    ? ['All', 'Mathématiques', 'Physics', 'Livres scolaires', 'Annales BACC']
    : selectedLevel === 'NOUVEAU_BACHELIER'
    ? ['All', 'Sujets de Concours', 'Guide Orientation']
    : ['All', 'Modèles de CV', 'Rapports de Stage', 'Mémoires & Thèses'];

  // Fonction pour formater et rendre le contenu en format markdown simple
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return (
          <h2 key={i} className="text-2xl font-black text-slate-800 dark:text-white mt-6 mb-4 pb-2 border-b dark:border-white/10">
            {line.replace('# ', '')}
          </h2>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-5 mb-3">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-lg font-semibold text-slate-850 dark:text-slate-350 mt-4 mb-2">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="ml-5 list-disc text-slate-600 dark:text-slate-350 my-1">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      }
      if (line.trim().startsWith('- [x]')) {
        return (
          <div key={i} className="flex items-center gap-2 my-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>✓</span> {line.replace('- [x]', '').trim()}
          </div>
        );
      }
      if (line.trim().startsWith('- [ ]')) {
        return (
          <div key={i} className="flex items-center gap-2 my-1.5 text-slate-400 dark:text-slate-500">
            <span className="inline-block w-3.5 h-3.5 border border-slate-300 dark:border-slate-700 rounded-sm"></span> {line.replace('- [ ]', '').trim()}
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2"></div>;

      let content: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        content = parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-slate-800 dark:text-white">{part}</strong> : part);
      }
      return (
        <p key={i} className="text-slate-600 dark:text-slate-350 leading-relaxed my-2">
          {content}
        </p>
      );
    });
  };

  // Écran d'onboarding (choix du niveau d'études)
  if (!selectedLevel) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl text-white mx-auto mb-5 shadow-lg shadow-purple-500/20">🎓</span>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('ressources.select_level_prompt')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            {t('ressources.select_level_desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card Lycée */}
          <button
            onClick={() => updateLevelMutation.mutate('LYCEE')}
            disabled={updateLevelMutation.isPending}
            className="p-6 text-left bg-white border border-slate-200 dark:bg-white/3 dark:border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 rounded-2xl transition duration-300 group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl mb-4 block group-hover:scale-110 transition duration-300">🏫</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('ressources.level_lycee')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{t('ressources.level_lycee_desc')}</p>
            </div>
            <span className="inline-flex mt-6 text-xs font-semibold text-purple-500 group-hover:translate-x-1 transition duration-300">Choisir →</span>
          </button>

          {/* Card Nouveau Bachelier */}
          <button
            onClick={() => updateLevelMutation.mutate('NOUVEAU_BACHELIER')}
            disabled={updateLevelMutation.isPending}
            className="p-6 text-left bg-white border border-slate-200 dark:bg-white/3 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 rounded-2xl transition duration-300 group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl mb-4 block group-hover:scale-110 transition duration-300">🎓</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('ressources.level_bachelier')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{t('ressources.level_bachelier_desc')}</p>
            </div>
            <span className="inline-flex mt-6 text-xs font-semibold text-indigo-500 group-hover:translate-x-1 transition duration-300">Choisir →</span>
          </button>

          {/* Card Université */}
          <button
            onClick={() => updateLevelMutation.mutate('UNIVERSITE')}
            disabled={updateLevelMutation.isPending}
            className="p-6 text-left bg-white border border-slate-200 dark:bg-white/3 dark:border-white/5 hover:border-pink-500/40 hover:bg-pink-500/5 rounded-2xl transition duration-300 group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl mb-4 block group-hover:scale-110 transition duration-300">🏢</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('ressources.level_universite')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{t('ressources.level_universite_desc')}</p>
            </div>
            <span className="inline-flex mt-6 text-xs font-semibold text-pink-500 group-hover:translate-x-1 transition duration-300">Choisir →</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <section className="relative overflow-hidden px-6 py-12 rounded-[2rem]"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.06) 50%, rgba(10,8,24,0.4) 100%)',
          border: '1px solid rgba(168,85,247,0.15)',
          backdropFilter: 'blur(10px)',
        }}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 bg-purple-550/15 border border-purple-500/25 text-purple-400">
              📚 {selectedLevel === 'LYCEE' ? t('ressources.level_lycee') : selectedLevel === 'NOUVEAU_BACHELIER' ? t('ressources.level_bachelier') : t('ressources.level_universite')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              {t('ressources.title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
              {t('ressources.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setSelectedLevel(null)}
            className="self-start md:self-center px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/8 text-slate-700 dark:text-slate-200 rounded-xl transition duration-200"
          >
            🔄 {t('ressources.btn_change_level')}
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/5 pb-px">
        <button
          onClick={() => { setActiveTab('LEARNING'); setActiveCategory('All'); }}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all duration-200 -mb-px ${
            activeTab === 'LEARNING'
              ? 'border-purple-500 text-purple-500 dark:text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
          }`}
        >
          📖 {t('ressources.tab_learning')}
        </button>
        <button
          onClick={() => { setActiveTab('DOCS'); setActiveCategory('All'); }}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all duration-200 -mb-px ${
            activeTab === 'DOCS'
              ? 'border-purple-500 text-purple-500 dark:text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
          }`}
        >
          📂 {t('ressources.tab_docs')}
        </button>
      </div>

      {/* Search & Categories */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder={t('ressources.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input flex-1"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition duration-205 ${
                activeCategory === cat
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {cat === 'All' ? t('ressources.category_all') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources grid */}
      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-400 py-16 justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          Chargement...
        </div>
      ) : ressourcesData?.items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-white/8 rounded-2xl">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-slate-400 text-sm font-semibold">{t('ressources.empty_msg')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ressourcesData?.items.map((res) => (
            <div
              key={res.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-white/10"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {res.categorie}
                  </span>
                  {res.dureeLecture && (
                    <span className="text-xs text-slate-400 font-semibold">
                      ⏱️ {res.type === 'COURS' ? t('ressources.duration', { duration: res.dureeLecture }) : t('ressources.pages', { pages: res.dureeLecture })}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">{res.titre}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{res.description}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setReaderResource(res)}
                  className="flex-1 py-2.5 text-center text-xs font-semibold bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition duration-200"
                >
                  📖 {t('ressources.read')}
                </button>
                {res.fichierUrl && (
                  <a
                    href={res.fichierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-205 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl transition duration-200 flex items-center justify-center gap-1"
                  >
                    💾 {t('ressources.download')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {readerResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/8 shadow-2xl flex flex-col animate-dropdown">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-indigo-500/5 rounded-t-[2rem]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
                  {readerResource.categorie}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-tight">{readerResource.titre}</h2>
              </div>
              <button
                onClick={() => setReaderResource(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-650 dark:text-slate-350 flex items-center justify-center transition duration-200 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 max-w-none">
              {renderMarkdown(readerResource.contenu)}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950 rounded-b-[2rem]">
              <span className="text-xs text-slate-400 font-semibold">
                {readerResource.dureeLecture && `⏱️ ${readerResource.dureeLecture}`}
              </span>
              <button
                onClick={() => setReaderResource(null)}
                className="btn-primary py-2 px-5 text-xs shadow-md"
              >
                {t('ressources.modal_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
