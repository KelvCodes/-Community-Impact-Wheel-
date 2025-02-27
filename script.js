// DOM Elements
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const challengeText = document.getElementById('challenge-text');
const completeChallengeBtn = document.getElementById('complete-challenge');
const completedCount = document.getElementById('completed-count');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const spinSound = document.getElementById('spin-sound');
const winSound = document.getElementById('win-sound');

// Wheel Data
const challenges = [
  '🌱 Plant a tree',
  '🚶‍♂️ Walk or bike instead of driving',
  '💧 Reduce water usage',
  '♻️ Recycle 5 items',
  '🍎 Donate to a food bank',
  '📚 Volunteer for an hour',
  '🛍️ Support a local business',
  '🌍 Spread awareness about climate change',
];
const colors = ['#ff6f61', '#6b5b95', '#88b04b', '#ffd166', '#4b86b4', '#ff9a9e', '#6b5b95', '#88b04b'];
let completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];

// Create Wheel Sections
function createWheelSections() {
  wheel.innerHTML = challenges
    .map((challenge, index) => {
      const rotation = (360 / challenges.length) * index;
      return `
        <div class="wheel-section" style="transform: rotate(${rotation}deg); background: ${colors[index]}">
          <span>${challenge}</span>
        </div>
      `;
    })
    .join('');
}

// Spin the Wheel
spinBtn.addEventListener('click', () => {
  spinSound.play();
  const randomDegree = Math.floor(Math.random() * 360) + 1440; // Add extra spins
  wheel.style.transform = `rotate(${randomDegree}deg)`;

  setTimeout(() => {
    const winningIndex = Math.floor((randomDegree % 360) / (360 / challenges.length));
    const challenge = challenges[winningIndex];
    challengeText.textContent = challenge;
    winSound.play();
  }, 5000); // Match the duration of the spin animation
});

// Complete Challenge
completeChallengeBtn.addEventListener('click', () => {
  completedChallenges.push(challengeText.textContent);
  localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
  completedCount.textContent = completedChallenges.length;
  confetti();
});

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Initial Render
createWheelSections();
completedCount.textContent = completedChallenges.length;
function confetti() {
    confetti.create(document.getElementById('confetti'), {
      resize: true,
      useWorker: true,
    })({ particleCount: 200, spread: 160 });
  }