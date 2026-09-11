import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  GraduationCap,
  Handshake,
  Headset,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { api } from '../lib/api';

type FormState = {
  nom: string;
  email: string;
  sujet: string;
  message: string;
};

const CONTACT_INFO = [
  {
    icon: MapPin,
    titleKey: 'address_title',
    lines: ['Analamanga, Antananarivo, Madagascar', 'Lot IVT 173 Tsaramasay'],
  },
  {
    icon: Mail,
    titleKey: 'email_title',
    lines: ['contact@avenirassure.mg', 'support@avenirassure.mg'],
  },
  {
    icon: Phone,
    titleKey: 'phone_title',
    lines: ['+261 34 20 685 10'],
    hoursKey: 'phone_hours',
  },
  {
    icon: MessageCircle,
    titleKey: 'social_title',
    lines: ['facebook.com/avenirassure', '@avenirassure'],
  },
];

const SUJET_OPTIONS = [
  'prise_rendez_vous',
  'question_generale',
  'probleme_technique',
  'orientation',
  'partenariat',
  'signalement',
  'autre',
];

const TEAM = [
  { icon: Headset, key: 'support', delay: '0ms', to: '/tickets' },
  { icon: GraduationCap, key: 'orientation', delay: '80ms' },
  { icon: Handshake, key: 'partenariats', delay: '160ms' },
];

export function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>({ nom: '', email: '', sujet: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
    } catch {
      setError(t('contact_page.form.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* ── Lueurs de fond ── */}
      <div
        className="glow-orb w-80 h-80 -top-20 right-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="glow-orb w-72 h-72 bottom-0 left-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.1) 0%, transparent 70%)' }}
      />

      {/* ── Hero Banner ── */}
      <section
        className="relative overflow-hidden px-6 py-14 sm:py-20 rounded-[2rem] mb-12 text-center"
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
            <Mail className="w-3.5 h-3.5" strokeWidth={2.5} /> {t('contact_page.hero.badge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            {t('contact_page.hero.title_pre')}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #0052FF, #00A3FF)' }}
            >
              {t('contact_page.hero.title_highlight')}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            {t('contact_page.hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-5 gap-10 mb-16">
        {/* ── Formulaire ── */}
        <div className="lg:col-span-3">
          <div id="formulaire" className="glass-card p-8 sm:p-10">
            {submitted ? (
              <div className="text-center py-10 animate-fade-in">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'linear-gradient(135deg, #0052FF, #00A3FF)' }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  {t('contact_page.form.success_title')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  {t('contact_page.form.success_desc')}
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ nom: '', email: '', sujet: '', message: '' }); }}
                  className="btn-primary mt-6 px-6 py-2.5 text-sm"
                >
                  {t('contact_page.form.success_btn')}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">{t('contact_page.form.title')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
                  {t('contact_page.form.subtitle')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        {t('contact_page.form.nom_label')} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        className="field-input"
                        placeholder={t('contact_page.form.nom_placeholder')}
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        {t('contact_page.form.email_label')} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        className="field-input"
                        placeholder={t('contact_page.form.email_placeholder')}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('contact_page.form.sujet_label')} <span className="text-rose-400">*</span>
                    </label>
                    <select
                      className="field-input"
                      value={form.sujet}
                      onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                      required
                    >
                      <option value="">{t('contact_page.form.sujet_placeholder')}</option>
                      {SUJET_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {t(`contact_page.form.sujet_options.${key}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('contact_page.form.message_label')} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={6}
                      className="field-input resize-none"
                      placeholder={t('contact_page.form.message_placeholder')}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      minLength={20}
                    />
                    <p className="text-xs text-slate-400 mt-1.5 text-right">
                      {form.message.length} {t('contact_page.form.message_counter')}
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-rose-500 font-medium">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-sm shimmer-btn"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('contact_page.form.submit_loading')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        {t('contact_page.form.submit')}
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* ── Informations de contact ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {CONTACT_INFO.map((info) => (
            <div
              key={info.titleKey}
              className="glass-card p-6 flex items-start gap-4 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.15), rgba(0,163,255,0.15))' }}
              >
                <info.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-1">
                  {t(`contact_page.info.${info.titleKey}`)}
                </p>
                {info.lines.map((line) => (
                  <p key={line} className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {line}
                  </p>
                ))}
                {info.hoursKey && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {t(`contact_page.info.${info.hoursKey}`)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Encart FAQ */}
          <div
            className="glass-card p-6"
            style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.08), rgba(0,163,255,0.06))' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.5} /> {t('contact_page.faq.title')}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('contact_page.faq.desc')}
            </p>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('contact_page.faq.link')}
            </a>
          </div>
        </div>
      </div>

      {/* ── Section Équipe ── */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('contact_page.team.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{t('contact_page.team.subtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TEAM.map((member) => {
            const content = (
              <>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.15), rgba(0,163,255,0.15))' }}
                >
                  <member.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{t(`contact_page.team.${member.key}.name`)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t(`contact_page.team.${member.key}.role`)}
                </p>
              </>
            );
            const className = "glass-card p-6 text-center hover:-translate-y-1 transition-transform duration-300";
            return member.to ? (
              <Link key={member.key} to={member.to} className={className} style={{ animationDelay: member.delay }}>
                {content}
              </Link>
            ) : (
              <div key={member.key} className={className} style={{ animationDelay: member.delay }}>
                {content}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative overflow-hidden -mx-4 px-6 py-16 rounded-[2.5rem] text-center">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.15) 0%, rgba(0,163,255,0.1) 50%, rgba(0,240,255,0.1) 100%)' }}
        />
        <div className="absolute inset-0 -z-10" style={{ background: 'rgba(10,8,24,0.5)', backdropFilter: 'blur(2px)' }} />
        <div style={{ border: '1px solid rgba(0,82,255,0.15)' }} className="absolute inset-0 -z-10 rounded-[2.5rem]" />

        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            {t('contact_page.cta_final.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {t('contact_page.cta_final.desc')}
          </p>
          <a href="#formulaire" className="btn-primary px-8 py-4 text-base inline-block">
            {t('contact_page.cta_final.cta')}
          </a>
        </div>
      </section>
    </div>
  );
}
