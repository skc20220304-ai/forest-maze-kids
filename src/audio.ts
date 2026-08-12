const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
const MUTE_KEY = 'forest-maze:sound-muted';
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
let context: AudioContext | null = null;
let bgmTimer: number | null = null;
let nextNoteAt = 0;
let melodyIndex = 0;
let muted = localStorage.getItem(MUTE_KEY) === '1';

function getContext() {
  if (!AudioContextCtor) return null;
  context ??= new AudioContextCtor();
  if (context.state === 'suspended') void context.resume();
  return context;
}
function tone(frequency: number, duration: number, volume: number, when = getContext()?.currentTime ?? 0, type: OscillatorType = 'sine') {
  const ctx = getContext(); if (!ctx || muted) return;
  const oscillator = ctx.createOscillator(); const gain = ctx.createGain(); oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when); gain.gain.setValueAtTime(0.0001, when); gain.gain.exponentialRampToValueAtTime(volume, when + 0.015); gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain).connect(ctx.destination); oscillator.start(when); oscillator.stop(when + duration + 0.03);
}
function scheduleBgm() {
  const ctx = getContext(); if (!ctx || muted) return;
  while (nextNoteAt < ctx.currentTime + 0.25) { tone(melody[melodyIndex], 0.28, 0.018, nextNoteAt, 'triangle'); melodyIndex = (melodyIndex + 1) % melody.length; nextNoteAt += 0.42; }
  bgmTimer = window.setTimeout(scheduleBgm, 120);
}
function startBgm() { const ctx = getContext(); if (!ctx || muted || bgmTimer !== null) return; nextNoteAt = ctx.currentTime + 0.05; scheduleBgm(); }
function stopBgm() { if (bgmTimer !== null) window.clearTimeout(bgmTimer); bgmTimer = null; }
export function unlockAudio() { startBgm(); }
export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); if (muted) stopBgm(); else startBgm(); return muted; }
export function playSound(kind: 'move' | 'blocked' | 'star' | 'goal' | 'clear') {
  const ctx = getContext(); if (!ctx || muted) return; const when = ctx.currentTime;
  if (kind === 'move') tone(440, 0.07, 0.045, when, 'sine');
  if (kind === 'blocked') tone(175, 0.1, 0.04, when, 'square');
  if (kind === 'star') { tone(784, 0.12, 0.06, when, 'sine'); tone(1175, 0.18, 0.05, when + 0.09, 'sine'); }
  if (kind === 'goal') { tone(523, 0.13, 0.055, when, 'triangle'); tone(659, 0.13, 0.055, when + 0.1, 'triangle'); tone(784, 0.18, 0.065, when + 0.2, 'triangle'); }
  if (kind === 'clear') { [[523,.00],[659,.12],[784,.24],[1046,.38],[1318,.56]].forEach(([note,offset])=>tone(note,0.22,0.075,when+offset,'triangle')); tone(262,0.7,0.035,when,'sine'); }
}
