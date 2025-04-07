// Set up Web Audio API
/** @type {AudioContext} */
const audioCtx = new AudioContext();
let ambientStarted = false; // Track the ambient sound

// Start Ambient Sound (when user interacts with page)
function startAmbient() {
  if (ambientStarted) return; // Don't start again if already playing
  ambientStarted = true;
}

// Create an Gain & Oscillator
audioCtx.resume().then(() => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Set up oscillator type & frequency
  oscillator.type = "sine"; // Experiment with this
  oscillator.frequency.value = 100 + Math.random() * 20; // Experiment with randomness (Math)

  // _______
  // Set the Volume
  gainNode.gain.value = 0.1; // Experiment with this

  // Connect Oscillator to Gain then to Output
  oscillator.connect(gainNode).connect(audioCtx.destination);

  // Start the sound
  oscillator.start();
});
//__________

// Sound Layer (triggered by clicking on interactive zone)
// REPLACE WITH SFX
function playSoundLayer(freq) {
  // Create Oscillator
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Set up oscillator type & frequency
  osc.frequency.value = freq;
  osc.type = "triangle"; // Experiment with this

  // Set volume & fade
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Start volume
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2); // Fade out (~2 sec)

  // Connect Oscillator to Gain then to Output
  osc.connect(gain).connect(audioCtx.destination);

  // Start sound
  osc.start();

  // Stop sound
  osc.stop(audioCtx.currentTime + 2); // (after ~2 sec)
}

//Starts the ambient sound when the user clicks on the page (anywhere)???
document.body.addEventListener("click", startAmbient, { once: true }); // I only want this to happen once

// Interactive Zones
document
  .getElementById("tree")
  .addEventListener("click", () => playSoundLayer(440));
document
  .getElementById("lake")
  .addEventListener("click", () => playSoundLayer(220));
document
  .getElementById("shrub1")
  .addEventListener("click", () => playSoundLayer(330));
document
  .getElementById("shrub2")
  .addEventListener("click", () => playSoundLayer(550));
document
  .getElementById("mountain")
  .addEventListener("click", () => playSoundLayer(660));
document
  .getElementById("star")
  .addEventListener("click", () => playSoundLayer(880));
