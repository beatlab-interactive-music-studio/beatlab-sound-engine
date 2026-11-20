import { describe, it, expect } from 'vitest';
import { LEGACY_PATCHES } from '../src/worklet/legacyPatches';
import { WORKLET_TRIM_DB, workletTrim } from '../src/worklet/workletTrim';
import { FACTORY_SOUNDS, defaultPatch, makePatch, validatePatch, clampPatch } from '../src/synth';
import workletSource from '../src/worklet/voiceWorklet.js?raw';

describe('patch model', () => {
  it('the default patch is valid', () => { expect(validatePatch(defaultPatch()).ok).toBe(true); });
  it('every factory sound is valid', () => {
    for (const [id, f] of Object.entries(FACTORY_SOUNDS)) expect(validatePatch(f.patch).ok, id).toBe(true);
  });
  it('makePatch fills in what is missing and clampPatch keeps values in range', () => {
    const p = makePatch({ unison: 3 });
    expect(p.unison).toBe(3);
    expect(clampPatch({ ...p, unison: 99 }).unison).toBe(5);
  });
  it('a broken patch is rejected with a message', () => {
    const r = validatePatch({ osc1: 1 });
    expect(r.ok).toBe(false);
  });
});

describe('engine 2 data', () => {
  it('has a valid patch for the 11 basic instruments', () => {
    expect(Object.keys(LEGACY_PATCHES).sort()).toEqual(['airPad', 'bass', 'bell', 'drone', 'electricPiano', 'glassPad', 'lead', 'pluck', 'softSynth', 'strings', 'warmPad']);
    for (const [id, p] of Object.entries(LEGACY_PATCHES)) expect(validatePatch(p).ok, id).toBe(true);
  });
  it('loudness trims only name known sounds and stay within 12 dB', () => {
    for (const [id, db] of Object.entries(WORKLET_TRIM_DB)) {
      expect(id in FACTORY_SOUNDS || id in LEGACY_PATCHES, id).toBe(true);
      expect(Math.abs(db)).toBeLessThanOrEqual(12);
    }
    expect(workletTrim('does-not-exist')).toBe(0);
  });
  it('the worklet file compiles and registers its processor', () => {
    expect(workletSource).toContain("registerProcessor('beatlab-synth'");
    expect(() => new Function('AudioWorkletProcessor', 'registerProcessor', 'currentTime', 'sampleRate', workletSource)(class { port = {}; }, () => {}, 0, 44100)).not.toThrow();
  });
});
