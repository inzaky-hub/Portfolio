import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UI_STRINGS } from '../i18n/ui';
import type { UIStringKey } from '../i18n/ui';
import type { BilingualString } from '../types/profile';

export function useTranslation() {
  // Cast to a loose shape so this hook compiles against the current stub
  // AppContext and will still work once AppContext is fully wired.
  const ctx = useContext(AppContext) as { language?: 'fr' | 'en' } | null;
  // Default to 'fr' if context is not yet wired
  const language: 'fr' | 'en' = ctx?.language ?? 'fr';

  /**
   * t(key) — returns the UI string for the given key in the current language.
   * TypeScript enforces key validity at compile time via UIStringKey.
   */
  function t(key: UIStringKey): string {
    return UI_STRINGS[key][language];
  }

  /**
   * tField(field) — resolves a bilingual profil.json field to the current language.
   */
  function tField(field: BilingualString): string {
    return field[language];
  }

  return { t, tField, language };
}

export default useTranslation;
