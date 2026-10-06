(() => {
  'use strict';

  // ---------- Loading screen ----------
  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.getElementById('progress-bar');
  const progressPct = document.getElementById('progress-pct');
  const app = document.getElementById('app');

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      if (progressBar) progressBar.style.width = '100%';
      if (progressPct) progressPct.textContent = '100%';
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('fade-out');
        if (app) app.classList.remove('hidden');
        setTimeout(() => loadingScreen && loadingScreen.remove(), 600);
        initReveal();
      }, 350);
    } else {
      if (progressBar) progressBar.style.width = progress + '%';
      if (progressPct) progressPct.textContent = Math.floor(progress) + '%';
    }
  }, 120);

  
  // ---------- Header scroll shadow ----------
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

// ---------- Theme toggle ----------
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('jarzx-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('jarzx-theme', next === 'dark' ? 'dark' : 'light');
    });
  }

  // ---------- Scroll reveal ----------
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  // Auto-add reveal to major blocks if not present
  document.querySelectorAll(
    '.about-content, .timeline-card, .map-wrap, .skill-block, .project-card, .edu-card, .interest-list, .contact-card'
  ).forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      if (i % 3 === 1) el.classList.add('reveal-delay-1');
      if (i % 3 === 2) el.classList.add('reveal-delay-2');
    }
  });

  // ---------- Map controls ----------
  const mapPin = document.querySelector('.map-pin');
  const mapPopup = document.getElementById('map-popup');
  const popupClose = document.getElementById('popup-close');
  const mapZoomIn = document.getElementById('zoom-in');
  const mapZoomOut = document.getElementById('zoom-out');
  const mapHome = document.getElementById('map-home');
  const mapCanvas = document.querySelector('.map-canvas');
  let mapScale = 1;

  if (mapPin && mapPopup) {
    mapPin.addEventListener('click', () => mapPopup.classList.remove('hidden'));
  }
  if (popupClose && mapPopup) {
    popupClose.addEventListener('click', () => mapPopup.classList.add('hidden'));
  }
  if (mapZoomIn && mapCanvas) {
    mapZoomIn.addEventListener('click', () => {
      mapScale = Math.min(mapScale + 0.15, 1.8);
      mapCanvas.style.transform = `scale(${mapScale})`;
      mapCanvas.style.transformOrigin = 'center center';
    });
  }
  if (mapZoomOut && mapCanvas) {
    mapZoomOut.addEventListener('click', () => {
      mapScale = Math.max(mapScale - 0.15, 0.7);
      mapCanvas.style.transform = `scale(${mapScale})`;
      mapCanvas.style.transformOrigin = 'center center';
    });
  }
  if (mapHome && mapCanvas) {
    mapHome.addEventListener('click', () => {
      mapScale = 1;
      mapCanvas.style.transform = 'scale(1)';
    });
  }

  // ---------- Skill / pill click colors ----------
  const colorClasses = ['active-yellow', 'active-pink', 'active-cyan', 'active-green'];
  let colorIndex = 0;

  document.querySelectorAll('.skill-tag, .pill').forEach((el) => {
    el.addEventListener('click', () => {
      const hasActive = colorClasses.some((c) => el.classList.contains(c));
      if (hasActive) {
        colorClasses.forEach((c) => el.classList.remove(c));
      } else {
        const cls = colorClasses[colorIndex % colorClasses.length];
        colorIndex++;
        el.classList.add(cls);
      }
    });
  });

  document.querySelectorAll('.btn-view').forEach((btn) => {
    btn.addEventListener('click', function () {
      this.classList.add('active');
    });
  });

  // ---------- Terminal modal ----------
  const termBtn = document.getElementById('terminal-btn');
  const termModal = document.getElementById('terminal-modal');
  const termClose = document.getElementById('term-close');
  const termInput = document.getElementById('term-input');
  const termBody = document.getElementById('terminal-body');

  function openTerminal() {
    if (!termModal) return;
    termModal.classList.remove('hidden');
    setTimeout(() => termInput && termInput.focus(), 100);
  }
  function closeTerminal() {
    if (termModal) termModal.classList.add('hidden');
  }

  if (termBtn) termBtn.addEventListener('click', openTerminal);
  if (termClose) termClose.addEventListener('click', closeTerminal);
  if (termModal) {
    termModal.addEventListener('click', (e) => {
      if (e.target === termModal) closeTerminal();
    });
  }

  function appendTerm(html) {
    if (!termBody || !termInput) return;
    const line = termInput.closest('.term-line');
    const p = document.createElement('p');
    p.innerHTML = html;
    termBody.insertBefore(p, line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function runCommand(cmd) {
    const c = (cmd || '').trim().toLowerCase();
    appendTerm(`<span style="color:#8b949e">jarzx@env:~$</span> ${cmd}`);
    if (!c) return;
    if (c === 'help') {
      appendTerm('Available: <code>help</code> <code>about</code> <code>skills</code> <code>projects</code> <code>contact</code> <code>clear</code> <code>whoami</code> <code>date</code>');
    } else if (c === 'about') {
      appendTerm('Junior Software Engineer · Full-Stack Developer · Cybersecurity enthusiast · Cengkareng, Jakarta');
    } else if (c === 'skills') {
      appendTerm('Python · JavaScript · TypeScript · React · Node.js · Flutter · Kotlin · Java · PHP · MySQL · Next.js · ...');
    } else if (c === 'projects') {
      appendTerm('JARZX-VERSE · DarkSlayer — type <code>contact</code> for channels');
    } else if (c === 'contact') {
      appendTerm('TikTok: @jarzx_new_era · Telegram: t.me/jarzxofficial');
    } else if (c === 'whoami') {
      appendTerm('jarzx.Env — Full-Stack Developer');
    } else if (c === 'date') {
      appendTerm(new Date().toString());
    } else if (c === 'clear') {
      if (termBody) {
        const keep = termBody.querySelector('.term-line');
        termBody.innerHTML = '';
        if (keep) termBody.appendChild(keep);
        const welcome = document.createElement('p');
        welcome.textContent = 'Terminal cleared.';
        termBody.insertBefore(welcome, keep);
      }
    } else {
      appendTerm(`Command not found: ${cmd}. Type <code>help</code>.`);
    }
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = termInput.value;
        termInput.value = '';
        runCommand(val);
      }
    });
  }

  // ---------- Portrait fallback ----------
  const portrait = document.getElementById('portrait-img');
  if (portrait) {
    portrait.addEventListener('error', () => {
      portrait.src =
        'data:image/svg+xml,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#e8e8e8" width="400" height="400"/><text x="200" y="200" text-anchor="middle" font-family="monospace" font-size="16" fill="#666">GANTI FOTO</text></svg>`
        );
    });
  }
})();
