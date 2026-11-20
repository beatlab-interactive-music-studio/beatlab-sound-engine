# BeatLab Sound Engine

The sound engines of [BeatLab](https://github.com/NavidRahmani94/beatlab-interactive-music-studio), an interactive music studio that runs in the browser. This repository holds the synthesizer code on its own, so it can be read, tested and reused without the rest of the app.

There are **two engines that play the same sounds**. A sound is described once, as a plain data object called a *patch*, and either engine can play it.

| | Classic engine | Engine 2 |
|---|---|---|
| Built with | Tone.js and Web Audio nodes | One AudioWorklet node per sound |
| Where the work happens | Main audio graph, about 10 nodes per note | Plain code on the audio thread, all voices in one node |
| Strength | Simple, exact, works offline (Tone.Offline) | Far lighter on the CPU, so big chords do not crackle |
| Weak point | Many notes at once can overload the audio thread | Sound is close to the classic engine but not identical |
| Code | `src/classic/patchSynth.ts` | `src/worklet/` |

## Why a second engine

With the classic engine, every note builds a small graph of oscillators, filters, envelopes and gains. A six-note chord played on every sixteenth note with a pad sound means hundreds of nodes per second, and on a modest computer the audio thread falls behind. That is the crackle you hear when several instruments play chords together.

Engine 2 computes every voice of a sound inside a single AudioWorklet node. Notes arrive as small messages with an exact start time on the audio clock, so timing stays sample accurate.

### Measured cost

We rendered the same chords offline with both engines and compared render time to audio time (lower is better; 1.0 means the computer can only just keep up). The numbers come from one test machine, so only the ratios matter.

| Sound and chord | Classic | Engine 2 | Ratio |
|---|---|---|---|
| warm pad, 4 notes every 1/8 | 0.45 | 0.04 | about 12x |
| warm pad, 6 notes every 1/16 | 0.95 | 0.04 | about 26x |
| supersaw, 4 notes every 1/8 | 1.26 | 0.03 | about 43x |
| supersaw, 6 notes every 1/16 | 2.26 | 0.06 | about 39x |
| cinematic, 4 notes every 1/8 | 1.47 | 0.07 | about 21x |
| choir pad, 4 notes every 1/8 | 0.88 | 0.05 | about 17x |

The classic figures include the app's master chain, so the true gap for the voices alone is somewhat smaller. It is still large.

## What a patch can do

Defined in `src/synth.ts` (pure data and validation, no audio code):

- two oscillators: sine, triangle, saw, square, pulse, PWM, or FM (index and ratio), with octave and fine tune
- unison (up to 5 copies) with spread, and a noise source (white, pink, brown)
- filter: low-pass, high-pass, band-pass or notch, 12 or 24 dB, with its own envelope
- amplitude envelope, LFO (vibrato, filter wobble, tremolo), drive, stereo chorus
- volume and transpose

`FACTORY_SOUNDS` contains about 70 ready-made sounds, grouped (keys, organs, bells, plucked strings, leads, bass, pads and more).

## Using it

```ts
import { createSynth, loadWorklet, FACTORY_SOUNDS } from './src';
import * as Tone from 'tone';

await Tone.start();
await loadWorklet();                                   // loads engine 2 (needs http(s), see below)

const synth = createSynth(FACTORY_SOUNDS.supersaw.patch, { engine: 'worklet', soundId: 'supersaw' });
synth.connect(Tone.getDestination());

const now = Tone.now();
['C4', 'E4', 'G4'].forEach(n => synth.triggerAttackRelease(n, 0.5, now, 0.8));
```

`createSynth` falls back to the classic engine when engine 2 is not loaded, so the same code runs everywhere.

For key-down / key-up playing use `triggerAttack(note, time, velocity)` and `triggerRelease(note, time)`. Slide notes pass a list of `{ at, cents }` points as the last argument of `triggerAttackRelease`.

### Things to know

- **Open the page over http(s).** Browsers do not let a page opened straight from a file (`file://`) load an AudioWorklet. `loadWorklet()` then returns `false` and the classic engine is used.
- **Use the classic engine for offline rendering** (`Tone.Offline`, WAV export). Engine 2 receives its notes by message, and an offline render does not deliver messages in time. `isOfflineContext()` tells you when that is the case.
- **Turn engine 2 off** by setting `localStorage['beatlab.engine2']` to `'off'` (read once per page load).
- **Loudness.** Each engine has its own gain behaviour, so `src/worklet/workletTrim.ts` stores a measured correction in dB per factory sound. `createSynth` applies it when you pass `soundId`.

## Files

```
src/
  synth.ts                 patch model, validation, random patches, factory sounds
  index.ts                 public entry point and createSynth
  classic/patchSynth.ts    classic engine (Tone.js nodes)
  worklet/
    voiceWorklet.js        engine 2 processor (runs on the audio thread)
    workletSynth.ts        loads the worklet and wraps it as a synth
    workletTrim.ts         loudness correction per sound
    legacyPatches.ts       the 11 basic instruments as patches
tests/engines.test.ts      patch model and engine 2 data
```

## Run the tests

```
npm install
npm test
npm run typecheck
```

## Limits

- Engine 2 sounds close to the classic engine but not the same. FM sounds in particular keep a fixed modulation depth, where the classic engine lets it fade over the note. If a sound feels off, the patch values or the trim in `workletTrim.ts` are the place to adjust.
- The comparison above measures CPU cost and loudness, not tone. Tone has not been compared formally.
- A very dense setup (several instruments, 5 or 6 note chords on 1/16 notes, thick unison pads) is still heavy on slow computers, with either engine.
- There is no license file yet.
