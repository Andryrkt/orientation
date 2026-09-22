import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Metier, Paginated, Secteur } from '../lib/types';
import { useComparison } from '../lib/useComparison';
import { ComparisonBar } from '../components/ComparisonBar';

// Palette cyclique appliquée aux secteurs dans l'ordre (il peut y en avoir plus que de couleurs).
const SECTOR_PALETTE: { glow: string; text: string }[] = [
  { glow: 'rgba(99,102,241,0.18)', text: '#818cf8' },
  { glow: 'rgba(244,63,94,0.18)', text: '#fb7185' },
  { glow: 'rgba(245,158,11,0.18)', text: '#fbbf24' },
  { glow: 'rgba(56,189,248,0.18)', text: '#38bdf8' },
  { glow: 'rgba(20,184,166,0.18)', text: '#34d399' },
  { glow: 'rgba(217,70,239,0.18)', text: '#e879f9' },
  { glow: 'rgba(163,163,163,0.18)', text: '#a3a3a3' },
];

function getColor(index: number) {
  return SECTOR_PALETTE[index % SECTOR_PALETTE.length];
}

/* ── Ligne "sommaire" d'un métier, avec case à cocher pour la comparaison ── */
function MetierRow({
  metier,
  num,
  selected,
  disabled,
  onToggle,
}: {
  metier: Metier;
  num: string;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={selected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
        title={selected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
        className={`shrink-0 ml-4 w-5 h-5 rounded border flex items-center justify-center text-[10px] font-bold transition-colors ${
          selected
            ? 'bg-blue-600 border-blue-600 text-white'
            : disabled
              ? 'border-slate-200 dark:border-white/10 text-transparent cursor-not-allowed'
              : 'border-slate-300 dark:border-white/20 text-transparent hover:border-blue-400'
        }`}
      >
        ✓
      </button>
      <Link
        to={`/metiers/${metier.slug}`}
        className="flex-1 flex items-baseline gap-3 px-5 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors group min-w-0"
      >
        <span className="shrink-0 text-xs font-bold text-slate-400 dark:text-slate-500 tabular-nums">
          {num}.
        </span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 truncate">
          {metier.nom}
        </span>
        {metier.riasecCodes && metier.riasecCodes.length > 0 && (
          <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500 italic">
            ({metier.riasecCodes.join(' - ')})
          </span>
        )}
      </Link>
    </li>
  );
}

export function MetiersList() {
  const [searchParams] = useSearchParams();
  const [secteur, setSecteur] = useState(searchParams.get('secteur') ?? '');
  const [q, setQ] = useState('');
  const [niveauRequis, setNiveauRequis] = useState('');
  // Lien profond depuis les pages Domaines / Résultat de questionnaire, qui filtrent par
  // domaine d'étude (sans dropdown dédié ici, puisque cette page navigue désormais par secteur).
  const domaineParam = searchParams.get('domaine') ?? '';

  const comparison = useComparison('comparaison-metiers', 3);

  const { data: secteurs } = useQuery({
    queryKey: ['secteurs-filter'],
    queryFn: async () => (await api.get<Paginated<Secteur>>('/secteurs?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['metiers', secteur, domaineParam, q, niveauRequis],
    queryFn: async () =>
      (
        await api.get<Paginated<Metier>>('/metiers', {
          params: {
            limit: 100,
            ...(secteur && { secteur }),
            ...(domaineParam && { domaine: domaineParam }),
            ...(q && { q }),
            ...(niveauRequis && { niveauRequis }),
          },
        })
      ).data,
  });

  // Regroupe les métiers par secteur stratégique, dans l'ordre défini, façon sommaire.
  const sectors = (secteurs?.items ?? [])
    .slice()
    .sort((a, b) => a.ordre - b.ordre)
    .map((s) => ({
      secteur: s,
      metiers: (data?.items ?? [])
        .filter((m) => m.secteur?.slug === s.slug)
        .slice()
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    }))
    .filter((s) => s.metiers.length > 0);

  const nonClasses = (data?.items ?? [])
    .filter((m) => !m.secteur)
    .slice()
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

  let runningIndex = 0;

  return (
    <div>
      {/* ── Banner ── */}
      <section className="relative overflow-hidden px-6 py-12 sm:py-16 rounded-[2rem] mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(10,8,24,0.4) 100%)',
          border: '1px solid rgba(129,140,248,0.15)',
          backdropFilter: 'blur(10px)',
        }}>
        {/* Glow orbs */}
        <div className="glow-orb w-72 h-72 -top-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)' }} />
        <div className="glow-orb w-48 h-48 -bottom-10 left-1/3"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8' }}>
            📂 Fiches Métiers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Découvre les métiers <span className="gradient-text">à Madagascar</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Explorez les opportunités de carrière, les compétences requises et les salaires locaux.
          </p>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          placeholder="🔍  Rechercher un métier..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="field-input w-full"
        />
        <select
          value={secteur}
          onChange={(e) => setSecteur(e.target.value)}
          className="field-input w-full"
        >
          <option value="">Tous les secteurs</option>
          {secteurs?.items.map((s) => (
            <option key={s.id} value={s.slug}>{s.nom}</option>
          ))}
        </select>
        <select
          value={niveauRequis}
          onChange={(e) => setNiveauRequis(e.target.value)}
          className="field-input w-full"
        >
          <option value="">Tous les niveaux d'études</option>
          <option value="Bac">Bac</option>
          <option value="Licence">Licence</option>
          <option value="Master">Master</option>
          <option value="Doctorat">Doctorat</option>
        </select>
      </div>

      {/* ── Loading / Empty ── */}
      {isLoading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Chargement...
        </div>
      )}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-500 py-8 text-center">Aucun métier ne correspond à ta recherche.</p>
      )}

      {/* ── Sommaire par secteur, façon table des matières ── */}
      {!isLoading && (sectors.length > 0 || nonClasses.length > 0) && (
        <div className="space-y-6">
          {sectors.map(({ secteur: s, metiers }, sectorIdx) => {
            const color = getColor(sectorIdx);
            return (
              <section key={s.id} className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                  <span
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
                    style={{ background: color.glow, color: color.text }}
                  >
                    {String(sectorIdx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: color.text }}>
                      Secteur {String(sectorIdx + 1).padStart(2, '0')}
                    </p>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">{s.nom}</h2>
                  </div>
                </div>

                <ul className="divide-y divide-black/5 dark:divide-white/5">
                  {metiers.map((m) => {
                    runningIndex += 1;
                    const num = String(runningIndex).padStart(2, '0');
                    const selected = comparison.isSelected(m.slug);
                    return (
                      <MetierRow
                        key={m.id}
                        metier={m}
                        num={num}
                        selected={selected}
                        disabled={!selected && comparison.count >= comparison.max}
                        onToggle={() => comparison.toggle(m.slug)}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {/* Métiers sans secteur assigné (à renseigner côté back office) */}
          {nonClasses.length > 0 && (
            <section className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 dark:border-white/5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Autres métiers</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Secteur non renseigné.</p>
              </div>
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {nonClasses.map((m) => {
                  runningIndex += 1;
                  const num = String(runningIndex).padStart(2, '0');
                  const selected = comparison.isSelected(m.slug);
                  return (
                    <MetierRow
                      key={m.id}
                      metier={m}
                      num={num}
                      selected={selected}
                      disabled={!selected && comparison.count >= comparison.max}
                      onToggle={() => comparison.toggle(m.slug)}
                    />
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      <ComparisonBar
        count={comparison.count}
        max={comparison.max}
        label="métier(s)"
        compareTo={`/metiers/comparer?slugs=${comparison.selected.join(',')}`}
        onClear={comparison.clear}
      />
    </div>
  );
}
