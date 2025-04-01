// Some stuff is coded out and some stuff is just comments of code I plan to add.

// Set up Web Audio API
/** @type {AudioContext} */
const audCtx = new AudioContext();

// Track the ambient sound (true/false) ???

// Start the ambient sound ???
// Should begin when user interacts with page ???

// Create an Gain & Oscillator
const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();

// Set up oscillator type & frequency
oscillator.type = "sine"; // Experiment with this
oscillator.frequency.value = 100 + Math.random() * 20; // Experiment with randomness (Math)

// Set the Volume
gainNode.gain.value = 0.1; // Experiment with this

// Connect Oscillator to Gain then to Output
oscillator.connect(gainNode).connect(audioCtx.destination);

// Start the sound
oscillator.start();

// Play sound layers when user clicks an interactive element ???
// Recode this section to generate inputed SFX instead of an oscillator!
function playSoundLayer(freq) {
  // Create Oscillator
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Set up oscillator type & frequency
  osc.frequency.value = freq;
  osc.type = "triangle"; // Experiment with this

  // Set volume & fade
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Initial volume
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2); // Fade out (~2 sec)

  // Connect Oscillator to Gain then to Output
  osc.connect(gain).connect(audioCtx.destination);

  // Start sound
  osc.start();

  // Stop sound
  osc.stop(audioCtx.currentTime + 2); // (after ~2 sec)
}

//Starts the ambient sound when the user clicks on the page (anywhere)???
document.body.addEventListener("click", startAmbient);

// Click on interactive elements to produce new sound layer???
// Remove oscillators for SFX eventually.
document
  .getElementById("tree")
  .addEventListener("click", () => playSoundLayer(440));
document
  .getElementById("river")
  .addEventListener("click", () => playSoundLayer(220));
