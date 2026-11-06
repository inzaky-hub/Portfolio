import type { BilingualString } from '../types/profile';

export type UIStringKey =
  | 'nav.cover'
  | 'nav.architect'
  | 'nav.superpowers'
  | 'nav.missions'
  | 'nav.askInza'
  | 'error.profileLoad'
  | 'error.sectionUnavailable'
  | 'echo.help'
  | 'echo.error.unknownCommand'
  | 'echo.error.rackRange'
  | 'quickread.label'
  | 'quickread.noSummary'
  | 'tooltip.noMilestone'
  | 'lang.fr'
  | 'lang.en';

export const UI_STRINGS: Record<UIStringKey, BilingualString> = {
  'nav.cover': {
    fr: 'Couverture',
    en: 'Cover',
  },
  'nav.architect': {
    fr: 'Architecte',
    en: 'Architect',
  },
  'nav.superpowers': {
    fr: 'Superpowers',
    en: 'Superpowers',
  },
  'nav.missions': {
    fr: 'Missions',
    en: 'Missions',
  },
  'nav.askInza': {
    fr: 'AskInza',
    en: 'AskInza',
  },
  'error.profileLoad': {
    fr: 'Contenu indisponible. Veuillez recharger la page.',
    en: 'Content unavailable. Please reload the page.',
  },
  'error.sectionUnavailable': {
    fr: 'Cette section est temporairement indisponible.',
    en: 'This section is temporarily unavailable.',
  },
  'echo.help': {
    fr: 'Commandes disponibles : book · rack 1-4 · ask inza · help · mode quick',
    en: 'Available commands: book · rack 1-4 · ask inza · help · mode quick',
  },
  'echo.error.unknownCommand': {
    fr: "Commande inconnue. Tapez 'help' pour voir les commandes disponibles.",
    en: "Unknown command. Type 'help' to see available commands.",
  },
  'echo.error.rackRange': {
    fr: 'Numéro de rack invalide. Utilisez rack 1, rack 2, rack 3 ou rack 4.',
    en: 'Invalid rack number. Use rack 1, rack 2, rack 3, or rack 4.',
  },
  'quickread.label': {
    fr: 'Lecture Rapide',
    en: 'Quick Read',
  },
  'quickread.noSummary': {
    fr: 'Aucun résumé disponible pour cette page.',
    en: 'No summary available for this page.',
  },
  'tooltip.noMilestone': {
    fr: 'Aucun jalon associé',
    en: 'No milestone linked',
  },
  'lang.fr': {
    fr: 'FR',
    en: 'FR',
  },
  'lang.en': {
    fr: 'EN',
    en: 'EN',
  },
};
