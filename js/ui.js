/**
 * ui.js — UI Render Functions — CrideviSPA
 * =========================================
 * Pure DOM-rendering functions. No state
 * management here. All user data is escaped
 * before insertion to prevent XSS.
 * =========================================
 */

/* ── Language helper (reads i18n currentLang) ────────────── */
function _uiLang() {
  return (typeof currentLang !== 'undefined' ? currentLang : 'en');
}
function _uiT(id, en) {
  return _uiLang() === 'id' ? id : en;
}


function esc(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/* ── SVG Line Icons Helper ────────────────────────────────────────────────── */
function getTreatmentSvgIcon(iconKey) {
  const icons = {
    // Leaf / Herbal
    leaf: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    '🌿': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    
    // Hands / Palm
    hands: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
    '🤲': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,

    // Flower / Lotus
    flower: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6"/><path d="M12 16a5 5 0 0 0 5-5c0-4-5-8-5-8s-5 4-5 8a5 5 0 0 0 5 5Z"/><path d="M7.5 13.5C5 13 2 11 2 8c3 0 5.5 1.5 6.5 3.5"/><path d="M16.5 13.5C19 13 22 11 22 8c-3 0-5.5 1.5-6.5 3.5"/></svg>`,
    '🌸': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6"/><path d="M12 16a5 5 0 0 0 5-5c0-4-5-8-5-8s-5 4-5 8a5 5 0 0 0 5 5Z"/><path d="M7.5 13.5C5 13 2 11 2 8c3 0 5.5 1.5 6.5 3.5"/><path d="M16.5 13.5C19 13 22 11 22 8c-3 0-5.5 1.5-6.5 3.5"/></svg>`,

    // Stones
    stones: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="18" rx="8" ry="4"/><ellipse cx="12" cy="12" rx="6" ry="3"/><ellipse cx="12" cy="7" rx="4" ry="2"/></svg>`,
    '🪨': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="18" rx="8" ry="4"/><ellipse cx="12" cy="12" rx="6" ry="3"/><ellipse cx="12" cy="7" rx="4" ry="2"/></svg>`,

    // Deep Tissue / Vitality
    muscle: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    '💪': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,

    // Foot Reflexology
    foot: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 5.5 9 8 9c1.8 0 3 .8 4 2 1-1.2 2.2-2 4-2 2.5 0 4 2.5 4 4.62V16c0 3.31-2.69 6-6 6h-4c-3.31 0-6-2.69-6-6Z"/><circle cx="12" cy="5" r="2"/></svg>`,
    '🦶': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 5.5 9 8 9c1.8 0 3 .8 4 2 1-1.2 2.2-2 4-2 2.5 0 4 2.5 4 4.62V16c0 3.31-2.69 6-6 6h-4c-3.31 0-6-2.69-6-6Z"/><circle cx="12" cy="5" r="2"/></svg>`,

    // Facial / Glow
    facial: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
    '✨': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,

    // Candle / Ear Candle
    candle: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6v-8H9v8Z"/><path d="M12 13V9"/><path d="M12 9c-1.5-1-1.5-3 0-4.5 1.5 1.5 1.5 3.5 0 4.5Z"/></svg>`,
    '🕯️': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6v-8H9v8Z"/><path d="M12 13V9"/><path d="M12 9c-1.5-1-1.5-3 0-4.5 1.5 1.5 1.5 3.5 0 4.5Z"/></svg>`,

    // Body Scrub / Droplet
    body: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    '🧖': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,

    // Crown / Luxury Package
    crown: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M4 14l3-7 5 5 5-5 3 7H4Z"/></svg>`,
    '👑': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M4 14l3-7 5 5 5-5 3 7H4Z"/></svg>`,
    '🌺': `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M4 14l3-7 5 5 5-5 3 7H4Z"/></svg>`
  };

  return icons[iconKey] || icons.leaf;
}

/* ── Treatment Row Renderer (new card style) ────────────────────────────── */
function renderTreatmentRows(container, items, waLink) {
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="no-result" style="padding:40px;text-align:center;color:var(--text-muted);">Tidak ada treatment di kategori ini.</p>';
    return;
  }

  const frag = document.createDocumentFragment();

  items.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'treatment-row';
    row.setAttribute('role', 'listitem');
    row.style.animationDelay = `${i * 0.06}s`;

    const badge = t.badge
      ? `<span class="t-row-badge">${esc(t.badge)}</span>`
      : '';

    const tData = esc(JSON.stringify({
      name: t.name,
      desc: t.desc,
      price: t.price,
      dur: t.dur,
      icon: t.icon || 'leaf'
    }));

    const svgIcon = getTreatmentSvgIcon(t.icon || 'leaf');

    row.innerHTML = `
      <div class="t-row-icon-box" aria-hidden="true">${svgIcon}</div>
      <div class="t-row-body">
        <div class="t-row-head">
          <span class="t-row-name">${esc(t.name)}</span>
          <span style="color:var(--text-light);">&ndash;</span>
          <button class="t-row-more js-open-treatment-info" data-t="${tData}">More info</button>
        </div>
        <div class="t-row-meta">
          ${esc(t.dur)} &nbsp;&middot;&nbsp; <strong>${esc(t.price)}</strong>
        </div>
      </div>
      <div class="t-row-right">
        ${badge}
        <button class="btn-book-action js-open-treatment-info" data-t="${tData}">Book appointment</button>
      </div>`;

    frag.appendChild(row);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

/* ── Homepage Price List Grid Renderer ──────────────────────────────────── */
function renderHomepageTreatmentsGrid(container, waLink) {
  if (!container) return;

  const items = getTreatmentsByCategory('All');
  if (!items || items.length === 0) return;

  // Deduplicate by name (show unique treatments only)
  const uniqueItems = [];
  const seenNames = new Set();
  for (const item of items) {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      uniqueItems.push(item);
    }
  }

  const frag = document.createDocumentFragment();

  for (const t of uniqueItems) {
    const item = document.createElement('div');
    item.className = 'home-treat-item';

    item.innerHTML = `
      <div class="home-treat-left">
        <div class="home-treat-name">${esc(t.name)}</div>
        <div class="home-treat-dur">${esc(t.dur)}</div>
      </div>
      <span class="home-treat-price">${esc(t.price)}</span>`;

    frag.appendChild(item);
  }

  container.innerHTML = '';
  container.appendChild(frag);
}

/* ── Full Treatment Page Renderer ────────────────────────────────────────── */
function renderTreatmentsPage(container, activeCategory, waLink) {
  if (!container) return;

  const items = getTreatmentsByCategory(activeCategory);

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="no-result" style="padding:40px;text-align:center;color:var(--text-muted);">Tidak ada treatment di kategori ini.</p>';
    return;
  }

  if (activeCategory === 'All') {
    _renderGrouped(container, waLink);
  } else {
    renderTreatmentRows(container, items, waLink);
  }
}

/** @private */
function _renderGrouped(container, waLink) {
  const frag = document.createDocumentFragment();
  const categoryLabels = {
    Massage:  'Massage',
    Foot:     'Foot Massage',
    Facial:   'Facial',
    Ear:      'Ear Candle',
    Body:     'Body Scrub & Body Mask',
    Packages: 'Package Treatment',
  };

  let totalIndex = 0;
  for (const [cat, label] of Object.entries(categoryLabels)) {
    const items = getTreatmentsByCategory(cat);
    if (!items || items.length === 0) continue;

    const heading = document.createElement('p');
    heading.className = 'treatment-group-label';
    heading.textContent = label.toUpperCase();
    frag.appendChild(heading);

    const innerFrag = document.createDocumentFragment();
    items.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'treatment-row';
      row.setAttribute('role', 'listitem');
      row.style.animationDelay = `${(totalIndex + i) * 0.05}s`;

      const badge = t.badge
        ? `<span class="t-row-badge">${esc(t.badge)}</span>`
        : '';

      const tData = esc(JSON.stringify({
        name: t.name,
        desc: t.desc,
        price: t.price,
        dur: t.dur,
        icon: t.icon || 'leaf'
      }));

      const svgIcon = getTreatmentSvgIcon(t.icon || 'leaf');

      row.innerHTML = `
        <div class="t-row-icon-box" aria-hidden="true">${svgIcon}</div>
        <div class="t-row-body">
          <div class="t-row-head">
            <span class="t-row-name">${esc(t.name)}</span>
            <span style="color:var(--text-light);">&ndash;</span>
            <button class="t-row-more js-open-treatment-info" data-t="${tData}">More info</button>
          </div>
          <div class="t-row-meta">
            ${esc(t.dur)} &nbsp;&middot;&nbsp; <strong>${esc(t.price)}</strong>
          </div>
        </div>
        <div class="t-row-right">
          ${badge}
          <button class="btn-book-action js-open-treatment-info" data-t="${tData}">Book appointment</button>
        </div>`;

      innerFrag.appendChild(row);
      totalIndex++;
    });
    frag.appendChild(innerFrag);
  }

  container.innerHTML = '';
  container.appendChild(frag);
}

/* ── Footer Renderer ─────────────────────────────────────────────────────── */
function renderFooters(waLink) {
  const html = _buildFooterHTML(waLink);
  document.querySelectorAll('.js-footer').forEach(el => {
    el.innerHTML = html;
  });
}

/** @private */
function _buildFooterHTML(waLink) {
  const c = SPA_CONFIG;
  const safeWa    = esc(waLink);
  const safeIg    = esc(c.contact.instagram);
  const safeName  = esc(c.name);
  const safeHours = esc(c.hours.label);
  const safeLoc   = esc(c.location.full);
  const safePhone = esc('+62 858-1242-9650');
  const isId = _uiLang() === 'id';

  const navLabel   = isId ? 'Halaman'      : 'Navigation';
  const homeLabel  = isId ? 'Beranda'      : 'Home';
  const treatLabel = isId ? 'Treatment & Harga' : 'Treatments & Pricing';
  const locLabel   = isId ? 'Lokasi & Jam Buka' : 'Location & Hours';
  const artLabel   = isId ? 'Artikel & Blog'    : 'Articles & Blog';
  const waLabel    = isId ? 'Reservasi WhatsApp' : 'Book via WhatsApp';
  const contLabel  = isId ? 'Kontak'       : 'Contact';
  const descLabel  = isId
    ? 'Layanan home service massage profesional langsung ke lokasi Anda di Denpasar dan sekitarnya.'
    : 'Professional home service massage delivered straight to your location in Denpasar and beyond.';

  return `
<div class="footer-inner">
  <div class="footer-brand">
    <img src="assets/cridevispa_logo.png" alt="CrideviSPA" class="footer-logo">
    <p class="footer-brand-tagline">Relax &middot; Renew &middot; Rejuvenate</p>
    <p class="footer-brand-desc">${descLabel}</p>
  </div>
  <div>
    <p class="footer-col-title">${navLabel}</p>
    <div class="footer-links">
      <a href="index.html" class="footer-link js-nav" data-view="home">${homeLabel}</a>
      <a href="index.html" class="footer-link js-nav" data-view="treatments-page">${treatLabel}</a>
      <a href="index.html" class="footer-link js-nav" data-view="location-detail">${locLabel}</a>
      <a href="artikel/" class="footer-link">${artLabel}</a>
      <a href="${safeWa}" class="footer-link" target="_blank" rel="noopener noreferrer">${waLabel}</a>
    </div>
  </div>
  <div>
    <p class="footer-col-title">${contLabel}</p>
    <p class="footer-contact-item">${safePhone}</p>
    <p class="footer-contact-item">${safeLoc}</p>
    <p class="footer-contact-item">${safeHours}</p>
    <p class="footer-contact-item"><a href="${safeIg}" target="_blank" rel="noopener noreferrer" style="color:inherit;border-bottom:1px solid rgba(255,255,255,0.15);">@cridevispa</a></p>
  </div>
</div>
<div class="footer-divider"></div>
<div class="footer-bottom">
  <span class="footer-copy">&copy; ${new Date().getFullYear()} ${safeName}. All rights reserved.</span>
  <span class="footer-slogan">Relax &middot; Renew &middot; Rejuvenate</span>
</div>`;
}

/* ── WA Link Hydrator ────────────────────────────────────────────────────── */
function hydrateWaLinks(waLink) {
  document.querySelectorAll('.js-wa-link').forEach(el => {
    el.setAttribute('href', waLink);
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

/* ── Modal Content Renderer ─────────────────────────────────────────────── */
function renderModalContent(container, tDataStr) {
  if (!container) return;
  try {
    const data = JSON.parse(tDataStr);
    const svgIcon = getTreatmentSvgIcon(data.icon || 'leaf');
    const defaultDesc = _uiT(
      'Layanan massage profesional menggunakan minyak esensial pilihan dan teknik terapis bersertifikat untuk relaksasi maksimal.',
      'Professional massage service using curated essential oils and certified therapist techniques for maximum relaxation.'
    );
    const bookLabel = _uiT('Pesan Sekarang', 'Book Appointment');
    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <div class="t-row-icon-box" style="width:36px; height:36px; background:rgba(201,169,110,0.12); color:var(--gold);" aria-hidden="true">${svgIcon}</div>
        <h3 class="m-title" style="margin-bottom:0;">${esc(data.name)}</h3>
      </div>
      <p class="m-desc">${esc(data.desc || defaultDesc)}</p>
      <div class="m-price-box">
        <span>${esc(data.dur)}</span>
        <span>${esc(data.price)}</span>
      </div>
      <button class="m-book-btn js-modal-confirm-book" data-t="${esc(tDataStr)}">${bookLabel} &rarr;</button>
    `;
  } catch (e) {
    console.error('Failed to parse modal data', e);
  }
}


