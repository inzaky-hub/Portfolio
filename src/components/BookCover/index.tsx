import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface BookCoverProps {
  name: string;
  tagline: string;
  onEnter: () => void;
  reducedMotion: boolean;
}

const BookCover = ({ name, tagline, onEnter, reducedMotion = false }: BookCoverProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const frontCoverRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    const rootEl = rootRef.current || document.getElementById('book-cover-root');
    if (!rootEl) {
      console.warn('BookCover: root element not found');
      return;
    }

    const animate = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const frontCoverEl = frontCoverRef.current || document.getElementById('book-front-cover');
      const nameEl = nameRef.current || document.getElementById('book-name');
      const ctaEl = ctaRef.current || document.getElementById('book-cta');

      if (reducedMotion) {
        if (!frontCoverEl) {
          console.warn('BookCover: front cover element not found');
        } else {
          gsap.set(frontCoverEl, { opacity: 1, rotateY: -180 });
        }

        if (!nameEl) {
          console.warn('BookCover: name element not found');
        } else {
          gsap.set(nameEl, { opacity: 1 });
        }

        if (!ctaEl) {
          console.warn('BookCover: CTA element not found');
        } else {
          gsap.set(ctaEl, { opacity: 1 });
        }
      } else {
        if (!frontCoverEl) {
          console.warn('BookCover: front cover element not found');
        } else {
          gsap.to(frontCoverEl, {
            rotateY: -180,
            duration: 0.8,
            ease: 'power2.inOut',
            transformOrigin: 'left center',
          });
        }

        if (!nameEl) {
          console.warn('BookCover: name element not found');
        } else {
          gsap.to(nameEl, {
            opacity: 1,
            duration: 0.2,
            delay: 0.8,
          });
        }

        if (!ctaEl) {
          console.warn('BookCover: CTA element not found');
        } else {
          gsap.to(ctaEl, {
            opacity: 1,
            duration: 0.2,
            delay: 0.9,
          });
        }
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && (entry.isIntersecting || entry.intersectionRatio > 0)) {
          observer.disconnect();
          animate();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(rootEl);

    return () => {
      observer.disconnect();
      const frontCoverEl = frontCoverRef.current || document.getElementById('book-front-cover');
      const nameEl = nameRef.current || document.getElementById('book-name');
      const ctaEl = ctaRef.current || document.getElementById('book-cta');
      if (typeof gsap.killTweensOf === 'function') {
        if (frontCoverEl) gsap.killTweensOf(frontCoverEl);
        if (nameEl) gsap.killTweensOf(nameEl);
        if (ctaEl) gsap.killTweensOf(ctaEl);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      id="book-cover-root"
      ref={rootRef}
      className="flex flex-col items-center justify-center w-full min-h-[75vh]"
    >
      {/* Book container — 3D perspective wrapper with cyan glow */}
      <div
        className="relative shadow-[0_0_60px_rgba(0,229,255,0.3)] rounded-lg"
        style={{
          perspective: '1200px',
          /* Reserve dimensions before animation to prevent CLS */
          minHeight: 'clamp(280px, 45vw, 520px)',
          minWidth: 'clamp(240px, 36vw, 440px)',
        }}
      >
        {/* Book spine + pages stack */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Back cover */}
          <div
            className="absolute inset-0 rounded-lg border border-[rgba(0,229,255,0.2)]"
            style={{
              background: 'linear-gradient(135deg, #111827 0%, #0A0E1A 100%)',
              transform: 'translateZ(-6px)',
            }}
          />

          {/* Pages (book thickness) */}
          <div
            className="absolute inset-y-0 right-0 w-3 bg-gradient-to-b from-slate-300 to-slate-500 rounded-r-sm"
            style={{ transform: 'rotateY(-90deg) translateZ(6px)', transformOrigin: 'right center' }}
          />

          {/* Front cover — rotates from 0deg to -180deg */}
          <div
            id="book-front-cover"
            ref={frontCoverRef}
            className="absolute inset-0 rounded-lg border border-[rgba(0,229,255,0.35)] flex flex-col items-center justify-center p-8 gap-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0A0E1A 0%, #111827 60%, #0A0E1A 100%)',
              transform: reducedMotion ? 'rotateY(-180deg)' : 'rotateY(0deg)',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest opacity-80">
                  Portfolio · SOC &amp; SysAdmin
                </p>
              </div>
              <h1 className="font-sans text-[#F9FAFB] text-2xl md:text-3xl font-bold tracking-tight">
                {name}
              </h1>
              <p className="font-mono text-[#9CA3AF] text-xs">
                [ Click or scroll to open ]
              </p>
            </div>
          </div>

          {/* Inside page (revealed when cover opens) */}
          <div
            id="book-inside"
            className="absolute inset-0 rounded-lg border border-[rgba(0,229,255,0.2)] flex flex-col items-center justify-center gap-6 p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #0A0E1A 0%, #111827 100%)',
            }}
          >
            {/* Datacenter grid decoration */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none rounded-lg"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #00E5FF 0, #00E5FF 1px, transparent 0, transparent 40px)',
                backgroundSize: '100% 40px',
              }}
            />

            <div className="relative text-center space-y-3 max-w-md">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
                <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest font-semibold">
                  &gt; boot sequence complete
                </p>
              </div>
              <h1
                id="book-name"
                ref={nameRef}
                className="font-sans font-bold bg-gradient-to-r from-[#00E5FF] to-[#FF9900] bg-clip-text text-transparent leading-none"
                style={{
                  fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                  letterSpacing: '-0.02em',
                  opacity: reducedMotion ? 1 : 0,
                }}
              >
                {name}
              </h1>
              <p className="text-[#9CA3AF] text-xl mt-4 font-sans leading-relaxed">
                {tagline}
              </p>
            </div>

            <button
              id="book-cta"
              ref={ctaRef}
              type="button"
              onClick={onEnter}
              style={{
                opacity: reducedMotion ? 1 : 0,
              }}
              className={[
                'relative font-sans text-base font-semibold px-10 py-4 rounded-full',
                'bg-[#00E5FF] text-[#0A0E1A]',
                'hover:shadow-[0_0_30px_#00E5FF] hover:scale-105 active:scale-95',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A]',
              ].join(' ')}
            >
              &gt; Enter datacenter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCover;
