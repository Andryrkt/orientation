import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Metier } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

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
  'droit-sciences-politiques': { gradient: 'from-purple-500 to-violet-500', glow: 'rgba(139,92,246,0.3)', text: '#c084fc', bgLight: 'rgba(139,92,246,0.15)' },
  'lettres-sciences-humaines': { gradient: 'from-teal-500 to-emerald-500', glow: 'rgba(20,184,166,0.3)', text: '#34d399', bgLight: 'rgba(20,184,166,0.15)' },
  'arts-communication': { gradient: 'from-fuchsia-500 to-pink-500', glow: 'rgba(217,70,239,0.3)', text: '#e879f9', bgLight: 'rgba(217,70,239,0.15)' },
};

const DEFAULT_COLOR = { gradient: 'from-slate-500 to-slate-600', glow: 'rgba(148,163,184,0.3)', text: '#94a3b8', bgLight: 'rgba(148,163,184,0.15)' };

/* ── Liste de Tags Stylisée (Sombre) ── */
function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span 
          key={item} 
          className="px-3 py-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/8 rounded-full text-xs text-slate-700 dark:text-slate-300 font-semibold hover:border-purple-500 dark:hover:border-purple-500/30 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ── Champ de Contenu Standard ── */
function Field({ label, children, id }: { label: string; children: React.ReactNode; id?: string }) {
  return (
    <div className="glass-card p-5" id={id}>
      <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-black/5 dark:border-white/5 pb-2 mb-3">{label}</h3>
      {children}
    </div>
  );
}

/* ── Composant : Boussole du Métier (Schéma SVG Interactif) ── */
interface BoussoleProps {
  nom: string;
  hasMissions: boolean;
  hasCompetences: boolean;
  hasTraits: boolean;
  hasSalaire: boolean;
}
function BoussoleMetier({ nom, hasMissions, hasCompetences, hasTraits, hasSalaire }: BoussoleProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden flex flex-col items-center">
      {/* Glow effect */}
      {hoveredNode && (
        <div 
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-40 pointer-events-none transition-all duration-500 animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${
              hoveredNode === 'missions' ? 'rgba(168,85,247,0.4)' :
              hoveredNode === 'competences' ? 'rgba(34,211,238,0.4)' :
              hoveredNode === 'traits' ? 'rgba(236,72,153,0.4)' : 'rgba(52,211,153,0.4)'
            } 0%, transparent 70%)`
          }}
        />
      )}

      <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-6 text-center">
        Boussole &amp; Structure du Métier
      </h3>
      
      <div className="w-full max-w-[340px] h-[280px] relative">
        <svg viewBox="0 0 400 340" className="w-full h-full">
          {/* Liens en arrière-plan */}
          {hasMissions && (
            <line x1="200" y1="170" x2="200" y2="60" 
              stroke={hoveredNode === 'missions' ? '#a855f7' : 'rgba(255,255,255,0.08)'} 
              strokeWidth={hoveredNode === 'missions' ? '3' : '1.5'} 
              className="transition-all duration-300"
            />
          )}
          {hasCompetences && (
            <line x1="200" y1="170" x2="70" y2="170" 
              stroke={hoveredNode === 'competences' ? '#22d3ee' : 'rgba(255,255,255,0.08)'} 
              strokeWidth={hoveredNode === 'competences' ? '3' : '1.5'}
              className="transition-all duration-300"
            />
          )}
          {hasTraits && (
            <line x1="200" y1="170" x2="330" y2="170" 
              stroke={hoveredNode === 'traits' ? '#ec4899' : 'rgba(255,255,255,0.08)'} 
              strokeWidth={hoveredNode === 'traits' ? '3' : '1.5'}
              className="transition-all duration-300"
            />
          )}
          {hasSalaire && (
            <line x1="200" y1="170" x2="200" y2="280" 
              stroke={hoveredNode === 'salaire' ? '#34d399' : 'rgba(255,255,255,0.08)'} 
              strokeWidth={hoveredNode === 'salaire' ? '3' : '1.5'}
              className="transition-all duration-300"
            />
          )}

          {/* Nœud Central (Métier) */}
          <circle cx="200" cy="170" r="48" fill="rgba(15,12,41,0.95)" stroke="url(#centralGradient)" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.35))' }} />
          <foreignObject x="160" y="140" width="80" height="60">
            <div className="w-full h-full flex items-center justify-center text-center px-1">
              <span className="text-[10px] font-black text-white leading-tight line-clamp-3 select-none">{nom}</span>
            </div>
          </foreignObject>

          {/* Nœud Haut (Missions) */}
          {hasMissions && (
            <g 
              className="cursor-pointer group" 
              onMouseEnter={() => setHoveredNode('missions')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => scrollToSection('section-missions')}
            >
              <circle cx="200" cy="60" r="28" fill="rgba(10,8,24,0.9)" stroke={hoveredNode === 'missions' ? '#a855f7' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" className="transition-all duration-300" />
              <text x="200" y="56" textAnchor="middle" fill={hoveredNode === 'missions' ? '#e9d5ff' : '#94a3b8'} className="text-[16px] select-none transition-colors duration-300">📋</text>
              <text x="200" y="74" textAnchor="middle" fill={hoveredNode === 'missions' ? '#a855f7' : '#64748b'} className="text-[8px] uppercase tracking-wider font-extrabold select-none transition-colors duration-300">Missions</text>
            </g>
          )}

          {/* Nœud Gauche (Compétences) */}
          {hasCompetences && (
            <g 
              className="cursor-pointer group" 
              onMouseEnter={() => setHoveredNode('competences')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => scrollToSection('section-competences')}
            >
              <circle cx="70" cy="170" r="28" fill="rgba(10,8,24,0.9)" stroke={hoveredNode === 'competences' ? '#22d3ee' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" className="transition-all duration-300" />
              <text x="70" y="166" textAnchor="middle" fill={hoveredNode === 'competences' ? '#cffafe' : '#94a3b8'} className="text-[16px] select-none transition-colors duration-300">⚡</text>
              <text x="70" y="184" textAnchor="middle" fill={hoveredNode === 'competences' ? '#22d3ee' : '#64748b'} className="text-[8px] uppercase tracking-wider font-extrabold select-none transition-colors duration-300">Compétences</text>
            </g>
          )}

          {/* Nœud Droite (Traits) */}
          {hasTraits && (
            <g 
              className="cursor-pointer group" 
              onMouseEnter={() => setHoveredNode('traits')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => scrollToSection('section-personnalite')}
            >
              <circle cx="330" cy="170" r="28" fill="rgba(10,8,24,0.9)" stroke={hoveredNode === 'traits' ? '#ec4899' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" className="transition-all duration-300" />
              <text x="330" y="166" textAnchor="middle" fill={hoveredNode === 'traits' ? '#fce7f3' : '#94a3b8'} className="text-[16px] select-none transition-colors duration-300">🧠</text>
              <text x="330" y="184" textAnchor="middle" fill={hoveredNode === 'traits' ? '#ec4899' : '#64748b'} className="text-[8px] uppercase tracking-wider font-extrabold select-none transition-colors duration-300">Profil</text>
            </g>
          )}

          {/* Nœud Bas (Salaire) */}
          {hasSalaire && (
            <g 
              className="cursor-pointer group" 
              onMouseEnter={() => setHoveredNode('salaire')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => scrollToSection('section-salaire')}
            >
              <circle cx="200" cy="280" r="28" fill="rgba(10,8,24,0.9)" stroke={hoveredNode === 'salaire' ? '#34d399' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" className="transition-all duration-300" />
              <text x="200" y="276" textAnchor="middle" fill={hoveredNode === 'salaire' ? '#d1fae5' : '#94a3b8'} className="text-[16px] select-none transition-colors duration-300">💰</text>
              <text x="200" y="294" textAnchor="middle" fill={hoveredNode === 'salaire' ? '#34d399' : '#64748b'} className="text-[8px] uppercase tracking-wider font-extrabold select-none transition-colors duration-300">Salaire</text>
            </g>
          )}

          <defs>
            <linearGradient id="centralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p className="text-[10px] text-slate-500 italic text-center mt-3 select-none">
        * Astuce : Survolez et cliquez sur les nœuds pour naviguer.
      </p>
    </div>
  );
}

/* ── Composant : Barres de Niveaux de Compétences ── */
interface SkillProps {
  title: string;
  items: string[];
  color?: 'cyan' | 'purple' | 'pink';
  id?: string;
}
function VisualSkillBars({ title, items, color = 'cyan', id }: SkillProps) {
  const getLevel = (name: string, index: number) => {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return 65 + ((sum + index * 17) % 31); 
  };

  const colorConfig = {
    cyan: { bar: 'from-cyan-500 to-indigo-500', glow: 'rgba(34,211,238,0.2)', text: 'text-cyan-400' },
    purple: { bar: 'from-purple-500 to-indigo-500', glow: 'rgba(168,85,247,0.2)', text: 'text-purple-400' },
    pink: { bar: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.2)', text: 'text-pink-400' },
  }[color];

  return (
    <div className="glass-card p-5 space-y-4" id={id}>
      <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-black/5 dark:border-white/5 pb-2">{title}</h3>
      <div className="space-y-3.5">
        {items.map((item, index) => {
          const level = getLevel(item, index);
          return (
            <div key={item} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{item}</span>
                <span className={colorConfig.text}>{level}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${colorConfig.bar} transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${level}%`,
                    boxShadow: `0 0 10px ${colorConfig.glow}`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Composant : Jauge de Salaire Estimé ── */
interface SalaireProps {
  min: number;
  max: number;
  source?: string;
  id?: string;
}
function JaugeSalaire({ min, max, source, id }: SalaireProps) {
  return (
    <div className="glass-card p-5 space-y-4" id={id}>
      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">💰 Salaire Estimé</h3>
        <span className="badge">Mensuel</span>
      </div>
      
      <div className="space-y-6 pt-2">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Minimum</p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-200">{min.toLocaleString('fr-FR')} Ar</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Maximum</p>
            <p className="text-lg font-black text-purple-600 dark:text-purple-300">{max.toLocaleString('fr-FR')} Ar</p>
          </div>
        </div>

        <div className="relative pt-1">
          <div className="h-3 w-full bg-white/5 rounded-full relative overflow-hidden">
            <div 
              className="absolute h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              style={{
                left: '15%',
                right: '15%'
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-2">
            <span>Débutant</span>
            <span>Confirmé</span>
            <span>Expert</span>
          </div>
        </div>
      </div>

      {source && (
        <p className="text-[10px] text-slate-500 italic text-right pt-2 border-t border-white/5">
          Source : {source}
        </p>
      )}
    </div>
  );
}

export function MetierDetail() {
  const { slug } = useParams();
  const { data: metier, isLoading } = useQuery({
    queryKey: ['metier', slug],
    queryFn: async () => (await api.get<Metier>(`/metiers/${slug}`)).data,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center gap-3 text-slate-400 py-16">
      <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      Chargement de la fiche métier...
    </div>
  );
  
  if (!metier) return <p className="text-slate-400 py-16 text-center">Métier introuvable.</p>;

  const hasTemoignage = metier.temoignageCitation || metier.temoignageCePlait || metier.temoignageConseil;
  const hasMissions = metier.missions && metier.missions.length > 0;
  const hasCompetences = metier.competences && metier.competences.length > 0;
  const hasTraits = metier.traitsPersonnalite && metier.traitsPersonnalite.length > 0;
  const hasSalaire = !!(metier.salaireMin || metier.salaireMax);

  const slugDomaine = metier.domaine?.slug || '';
  const imageUrl = DOMAINE_IMAGES[slugDomaine] || DEFAULT_IMAGE;
  const domainColor = DOMAINE_COLORS[slugDomaine] || DEFAULT_COLOR;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
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

      {/* Description & Boussole interactive */}
      <div className="grid md:grid-cols-5 gap-6 items-start">
        <div className="md:col-span-3 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-black/5 dark:border-white/5 pb-2 mb-3">
              Description du Métier
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {metier.description}
            </p>
          </div>

          {/* Témoignage si existant */}
          {hasTemoignage && (
            <div className="p-6 rounded-2xl border bg-purple-500/5 border-purple-500/15 dark:border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)' }} />
              
              <h3 className="font-bold text-purple-600 dark:text-purple-300 text-sm mb-3 flex items-center gap-2">
                💬 Témoignage de {metier.temoignagePrenom || 'Professionnel'}
                {metier.temoignageAnneesExperience != null &&
                  ` (${metier.temoignageAnneesExperience} ans d'exp.)`}
              </h3>
              {metier.temoignageCitation && (
                <p className="italic text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-3">
                  « {metier.temoignageCitation} »
                </p>
              )}
              {metier.temoignageCePlait && (
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1.5">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Ce qui plaît : </span>
                  {metier.temoignageCePlait}
                </p>
              )}
              {metier.temoignageConseil && (
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Conseil : </span>
                  {metier.temoignageConseil}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Schéma de Représentation (Boussole) */}
        <div className="md:col-span-2">
          <BoussoleMetier 
            nom={metier.nom}
            hasMissions={hasMissions}
            hasCompetences={hasCompetences}
            hasTraits={hasTraits}
            hasSalaire={hasSalaire}
          />
        </div>
      </div>

      {/* Grille de Détails Visuels */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Missions (avec id pour le smooth-scroll) */}
        {hasMissions && (
          <Field label="📋 Missions Principales" id="section-missions">
            <ul className="text-slate-700 dark:text-slate-300 text-sm list-disc list-inside space-y-2 leading-relaxed">
              {metier.missions.map((m) => <li key={m} className="hover:text-slate-950 dark:hover:text-white transition-colors">{m}</li>)}
            </ul>
          </Field>
        )}

        {/* Salaire Jauge */}
        {hasSalaire && (
          <JaugeSalaire 
            min={metier.salaireMin || 0}
            max={metier.salaireMax || 0}
            source={metier.salaireSource}
            id="section-salaire"
          />
        )}

        {/* Compétences Techniques avec Visual Skill Bars */}
        {hasCompetences && (
          <VisualSkillBars 
            title="⚡ Compétences Techniques"
            items={metier.competences as unknown as string[]}
            color="cyan"
            id="section-competences"
          />
        )}

        {/* Traits de personnalité avec Visual Skill Bars */}
        {hasTraits && (
          <VisualSkillBars 
            title="🧠 Profil &amp; Traits de Personnalité"
            items={metier.traitsPersonnalite}
            color="purple"
            id="section-personnalite"
          />
        )}

        {/* Compétences comportementales */}
        {metier.competencesComportementales?.length > 0 && (
          <Field label="🤝 Compétences Comportementales / Soft Skills">
            <TagList items={metier.competencesComportementales} />
          </Field>
        )}

        {/* Valeurs professionnelles */}
        {metier.valeursProfessionnelles?.length > 0 && (
          <Field label="💎 Valeurs Professionnelles">
            <TagList items={metier.valeursProfessionnelles} />
          </Field>
        )}

        {/* Niveau requis */}
        {metier.niveauRequis && (
          <Field label="🎓 Diplôme &amp; Niveau requis">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">{metier.niveauRequis}</p>
            {metier.specialiteDiplome && (
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Spécialité : {metier.specialiteDiplome}</p>
            )}
          </Field>
        )}

        {/* Formations à Madagascar */}
        {metier.formationsMadagascar?.length > 0 && (
          <Field label="🇲🇬 Formations à Madagascar">
            <ul className="text-slate-700 dark:text-slate-300 text-sm list-disc list-inside space-y-1.5 leading-relaxed">
              {metier.formationsMadagascar.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </Field>
        )}

        {/* Langues requises */}
        {metier.languesRequises?.length > 0 && (
          <Field label="🗣️ Langues requises">
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              {metier.languesRequises.join(', ')}
              {metier.niveauLangues && ` (${metier.niveauLangues})`}
            </p>
          </Field>
        )}

        {/* Type de contrat */}
        {metier.typeContrat?.length > 0 && (
          <Field label="📄 Type de contrat">
            <TagList items={metier.typeContrat} />
          </Field>
        )}

        {/* Demande */}
        {metier.niveauDemande && (
          <Field label="📈 Demande sur le marché malgache">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">{metier.niveauDemande}</p>
          </Field>
        )}

        {/* Régions */}
        {metier.regionsPresence?.length > 0 && (
          <Field label="📍 Régions de présence">
            <TagList items={metier.regionsPresence} />
          </Field>
        )}

        {/* Employeurs */}
        {metier.employeurs?.length > 0 && (
          <Field label="🏢 Principaux Employeurs">
            <TagList items={metier.employeurs} />
          </Field>
        )}

        {/* Perspectives */}
        {metier.perspectivesEmploi && (
          <div className="md:col-span-2">
            <Field label="🔮 Perspectives d'évolution">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{metier.perspectivesEmploi}</p>
            </Field>
          </div>
        )}
      </div>

      {/* Métiers similaires */}
      {metier.similaires && metier.similaires.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-black/5 dark:border-white/5 pb-2 mb-4">
            🔄 Métiers similaires
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {metier.similaires.map((m) => (
              <Link
                key={m.id}
                to={`/metiers/${m.slug}`}
                className="px-4 py-2 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/8 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-slate-950 dark:hover:text-white transition-all duration-200"
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
