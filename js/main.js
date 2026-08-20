/**
 * main.js — App Entry Point — CrideviSPA
 * =========================================
 * Wires up all events via delegation.
 * Runs after DOMContentLoaded.
 * =========================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Dismiss loading screen ──────── */
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    // Wait for bar animation (1s delay + 1.4s fill = 2.4s) then fade out
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      // Remove from DOM after transition ends
      loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();
      }, { once: true });
    }, 2600);
  }

  /* ── Build WA links from config ── */
  const WA_RESERVE = buildWaLink('reservation');


  /* ── One-time init ─────────────── */
  _init(WA_RESERVE);

  function _init(waLink) {
    // 1. Render footers
    renderFooters(waLink);

    // 2. Set all WA links
    hydrateWaLinks(waLink);

    // 3. Render treatments page (All)
    _renderTreatmentsPageView('All');

    // 4. Render location treatments
    _renderLocTreatments('All');

    // 5. Render homepage price grid
    const hpGrid = document.getElementById('homepage-treatment-grid');
    if (hpGrid) renderHomepageTreatmentsGrid(hpGrid, waLink);

    // 6. Scroll listener for header
    let _scrollTick = false;
    window.addEventListener('scroll', () => {
      if (_scrollTick) return;
      _scrollTick = true;
      requestAnimationFrame(() => {
        _updateHeaderStyle();
        _scrollTick = false;
      });
    }, { passive: true });

    // 7. Scroll reveal observer
    _initRevealObserver();

    // 8. Hamburger menu
    _initHamburger();

    // 9. Hero image zoom-out on load
    const hero = document.getElementById('hero-section');
    if (hero) requestAnimationFrame(() => hero.classList.add('loaded'));

    // 10. Initial View / Hash Routing
    const hash = window.location.hash;
    if (hash === '#treatments' || hash === '#treatment') {
      _renderTreatmentsPageView('All');
      showView('treatments-page-view');
    } else if (hash === '#booking' || hash === '#book') {
      _renderBookingView();
      showView('booking-view');
    } else if (hash === '#location') {
      showView('location-detail-view');
    } else {
      showView('home-view');
    }
  }

  /* ── Header Style ───────────────── */
  function _updateHeaderStyle() {
    const header = document.getElementById('main-header');
    if (!header) return;
    const scrolled = window.scrollY > 20;
    header.classList.toggle('scrolled', scrolled);
  }

  /* ── Hamburger Menu ─────────────── */
  function _initHamburger() {
    const btn       = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (!btn || !mobileNav) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');
      btn.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.classList.toggle('open', !isOpen);
      mobileNav.setAttribute('aria-hidden', String(isOpen));
    });

    mobileNav.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) {
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });

    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !mobileNav.contains(e.target)) {
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    }, { capture: true });
  }

  /* ── Scroll Reveal Observer ─────── */
  function _initRevealObserver() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .reveal-card').forEach(el => el.classList.add('visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger cards within a grid
        const parent = el.parentElement;
        if (parent && el.classList.contains('reveal-card')) {
          const siblings = [...parent.querySelectorAll('.reveal-card')];
          const idx = siblings.indexOf(el);
          el.style.transitionDelay = `${idx * 0.1}s`;
        }
        el.classList.add('visible');
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .reveal-card').forEach(el => io.observe(el));
  }

  /* ── Stat Counter Animation ─────── */
  function _initStatCounters() {
    if (!('IntersectionObserver' in window)) return;

    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        _animateCounter(el, target);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
  }

  function _animateCounter(el, target) {
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Treatments Page ────────────── */
  function _renderTreatmentsPageView(cat) {
    const container = document.getElementById('treatments-full-list');
    if (!container) return;
    renderTreatmentsPage(container, cat, WA_RESERVE);
  }

  function _renderLocTreatments(cat) {
    const container = document.getElementById('loc-treatment-list');
    if (!container) return;
    const items = getTreatmentsByCategory(cat);
    renderTreatmentRows(container, items, WA_RESERVE);

    const label = document.getElementById('loc-group-label');
    const isId = (typeof currentLang !== 'undefined' && currentLang === 'id');
    if (label) {
      if (cat === 'All') {
        label.textContent = isId ? 'SEMUA TREATMENT' : 'ALL TREATMENTS';
      } else {
        label.textContent = cat.toUpperCase();
      }
    }
  }

  /* ── Global Click Delegation ────── */
  document.addEventListener('click', (e) => {
    // Navigation
    const navEl = e.target.closest('[data-view]');
    if (navEl) {
      _handleNavClick(e, navEl);
      return;
    }

    // Open Treatment Info Modal (from More info or Book appointment on card)
    const openInfoBtn = e.target.closest('.js-open-treatment-info, .js-more-info');
    if (openInfoBtn) {
      e.preventDefault();
      _openTreatmentModal(openInfoBtn.dataset.t);
      return;
    }

    // Modal Close
    if (e.target.closest('.js-modal-close')) {
      e.preventDefault();
      _closeTreatmentModal();
      return;
    }

    // Confirm Booking from INSIDE the Modal
    const modalBookBtn = e.target.closest('.js-modal-confirm-book');
    if (modalBookBtn) {
      e.preventDefault();
      _closeTreatmentModal();
      _addTreatmentToBooking(modalBookBtn.dataset.t);
      return;
    }

    // Remove Treatment from Booking List
    const removeBtn = e.target.closest('.js-remove-treatment');
    if (removeBtn) {
      e.preventDefault();
      _removeTreatmentFromBooking(removeBtn.dataset.itemId);
      return;
    }
  });

  function _handleNavClick(e, el) {
    if (!el) return;
    const view = el.getAttribute('data-view');
    if (!view) return;
    e.preventDefault();

    // Close mobile nav
    const btn       = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (btn && mobileNav) {
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
    }

    if (view === 'home') {
      showView('home-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'treatments-page') {
      const cat = el.dataset.cat || 'All';
      _setActivePill('treatments-page-pill-bar', cat);
      _renderTreatmentsPageView(cat);
      showView('treatments-page-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'location-detail') {
      showView('location-detail-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'booking-view') {
      _renderBookingView();
      showView('booking-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  }

  /* ── Multi-Treatment Modal & Booking State ──────── */
  let _selectedTreatments = [];

  function _openTreatmentModal(tDataStr) {
    const modal = document.getElementById('treatment-modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;
    
    // Call UI function to render modal content
    if (typeof renderModalContent === 'function') {
      renderModalContent(body, tDataStr);
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function _closeTreatmentModal() {
    const modal = document.getElementById('treatment-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function _addTreatmentToBooking(tDataStr) {
    try {
      const data = JSON.parse(tDataStr);
      const itemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      
      _selectedTreatments.push({
        itemId,
        name: data.name,
        dur: data.dur,
        price: data.price,
        desc: data.desc || ''
      });

      _renderBookingView();
      showView('booking-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
      console.error('Failed to add treatment', e);
    }
  }

  function _removeTreatmentFromBooking(itemId) {
    _selectedTreatments = _selectedTreatments.filter(item => item.itemId !== itemId);
    _renderBookingView();
  }

  function _renderBookingView() {
    const box = document.getElementById('booking-selected-treatment');
    const sumList = document.getElementById('booking-summary-list');
    
    if (!box || !sumList) return;

    if (_selectedTreatments.length === 0) {
      const isId = (typeof currentLang !== 'undefined' && currentLang === 'id');
      box.innerHTML = `<p class="st-empty">${isId ? 'Belum ada treatment dipilih. Silakan klik tombol di bawah untuk memilih treatment.' : 'No treatment selected yet. Click a treatment below to add one.'}</p>`;
      sumList.innerHTML = `<p class="summary-placeholder">${isId ? 'Pilih treatment dari menu untuk melihat detail.' : 'Select a treatment to see the summary.'}</p>`;
      return;
    }

    // Render list in form
    const itemsHtml = _selectedTreatments.map(item => `
      <div class="selected-treatment-item" data-item-id="${item.itemId}">
        <div class="st-item-info">
          <div class="st-item-name">${esc(item.name)} &mdash; <span class="st-item-dur">${esc(item.dur)}</span></div>
          <div class="st-item-price">${esc(item.price)}</div>
        </div>
        <button type="button" class="st-remove js-remove-treatment" data-item-id="${item.itemId}">Remove</button>
      </div>
    `).join('');

    box.innerHTML = `<div class="selected-treatment-list">${itemsHtml}</div>`;

    // Render summary on right side
    let totalPrice = 0;
    const summaryItemsHtml = _selectedTreatments.map(item => {
      const num = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
      totalPrice += num;
      return `
        <div class="summary-item">
          <div class="summary-item-title">${esc(item.name)}</div>
          <div class="summary-item-meta">${esc(item.dur)} &middot; ${esc(item.price)}</div>
        </div>
      `;
    }).join('');

    const isId = (typeof currentLang !== 'undefined' && currentLang === 'id');
    const formattedTotal = 'Rp ' + totalPrice.toLocaleString('id-ID');
    const totalLabel = isId
      ? `Total (${_selectedTreatments.length} treatment)`
      : `Total (${_selectedTreatments.length} treatment${_selectedTreatments.length !== 1 ? 's' : ''})`;

    sumList.innerHTML = `
      <div class="summary-items-wrap">
        ${summaryItemsHtml}
      </div>
      <div class="summary-total-row">
        <span>${totalLabel}</span>
        <span class="summary-total-amount">${formattedTotal}</span>
      </div>
    `;
  }

  /* ── Secure string sanitizer (prevents XSS from stored booking data) ── */
  function _sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /* ── Save booking to localStorage ─────────────────────────────────────── */
  function _saveBookingToStorage(bookingData) {
    try {
      const raw = localStorage.getItem('cridevispa_bookings');
      const bookings = raw ? JSON.parse(raw) : [];
      bookings.unshift(bookingData); // newest first
      // Keep max 200 entries to avoid localStorage bloat
      if (bookings.length > 200) bookings.splice(200);
      localStorage.setItem('cridevispa_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.warn('Could not save booking to localStorage:', e);
    }
  }

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (_selectedTreatments.length === 0) {
        const isId = (typeof currentLang !== 'undefined' && currentLang === 'id');
        alert(isId
          ? 'Silakan pilih minimal 1 treatment terlebih dahulu sebelum melakukan reservasi.'
          : 'Please select at least 1 treatment before booking.');
        showView('treatments-page-view');
        return;
      }

      const date   = document.getElementById('b-date').value;
      const time   = document.getElementById('b-time').value;
      const fname  = document.getElementById('b-fname').value.trim();
      const lname  = document.getElementById('b-lname').value.trim();
      const name   = `${fname} ${lname}`.trim();
      const phone  = document.getElementById('b-phone').value.trim();
      const email  = document.getElementById('b-email') ? document.getElementById('b-email').value.trim() : '';
      const msg    = document.getElementById('b-msg').value.trim();

      let totalPrice = 0;
      const treatmentLines = _selectedTreatments.map((t, idx) => {
        const num = parseInt(t.price.replace(/[^0-9]/g, ''), 10) || 0;
        totalPrice += num;
        return `${idx + 1}. ${t.name} (${t.dur}) — ${t.price}`;
      }).join('\n');

      const formattedTotal = 'Rp ' + totalPrice.toLocaleString('id-ID');

      /* ── Save to localStorage for Admin Dashboard ── */
      const bookingRecord = {
        id:         'BK-' + Date.now(),
        timestamp:  new Date().toISOString(),
        status:     'new',
        name:       _sanitize(name),
        phone:      _sanitize(phone),
        email:      _sanitize(email),
        date:       _sanitize(date),
        time:       _sanitize(time),
        message:    _sanitize(msg),
        treatments: _selectedTreatments.map(t => ({
          name:  _sanitize(t.name),
          dur:   _sanitize(t.dur),
          price: _sanitize(t.price),
        })),
        totalPrice:    totalPrice,
        totalFormatted: formattedTotal,
      };
      _saveBookingToStorage(bookingRecord);

      /* ── Send via WhatsApp (existing flow) ── */
      const isId = (typeof currentLang !== 'undefined' && currentLang === 'id');
      const text = isId
        ? `Halo CrideviSPA, saya ingin melakukan reservasi:\n\n*Daftar Treatment*:\n${treatmentLines}\n\n*Total Perkiraan*: ${formattedTotal}\n*Tanggal*: ${date}\n*Waktu*: ${time} WITA\n*Lokasi*: Denpasar (Home Service)\n\n*Nama*: ${name}\n*No. HP*: ${phone}\n${msg ? `*Alamat / Pesan Tambahan*: ${msg}` : ''}\n\nMohon konfirmasinya. Terima kasih!`
        : `Hello CrideviSPA, I'd like to book an appointment:\n\n*Treatments*:\n${treatmentLines}\n\n*Estimated Total*: ${formattedTotal}\n*Date*: ${date}\n*Time*: ${time}\n*Location*: Denpasar (Home Service)\n\n*Name*: ${name}\n*Phone*: ${phone}\n${msg ? `*Address / Notes*: ${msg}` : ''}\n\nPlease confirm. Thank you!`;

      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/6285812429650?text=${encoded}`, '_blank');

      /* ── Reset form ── */
      _selectedTreatments = [];
      bookingForm.reset();
      _renderBookingView();
    });
  }

  /* ── Pill Filters ───────────────── */
  function _setActivePill(barId, cat) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    bar.querySelectorAll('.t-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.tcat === cat);
      p.setAttribute('aria-selected', p.dataset.tcat === cat ? 'true' : 'false');
    });
  }

  const tpBar = document.getElementById('treatments-page-pill-bar');
  if (tpBar) {
    tpBar.addEventListener('click', (e) => {
      const pill = e.target.closest('.t-pill');
      if (!pill) return;
      const cat = pill.dataset.tcat || 'All';
      _setActivePill('treatments-page-pill-bar', cat);
      _renderTreatmentsPageView(cat);
    });
  }

  const locBar = document.getElementById('loc-pill-bar');
  if (locBar) {
    locBar.addEventListener('click', (e) => {
      const pill = e.target.closest('.t-pill');
      if (!pill) return;
      const cat = pill.dataset.tcat || 'All';
      _setActivePill('loc-pill-bar', cat);
      _renderLocTreatments(cat);
    });
  }

  /* ── Language Switcher Handler ────────── */
  document.addEventListener('click', (e) => {
    const langBtn = e.target.closest('.lang-btn');
    if (langBtn) {
      const lang = langBtn.dataset.lang;
      if (lang && typeof setLanguage === 'function') {
        setLanguage(lang);
        // Re-render all dynamic content in the new language
        _reRenderDynamic();
      }
      return;
    }

    // FAQ Accordion Handler
    const faqQ = e.target.closest('.faq-question');
    if (faqQ) {
      const item = faqQ.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    }
  });

  /* Re-render all JS-generated content in current language */
  function _reRenderDynamic() {
    // Re-render footer
    const waLink = typeof buildWaLink === 'function' ? buildWaLink('reservation') : '#';
    if (typeof renderFooters === 'function') renderFooters(waLink);

    // Re-render homepage price grid
    const hpGrid = document.getElementById('homepage-treatment-grid');
    if (hpGrid && typeof renderHomepageTreatmentsGrid === 'function') {
      renderHomepageTreatmentsGrid(hpGrid, waLink);
    }

    // Re-render treatments page list
    const tpList = document.getElementById('treatments-full-list');
    if (tpList && typeof renderTreatmentsPage === 'function') {
      const activePill = document.querySelector('#treatments-page-pill-bar .t-pill.active');
      const cat = activePill ? (activePill.dataset.tcat || 'All') : 'All';
      renderTreatmentsPage(tpList, cat, waLink);
    }

    // Re-render location treatments list
    const locList = document.getElementById('loc-treatment-list');
    if (locList) {
      const activeLocPill = document.querySelector('#loc-pill-bar .t-pill.active');
      const locCat = activeLocPill ? (activeLocPill.dataset.tcat || 'All') : 'All';
      _renderLocTreatments(locCat);
    }

    // Re-render booking view if open
    _renderBookingView();

    // Update "All" pill labels
    const isId = (typeof currentLang !== 'undefined' && currentLang === 'id');
    document.querySelectorAll('.t-pill[data-tcat="All"]').forEach(p => {
      p.textContent = isId ? 'Semua' : 'All';
    });
  }

  // Listen for language change events
  window.addEventListener('cridevispa_lang_change', () => {
    _reRenderDynamic();
  });

  // Listen for hashchange events
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#treatments' || hash === '#treatment') {
      _renderTreatmentsPageView('All');
      showView('treatments-page-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (hash === '#booking' || hash === '#book') {
      _renderBookingView();
      showView('booking-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (hash === '#location') {
      showView('location-detail-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (hash === '#home' || hash === '') {
      showView('home-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

});
