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
  const pageRevealRef = useRef<HTMLDivElement>(null);
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
      const pageRevealEl = pageRevealRef.current;
      const nameEl = nameRef.current || document.getElementById('book-name');
      const ctaEl = ctaRef.current || document.getElementById('book-cta');

      if (reducedMotion) {
        if (!frontCoverEl) {
          console.warn('BookCover: front cover element not found');
        } else {
          gsap.set(frontCoverEl, { opacity: 1, rotateY: -180 });
        }

        if (pageRevealEl) {
          gsap.set(pageRevealEl, { opacity: 1 });
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

        if (pageRevealEl) {
          gsap.to(pageRevealEl, {
            opacity: 1,
            duration: 0.4,
            delay: 0.4, // At 400ms (mid-animation)
            ease: 'power2.out',
          });
        }

        if (!nameEl) {
          console.warn('BookCover: name element not found');
        } else {
          gsap.to(nameEl, {
            opacity: 1,
            duration: 0.2,
            delay: 0.8, // At 800ms
          });
        }

        if (!ctaEl) {
          console.warn('BookCover: CTA element not found');
        } else {
          gsap.to(ctaEl, {
            opacity: 1,
            duration: 0.2,
            delay: 0.85,
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
      const pageRevealEl = pageRevealRef.current;
      const nameEl = nameRef.current || document.getElementById('book-name');
      const ctaEl = ctaRef.current || document.getElementById('book-cta');
      if (typeof gsap.killTweensOf === 'function') {
        if (frontCoverEl) gsap.killTweensOf(frontCoverEl);
        if (pageRevealEl) gsap.killTweensOf(pageRevealEl);
        if (nameEl) gsap.killTweensOf(nameEl);
        if (ctaEl) gsap.killTweensOf(ctaEl);
      }
    };
  }, [reducedMotion]);

  const triggerOpen = () => {
    const frontCoverEl = frontCoverRef.current || document.getElementById('book-front-cover');
    const pageRevealEl = pageRevealRef.current;
    const nameEl = nameRef.current || document.getElementById('book-name');
    const ctaEl = ctaRef.current || document.getElementById('book-cta');

    if (!hasAnimatedRef.current && frontCoverEl) {
      hasAnimatedRef.current = true;
      if (reducedMotion) {
        gsap.set(frontCoverEl, { opacity: 1, rotateY: -180 });
        if (pageRevealEl) gsap.set(pageRevealEl, { opacity: 1 });
        if (nameEl) gsap.set(nameEl, { opacity: 1 });
        if (ctaEl) gsap.set(ctaEl, { opacity: 1 });
      } else {
        gsap.to(frontCoverEl, {
          rotateY: -180,
          duration: 0.8,
          ease: 'power2.inOut',
          transformOrigin: 'left center',
        });
        if (pageRevealEl) {
          gsap.to(pageRevealEl, { opacity: 1, duration: 0.4, delay: 0.4 });
        }
        if (nameEl) {
          gsap.to(nameEl, { opacity: 1, duration: 0.2, delay: 0.8 });
        }
        if (ctaEl) {
          gsap.to(ctaEl, { opacity: 1, duration: 0.2, delay: 0.85 });
        }
      }
    }
  };

  return (
    <div
      id="book-cover-root"
      ref={rootRef}
      className="relative flex flex-col items-center justify-center w-full min-h-[75vh] py-8"
    >
      {/* 6. Ambient cyan glow behind the book (120% size, animated opacity 0.8 to 1.2) */}
      <div
        className={`absolute pointer-events-none rounded-full ${
          reducedMotion ? '' : 'animate-ambient-glow'
        }`}
        style={{
          width: '120%',
          height: '120%',
          background: 'radial-gradient(ellipse, rgba(0,229,255,0.15) 0%, transparent 70%)',
          zIndex: 0,
          transform: 'translateZ(-50px)',
        }}
        aria-hidden="true"
      />

      {/* 1. Book body container wrapper with perspective 1200px & 4. Drop-shadow */}
      <div
        className="relative flex items-center justify-center"
        style={{
          perspective: '1200px',
          width: 'clamp(280px, 40vw, 480px)',
          height: 'clamp(360px, 50vw, 600px)',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.7))',
        }}
      >
        {/* Floating book container (translateY -4px to +4px, 4s alternate) with preserve-3d */}
        <div
          className={`relative w-full h-full ${reducedMotion ? '' : 'animate-book-float'}`}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 4. Back cover */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #2a1810 0%, #1a0f08 60%, #0d0704 100%)',
              border: '2px solid #4a3020',
              boxShadow: 'inset 0 0 25px rgba(0,0,0,0.85)',
              transform: 'translateZ(-14px)',
            }}
          />

          {/* 3. Page edges (thickness of book on right side) */}
          <div
            className="absolute right-0 top-3 bottom-3 w-5 flex flex-col justify-between py-2 px-0.5 rounded-r-sm overflow-hidden pointer-events-none"
            style={{
              transform: 'rotateY(-90deg) translateZ(10px) skewY(-2deg)',
              transformOrigin: 'right center',
              background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(200,192,176,0.9) 25%, rgba(232,224,208,1) 85%, rgba(0,0,0,0.4) 100%)',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)',
            }}
            aria-hidden="true"
          >
            {/* 10 thin horizontal lines (1px height, spacing 3px, alternating #e8e0d0 and #c8c0b0) */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: '1px',
                  backgroundColor: i % 2 === 0 ? '#e8e0d0' : '#c8c0b0',
                  marginBottom: '3px',
                  opacity: 0.9,
                }}
              />
            ))}
          </div>

          {/* Inside page structure revealed when book opens */}
          <div
            id="book-inside"
            className="absolute inset-0 rounded-lg overflow-hidden flex flex-col items-center justify-center p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #18110b 0%, #0f0a07 100%)',
              border: '2px solid #3d2617',
              boxShadow: 'inset 0 0 35px rgba(0,0,0,0.85)',
            }}
          >
            {/* 5. Page reveal (lighter parchment-colored surface faded in mid-animation at 400ms) */}
            <div
              ref={pageRevealRef}
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, #f7f2e7 0%, #ebe0cc 55%, #d9c7a7 100%)',
                boxShadow: 'inset 0 0 40px rgba(90, 60, 30, 0.45)',
                border: '1px solid #c4b08d',
                opacity: reducedMotion ? 1 : 0,
              }}
            >
              {/* Subtle parchment grain watermark */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, #4a3020 0, #4a3020 1px, transparent 1px, transparent 24px)',
                }}
              />
              {/* Cyberpunk circuit rune overlay on parchment */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <pattern id="parchment-circuit" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 0 25 L 20 25 L 30 35 L 50 35" fill="none" stroke="#FF9900" strokeWidth="1" />
                  <circle cx="30" cy="35" r="2" fill="#FF9900" />
                  <path d="M 25 0 L 25 15 L 35 25 L 35 50" fill="none" stroke="#00E5FF" strokeWidth="1" />
                  <circle cx="35" cy="25" r="2" fill="#00E5FF" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#parchment-circuit)" />
              </svg>
              {/* Dark vignette to ensure cyan/orange text contrasts sharply */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(10, 14, 26, 0.88) 0%, rgba(10, 14, 26, 0.94) 65%, rgba(10, 14, 26, 0.98) 100%)',
                }}
              />
            </div>

            {/* Inner Content: Name, Tagline, and CTA */}
            <div className="relative z-10 text-center space-y-4 max-w-sm">
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
                  fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
                  letterSpacing: '-0.02em',
                  opacity: reducedMotion ? 1 : 0,
                }}
              >
                {name}
              </h1>

              <p className="text-[#9CA3AF] text-lg md:text-xl font-sans leading-relaxed">
                {tagline}
              </p>

              <div className="pt-2">
                <button
                  id="book-cta"
                  ref={ctaRef}
                  type="button"
                  onClick={onEnter}
                  style={{
                    opacity: reducedMotion ? 1 : 0,
                  }}
                  className={[
                    'relative font-sans text-base font-semibold px-10 py-3.5 rounded-full',
                    'bg-[#00E5FF] text-[#0A0E1A]',
                    'hover:shadow-[0_0_30px_#00E5FF] hover:scale-105 active:scale-95',
                    'transition-all duration-200 cursor-pointer',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A]',
                  ].join(' ')}
                >
                  &gt; Enter datacenter
                </button>
              </div>
            </div>
          </div>

          {/* 2. Front cover: leather texture, subtle cracks, metallic L-brackets, central sigil */}
          <div
            id="book-front-cover"
            ref={frontCoverRef}
            onClick={triggerOpen}
            className="absolute inset-0 rounded-lg flex flex-col items-center justify-between p-8 cursor-pointer select-none"
            style={{
              background: `
                repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 24px),
                radial-gradient(ellipse at 30% 20%, #3a2218 0%, #2a1810 40%, #1a0f08 100%)
              `,
              border: '2px solid #4a3020',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), inset 0 0 8px rgba(255,153,0,0.2)',
              transform: reducedMotion ? 'rotateY(-180deg)' : 'rotateY(0deg)',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* 4 Metallic L-brackets on corners (color #8a6a4a) */}
            {/* Top-Left */}
            <svg className="absolute top-3.5 left-3.5 w-7 h-7 pointer-events-none" viewBox="0 0 24 24" fill="none">
              <path d="M2 20 V6 C2 3.79 3.79 2 6 2 H20" stroke="#8a6a4a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="6" cy="6" r="1.5" fill="#c49a6c" />
            </svg>
            {/* Top-Right */}
            <svg className="absolute top-3.5 right-3.5 w-7 h-7 pointer-events-none" viewBox="0 0 24 24" fill="none">
              <path d="M22 20 V6 C22 3.79 20.21 2 18 2 H4" stroke="#8a6a4a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="6" r="1.5" fill="#c49a6c" />
            </svg>
            {/* Bottom-Left */}
            <svg className="absolute bottom-3.5 left-3.5 w-7 h-7 pointer-events-none" viewBox="0 0 24 24" fill="none">
              <path d="M2 4 V18 C2 20.21 3.79 22 6 22 H20" stroke="#8a6a4a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="6" cy="18" r="1.5" fill="#c49a6c" />
            </svg>
            {/* Bottom-Right */}
            <svg className="absolute bottom-3.5 right-3.5 w-7 h-7 pointer-events-none" viewBox="0 0 24 24" fill="none">
              <path d="M22 4 V18 C22 20.21 20.21 22 18 22 H4" stroke="#8a6a4a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="1.5" fill="#c49a6c" />
            </svg>

            {/* Spine crease shadow on the left */}
            <div
              className="absolute left-4 top-2 bottom-2 w-1 border-r border-[#1a0f08] opacity-60 pointer-events-none"
              style={{ boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.8)' }}
            />

            {/* Top Header Label */}
            <div className="w-full text-center pt-2">
              <p className="font-mono text-[#FF9900]/80 text-xs tracking-[0.25em] uppercase font-semibold">
                Chronicles of Inza
              </p>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#FF9900]/50 to-transparent mx-auto mt-1" />
            </div>

            {/* Central Sigil: 60px circular SVG with cyberpunk rune */}
            <div className="flex flex-col items-center justify-center my-auto space-y-4">
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                className="pointer-events-none"
                style={{ filter: 'drop-shadow(0 0 6px #FF9900)' }}
              >
                {/* Concentric circles */}
                <circle cx="30" cy="30" r="26" fill="none" stroke="#FF9900" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="30" cy="30" r="20" fill="none" stroke="#FF9900" strokeWidth="1.5" />
                <circle cx="30" cy="30" r="12" fill="none" stroke="#FF9900" strokeWidth="1" strokeDasharray="3 2" />
                <circle cx="30" cy="30" r="6" fill="none" stroke="#FF9900" strokeWidth="1.5" />
                {/* 1 Central dot */}
                <circle cx="30" cy="30" r="2.5" fill="#FF9900" />
                {/* 6 Radial lines */}
                <line x1="30" y1="10" x2="30" y2="4" stroke="#FF9900" strokeWidth="1.5" />
                <line x1="38.7" y1="15" x2="47.3" y2="10" stroke="#FF9900" strokeWidth="1.5" />
                <line x1="38.7" y1="45" x2="47.3" y2="50" stroke="#FF9900" strokeWidth="1.5" />
                <line x1="30" y1="50" x2="30" y2="56" stroke="#FF9900" strokeWidth="1.5" />
                <line x1="21.3" y1="45" x2="12.7" y2="50" stroke="#FF9900" strokeWidth="1.5" />
                <line x1="21.3" y1="15" x2="12.7" y2="10" stroke="#FF9900" strokeWidth="1.5" />
              </svg>

              {/* Embossed author name */}
              <div className="text-center space-y-1">
                <h2 className="font-sans text-[#F9FAFB] text-2xl md:text-3xl font-bold tracking-tight">
                  {name}
                </h2>
                <p className="font-mono text-[#00E5FF] text-xs tracking-wider uppercase opacity-85">
                  SOC &amp; SysAdmin Grimoire
                </p>
              </div>
            </div>

            {/* Bottom Invitation */}
            <div className="w-full text-center pb-2">
              <p className="font-mono text-[#8a6a4a] text-[11px] tracking-widest uppercase">
                [ Click to Open ]
              </p>
            </div>
          </div>
        </div>

        {/* 4. Soft elliptical shadow under the book (border-radius 50%, radial-gradient black to transparent 70%, 90% width, 40px height, 20px below) */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '90%',
            height: '40px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)',
            filter: 'blur(6px)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default BookCover;
