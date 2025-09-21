import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Initialize i18next with configuration
i18n
  .use(Backend) // Load translations from JSON files
  .use(LanguageDetector) // Detect user language from browser/localStorage
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    // Default language if detection fails
    fallbackLng: 'en',
    
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Backend configuration - where to load translation files
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Language detection configuration
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user's choice in localStorage
      caches: ['localStorage'],
    },

    // Default namespace
    defaultNS: 'translation',
    
    // Available namespaces
    ns: ['translation'],

    // Supported languages
    supportedLngs: ['en', 'pt-BR', 'es'],

    // Don't load a language if it's not in supportedLngs
    nonExplicitSupportedLngs: false,
  });

export default i18n;