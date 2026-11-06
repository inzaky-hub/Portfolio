import { useState } from 'react';

interface SkillItemData {
  name: string;
  level: string;
}

interface SkillRackCardProps {
  category: string;
  items: SkillItemData[];
  reducedMotion: boolean;
}

const SkillRackCard = ({ category, items, reducedMotion }: SkillRackCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={[
        'bg-[#111827] border border-[rgba(0,229,255,0.2)] rounded-xl p-6 overflow-hidden',
        'transition-all duration-200 group',
        'hover:border-[#00E5FF] hover:shadow-[0_0_24px_rgba(0,229,255,0.25)] hover:-translate-y-1',
      ].join(' ')}
      style={{
        minHeight: '80px',
        minWidth: '200px',
      }}
    >
      {/* Card header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-lg mb-4"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] flex-shrink-0"
            aria-hidden="true"
          />
          <h3 className="font-sans text-xl font-bold text-[#00E5FF] uppercase tracking-[0.05em]">
            {category}
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF]/80">
          <span className="px-2.5 py-0.5 rounded-full bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)]">
            {items.length}
          </span>
          <span
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expandable skill list — CSS max-height transition for 300ms */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: expanded ? `${items.length * 48 + 24}px` : '0px',
        }}
      >
        <ul className="space-y-1 pt-1" role="list">
          {items.map((item, i) => (
            <li
              key={item.name}
              className={[
                'flex flex-row items-center justify-between py-2 border-b border-white/5 last:border-0',
                reducedMotion ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              ].join(' ')}
              style={{
                animationDelay: reducedMotion ? '0ms' : `${i * 80}ms`,
                opacity: expanded ? 1 : undefined,
              }}
            >
              <span className="font-sans text-sm text-[#F9FAFB]/90 font-medium">
                {item.name}
              </span>
              <span className="font-mono text-xs py-1 px-3 rounded-full bg-[rgba(0,229,255,0.1)] text-[#00E5FF] font-medium border border-[rgba(0,229,255,0.2)] flex-shrink-0">
                {item.level}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SkillRackCard;
