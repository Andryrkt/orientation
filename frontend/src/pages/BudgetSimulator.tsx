import { useMemo, useState } from 'react';
import {
  Wallet,
  Home,
  Utensils,
  Bus,
  HeartPulse,
  Smartphone,
  BookOpen,
  PartyPopper,
  PiggyBank,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
} from 'lucide-react';

type Periode = 'MENSUEL' | 'ANNUEL';

interface Categorie {
  id: string;
  label: string;
  def: number;
  max: number;
}

interface CategorieDepense extends Categorie {
  color: string;
  icon: typeof Home;
}

const REVENUS: Categorie[] = [
  { id: 'bourse', label: 'Bourse d\'études', def: 200_000, max: 700_000 },
  { id: 'job', label: 'Job étudiant', def: 300_000, max: 1_200_000 },
  { id: 'famille', label: 'Aide familiale', def: 250_000, max: 800_000 },
  { id: 'apl', label: 'Aide au logement', def: 50_000, max: 400_000 },
  { id: 'autres_rev', label: 'Autres revenus', def: 0, max: 500_000 },
];

const DEPENSES: CategorieDepense[] = [
  { id: 'logement', label: 'Logement (loyer)', def: 450_000, max: 2_000_000, color: '#0052FF', icon: Home },
  { id: 'alimentation', label: 'Alimentation', def: 180_000, max: 500_000, color: '#F97316', icon: Utensils },
  { id: 'transport', label: 'Transport', def: 35_000, max: 150_000, color: '#10B981', icon: Bus },
  { id: 'sante', label: 'Santé & assurance', def: 25_000, max: 150_000, color: '#EAB308', icon: HeartPulse },
  { id: 'telecom', label: 'Téléphone & abonnements', def: 30_000, max: 100_000, color: '#EC4899', icon: Smartphone },
  { id: 'fournitures', label: 'Fournitures scolaires', def: 15_000, max: 150_000, color: '#14B8A6', icon: BookOpen },
  { id: 'loisirs', label: 'Loisirs & sorties', def: 50_000, max: 300_000, color: '#8B5CF6', icon: PartyPopper },
  { id: 'epargne', label: 'Épargne & imprévus', def: 15_000, max: 300_000, color: '#EF4444', icon: PiggyBank },
];

const ALL: Categorie[] = [...REVENUS, ...DEPENSES];

type Preset = Record<string, number>;

const PRESETS: { id: string; label: string; values: Preset }[] = [
  {
    id: 'boursier',
    label: 'Boursier·ère',
    values: {
      bourse: 350_000, job: 150_000, famille: 100_000, apl: 200_000, autres_rev: 0,
      logement: 250_000, alimentation: 200_000, transport: 30_000, sante: 20_000, telecom: 30_000, fournitures: 25_000, loisirs: 40_000, epargne: 15_000,
    },
  },
  {
    id: 'alternance',
    label: 'Alternance / job étudiant',
    values: {
      bourse: 0, job: 900_000, famille: 50_000, apl: 150_000, autres_rev: 0,
      logement: 550_000, alimentation: 220_000, transport: 60_000, sante: 35_000, telecom: 35_000, fournitures: 15_000, loisirs: 80_000, epargne: 40_000,
    },
  },
  {
    id: 'parents',
    label: 'Chez mes parents',
    values: {
      bourse: 100_000, job: 250_000, famille: 150_000, apl: 0, autres_rev: 0,
      logement: 50_000, alimentation: 80_000, transport: 40_000, sante: 20_000, telecom: 25_000, fournitures: 20_000, loisirs: 70_000, epargne: 30_000,
    },
  },
];

function defaultState(): Record<string, number> {
  const s: Record<string, number> = {};
  ALL.forEach((c) => { s[c.id] = c.def; });
  return s;
}

const numberFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const fmtAr = (v: number) => `${numberFmt.format(v)} Ar`;

export function BudgetSimulator() {
  const [values, setValues] = useState<Record<string, number>>(defaultState());
  const [periode, setPeriode] = useState<Periode>('MENSUEL');

  const mult = periode === 'ANNUEL' ? 12 : 1;
  const disp = (v: number) => fmtAr(v * mult);

  function setValue(id: string, v: number) {
    setValues((prev) => ({ ...prev, [id]: Math.max(0, isNaN(v) ? 0 : v) }));
  }

  function applyPreset(preset: Preset) {
    setValues((prev) => ({ ...prev, ...preset }));
  }

  function reset() {
    setValues(defaultState());
  }

  const totalRevenus = useMemo(() => REVENUS.reduce((s, c) => s + values[c.id], 0), [values]);
  const totalDepenses = useMemo(() => DEPENSES.reduce((s, c) => s + values[c.id], 0), [values]);
  const solde = totalRevenus - totalDepenses;
  const soldeThreshold = Math.max(15, totalRevenus * 0.02);

  const ratio = totalRevenus > 0 ? totalDepenses / totalRevenus : totalDepenses > 0 ? 2 : 0;
  const trackMax = 1.25;
  const meterFrac = Math.max(0, Math.min(1, ratio / trackMax));
  const meterColor = ratio > 1 ? '#EF4444' : ratio >= 0.8 ? '#F59E0B' : '#10B981';

  const soldeStatus: 'good' | 'warning' | 'critical' =
    solde < -1 ? 'critical' : solde < soldeThreshold ? 'warning' : 'good';

  const logementRatio = totalRevenus > 0 ? values.logement / totalRevenus : 0;

  const tips: { cls: 'good' | 'warning' | 'critical'; text: React.ReactNode }[] = [];
  if (logementRatio > 0.35) {
    tips.push({
      cls: 'warning',
      text: (
        <>
          <b>Repère logement —</b> le loyer représente {Math.round(logementRatio * 100)} % de vos revenus.
          Au-delà de 35 %, le reste du budget se resserre vite.
        </>
      ),
    });
  }
  if (solde < -1) {
    tips.push({
      cls: 'critical',
      text: (
        <>
          <b>Déficit —</b> {fmtAr(-solde)} manquent chaque mois. Sur une année universitaire (10 mois), cela
          représente {fmtAr(-solde * 10)} à trouver.
        </>
      ),
    });
  } else if (solde < soldeThreshold) {
    tips.push({
      cls: 'warning',
      text: (
        <>
          <b>Marge serrée —</b> le budget est tout juste équilibré ; une dépense imprévue de quelques dizaines
          de milliers d'ariary suffirait à basculer dans le rouge.
        </>
      ),
    });
  } else {
    tips.push({
      cls: 'good',
      text: (
        <>
          <b>Marge confortable —</b> il reste {fmtAr(solde)}/mois, de quoi renforcer une épargne de
          précaution.
        </>
      ),
    });
  }
  if (totalRevenus > 0 && values.alimentation / totalRevenus < 0.1 && values.alimentation < 120) {
    tips.push({
      cls: 'warning',
      text: (
        <>
          <b>Alimentation serrée —</b> {fmtAr(values.alimentation)}/mois est faible ; pensez aux épiceries
          solidaires ou aux restaurants universitaires à tarif réduit pour les boursiers.
        </>
      ),
    });
  }

  const statusStyles = {
    good: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    warning: 'text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10',
    critical: 'text-rose-600 dark:text-rose-400 border-rose-500/40 bg-rose-500/10',
  };
  const tipBorder = {
    good: 'border-emerald-500/50',
    warning: 'border-amber-500/50',
    critical: 'border-rose-500/50',
  };

  return (
    <div className="relative">
      {/* Lueurs de fond */}
      <div
        className="glow-orb w-80 h-80 -top-20 right-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="glow-orb w-72 h-72 bottom-0 left-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.1) 0%, transparent 70%)' }}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 py-14 sm:py-20 rounded-[2rem] mb-10 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(0,163,255,0.12) 0%, rgba(0,82,255,0.08) 50%, rgba(10,8,24,0.4) 100%)',
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
            style={{ background: 'rgba(0,163,255,0.15)', border: '1px solid rgba(0,163,255,0.3)', color: '#00A3FF' }}
          >
            <Wallet className="w-3.5 h-3.5" strokeWidth={2.5} /> Simulateur de budget
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Où va votre argent{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #0052FF, #00A3FF)' }}
            >
              chaque mois
            </span>
            ?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Ajustez vos revenus et dépenses pour voir votre solde en temps réel, et repérez les postes qui
            pèsent le plus sur votre budget d'étudiant.
          </p>
        </div>
      </section>

      {/* Profils rapides */}
      <div className="flex flex-wrap items-center gap-2.5 mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
          Profils rapides
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.values)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border border-dashed border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-solid transition-all duration-200"
          >
            {p.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="inline-flex rounded-full border border-slate-300 dark:border-white/15 overflow-hidden">
          {(['MENSUEL', 'ANNUEL'] as Periode[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                periode === p ? 'bg-blue-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {p === 'MENSUEL' ? 'Mensuel' : 'Annuel'}
            </button>
          ))}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-300 dark:border-white/15 transition-all duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* ── Saisie ── */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center justify-between">
              Revenus
              <span className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">{disp(totalRevenus)}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Montants mensuels, en ariary.</p>
            <div className="space-y-5">
              {REVENUS.map((c) => (
                <RowInput key={c.id} categorie={c} value={values[c.id]} onChange={(v) => setValue(c.id, v)} />
              ))}
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center justify-between">
              Dépenses
              <span className="text-sm font-bold tabular-nums text-rose-500 dark:text-rose-400">{disp(totalDepenses)}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Montants mensuels, en ariary.</p>
            <div className="space-y-5">
              {DEPENSES.map((c) => (
                <RowInput key={c.id} categorie={c} value={values[c.id]} onChange={(v) => setValue(c.id, v)} color={c.color} Icon={c.icon} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Résumé ── */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 sm:p-7 lg:sticky lg:top-24 space-y-7">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Revenus</p>
                <p className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">{disp(totalRevenus)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Dépenses</p>
                <p className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">{disp(totalDepenses)}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Solde</p>
                  <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                    {solde > 0 ? '+' : ''}
                    {disp(solde)}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyles[soldeStatus]}`}>
                  {soldeStatus === 'good' && <TrendingUp className="w-3.5 h-3.5" />}
                  {soldeStatus === 'warning' && <Scale className="w-3.5 h-3.5" />}
                  {soldeStatus === 'critical' && <TrendingDown className="w-3.5 h-3.5" />}
                  {soldeStatus === 'good' ? 'Excédent' : soldeStatus === 'warning' ? 'Équilibré' : 'Déficit'}
                </span>
              </div>
            </div>

            {/* Meter */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                <span>Taux d'utilisation du budget</span>
                <span className="tabular-nums">{Math.round(ratio * 100)} %</span>
              </div>
              <div className="relative h-3 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                  style={{ width: `${meterFrac * 100}%`, background: meterColor }}
                />
                <div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-slate-900 dark:bg-white" style={{ left: `${(1 / trackMax) * 100}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">Dépenses ÷ Revenus — repère à 100 %</p>
            </div>

            {/* Composition */}
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" /> Où va votre argent
              </h3>
              <div className="flex h-6 rounded-lg overflow-hidden gap-[2px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                {DEPENSES.filter((c) => values[c.id] > 0).map((c) => {
                  const pct = totalDepenses > 0 ? (values[c.id] / totalDepenses) * 100 : 0;
                  return (
                    <div
                      key={c.id}
                      title={`${c.label} : ${disp(values[c.id])} (${Math.round(pct)} %)`}
                      style={{ background: c.color, flex: `${pct} ${pct} 0%` }}
                    />
                  );
                })}
              </div>
              <ul className="mt-4 space-y-2">
                {DEPENSES.map((c) => {
                  const pct = totalDepenses > 0 ? (values[c.id] / totalDepenses) * 100 : 0;
                  return (
                    <li key={c.id} className="flex items-center gap-2.5 text-xs">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: c.color }} />
                      <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">{c.label}</span>
                      <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{disp(values[c.id])}</span>
                      <span className="tabular-nums text-slate-400 dark:text-slate-500 w-10 text-right">
                        {totalDepenses > 0 ? `${pct.toFixed(0)}%` : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Conseils */}
            <div className="space-y-2.5 border-t border-slate-200 dark:border-white/8 pt-5">
              {tips.slice(0, 3).map((tip, i) => (
                <p key={i} className={`text-xs leading-relaxed pl-3 border-l-2 text-slate-600 dark:text-slate-300 ${tipBorder[tip.cls]}`}>
                  {tip.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-10">
        Estimation à but pédagogique — ajustez les montants selon votre situation réelle.
      </p>
    </div>
  );
}

function RowInput({
  categorie,
  value,
  onChange,
  color,
  Icon,
}: {
  categorie: Categorie;
  value: number;
  onChange: (v: number) => void;
  color?: string;
  Icon?: typeof Home;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {Icon && color && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} strokeWidth={2.25} />}
          {categorie.label}
        </label>
        <div className="flex items-baseline gap-1 shrink-0">
          <input
            type="number"
            min={0}
            max={Math.max(categorie.max, 5_000_000)}
            step={1000}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`${categorie.label}, montant mensuel en ariary`}
            className="w-24 text-right text-sm font-bold tabular-nums rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <span className="text-xs text-slate-400">Ar</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={categorie.max}
        step={5000}
        value={Math.min(value, categorie.max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}
