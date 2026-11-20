// FILE: Public entry point. Both engines play the same SynthPatch; createSynth picks one.
import { SynthPatch } from './synth';
import { NoteSynth, PatchSynth } from './classic/patchSynth';
import { WorkletSynth, workletReady } from './worklet/workletSynth';
import { workletTrim } from './worklet/workletTrim';

export * from './synth';
export { PatchSynth } from './classic/patchSynth';
export type { NoteSynth } from './classic/patchSynth';
export { WorkletSynth, loadWorklet, workletReady, isOfflineContext } from './worklet/workletSynth';
export { WORKLET_TRIM_DB, workletTrim } from './worklet/workletTrim';
export { LEGACY_PATCHES } from './worklet/legacyPatches';

export type EngineKind = 'classic' | 'worklet';
/**
 * Makes a synth for a patch. 'worklet' is used only when engine 2 is loaded (await loadWorklet() first) and the context is live;
 * otherwise it quietly falls back to the classic engine. `soundId` (a factory sound id) applies the measured loudness trim.
 */
export function createSynth(patch: SynthPatch, opts: { engine?: EngineKind; soundId?: string } = {}): NoteSynth {
  if (opts.engine === 'worklet' && workletReady()) return new WorkletSynth(patch, opts.soundId ? workletTrim(opts.soundId) : 0);
  return new PatchSynth(patch);
}
