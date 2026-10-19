import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { ar } from './locales/ar'

const resources = {
  en: { translation: en },
  ar: { translation: ar }
}

const initialLang = localStorage.getItem('lang') || 'en'

if (typeof document !== 'undefined') {
  document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = initialLang
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
