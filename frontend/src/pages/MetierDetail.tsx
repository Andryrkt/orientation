import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Metier, Paginated } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';
import { BackButton } from '../components/BackButton';
import { RIASEC_LABELS } from '../lib/riasec';

/* ── Mise en lien des étapes de carrière avec les fiches métiers existantes ── */
function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findMetierMatch(poste: string, candidates: { nom: string; slug: string }[]) {
  const target = normalizeForMatch(poste);
  if (!target) return undefined;
  let best: { nom: string; slug: string } | undefined;
  let bestScore = 0;
  for (const c of candidates) {
    const candidate = normalizeForMatch(c.nom);
    if (!candidate) continue;
    let score = 0;
    if (candidate === target) score = 100;
    else if (target.includes(candidate) || candidate.includes(target)) score = 60;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return bestScore >= 60 ? best : undefined;
}

/* ── Étapes de progression de carrière, mises en lien quand le poste est reconnu ── */
function EvolutionCarriere({ etapes, candidates }: { etapes: string[]; candidates: { nom: string; slug: string }[] }) {
  const steps = etapes.map((line) => {
    const [poste, condition] = line.split('|').map((s) => s.trim());
    return { poste: poste || line.trim(), condition };
  });

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {steps.map((step, i) => {
        const match = findMetierMatch(step.poste, candidates);
        return (
          <div key={`${step.poste}-${i}`} className="flex items-center gap-2">
            <div className="px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 min-w-[150px]">
              {match ? (
                <Link
                  to={`/metiers/${match.slug}`}
                  className="text-sm font-bold text-blue-600 dark:text-blue-300 hover:underline"
                >
                  {step.poste}
                </Link>
              ) : (
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{step.poste}</span>
              )}
              {step.condition && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{step.condition}</p>
              )}
            </div>
            {i < steps.length - 1 && <span className="text-slate-400 text-lg shrink-0">→</span>}
          </div>
        );
      })}
    </div>
  );
}

const DOMAINE_IMAGES: Record<string, string> = {
  'sciences-technologies': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'sante-medecine': 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=1200&q=80',
  'economie-gestion': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'droit-sciences-politiques': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  'lettres-sciences-humaines': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80',
  'arts-communication': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';

const DOMAINE_COLORS: Record<string, { gradient: string; glow: string; text: string; bgLight: string }> = {
  'sciences-technologies': { gradient: 'from-blue-500 to-indigo-500', glow: 'rgba(99,102,241,0.3)', text: '#818cf8', bgLight: 'rgba(59,130,246,0.15)' },
  'sante-medecine': { gradient: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.3)', text: '#fb7185', bgLight: 'rgba(244,63,94,0.15)' },
  'economie-gestion': { gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.3)', text: '#fbbf24', bgLight: 'rgba(245,158,11,0.15)' },
  'droit-sciences-politiques': { gradient: 'from-sky-500 to-blue-500', glow: 'rgba(56,189,248,0.3)', text: '#38bdf8', bgLight: 'rgba(56,189,248,0.15)' },
  'lettres-sciences-humaines': { gradient: 'from-teal-500 to-emerald-500', glow: 'rgba(20,184,166,0.3)', text: '#34d399', bgLight: 'rgba(20,184,166,0.15)' },
  'arts-communication': { gradient: 'from-fuchsia-500 to-pink-500', glow: 'rgba(217,70,239,0.3)', text: '#e879f9', bgLight: 'rgba(217,70,239,0.15)' },
};

const DEFAULT_COLOR = { gradient: 'from-slate-500 to-slate-600', glow: 'rgba(148,163,184,0.3)', text: '#94a3b8', bgLight: 'rgba(148,163,184,0.15)' };

function formatSalaryCompact(val: number | null) {
  if (!val) return '?';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val.toString();
}

function penibiliteLabel(niveau: number) {
  if (niveau <= 2) return 'Faible';
  if (niveau === 3) return 'Modérée';
  return 'Élevée';
}

/* ── Liste de Tags ── */
function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="px-3 py-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/8 rounded-full text-xs text-slate-700 dark:text-slate-300 font-semibold"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ── Champ de Contenu Standard ── */
function Field({
  label,
  subtitle,
  children,
  wide,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{label}</h3>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{subtitle}</p>}
      {children}
    </div>
  );
}

/* ── Section de fiche métier : titre + contenu, toujours visible (façon fiche imprimée) ── */
function SectionCard({
  icon,
  title,
  subtitle,
  children,
  twoCol,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  twoCol?: boolean;
}) {
  return (
    <section className="glass-card overflow-hidden">
      <div className="p-5 border-b border-black/5 dark:border-white/5">
        <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
          <span>{icon}</span> {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-5 ${twoCol ? 'grid md:grid-cols-2 gap-6' : 'space-y-5'}`}>{children}</div>
    </section>
  );
}

export function MetierDetail() {
  const { slug } = useParams();
  const { data: metier, isLoading } = useQuery({
    queryKey: ['metier', slug],
    queryFn: async () => (await api.get<Metier>(`/metiers/${slug}`)).data,
  });
  // Si l'image de bannière renseignée est cassée (fichier supprimé du serveur, etc.), on retombe
  // sur l'image par défaut du domaine plutôt que d'afficher une image morte.
  const [bannerFailed, setBannerFailed] = useState(false);
  useEffect(() => setBannerFailed(false), [metier?.imageBanniere]);
  // Sert à reconnaître les postes cités dans "Perspectives d'évolution" et à les mettre en lien.
  const { data: allMetiers } = useQuery({
    queryKey: ['all-metiers-links'],
    queryFn: async () =>
      (await api.get<Paginated<Pick<Metier, 'nom' | 'slug'>>>('/metiers?limit=100')).data.items,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center gap-3 text-slate-400 py-16">
      <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      Chargement de la fiche métier...
    </div>
  );

  if (!metier) return <p className="text-slate-400 py-16 text-center">Métier introuvable.</p>;

  const hasMissions = metier.missions && metier.missions.length > 0;
  const hasCompetences = metier.competences && metier.competences.length > 0;
  const hasTraits = metier.traitsPersonnalite && metier.traitsPersonnalite.length > 0;
  const hasSalaire = !!(metier.salaireMin || metier.salaireMax);
  const hasRiasec = !!(metier.riasecCodes && metier.riasecCodes.length > 0);
  const hasFormations = !!(
    metier.niveauRequis ||
    metier.specialiteDiplome ||
    metier.seriesBacMadagascar.length > 0 ||
    metier.formationsMadagascar?.length > 0 ||
    metier.certifications?.length > 0 ||
    metier.autoFormation
  );
  const hasExercice = !!(
    metier.environnementTravail?.length > 0 ||
    metier.secteursActivite?.length > 0 ||
    metier.typeContrat?.length > 0 ||
    metier.volumeHoraire?.length > 0 ||
    metier.regionsPresence?.length > 0 ||
    metier.employeurs?.length > 0
  );
  const hasRemuneration = !!(
    hasSalaire ||
    metier.niveauDemande ||
    metier.perspectivesEmploi ||
    metier.postesEvolution ||
    metier.etapesEvolution?.length > 0 ||
    metier.mobiliteInternationale ||
    metier.tendances?.length > 0
  );
  const hasPenibilite = !!(
    metier.penibilitePhysique != null || metier.penibiliteStress != null || metier.penibiliteRisques != null
  );
  const hasAvantagesContraintes = !!metier.avantages || hasPenibilite;

  const slugDomaine = metier.domaine?.slug || '';
  const imageUrl = (!bannerFailed && metier.imageBanniere) || DOMAINE_IMAGES[slugDomaine] || DEFAULT_IMAGE;
  const domainColor = DOMAINE_COLORS[slugDomaine] || DEFAULT_COLOR;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <BackButton fallback="/metiers" />
      {/* ── Bannière de Représentation avec Photo ── */}
      <section
        className="relative overflow-hidden px-6 py-12 sm:py-16 rounded-[2rem] border border-white/10 flex flex-col justify-end min-h-[260px] sm:min-h-[300px]"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10,8,24,0.3) 0%, rgba(10,8,24,0.85) 100%), url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <div className="absolute inset-0 -z-10" style={{ backdropFilter: 'blur(1px)' }} />
        {/* Détecte une image de bannière cassée (fichier manquant) pour retomber sur l'image par défaut */}
        {metier.imageBanniere && !bannerFailed && (
          <img src={metier.imageBanniere} alt="" className="hidden" onError={() => setBannerFailed(true)} />
        )}
        {/* Glow orbs dans la bannière */}
        <div className="glow-orb w-64 h-64 -bottom-20 -left-10"
          style={{ background: `radial-gradient(circle, ${domainColor.glow} 0%, transparent 70%)` }} />

        <div className="relative z-10 space-y-3.5 max-w-2xl">
          {/* Badge Domaine */}
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: domainColor.bgLight, color: domainColor.text, border: `1px solid ${domainColor.glow}` }}>
              📂 {metier.domaine?.nom}
              {metier.sousDomaine && ` · ${metier.sousDomaine}`}
            </span>
          </div>

          {/* Titre Principal & Favori */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {metier.nom}
            </h1>
            <FavoriteButton type="METIER" entityId={metier.id} className="shrink-0 scale-110 active:scale-95 transition-transform" />
          </div>

          {metier.autresAppellations?.length > 0 && (
            <p className="text-sm text-slate-350 font-medium italic">
              Aussi appelé : {metier.autresAppellations.join(', ')}
            </p>
          )}
        </div>
      </section>

      {/* ── En bref : résumé compact ── */}
      <div className="flex flex-wrap gap-2">
        {metier.niveauRequis && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200">
            🎓 {metier.niveauRequis}
          </span>
        )}
        {metier.seriesBacMadagascar.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200">
            📜 Bac recommandé {metier.seriesBacMadagascar.join(' / ')}
          </span>
        )}
        {hasSalaire && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200">
            💰 {formatSalaryCompact(metier.salaireMin)} – {formatSalaryCompact(metier.salaireMax)} Ar/m.
          </span>
        )}
        {hasRiasec && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-300">
            🧭 RIASEC {metier.riasecCodes!.join(' · ')}
          </span>
        )}
      </div>

      {/* ══════════════ EN QUOI CONSISTE CE MÉTIER ══════════════ */}
      {metier.description && (
        <SectionCard icon="💼" title="En quoi consiste ce métier au quotidien ?">
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {metier.description}
          </p>
        </SectionCard>
      )}

      {/* ══════════════ MISSIONS PRINCIPALES ══════════════ */}
      {hasMissions && (
        <SectionCard icon="📋" title="Missions principales">
          <ul className="text-slate-700 dark:text-slate-300 text-sm list-disc list-inside space-y-2 leading-relaxed">
            {metier.missions.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </SectionCard>
      )}

      {/* ══════════════ PROFIL & COMPÉTENCES REQUISES ══════════════ */}
      <SectionCard icon="🧭" title="Profil & Compétences requises" twoCol>
        {hasCompetences && (
          <Field label="Compétences techniques">
            <TagList items={metier.competences as unknown as string[]} />
          </Field>
        )}

        {metier.competencesComportementales?.length > 0 && (
          <Field label="Compétences comportementales / soft skills">
            <TagList items={metier.competencesComportementales} />
          </Field>
        )}

        {metier.languesRequises?.length > 0 && (
          <Field label="Langues requises">
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              {metier.languesRequises.join(', ')}
              {metier.niveauLangues && ` (${metier.niveauLangues})`}
            </p>
          </Field>
        )}

        {hasRiasec && (
          <Field label="Code RIASEC" subtitle="Le profil d'intérêts (test RIASEC) associé à ce métier.">
            <div className="flex flex-wrap gap-1.5">
              {metier.riasecCodes!.map((code) => (
                <span
                  key={code}
                  className="px-3 py-1 bg-blue-500/10 border border-blue-500/25 rounded-full text-xs font-bold text-blue-600 dark:text-blue-300"
                >
                  {code} · {RIASEC_LABELS[code] ?? code}
                </span>
              ))}
            </div>
          </Field>
        )}

        {hasTraits && (
          <Field label="Traits de personnalité recherchés" subtitle="Le profil qui s'épanouit naturellement dans ce métier.">
            <TagList items={metier.traitsPersonnalite} />
          </Field>
        )}

        {metier.valeursProfessionnelles?.length > 0 && (
          <Field label="Valeurs professionnelles">
            <TagList items={metier.valeursProfessionnelles} />
          </Field>
        )}

        {metier.centresInteret?.length > 0 && (
          <Field label="Centres d'intérêt typiques">
            <TagList items={metier.centresInteret} />
          </Field>
        )}

        {metier.profilIntroExtraverti && (
          <Field label="Adéquation introverti / extraverti" wide>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{metier.profilIntroExtraverti}</p>
          </Field>
        )}
      </SectionCard>

      {/* ══════════════ OÙ L'EXERCER ══════════════ */}
      {hasExercice && (
        <SectionCard icon="🏞️" title="Où l'exercer ?" twoCol>
          {metier.environnementTravail?.length > 0 && (
            <Field label="Environnement de travail">
              <TagList items={metier.environnementTravail} />
              {metier.environnementAutre && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">{metier.environnementAutre}</p>
              )}
            </Field>
          )}

          {metier.secteursActivite?.length > 0 && (
            <Field label="Secteurs d'activité">
              <TagList items={metier.secteursActivite} />
            </Field>
          )}

          {(metier.typeContrat?.length > 0 || metier.volumeHoraire?.length > 0) && (
            <Field label="Type de contrat & volume horaire">
              {metier.typeContrat?.length > 0 && <TagList items={metier.typeContrat} />}
              {metier.volumeHoraire?.length > 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">{metier.volumeHoraire.join(' · ')}</p>
              )}
            </Field>
          )}

          {metier.regionsPresence?.length > 0 && (
            <Field label="Régions de présence">
              <TagList items={metier.regionsPresence} />
            </Field>
          )}

          {metier.employeurs?.length > 0 && (
            <Field label="Principaux employeurs" wide>
              <TagList items={metier.employeurs} />
            </Field>
          )}
        </SectionCard>
      )}

      {/* ══════════════ FORMATIONS LOCALES RECOMMANDÉES ══════════════ */}
      {hasFormations && (
        <SectionCard icon="🎓" title="Formations locales recommandées à Madagascar">
          {(metier.niveauRequis || metier.specialiteDiplome) && (
            <Field label="Diplôme & niveau requis">
              {metier.niveauRequis && (
                <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">{metier.niveauRequis}</p>
              )}
              {metier.specialiteDiplome && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Spécialité : {metier.specialiteDiplome}</p>
              )}
            </Field>
          )}

          {metier.seriesBacMadagascar.length > 0 && (
            <Field label="Séries de Bac recommandées">
              <TagList items={metier.seriesBacMadagascar} />
            </Field>
          )}

          {metier.formationsMadagascar?.length > 0 && (
            <Field label="Établissements & filières">
              <ul className="text-slate-700 dark:text-slate-300 text-sm list-disc list-inside space-y-1.5 leading-relaxed">
                {metier.formationsMadagascar.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </Field>
          )}

          {metier.certifications?.length > 0 && (
            <Field label="Certifications valorisées">
              <TagList items={metier.certifications} />
            </Field>
          )}

          {metier.autoFormation && (
            <Field label="Accès par auto-formation">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{metier.autoFormation}</p>
            </Field>
          )}
        </SectionCard>
      )}

      {/* ══════════════ RÉMUNÉRATION & DÉBOUCHÉS RÉELS ══════════════ */}
      {hasRemuneration && (
        <SectionCard icon="💰" title="Rémunération & Débouchés réels à Madagascar">
          {hasSalaire && (
            <Field label="Salaire estimé">
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                {metier.salaireMin?.toLocaleString('fr-FR') ?? '?'} à {metier.salaireMax?.toLocaleString('fr-FR') ?? '?'} Ar net / mois.
              </p>
              {metier.salaireSource && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 italic">Source : {metier.salaireSource}</p>
              )}
            </Field>
          )}

          {metier.niveauDemande && (
            <Field label="Demande sur le marché malgache">
              <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">{metier.niveauDemande}</p>
            </Field>
          )}

          {(metier.perspectivesEmploi || metier.postesEvolution || metier.etapesEvolution?.length > 0 || metier.mobiliteInternationale) && (
            <Field label="Perspectives d'évolution">
              <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {metier.perspectivesEmploi && <p>{metier.perspectivesEmploi}</p>}

                {metier.etapesEvolution?.length > 0 ? (
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block mb-2">Évolution hiérarchique</span>
                    <EvolutionCarriere etapes={metier.etapesEvolution} candidates={allMetiers ?? []} />
                  </div>
                ) : (
                  metier.postesEvolution && (
                    <p>
                      <span className="font-semibold text-slate-900 dark:text-white">Évolution hiérarchique : </span>
                      {metier.postesEvolution}
                    </p>
                  )
                )}

                {metier.mobiliteInternationale && (
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-white">Mobilité internationale : </span>
                    {metier.mobiliteInternationale}
                  </p>
                )}
              </div>
            </Field>
          )}

          {metier.tendances?.length > 0 && (
            <Field label="Tendances du secteur">
              <TagList items={metier.tendances} />
            </Field>
          )}
        </SectionCard>
      )}

      {/* ══════════════ AVANTAGES & CONTRAINTES DU MÉTIER ══════════════ */}
      {hasAvantagesContraintes && (
        <SectionCard icon="⚖️" title="Avantages & Contraintes du métier" twoCol>
          <div>
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-2">✓ Points forts</h3>
            {metier.avantages ? (
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{metier.avantages}</p>
            ) : (
              <p className="text-slate-400 text-sm italic">Non renseigné.</p>
            )}
          </div>
          <div>
            <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm mb-2">⚠ Contraintes</h3>
            {hasPenibilite ? (
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1.5">
                {metier.penibilitePhysique != null && (
                  <li>Physique / effort corporel : <span className="font-semibold">{penibiliteLabel(metier.penibilitePhysique)}</span></li>
                )}
                {metier.penibiliteStress != null && (
                  <li>Stress et pression : <span className="font-semibold">{penibiliteLabel(metier.penibiliteStress)}</span></li>
                )}
                {metier.penibiliteRisques != null && (
                  <li>Risques professionnels : <span className="font-semibold">{penibiliteLabel(metier.penibiliteRisques)}</span></li>
                )}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm italic">Non renseigné.</p>
            )}
          </div>
        </SectionCard>
      )}

      {/* Métiers similaires */}
      {metier.similaires && metier.similaires.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-black/5 dark:border-white/5 pb-2 mb-4">
            🔄 Autres métiers à découvrir
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {metier.similaires.map((m) => (
              <Link
                key={m.id}
                to={`/metiers/${m.slug}`}
                className="px-4 py-2 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/8 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-slate-950 dark:hover:text-white transition-all duration-200"
              >
                {m.nom}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
