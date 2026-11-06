import type { ChatResponse } from '../types/profile';

/**
 * Matches a query string against a chatResponses map.
 * Returns the first ChatResponse whose keywords include a case-insensitive
 * substring match against the normalised query.
 * Returns null if no match found.
 */
export function matchQuery(
  query: string,
  chatResponses: Record<string, ChatResponse>
): ChatResponse | null {
  const normalised = query.trim().toLowerCase();
  if (!normalised) return null;

  for (const entry of Object.values(chatResponses)) {
    for (const keyword of entry.keywords) {
      if (normalised.includes(keyword.toLowerCase())) {
        return entry;
      }
    }
  }

  return null;
}
