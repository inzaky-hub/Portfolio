import { useState, useEffect, useRef } from 'react';
import { gsap } from '../../hooks/useGSAP';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) {
      console.warn('SkillRackCard: card element not found');
      return;
    }

    const animate = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      if (!cardEl) {
        console.warn('SkillRackCard: card element not found');
        return;
      }

      if (reducedMotion) {
        gsap.to(cardEl, {
          opacity: 1,
          duration: 0.3,
        });
      } else {
        gsap.to(cardEl, {
          scale: 1.0,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    };

    if (reducedMotion) {
      gsap.set(cardEl, { opacity: 0 });
    } else {
      gsap.set(cardEl, { opacity: 0, scale: 0.8 });
    }

    if (typeof IntersectionObserver === 'undefined') {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && (entry.isIntersecting || entry.intersectionRatio >= 0.1)) {
          observer.disconnect();
          animate();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(cardEl);

    return () => {
      observer.disconnect();
      if (typeof gsap.killTweensOf === 'function' && cardEl) {
        gsap.killTweensOf(cardEl);
      }
    };
  }, [reducedMotion]);

  // Hover reveal each skill item: 200ms fade, 80ms stagger
  const handleMouseEnter = () => {
    if (reducedMotion || !cardRef.current) return;
    const itemEls = cardRef.current.querySelectorAll('.skill-item');
    if (itemEls.length === 0) return;
    gsap.to(itemEls, {
      opacity: 1,
      duration: 0.2,
      stagger: 0.08,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (reducedMotion || !cardRef.current || expanded) return;
    const itemEls = cardRef.current.querySelectorAll('.skill-item');
    if (itemEls.length === 0) return;
    gsap.to(itemEls, {
      opacity: 0,
      duration: 0.2,
      overwrite: 'auto',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          {items.map((item) => (
            <li
              key={item.name}
              className="skill-item flex flex-row items-center justify-between py-2 border-b border-white/5 last:border-0"
              style={{
                opacity: expanded || reducedMotion ? 1 : 0,
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
