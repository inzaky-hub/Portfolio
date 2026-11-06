import { useAppContext } from '../../context/AppContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useAppContext();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center rounded-full border border-[rgba(0,229,255,0.3)] p-1 bg-[#111827]/90 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 text-xs font-mono font-semibold rounded-full transition-all duration-200 ${
          language === 'fr'
            ? 'bg-[#00E5FF] text-[#0A0E1A] shadow-[0_0_12px_rgba(0,229,255,0.5)] font-bold'
            : 'text-[#9CA3AF] hover:text-[#00E5FF]'
        }`}
        aria-pressed={language === 'fr'}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-mono font-semibold rounded-full transition-all duration-200 ${
          language === 'en'
            ? 'bg-[#00E5FF] text-[#0A0E1A] shadow-[0_0_12px_rgba(0,229,255,0.5)] font-bold'
            : 'text-[#9CA3AF] hover:text-[#00E5FF]'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
