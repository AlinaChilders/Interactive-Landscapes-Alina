// soundscape.js

import Voice from "./Voice.js";

// Set up Web Audio API
const audioCtx = new AudioContext();
const synthCtx = new AudioContext();
let ambientStarted = false;
let sfxReady = false;

// Preload SFX
const sfxFiles = {
  tree: "/assets/sounds/tree.mp3",
  lake: "/assets/sounds/lake.wav",
  shrub1: "/assets/sounds/shrub1.wav",
  shrub2: "/assets/sounds/shrub2.wav",
  mountain: "/assets/sounds/mountain.wav",
  star: "/assets/sounds/star.wav",
};

const sfxBuffers = {}; // To store decoded audio buffers

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
// Musical Scale-Based Ambient Synth
// --------------------------------------

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

const masterGain = synthCtx.createGain();
masterGain.gain.value = 0.1;
masterGain.connect(synthCtx.destination);

const delay = synthCtx.createDelay(5.0);
delay.delayTime.value = 1.5;

const feedback = synthCtx.createGain();
feedback.gain.value = 0.4;

delay.connect(feedback);
feedback.connect(delay);
delay.connect(masterGain);
masterGain.connect(delay);

const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

const scaleMap = (note) => {
  const noteClass = note % 12;
  if (currentScale.includes((noteClass - currentKey + 12) % 12)) {
    return note;
  }
  return scaleMap(note - 1);
};

function playAmbientNote() {
  const baseNote = 60 + Math.floor(Math.random() * 24); // C4 to C6
  const midiNote = scaleMap(baseNote);
  const freq = mtof(midiNote);
  const velocity = 0.2 + Math.random() * 0.2;

  const voice = new Voice(synthCtx, freq, velocity, masterGain);
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

// Ensure AudioContext starts after user interaction
document.body.addEventListener(
  "click",
  async () => {
    await audioCtx.resume();
    await synthCtx.resume();
    startAmbient();
  },
  { once: true }
);

// Setup event listeners after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  preloadAllSFX();

  const zoneMapping = [
    { id: "tree", name: "tree" },
    { id: "lake", name: "lake" },
    { id: "shrub1", name: "shrub1" },
    { id: "shrub2", name: "shrub2" },
    { id: "mountain", name: "mountain" },
    { id: "star", name: "star" },
  ];

  zoneMapping.forEach(({ id, name }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => playSFX(name));
    }
  });
});
