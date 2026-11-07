import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import BookCover from '../../components/BookCover/index';
import PointCloud from '../../components/PointCloud/index';

const Cover = () => {
  const { profileData, quickReadMode } = useAppContext();
  const { tField, t } = useTranslation();
  const [stage, setStage] = useState<'book' | 'cloud'>('book');

  // Detect reduced motion
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!profileData) {
    return (
      <main className="min-h-screen bg-dc-bg flex items-center justify-center p-8 md:p-16">
        <p className="font-mono text-[#FF9900]">{t('error.sectionUnavailable')}</p>
      </main>
    );
  }

  // Quick-read summary: name + tagline only
  if (quickReadMode) {
    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex flex-col items-center justify-center gap-4 px-8 md:px-16 text-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
          <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">&gt; quick read</p>
        </div>
        <h1
          className="font-sans font-bold bg-gradient-to-r from-[#00E5FF] to-[#FF9900] bg-clip-text text-transparent"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}
        >
          {profileData.name}
        </h1>
        <p className="text-[#9CA3AF] text-xl mt-4 max-w-xl mx-auto font-sans leading-relaxed">
          {tField(profileData.tagline)}
        </p>
      </main>
    );
  }

  // Stage 2: Interactive 3D Point Cloud reconstructing avatar
  if (stage === 'cloud') {
    return <PointCloud />;
  }

  // Stage 1: Grimoire cover with parallax & particles
  return (
    <main className="min-h-screen bg-dc-bg pt-20 pb-24 flex items-center justify-center px-4 sm:px-8 md:px-16 overflow-hidden">
      <BookCover
        name={profileData.name}
        tagline={tField(profileData.tagline)}
        onEnter={() => setStage('cloud')}
        reducedMotion={reducedMotion}
      />
    </main>
  );
};

export default Cover;
