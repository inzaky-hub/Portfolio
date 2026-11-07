import { useEffect, useState, useMemo } from 'react';

export interface BookCoverProps {
  name?: string;
  tagline?: string;
  onEnter: () => void;
  reducedMotion?: boolean;
}

interface Particle {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const BookCover = ({ onEnter, reducedMotion = false }: BookCoverProps) => {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [showCta, setShowCta] = useState(false);

  // CSS parallax on mousemove (±10px translate3d based on cursor)
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20; // -10px to +10px
      const y = (e.clientY / innerHeight - 0.5) * 20; // -10px to +10px
      setParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  // CTA button fade-in after 1s
  useEffect(() => {
    if (reducedMotion) {
      setShowCta(true);
      return;
    }
    const timer = setTimeout(() => {
      setShowCta(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // 20 floating particles (2-4px cyan #00E5FF, random positions, float animation 10-20s infinite)
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      top: 6 + ((i * 37) % 86),
      left: 4 + ((i * 47) % 92),
      size: 2 + (i % 3), // 2, 3, or 4px
      duration: 10 + ((i * 2.3) % 10), // 10-20s
      delay: (i * 0.7) % 5,
      opacity: 0.35 + ((i % 5) * 0.12),
    }));
  }, []);

  return (
    <div className="relative w-full max-w-[1000px] mx-auto flex flex-col items-center justify-center select-none py-4">
      {/* 20 Floating cyan particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: '#00E5FF',
            boxShadow: `0 0 ${p.size * 2}px #00E5FF, 0 0 ${p.size * 4}px rgba(0,229,255,0.7)`,
            opacity: p.opacity,
            animation: reducedMotion
              ? 'none'
              : `floatGrimoireParticle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            zIndex: 15,
          }}
        />
      ))}

      {/* Grimoire image wrapper with parallax & pulsing cyan glow */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Pulsing cyan glow behind image (radial-gradient, 15% opacity) */}
        <div
          className="absolute inset-0 -m-6 sm:-m-10 md:-m-16 rounded-3xl pointer-events-none animate-pulse"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.15) 0%, rgba(0, 229, 255, 0.05) 50%, transparent 75%)',
            filter: 'blur(35px)',
            zIndex: 0,
          }}
        />

        {/* Hyper-realistic grimoire image */}
        <img
          src="/grimoire.jpg"
          alt="Grimoire Cybersécurité & IA"
          className="w-full h-auto max-h-[82vh] object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-[rgba(0,229,255,0.15)] relative z-10 pointer-events-none"
        />

        {/* Overlay CTA button: ENTRER DANS MON UNIVERS */}
        <button
          type="button"
          onClick={onEnter}
          className={[
            'absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20',
            'font-mono text-xs sm:text-sm md:text-base uppercase tracking-widest font-bold',
            'px-7 sm:px-10 py-3.5 sm:py-4 rounded-full',
            'bg-[#00E5FF] text-[#0A0E1A]',
            'shadow-[0_0_25px_rgba(0,229,255,0.7)] hover:shadow-[0_0_45px_rgba(0,229,255,1)]',
            'hover:scale-105 active:scale-95 cursor-pointer',
            'transition-all duration-300',
            showCta
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none',
          ].join(' ')}
        >
          ENTRER DANS MON UNIVERS
        </button>
      </div>

      <style>{`
        @keyframes floatGrimoireParticle {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(14px, -35px) scale(1.25);
          }
          100% {
            transform: translate(-12px, -70px) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
};

export default BookCover;
