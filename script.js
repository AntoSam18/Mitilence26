/* ═══════════════════════════════════════════════════
   CAPTCHA'26 — script.js
   Scroll animations · Modal system · Countdown
   Particles · Parallax · Hamburger · Cursor glow
   ═══════════════════════════════════════════════════ */

/* ── Helpers ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const raf = requestAnimationFrame;

/* ══════════════════════════════════════════════
   1. NAVBAR — scroll + hamburger
══════════════════════════════════════════════ */
(function initNav() {
  const nav = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');

  // Scroll-state class
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    lastY = y;
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  $$('.nav-link, .nav-cta', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ══════════════════════════════════════════════
   2. COUNTDOWN TIMER
══════════════════════════════════════════════ */
(function initCountdown() {
  const target = new Date('2026-03-14T09:00:00+05:30').getTime();
  const els = {
    days: $('#days'),
    hours: $('#hours'),
    minutes: $('#minutes'),
    seconds: $('#seconds'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    // Flip animation on change
    ['days', 'hours', 'minutes', 'seconds'].forEach(key => {
      const val = pad({ days: d, hours: h, minutes: m, seconds: s }[key]);
      if (els[key].textContent !== val) {
        els[key].classList.add('flip');
        els[key].textContent = val;
        setTimeout(() => els[key].classList.remove('flip'), 400);
      }
    });

    if (diff > 0) setTimeout(tick, 1000);
    else {
      Object.values(els).forEach(el => el.textContent = '00');
    }
  }

  tick();
})();

/* ══════════════════════════════════════════════
   3. PARTICLE CANVAS — hero
══════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  const SYMBOLS = ['{}', '</>', '01', '#AI', '&&', '=>', '...', '$$', '//'];
  const COLORS = ['rgba(183,148,69,', 'rgba(16,185,129,', 'rgba(139,92,246,'];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomParticle() {
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: 9 + Math.random() * 8,
      alpha: 0.08 + Math.random() * 0.14,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      color: col,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 55 }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x += (dx / dist) * 1.2;
        p.y += (dy / dist) * 1.2;
      }

      // Wrap
      if (p.x < -40) p.x = W + 40;
      if (p.x > W + 40) p.x = -40;
      if (p.y < -40) p.y = H + 40;
      if (p.y > H + 40) p.y = -40;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.font = `${p.size}px 'Share Tech Mono', monospace`;
      ctx.fillText(p.symbol, p.x, p.y);
      ctx.restore();
    });
    raf(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  init();
  draw();
})();

/* ══════════════════════════════════════════════
   4. PARALLAX HERO
══════════════════════════════════════════════ */
(function initParallax() {
  const bg = $('.hero-bg');
  if (!bg) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      raf(() => {
        const y = window.scrollY;
        bg.style.transform = `scale(1.05) translateY(${y * 0.3}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ══════════════════════════════════════════════
   5. SCROLL-DRIVEN REVEAL ANIMATIONS
   Dribbble-style: stagger + clip-path + fade-up
══════════════════════════════════════════════ */
(function initScrollAnimations() {
  // Add animation classes to elements
  function markElements() {
    // Section headers
    $$('.section-header').forEach(el => {
      el.setAttribute('data-anim', 'fade-up');
    });

    // Cards — staggered
    $$('.event-card').forEach((el, i) => {
      el.setAttribute('data-anim', 'card-in');
      el.style.setProperty('--delay', `${i * 0.08}s`);
    });

    // Timeline items
    $$('.timeline-item').forEach((el, i) => {
      el.setAttribute('data-anim', 'timeline-in');
      el.style.setProperty('--delay', `${i * 0.15}s`);
    });

    // About card
    const aboutCard = $('.about-scroll-card');
    if (aboutCard) aboutCard.setAttribute('data-anim', 'scale-in');

    // Contact cards
    $$('.contact-card').forEach((el, i) => {
      el.setAttribute('data-anim', 'card-in');
      el.style.setProperty('--delay', `${i * 0.1}s`);
    });

    // Stat items
    $$('.stat-item').forEach((el, i) => {
      el.setAttribute('data-anim', 'count-up');
      el.style.setProperty('--delay', `${i * 0.1}s`);
    });

    // CTA content
    const ctaContent = $('.cta-content');
    if (ctaContent) ctaContent.setAttribute('data-anim', 'fade-up');
  }

  // Observer
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('anim-visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

  markElements();
  $$('[data-anim]').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════
   6. MAGNETIC BUTTON EFFECT
══════════════════════════════════════════════ */
(function initMagneticButtons() {
  $$('.btn-primary, .btn-emerald').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════════════════
   7. CUSTOM CURSOR GLOW (desktop)
══════════════════════════════════════════════ */
(function initCursor() {
  if (window.innerWidth < 768) return; // skip mobile
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  document.body.appendChild(cursor);

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });

  function animateCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.transform = `translate(${cx - 24}px, ${cy - 24}px)`;
    raf(animateCursor);
  }
  animateCursor();

  // Grow on interactive elements
  $$('a, button, .event-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-large'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-large'));
  });
})();

/* ══════════════════════════════════════════════
   8. EVENT CARD MODAL SYSTEM
══════════════════════════════════════════════ */
(function initModals() {
  const modalData = {
    'Debug Thugs-Coding': {
      icon: '⚔️',
      type: 'Technical',
      color: '#3b82f6',
      time: '10:30 AM',
      venue: 'CSE Lab-301',
      team: 'Solo/Duo',
      prize: '🏆 Prize Awaits',
      staff: 'Mr. S. Balaji',
      students: 'Subasri N, Shabari, Saravana and Santhana Lakshmi',
      contact: '99945 94293',
      desc: 'Enter the ultimate algorithmic battlefield. Participants face a series of competitive programming problems of increasing difficulty. From brute force to dynamic programming — only the sharpest minds survive.',
      rules: [
        'Participants can compete individually or in teams of two.',
        'Programming languages allowed: C, C++, Java, or Python.',
        'Use of unauthorized internet resources or code snippets is strictly prohibited.',
        'Submissions will be judged based on accuracy, efficiency, and time taken.',
      ],
    },
    'Techno Bot - Chat bot Creation': {
      icon: '🤖',
      type: 'Technical',
      color: '#8b5cf6',
      time: '11:30 AM',
      venue: 'CSE LAB-301',
      team: 'Team of 3',
      prize: '🏆 Prize Awaits',
      staff: 'Mrs. R. Indumathi',
      students: 'Jenifer Salomi D, Bhuvanesh, Bharanidharan , Tharun, Praveen Kumar and Midhun Albert',
      contact: '99407 96144',
      desc: 'Build the future in a single day. Teams ideate, prototype, and present an AI-powered solution to a real-world problem revealed on the event day. Think fast, build smart.',
      rules: [
        'Teams must strictly consist of exactly three members.',
        'Participants must build functional chatbots using provided platforms or open-source tools.',
        'Evaluators will assess the bot\'s conversational logic, creativity, and issue-handling capability.',
        'Pre-built templates are not allowed; original implementation is mandatory.',
      ],
    },
    'Mind Crash - Puzzle Solver': {
      icon: '🐛',
      type: 'Technical',
      color: '#ef4444',
      time: '2:00 PM',
      venue: 'CSE LAB-301',
      team: 'Solo',
      prize: '🏆 Prize Awaits',
      staff: 'Mrs. S. Boovaneswari',
      students: 'Gowtham, Sarathi, Balaji,Lavanya, Sabari,Somnath and Tharani',
      contact: '94881 59651',
      desc: 'Bugs lurk in every corner of the code. Your mission: hunt them down, kill them all, and do it faster than everyone else. Pre-written buggy programs await — can you restore them to glory?',
      rules: [
        'Participation is strictly on an individual basis with no external assistance allowed.',
        'The event consists of multiple timed rounds with puzzles of increasing difficulty.',
        'Mobile phones or any electronic devices are strictly prohibited during the event.',
        'Scoring is based on the number of correct solutions and overall completion speed.',
      ],
    },
    'Animate the Future': {
      icon: '🎨',
      type: 'Technical',
      color: '#f59e0b',
      time: '2:00 PM',
      venue: 'CSE LAB-301',
      team: 'Solo/Duo',
      prize: '🏆 Prize Awaits',
      staff: 'Mrs. G. Sharmila',
      students: 'Sharanya, Nithyanandhan, Adithiya, Mohana krishnan , Avinash , Antro and Anandhanithiyan',
      contact: '88384 07339',
      desc: 'Craft a complete website from scratch. A design brief is provided on the spot. Your creation will be judged on creativity, responsiveness, code quality, and overall user experience.',
      rules: [
        'Participants may compete individually or in pairs to create an original animation.',
        'A specific theme will be provided on the spot, and creations must align with it.',
        'Only standard animation software and tools are permitted for use.',
        'Judging criteria include visual appeal, creativity, relevance to theme, and storytelling.',
      ],
    },
    'Eloquence-Paper Presentation': {
      icon: '🧠',
      type: 'Technical',
      color: '#10b981',
      time: '10:30 AM',
      venue: 'CSE Lab-301',
      team: 'Team of 2',
      prize: '🏆 Prize Awaits',
      staff: 'Mrs.J.Jayapradha',
      students: 'Supraja, Divya S,Bhala ganapathy, Bharath,Kajol, Shalini and shahina',
      contact: '82487 85717',
      desc: 'A multi-round quiz spanning Computer Science, current technology trends, logic puzzles, and rapid-fire rounds. Knowledge is your weapon — bring your sharpest mind.',
      rules: [
        'Each participating team must have exactly two members.',
        'Presentations should not exceed the allotted time limit followed by a Q&A session.',
        'Plagiarism in the research content will lead to immediate disqualification.',
        'Evaluation will focus on content quality, slide presentation, communication skills, and defense of queries.',
      ],
    },
    'Meme Creation': {
      icon: '😂',
      type: 'Fun',
      color: '#ec4899',
      time: '11:00 AM',
      venue: 'Hall 303',
      team: 'Solo',
      prize: '🎁 Gift Awaits',
      staff: 'Mrs. Nandhini',
      students: 'Mohith hasan, Sivaprakash, Thushanth and Ramya',
      contact: '73396 03873',
      desc: 'The internet is your canvas — memes are your art. Create the funniest, most creative tech memes on a given prompt. The crowd decides who wins the Meme Throne.',
      rules: [
        'This is a solo event focused on creativity, humor, and technical relevance.',
        'Participants must create original memes based on topics provided during the event.',
        'Content must be strictly professional; offensive or inappropriate material will lead to disqualification.',
        'Winners will be decided based on humor scale, relevance, and overall audience/judge reception.',
      ],
    },
    'Cini Blast': {
      icon: '🎮',
      type: 'Fun',
      color: '#06b6d4',
      time: '11:00 AM',
      venue: 'Hall 305',
      team: 'Solo/Team',
      prize: '🎁 Gift Awaits',
      staff: 'Mrs. M. Subhasree',
      students: 'Kavya B,Moyekuzali T, Dharani rajan N,Laxman T,Keerthana G,Harshawarthany and Kiruthiga V',
      contact: '95850 99340',
      desc: 'Enter the digital colosseum. Compete across multiple gaming titles in a bracket-style tournament. Victory demands reflexes, strategy, and nerves of steel.',
      rules: [
        'Participants can compete individually or form a team as per the event rules.',
        'The event will test cinematic knowledge across multiple exciting rounds.',
        'Use of mobile phones or internet search during the quiz is strictly prohibited.',
        'The judge\'s decision regarding answers and scoring will be considered final and binding.',
      ],
    },
    'Logo Finder': {
      icon: '🗺️',
      type: 'Fun',
      color: '#f97316',
      time: '11:00 PM',
      venue: 'Hall 302',
      team: 'Team of 3',
      prize: '🎁 Gift Awaits',
      staff: 'Mrs. D. Devaki',
      students: 'Om Prakash S, Harish T, Mughilan S',
      contact: '99436 97906',
      desc: 'Decode cryptic clues hidden across the campus. Each clue leads to the next — requiring logical thinking, technical knowledge, and teamwork. The first team to complete all checkpoints wins.',
      rules: [
        'Teams must be formed with exactly three members to participate in this hunt.',
        'Participants must decipher clues and correctly identify brand/tech logos throughout the rounds.',
        'Leaving the designated event area without authorization is not permitted.',
        'The first team to successfully decode all clues and finish the challenge wins.',
      ],
    },
    'Hear me out': {
      icon: '⚡',
      type: 'Fun',
      color: '#eab308',
      time: '11:00 AM',
      venue: 'Hall 305',
      team: 'Solo',
      prize: '🎁 Gift Awaits',
      staff: 'Mrs. U. R. Padma',
      students: 'Ruthran S,Thevipriya S,Veronika S',
      contact: '90038 30666',
      desc: 'Fast questions, faster answers. Think on your feet in this high-energy quiz with lightning-round format. Topics are light — tech trivia, pop culture, movies, and GK. Hesitate and you lose!',
      rules: [
        'This is an individual challenge requiring acute listening skills and quick thinking.',
        'Participants will listen to specific audio clips and must accurately identify the context or answer.',
        'Answers must be submitted within the given strict time constraints per audio clip.',
        'Any form of communication with other participants during the audio rounds is prohibited.',
      ],
    },
    'Anime Quiz': {
      icon: '🎬',
      type: 'Fun',
      color: '#7c3aed',
      time: '11:00 PM',
      venue: 'Hall 313',
      team: 'Solo/Duo',
      prize: '🎁 Gift Awaits',
      staff: 'Dr.J.Vaishnavi',
      students: 'N Kishore, A Kishore,Santhana Priyan and Mithun',
      contact: '96264 33235',
      desc: 'Document your CAPTCHA\'26 experience in a cinematic reel. Capture the energy, the battles, the friendships — and craft the most epic 30-second video of the symposium. The stage is yours.',
      rules: [
        'Participants may enter this ultimate quiz challenge individually or in teams of two.',
        'The quiz will cover various popular anime lore, characters, and storylines across multiple rounds.',
        'Participants caught seeking external help or using mobile devices will be disqualified.',
        'In case of a tie, rapid-fire tie-breaker questions will determine the ultimate winner.',
      ],
    },
  };

  // Build modal HTML
  function buildModal(data, title) {
    return `
    <div class="modal-overlay" id="eventModal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-panel" style="--card-accent:${data.color}">
        <button class="modal-close" aria-label="Close modal">✕</button>
        <div class="modal-header">
          <div class="modal-icon">${data.icon}</div>
          <div>
            <span class="modal-type-badge" style="color:${data.color};border-color:${data.color}40;background:${data.color}15">
              ${data.type} Event
            </span>
            <h2 class="modal-title">${title}</h2>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-meta-grid">
            <div class="modal-meta-item">
              <span class="modal-meta-label">🕐 Time</span>
              <span class="modal-meta-value">${data.time}</span>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-label">📍 Venue</span>
              <span class="modal-meta-value">${data.venue}</span>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-label">👥 Team</span>
              <span class="modal-meta-value">${data.team}</span>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-label">🏆 Prize</span>
              <span class="modal-meta-value" style="color:${data.color}">${data.prize}</span>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-label">👤 Staff Coordinator</span>
              <span class="modal-meta-value">${data.staff}</span>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-label">👥 Student Coordinators</span>
              <span class="modal-meta-value">${data.students}</span>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-label">📱 Contact</span>
              <span class="modal-meta-value"><a href="tel:+91${data.contact.replace(/\s/g, '')}" style="color:${data.color}">${data.contact}</a></span>
            </div>
          </div>
          <div class="modal-desc-block">
            <h4 class="modal-section-title">About This Event</h4>
            <p class="modal-desc">${data.desc}</p>
          </div>
          <div class="modal-rules-block">
            <h4 class="modal-section-title">Rules & Guidelines</h4>
            <ul class="modal-rules">
              ${data.rules.map(r => `<li><span class="rule-bullet" style="color:${data.color}">▶</span> ${r}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <a href="https://forms.gle/tzNvEMkeDEfBgk8v8" target="_blank" class="btn btn-emerald" style="--btn-color:${data.color};background:linear-gradient(135deg,${data.color}55,${data.color});border-color:${data.color}">
            Register for this Event →
          </a>
        </div>
      </div>
    </div>`;
  }

  function openModal(title) {
    const data = modalData[title];
    if (!data) return;

    // Remove existing
    const existing = $('#eventModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', buildModal(data, title));
    const modal = $('#eventModal');

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add('modal-open'));
    });

    document.body.style.overflow = 'hidden';

    // Close handlers
    function close() {
      modal.classList.remove('modal-open');
      setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 350);
    }

    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  }

  // Attach to all cards
  $$('.event-card').forEach(card => {
    const title = card.querySelector('.card-title')?.textContent?.trim();
    if (!title) return;

    card.style.cursor = 'pointer';

    // "View Details" indicator
    const indicator = document.createElement('div');
    indicator.className = 'card-view-indicator';
    indicator.textContent = 'View Details ↗';
    card.querySelector('.card-inner')?.appendChild(indicator);

    card.addEventListener('click', () => openModal(title));
  });
})();

/* ══════════════════════════════════════════════
   9. SMOOTH SCROLL for anchor links
══════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ══════════════════════════════════════════════
   10. SECTION ENTRY — ink-spread / clip-path
══════════════════════════════════════════════ */
(function initSectionEntry() {
  $$('.section').forEach((sec, i) => {
    sec.style.setProperty('--sec-i', i);
  });
})();

/* ══════════════════════════════════════════════
   11. GLOWING CURSOR TRAIL on hero
══════════════════════════════════════════════ */
(function initTrail() {
  if (window.innerWidth < 768) return;
  const hero = $('.hero');
  if (!hero) return;

  hero.addEventListener('mousemove', e => {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 700);
  });
})();

/* ══════════════════════════════════════════════
   12. TIMELINE SCROLL — horizontal snap hint
══════════════════════════════════════════════ */
(function initTimeline() {
  const tl = $('.timeline');
  if (!tl) return;

  // Add scroll hint text on mobile
  if (window.innerWidth < 900) {
    const hint = document.createElement('div');
    hint.className = 'timeline-scroll-hint';
    hint.textContent = '← Scroll to explore the timeline →';
    tl.insertAdjacentElement('afterend', hint);
  }
})();

/* ══════════════════════════════════════════════
   13. STATS COUNTER ANIMATION
══════════════════════════════════════════════ */
(function initCounters() {
  const statNums = $$('.stat-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      const isNum = /^\d+/.test(text);
      if (!isNum) return;
      const target = parseInt(text);
      let start = 0;
      const dur = 1200;
      const step = dur / target;
      const timer = setInterval(() => {
        start += Math.ceil(target / 40);
        el.textContent = Math.min(start, target) + (text.includes('+') ? '+' : '');
        if (start >= target) clearInterval(timer);
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════
   14. EVENT CAROUSEL — arrows + touch swipe
══════════════════════════════════════════════ */
(function initCarousels() {
  $$('.events-carousel').forEach(carousel => {
    const grid = carousel.querySelector('.events-grid');
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    if (!grid || !prev || !next) return;

    function getScrollAmount() {
      const card = grid.querySelector('.event-card');
      if (!card) return 300;
      return card.offsetWidth + 24; // card width + gap
    }

    function updateArrows() {
      const atStart = grid.scrollLeft <= 5;
      const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 5;
      prev.style.opacity = atStart ? '0.3' : '1';
      prev.style.pointerEvents = atStart ? 'none' : 'auto';
      next.style.opacity = atEnd ? '0.3' : '1';
      next.style.pointerEvents = atEnd ? 'none' : 'auto';
    }

    prev.addEventListener('click', () => {
      grid.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      grid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    grid.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();

    // Touch / Swipe support
    let startX = 0, startScroll = 0, isDragging = false;

    grid.addEventListener('pointerdown', e => {
      isDragging = true;
      startX = e.pageX;
      startScroll = grid.scrollLeft;
      grid.style.scrollBehavior = 'auto';
      grid.style.cursor = 'grabbing';
    });

    grid.addEventListener('pointermove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.pageX - startX;
      grid.scrollLeft = startScroll - dx;
    });

    const endDrag = () => {
      isDragging = false;
      grid.style.scrollBehavior = 'smooth';
      grid.style.cursor = '';
    };

    grid.addEventListener('pointerup', endDrag);
    grid.addEventListener('pointerleave', endDrag);
  });
})();
