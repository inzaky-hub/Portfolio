export type ParsedCommand =
  | { type: 'navigate'; target: 'cover' | 'architect' | 'superpowers' | 'missions' | 'ask' }
  | { type: 'quickMode' }
  | { type: 'help' }
  | { type: 'unknown'; raw: string };

export function parseCommand(input: string): ParsedCommand {
  const cmd = input.trim().toLowerCase();
  if (cmd === 'book') return { type: 'navigate', target: 'cover' };
  if (cmd === 'rack 1') return { type: 'navigate', target: 'architect' };
  if (cmd === 'rack 2') return { type: 'navigate', target: 'superpowers' };
  if (cmd === 'rack 3') return { type: 'navigate', target: 'missions' };
  if (cmd === 'rack 4') return { type: 'navigate', target: 'ask' };
  if (cmd === 'ask inza') return { type: 'navigate', target: 'ask' };
  if (cmd === 'help') return { type: 'help' };
  if (cmd === 'mode quick') return { type: 'quickMode' };
  return { type: 'unknown', raw: input };
}
