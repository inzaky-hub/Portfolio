import { describe, it, expect } from 'vitest';
import { parseCommand } from '../utils/commandParser';

describe('commandParser', () => {
  it('parses "help" command correctly', () => {
    expect(parseCommand('help')).toEqual({ type: 'help' });
    expect(parseCommand('  HELP  ')).toEqual({ type: 'help' });
  });

  it('parses navigation commands correctly', () => {
    expect(parseCommand('book')).toEqual({ type: 'navigate', target: 'cover' });
    expect(parseCommand('rack 1')).toEqual({ type: 'navigate', target: 'architect' });
    expect(parseCommand('rack 2')).toEqual({ type: 'navigate', target: 'superpowers' });
    expect(parseCommand('rack 3')).toEqual({ type: 'navigate', target: 'missions' });
    expect(parseCommand('rack 4')).toEqual({ type: 'navigate', target: 'ask' });
    expect(parseCommand('ask inza')).toEqual({ type: 'navigate', target: 'ask' });
  });

  it('parses "mode quick" command correctly', () => {
    expect(parseCommand('mode quick')).toEqual({ type: 'quickMode' });
  });

  it('returns unknown for unrecognized commands', () => {
    expect(parseCommand('unknown_cmd')).toEqual({ type: 'unknown', raw: 'unknown_cmd' });
    expect(parseCommand('rack 5')).toEqual({ type: 'unknown', raw: 'rack 5' });
  });
});
