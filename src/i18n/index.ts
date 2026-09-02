import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import it from './locales/it.json';

export type SupportedLocale = 'en' | 'it';

const supportedLocales = new Set<SupportedLocale>(['en', 'it']);

function detectLocale(): SupportedLocale {
  const storedLocale = localStorage.getItem('locale');
  if (storedLocale && supportedLocales.has(storedLocale as SupportedLocale)) {
    return storedLocale as SupportedLocale;
  }

  const browserLocale = navigator.language.toLowerCase();
  return browserLocale.startsWith('it') ? 'it' : 'en';
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    it,
  },
});

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
}
