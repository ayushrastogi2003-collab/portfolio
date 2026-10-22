// Main JavaScript for Ayush Rastogi's Data Analyst Portfolio

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initInteractiveBackground();
  initTypingEffect();
  initNavigation();
  initSkillsFilter();
  initDataPlayground();
  initCopyButtons();
  initContactForm();
  initBackToTop();
});

/* ==========================================================
   1. Theme Management (Light / Dark)
   ========================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'dark');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      if (window.analyticsChart) {
        updateChartTheme(newTheme);
      }
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    if (theme === 'light') {
      icon.className = 'fa-solid fa-moon';
    } else {
      icon.className = 'fa-solid fa-sun';
    }
  }
}

/* ==========================================================
   2. Interactive Dynamic Background (Constellation & Spotlight)
   ========================================================== */
function initInteractiveBackground() {
  const canvas = document.getElementById('particle-canvas');
  const mouseGlow = document.getElementById('mouse-glow');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let pulses = [];
  let shockwaves = [];
  const mouse = { x: null, y: null, maxRadius: 160 };

  const colorPalette = [
    { r: 56, g: 189, b: 248 },  // Cyan
    { r: 96, g: 165, b: 250 },  // Blue
    { r: 168, g: 85, b: 247 },  // Purple
    { r: 52, g: 211, b: 153 },  // Emerald
    { r: 251, g: 191, b: 36 }   // Amber
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  function getParticleCount() {
    return window.innerWidth < 768 ? 30 : 65;
  }

  function createParticles() {
    particles = [];
    pulses = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2,
        baseAlpha: Math.random() * 0.45 + 0.35,
        color: color,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (mouseGlow) {
      mouseGlow.style.left = `${e.clientX}px`;
      mouseGlow.style.top = `${e.clientY}px`;
      mouseGlow.style.opacity = '1';
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    if (mouseGlow) {
      mouseGlow.style.opacity = '0';
    }
  });

  // Interactive Click Ripple
  window.addEventListener('click', (e) => {
    shockwaves.push({
      x: e.clientX,
      y: e.clientY,
      radius: 5,
      maxRadius: 180,
      alpha: 0.6
    });

    // Gently push nearby particles
    particles.forEach(p => {
      const dx = p.x - e.clientX;
      const dy = p.y - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180 && dist > 0) {
        const force = (180 - dist) / 180 * 4;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    });
  });

  let frame = 0;

  function animate() {
    ctx.clearRect(0, 0, width, height);
    frame++;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Draw active shockwaves
    for (let s = shockwaves.length - 1; s >= 0; s--) {
      const sw = shockwaves[s];
      sw.radius += 4;
      sw.alpha *= 0.94;

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isLight 
        ? `rgba(37, 99, 235, ${sw.alpha})`
        : `rgba(56, 189, 248, ${sw.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0.02) {
        shockwaves.splice(s, 1);
      }
    }

    // Occasionally spawn traveling data pulses along connections
    if (frame % 45 === 0 && particles.length > 5) {
      const sourceIdx = Math.floor(Math.random() * particles.length);
      const p1 = particles[sourceIdx];
      // Find nearest neighbor
      for (let j = 0; j < particles.length; j++) {
        if (sourceIdx !== j) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            pulses.push({
              x1: p1.x, y1: p1.y,
              x2: p2.x, y2: p2.y,
              progress: 0,
              speed: 0.025,
              color: p1.color
            });
            break;
          }
        }
      }
    }

    // Draw and update data pulses
    for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
      const pulse = pulses[pIdx];
      pulse.progress += pulse.speed;

      const px = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.progress;
      const py = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.progress;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0.95)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgb(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b})`;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      if (pulse.progress >= 1) {
        pulses.splice(pIdx, 1);
      }
    }

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Dampen velocity after clicks
      p.vx *= 0.985;
      p.vy *= 0.985;

      if (Math.abs(p.vx) < 0.25) p.vx = (Math.random() - 0.5) * 0.6;
      if (Math.abs(p.vy) < 0.25) p.vy = (Math.random() - 0.5) * 0.6;

      // Bounce against edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Breathing glow calculation
      const pulseAlpha = p.baseAlpha + Math.sin(frame * 0.04 + p.pulseOffset) * 0.15;
      const finalAlpha = Math.max(0.15, Math.min(0.9, pulseAlpha));

      // Draw particle with luminous glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${finalAlpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // Connect to mouse pointer
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.maxRadius) {
          const alpha = (1 - dist / mouse.maxRadius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = isLight
            ? `rgba(37, 99, 235, ${alpha})`
            : `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Connect between neighboring particles with multi-color gradient
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 125) {
          const alpha = (1 - dist / 125) * 0.22;
          const grad = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
          grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`);
          grad.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${alpha})`);

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================
   2. Dynamic Typing Effect in Hero
   ========================================================== */
function initTypingEffect() {
  const typedSpan = document.getElementById('typed-text');
  if (!typedSpan) return;

  const words = [
    'Data Analyst',
    'SQL & Power BI Specialist',
    'Python & EDA Explorer',
    'Business Insights Builder'
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 90;
  const deleteSpeed = 45;
  const pauseEnd = 1600;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      typedSpan.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedSpan.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(type, pauseEnd);
      return;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(type, 300);
      return;
    }

    setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
  }

  type();
}

/* ==========================================================
   3. Navigation, Mobile Menu & Scroll Spy
   ========================================================== */
function initNavigation() {
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = hamburger.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = hamburger.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  // Scrollspy
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset + 120;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================
   4. Skills Matrix Filtering
   ========================================================== */
function initSkillsFilter() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================
   5. Interactive Live Data Playground (Chart.js)
   ========================================================== */
function initDataPlayground() {
  const ctx = document.getElementById('analyticsChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const textColor = isLight ? '#0f172a' : '#f9fafb';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';

  // Datasets for Ayush's projects
  const datasets = {
    pizza: {
      type: 'bar',
      labels: ['Classic', 'Supreme', 'Veggie', 'Chicken', 'Specialty'],
      datasets: [
        {
          label: 'Total Revenue ($ in Thousands)',
          data: [14.8, 20.5, 12.2, 17.6, 16.1],
          backgroundColor: 'rgba(59, 130, 246, 0.75)',
          borderColor: '#3b82f6',
          borderWidth: 1.5,
          borderRadius: 6
        },
        {
          label: 'Total Orders (Hundreds)',
          data: [11.2, 15.3, 9.8, 13.7, 12.0],
          backgroundColor: 'rgba(6, 182, 212, 0.75)',
          borderColor: '#06b6d4',
          borderWidth: 1.5,
          borderRadius: 6
        }
      ],
      title: 'Pizza Sales Analysis — Category Performance'
    },
    cars: {
      type: 'line',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'SUV Sales Volume',
          data: [420, 580, 690, 810],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 5
        },
        {
          label: 'Sedan Sales Volume',
          data: [350, 410, 460, 520],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 5
        }
      ],
      title: 'Car Sales Analysis — Quarterly Trends by Segment'
    }
  };

  let currentKey = 'pizza';

  window.analyticsChart = new Chart(ctx, {
    type: datasets[currentKey].type,
    data: {
      labels: datasets[currentKey].labels,
      datasets: datasets[currentKey].datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Inter', size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 13 },
          bodyFont: { size: 12 }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        }
      }
    }
  });

  // Switch dataset buttons
  const datasetButtons = document.querySelectorAll('.data-switch-btn');
  datasetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      datasetButtons.forEach(b => b.classList.remove('btn-primary'));
      datasetButtons.forEach(b => b.classList.add('btn-secondary'));
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');

      currentKey = btn.getAttribute('data-dataset');
      const selected = datasets[currentKey];

      window.analyticsChart.config.type = selected.type;
      window.analyticsChart.data.labels = selected.labels;
      window.analyticsChart.data.datasets = selected.datasets;
      window.analyticsChart.update();
    });
  });
}

function updateChartTheme(theme) {
  if (!window.analyticsChart) return;
  const isLight = theme === 'light';
  const textColor = isLight ? '#0f172a' : '#f9fafb';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';

  window.analyticsChart.options.plugins.legend.labels.color = textColor;
  window.analyticsChart.options.scales.x.ticks.color = textColor;
  window.analyticsChart.options.scales.y.ticks.color = textColor;
  window.analyticsChart.options.scales.x.grid.color = gridColor;
  window.analyticsChart.options.scales.y.grid.color = gridColor;
  window.analyticsChart.update();
}

/* ==========================================================
   6. Copy to Clipboard Utility
   ========================================================== */
function initCopyButtons() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Copied to clipboard: ' + textToCopy);
        }).catch(() => {
          showToast('Failed to copy');
        });
      }
    });
  });
}

/* ==========================================================
   7. Contact Form Handling
   ========================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`Hi Ayush,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

    // Direct mailto link
    window.location.href = `mailto:ayushrastogi2003@gmail.com?subject=${subject}&body=${body}`;
    showToast('Opening your email client...');
    form.reset();
  });
}

/* ==========================================================
   8. Back to Top Button & Toast Feedback
   ========================================================== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
