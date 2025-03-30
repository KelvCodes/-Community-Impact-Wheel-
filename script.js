
// DOM Elements
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const challengeText = document.getElementById('challenge-text');
const completeChallengeBtn = document.getElementById('complete-challenge');
const shareChallengeBtn = document.getElementById('share-challenge');
const completedCount = document.getElementById('completed-count');
const totalChallenges = document.getElementById('total-challenges');
const progressFill = document.getElementById('progress-fill');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const soundToggle = document.getElementById('sound-toggle');
const spinSound = document.getElementById('spin-sound');
const winSound = document.getElementById('win-sound');
const completeSound = document.getElementById('complete-sound');
const achievementSound = document.getElementById('achievement-sound');
const milestones = document.querySelectorAll('.milestone');
const quotes = document.querySelectorAll('.quote');
const particlesJS = document.getElementById('particles-js');

// Wheel Data
const challenges = [
  { text: '🌱 Plant a tree', type: 'environment' },
  { text: '🚶‍♂️ Walk or bike instead of driving', type: 'environment' },
  { text: '💧 Reduce water usage', type: 'environment' },
  { text: '♻️ Recycle 5 items', type: 'environment' },
  { text: '🍎 Donate to a food bank', type: 'community' },
  { text: '📚 Volunteer for an hour', type: 'community' },
  { text: '🛍️ Support a local business', type: 'community' },
  { text: '🌍 Spread awareness about climate change', type: 'community' },
  { text: '🌳 Join a community clean-up', type: 'environment' },
  { text: '🚮 Organize a recycling drive', type: 'environment' }
];

const colors = [
  'linear-gradient(135deg, #ff6f61, #ff9a9e)',
  'linear-gradient(135deg, #6b5b95, #a288d4)',
  'linear-gradient(135deg, #88b04b, #b5d56a)',
  'linear-gradient(135deg, #ffd166, #ffde8d)',
  'linear-gradient(135deg, #4b86b4, #7baed2)',
  'linear-gradient(135deg, #6b5b95, #a288d4)',
  'linear-gradient(135deg, #ff6f61, #ff9a9e)',
  'linear-gradient(135deg, #88b04b, #b5d56a)',
  'linear-gradient(135deg, #4b86b4, #7baed2)',
  'linear-gradient(135deg, #ffd166, #ffde8d)'
];

let completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];
let currentChallenge = null;
let isSpinning = false;
let soundEnabled = true;
let currentQuoteIndex = 0;

// Initialize
function init() {
  createWheelSections();
  updateProgress();
  totalChallenges.textContent = challenges.length;
  startQuoteRotation();
  initParticles();
  
  // Check for saved preferences
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  if (localStorage.getItem('soundEnabled') === 'false') {
    soundEnabled = false;
    soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }
}

// Create Wheel Sections
function createWheelSections() {
  wheel.innerHTML = challenges
    .map((challenge, index) => {
      const rotation = (360 / challenges.length) * index;
      return `
        <div class="wheel-section" style="transform: rotate(${rotation}deg); background: ${colors[index]}">
          <span>${challenge.text}</span>
        </div>
      `;
    })
    .join('');
}

// Spin the Wheel
function spinWheel() {
  if (isSpinning) return;
  
  isSpinning = true;
  spinBtn.classList.add('disabled');
  
  if (soundEnabled) spinSound.play();
  
  const randomDegree = Math.floor(Math.random() * 360) + 1440;
  wheel.style.transform = `rotate(${randomDegree}deg)`;
  
  setTimeout(() => {
    const normalizedDegree = randomDegree % 360;
    const sectionAngle = 360 / challenges.length;
    const winningIndex = Math.floor(normalizedDegree / sectionAngle);
    
    currentChallenge = challenges[winningIndex];
    challengeText.textContent = currentChallenge.text;
    
    if (soundEnabled) winSound.play();
    
    setTimeout(() => {
      isSpinning = false;
      spinBtn.classList.remove('disabled');
    }, 500);
  }, 4000);
}

// Complete Challenge
function completeChallenge() {
  if (!currentChallenge) return;
  
  completedChallenges.push(currentChallenge);
  localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
  
  if (soundEnabled) completeSound.play();
  
  updateProgress();
  triggerConfetti();
  checkMilestones();
  
  currentChallenge = null;
  challengeText.textContent = 'Spin the wheel for a new challenge!';
}

// Share Challenge
function shareChallenge() {
  if (!currentChallenge) return;
  
  const shareData = {
    title: 'Community Impact Challenge',
    text: `I just got this community impact challenge: ${currentChallenge.text}. Join me in making a difference!`,
    url: window.location.href
  };
  
  if (navigator.share) {
    navigator.share(shareData).catch(err => {
      copyToClipboard(shareData.text);
    });
  } else {
    copyToClipboard(shareData.text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Challenge copied to clipboard! Share it with your friends.');
  });
}

// Update Progress
function updateProgress() {
  completedCount.textContent = completedChallenges.length;
  const progressPercent = (completedChallenges.length / challenges.length) * 100;
  progressFill.style.width = `${progressPercent}%`;
}

// Check Milestones
function checkMilestones() {
  milestones.forEach(milestone => {
    const target = parseInt(milestone.dataset.target);
    const isUnlocked = completedChallenges.length >= target;
    
    if (isUnlocked) {
      milestone.classList.add('unlocked');
      milestone.classList.remove('locked');
      
      // Play achievement sound only when just unlocked
      if (completedChallenges.length === target && soundEnabled) {
        achievementSound.play();
        triggerAchievementConfetti();
      }
    } else {
      milestone.classList.add('locked');
      milestone.classList.remove('unlocked');
    }
  });
}

// Quote Rotation
function startQuoteRotation() {
  setInterval(() => {
    quotes[currentQuoteIndex].classList.remove('active');
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    quotes[currentQuoteIndex].classList.add('active');
  }, 8000);
}

// Toggle Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
  darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Toggle Sound
function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  soundToggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
}

// Confetti Effects
function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4caf50', '#6b5b95', '#ff6f61', '#ffd166', '#4b86b4']
  });
}

function triggerAchievementConfetti() {
  confetti({
    particleCount: 300,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#ffd700', '#c0c0c0', '#cd7f32'],
    shapes: ['circle', 'square']
  });
}

// Particles.js Initialization
function initParticles() {
  particlesJS('particles-js', {
    particles: {
      number: { value: 30, density: { enable: true, value_area: 800 } },
      color: { value: "#4caf50" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: false },
      move: { 
        enable: true, 
        speed: 1, 
        direction: "none", 
        random: true, 
        straight: false, 
        out_mode: "out" 
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      }
    }
  });
}

// Event Listeners
spinBtn.addEventListener('click', spinWheel);
completeChallengeBtn.addEventListener('click', completeChallenge);
shareChallengeBtn.addEventListener('click', shareChallenge);
darkModeToggle.addEventListener('click', toggleDarkMode);
soundToggle.addEventListener('click', toggleSound);

// Initialize the app
init();
