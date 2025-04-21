class Voice {
  constructor(audioCtx, frequency, velocity, destination) {
    this.audioCtx = audioCtx;
    const now = audioCtx.currentTime;

    // Choose a Random Waveform
    this.osc = audioCtx.createOscillator();
    this.osc.type = ["sine", "triangle"][Math.floor(Math.random() * 2)];
    this.osc.frequency.setValueAtTime(frequency, now);
    this.osc.detune.value = (Math.random() - 0.5) * 10;

    // Envelope w/ Soft Attack & Release
    // Altered to be more mellow
    this.gain = audioCtx.createGain();
    this.gain.gain.setValueAtTime(0, now);
    this.gain.gain.linearRampToValueAtTime(velocity * 0.6, now + 1.5); //Attack
    this.gain.gain.linearRampToValueAtTime(0.0001, now + 6); // Release

    // Filter w/ Lowpass to mellow out the tone
    this.filter = audioCtx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(600 + Math.random() * 400, now);

    // Stereo Panner
    this.panner = audioCtx.createStereoPanner();
    this.panner.pan.setValueAtTime((Math.random() - 0.5) * 0.5, now);

    // LFO Vibrato
    this.lfo = audioCtx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.3 + Math.random() * 0.4, now);
    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.setValueAtTime(2 + Math.random() * 2, now);
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.osc.detune);

    // Sparkling Layer (with a 40% chance / this could be changed?)
    if (Math.random() < 0.4) {
      this.sparkleOsc = audioCtx.createOscillator();
      this.sparkleOsc.type = ["triangle", "sawtooth", "sine"][
        Math.floor(Math.random() * 2)
      ];
      this.sparkleOsc.frequency.setValueAtTime(
        1600 + Math.random() * 1200,
        now
      ); // A high sparkling tone

      // (Slight) Pitch Drop
      // For a "Wilting" Effect?
      this.sparkleOsc.frequency.exponentialRampToValueAtTime(300, now + 1.2);

      // Echo With Delay
      this.sparkleDelay = audioCtx.createDelay();
      this.sparkleDelay.delayTime.value = 0.25 + Math.random() * 0.15;

      // Gain Envelope (for Sparkling Layer)
      this.sparkleGain = audioCtx.createGain();
      this.sparkleGain.gain.setValueAtTime(velocity * 0.15, now);
      this.sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      this.sparkleOsc
        .connect(this.sparkleGain)
        .connect(this.sparkleDelay)
        .connect(destination);
    }

    // Connect the Nodes
    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.panner).connect(destination);
  }

  start() {
    const now = this.audioCtx.currentTime;
    this.osc.start(now);
    this.lfo.start(now);
    if (this.sparkleOsc) this.sparkleOsc.start(now);
  }

  stop() {
    const now = this.audioCtx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setTargetAtTime(0.0001, now, 0.7);

    this.osc.stop(now + 3);
    this.lfo.stop(now + 3);
    if (this.sparkleOsc) this.sparkleOsc.stop(now + 3);
  }
}

// Export into soundscape.js
export default Voice;
