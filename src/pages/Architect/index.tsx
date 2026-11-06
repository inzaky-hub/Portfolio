import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import ServerRackViz from '../../components/ServerRackViz/index';
import type { ServerUnit } from '../../components/ServerRackViz/index';

// Build server units from profile milestones
function buildServerUnits(
  name: string,
  _roleFr: string,
  _biographyFr: string,
  language: 'fr' | 'en',
  roleBilingual: { fr: string; en: string },
  _biography: { fr: string; en: string }
): ServerUnit[] {
  // Fixed milestones derived from the profile structure
  return [
    { id: 'unit-identity',   label: language === 'fr' ? 'Identité'        : 'Identity',        milestone: name },
    { id: 'unit-role',       label: language === 'fr' ? 'Rôle'            : 'Role',             milestone: language === 'fr' ? roleBilingual.fr : roleBilingual.en },
    { id: 'unit-veone',      label: 'VEONE Groupe',                                              milestone: language === 'fr' ? 'Stage SOC – mars–oct 2026' : 'SOC Internship – Mar–Oct 2026' },
    { id: 'unit-synelia',    label: 'SYNELIA GROUP',                                             milestone: language === 'fr' ? 'CDD Sysadmin 2023–2024' : 'Junior SysAdmin 2023–2024' },
    { id: 'unit-labtic',     label: 'LABTIC',                                                    milestone: language === 'fr' ? 'Stage audits & réseaux 2023' : 'Audits & Networks Internship 2023' },
    { id: 'unit-inphb',      label: 'INP-HB / IDSI',                                            milestone: language === 'fr' ? 'Master SCIA – soutenance nov 2026' : 'Master\'s SCIA – defense Nov 2026' },
    { id: 'unit-pfe',        label: language === 'fr' ? 'PFE Cryptojacking' : 'PFE Cryptojacking', milestone: language === 'fr' ? 'LightGBM + Wazuh – F1=0.9639' : 'LightGBM + Wazuh – F1=0.9639' },
    { id: 'unit-ctf',        label: 'CTF',                                                       milestone: language === 'fr' ? 'EcowasCTF, CYTAC Intelligence' : 'EcowasCTF, CYTAC Intelligence' },
    { id: 'unit-aws',        label: 'AWS',                                                       milestone: language === 'fr' ? 'AWS Student Builder Group Leader' : 'AWS Student Builder Group Leader' },
  ];
}

const Architect = () => {
  const { profileData, quickReadMode, language } = useAppContext();
  const { tField, t } = useTranslation();

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!profileData) {
    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex items-center justify-center px-8 md:px-16">
        <div className="text-center space-y-4">
          {/* Static placeholder rack */}
          <div className="w-48 h-64 mx-auto border border-[rgba(0,229,255,0.2)] rounded-lg bg-[#111827] flex items-center justify-center shadow-lg">
            <span className="font-mono text-[#00E5FF]/40 text-xs tracking-widest">RACK OFFLINE</span>
          </div>
          <p className="font-mono text-[#FF9900] text-sm">{t('error.sectionUnavailable')}</p>
        </div>
      </main>
    );
  }

  const units = buildServerUnits(
    profileData.name,
    profileData.role.fr,
    profileData.biography.fr,
    language,
    profileData.role,
    profileData.biography
  );

  // Quick-read: 3 career facts
  if (quickReadMode) {
    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex flex-col items-center justify-center gap-6 px-8 md:px-16">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
          <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">&gt; quick read · architect</p>
        </div>
        <h2 className="font-sans text-[#F9FAFB] text-2xl md:text-3xl font-bold">{profileData.name}</h2>
        <ul className="font-sans text-sm text-[#F9FAFB]/90 space-y-3 text-center list-none max-w-lg bg-[#111827] p-6 rounded-xl border border-[rgba(0,229,255,0.2)]">
          <li className="text-[#00E5FF] font-semibold">{tField(profileData.role)}</li>
          <li>VEONE Groupe SOC · SYNELIA GROUP SysAdmin · LABTIC</li>
          <li className="text-[#FF9900]">Master SCIA — INP-HB / IDSI</li>
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
            <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">&gt; rack 1 · architect</p>
          </div>
          <h2
            className="font-sans font-bold text-[#F9FAFB] flex items-center"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] mr-3 inline-block flex-shrink-0" />
            Chapter 01 — The Architect
          </h2>
          <p className="font-sans text-[#9CA3AF] text-sm mt-1">{tField(profileData.role)}</p>
        </div>

        {/* Side-by-side ≥768px, stacked <768px */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
          {/* Biography */}
          <div className="flex-1 space-y-6">
            <div className="bg-[#111827] border border-[rgba(0,229,255,0.2)] rounded-xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest font-semibold">
                  &gt; bio.log
                </p>
              </div>
              <p className="font-sans text-[#F9FAFB]/90 text-base md:text-lg leading-relaxed whitespace-pre-line">
                {tField(profileData.biography)}
              </p>
            </div>
          </div>

          {/* ServerRackViz */}
          <div className="flex-shrink-0 flex justify-center md:justify-end w-full md:w-auto">
            <ServerRackViz
              units={units}
              reducedMotion={reducedMotion}
              noMilestoneLabel={t('tooltip.noMilestone')}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Architect;
