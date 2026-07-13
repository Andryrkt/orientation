import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslation from '../locales/fr.json';
import enTranslation from '../locales/en.json';
import mgTranslation from '../locales/mg.json';

const savedLanguage = localStorage.getItem('language') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frTranslation },
      en: { translation: enTranslation },
      mg: { translation: mgTranslation },
    },
    lng: savedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
