class Voice {
  constructor(audioCtx, frequency, velocity, destination) {
    this.audioCtx = audioCtx;
    this.osc = audioCtx.createOscillator();
    this.gain = audioCtx.createGain();
    this.filter = audioCtx.createBiquadFilter();

    // Choose a random soft waveform
    const waveTypes = ["sine", "triangle", "square"];
    this.osc.type = waveTypes[Math.floor(Math.random() * waveTypes.length)];

    // Add gentle detune
    this.osc.detune.value = (Math.random() - 0.5) * 20;

    // Set filter to mellow out the tone
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1000 + Math.random() * 1000; // Smooth highs

    // Envelope: soft attack/release
    const now = audioCtx.currentTime;
    this.gain.gain.setValueAtTime(0, now);
    this.gain.gain.linearRampToValueAtTime(velocity, now + 1); // Attack
    this.gain.gain.linearRampToValueAtTime(0.0001, now + 4); // Release

    this.osc.frequency.value = frequency;

    // Connect nodes: osc → filter → gain → destination
    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(destination);
  }

  start() {
    this.osc.start();
  }

  stop() {
    this.osc.stop(this.audioCtx.currentTime + 5); // Slightly after release ends
  }
}

// Expose globally
export default Voice;
