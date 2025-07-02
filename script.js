/* eslint-disable no-undef */

// ✅ State Management: holds all app data & preferences
class AppState {
  constructor() {
    this.skills = []; // User's selected skills
    this.level = 'beginner'; // Default skill level
    this.projects = []; // Fetched projects list
    this.currentPage = 1; // Current pagination page

    // List of possible challenges for the spinning wheel
    this.challenges = [
      { text: '🌱 Plant a tree', type: 'environment' },
      { text: '🚶‍♂️ Walk or bike instead of driving', type: 'environment' },
      { text: '💧 Reduce water usage', type: 'environment' },
      { text: '♻️ Recycle 5 items', type: 'environment' },
      { text: '🍎 Donate to a food bank', type: 'community' },
      { text: '📚 Volunteer for an hour', type: 'community' },
      { text: '🛍️ Support a local business', type: 'community' },
      { text: '🌍 Spread awareness about climate change', type: 'community' },
      { text: '🌳 Join a community clean-up', type: 'environment' },
      { text: '🚮 Organize a recycling drive', type: 'environment' },
    ];

    // Load persisted user data
    this.completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '[]');
    this.currentChallenge = null; // Current active challenge
    this.isSpinning = false; // Prevent multiple spins

    // User preferences: sound & dark mode
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.darkMode = localStorage.getItem('darkMode') === 'enabled';
  }

  // Persist user data and preferences to local storage
  saveToLocalStorage() {
    localStorage.setItem('completedChallenges', JSON.stringify(this.completedChallenges));
    localStorage.setItem('soundEnabled', this.soundEnabled);
    localStorage.setItem('darkMode', this.darkMode ? 'enabled' : 'disabled');
  }
}

// ✅ Constants: static data used throughout the app
const CONSTANTS = {
  PROJECTS_PER_PAGE: 6,
  COLORS: [
    'linear-gradient(135deg, #ff6f61, #ff9a9e)',
    'linear-gradient(135deg, #6b5b95, #a288d4)',
    'linear-gradient(135deg, #88b04b, #b5d56a)',
    'linear-gradient(135deg, #ffd166, #ffde8d)',
    'linear-gradient(135deg, #4b86b4, #7baed2)',
  ],
};

// ✅ DOM Elements: cache all relevant elements for easy access
const DOM = {
  getStartedBtn: document.querySelector('#getStartedBtn'),
  skillsSection: document.querySelector('#skillsSection'),
  skillInput: document.querySelector('#skillInput'),
  addSkillBtn: document.querySelector('#addSkillBtn'),
  skillsTags: document.querySelector('#skillsTags'),
  levelOptions: document.querySelectorAll('.level-option input'),
  findProjectsBtn: document.querySelector('#findProjectsBtn'),
  resultsSection: document.querySelector('#resultsSection'),
  projectsGrid: document.querySelector('#projectsGrid'),
  loadingSpinner: document.querySelector('#loadingSpinner'),
  filterTags: document.querySelectorAll('.filter-tag'),
  sortBy: document.querySelector('#sortBy'),
  prevPage: document.querySelector('#prevPage'),
  nextPage: document.querySelector('#nextPage'),
  pageInfo: document.querySelector('#pageInfo'),
  mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
  navLinks: document.querySelector('.nav-links'),
  wheel: document.querySelector('#wheel'),
  spinBtn: document.querySelector('#spin-btn'),
  challengeText: document.querySelector('#challenge-text'),
  completeChallengeBtn: document.querySelector('#complete-challenge'),
  shareChallengeBtn: document.querySelector('#share-challenge'),
  completedCount: document.querySelector('#completed-count'),
  totalChallenges: document.querySelector('#total-challenges'),
  progressFill: document.querySelector('#progress-fill'),
  darkModeToggle: document.querySelector('#dark-mode-toggle'),
  soundToggle: document.querySelector('#sound-toggle'),
  spinSound: document.querySelector('#spin-sound'),
  winSound: document.querySelector('#win-sound'),
  completeSound: document.querySelector('#complete-sound'),
  achievementSound: document.querySelector('#achievement-sound'),
  milestones: document.querySelectorAll('.milestone'),
  quotes: document.querySelectorAll('.quote'),
  particlesJS: document.querySelector('#particles-js'),
};

// ✅ App Logic: orchestrates state, UI, and API interactions
class App {
  constructor() {
    this.state = new AppState();
    this.init(); // Initialize on startup
  }

  // 🏁 Initialize app: load everything once
  init() {
    this.createWheelSections();
    this.updateProgress();
    DOM.totalChallenges.textContent = this.state.challenges.length;
    this.startQuoteRotation();
    this.initParticles();
    this.initAnimations();
    this.initServiceWorker();
    this.applyTheme();
    this.applySoundSettings();
    this.bindEvents(); // Attach event listeners
  }

  // 🎨 Apply saved dark mode setting
  applyTheme() {
    if (this.state.darkMode) {
      document.body.classList.add('dark-mode');
      DOM.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // 🔊 Apply saved sound setting
  applySoundSettings() {
    if (!this.state.soundEnabled) {
      DOM.soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
  }

  // ✨ Animate hero section on load
  initAnimations() {
    anime.timeline({ easing: 'easeOutExpo' })
      .add({ targets: '.hero-text h1', translateY: [50, 0], opacity: [0, 1], duration: 800 })
      .add({ targets: '.hero-text .subtitle', translateY: [30, 0], opacity: [0, 1], duration: 600 }, '-=400')
      .add({ targets: '.cta-container .btn', translateY: [20, 0], opacity: [0, 1], duration: 600, delay: anime.stagger(100) }, '-=200');
  }

  // 🏆 Create spinning wheel sections dynamically
  createWheelSections() {
    DOM.wheel.innerHTML = this.state.challenges
      .map((challenge, index) => {
        const rotation = (360 / this.state.challenges.length) * index;
        return `
          <div class="wheel-section" style="transform: rotate(${rotation}deg); background: ${CONSTANTS.COLORS[index % CONSTANTS.COLORS.length]}" role="option" aria-label="${challenge.text}">
            <span>${challenge.text}</span>
          </div>
        `;
      })
      .join('');
  }

  // 🌀 Spin the wheel and pick a challenge
  async spinWheel() {
    if (this.state.isSpinning) return;
    this.state.isSpinning = true;
    DOM.spinBtn.classList.add('disabled');
    DOM.spinBtn.setAttribute('aria-disabled', 'true');
    if (this.state.soundEnabled) DOM.spinSound.play();

    const randomDegree = Math.floor(Math.random() * 360) + 1440; // Ensure multiple spins
    DOM.wheel.style.transform = `rotate(${randomDegree}deg)`;

    // Wait for spin animation
    await new Promise(resolve => setTimeout(resolve, 4000));

    const normalizedDegree = randomDegree % 360;
    const sectionAngle = 360 / this.state.challenges.length;
    const winningIndex = Math.floor(normalizedDegree / sectionAngle);

    this.state.currentChallenge = this.state.challenges[winningIndex];
    DOM.challengeText.textContent = this.state.currentChallenge.text;
    DOM.challengeText.setAttribute('aria-live', 'polite');

    if (this.state.soundEnabled) DOM.winSound.play();
    this.state.isSpinning = false;
    DOM.spinBtn.classList.remove('disabled');
    DOM.spinBtn.setAttribute('aria-disabled', 'false');
  }

  // ✅ Mark current challenge as complete
  completeChallenge() {
    if (!this.state.currentChallenge) return;
    this.state.completedChallenges.push(this.state.currentChallenge);
    this.state.saveToLocalStorage();
    if (this.state.soundEnabled) DOM.completeSound.play();
    this.updateProgress();
    this.triggerConfetti();
    this.checkMilestones();
    this.state.currentChallenge = null;
    DOM.challengeText.textContent = 'Spin the wheel for a new challenge!';
  }

  // 📤 Share challenge via Web Share API or clipboard fallback
  async shareChallenge() {
    if (!this.state.currentChallenge) return;
    const shareData = {
      title: 'Community Impact Challenge',
      text: `I just got this challenge: ${this.state.currentChallenge.text}. Join me!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await this.copyToClipboard(shareData.text);
      }
    } catch {
      await this.copyToClipboard(shareData.text);
    }
  }

  // 📋 Copy text to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Challenge copied to clipboard!');
    } catch {
      alert('Failed to copy challenge.');
    }
  }

  // 📊 Update challenge completion progress bar
  updateProgress() {
    DOM.completedCount.textContent = this.state.completedChallenges.length;
    const percent = (this.state.completedChallenges.length / this.state.challenges.length) * 100;
    DOM.progressFill.style.width = `${percent}%`;
    DOM.progressFill.setAttribute('aria-valuenow', percent);
  }

  // 🏅 Check and unlock milestones
  checkMilestones() {
    DOM.milestones.forEach(milestone => {
      const target = parseInt(milestone.dataset.target);
      const isUnlocked = this.state.completedChallenges.length >= target;
      milestone.classList.toggle('unlocked', isUnlocked);
      milestone.classList.toggle('locked', !isUnlocked);
      if (isUnlocked && this.state.completedChallenges.length === target && this.state.soundEnabled) {
        DOM.achievementSound.play();
        this.triggerAchievementConfetti();
      }
    });
  }

  // 🧠 Auto-rotate motivational quotes
  startQuoteRotation() {
    let index = 0;
    setInterval(() => {
      DOM.quotes.forEach(quote => quote.classList.remove('active'));
      index = (index + 1) % DOM.quotes.length;
      DOM.quotes[index].classList.add('active');
    }, 8000);
  }

  // 🎉 Trigger confetti animation
  triggerConfetti() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4caf50', '#6b5b95', '#ff6f61', '#ffd166', '#4b86b4'],
    });
  }

  // 🏆 Special confetti when milestone achieved
  triggerAchievementConfetti() {
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ffd700', '#c0c0c0', '#cd7f32'],
      shapes: ['circle', 'square'],
    });
  }

  // 🧪 Initialize background particle animation
  initParticles() {
    particlesJS('particles-js', {
      particles: {
        number: { value: 30, density: { enable: true, value_area: 800 } },
        color: { value: '#4caf50' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        move: { enable: true, speed: 1, random: true },
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
      },
    });
  }

  // 📱 Toggle dark mode
  toggleDarkMode() {
    this.state.darkMode = !this.state.darkMode;
    document.body.classList.toggle('dark-mode');
    this.state.saveToLocalStorage();
    DOM.darkModeToggle.innerHTML = this.state.darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  // 🔇 Toggle sound on/off
  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.state.saveToLocalStorage();
    DOM.soundToggle.innerHTML = this.state.soundEnabled
      ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
  }

  // 📱 Toggle mobile navigation menu
  toggleMobileMenu() {
    const expanded = DOM.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    DOM.mobileMenuBtn.setAttribute('aria-expanded', !expanded);
    DOM.navLinks.classList.toggle('active');
  }

  // 🛠 Bind all event listeners
  bindEvents() {
    DOM.getStartedBtn.addEventListener('click', e => {
      e.preventDefault();
      DOM.skillsSection.scrollIntoView({ behavior: 'smooth' });
    });
    DOM.addSkillBtn.addEventListener('click', () => this.addSkill());
    DOM.skillInput.addEventListener('keypress', e => { if (e.key === 'Enter') this.addSkill(); });
    DOM.levelOptions.forEach(option => option.addEventListener('change', () => this.handleLevelChange(option)));
    DOM.findProjectsBtn.addEventListener('click', () => this.findProjects());
    DOM.spinBtn.addEventListener('click', () => this.spinWheel());
    DOM.completeChallengeBtn.addEventListener('click', () => this.completeChallenge());
    DOM.shareChallengeBtn.addEventListener('click', () => this.shareChallenge());
    DOM.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    DOM.soundToggle.addEventListener('click', () => this.toggleSound());
    DOM.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
  }
}

// ✅ Initialize the App once DOM is ready
document.addEventListener('DOMContentLoaded', () => new App());

