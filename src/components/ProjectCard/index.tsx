import { useEffect, useRef } from 'react';
import { gsap } from '../../hooks/useGSAP';
import type { Project } from '../../types/profile';

interface ProjectCardProps {
  project: Project;
  featured: boolean;
  language: 'fr' | 'en';
  reducedMotion: boolean;
}

const ProjectCard = ({ project, featured, language, reducedMotion }: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const title = language === 'fr' ? project.title.fr : project.title.en;
  const description = language === 'fr' ? project.description.fr : project.description.en;

  // Enforce character limits per requirements
  const safeTitle = title.slice(0, 100);
  const safeDescription = description.slice(0, 300);
  const safeTags = project.technologies.slice(0, 10);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) {
      console.warn('ProjectCard: card element not found');
      return;
    }

    if (reducedMotion) {
      gsap.set(cardEl, { opacity: 0 });
      gsap.to(cardEl, {
        scrollTrigger: {
          trigger: cardEl,
          start: 'top 90%',
        },
        opacity: 1,
        duration: 0.3,
      });
    } else {
      gsap.set(cardEl, { opacity: 0, y: 30 });
      gsap.to(cardEl, {
        scrollTrigger: {
          trigger: cardEl,
          start: 'top 90%',
        },
        opacity: 1,
        y: 0,
        duration: 0.6, // 600ms duration
        ease: 'power2.out',
      });
    }

    return () => {
      if (typeof gsap.killTweensOf === 'function' && cardEl) {
        gsap.killTweensOf(cardEl);
      }
    };
  }, [reducedMotion]);

  if (featured) {
    return (
      <div
        ref={cardRef}
        className={[
          'w-full rounded-2xl border-2 border-[rgba(0,229,255,0.4)] p-8 md:p-10 overflow-hidden',
          'shadow-[0_0_40px_rgba(0,229,255,0.25)] transition-all duration-200',
          'hover:shadow-[0_0_60px_rgba(0,229,255,0.4)] hover:border-[#00E5FF]',
        ].join(' ')}
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)',
          minHeight: '220px',
        }}
      >
        {/* Featured badge */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#0A0E1A] bg-[#00E5FF] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.5)]">
              ★ Featured Mission
            </span>
            <span className="font-mono text-[#00E5FF]/70 text-xs font-medium">
              PFE · Master SCIA
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
        </div>

        <div className="space-y-4">
          <h3 className="font-sans text-[#F9FAFB] font-bold text-2xl md:text-3xl leading-snug">
            {safeTitle}
          </h3>
          <p className="font-sans text-[#9CA3AF] text-base md:text-lg leading-relaxed max-w-4xl">
            {safeDescription}
          </p>

          {/* Metrics (F1, Recall, AUC, Observations) */}
          {project.metrics && (
            <div className="flex flex-wrap gap-8 my-6 py-4 px-6 rounded-xl bg-[#0A0E1A]/60 border border-[rgba(0,229,255,0.2)]">
              {project.metrics.f1 !== undefined && (
                <div>
                  <p className="font-sans text-4xl font-bold text-[#00E5FF]">{project.metrics.f1.toFixed(4)}</p>
                  <p className="font-mono text-sm text-[#9CA3AF] uppercase tracking-wider mt-1">F1 Score</p>
                </div>
              )}
              {project.metrics.recall !== undefined && (
                <div>
                  <p className="font-sans text-4xl font-bold text-[#00E5FF]">{project.metrics.recall.toFixed(4)}</p>
                  <p className="font-mono text-sm text-[#9CA3AF] uppercase tracking-wider mt-1">Recall</p>
                </div>
              )}
              {project.metrics.auc !== undefined && (
                <div>
                  <p className="font-sans text-4xl font-bold text-[#00E5FF]">{project.metrics.auc.toFixed(4)}</p>
                  <p className="font-mono text-sm text-[#9CA3AF] uppercase tracking-wider mt-1">AUC-ROC</p>
                </div>
              )}
              {project.metrics.observations !== undefined && (
                <div>
                  <p className="font-sans text-4xl font-bold text-[#FF9900]">{project.metrics.observations.toLocaleString()}</p>
                  <p className="font-mono text-sm text-[#9CA3AF] uppercase tracking-wider mt-1">Samples</p>
                </div>
              )}
            </div>
          )}

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {safeTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center font-mono text-xs px-3 py-1 bg-[rgba(255,153,0,0.1)] text-[#FF9900] rounded-full border border-[rgba(255,153,0,0.25)] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          {project.link && (
            <div className="pt-3">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm text-[#00E5FF] hover:text-[#FF9900] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] font-semibold"
              >
                <span>&rarr; View on GitHub</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Non-featured card
  return (
    <div
      ref={cardRef}
      className={[
        'bg-[#111827] border border-[rgba(0,229,255,0.2)] rounded-xl p-6 overflow-hidden',
        'transition-all duration-200 flex flex-col justify-between',
        'hover:border-[#00E5FF] hover:shadow-[0_0_24px_rgba(0,229,255,0.25)] hover:-translate-y-1',
      ].join(' ')}
      style={{
        minHeight: '180px',
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
          <h3 className="font-sans text-[#F9FAFB] font-bold text-lg leading-snug">
            {safeTitle}
          </h3>
        </div>
        <p className="font-sans text-[#9CA3AF] text-sm leading-relaxed">
          {safeDescription}
        </p>
      </div>

      <div className="pt-4 space-y-3">
        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5">
          {safeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center font-mono text-xs px-2.5 py-0.5 bg-[rgba(255,153,0,0.1)] text-[#FF9900] rounded-full border border-[rgba(255,153,0,0.25)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Link */}
        {project.link && (
          <div className="pt-1">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#00E5FF] hover:text-[#FF9900] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00E5FF] font-semibold"
            >
              <span>&rarr; GitHub</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
