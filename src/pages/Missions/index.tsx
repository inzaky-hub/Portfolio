import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import ProjectCard from '../../components/ProjectCard/index';

const Missions = () => {
  const { profileData, quickReadMode, language } = useAppContext();
  const { t } = useTranslation();

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!profileData) {
    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex items-center justify-center px-8 md:px-16">
        <p className="font-mono text-[#FF9900]">{t('error.sectionUnavailable')}</p>
      </main>
    );
  }

  const featuredProject = profileData.projects.find((p) => p.featured) ?? profileData.projects[0];
  const nonFeatured = profileData.projects.filter((p) => !p.featured);

  // Quick-read: first 2 projects (featured + 1 non-featured) with title and description
  if (quickReadMode) {
    const preview = [featuredProject, ...nonFeatured].slice(0, 2);
    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex flex-col items-center justify-center gap-6 px-8 md:px-16">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
          <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">&gt; quick read · missions</p>
        </div>
        <h2 className="font-sans text-[#F9FAFB] text-2xl md:text-3xl font-bold">
          {language === 'fr' ? 'Projets phares' : 'Flagship projects'}
        </h2>
        <ul className="font-sans text-sm text-[#F9FAFB]/90 space-y-4 text-center list-none max-w-lg bg-[#111827] p-6 rounded-xl border border-[rgba(0,229,255,0.2)]">
          {preview.map((p) => (
            <li key={p.id} className="space-y-1">
              <span className="text-[#00E5FF] font-semibold block">
                {language === 'fr' ? p.title.fr : p.title.en}
              </span>
              <span className="text-[#9CA3AF] text-xs block">
                {language === 'fr' ? p.description.fr : p.description.en}
              </span>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dc-bg pt-24 pb-28 px-8 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="mb-8 pb-4 border-b border-[rgba(0,229,255,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
            <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">&gt; rack 3 · missions</p>
          </div>
          <h2
            className="font-sans font-bold text-[#F9FAFB] flex items-center"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] mr-3 inline-block flex-shrink-0" />
            Chapter 03 — Missions
          </h2>
          <p className="font-sans text-[#9CA3AF] text-sm mt-1">
            {language === 'fr' ? 'Projets techniques & réalisations concrètes' : 'Technical projects & achievements'}
          </p>
        </div>

        {/* Featured project — full width */}
        <div className="mb-8">
          <ProjectCard
            project={featuredProject}
            featured={true}
            language={language}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Non-featured grid: 2 columns on md, 1 on mobile, gap 1.5rem */}
        {nonFeatured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nonFeatured.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                featured={false}
                language={language}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Missions;
