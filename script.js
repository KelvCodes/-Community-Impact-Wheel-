
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

// App Logic
class App {
  constructor() {
    this.state = new AppState();
    this.init();
  }

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
    this.bindEvents();
  }

  applyTheme() {
    if (this.state.darkMode) {
      document.body.classList.add('dark-mode');
      DOM.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  applySoundSettings() {
    if (!this.state.soundEnabled) {
      DOM.soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
  }

  initAnimations() {
    anime.timeline({ easing: 'easeOutExpo' })
      .add({ targets: '.hero-text h1', translateY: [50, 0], opacity: [0, 1], duration: 800 })
      .add({ targets: '.hero-text .subtitle', translateY: [30, 0], opacity: [0, 1], duration: 600 }, '-=400')
      .add({ targets: '.cta-container .btn', translateY: [20, 0], opacity: [0, 1], duration: 600, delay: anime.stagger(100) }, '-=200');
  }

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

  async spinWheel() {
    if (this.state.isSpinning) return;
    this.state.isSpinning = true;
    DOM.spinBtn.classList.add('disabled');
    DOM.spinBtn.setAttribute('aria-disabled', 'true');
    if (this.state.soundEnabled) DOM.spinSound.play();

    const randomDegree = Math.floor(Math.random() * 360) + 1440;
    DOM.wheel.style.transform = `rotate(${randomDegree}deg)`;

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
    DOM.challengeText.setAttribute('aria-live', 'polite');
  }

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

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Challenge copied to clipboard!');
    } catch {
      alert('Failed to copy challenge. Please try again.');
    }
  }

  updateProgress() {
    DOM.completedCount.textContent = this.state.completedChallenges.length;
    const progressPercent = (this.state.completedChallenges.length / this.state.challenges.length) * 100;
    DOM.progressFill.style.width = `${progressPercent}%`;
    DOM.progressFill.setAttribute('aria-valuenow', progressPercent);
  }

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

  startQuoteRotation() {
    let currentQuoteIndex = 0;
    setInterval(() => {
      DOM.quotes.forEach(quote => quote.classList.remove('active'));
      currentQuoteIndex = (currentQuoteIndex + 1) % DOM.quotes.length;
      DOM.quotes[currentQuoteIndex].classList.add('active');
      DOM.quotes[currentQuoteIndex].setAttribute('aria-hidden', 'false');
    }, 8000);
  }

  initParticles() {
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

  triggerConfetti() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4caf50', '#6b5b95', '#ff6f61', '#ffd166', '#4b86b4'],
    });
  }

  triggerAchievementConfetti() {
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ffd700', '#c0c0c0', '#cd7f32'],
      shapes: ['circle', 'square'],
    });
  }

  addSkill() {
    const skill = DOM.skillInput.value.trim().toLowerCase();
    if (skill && !this.state.skills.includes(skill)) {
      this.state.skills.push(skill);
      this.renderSkills();
      DOM.skillInput.value = '';
      anime({
        targets: '.skill-tag:last-child',
        translateX: [-20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuad',
      });
    }
  }

  renderSkills() {
    DOM.skillsTags.innerHTML = '';
    this.state.skills.forEach(skill => {
      const skillTag = document.createElement('div');
      skillTag.className = 'skill-tag';
      skillTag.innerHTML = `
        ${skill}
        <button class="remove-skill" data-skill="${skill}" aria-label="Remove ${skill}">×</button>
      `;
      DOM.skillsTags.appendChild(skillTag);
    });

    DOM.skillsTags.querySelectorAll('.remove-skill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.skills = this.state.skills.filter(s => s !== btn.dataset.skill);
        this.renderSkills();
      });
    });
  }

  async findProjects() {
    if (!this.state.skills.length) {
      alert('Please add at least one skill.');
      return;
    }
    DOM.loadingSpinner.hidden = false;
    DOM.projectsGrid.innerHTML = '';
    DOM.resultsSection.hidden = false;
    DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });

    try {
      this.state.projects = await this.fetchProjects(this.state.skills, this.state.level);
      this.state.currentPage = 1;
      this.displayProjects();
      this.trackEvent('click_find_projects', { skills: this.state.skills, level: this.state.level });
    } catch (error) {
      DOM.projectsGrid.innerHTML = '<p class="error" role="alert">Failed to load projects. Please try again.</p>';
      console.error('Project fetch error:', error);
    } finally {
      DOM.loadingSpinner.hidden = true;
    }
  }

  async fetchProjects(skills, level) {
    const query = skills.join('+') + '+language:javascript+language:python';
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    if (!response.ok) throw new Error(`GitHub API request failed: ${response.status}`);
    const data = await response.json();

    return data.items
      .filter(item => item.description && item.language)
      .map(item => ({
        id: item.id,
        title: item.name,
        description: item.description.slice(0, 100) + (item.description.length > 100 ? '...' : ''),
        skills: this.generateRequiredSkills(skills, level, item.language),
        type: 'open-source',
        time: ['week', 'month', 'months'][Math.floor(Math.random() * 3)],
        level,
        stars: item.stargazers_count,
        updated: item.updated_at,
      }));
  }

  generateRequiredSkills(userSkills, difficulty, repoLanguage) {
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

  displayProjects() {
    let filteredProjects = [...this.state.projects];
    const activeFilter = DOM.filterTags[Array.from(DOM.filterTags).findIndex(tag => tag.classList.contains('active'))].dataset.filter;

    if (activeFilter !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.type === activeFilter);
    }

    const sortValue = DOM.sortBy.value;
    filteredProjects.sort((a, b) => {
      if (sortValue === 'stars') return b.stars - a.stars;
      if (sortValue === 'updated') return new Date(b.updated) - new Date(a.updated);
      return 0;
    });

    const start = (this.state.currentPage - 1) * CONSTANTS.PROJECTS_PER_PAGE;
    const end = start + CONSTANTS.PROJECTS_PER_PAGE;
    const paginatedProjects = filteredProjects.slice(start, end);

    DOM.projectsGrid.innerHTML = paginatedProjects.length ? '' : '<p role="alert">No projects found.</p>';

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
            ${project.skills.map(skill => `<span class="project-card-skill" role="listitem">${skill}</span>`).join('')}
          </div>
        </div>
        <div class="project-card-footer">
          <div class="project-card-meta">
            <i class="fas fa-clock" aria-hidden="true"></i>
            <span>${this.formatTimeCommitment(project.time)}</span>
          </div>
          <button class="btn-view" aria-label="View details for ${project.title}">View Details</button>
        </div>
      `;
      DOM.projectsGrid.appendChild(projectCard);
    });

    anime({
      targets: '.project-card.animate-in',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100),
      easing: 'easeOutQuad',
      complete: () => {
        DOM.projectsGrid.querySelectorAll('.project-card').forEach(card => card.classList.remove('animate-in'));
      },
    });

    const totalPages = Math.ceil(filteredProjects.length / CONSTANTS.PROJECTS_PER_PAGE) || 1;
    DOM.pageInfo.textContent = `Page ${this.state.currentPage} of ${totalPages}`;
    DOM.pageInfo.setAttribute('aria-current', `page ${this.state.currentPage}`);
    DOM.prevPage.disabled = this.state.currentPage === 1;
    DOM.nextPage.disabled = this.state.currentPage === totalPages;
  }

  formatTimeCommitment(time) {
    const times = {
      week: '< 1 week',
      month: '1-4 weeks',
      months: '1-3 months',
    };
    return times[time] || time;
  }

  toggleDarkMode() {
    this.state.darkMode = !this.state.darkMode;
    document.body.classList.toggle('dark-mode');
    this.state.saveToLocalStorage();
    DOM.darkModeToggle.innerHTML = this.state.darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.state.saveToLocalStorage();
    DOM.soundToggle.innerHTML = this.state.soundEnabled
      ? '<i class="fas fa-volume-up"></i>'
      : '<i class="fas fa-volume-mute"></i>';
  }

  toggleMobileMenu() {
    const isExpanded = DOM.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    DOM.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    DOM.navLinks.classList.toggle('active');
    anime({
      targets: '.nav-links',
      translateY: isExpanded ? [0, -100] : [-100, 0],
      duration: 300,
      easing: 'easeOutQuad',
    });
  }

  handleResize() {
    if (window.innerWidth > 768) {
      DOM.navLinks.classList.remove('active');
      DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  handleLevelChange(option) {
    this.state.level = option.value;
    anime({
      targets: `.level-option input[value="${this.state.level}"] + .level-content`,
      scale: [1, 1.05],
      duration: 300,
      easing: 'easeOutElastic(1, 0.8)',
      complete: () => anime({
        targets: `.level-option input[value="${this.state.level}"] + .level-content`,
        scale: 1,
        duration: 200,
      }),
    });
  }

  handleFilter(tag) {
    DOM.filterTags.forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    this.state.currentPage = 1;
    this.displayProjects();
    anime({
      targets: tag,
      scale: [1, 1.1],
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => anime({ targets: tag, scale: 1, duration: 200 }),
    });
  }

  trackEvent(eventName, properties = {}) {
    console.log(`Analytics: ${eventName}`, properties);
  }

  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        console电子邮箱('Service Worker registration failed:', error);
      }
    }
  }

  bindEvents() {
    DOM.getStartedBtn.addEventListener('click', e => {
      e.preventDefault();
      DOM.skillsSection.scrollIntoView({ behavior: 'smooth' });
      this.trackEvent('click_get_started');
    });

    DOM.addSkillBtn.addEventListener('click', () => this.addSkill());
    DOM.skillInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.addSkill();
    });

    DOM.levelOptions.forEach(option => {
      option.addEventListener('change', () => this.handleLevelChange(option));
    });

    DOM.findProjectsBtn.addEventListener('click', () => this.findProjects());
    DOM.filterTags.forEach(tag => {
      tag.addEventListener('click', () => this.handleFilter(tag));
    });

    DOM.sortBy.addEventListener('change', () => this.displayProjects());
    DOM.prevPage.addEventListener('click', () => {
      if (this.state.currentPage > 1) {
        this.state.currentPage--;
        this.displayProjects();
      }
    });

    DOM.nextPage.addEventListener('click', () => {
      if (this.state.currentPage < Math.ceil(this.state.projects.length / CONSTANTS.PROJECTS_PER_PAGE)) {
        this.state.currentPage++;
        this.displayProjects();
      }
    });

    DOM.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
    window.addEventListener('resize', debounce(() => this.handleResize(), 100));
    DOM.spinBtn.addEventListener('click', () => this.spinWheel());
    DOM.completeChallengeBtn.addEventListener('click', () => this.completeChallenge());
    DOM.shareChallengeBtn.addEventListener('click', () => this.shareChallenge());
    DOM.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    DOM.soundToggle.addEventListener('click', () => this.toggleSound());
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => new App());
