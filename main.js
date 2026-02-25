/* ==============================================
   AdMonitor MX — Main JavaScript
   ============================================== */

(function () {
  'use strict';

  /* ---- HEADER scroll state ---- */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Active nav link ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const activateLink = () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(a => a.classList.remove('active'));
        const match = document.querySelector(`.nav__link[href="#${sec.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', activateLink, { passive: true });

  /* ---- Hamburger / mobile nav ---- */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Intersection Observer: AOS-like reveals ---- */
  const revealEls = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0, 10);
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
  );
  revealEls.forEach(el => observer.observe(el));

  /* ---- Counter animation for hero stats ---- */
  const statNumbers = document.querySelectorAll('.hero__stat-number');
  const animateCount = (el, end, suffix, duration) => {
    const start = performance.now();
    const step = timestamp => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * end) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      // First stat: 365/12 — non-numeric, leave as-is or reveal it
      if (statNumbers[0]) statNumbers[0].textContent = '365/12';
      // Second stat: 100% satisfaction
      if (statNumbers[1]) animateCount(statNumbers[1], 100, '%', 1400);
      // Third stat: +8 — leave as-is
      if (statNumbers[2]) statNumbers[2].textContent = '+8';
      heroObserver.disconnect();
    }
  }, { threshold: 0.5 });
  const heroStats = document.querySelector('.hero__stats');
  if (heroStats) heroObserver.observe(heroStats);

  /* ---- Contact form ---- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  const validateField = input => {
    const isEmpty = !input.value.trim();
    const isEmail = input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    const invalid = (input.required && isEmpty) || (input.type === 'email' && !isEmpty && isEmail);
    input.classList.toggle('error', invalid);
    return !invalid;
  };

  if (form) {
    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('input[required], textarea[required]').forEach(field => {
        if (!validateField(field)) valid = false;
      });
      if (!valid) return;

      // Simulate submission
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Enviando...';

      setTimeout(() => {
        form.querySelectorAll('input, textarea, select').forEach(f => (f.value = ''));
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Enviar Consulta';
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }, 1500);
    });
  }

  /* ---- Testimonial auto-carousel on mobile ---- */
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial-card');
  const setupTestimonialCarousel = () => {
    if (window.innerWidth > 768 || testimonials.length === 0) return;
    testimonials.forEach((t, i) => {
      t.style.display = i === 0 ? 'block' : 'none';
    });
    setInterval(() => {
      testimonials[currentTestimonial].style.display = 'none';
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      testimonials[currentTestimonial].style.display = 'block';
    }, 4000);
  };
  setupTestimonialCarousel();

  /* ---- Pause logo marquee on hover ---- */
  const track = document.querySelector('.clientes-logos__track');
  if (track) {
    track.addEventListener('mouseenter', () => (track.style.animationPlayState = 'paused'));
    track.addEventListener('mouseleave', () => (track.style.animationPlayState = 'running'));
  }

  /* ---- Gallery item click (lightbox placeholder) ---- */
  document.querySelectorAll('.gallery__img-placeholder').forEach(item => {
    item.addEventListener('click', () => {
      const label = item.querySelector('span')?.textContent;
      if (label) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;
          display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;
          cursor:pointer;backdrop-filter:blur(8px);
        `;
        overlay.innerHTML = `
          <div style="width:600px;max-width:90vw;aspect-ratio:16/9;background:linear-gradient(135deg,#0a1628,#1a2e52);border-radius:16px;
            display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;border:1px solid rgba(255,255,255,0.1);">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><rect x="6" y="10" width="60" height="40" rx="6" stroke="rgba(255,255,255,0.3)" stroke-width="2"/><path d="M6 40l18-14 12 10 10-8 20 16" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linejoin="round"/></svg>
            <p style="color:rgba(255,255,255,0.5);font-family:Outfit,sans-serif;font-size:1rem;">${label}</p>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;">Haz clic para cerrar</p>
        `;
        overlay.addEventListener('click', () => document.body.removeChild(overlay));
        document.body.appendChild(overlay);
      }
    });
  });

  /* ---- Tabs: make servicio cards keyboard accessible ---- */
  document.querySelectorAll('.servicio-card').forEach(card => {
    card.setAttribute('tabindex', '0');
  });

  console.log('🎯 Publiser MX — Cargado correctamente');
})();
