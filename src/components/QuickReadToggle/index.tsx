interface QuickReadToggleProps {
  active: boolean;
  onToggle: () => void;
  language: 'fr' | 'en';
}

const QuickReadToggle = ({ active, onToggle, language }: QuickReadToggleProps) => {
  const label = language === 'fr' ? 'Lecture Rapide' : 'Quick Read';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={`${label} — ${active ? 'on' : 'off'}`}
      className={[
        'fixed right-6 top-20 z-50',
        'flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold',
        'border backdrop-blur-md transition-all duration-200 shadow-lg',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]',
        active
          ? 'bg-[#00E5FF] text-[#0A0E1A] border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)] font-bold'
          : 'bg-[#111827]/90 text-[#9CA3AF] border-[rgba(0,229,255,0.3)] hover:text-[#00E5FF] hover:border-[#00E5FF]',
      ].join(' ')}
    >
      <span aria-hidden="true" className={active ? 'text-[#0A0E1A]' : 'text-[#00E5FF]'}>
        {active ? '✓' : '⚡'}
      </span>
      <span>{label}</span>
    </button>
  );
};

export default QuickReadToggle;
