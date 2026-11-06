import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useProfileData } from '../hooks/useProfileData';
import type { ProfileData, ProfileValidationError } from '../types/profile';

export interface AppState {
  // Data
  profileData: ProfileData | null;
  profileError: ProfileValidationError | null;
  profileLoading: boolean;

  // Language
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;

  // Quick-read
  quickReadMode: boolean;
  toggleQuickReadMode: () => void;
  savedScrollOffset: number;

  // Echo Center
  echoCollapsed: boolean;
  toggleEchoCollapsed: () => void;
  echoHistory: string[];
  pushEchoCommand: (cmd: string) => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useAppContext(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { data: profileData, error: profileError, loading: profileLoading } = useProfileData();

  // Language — persisted in localStorage, default 'fr'
  const [language, setLanguageState] = useState<'fr' | 'en'>(() => {
    const stored = localStorage.getItem('lang');
    return stored === 'en' ? 'en' : 'fr';
  });

  const setLanguage = useCallback((lang: 'fr' | 'en') => {
    localStorage.setItem('lang', lang);
    setLanguageState(lang);
  }, []);

  // Quick-read mode
  const [quickReadMode, setQuickReadMode] = useState(false);
  const [savedScrollOffset, setSavedScrollOffset] = useState(0);

  const toggleQuickReadMode = useCallback(() => {
    setQuickReadMode((prev) => {
      if (!prev) {
        // Activating: save current scroll position
        setSavedScrollOffset(window.scrollY);
      } else {
        // Deactivating: restore scroll position
        const offset = savedScrollOffset;
        requestAnimationFrame(() => {
          window.scrollTo({ top: offset, behavior: 'instant' });
        });
      }
      return !prev;
    });
  }, [savedScrollOffset]);

  // Echo Center collapsed state — persisted in sessionStorage
  const [echoCollapsed, setEchoCollapsed] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('echoCollapsed');
    return stored === 'true';
  });

  const toggleEchoCollapsed = useCallback(() => {
    setEchoCollapsed((prev) => {
      const next = !prev;
      sessionStorage.setItem('echoCollapsed', String(next));
      return next;
    });
  }, []);

  // Echo Center command history — bounded queue of 10, persisted in sessionStorage
  const [echoHistory, setEchoHistory] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('echoHistory');
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  const pushEchoCommand = useCallback((cmd: string) => {
    setEchoHistory((prev) => {
      const next = [...prev, cmd].slice(-10);
      sessionStorage.setItem('echoHistory', JSON.stringify(next));
      return next;
    });
  }, []);

  // Keep savedScrollOffset in sync when quickReadMode is off
  useEffect(() => {
    if (!quickReadMode) {
      setSavedScrollOffset(0);
    }
  }, [quickReadMode]);

  const value: AppState = {
    profileData,
    profileError,
    profileLoading,
    language,
    setLanguage,
    quickReadMode,
    toggleQuickReadMode,
    savedScrollOffset,
    echoCollapsed,
    toggleEchoCollapsed,
    echoHistory,
    pushEchoCommand,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppProvider;
