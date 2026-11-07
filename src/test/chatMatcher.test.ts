import { describe, it, expect } from 'vitest';
import { matchQuery } from '../utils/chatMatcher';
import type { ChatResponse } from '../types/profile';

describe('chatMatcher', () => {
  const dummyResponses: Record<string, ChatResponse> = {
    presentation: {
      keywords: ['présente', 'identité', 'who'],
      response: {
        fr: 'Je suis Inza.',
        en: 'I am Inza.',
      },
    },
    projets: {
      keywords: ['projet', 'missions'],
      response: {
        fr: 'Mes projets.',
        en: 'My projects.',
      },
    },
  };

  it('handles "help" query as a special case with bilingual keywords & example questions', () => {
    const result = matchQuery('help', dummyResponses);
    expect(result).not.toBeNull();
    expect(result?.keywords).toContain('help');
    expect(result?.response.fr).toContain('Présente-moi');
    expect(result?.response.fr).toContain('Projets');
    expect(result?.response.fr).toContain('Compétences');
    expect(result?.response.fr).toContain('Expérience');
    expect(result?.response.fr).toContain('Certifications');
    expect(result?.response.fr).toContain('Contact');
    expect(result?.response.fr).toContain('Objectifs');
    expect(result?.response.fr).toContain('AWS');
    expect(result?.response.fr).toContain('CTF');
    expect(result?.response.fr).toContain('Fun fact');

    expect(result?.response.en).toContain('Projects');
    expect(result?.response.en).toContain('Skills');

    // Case-insensitive & trimmed
    const resultTrimmed = matchQuery('  HELP  ', dummyResponses);
    expect(resultTrimmed).not.toBeNull();
    expect(resultTrimmed?.keywords).toContain('help');
  });

  it('matches normal queries based on keywords', () => {
    const result = matchQuery('qui es-tu, présente toi ?', dummyResponses);
    expect(result).not.toBeNull();
    expect(result?.response.fr).toBe('Je suis Inza.');
  });

  it('returns null for unknown queries', () => {
    const result = matchQuery('quel temps fait-il ?', dummyResponses);
    expect(result).toBeNull();
  });
});
