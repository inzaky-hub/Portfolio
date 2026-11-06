import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { matchQuery } from '../../utils/chatMatcher';

interface ConversationEntry {
  id: number;
  query: string;
  response: string;
  isTyping: boolean;
}

const AskInza = () => {
  const { profileData, quickReadMode, language } = useAppContext();
  const { t, tField } = useTranslation();

  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [_historyIndex, setHistoryIndex] = useState(-1);
  const [idCounter, setIdCounter] = useState(0);

  const historyEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom after each new entry
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const typewriterEffect = useCallback(
    (entryId: number, fullText: string) => {
      const chars = fullText.split('');
      const totalDuration = Math.min(chars.length * 30, 1500);
      const perCharDelay = chars.length > 0 ? totalDuration / chars.length : 0;

      let built = '';
      chars.forEach((char, i) => {
        setTimeout(() => {
          built += char;
          const current = built;
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId
                ? { ...e, response: current, isTyping: i < chars.length - 1 }
                : e
            )
          );
          // Scroll after last char
          if (i === chars.length - 1) {
            historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }, i * perCharDelay);
      });
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const query = inputValue.trim();
    if (!query || !profileData) return;

    const newId = idCounter + 1;
    setIdCounter(newId);

    // Add to query history
    setQueryHistory((prev) => [...prev, query]);
    setHistoryIndex(-1);
    setInputValue('');

    // Match query
    const match = matchQuery(query, profileData.chatResponses);
    const responseText = match
      ? tField(match.response)
      : t('echo.error.unknownCommand');

    // Add entry with empty response, start typewriter
    setEntries((prev) => [
      ...prev,
      { id: newId, query, response: '', isTyping: true },
    ]);

    typewriterEffect(newId, responseText);
  }, [inputValue, profileData, idCounter, tField, t, typewriterEffect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          const newIndex =
            prev === -1 ? queryHistory.length - 1 : Math.max(0, prev - 1);
          setInputValue(queryHistory[newIndex] ?? '');
          return newIndex;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          if (prev === -1) return -1;
          const newIndex = prev + 1;
          if (newIndex >= queryHistory.length) {
            setInputValue('');
            return -1;
          }
          setInputValue(queryHistory[newIndex]);
          return newIndex;
        });
      }
    },
    [handleSubmit, queryHistory]
  );

  if (!profileData) {
    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex items-center justify-center px-8 md:px-16">
        <p className="font-mono text-[#FF9900]">{t('error.sectionUnavailable')}</p>
      </main>
    );
  }

  // Quick-read: 3 suggested questions from first 3 chatResponse keyword sets
  if (quickReadMode) {
    const suggestions = Object.values(profileData.chatResponses)
      .slice(0, 3)
      .map((entry) => entry.keywords[0]);

    return (
      <main className="min-h-screen bg-dc-bg pt-24 pb-28 flex flex-col items-center justify-center gap-6 px-8 md:px-16">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
          <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest">
            &gt; quick read · askinza
          </p>
        </div>
        <h2 className="font-sans text-[#F9FAFB] text-2xl md:text-3xl font-bold">
          {language === 'fr' ? 'Questions fréquentes' : 'Frequently Asked'}
        </h2>
        <div className="flex flex-wrap justify-center gap-3 max-w-lg">
          {suggestions.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setInputValue(kw)}
              className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[#10B981] px-4 py-2 rounded text-sm hover:bg-[rgba(16,185,129,0.2)] font-mono transition-all"
            >
              &gt; {kw}
            </button>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dc-bg pt-24 pb-28 px-8 md:px-16 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Section Heading */}
        <div className="mb-8 pb-4 border-b border-[rgba(0,229,255,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
            <p className="font-mono text-[#00E5FF] text-xs uppercase tracking-widest mb-1">
              &gt; rack 4 · askinza
            </p>
          </div>
          <h2
            className="font-sans font-bold text-[#F9FAFB] flex items-center"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] mr-3 inline-block flex-shrink-0" />
            Chapter 04 — AskInza
          </h2>
          <p className="font-sans text-[#9CA3AF] text-sm mt-1">
            {language === 'fr'
              ? 'Terminal interactif SOC — connaissances embarquées, aucune API externe'
              : 'Interactive SOC Terminal — local knowledge base, zero external API'}
          </p>
        </div>

        {/* Terminal window */}
        <div
          className="flex-1 flex flex-col rounded-lg border border-[#10B981] bg-[#000000] p-6 font-mono text-[#10B981] shadow-[0_0_35px_rgba(16,185,129,0.2)] overflow-hidden"
          style={{ minHeight: '440px' }}
        >
          {/* Terminal header / status bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#10B981]/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-[#FF9900]/70" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-[#00E5FF] text-xs font-semibold ml-2">
                inza@living-datacenter:~$
              </span>
            </div>
            <span className="text-[11px] text-[#10B981]/60">
              STATUS: SECURE_LOCAL_MODE
            </span>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto space-y-4 text-sm pr-1">
            {/* Welcome message */}
            {entries.length === 0 && (
              <div className="space-y-3">
                <div className="text-[#10B981]/70 text-xs space-y-1">
                  <p>
                    <span className="text-[#00E5FF]">&gt;</span> AskInza v1.0 —{' '}
                    {language === 'fr'
                      ? 'Base de connaissances locale chargée'
                      : 'Local knowledge base loaded'}
                  </p>
                  <p>
                    <span className="text-[#00E5FF]">&gt;</span>{' '}
                    {language === 'fr'
                      ? `${Object.keys(profileData.chatResponses).length} entrées indexées`
                      : `${Object.keys(profileData.chatResponses).length} indexed entries available`}
                  </p>
                  <p>
                    <span className="text-[#00E5FF]">&gt;</span>{' '}
                    {language === 'fr'
                      ? 'Tapez votre commande ou cliquez sur une suggestion :'
                      : 'Type a query below or select a suggested topic:'}
                  </p>
                </div>

                {/* Suggestion buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.values(profileData.chatResponses).slice(0, 4).map((entry) => (
                    <button
                      key={entry.keywords[0]}
                      type="button"
                      onClick={() => setInputValue(entry.keywords[0])}
                      className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[#10B981] px-4 py-2 rounded text-xs hover:bg-[rgba(16,185,129,0.2)] font-mono transition-all"
                    >
                      <span className="text-[#00E5FF]">&gt;</span> {entry.keywords[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation entries */}
            {entries.map((entry) => (
              <div key={entry.id} className="space-y-1.5">
                {/* User query */}
                <p className="text-[#FF9900] flex items-center gap-1.5">
                  <span className="text-[#00E5FF] font-bold">&gt;</span>
                  <span className="text-[#9CA3AF] text-xs">visitor:</span>
                  <span>{entry.query}</span>
                </p>
                {/* Response */}
                <p className="text-[#10B981] pl-4 leading-relaxed whitespace-pre-line">
                  {entry.response}
                  {entry.isTyping && (
                    <span
                      className="w-[2px] h-4 bg-[#10B981] inline-block animate-[blink_1s_steps(2)_infinite] ml-1 align-middle"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-[#10B981]/20 pt-4 mt-4 flex items-center gap-2">
            <span className="text-[#00E5FF] font-bold text-base">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[#10B981] font-mono text-sm caret-[#10B981] placeholder:text-[#10B981]/30 focus:ring-0"
              placeholder={
                language === 'fr' ? 'posez une question (ex: pfe, certifs, parcours)...' : 'ask a question (e.g., pfe, certs, background)...'
              }
              aria-label={
                language === 'fr'
                  ? 'Question pour AskInza'
                  : 'Question for AskInza'
              }
              autoComplete="off"
              spellCheck={false}
            />
            {/* Blinking cursor visual indicator next to input */}
            <span
              className="w-[2px] h-4 bg-[#10B981] inline-block animate-[blink_1s_steps(2)_infinite]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default AskInza;
