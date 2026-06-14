import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enPages from './locales/en/pages.json'

import hiCommon from './locales/hi/common.json'
import hiHome from './locales/hi/home.json'
import hiPages from './locales/hi/pages.json'

const LANG_KEY = 'adwa_lang'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        pages: enPages,
      },
      hi: {
        common: hiCommon,
        home: hiHome,
        pages: hiPages,
      },
    },
    lng: localStorage.getItem(LANG_KEY) ?? 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lang) => {
  localStorage.setItem(LANG_KEY, lang)
})

export default i18n
