/**
 * Programmatic sound generator using Web Audio API.
 * Creates short retro-style sound effects as Phaser audio entries.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function createBuffer(duration, fn) {
  const ctx = getCtx();
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * duration);
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = fn(i / sr, i / len);
  }
  return buf;
}

/** Short beep for countdown numbers */
export function createCountdownBeep() {
  return createBuffer(0.15, (t, p) => {
    const freq = 440;
    const env = 1 - p;
    return Math.sin(2 * Math.PI * freq * t) * env * 0.4;
  });
}

/** Higher beep for "GO!" */
export function createGoBeep() {
  return createBuffer(0.25, (t, p) => {
    const freq = 880;
    const env = 1 - p * p;
    return Math.sin(2 * Math.PI * freq * t) * env * 0.5;
  });
}

/** Very quiet footstep — short noise burst */
export function createWalkSound() {
  return createBuffer(0.06, (t, p) => {
    const env = (1 - p) * (1 - p);
    return (Math.random() * 2 - 1) * env * 0.08;
  });
}

/** Jump — rising pitch */
export function createJumpSound() {
  return createBuffer(0.15, (t, p) => {
    const freq = 200 + p * 400;
    const env = 1 - p;
    return Math.sin(2 * Math.PI * freq * t) * env * 0.3;
  });
}

/** Finish fanfare — ascending arpeggio */
export function createFinishSound() {
  return createBuffer(0.6, (t, p) => {
    // 3-note ascending chord
    const note = p < 0.33 ? 523 : p < 0.66 ? 659 : 784; // C5, E5, G5
    const localP = (p % 0.33) / 0.33;
    const env = (1 - localP) * 0.8;
    return Math.sin(2 * Math.PI * note * t) * env * 0.35;
  });
}

/** Dash whoosh */
export function createDashSound() {
  return createBuffer(0.12, (t, p) => {
    const freq = 150 - p * 100;
    const env = (1 - p);
    const noise = (Math.random() * 2 - 1) * 0.15;
    return (Math.sin(2 * Math.PI * freq * t) * 0.2 + noise) * env;
  });
}

/** Death / spike hit */
export function createHitSound() {
  return createBuffer(0.2, (t, p) => {
    const freq = 180 - p * 120;
    const env = (1 - p);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.35 +
      (Math.random() * 2 - 1) * env * 0.1;
  });
}

/**
 * Register all sounds into Phaser's sound manager.
 * Call from BootScene after scene is ready.
 */
export function registerSounds(scene) {
  const ctx = getCtx();
  const sounds = {
    sfx_countdown: createCountdownBeep(),
    sfx_go: createGoBeep(),
    sfx_walk: createWalkSound(),
    sfx_jump: createJumpSound(),
    sfx_finish: createFinishSound(),
    sfx_dash: createDashSound(),
    sfx_hit: createHitSound(),
  };

  for (const [key, buffer] of Object.entries(sounds)) {
    // Convert AudioBuffer to a blob URL for Phaser
    const numCh = buffer.numberOfChannels;
    const length = buffer.length;
    const sr = buffer.sampleRate;

    // Create WAV file in memory
    const wavBuf = audioBufferToWav(buffer);
    const blob = new Blob([wavBuf], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    scene.load.audio(key, url);
  }
  // Start loading
  scene.load.start();
}

/** Minimal WAV encoder */
function audioBufferToWav(buffer) {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const data = buffer.getChannelData(0);
  const byteRate = sampleRate * numChannels * bitDepth / 8;
  const blockAlign = numChannels * bitDepth / 8;
  const dataSize = data.length * numChannels * bitDepth / 8;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return buf;
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
