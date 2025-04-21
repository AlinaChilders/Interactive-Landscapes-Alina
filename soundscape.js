import Voice from "./Voice.js";

// Set up Web Audio API
const audioCtx = new AudioContext();
const synthCtx = new AudioContext();
let ambientStarted = false;
let sfxReady = false;

// Preload the SFXs
const sfxFiles = {
  tree: "/assets/sounds/tree.mp3",
  lake: "/assets/sounds/lake.wav",
  shrub1: "/assets/sounds/shrub1.wav",
  shrub2: "/assets/sounds/shrub2.wav",
  shrub3: "/assets/sounds/shrub2.wav",
  shrub4: "/assets/sounds/shrub1.wav",
  mountain: "/assets/sounds/mountain.wav",
  star: "/assets/sounds/star.wav",
  moon: "/assets/sounds/moon.wav",
  sand: "/assets/sounds/sand.wav",
  constellation1: "/assets/sounds/constellation1.wav",
  constellation2: "/assets/sounds/constellation2.wav",
  constellation3: "/assets/sounds/constellation3.wav",
};

const sfxBuffers = {}; // Store Decoded Audio & Audio Buffers

async function loadSFX(name, url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  sfxBuffers[name] = audioBuffer;
}

async function preloadAllSFX() {
  const promises = Object.entries(sfxFiles).map(([name, url]) =>
    loadSFX(name, url)
  );
  await Promise.all(promises);
  sfxReady = true;
  console.log("All SFX loaded");
}

function playSFX(name) {
  if (!sfxReady || !sfxBuffers[name]) return;

  const sfxSource = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();

  sfxSource.buffer = sfxBuffers[name];
  gainNode.gain.value = 0.5;

  sfxSource.connect(gainNode).connect(audioCtx.destination);
  sfxSource.start();
}

// --------------------------------------
// Musical (Scale-Based) Ambient Synth
// --------------------------------------
// Honestly, this should be fine :/

const scales = {
  "Major Pentatonic": [0, 2, 4, 7, 9],
  "Minor Pentatonic": [0, 3, 5, 7, 10],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
};

const keys = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const currentScale = scales["Minor Pentatonic"];
const currentKey = keys["C"];

// Master Control Nodes
const ambientInput = synthCtx.createGain();
const masterGain = synthCtx.createGain();
masterGain.gain.value = 0.1;

// Delay UI
const delayNode = synthCtx.createDelay();
delayNode.delayTime.value = 0.3;
const delayFeedback = synthCtx.createGain();
delayFeedback.gain.value = 0.25;
delayNode.connect(delayFeedback);
delayFeedback.connect(delayNode);
ambientInput.connect(delayNode);
delayNode.connect(masterGain);

// Reverb UI
const reverbGain = synthCtx.createGain();
reverbGain.gain.value = 0.3;
ambientInput.connect(reverbGain);
reverbGain.connect(masterGain);

// Ring Modulation UI
// Keep it subtle ಠ_ಠ
const ringModGain = synthCtx.createGain();
ringModGain.gain.value = 0.05;
const ringModOsc = synthCtx.createOscillator();
ringModOsc.frequency.value = 12;
ringModOsc.start();
const ringModulator = synthCtx.createGain();
ringModOsc.connect(ringModulator.gain);
ambientInput.connect(ringModulator);
ringModulator.connect(masterGain);

// Dry Signal
ambientInput.connect(masterGain);
masterGain.connect(synthCtx.destination);

const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

const scaleMap = (note) => {
  const noteClass = note % 12;
  if (currentScale.includes((noteClass - currentKey + 12) % 12)) {
    return note;
  }
  return scaleMap(note - 1);
};

function playAmbientNote() {
  const baseNote = 60 + Math.floor(Math.random() * 24);
  const midiNote = scaleMap(baseNote);
  const freq = mtof(midiNote);
  const velocity = 0.2 + Math.random() * 0.2;

  const voice = new Voice(synthCtx, freq, velocity, ambientInput);
  voice.start();
  setTimeout(() => voice.stop(), 3000 + Math.random() * 2000);
}

let ambientInterval;
function startAmbient() {
  if (ambientStarted) return;
  ambientStarted = true;
  synthCtx.resume();
  ambientInterval = setInterval(playAmbientNote, 2000 + Math.random() * 2000);
}

// AudioContext Starts (after user interaction)
document.body.addEventListener(
  "click",
  async () => {
    await audioCtx.resume();
    await synthCtx.resume();
    startAmbient();
  },
  { once: true }
);

// Event Listeners Trigger
// DOM Content Loads
document.addEventListener("DOMContentLoaded", () => {
  preloadAllSFX();

  const zoneMapping = [
    { id: "tree", name: "tree" },
    { id: "lake", name: "lake" },
    { id: "shrub1", name: "shrub1" },
    { id: "shrub2", name: "shrub2" },
    { id: "shrub3", name: "shrub2" },
    { id: "shrub4", name: "shrub1" },
    { id: "mountain", name: "mountain" },
    { id: "star", name: "star" },
    { id: "constellation1", name: "constellation1" },
    { id: "constellation2", name: "constellation2" },
    { id: "constellation3", name: "constellation3" },
    { id: "moon", name: "moon" },
    { id: "sand", name: "sand" },
  ];

  zoneMapping.forEach(({ id, name }) => {
    const zone = document.getElementById(id);
    if (zone) {
      zone.addEventListener("click", () => playSFX(name));
    }
  });

  // Hook Up the UI Controls
  const volumeSlider = document.getElementById("volume-slider");
  const delaySlider = document.getElementById("delay-slider");
  const reverbSlider = document.getElementById("reverb-slider");
  const ringModSlider = document.getElementById("ring-slider");

  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      masterGain.gain.value = parseFloat(volumeSlider.value);
    });
  }

  if (delaySlider) {
    delaySlider.addEventListener("input", () => {
      delayFeedback.gain.value = parseFloat(delaySlider.value);
    });
  }

  if (reverbSlider) {
    reverbSlider.addEventListener("input", () => {
      reverbGain.gain.value = parseFloat(reverbSlider.value);
    });
  }

  if (ringModSlider) {
    ringModSlider.addEventListener("input", () => {
      ringModGain.gain.value = parseFloat(ringModSlider.value);
    });
  }
});
