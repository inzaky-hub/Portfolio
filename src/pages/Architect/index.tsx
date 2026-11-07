import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import ServerRackViz from '../../components/ServerRackViz/index';
import type { ServerUnit } from '../../components/ServerRackViz/index';

// Build server units from profile experience & milestones
function buildServerUnits(language: 'fr' | 'en'): ServerUnit[] {
  return [
    {
      id: 'unit-veone',
      label: 'VEONE',
      milestone:
        language === 'fr'
          ? 'Stage SOC (8 mois) · Détection cryptojacking ML & Wazuh (2026)'
          : 'SOC Internship (8 mos) · ML cryptojacking & Wazuh (2026)',
    },
    {
      id: 'unit-synelia',
      label: 'SYNELIA',
      milestone:
        language === 'fr'
          ? 'CDD SysAdmin · VMware, Centreon, Bacula & Linux (2023–2024)'
          : 'Junior SysAdmin · VMware, Centreon, Bacula & Linux (2023–2024)',
    },
    {
      id: 'unit-labtic',
      label: 'LABTIC',
      milestone:
        language === 'fr'
          ? 'Stage Audits & Réseaux · FreeNAS, VLAN, Nagios, Heartbeat (2023)'
          : 'Audit & Networks Intern · FreeNAS, VLAN, Nagios (2023)',
    },
    {
      id: 'unit-opnin',
      label: 'OPNIN',
      milestone:
        language === 'fr'
          ? 'Stage Cybersécurité · Détection d\'intrusion Suricata (2023)'
          : 'Cybersecurity Intern · Suricata intrusion detection (2023)',
    },
    {
      id: 'unit-cnvdt',
      label: 'CNVDT',
      milestone:
        language === 'fr'
          ? 'Freelance · Gestion et modélisation de base de données (2022)'
          : 'Freelance · Database management & modeling (2022)',
    },
    {
      id: 'unit-inphb',
      label: 'INP-HB',
      milestone:
        language === 'fr'
          ? 'Master SCIA · Sécurité, Cyber & IA (Soutenance nov 2026)'
          : 'Master\'s SCIA · Security, Cyber & AI (Defense Nov 2026)',
    },
    {
      id: 'unit-pfeml',
      label: 'PFE-ML',
      milestone:
        language === 'fr'
          ? 'LightGBM + Wazuh règle 100030 · F1=0.9639, AUC=0.9987'
          : 'LightGBM + Wazuh rule 100030 · F1=0.9639, AUC=0.9987',
    },
    {
      id: 'unit-aws',
      label: 'AWS',
      milestone:
        language === 'fr'
          ? 'AWS Student Builder Group Leader (INP-HB)'
          : 'AWS Student Builder Group Leader (INP-HB)',
    },
  ];
}

const Architect = () => {
  const { profileData, quickReadMode, language } = useAppContext();
  const { tField, t } = useTranslation();

  const [agentsCount, setAgentsCount] = useState(0);
  const [isPinging, setIsPinging] = useState(false);

  // Live counter of "agents connected" (animates 0 to 8 over 2s on mount)
  useEffect(() => {
    const targetAgents = 8;
    const duration = 2000;
    const intervalTime = Math.floor(duration / targetAgents);
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setAgentsCount(count);
      if (count >= targetAgents) {
        clearInterval(timer);
      }
    }, intervalTime);
    return () => clearInterval(timer);
  }, []);

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
    }, 600);
  };

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

  const units = buildServerUnits(language);

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

          {/* Data Center Status & ServerRackViz */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-end w-full md:w-auto">
            {/* Interactive Data Center Status Panel */}
            <div className="w-full max-w-[280px] mb-4 p-3.5 rounded-xl bg-[#111827] border border-[rgba(0,229,255,0.25)] shadow-[0_0_25px_rgba(0,0,0,0.6)] font-mono text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981] animate-pulse" />
                  <span className="text-[#10B981] font-bold text-[11px] tracking-wider uppercase">
                    SYSTEM STATUS: ONLINE
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePing}
                  aria-label="Ping datacenter rack units"
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isPinging
                      ? 'bg-[#10B981] text-[#0A0E1A] border border-[#10B981] shadow-[0_0_15px_#10B981] scale-105'
                      : 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.3)] hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_10px_rgba(0,229,255,0.3)] active:scale-95'
                  }`}
                >
                  {isPinging ? 'PINGING...' : 'PING'}
                </button>
              </div>
              <div className="flex items-center justify-between text-[#9CA3AF] border-t border-[rgba(0,229,255,0.1)] pt-2.5 mt-2.5 text-[11px]">
                <span className="tracking-wide">AGENTS CONNECTED:</span>
                <span className="font-bold text-[#00E5FF] tabular-nums text-xs">
                  {agentsCount} / 8
                </span>
              </div>
            </div>

            <ServerRackViz
              units={units}
              reducedMotion={reducedMotion}
              noMilestoneLabel={t('tooltip.noMilestone')}
              pinging={isPinging}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Architect;
