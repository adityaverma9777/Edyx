export default class AudioMeter {
  private analyser: AnalyserNode;
  private timeDomain: Uint8Array;
  private freqBuf: Uint8Array;
  private smoothedLevel = 0;

  static NOISE_GATE = 0.015;
  static GAIN = 10;
  static ATTACK = 0.14;
  static RELEASE = 0.045;

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
    this.timeDomain = new Uint8Array(analyser.fftSize);
    this.freqBuf = new Uint8Array(analyser.frequencyBinCount);
  }

  read(dt: number): { level: number; freqData: Uint8Array } {
    this.analyser.getByteTimeDomainData(this.timeDomain as any);
    this.analyser.getByteFrequencyData(this.freqBuf as any);

    let sum = 0;
    for (let i = 0; i < this.timeDomain.length; i++) {
      const sample = (this.timeDomain[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / this.timeDomain.length);

    const gated = rms < AudioMeter.NOISE_GATE ? 0 : rms;
    const normalized = Math.min(1, Math.max(0, gated * AudioMeter.GAIN));

    const rate = normalized > this.smoothedLevel
      ? 1 - Math.pow(1 - AudioMeter.ATTACK, dt)
      : 1 - Math.pow(1 - AudioMeter.RELEASE, dt);

    this.smoothedLevel += (normalized - this.smoothedLevel) * rate;

    return { level: Math.min(1, Math.max(0, this.smoothedLevel)), freqData: this.freqBuf };
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  reset() {
    this.smoothedLevel = 0;
  }
}
