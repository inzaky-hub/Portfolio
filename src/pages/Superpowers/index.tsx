import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import SkillRackCard from '../../components/SkillRackCard/index';

const Superpowers = () => {
  const { profileData, quickReadMode, language } = useAppContext();
  const { tField, t } = useTranslation();

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

  // Quick-read: top 5 skill names across all categories
  if (quickReadMode) {
    const top5 = profileData.skills
      .flatMap((cat) => cat.items)
      .slice(0, 5)
      .map((item) => tField(item.name));

    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex flex-col items-center justify-center gap-6 px-8 md:px-16">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
          <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">&gt; quick read · superpowers</p>
        </div>
        <h2 className="font-sans text-[#F9FAFB] text-2xl md:text-3xl font-bold">
          {language === 'fr' ? 'Compétences clés' : 'Key competencies'}
        </h2>
        <ul className="font-sans text-sm text-[#F9FAFB]/90 space-y-2 text-center list-none max-w-md bg-[#111827] p-6 rounded-xl border border-[rgba(0,229,255,0.2)]">
          {top5.map((name) => (
            <li key={name} className="text-[#00E5FF] font-medium">&gt; {name}</li>
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
            <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">&gt; rack 2 · superpowers</p>
          </div>
          <h2
            className="font-sans font-bold text-[#F9FAFB] flex items-center"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] mr-3 inline-block flex-shrink-0" />
            Chapter 02 — Superpowers
          </h2>
          <p className="font-sans text-[#9CA3AF] text-sm mt-1">
            {language === 'fr' ? 'Compétences techniques & expertise SOC/Cloud' : 'Technical competencies & SOC/Cloud expertise'}
          </p>
        </div>

        {/* Responsive grid: 1 col < 640px, 2 cols 640–1023px, 3–4 cols ≥ 1024px */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profileData.skills.map((skillCat) => (
            <SkillRackCard
              key={skillCat.category.en}
              category={tField(skillCat.category)}
              items={skillCat.items.map((item) => ({
                name: tField(item.name),
                level: tField(item.level),
              }))}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Superpowers;
