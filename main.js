(function () {
  'use strict';

  const header = document.getElementById('header');

  // Header scroll
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const activateLink = () => {
    const threshold = header.offsetHeight + 8;
    let current = null;
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= threshold) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', activateLink, { passive: true });
  activateLink();

  // Hamburger mobile nav
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

  // Dropdown toggle (mobile tap; desktop uses CSS hover)
  const dropdownWraps = document.querySelectorAll('.nav__dropdown-wrap');
  dropdownWraps.forEach(wrap => {
    const trigger = wrap.querySelector('.nav__dropdown-trigger');
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = wrap.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen);
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav__dropdown-wrap')) {
      dropdownWraps.forEach(wrap => {
        wrap.classList.remove('open');
        const trigger = wrap.querySelector('.nav__dropdown-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 16);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // AOS-like reveals
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0, 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

  // Hero stats counter
  const statNumbers = document.querySelectorAll('.hero__stat-number');
  const animateCount = (el, end, suffix, duration) => {
    const start = performance.now();
    const step = ts => {
      const progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - progress, 3)) * end) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const heroStats = document.querySelector('.hero__stats');
  if (heroStats) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (statNumbers[0]) statNumbers[0].textContent = '365/12';
        if (statNumbers[1]) animateCount(statNumbers[1], 100, '%', 1400);
        if (statNumbers[2]) animateCount(statNumbers[2], 2136, '+', 1800);
        entries[0].target._obs?.disconnect();
      }
    }, { threshold: 0.5 }).observe(heroStats);
  }

  // Testimonial carousel (mobile)
  const testimonials = document.querySelectorAll('.testimonial-card');
  if (window.innerWidth <= 768 && testimonials.length > 0) {
    let current = 0;
    testimonials.forEach((t, i) => { t.style.display = i === 0 ? 'block' : 'none'; });
    setInterval(() => {
      testimonials[current].style.display = 'none';
      current = (current + 1) % testimonials.length;
      testimonials[current].style.display = 'block';
    }, 4000);
  }

  // Pause logo marquee on hover
  const track = document.querySelector('.clientes-logos__track');
  if (track) {
    track.addEventListener('mouseenter', () => (track.style.animationPlayState = 'paused'));
    track.addEventListener('mouseleave', () => (track.style.animationPlayState = 'running'));
  }

  // Keyboard accessible service cards
  document.querySelectorAll('.servicio-card').forEach(card => card.setAttribute('tabindex', '0'));

  // Demo booking form
  const demoBookingForm = document.getElementById('demoBookingForm');
  if (demoBookingForm) {

    // Custom datepicker
    const pickerEl = document.getElementById('demoPicker');
    if (pickerEl) {
      const todayDp = new Date();
      todayDp.setHours(0, 0, 0, 0);
      let viewDate = new Date(todayDp.getFullYear(), todayDp.getMonth(), 1);
      let selectedDate = null;
      const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

      const dpToggle   = document.getElementById('demoPickerToggle');
      const dpPanel    = document.getElementById('demoPickerPanel');
      const dpLabel    = document.getElementById('demoPickerLabel');
      const dpMonthYr  = document.getElementById('demoPickerMonthYear');
      const dpGrid     = document.getElementById('demoPickerGrid');
      const dpHidden   = document.getElementById('demoFecha');

      function dpRender() {
        const yr = viewDate.getFullYear(), mo = viewDate.getMonth();
        dpMonthYr.textContent = `${MONTHS_ES[mo]} ${yr}`;
        const firstDow = new Date(yr, mo, 1).getDay();
        const offset = firstDow === 0 ? 6 : firstDow - 1;
        const total = new Date(yr, mo + 1, 0).getDate();
        dpGrid.innerHTML = '';
        for (let i = 0; i < offset; i++) {
          const s = document.createElement('span');
          s.className = 'dp-cell dp-empty';
          dpGrid.appendChild(s);
        }
        for (let d = 1; d <= total; d++) {
          const date = new Date(yr, mo, d);
          const dow = date.getDay();
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'dp-cell';
          btn.textContent = d;
          if (date < todayDp || dow === 0 || dow === 6) {
            btn.disabled = true;
            btn.classList.add('dp-disabled');
          }
          if (date.toDateString() === todayDp.toDateString()) btn.classList.add('dp-today');
          if (selectedDate && date.toDateString() === selectedDate.toDateString()) btn.classList.add('dp-selected');
          if (!btn.disabled) {
            btn.addEventListener('click', () => {
              selectedDate = date;
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              dpHidden.value = `${date.getFullYear()}-${mm}-${dd}`;
              dpLabel.textContent = `${dd} ${MONTHS_ES[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
              dpLabel.classList.add('dp-has-value');
              dpToggle.classList.remove('error');
              dpClose();
              dpRender();
            });
          }
          dpGrid.appendChild(btn);
        }
      }

      function dpOpen()  { dpPanel.hidden = false; dpToggle.setAttribute('aria-expanded', 'true');  dpRender(); }
      function dpClose() { dpPanel.hidden = true;  dpToggle.setAttribute('aria-expanded', 'false'); }

      dpToggle.addEventListener('click', e => { e.stopPropagation(); dpPanel.hidden ? dpOpen() : dpClose(); });
      document.getElementById('demoPickerPrev').addEventListener('click', e => { e.stopPropagation(); viewDate.setMonth(viewDate.getMonth() - 1); dpRender(); });
      document.getElementById('demoPickerNext').addEventListener('click', e => { e.stopPropagation(); viewDate.setMonth(viewDate.getMonth() + 1); dpRender(); });
      document.addEventListener('click', e => { if (!e.target.closest('#demoPicker')) dpClose(); });
    }

    // Hour select error clear
    const horaSelect = document.getElementById('demoHora');
    if (horaSelect) horaSelect.addEventListener('change', () => horaSelect.classList.remove('error'));

    // Submit
    demoBookingForm.addEventListener('submit', e => {
      e.preventDefault();
      const dpHidden = document.getElementById('demoFecha');
      const dpToggle = document.getElementById('demoPickerToggle');
      const hora = document.getElementById('demoHora');
      let valid = true;
      if (!dpHidden || !dpHidden.value) { if (dpToggle) dpToggle.classList.add('error'); valid = false; }
      if (!hora.value) { hora.classList.add('error'); valid = false; }
      if (!valid) return;
      demoBookingForm.querySelector('.demo-booking-inputs').style.display = 'none';
      document.getElementById('demoBookingSuccess').classList.add('show');
    });
  }

  // Contact form
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  const INJECTION = /('|--|;|\/\*|\*\/|xp_|exec\s*\(|select\s+|insert\s+|update\s+|delete\s+|drop\s+|alter\s+|create\s+|union\s+|script\s*:|javascript\s*:|on\w+\s*=)/i;

  const LIMITS = { nombre: 100, apellido: 100, empresa: 100, correo: 150, telefono: 20, mensaje: 1000 };

  const sanitize = v => v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;');

  const validateField = input => {
    const val = input.value.trim();
    const limit = LIMITS[input.name];
    let invalid =
      (input.required && !val) ||
      (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) ||
      (limit && val.length > limit) ||
      (val && INJECTION.test(val));
    input.classList.toggle('error', !!invalid);
    return !invalid;
  };

  Object.entries(LIMITS).forEach(([name, max]) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.setAttribute('maxlength', max);
  });

  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => { if (field.classList.contains('error')) validateField(field); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) return;

    const payload = {};
    form.querySelectorAll('input, textarea, select').forEach(f => { if (f.name) payload[f.name] = sanitize(f.value.trim()); });

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Enviando...';

    fetch('submit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(r => {
        if (r.ok) {
          form.querySelectorAll('input, textarea, select').forEach(f => (f.value = ''));
          successMsg.classList.add('show');
          setTimeout(() => successMsg.classList.remove('show'), 5000);
        } else {
          alert(r.errors ? r.errors.join('\n') : (r.error || 'Error al enviar. Intenta de nuevo.'));
        }
      })
      .catch(() => alert('No se pudo conectar con el servidor. Intenta más tarde.'))
      .finally(() => {
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Enviar Consulta';
      });
  });

})();
