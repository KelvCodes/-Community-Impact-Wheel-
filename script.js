hareChallengeBtn: document.querySelector('#share-challenge'),
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

// Constants
const PROJECTS_PER_PAGE = 6;
const COLORS = [
  'linear-gradient(135deg, #ff6f61, #ff9a9e)',
  'linear-gradient(135deg, #6b5b95, #a288d4)',
  'linear-gradient(135deg, #88b04b, #b5d56a)',
  'linear-gradient(135deg, #ffd166, #ffde8d)',
  'linear-gradient(135deg, #4b86b4, #7baed2)',
];

// Initialize
function init() {
  createWheelSections();
  updateProgress();
  elements.totalChallenges.textContent = state.challenges.length;
  startQuoteRotation();
  initParticles();
  initAnimations();
  initServiceWorker();
  if (state.darkMode) {
    document.body.classList.add('dark-mode');
    elements.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  if (!state.soundEnabled) {
    elements.soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }
}

// Animations
function initAnimations() {
  anime.timeline({ easing: 'easeOutExpo' })
    .add({ targets: '.hero-text h1', translateY: [50, 0], opacity: [0, 1], duration: 800 })
    .add({ targets: '.hero-text .subtitle', translateY: [30, 0], opacity: [0, 1], duration: 600 }, '-=400')
    .add({ targets: '.cta-container .btn', translateY: [20, 0], opacity: [0, 1], duration: 600, delay: anime.stagger(100) }, '-=200');
}

// Wheel Sections
function createWheelSections() {
  elements.wheel.innerHTML = state.challenges
    .map((challenge, index) => {
      const rotation = (360 / state.challenges.length) * index;
      return `
        <div class="wheel-section" style="transform: rotate(${rotation}deg); background: ${COLORS[index % COLORS.length]}">
          <span>${challenge.text}</span>
        </div>
      `;
    })
    .join('');
}

// Spin Wheel
function spinWheel() {
  if (state.isSpinning) return;
  state.isSpinning = true;
  elements.spinBtn.classList.add('disabled');
  if (state.soundEnabled) elements.spinSound.play();

  const randomDegree = Math.floor(Math.random() * 360) + 1440;
  elements.wheel.style.transform = `rotate(${randomDegree}deg)`;

  setTimeout(() => {
    const normalizedDegree = randomDegree % 360;
    const sectionAngle = 360 / state.challenges.length;
    const winningIndex = Math.floor(normalizedDegree / sectionAngle);

    state.currentChallenge = state.challenges[winningIndex];
    elements.challengeText.textContent = state.currentChallenge.text;
    if (state.soundEnabled) elements.winSound.play();
    state.isSpinning = false;
    elements.spinBtn.classList.remove('disabled');
  }, 4000);
}

// Complete Challenge
function completeChallenge() {
  if (!state.currentChallenge) return;
  state.completedChallenges.push(state.currentChallenge);
  localStorage.setItem('completedChallenges', JSON.stringify(state.completedChallenges));
  if (state.soundEnabled) elements.completeSound.play();
  updateProgress();
  triggerConfetti();
  checkMilestones();
  state.currentChallenge = null;
  elements.challengeText.textContent = 'Spin the wheel for a new challenge!';
}

// Share Challenge
function shareChallenge() {
  if (!state.currentChallenge) return;
  const shareData = {
    title: 'Community Impact Challenge',
    text: `I just got this challenge: ${state.currentChallenge.text}. Join me!`,
    url: window.location.href,
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => copyToClipboard(shareData.text));
  } else {
    copyToClipboard(shareData.text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Challenge copied to clipboard!');
  });
}

// Update Progress
function updateProgress() {
  elements.completedCount.textContent = state.completedChallenges.length;
  const progressPercent = (state.completedChallenges.length / state.challenges.length) * 100;
  elements.progressFill.style.width = `${progressPercent}%`;
}

// Check Milestones
function checkMilestones() {
  elements.milestones.forEach(milestone => {
    const target = parseInt(milestone.dataset.target);
    const isUnlocked = state.completedChallenges.length >= target;
    if (isUnlocked) {
      milestone.classList.add('unlocked');
      milestone.classList.remove('locked');
      if (state.completedChallenges.length === target && state.soundEnabled) {
        elements.achievementSound.play();
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
  let currentQuoteIndex = 0;
  setInterval(() => {
    elements.quotes[currentQuoteIndex].classList.remove('active');
    currentQuoteIndex = (currentQuoteIndex + 1) % elements.quotes.length;
    elements.quotes[currentQuoteIndex].classList.add('active');
  }, 8000);
}

// Particles
function initParticles() {
  particlesJS('particles-js', {
    particles: {
      number: { value: 30, density: { enable: true, value_area: 800 } },
      color: { value: '#4caf50' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out' },
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
    },
  });
}

// Confetti
function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4caf50', '#6b5b95', '#ff6f61', '#ffd166', '#4b86b4'],
  });
}

function triggerAchievementConfetti() {
  confetti({
    particleCount: 300,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#ffd700', '#c0c0c0', '#cd7f32'],
    shapes: ['circle', 'square'],
  });
}

// Project Finder
function addSkill() {
  const skill = elements.skillInput.value.trim();
  if (skill && !state.skills.includes(skill.toLowerCase())) {
    state.skills.push(skill.toLowerCase());
    renderSkills();
    elements.skillInput.value = '';
    anime({
      targets: '.skill-tag:last-child',
      translateX: [-20, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutQuad',
    });
  }
}

function renderSkills() {
  elements.skillsTags.innerHTML = '';
  state.skills.forEach(skill => {
    const skillTag = document.createElement('div');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `
      ${skill}
      <button class="remove-skill" data-skill="${skill}" aria-label="Remove ${skill}">×</button>
    `;
    elements.skillsTags.appendChild(skillTag);
  });

  document.querySelectorAll('.remove-skill').forEach(btn => {
    btn.addEventListener('click', () => {
      const skillToRemove = btn.dataset.skill;
      state.skills = state.skills.filter(skill => skill !== skillToRemove);
      renderSkills();
    });
  });
}

async function findProjects() {
  if (!state.skills.length) {
    alert('Please add at least one skill.');
    return;
  }
  elements.loadingSpinner.hidden = false;
  elements.projectsGrid.innerHTML = '';
  elements.resultsSection.hidden = false;
  elements.resultsSection.scrollIntoView({ behavior: 'smooth' });

  try {
    state.projects = await fetchProjects(state.skills, state.level);
    state.currentPage = 1;
    displayProjects();
    trackEvent('click_find_projects', { skills: state.skills, level: state.level });
  } catch (error) {
    elements.projectsGrid.innerHTML = '<p class="error">Failed to load projects. Please try again.</p>';
  } finally {
    elements.loadingSpinner.hidden = true;
  }
}

async function fetchProjects(skills, level) {
  const query = skills.join('+') + '+language:javascript+language:python';
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  );
  if (!response.ok) throw new Error('GitHub API request failed');
  const data = await response.json();

  return data.items
    .filter(item => item.description && item.language)
    .map(item => ({
      id: item.id,
      title: item.name,
      description: item.description.slice(0, 100) + (item.description.length > 100 ? '...' : ''),
      skills: generateRequiredSkills(skills, level, item.language),
      type: 'open-source',
      time: ['week', 'month', 'months'][Math.floor(Math.random() * 3)],
      level,
      stars: item.stargazers_count,
      updated: item.updated_at,
    }));
}

function generateRequiredSkills(userSkills, difficulty, repoLanguage) {
  const includedSkills = [...userSkills, repoLanguage].filter(Boolean);
  const allTechSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML', 'Docker', 'AWS', 'Machine Learning', 'UI Design',
  ];
  const additionalSkillsCount = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3;

  for (let i = 0; i < additionalSkillsCount; i++) {
    const randomSkill = allTechSkills[Math.floor(Math.random() * allTechSkills.length)];
    if (!includedSkills.includes(randomSkill.toLowerCase())) {
      includedSkills.push(randomSkill);
    }
  }
  return includedSkills;
}

function displayProjects() {
  let filteredProjects = [...state.projects];
  const activeFilter = document.querySelector('.filter-tag.active').dataset.filter;

  if (activeFilter !== 'all') {
    filteredProjects = filteredProjects.filter(project => project.type === activeFilter);
  }

  const sortValue = elements.sortBy.value;
  filteredProjects.sort((a, b) => {
    if (sortValue === 'stars') return b.stars - a.stars;
    if (sortValue === 'updated') return new Date(b.updated) - new Date(a.updated);
    return 0;
  });

  const start = (state.currentPage - 1) * PROJECTS_PER_PAGE;
  const end = start + PROJECTS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(start, end);

  elements.projectsGrid.innerHTML = paginatedProjects.length ? '' : '<p>No projects found.</p>';

  paginatedProjects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card animate-in';
    projectCard.setAttribute('role', 'article');
    projectCard.setAttribute('aria-labelledby', `project-${project.id}`);
    projectCard.innerHTML = `
      <div class="project-card-header">
        <h3 class="project-card-title" id="project-${project.id}">${project.title}</h3>
      </div>
      <div class="project-card-body">
        <p class="project-card-description">${project.description}</p>
        <div class="project-card-skills">
          ${project.skills.map(skill => `<span class="project-card-skill">${skill}</span>`).join('')}
        </div>
      </div>
      <div class="project-card-footer">
        <div class="project-card-meta">
          <i class="fas fa-clock"></i>
          <span>${formatTimeCommitment(project.time)}</span>
        </div>
        <button class="btn-view" aria-label="View details for ${project.title}">View Details</button>
      </div>
    `;
    elements.projectsGrid.appendChild(projectCard);
  });

  anime({
    targets: '.project-card.animate-in',
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 600,
    delay: anime.stagger(100),
    easing: 'easeOutQuad',
    complete: () => {
      document.querySelectorAll('.project-card').forEach(card => card.classList.remove('animate-in'));
    },
  });

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE) || 1;
  elements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
  elements.prevPage.disabled = state.currentPage === 1;
  elements.nextPage.disabled = state.currentPage === totalPages;
}

function formatTimeCommitment(time) {
  const times = {
    week: '< 1 week',
    month: '1-4 weeks',
    months: '1-3 months',
  };
  return times[time] || time;
}

// Event Handlers
function handleGetStarted(e) {
  e.preventDefault();
  elements.skillsSection.scrollIntoView({ behavior: 'smooth' });
  trackEvent('click_get_started');
}

function handleLevelChange(option) {
  state.level = option.value;
  anime({
    targets: `.level-option input[value="${state.level}"] + .level-content`,
    scale: [1, 1.05],
    duration: 300,
    easing: 'easeOutElastic(1, 0.8)',
    complete: () => anime({
      targets: `.level-option input[value="${state.level}"] + .level-content`,
      scale: 1,
      duration: 200,
    }),
  });
}

function handleFilter(tag) {
  elements.filterTags.forEach(t => t.classList.remove('active'));
  tag.classList.add('active');
  state.currentPage = 1;
  displayProjects();
  anime({
    targets: tag,
    scale: [1, 1.1],
    duration: 200,
    easing: 'easeOutQuad',
    complete: () => anime({ targets: tag, scale: 1, duration: 200 }),
  });
}

function toggleMobileMenu() {
  const isExpanded = elements.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
  elements.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
  elements.navLinks.classList.toggle('active');
  anime({
    targets: '.nav-links',
    translateY: isExpanded ? [0, -100] : [-100, 0],
    duration: 300,
    easing: 'easeOutQuad',
  });
}

function handleResize() {
  if (window.innerWidth > 768) {
    elements.navLinks.classList.remove('active');
    elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }
}

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', state.darkMode ? 'enabled' : 'disabled');
  elements.darkModeToggle.innerHTML = state.darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem('soundEnabled', state.soundEnabled);
  elements.soundToggle.innerHTML = state.soundEnabled
    ? '<i class="fas fa-volume-up"></i>'
    : '<i class="fas fa-volume-mute"></i>';
}

function trackEvent(eventName, properties = {}) {
  console.log(`Analytics: ${eventName}`, properties);
}

// Service Worker for PWA
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  init();
  elements.getStartedBtn.addEventListener('click', handleGetStarted);
  elements.addSkillBtn.addEventListener('click', addSkill);
  elements.skillInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addSkill();
  });
  elements.levelOptions.forEach(option => {
    option.addEventListener('change', () => handleLevelChange(option));
  });
  elements.findProjectsBtn.addEventListener('click', findProjects);
  elements.filterTags.forEach(tag => {
    tag.addEventListener('click', () => handleFilter(tag));
  });
  elements.sortBy.addEventListener('change', displayProjects);
  elements.prevPage.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      displayProjects();
    }
  });
  elements.nextPage.addEventListener('click', () => {
    if (state.currentPage < Math.ceil(state.projects.length / PROJECTS_PER_PAGE)) {
      state.currentPage++;
      displayProjects();
    }
  });
  elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  window.addEventListener('resize', debounce(handleResize, 100));
  elements.spinBtn.addEventListener('click', spinWheel);
  elements.completeChallengeBtn.addEventListener('click', completeChallenge);
  elements.shareChallengeBtn.addEventListener('click', shareChallenge);
  elements.darkModeToggle.addEventListener('click', toggleDarkMode);
  elements.soundToggle.addEventListener('click', toggleSound);
});
