const EchoCenter = () => {
  return (
    <footer
      id="echo-center-root"
      aria-label="Echo Center Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[rgba(0,0,0,0.95)] border-t border-[rgba(0,229,255,0.3)] px-6 py-3 font-mono text-sm text-[#10B981] flex items-center justify-between backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <span className="text-[#00E5FF] font-bold select-none">echo:~$</span>
        <span className="text-xs text-[#9CA3AF]">
          type &apos;help&apos; for available commands...
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="inline-flex items-center gap-1.5 text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
          SOC ONLINE
        </span>
      </div>
    </footer>
  );
};

export default EchoCenter;
