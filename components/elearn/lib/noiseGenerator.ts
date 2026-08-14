import type { NoiseType } from './focusStorage';

// Generador de ruido ambiental con Web Audio. A diferencia de los streams de
// YouTube, se sintetiza en el navegador: no depende de la red, no se puede
// "caer" y funciona sin conexión.

function fillBuffer(data: Float32Array, type: NoiseType): void {
  if (type === 'white') {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return;
  }
  if (type === 'brown') {
    // Ruido marrón: integración del ruido blanco (más energía en graves).
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return;
  }
  // Ruido rosa: aproximación de Paul Kellet (filtro de -3 dB/octava).
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
}

export class NoisePlayer {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private currentType: NoiseType | null = null;

  // Reproduce (o cambia) el tipo de ruido. Debe llamarse desde un gesto del
  // usuario la primera vez: los navegadores bloquean el audio automático.
  play(type: NoiseType, volume: number): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();

    if (this.currentType !== type || !this.source) {
      this.stopSource();
      const seconds = 4;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * seconds, this.ctx.sampleRate);
      fillBuffer(buffer.getChannelData(0), type);

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.value = volume / 100;

      source.connect(gain).connect(this.ctx.destination);
      source.start();

      this.source = source;
      this.gain = gain;
      this.currentType = type;
    } else {
      this.setVolume(volume);
    }
  }

  setVolume(volume: number): void {
    if (this.gain && this.ctx) {
      // Rampa corta para que el cambio no "chasquee".
      this.gain.gain.setTargetAtTime(volume / 100, this.ctx.currentTime, 0.05);
    }
  }

  stop(): void {
    this.stopSource();
    this.currentType = null;
  }

  private stopSource(): void {
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        // ya estaba detenido
      }
      this.source.disconnect();
      this.source = null;
    }
    if (this.gain) {
      this.gain.disconnect();
      this.gain = null;
    }
  }

  dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
