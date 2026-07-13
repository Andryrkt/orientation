import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';

export function Profil() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    telephone: user?.telephone ?? '',
    region: user?.profil?.region ?? '',
    adresse: user?.profil?.adresse ?? '',
    photo: user?.profil?.photo ?? '',
    niveauEtude: user?.profil?.niveauEtude ?? '',
    bio: user?.profil?.bio ?? '',
    interets: (user?.profil?.interets ?? []).join(', '),
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await api.patch('/users/me', {
        ...form,
        interets: form.interets.split(',').map((i) => i.trim()).filter(Boolean),
      });
      await refreshUser();
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="page-title">{t('profile.title')}</h1>

      <div className="mb-6 p-5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold">{t('profile.cv_generator_title')}</h3>
        <p className="text-xs text-purple-100 mt-1 leading-relaxed">
          {t('profile.cv_generator_desc')}
        </p>
        <Link
          to="/mon-cv"
          className="inline-block mt-3 px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-xs rounded-lg shadow-sm transition duration-300"
        >
          {t('profile.create_cv_btn')}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-slate-200 rounded-lg p-6">
        {saved && (
          <div className="bg-green-50 text-green-700 text-sm rounded-md px-3 py-2">{t('profile.updated_msg')}</div>
        )}
         <p className="text-sm text-slate-500">{t('profile.email_label')} : {user.email}</p>

        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-2">
          <div className="w-16 h-16 rounded-full bg-slate-200 border border-slate-300 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {form.photo ? (
              <img src={form.photo} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('profile.photo_label')}
            </label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              className="field-input bg-white"
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t('profile.firstname')}</label>
            <input
              className="field-input"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t('profile.lastname')}</label>
            <input
              className="field-input"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t('profile.region')}</label>
            <input
              className="field-input"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t('profile.phone')}</label>
            <input
              className="field-input"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">{t('profile.address')}</label>
          <input
            className="field-input"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">{t('profile.education_level')}</label>
          <input
            className="field-input"
            value={form.niveauEtude}
            onChange={(e) => setForm({ ...form, niveauEtude: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">{t('profile.bio')}</label>
          <textarea
            className="field-input"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            {t('profile.interests')}
          </label>
          <input
            className="field-input"
            value={form.interets}
            onChange={(e) => setForm({ ...form, interets: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? t('profile.saving_btn') : t('profile.save_btn')}
        </button>
      </form>
    </div>
  );
}
