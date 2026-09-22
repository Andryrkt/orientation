import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Domaine, Mention, Universite } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';
import { BackButton } from '../components/BackButton';
import { UniversitesMap } from '../components/UniversitesMap';
import { CONDITION_ADMISSION_LABELS, formatArgent } from '../lib/mention';
import { useComparison } from '../lib/useComparison';
import { ComparisonBar } from '../components/ComparisonBar';

/* ── Mention repliable : titre + niveau, puis description/frais/parcours une fois ouverte ── */
function MentionAccordionItem({
  mention,
  isOpen,
  onToggle,
  compareSelected,
  compareDisabled,
  onToggleCompare,
}: {
  mention: Mention;
  isOpen: boolean;
  onToggle: () => void;
  compareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
}) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-b-0">
      <div className="w-full flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          disabled={compareDisabled}
          aria-pressed={compareSelected}
          aria-label={compareSelected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
          title={compareSelected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
          className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center text-[10px] font-bold transition-colors ${
            compareSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : compareDisabled
                ? 'border-slate-200 dark:border-white/10 text-transparent cursor-not-allowed'
                : 'border-slate-300 dark:border-white/20 text-transparent hover:border-blue-400'
          }`}
        >
          ✓
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex-1 flex items-center justify-between gap-3 text-left min-w-0"
        >
          <div className="min-w-0">
            <p className="font-bold text-slate-800 dark:text-white truncate">{mention.nom}</p>
          </div>
          <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
        </button>
      </div>

      {isOpen && (
        <div className="pb-5 space-y-4">
          {mention.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{mention.description}</p>
          )}

          {(mention.conditionAdmission || mention.droitInscription != null || mention.fraisAnnuel != null || mention.fraisAnnexe != null) && (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {mention.conditionAdmission && (
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Condition d'admission : </span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {CONDITION_ADMISSION_LABELS[mention.conditionAdmission] ?? mention.conditionAdmission}
                  </span>
                </p>
              )}
              {mention.droitInscription != null && (
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Droit d'inscription : </span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatArgent(mention.droitInscription)}</span>
                </p>
              )}
              {mention.fraisAnnuel != null && (
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Frais annuel : </span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatArgent(mention.fraisAnnuel)}</span>
                </p>
              )}
              {mention.fraisAnnexe != null && (
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Frais annexe : </span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatArgent(mention.fraisAnnexe)}</span>
                </p>
              )}
            </div>
          )}

          {mention.parcours && mention.parcours.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Parcours</p>
              <div className="space-y-2">
                {mention.parcours.map((p) => (
                  <div key={p.id} className="rounded-lg bg-slate-100 dark:bg-slate-800/60 px-3.5 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-sm text-slate-800 dark:text-white">{p.nom}</span>
                      {p.duree && <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{p.duree}</span>}
                    </div>
                    {p.debouches && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-medium">Débouchés : </span>{p.debouches}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            to={`/mentions/${mention.slug}`}
            className="inline-block text-xs font-semibold text-brand-600 dark:text-blue-400 hover:underline"
          >
            Voir la fiche complète →
          </Link>
        </div>
      )}
    </div>
  );
}

export function UniversiteDetail() {
  const { slug } = useParams();
  const { data: universite, isLoading } = useQuery({
    queryKey: ['universite', slug],
    queryFn: async () => (await api.get<Universite>(`/universites/${slug}`)).data,
  });
  const [openMentionIds, setOpenMentionIds] = useState<Set<string>>(new Set());
  const toggleMention = (id: string) =>
    setOpenMentionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const comparison = useComparison('comparaison-mentions', 3);

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!universite) return <p className="text-slate-400">Université introuvable.</p>;

  // Regroupe les mentions par domaine d'étude, dans l'ordre des domaines.
  const domaineGroups = Object.values(
    (universite.mentions ?? []).reduce<Record<string, { domaine?: Domaine; mentions: Mention[] }>>((acc, mention) => {
      const key = mention.domaine?.id ?? 'sans-domaine';
      if (!acc[key]) acc[key] = { domaine: mention.domaine, mentions: [] };
      acc[key].mentions.push(mention);
      return acc;
    }, {}),
  )
    .map((g) => ({ ...g, mentions: g.mentions.slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr')) }))
    .sort((a, b) => (a.domaine?.ordre ?? 999) - (b.domaine?.ordre ?? 999));

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton fallback="/etablissements" />
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{universite.nom}</h1>
        <FavoriteButton type="UNIVERSITE" entityId={universite.id} className="shrink-0" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        {universite.adresse ? `${universite.adresse}, ` : ''}
        {universite.ville}{universite.region ? `, ${universite.region}` : ''}
      </p>
      <p className="text-slate-700 dark:text-slate-300 mb-6">{universite.description}</p>

      {universite.photos?.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {universite.photos.map((url, i) => (
            <img
              key={url + i}
              src={url}
              alt={`${universite.nom} — photo ${i + 1}`}
              className="h-28 w-40 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-8">
        {universite.telephone && <span>Tél : {universite.telephone}</span>}
        {universite.email && <span>Email : {universite.email}</span>}
        {universite.siteWeb && (
          <a href={universite.siteWeb} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-blue-400 hover:underline">
            Site web
          </a>
        )}
      </div>

      {universite.latitude != null && universite.longitude != null && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Localisation</h2>
          <UniversitesMap universites={[universite]} height="280px" />
        </div>
      )}

      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Domaines, mentions et parcours</h2>
      {(!universite.mentions || universite.mentions.length === 0) && (
        <p className="text-slate-400">Aucune mention renseignée pour le moment.</p>
      )}
      <div className="space-y-6">
        {domaineGroups.map(({ domaine, mentions }) => (
          <div key={domaine?.id ?? 'sans-domaine'} className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-blue-400 mb-1">
              {domaine?.nom ?? 'Autres mentions'}
            </h3>
            <div>
              {mentions.map((mention) => {
                const selected = comparison.isSelected(mention.slug);
                return (
                  <MentionAccordionItem
                    key={mention.id}
                    mention={mention}
                    isOpen={openMentionIds.has(mention.id)}
                    onToggle={() => toggleMention(mention.id)}
                    compareSelected={selected}
                    compareDisabled={!selected && comparison.count >= comparison.max}
                    onToggleCompare={() => comparison.toggle(mention.slug)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ComparisonBar
        count={comparison.count}
        max={comparison.max}
        label="mention(s)"
        compareTo={`/mentions/comparer?slugs=${comparison.selected.join(',')}`}
        onClear={comparison.clear}
      />
    </div>
  );
}
