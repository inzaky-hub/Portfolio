import LanguageToggle from '../LanguageToggle';

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0E1A]/85 backdrop-blur-[12px] border-b border-[rgba(0,229,255,0.2)] flex items-center justify-between px-6 md:px-12">
    <div className="font-sans font-bold text-xl tracking-[0.1em] text-[#00E5FF] flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
      INZA
    </div>
    <LanguageToggle />
  </header>
);

export default Header;
