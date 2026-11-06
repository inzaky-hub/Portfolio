import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export interface EchoCenterProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  history?: string[];
  onCommand?: (cmd: string) => void;
  language?: 'fr' | 'en';
}

interface LogEntry {
  id: number;
  command: string;
  output?: string;
  isError?: boolean;
}

const EchoCenter = (props: EchoCenterProps) => {
  const context = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Support both props and context
  const isCollapsed = props.collapsed ?? context.echoCollapsed;
  const toggleCollapse = props.onToggleCollapse ?? context.toggleEchoCollapsed;
  const history = props.history ?? context.echoHistory;
  const pushCommand = context.pushEchoCommand;
  const toggleQuickRead = context.toggleQuickReadMode;

  const [inputVal, setInputVal] = useState('');
  const [_historyIndex, setHistoryIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll history log on new output
  useEffect(() => {
    if (!isCollapsed) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isCollapsed]);

  // Focus input when expanded
  useEffect(() => {
    if (!isCollapsed) {
      inputRef.current?.focus();
    }
  }, [isCollapsed]);

  const executeCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Push to global bounded history
    pushCommand(trimmed);
    if (props.onCommand) {
      props.onCommand(trimmed);
    }

    const nextId = logCounter + 1;
    setLogCounter(nextId);

    const cmd = trimmed.toLowerCase();
    let outputText = '';
    let isErr = false;

    if (cmd === 'book') {
      navigate('/');
      outputText = 'Navigating to Cover...';
    } else if (cmd === 'rack 1') {
      navigate('/architect');
      outputText = 'Navigating to Architect (Rack 1)...';
    } else if (cmd === 'rack 2') {
      navigate('/superpowers');
      outputText = 'Navigating to Superpowers (Rack 2)...';
    } else if (cmd === 'rack 3') {
      navigate('/missions');
      outputText = 'Navigating to Missions (Rack 3)...';
    } else if (cmd === 'rack 4') {
      navigate('/ask');
      outputText = 'Navigating to AskInza (Rack 4)...';
    } else if (cmd === 'ask inza') {
      navigate('/ask');
      outputText = 'Navigating to AskInza...';
    } else if (cmd === 'mode quick') {
      toggleQuickRead();
      outputText = 'Toggled QuickRead Mode.';
    } else if (cmd === 'help') {
      outputText = t('echo.help');
    } else if (cmd.startsWith('rack')) {
      outputText = t('echo.error.rackRange');
      isErr = true;
    } else {
      outputText = t('echo.error.unknownCommand');
      isErr = true;
    }

    setLogs((prev) => [
      ...prev.slice(-9), // Keep last 10 entries in terminal view
      { id: nextId, command: trimmed, output: outputText, isError: isErr },
    ]);

    setInputVal('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        const nextIndex =
          prev === -1 ? history.length - 1 : Math.max(0, prev - 1);
        setInputVal(history[nextIndex] ?? '');
        return nextIndex;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        if (prev === -1) return -1;
        const nextIndex = prev + 1;
        if (nextIndex >= history.length) {
          setInputVal('');
          return -1;
        }
        setInputVal(history[nextIndex] ?? '');
        return nextIndex;
      });
    }
  };

  return (
    <aside
      id="echo-center-root"
      aria-label="Echo Center Terminal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[rgba(0,0,0,0.95)] border-t border-[rgba(0,229,255,0.3)] font-mono text-sm backdrop-blur-md transition-all duration-300"
    >
      {/* Top Header Bar — clickable & keyboard accessible */}
      <button
        type="button"
        onClick={toggleCollapse}
        aria-expanded={!isCollapsed}
        className="w-full px-6 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#00E5FF] font-bold select-none">&gt;</span>
          <span className="text-[#00E5FF] font-semibold text-xs uppercase tracking-wider">
            Echo Center
          </span>
          <span className="text-xs text-[#9CA3AF] hidden sm:inline">
            [ book · rack 1-4 · ask inza · mode quick · help ]
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
            CLI READY
          </span>
          <span className="text-[#00E5FF] text-xs">
            {isCollapsed ? '▲ Expand' : '▼ Collapse'}
          </span>
        </div>
      </button>

      {/* Expanded Terminal Panel */}
      {!isCollapsed && (
        <div className="border-t border-[rgba(0,229,255,0.15)] px-6 py-4 space-y-3 bg-black/80">
          {/* Scrollable command history output */}
          <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
            {logs.length === 0 ? (
              <p className="text-[#9CA3AF]/70 italic">
                {t('echo.help')}
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[#00E5FF]">
                    <span>echo:~$</span>
                    <span className="text-white">{log.command}</span>
                  </div>
                  {log.output && (
                    <p
                      className={`pl-4 ${
                        log.isError ? 'text-[#FF9900]' : 'text-[#10B981]'
                      }`}
                    >
                      {log.output}
                    </p>
                  )}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Interactive input row */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-[#00E5FF] font-bold">echo:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[#10B981] font-mono text-xs caret-[#10B981] placeholder:text-[#9CA3AF]/40 focus:ring-0"
              placeholder="type a command (e.g. rack 1, book, mode quick, help)..."
              aria-label="Echo Center command input"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default EchoCenter;
