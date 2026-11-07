import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { parseCommand } from '../../utils/commandParser';
import type { ParsedCommand } from '../../utils/commandParser';

export interface EchoCenterProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  history?: string[];
  onCommand?: (cmd: string) => void | ParsedCommand;
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

  // Height state: persisted in sessionStorage, min 120px, max 50vh
  const [terminalHeight, setTerminalHeight] = useState<number>(() => {
    if (typeof window === 'undefined') return 240;
    const saved = sessionStorage.getItem('echoTerminalHeight');
    const parsed = saved ? Number(saved) : 240;
    const maxH = window.innerHeight * 0.5;
    return Math.min(maxH, Math.max(120, Number.isFinite(parsed) ? parsed : 240));
  });

  // Position state: 'left' | 'right', persisted in sessionStorage (max-width 480px)
  const [dockPosition, setDockPosition] = useState<'left' | 'right'>(() => {
    if (typeof window === 'undefined') return 'right';
    const saved = sessionStorage.getItem('echoDockPosition');
    return saved === 'left' || saved === 'right' ? saved : 'right';
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll history log on new output
  useEffect(() => {
    if (!isCollapsed && typeof logsEndRef.current?.scrollIntoView === 'function') {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isCollapsed]);

  // Focus input when expanded
  useEffect(() => {
    if (!isCollapsed) {
      inputRef.current?.focus();
    }
  }, [isCollapsed]);

  const toggleDockPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = dockPosition === 'right' ? 'left' : 'right';
    setDockPosition(next);
    sessionStorage.setItem('echoDockPosition', next);
  };

  // Resize handling via mouse drag
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = terminalHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const maxH = window.innerHeight * 0.5;
      const minH = 120;
      const nextH = Math.min(maxH, Math.max(minH, startH + delta));
      setTerminalHeight(nextH);
      sessionStorage.setItem('echoTerminalHeight', String(Math.round(nextH)));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Resize handling via touch drag
  const handleTouchResizeStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const startY = touch.clientY;
    const startH = terminalHeight;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      if (!currentTouch) return;
      const delta = startY - currentTouch.clientY;
      const maxH = window.innerHeight * 0.5;
      const minH = 120;
      const nextH = Math.min(maxH, Math.max(minH, startH + delta));
      setTerminalHeight(nextH);
      sessionStorage.setItem('echoTerminalHeight', String(Math.round(nextH)));
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Keyboard accessibility for resize handle
  const handleResizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const maxH = window.innerHeight * 0.5;
      const nextH = Math.min(maxH, terminalHeight + 20);
      setTerminalHeight(nextH);
      sessionStorage.setItem('echoTerminalHeight', String(Math.round(nextH)));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextH = Math.max(120, terminalHeight - 20);
      setTerminalHeight(nextH);
      sessionStorage.setItem('echoTerminalHeight', String(Math.round(nextH)));
    }
  };

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

    const parsed = parseCommand(trimmed);
    let outputText = '';
    let isErr = false;

    switch (parsed.type) {
      case 'navigate': {
        const routeMap: Record<string, { path: string; label: string }> = {
          cover: { path: '/', label: 'Cover' },
          architect: { path: '/architect', label: 'Architect (Rack 1)' },
          superpowers: { path: '/superpowers', label: 'Superpowers (Rack 2)' },
          missions: { path: '/missions', label: 'Missions (Rack 3)' },
          ask: { path: '/ask', label: 'AskInza (Rack 4)' },
        };
        const dest = routeMap[parsed.target];
        if (dest) {
          navigate(dest.path);
          outputText = `Navigating to ${dest.label}...`;
        }
        break;
      }
      case 'quickMode': {
        toggleQuickRead();
        outputText = 'Toggled QuickRead Mode.';
        break;
      }
      case 'help': {
        outputText = [
          'Available commands:',
          '  book → navigate to Cover',
          '  rack 1 → Architect',
          '  rack 2 → Superpowers',
          '  rack 3 → Missions',
          '  rack 4 → AskInza',
          '  ask inza → AskInza',
          '  mode quick → toggle QuickRead',
          '  help → this message',
        ].join('\n');
        break;
      }
      case 'unknown': {
        const cmd = trimmed.toLowerCase();
        if (cmd.startsWith('rack')) {
          outputText = t('echo.error.rackRange');
        } else {
          outputText = t('echo.error.unknownCommand');
        }
        isErr = true;
        break;
      }
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

  // Dynamic dock position classes
  const dockClasses = isCollapsed
    ? 'bottom-0 left-0 right-0 w-full'
    : dockPosition === 'left'
    ? 'bottom-0 left-0 sm:left-4 right-auto w-full sm:max-w-[480px] sm:rounded-t-xl border-t sm:border-r sm:border-l'
    : 'bottom-0 right-0 sm:right-4 left-auto w-full sm:max-w-[480px] sm:rounded-t-xl border-t sm:border-l sm:border-r';

  return (
    <aside
      id="echo-center-root"
      aria-label="Echo Center Terminal"
      className={`fixed z-40 bg-[rgba(10,14,26,0.97)] border-[rgba(0,229,255,0.3)] font-mono text-sm backdrop-blur-md transition-all duration-200 shadow-[0_0_35px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ${dockClasses}`}
      style={{
        height: isCollapsed ? '40px' : `${terminalHeight}px`,
        maxHeight: '50vh',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. MINIMIZED STATE: Single 40px bar with prompt & hint                    */}
      {/* ========================================================================= */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={toggleCollapse}
          aria-expanded={false}
          aria-label="Agrandir le terminal Echo Center"
          className="w-full h-[40px] px-5 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-[#00E5FF] font-bold text-xs select-none">echo:~$</span>
            <span className="text-xs text-[#9CA3AF] italic select-none">Cliquez pour ouvrir</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#10B981] text-[11px] hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981] animate-pulse" />
              CLI READY
            </span>
            <span className="text-[#00E5FF] text-xs font-bold" aria-hidden="true">
              ▲
            </span>
          </div>
        </button>
      ) : (
        /* ========================================================================= */
        /* 2. EXPANDED STATE: Resize handle + Header + Terminal logs + Input          */
        /* ========================================================================= */
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Top edge resize handle: min 120px, max 50vh */}
          <div
            role="slider"
            aria-label="Redimensionner la hauteur du terminal"
            aria-valuemin={120}
            aria-valuemax={Math.round(typeof window !== 'undefined' ? window.innerHeight * 0.5 : 500)}
            aria-valuenow={Math.round(terminalHeight)}
            tabIndex={0}
            onMouseDown={handleResizeStart}
            onTouchStart={handleTouchResizeStart}
            onKeyDown={handleResizeKeyDown}
            title="Glisser pour redimensionner (touches ↑ / ↓ au clavier)"
            className="w-full h-2.5 cursor-row-resize flex items-center justify-center bg-transparent hover:bg-[#00E5FF]/20 active:bg-[#00E5FF]/40 transition-colors group flex-shrink-0 focus:outline-none focus-visible:bg-[#00E5FF]/30 select-none"
          >
            <div className="w-12 h-1 bg-[rgba(0,229,255,0.4)] rounded-full group-hover:bg-[#00E5FF] group-focus-visible:bg-[#00E5FF] transition-colors" />
          </div>

          {/* Terminal Header with Title, Position Toggle, and Minimize Button */}
          <div className="px-4 py-1.5 flex items-center justify-between border-b border-[rgba(0,229,255,0.15)] flex-shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-[#00E5FF] font-bold text-xs select-none">&gt;</span>
              <span className="text-[#00E5FF] font-semibold text-xs uppercase tracking-wider select-none">
                Echo Center
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#10B981] text-[10px] ml-1.5 hidden xs:inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981] animate-pulse" />
                CLI READY
              </span>
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center gap-2">
              {/* Position Toggle (Left / Right) */}
              <button
                type="button"
                onClick={toggleDockPosition}
                aria-label={`Positionner le terminal à ${dockPosition === 'right' ? 'gauche' : 'droite'}`}
                title={`Positionner le terminal à ${dockPosition === 'right' ? 'gauche' : 'droite'}`}
                className="px-2 py-0.5 rounded text-[11px] font-mono text-[#00E5FF] bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.3)] hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00E5FF]"
              >
                {dockPosition === 'right' ? '◧ Gauche' : '◨ Droite'}
              </button>

              {/* Minimize Button: small chevron "⌄" */}
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label="Minimiser le terminal Echo Center"
                title="Minimiser le terminal"
                className="w-6 h-6 flex items-center justify-center rounded text-base font-bold text-[#00E5FF] hover:bg-white/10 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00E5FF]"
              >
                ⌄
              </button>
            </div>
          </div>

          {/* Expanded Terminal Panel: Scrollable logs & command input */}
          <div className="flex-1 flex flex-col min-h-0 px-4 py-3 space-y-2 bg-black/85 overflow-hidden">
            {/* Scrollable command history output */}
            <div className="flex-1 overflow-y-auto space-y-2 text-xs min-h-0 pr-1">
              {logs.length === 0 ? (
                <p className="text-[#9CA3AF]/70 italic select-none">
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
                        className={`pl-4 whitespace-pre-wrap ${
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
            <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-shrink-0">
              <span className="text-[#00E5FF] font-bold text-xs select-none">echo:~$</span>
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
        </div>
      )}
    </aside>
  );
};

export default EchoCenter;
