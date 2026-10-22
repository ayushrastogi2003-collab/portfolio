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
  const mouse = { x: null, y: null, maxRadius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  function getParticleCount() {
    return window.innerWidth < 768 ? 26 : 58;
  }

  function createParticles() {
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 1.8 + 1,
        baseAlpha: Math.random() * 0.4 + 0.25
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

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const dotColor = isLight ? 'rgba(37, 99, 235,' : 'rgba(56, 189, 248,';
    const lineColor = isLight ? 'rgba(37, 99, 235,' : 'rgba(59, 130, 246,';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${dotColor} ${p.baseAlpha})`;
      ctx.fill();

      // Connect to mouse pointer
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.maxRadius) {
          const alpha = (1 - dist / mouse.maxRadius) * 0.35;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `${lineColor} ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Connect with neighbor particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 115) {
          const alpha = (1 - dist / 115) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `${lineColor} ${alpha})`;
          ctx.lineWidth = 0.8;
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
