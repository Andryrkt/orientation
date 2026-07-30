import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    title: 'Adresse',
    lines: ['Analamanga, Antananarivo, Madagascar', 'Lot IVT 173 Tsaramasay'],
  },
  {
    icon: Mail,
    title: 'E-mail',
    lines: ['contact@avenirassure.mg', 'support@avenirassure.mg'],
  },
  {
    icon: Phone,
    title: 'Téléphone',
    lines: ['+261 34 20 685 10', 'Lun – Ven, 8h – 17h'],
  },
  {
    icon: MessageCircle,
    title: 'Réseaux sociaux',
    lines: ['facebook.com/avenirassure', '@avenirassure'],
  },
];

const TEAM = [
  { icon: Headset, name: 'Équipe Support', role: 'Problèmes techniques & Comptes', delay: '0ms' },
  { icon: GraduationCap, name: 'Équipe Orientation', role: 'Conseils & Parcours académiques', delay: '80ms' },
  { icon: Handshake, name: 'Équipe Partenariats', role: 'Collaborations & Institutions', delay: '160ms' },
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
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
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
            <Mail className="w-3.5 h-3.5" strokeWidth={2.5} /> Contactez-nous
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            On est là pour vous{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #0052FF, #00A3FF)' }}
            >
              aider
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Une question sur la plateforme, un problème technique ou un partenariat ? Notre équipe répond dans les 24h.
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-5 gap-10 mb-16">
        {/* ── Formulaire ── */}
        <div className="lg:col-span-3">
          <div className="glass-card p-8 sm:p-10">
            {submitted ? (
              <div className="text-center py-10 animate-fade-in">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'linear-gradient(135deg, #0052FF, #00A3FF)' }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Message envoyé !
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais, généralement sous 24h.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ nom: '', email: '', sujet: '', message: '' }); }}
                  className="btn-primary mt-6 px-6 py-2.5 text-sm"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Envoyer un message</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
                  Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Nom complet <span className="text-rose-400">*</span>
                      </label>
                      <input
                        className="field-input"
                        placeholder="ex : Jean Rabe"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        E-mail <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        className="field-input"
                        placeholder="ex : jean@email.mg"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Sujet <span className="text-rose-400">*</span>
                    </label>
                    <select
                      className="field-input"
                      value={form.sujet}
                      onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                      required
                    >
                      <option value="">— Choisir un sujet —</option>
                      <option value="question_generale">Question générale</option>
                      <option value="probleme_technique">Problème technique</option>
                      <option value="orientation">Conseil en orientation</option>
                      <option value="partenariat">Partenariat / Collaboration</option>
                      <option value="signalement">Signalement de contenu</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={6}
                      className="field-input resize-none"
                      placeholder="Décrivez votre demande en détail..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      minLength={20}
                    />
                    <p className="text-xs text-slate-400 mt-1.5 text-right">{form.message.length} / 20 min.</p>
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
                        Envoi en cours…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Envoyer le message
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
              key={info.title}
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
                  {info.title}
                </p>
                {info.lines.map((line) => (
                  <p key={line} className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Encart FAQ */}
          <div
            className="glass-card p-6"
            style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.08), rgba(0,163,255,0.06))' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.5} /> Consultez notre FAQ
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Avant de nous écrire, vous trouverez peut-être la réponse dans notre guide d'utilisation.
            </p>
            <a
              href="/guide"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Voir le guide →
            </a>
          </div>
        </div>
      </div>

      {/* ── Section Équipe ── */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Notre équipe vous répond</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Des professionnels dévoués à votre orientation</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="glass-card p-6 text-center hover:-translate-y-1 transition-transform duration-300"
              style={{ animationDelay: member.delay }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.15), rgba(0,163,255,0.15))' }}
              >
                <member.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
