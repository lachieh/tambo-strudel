/**
 * Type declarations for superdough
 *
 * superdough is Strudel's audio engine built on Web Audio API.
 * These types are constructed from the module's exports.
 */

declare module "superdough" {
  import type { MapStore } from "nanostores";

  /** Sound trigger function signature */
  export type SoundTrigger = (
    time: number,
    hap: Record<string, unknown>,
    hapDuration: number,
    cps: number,
    targetTime: number
  ) => void;

  /** Sound registration data */
  export interface SoundData {
    onTrigger: SoundTrigger;
    data?: Record<string, unknown>;
  }

  /** Map of all registered sounds */
  export type SoundMapValue = Record<string, SoundData>;

  /** Reactive map store containing all registered sounds */
  export const soundMap: MapStore<SoundMapValue>;

  /** Default maximum polyphony */
  export const DEFAULT_MAX_POLYPHONY: number;

  /** Warp modes for wavetable synthesis */
  export const Warpmode: Record<string, number>;

  /** Alias a bank of samples */
  export function aliasBank(bankName: string, alias: string): void;

  /** Audio analysers map */
  export const analysers: Map<string, AnalyserNode>;

  /** Analyser data map */
  export const analysersData: Map<string, Uint8Array>;

  /** Apply FM synthesis to oscillator */
  export function applyFM(
    param: AudioParam,
    event: Record<string, unknown>,
    time: number
  ): OscillatorNode | undefined;

  /** Apply gain curve transformation */
  export function applyGainCurve(value: number): number;

  /** Apply parameter modulators */
  export function applyParameterModulators(
    event: Record<string, unknown>,
    time: number,
    duration: number
  ): void;

  /** Connect audio node to destination */
  export function connectToDestination(
    source: AudioNode,
    destination?: AudioNode
  ): void;

  /** Create an audio filter */
  export function createFilter(
    audioContext: AudioContext,
    type: BiquadFilterType,
    frequency: number,
    q: number,
    event?: Record<string, unknown>,
    time?: number,
    duration?: number
  ): BiquadFilterNode;

  /** Destroy an AudioWorkletNode */
  export function destroyAudioWorkletNode(node: AudioWorkletNode): void;

  /** Available distortion algorithms */
  export const distortionAlgorithms: Record<string, (x: number) => number>;

  /** Main audio processing function */
  export function dough(
    event: Record<string, unknown>,
    time: number,
    duration: number,
    cps: number,
    targetTime: number
  ): Promise<void>;

  /** Trigger dough with event */
  export function doughTrigger(
    event: Record<string, unknown>,
    time: number,
    duration: number,
    cps: number,
    targetTime: number
  ): Promise<void>;

  /** Create dry/wet mix node */
  export function drywet(
    audioContext: AudioContext,
    dry: number
  ): { input: GainNode; output: GainNode };

  /** DSP worklet processing */
  export function dspWorklet(
    audioContext: AudioContext,
    processor: string,
    params?: Record<string, number>
  ): AudioWorkletNode;

  /** Effect send node */
  export function effectSend(
    audioContext: AudioContext,
    amount: number
  ): GainNode;

  /** Error logging function */
  export function errorLogger(error: Error): void;

  /** Fetch sample map from URL */
  export function fetchSampleMap(
    url: string
  ): Promise<[Record<string, unknown>, string]>;

  /** Create gain node */
  export function gainNode(audioContext: AudioContext, gain?: number): GainNode;

  /** Get ADSR envelope values */
  export function getADSRValues(
    values: [number?, number?, number?, number?],
    curve?: string,
    duration?: number
  ): [number, number, number, number];

  /** Get analyser by ID */
  export function getAnalyserById(id: string): AnalyserNode | undefined;

  /** Get analyser data */
  export function getAnalyzerData(id: string): Uint8Array | undefined;

  /** Get the current audio context */
  export function getAudioContext(): AudioContext;

  /** Get current audio context time */
  export function getAudioContextCurrentTime(): number;

  /** Get available audio devices */
  export function getAudioDevices(): Promise<Map<string, string>>;

  /** Get cached audio buffer */
  export function getCachedBuffer(url: string): AudioBuffer | undefined;

  /** Get compressor node */
  export function getCompressor(
    audioContext: AudioContext,
    options?: DynamicsCompressorOptions
  ): DynamicsCompressorNode;

  /** Get default value for parameter */
  export function getDefaultValue(param: string): number | undefined;

  /** Get distortion node */
  export function getDistortion(
    audioContext: AudioContext,
    amount: number,
    algorithm?: string
  ): WaveShaperNode;

  /** Get distortion algorithm function */
  export function getDistortionAlgorithm(
    name: string
  ): ((x: number) => number) | undefined;

  /** Get frequency from note value */
  export function getFrequencyFromValue(
    value: number | string,
    octave?: number
  ): number;

  /** Get LFO oscillator */
  export function getLfo(
    audioContext: AudioContext,
    time: number,
    duration: number,
    options: { frequency: number; depth: number }
  ): OscillatorNode;

  /** Get loaded audio buffer */
  export function getLoadedBuffer(url: string): AudioBuffer | undefined;

  /** Get oscillator node */
  export function getOscillator(
    audioContext: AudioContext,
    type: OscillatorType,
    frequency: number
  ): OscillatorNode;

  /** Get parameter ADSR envelope */
  export function getParamADSR(
    param: AudioParam,
    attack: number,
    decay: number,
    sustain: number,
    release: number,
    min: number,
    max: number,
    time: number,
    duration: number,
    curve?: string
  ): void;

  /** Get pitch envelope */
  export function getPitchEnvelope(
    param: AudioParam,
    event: Record<string, unknown>,
    time: number,
    duration: number
  ): OscillatorNode | undefined;

  /** Get sample buffer */
  export function getSampleBuffer(
    event: Record<string, unknown>,
    samples: Record<string, unknown>,
    resolveUrl?: (url: string) => Promise<string>
  ): Promise<{ buffer: AudioBuffer; playbackRate: number }>;

  /** Get sample buffer source */
  export function getSampleBufferSource(
    event: Record<string, unknown>,
    samples: Record<string, unknown>,
    resolveUrl?: (url: string) => Promise<string>
  ): Promise<{
    bufferSource: AudioBufferSourceNode;
    sliceDuration: number;
    offset: number;
  }>;

  /** Get sample info */
  export function getSampleInfo(
    event: Record<string, unknown>,
    samples: Record<string, unknown>
  ): {
    transpose: number;
    url: string;
    index: number;
    midi: number;
    label: string;
    playbackRate: number;
  };

  /** Get registered sound by name */
  export function getSound(name: string): SoundData | undefined;

  /** Get vibrato oscillator */
  export function getVibratoOscillator(
    param: AudioParam,
    event: Record<string, unknown>,
    time: number
  ): OscillatorNode | undefined;

  /** Get audio worklet */
  export function getWorklet(
    audioContext: AudioContext,
    processor: string,
    params?: Record<string, number>
  ): AudioWorkletNode;

  /** Get ZZFX sound */
  export function getZZFX(
    audioContext: AudioContext,
    params: number[]
  ): AudioBufferSourceNode;

  /** Initialize audio engine */
  export function initAudio(): Promise<AudioContext>;

  /** Initialize audio on first user click */
  export function initAudioOnFirstClick(): void;

  /** Load audio buffer from URL */
  export function loadBuffer(
    url: string,
    audioContext: AudioContext,
    label?: string
  ): Promise<AudioBuffer>;

  /** Logger function */
  export function logger(message: string, ...args: unknown[]): void;

  /** Available noise types */
  export const noises: Record<string, AudioBuffer>;

  /** Sample trigger callback */
  export function onTriggerSample(
    time: number,
    hap: Record<string, unknown>,
    hapDuration: number,
    cps: number,
    targetTime: number
  ): Promise<void>;

  /** Synth trigger callback */
  export function onTriggerSynth(
    time: number,
    hap: Record<string, unknown>,
    hapDuration: number,
    cps: number,
    targetTime: number
  ): Promise<void>;

  /** Process sample map */
  export function processSampleMap(
    map: Record<string, unknown>,
    callback: (name: string, samples: unknown[]) => void,
    baseUrl?: string
  ): void;

  /** Register sample source */
  export function registerSampleSource(
    name: string,
    samples: unknown[],
    options?: { baseUrl?: string; prebake?: boolean; tag?: string }
  ): void;

  /** Register samples with URL prefix */
  export function registerSamplesPrefix(prefix: string, url: string): void;

  /** Register a sound */
  export function registerSound(
    name: string,
    onTrigger: SoundTrigger,
    data?: Record<string, unknown>
  ): void;

  /** Register built-in synth sounds */
  export function registerSynthSounds(): Promise<void>;

  /** Register wavetable */
  export function registerWaveTable(name: string, data: Float32Array[]): void;

  /** Register audio worklet processor */
  export function registerWorklet(
    audioContext: AudioContext,
    processor: string,
    url: string
  ): Promise<void>;

  /** Register ZZFX sounds */
  export function registerZZFXSounds(): Promise<void>;

  /** Reset default parameter values */
  export function resetDefaultValues(): void;

  /** Reset all defaults */
  export function resetDefaults(): void;

  /** Reset global effects */
  export function resetGlobalEffects(): void;

  /** Reset all loaded sounds */
  export function resetLoadedSounds(): void;

  /** Reverse an audio buffer */
  export function reverseBuffer(buffer: AudioBuffer): AudioBuffer;

  /**
   * Load samples from URL or object
   * @example samples('github:tidalcycles/dirt-samples')
   * @example samples({ bd: ['bd/0.wav'] }, 'https://example.com/')
   */
  export function samples(
    source: string | Record<string, unknown>,
    baseUrl?: string,
    options?: { prebake?: boolean; tag?: string }
  ): Promise<void>;

  /** Set a default value */
  export function setDefault(param: string, value: number): void;

  /** Set default audio context */
  export function setDefaultAudioContext(context: AudioContext): void;

  /** Set default value for parameter */
  export function setDefaultValue(param: string, value: number): void;

  /** Set multiple default values */
  export function setDefaultValues(values: Record<string, number>): void;

  /** Set gain curve function */
  export function setGainCurve(curve: (value: number) => number): void;

  /** Set logger function */
  export function setLogger(fn: (message: string, ...args: unknown[]) => void): void;

  /** Set maximum polyphony */
  export function setMaxPolyphony(max: number): void;

  /** Set multi-channel orbits mode */
  export function setMultiChannelOrbits(enabled: boolean): void;

  /** Set version-specific defaults */
  export function setVersionDefaults(version: string): void;

  /** Create sound alias */
  export function soundAlias(alias: string, original: string): void;

  /** Main superdough function */
  export function superdough(
    event: Record<string, unknown>,
    time: number,
    duration: number,
    cps?: number,
    targetTime?: number
  ): Promise<void>;

  /** Superdough trigger function */
  export function superdoughTrigger(
    event: Record<string, unknown>,
    time: number,
    duration: number,
    cps: number,
    targetTime: number
  ): Promise<void>;

  /** Wavetables map */
  export const tables: Map<string, Float32Array[]>;

  /** Generate waveform from function */
  export function waveformN(
    fn: (t: number) => number,
    samples?: number
  ): Float32Array;

  /** Create web audio timeout */
  export function webAudioTimeout(
    audioContext: AudioContext,
    callback: () => void,
    time: number,
    duration: number
  ): { stop: (time?: number) => void };
}
