import type { ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header/index';
import QuickReadToggleStub from './components/QuickReadToggle/index';
import EchoCenter from './components/EchoCenter/index';
import Cover from './pages/Cover/index';
import Architect from './pages/Architect/index';
import Superpowers from './pages/Superpowers/index';
import Missions from './pages/Missions/index';
import AskInza from './pages/AskInza/index';
import { useTranslation } from './hooks/useTranslation';

// Cast stub to accept props until the full component lands in task 13
const QuickReadToggle = QuickReadToggleStub as ComponentType<{
  active: boolean;
  onToggle: () => void;
  language: 'fr' | 'en';
}>;

function AppShell() {
  const { profileData, profileError, profileLoading, quickReadMode, toggleQuickReadMode, language } = useAppContext();
  const { t } = useTranslation();

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-dc-bg flex items-center justify-center">
        <p className="text-dc-green font-mono text-lg animate-pulse">Initializing datacenter...</p>
      </div>
    );
  }

  if (!profileData && profileError) {
    return (
      <div
        role="alert"
        className="min-h-screen bg-dc-bg flex flex-col items-center justify-center gap-4 text-center px-4"
      >
        <p className="text-dc-amber font-mono text-xl">{t('error.profileLoad')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-dc-green text-dc-green font-mono hover:bg-dc-green hover:text-dc-bg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dc-green"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dc-bg text-[#F9FAFB] relative selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      <div className="scanline-overlay" aria-hidden="true" />
      <Header />
      <QuickReadToggle active={quickReadMode} onToggle={toggleQuickReadMode} language={language} />
      <Routes>
        <Route path="/" element={<Cover />} />
        <Route path="/architect" element={<Architect />} />
        <Route path="/superpowers" element={<Superpowers />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/ask" element={<AskInza />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <EchoCenter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
