import { useState } from 'react';

export interface ServerUnit {
  id: string;
  label: string;
  milestone?: string;
}

interface ServerRackVizProps {
  units: ServerUnit[];
  reducedMotion: boolean;
  noMilestoneLabel: string;
}

const ServerRackViz = ({ units, noMilestoneLabel }: ServerRackVizProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className="relative flex items-center justify-center p-6 md:p-12 overflow-visible"
      style={{ perspective: '1000px', minWidth: '280px', minHeight: '380px' }}
      aria-label="Server rack visualization"
    >
      {/* Rack chassis with isometric 3D transform */}
      <div
        className="relative border-2 border-[rgba(0,229,255,0.3)] rounded-lg shadow-[0_0_35px_rgba(0,229,255,0.15)] overflow-visible"
        style={{
          background: 'linear-gradient(180deg, #111827 0%, #0A0E1A 100%)',
          minWidth: '260px',
          padding: '14px 10px',
          transform: 'rotateX(45deg) rotateZ(45deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Rack left rail */}
        <div className="absolute left-1.5 top-3 bottom-3 w-1.5 bg-[rgba(0,229,255,0.2)] rounded-full" />
        {/* Rack right rail */}
        <div className="absolute right-1.5 top-3 bottom-3 w-1.5 bg-[rgba(0,229,255,0.2)] rounded-full" />

        {/* Server units */}
        <div className="flex flex-col gap-2 px-2.5">
          {units.map((unit) => {
            const isHovered = hoveredId === unit.id;
            const tooltip = unit.milestone ?? noMilestoneLabel;

            return (
              <div
                key={unit.id}
                data-unit-id={unit.id}
                className="relative group"
                onMouseEnter={() => setHoveredId(unit.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(unit.id)}
                onBlur={() => setHoveredId(null)}
                tabIndex={0}
                role="listitem"
                aria-label={`${unit.label}: ${tooltip}`}
              >
                {/* Server unit body */}
                <div
                  className={[
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-[4px] border transition-all duration-200 cursor-pointer',
                    isHovered
                      ? 'border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)] bg-[#111827]'
                      : 'border-[rgba(0,229,255,0.3)] bg-[#111827] shadow-[inset_0_0_10px_rgba(0,229,255,0.1)]',
                  ].join(' ')}
                  style={{ minHeight: '32px' }}
                >
                  {/* Status LED: 6px circle, background #10B981, box-shadow 0 0 8px #10B981, animation pulse 2s infinite */}
                  <span
                    className="w-[6px] h-[6px] rounded-full flex-shrink-0 bg-[#10B981] shadow-[0_0_8px_#10B981] animate-[pulse_2s_infinite]"
                    aria-hidden="true"
                  />
                  {/* Unit label */}
                  <span className="font-mono text-xs text-[#F9FAFB]/90 truncate flex-1 font-medium">
                    {unit.label}
                  </span>
                  {/* Activity indicator */}
                  <span className="font-mono text-[#00E5FF]/40 text-xs tracking-wider" aria-hidden="true">
                    ▪▪▪
                  </span>
                </div>

                {/* Tooltip — CSS transition ensures <=80ms appearance */}
                <div
                  role="tooltip"
                  className={[
                    'absolute left-full ml-3 top-0 z-30',
                    'w-56 px-3.5 py-2.5 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.8)]',
                    'bg-[#111827] border border-[rgba(0,229,255,0.4)]',
                    'font-mono text-xs text-[#F9FAFB]',
                    'transition-opacity duration-75',
                    isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                  ].join(' ')}
                  style={{
                    transform: 'rotateZ(-45deg) rotateX(-45deg)',
                  }}
                >
                  <p className="text-[#00E5FF] text-[10px] uppercase tracking-wider mb-1 font-bold">
                    {unit.label}
                  </p>
                  <p className="text-white/90 leading-snug">{tooltip}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServerRackViz;
