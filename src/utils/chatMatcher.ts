import type { ChatResponse } from '../types/profile';

/**
 * Matches a query string against a chatResponses map.
 * Returns the first ChatResponse whose keywords include a case-insensitive
 * substring match against the normalised query.
 * Special case: "help" returns a ChatResponse listing available keywords and example questions.
 * Returns null if no match found.
 */
export function matchQuery(
  query: string,
  chatResponses: Record<string, ChatResponse>
): ChatResponse | null {
  const normalised = query.trim().toLowerCase();
  if (!normalised) return null;

  // Special case: if query is exactly "help" (case-insensitive, trimmed)
  if (normalised === 'help') {
    return {
      keywords: ['help'],
      response: {
        fr: "Commandes & sujets disponibles :\n• Présente-moi (identité, parcours)\n• Projets (PFE cryptojacking, Wazuh, CTF)\n• Compétences (ML, SOC, Cloud, Linux)\n• Expérience (VEONE, SYNELIA, LABTIC)\n• Certifications (Fortinet, TryHackMe, SCIA)\n• Contact (LinkedIn, GitHub)\n• Objectifs (ambitions professionnelles)\n• AWS (Amplify, Student Builder Leader)\n• CTF (compétitions, EcowasCTF, agent)\n• Fun fact (anecdotes, BRVM, Fedora)\n\nExemples de questions : 'Présente-toi', 'Quels sont tes projets ?', 'Parle-moi de ton expérience chez VEONE', 'Quelles sont tes compétences ?'.",
        en: "Available commands & topics:\n• Present me (identity, background)\n• Projects (PFE cryptojacking, Wazuh, CTF)\n• Skills (ML, SOC, Cloud, Linux)\n• Experience (VEONE, SYNELIA, LABTIC)\n• Certifications (Fortinet, TryHackMe, SCIA)\n• Contact (LinkedIn, GitHub)\n• Goals (career ambitions)\n• AWS (Amplify, Student Builder Leader)\n• CTF (competitions, EcowasCTF, agent)\n• Fun fact (hobbies, BRVM, Fedora)\n\nExample questions: 'Tell me about yourself', 'What are your projects?', 'Tell me about your experience at VEONE', 'What are your skills?'.",
      },
    };
  }

  for (const entry of Object.values(chatResponses)) {
    for (const keyword of entry.keywords) {
      if (normalised.includes(keyword.toLowerCase())) {
        return entry;
      }
    }
  }

  return null;
}
