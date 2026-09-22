import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../lib/theme-context';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { Bourse, CentreFormation, Concours, Emploi, Metier, Paginated, Stage, Universite } from '../lib/types';



/* ── Icônes SVG ── */
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v10a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V5a2 2 0 012-2h4a2 2 0 012 2v1M3 12h18" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V6a1 1 0 011-1h6a1 1 0 011 1v15M4 21h16M12 10h8a1 1 0 011 1v10M8 8h.01M8 12h.01M8 16h.01" />
    </svg>
  );
}
function IconTool() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a4 4 0 10-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2-2 2.5-2.5z" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
    </svg>
  );
}
function IconAward() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a5 5 0 100-10 5 5 0 000 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5" />
    </svg>
  );
}
function IconMegaphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11v2a2 2 0 002 2h1l3 5v-9M3 11l14-6v16l-14-6M18 8a3 3 0 010 6" />
    </svg>
  );
}
function IconGraduationCap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 5-9 5-9-5 9-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5V16c0 1.1 2.7 3 6 3s6-1.9 6-3v-5.5M21 8v6" />
    </svg>
  );
}
function formatSalaryCompact(val: number | null) {
  if (!val) return null;
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val.toString();
}

/* ── Carte d'aperçu d'un métier (page d'accueil) ── */
function MetierPreviewCard({ metier }: { metier: Metier }) {
  const { theme } = useTheme();
  const salaireMin = formatSalaryCompact(metier.salaireMin);
  const salaireMax = formatSalaryCompact(metier.salaireMax);
  return (
    <Link
      to={`/metiers/${metier.slug}`}
      className="group relative block p-6 rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.75)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15, 23, 42, 0.06)',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,163,255,0.5)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLElement).style.boxShadow = theme === 'dark'
          ? '0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(0,163,255,0.25)'
          : '0 20px 40px rgba(15,23,42,0.04), 0 0 30px rgba(0,163,255,0.25)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.06)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.25) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-5 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
        style={{ boxShadow: '0 4px 16px rgba(0,163,255,0.25)' }}
      >
        <IconBriefcase />
      </div>

      {/* Badge domaine */}
      {metier.domaine && (
        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
          style={{
            background: 'rgba(0,163,255,0.25)',
            color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)'
          }}>
          {metier.domaine.nom}
        </span>
      )}

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-200">{metier.nom}</h3>
      {metier.description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{metier.description}</p>
      )}

      <div className="flex items-center justify-between">
        {salaireMin || salaireMax ? (
          <span className="text-xs font-bold" style={{ color: '#00A3FF' }}>
            {salaireMin ?? '?'} – {salaireMax ?? '?'} Ar/m.
          </span>
        ) : <span />}

        {/* Arrow */}
        <div className="flex items-center gap-1 text-xs font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          style={{ color: '#c084fc' }}>
          Découvrir
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/* ── Carte d'aperçu d'un établissement (page d'accueil) ── */
function EtablissementPreviewCard({ universite }: { universite: Universite }) {
  const { theme } = useTheme();
  return (
    <Link
      to={`/universites/${universite.slug}`}
      className="group relative block p-6 rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.75)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15, 23, 42, 0.06)',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.5)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLElement).style.boxShadow = theme === 'dark'
          ? '0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(168,85,247,0.25)'
          : '0 20px 40px rgba(15,23,42,0.04), 0 0 30px rgba(168,85,247,0.25)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.06)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-5 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
        style={{ boxShadow: '0 4px 16px rgba(168,85,247,0.25)' }}
      >
        <IconBuilding />
      </div>

      {/* Badge ville */}
      {universite.ville && (
        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
          style={{
            background: 'rgba(168,85,247,0.25)',
            color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)'
          }}>
          {universite.ville}{universite.region ? `, ${universite.region}` : ''}
        </span>
      )}

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-200">{universite.nom}</h3>
      {universite.description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{universite.description}</p>
      )}

      {/* Arrow */}
      <div className="flex items-center gap-1 text-xs font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        style={{ color: '#c084fc' }}>
        Découvrir
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

/* ── Carte d'aperçu générique pour les onglets Opportunités (formations, stages, bourses) ── */
function OpportunityPreviewCard({
  to, icon: Icon, gradient, glow, badge, title, description, extra,
}: {
  to: string;
  icon: () => ReactNode;
  gradient: string;
  glow: string;
  badge?: string | null;
  title: string;
  description?: string | null;
  extra?: string | null;
}) {
  const { theme } = useTheme();
  return (
    <Link
      to={to}
      className="group relative block p-6 rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.75)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15, 23, 42, 0.06)',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = glow.replace('0.25', '0.5');
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLElement).style.boxShadow = theme === 'dark'
          ? `0 20px 40px rgba(0,0,0,0.4), 0 0 40px ${glow}`
          : `0 20px 40px rgba(15,23,42,0.04), 0 0 30px ${glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.06)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
      />

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
        style={{ boxShadow: `0 4px 16px ${glow}` }}
      >
        <Icon />
      </div>

      {badge && (
        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
          style={{
            background: glow,
            color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)'
          }}>
          {badge}
        </span>
      )}

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-200">{title}</h3>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center justify-between">
        {extra ? <span className="text-xs font-bold" style={{ color: '#00A3FF' }}>{extra}</span> : <span />}

        {/* Arrow */}
        <div className="flex items-center gap-1 text-xs font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          style={{ color: '#c084fc' }}>
          Découvrir
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/* ── Domaine d'expertise (visiteur non connecté) ── */
const DOMAINES_EXPERTISE_KEYS = [
  { emoji: '🎓', key: 'scolaire' },
  { emoji: '🎯', key: 'post_bac' },
  { emoji: '💼', key: 'professionnelle' },
  { emoji: '🔍', key: 'demandeurs_emploi' },
  { emoji: '🚀', key: 'entrepreneuriale' },
  { emoji: '🔄', key: 'transition' },
];

const POURQUOI_NOUS_KEYS = ['ecoute', 'methodes', 'accompagnement', 'cotes'];

/* ── Home Page (visiteur non connecté) ── */
function HomeGuest() {
  const { t } = useTranslation();
  return (
    <div className="space-y-24 pb-12">
      {/* ── Bannière principale ── */}
      <section className="relative overflow-hidden -mx-4 px-4 pt-20 pb-24 text-center">
        <div className="glow-orb w-[600px] h-[600px] -top-48 left-1/2 -translate-x-1/2 animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.18) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -left-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -right-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="gradient-text animate-text-shine">Ton avenir commence aujourd'hui</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            {t('home_guest.hero.text1')}
          </p>
          <p className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home_guest.hero.text2')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary px-7 py-3.5 text-base">
              {t('home_guest.hero.cta_rdv')}
            </Link>
            <Link to="/services" className="btn-secondary px-7 py-3.5 text-base">
              {t('home_guest.hero.cta_services')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Notre mission ── */}
      <section className="max-w-3xl mx-auto text-center">
        <span className="eyebrow mb-2">{t('home_guest.mission.eyebrow')}</span>
        <h2 className="section-title">{t('home_guest.mission.title')}</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
          {t('home_guest.mission.text1')}
        </p>
        <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
          {t('home_guest.mission.text2')}
        </p>
      </section>

      {/* ── Nos domaines d'expertise ── */}
      <section>
        <div className="section-header">
          <span className="eyebrow mb-2">{t('home_guest.domaines.eyebrow')}</span>
          <h2 className="section-title">{t('home_guest.domaines.title')}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {DOMAINES_EXPERTISE_KEYS.map((d) => (
            <div key={d.key} className="glass-card p-6">
              <span className="text-3xl mb-3 block">{d.emoji}</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {t(`home_guest.domaines.items.${d.key}.titre`)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {t(`home_guest.domaines.items.${d.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/services" className="btn-secondary px-6 py-3 text-sm">
            {t('home_guest.domaines.cta')}
          </Link>
        </div>
      </section>

      {/* ── Pourquoi choisir Avenir Assuré ? ── */}
      <section>
        <div className="section-header">
          <span className="eyebrow mb-2">{t('home_guest.pourquoi.eyebrow')}</span>
          <h2 className="section-title">{t('home_guest.pourquoi.title')}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {POURQUOI_NOUS_KEYS.map((key) => (
            <div key={key} className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {t(`home_guest.pourquoi.items.${key}.titre`)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {t(`home_guest.pourquoi.items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Appel à l'action final ── */}
      <section className="relative overflow-hidden -mx-4 px-6 py-20 rounded-[2.5rem] text-center">
        <div className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.15) 0%, rgba(0,163,255,0.1) 50%, rgba(0,240,255,0.1) 100%)' }} />
        <div className="absolute inset-0 -z-10"
          style={{ background: 'rgba(10,8,24,0.5)', backdropFilter: 'blur(2px)' }} />
        <div style={{ border: '1px solid rgba(0,82,255,0.15)' }}
          className="absolute inset-0 -z-10 rounded-[2.5rem]" />

        <div className="glow-orb w-80 h-80 -top-20 left-1/4"
          style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.2) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 -bottom-20 right-1/4"
          style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">
            {t('home_guest.cta_final.title')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            {t('home_guest.cta_final.desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary px-8 py-4 text-base">
              {t('home_guest.cta_final.cta_rdv')}
            </Link>
            <Link to="/contact" className="btn-secondary px-8 py-4 text-base">
              {t('home_guest.cta_final.cta_contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

type OpportuniteTab = 'universites' | 'formations' | 'stages' | 'bourses' | 'emplois' | 'concours';

const OPPORTUNITE_TAB_KEYS: { key: OpportuniteTab; ready: boolean }[] = [
  { key: 'universites', ready: true },
  { key: 'formations', ready: true },
  { key: 'stages', ready: true },
  { key: 'bourses', ready: true },
  { key: 'emplois', ready: true },
  { key: 'concours', ready: true },
];

/* ── Home Page (utilisateur connecté) ── */
function HomePlatform() {
  const { t } = useTranslation();
  const [opportuniteTab, setOpportuniteTab] = useState<OpportuniteTab>('universites');

  const { data: metiersPreview } = useQuery({
    queryKey: ['home-metiers-preview'],
    queryFn: async () => (await api.get<Paginated<Metier>>('/metiers', { params: { limit: 6 } })).data,
  });

  const { data: etablissementsPreview } = useQuery({
    queryKey: ['home-etablissements-preview'],
    queryFn: async () => (await api.get<Paginated<Universite>>('/universites', { params: { limit: 6 } })).data,
  });

  const { data: formationsPreview } = useQuery({
    queryKey: ['home-formations-preview'],
    queryFn: async () => (await api.get<Paginated<CentreFormation>>('/centres-formation', { params: { limit: 6 } })).data,
  });

  const { data: stagesPreview } = useQuery({
    queryKey: ['home-stages-preview'],
    queryFn: async () => (await api.get<Paginated<Stage>>('/stages', { params: { limit: 6 } })).data,
  });

  const { data: boursesPreview } = useQuery({
    queryKey: ['home-bourses-preview'],
    queryFn: async () => (await api.get<Paginated<Bourse>>('/bourses', { params: { limit: 6 } })).data,
  });

  const { data: emploisPreview } = useQuery({
    queryKey: ['home-emplois-preview'],
    queryFn: async () => (await api.get<Paginated<Emploi>>('/emplois', { params: { limit: 6, actifs: 'true' } })).data,
  });

  const { data: concoursPreview } = useQuery({
    queryKey: ['home-concours-preview'],
    queryFn: async () => (await api.get<Paginated<Concours>>('/concours', { params: { limit: 6, actifs: 'true' } })).data,
  });

  const STEPS = [
    { title: t('home.steps.step1.title'), desc: t('home.steps.step1.desc'), num: '01' },
    { title: t('home.steps.step2.title'), desc: t('home.steps.step2.desc'), num: '02' },
    { title: t('home.steps.step3.title'), desc: t('home.steps.step3.desc'), num: '03' },
    { title: t('home.steps.step4.title'), desc: t('home.steps.step4.desc'), num: '04' },
    { title: t('home.steps.step5.title'), desc: t('home.steps.step5.desc'), num: '05' },
    { title: t('home.steps.step6.title'), desc: t('home.steps.step6.desc'), num: '06' },
  ];

  const STEP_GRADIENTS = [
    'linear-gradient(135deg,#0052FF,#00A3FF)',
    'linear-gradient(135deg,#00A3FF,#00F0FF)',
    'linear-gradient(135deg,#00F0FF,#34d399)',
    'linear-gradient(135deg,#34d399,#a78bfa)',
    'linear-gradient(135deg,#a78bfa,#f472b6)',
    'linear-gradient(135deg,#f472b6,#fb923c)',
  ];

  return (
    <div className="space-y-24 pb-12">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden -mx-4 px-4 pt-20 pb-24 text-center">
        {/* Background glows */}
        <div className="glow-orb w-[600px] h-[600px] -top-48 left-1/2 -translate-x-1/2 animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.18) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -left-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 top-10 -right-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold transition-all duration-300 hover:border-blue-500/50"
            style={{
              background: 'rgba(0,163,255,0.12)',
              border: '1px solid rgba(0,163,255,0.25)',
              color: '#00A3FF',
              boxShadow: '0 0 15px rgba(0,163,255,0.1)',
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {t('footer.copyright')}
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="text-slate-900 dark:text-white">{t('home.hero_title_gradient')}</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.hero_subtitle')}
          </p>

          {/* CTA : on commence par le bilan — l'exploration des métiers a sa propre section plus bas */}
          <div className="flex justify-center mb-10">
            <Link to="/questionnaire" className="btn-primary px-7 py-3.5 text-base">
              {t('home.take_test_btn')}
            </Link>
          </div>

          {/* Indication qu'il faut continuer en bas de page */}
          <div className="flex justify-center animate-bounce" aria-hidden="true">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Exploration des métiers ── */}
      <section>
        <div className="section-header">
          <span className="eyebrow mb-2">{t('home.explore_section_eyebrow')}</span>
          <h2 className="section-title">{t('home.explore_section_title')}</h2>
          <p className="section-subtitle">{t('home.explore_section_desc')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {metiersPreview?.items.map((m) => (
            <MetierPreviewCard key={m.id} metier={m} />
          ))}
        </div>
        <div className="text-center">
          <Link to="/metiers" className="btn-secondary px-7 py-3.5 text-base">
            {t('home.explore_section_cta')}
          </Link>
        </div>
      </section>

      {/* Petite flèche indiquant la continuité vers la section suivante */}
      <div className="flex justify-center animate-bounce" aria-hidden="true">
        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* ── Exploration des établissements et des opportunités ── */}
      <section>
        <div className="section-header">
          <span className="eyebrow mb-2">{t('home.explore_etablissements_eyebrow')}</span>
          <h2 className="section-title">{t('home.explore_etablissements_title')}</h2>
          <p className="section-subtitle">{t('home.explore_etablissements_desc')}</p>
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {OPPORTUNITE_TAB_KEYS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setOpportuniteTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                opportuniteTab === tab.key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/15 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {t(`home.opportunites_tabs.${tab.key}`)}
              {!tab.ready && <span className="ml-1.5 opacity-70">{t('home.opportunites_tabs.soon')}</span>}
            </button>
          ))}
        </div>

        {opportuniteTab === 'universites' && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {etablissementsPreview?.items.map((u) => (
                <EtablissementPreviewCard key={u.id} universite={u} />
              ))}
            </div>
            <div className="text-center">
              <Link to="/etablissements" className="btn-secondary px-7 py-3.5 text-base">
                {t('home.explore_etablissements_cta')}
              </Link>
            </div>
          </>
        )}

        {opportuniteTab === 'formations' && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {formationsPreview?.items.map((c) => (
                <OpportunityPreviewCard
                  key={c.id}
                  to={`/centres-formation/${c.slug}`}
                  icon={IconTool}
                  gradient="from-rose-500 to-orange-500"
                  glow="rgba(244,63,94,0.25)"
                  badge={c.ville ? `${c.ville}${c.region ? `, ${c.region}` : ''}` : null}
                  title={c.nom}
                />
              ))}
            </div>
            <div className="text-center">
              <Link to="/etablissements" className="btn-secondary px-7 py-3.5 text-base">
                {t('home.explore_formations_cta')}
              </Link>
            </div>
          </>
        )}

        {opportuniteTab === 'stages' && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {stagesPreview?.items.map((s) => (
                <OpportunityPreviewCard
                  key={s.id}
                  to={`/stages/${s.id}`}
                  icon={IconCalendar}
                  gradient="from-sky-500 to-blue-500"
                  glow="rgba(56,189,248,0.25)"
                  badge={s.entreprise}
                  title={s.titre}
                  description={s.description}
                  extra={s.region}
                />
              ))}
            </div>
            <div className="text-center">
              <Link to="/stages" className="btn-secondary px-7 py-3.5 text-base">
                {t('home.explore_stages_cta')}
              </Link>
            </div>
          </>
        )}

        {opportuniteTab === 'bourses' && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {boursesPreview?.items.map((b) => (
                <OpportunityPreviewCard
                  key={b.id}
                  to={`/bourses/${b.id}`}
                  icon={IconAward}
                  gradient="from-amber-500 to-yellow-500"
                  glow="rgba(245,158,11,0.25)"
                  badge={b.organisme}
                  title={b.nom}
                  description={b.conditions}
                  extra={b.montant}
                />
              ))}
            </div>
            <div className="text-center">
              <Link to="/bourses" className="btn-secondary px-7 py-3.5 text-base">
                {t('home.explore_bourses_cta')}
              </Link>
            </div>
          </>
        )}

        {opportuniteTab === 'emplois' && (
          <>
            {emploisPreview?.items.length === 0 && (
              <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center mx-auto mb-4 text-white">
                  <IconMegaphone />
                </div>
                <p className="font-bold text-slate-800 dark:text-white mb-1">{t('home.opportunites_emplois_title')}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                  {t('home.opportunites_emplois_desc')}
                </p>
              </div>
            )}
            {emploisPreview && emploisPreview.items.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {emploisPreview.items.map((e) => (
                    <OpportunityPreviewCard
                      key={e.id}
                      to={`/emplois/${e.id}`}
                      icon={IconMegaphone}
                      gradient="from-amber-500 to-orange-500"
                      glow="rgba(245,158,11,0.25)"
                      badge={e.entreprise}
                      title={e.titre}
                      description={e.description}
                      extra={e.region}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/emplois" className="btn-secondary px-7 py-3.5 text-base">
                    {t('home.explore_emplois_cta')}
                  </Link>
                </div>
              </>
            )}
          </>
        )}

        {opportuniteTab === 'concours' && (
          <>
            {concoursPreview?.items.length === 0 && (
              <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 text-white">
                  <IconGraduationCap />
                </div>
                <p className="font-bold text-slate-800 dark:text-white mb-1">{t('home.opportunites_concours_title')}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                  {t('home.opportunites_concours_desc')}
                </p>
              </div>
            )}
            {concoursPreview && concoursPreview.items.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {concoursPreview.items.map((c) => (
                    <OpportunityPreviewCard
                      key={c.id}
                      to={`/concours/${c.id}`}
                      icon={IconGraduationCap}
                      gradient="from-violet-500 to-indigo-500"
                      glow="rgba(139,92,246,0.25)"
                      badge={c.type === 'UNIVERSITAIRE' ? 'Universitaire' : 'Administratif'}
                      title={c.titre}
                      description={c.description}
                      extra={c.region}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/concours" className="btn-secondary px-7 py-3.5 text-base">
                    {t('home.explore_concours_cta')}
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* ── Steps ── */}
      <section>
        <div className="section-header">
          <span className="eyebrow mb-2">{t('home.how_it_works_eyebrow')}</span>
          <h2 className="section-title">{t('home.how_it_works_title')}</h2>
          <p className="section-subtitle">{t('home.how_it_works_subtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center group">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-black text-white group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: STEP_GRADIENTS[i % STEP_GRADIENTS.length],
                  boxShadow: `0 4px 20px rgba(0,163,255,${0.3 - (i % 3) * 0.05})`,
                }}
              >
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden -mx-4 px-6 py-20 rounded-[2.5rem] text-center">
        {/* Background */}
        <div className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.15) 0%, rgba(0,163,255,0.1) 50%, rgba(0,240,255,0.1) 100%)' }} />
        <div className="absolute inset-0 -z-10"
          style={{ background: 'rgba(10,8,24,0.5)', backdropFilter: 'blur(2px)' }} />
        <div style={{ border: '1px solid rgba(0,82,255,0.15)' }}
          className="absolute inset-0 -z-10 rounded-[2.5rem]" />

        {/* Glows */}
        <div className="glow-orb w-80 h-80 -top-20 left-1/4"
          style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.2) 0%, transparent 70%)' }} />
        <div className="glow-orb w-80 h-80 -bottom-20 right-1/4"
          style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">
            {t('home.cta_title')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            {t('home.cta_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary px-8 py-4 text-base">
              {t('home.cta_btn_rdv')}
            </Link>
            <Link to="/mon-espace" className="btn-secondary px-8 py-4 text-base">
              {t('home.cta_btn_myspace')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Home Page ── */
export function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  return user ? <HomePlatform /> : <HomeGuest />;
}
