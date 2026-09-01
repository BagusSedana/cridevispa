/**
 * admin.js — Admin Dashboard Controller — CrideviSPA
 * ============================================================
 * Handles PIN Authentication, CRUD for Treatment menus,
 * Orders/Booking management, and Admin security.
 * ============================================================
 */

(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────────────────── */
  const PIN_STORAGE_KEY    = 'cridevispa_admin_pin'; // legacy key
  const PIN_HASH_KEY       = 'cridevispa_admin_pin_hash';
  const SESSION_AUTH_KEY   = 'cridevispa_admin_auth';
  const BOOKINGS_KEY       = 'cridevispa_bookings';
  const PIN_SALT           = '_cridevispa_sec_salt_2026_';

  // Rate-limit: max 10 failed PIN attempts before 30s lockout
  const MAX_ATTEMPTS       = 10;
  const LOCKOUT_MS         = 30_000;

  // WhatsApp business number for CrideviSPA (from centralized config)
  const WA_BUSINESS_NUMBER = (typeof SPA_CONFIG !== 'undefined' && SPA_CONFIG.contact && SPA_CONFIG.contact.waNumber)
    ? SPA_CONFIG.contact.waNumber
    : '6285812429650';
  const THEME_STORAGE_KEY  = 'cridevispa_admin_theme';

  let currentCategoryFilter  = 'All';
  let currentSearchQuery     = '';
  let currentOrderFilter     = 'all';
  let currentOrderSearch     = '';
  let currentOrderDateFilter = 'all';
  let currentArticleCategory = 'All';
  let currentArticleSearch   = '';
  let editingItemContext     = null;
  let editingArticleContext  = null;
  let _pinAttempts           = 0;
  let _lockoutUntil          = 0;
  let _lastKnownOrderCount   = -1;
  let _audioCtx              = null;

  /* ── HTML Escaper (security: prevents XSS when rendering stored data) ── */
  function esc(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /* ── Cryptographic Salted Hashing (SHA-256) ────────────────────────────── */
  async function hashPin(pin) {
    const raw = String(pin).trim() + PIN_SALT;
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function getAdminPinHash() {
    // Check if legacy plain-text PIN exists in localStorage, migrate it to hash
    const legacyPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (legacyPin) {
      const migratedHash = await hashPin(legacyPin);
      localStorage.setItem(PIN_HASH_KEY, migratedHash);
      localStorage.removeItem(PIN_STORAGE_KEY); // wipe plaintext
      return migratedHash;
    }

    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (storedHash) return storedHash;

    // Default PIN: '1234' -> generate initial salted hash
    const defaultHash = await hashPin('1234');
    localStorage.setItem(PIN_HASH_KEY, defaultHash);
    return defaultHash;
  }

  function setAdminPinHash(newHash) {
    localStorage.setItem(PIN_HASH_KEY, newHash);
    localStorage.removeItem(PIN_STORAGE_KEY); // ensure no plaintext remains
  }

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
  }

  function setAuthenticated(status) {
    if (status) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      _pinAttempts = 0;
    } else {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    }
  }

  /* ── Initialization ──────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAuth();
    initTabs();
    initToolbar();
    initModals();

    if (isAuthenticated()) {
      showDashboard();
    }
  });

  /* ── Authentication Flow ─────────────────────────────────────────────────── */
  function initAuth() {
    const authOverlay  = document.getElementById('auth-overlay');
    const authForm     = document.getElementById('auth-form');
    const pinInput     = document.getElementById('admin-pin-input');
    const authError    = document.getElementById('auth-error');
    const logoutBtn    = document.getElementById('btn-logout');
    const changePinBtn = document.getElementById('btn-change-pin-modal');

    if (authForm && pinInput) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Lockout check
        if (Date.now() < _lockoutUntil) {
          const secs = Math.ceil((_lockoutUntil - Date.now()) / 1000);
          authError.textContent = `Terlalu banyak percobaan. Tunggu ${secs} detik.`;
          return;
        }

        const enteredPin = pinInput.value.trim();
        // PIN must be digits only (security: reject anything non-numeric)
        if (!/^\d+$/.test(enteredPin)) {
          authError.textContent = 'PIN hanya boleh berisi angka.';
          pinInput.value = '';
          return;
        }

        const enteredHash = await hashPin(enteredPin);
        const correctHash = await getAdminPinHash();

        if (enteredHash === correctHash) {
          setAuthenticated(true);
          authError.textContent = '';
          pinInput.value = '';
          showDashboard();
          showToast('Login berhasil. Selamat datang, Admin!');
        } else {
          _pinAttempts++;
          if (_pinAttempts >= MAX_ATTEMPTS) {
            _lockoutUntil = Date.now() + LOCKOUT_MS;
            _pinAttempts  = 0;
            authError.textContent = 'Terlalu banyak percobaan. Akun dikunci 30 detik.';
          } else {
            authError.textContent = `PIN salah. Percobaan ${_pinAttempts}/${MAX_ATTEMPTS}.`;
          }
          pinInput.value = '';
          pinInput.focus();
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        setAuthenticated(false);
        if (authOverlay) authOverlay.classList.remove('hidden');
        showToast('Anda telah keluar dari dashboard.');
      });
    }

    if (changePinBtn) {
      changePinBtn.addEventListener('click', () => {
        openModal('modal-change-pin');
      });
    }

    const formChangePin = document.getElementById('form-change-pin');
    if (formChangePin) {
      formChangePin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPin  = document.getElementById('pin-old').value.trim();
        const newPin  = document.getElementById('pin-new').value.trim();
        const confPin = document.getElementById('pin-confirm').value.trim();

        const oldHash     = await hashPin(oldPin);
        const currentHash = await getAdminPinHash();

        if (oldHash !== currentHash) {
          alert('PIN lama tidak sesuai.');
          return;
        }
        if (!/^\d{4,8}$/.test(newPin)) {
          alert('PIN baru harus 4–8 digit angka saja.');
          return;
        }
        if (newPin !== confPin) {
          alert('Konfirmasi PIN baru tidak cocok.');
          return;
        }

        const newHash = await hashPin(newPin);
        setAdminPinHash(newHash);
        closeModal('modal-change-pin');
        formChangePin.reset();
        showToast('PIN Admin berhasil diperbarui!');
      });
    }
  }

  function showDashboard() {
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) authOverlay.classList.add('hidden');
    renderStats();
    renderTreatmentsList();
    updateOrdersBadge();
    updateArticlesBadge();
    initOrderWatcher();
    requestNotificationPermission();
  }

  /* ── Theme Switcher ───────────────────────────────────────────────────────── */
  function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    applyTheme(saved);

    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const next   = isDark ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_STORAGE_KEY, next);
        showToast(`Mode ${next === 'dark' ? 'Gelap' : 'Terang'} diaktifkan.`);
      });
    }
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const icon = document.getElementById('theme-icon');
      const text = document.getElementById('theme-text');
      if (icon) icon.textContent = '☀️';
      if (text) text.textContent = 'Light';
    } else {
      document.documentElement.removeAttribute('data-theme');
      const icon = document.getElementById('theme-icon');
      const text = document.getElementById('theme-text');
      if (icon) icon.textContent = '🌙';
      if (text) text.textContent = 'Dark';
    }
  }

  /* ── Tab Navigation ───────────────────────────────────────────────────────── */
  function initTabs() {
    const tabBar = document.getElementById('admin-tab-bar');
    if (!tabBar) return;

    tabBar.addEventListener('click', (e) => {
      const tab = e.target.closest('.admin-tab');
      if (!tab) return;

      tabBar.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const which = tab.dataset.tab;
      document.getElementById('panel-menu').style.display     = which === 'menu'     ? '' : 'none';
      document.getElementById('panel-orders').style.display   = which === 'orders'   ? '' : 'none';
      document.getElementById('panel-articles').style.display = which === 'articles' ? '' : 'none';

      if (which === 'orders') {
        renderOrdersList();
      } else if (which === 'articles') {
        renderArticlesList();
      }
    });
  }

  /* ── Stats Calculation ───────────────────────────────────────────────────── */
  function renderStats() {
    const data     = getActiveTreatmentsData();
    const catKeys  = Object.keys(data);
    let total      = 0;
    catKeys.forEach(cat => { total += (data[cat] || []).length; });

    const elTotal  = document.getElementById('stat-total-count');
    if (elTotal) elTotal.textContent = total;

    const elUpdate = document.getElementById('stat-last-update');
    if (elUpdate) {
      const ts = localStorage.getItem('cridevispa_treatments_updated');
      elUpdate.textContent = ts ? new Date(ts).toLocaleDateString('id-ID') : '—';
    }
  }

  /* ── Toolbar & Filter ────────────────────────────────────────────────────── */
  function initToolbar() {
    // Treatment pill filter
    const pillBar = document.getElementById('admin-pill-bar');
    if (pillBar) {
      pillBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.admin-pill');
        if (!pill) return;
        pillBar.querySelectorAll('.admin-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategoryFilter = pill.dataset.tcat || 'All';
        renderTreatmentsList();
      });
    }

    // Treatment search
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        renderTreatmentsList();
      });
    }

    // Add treatment button
    const btnAdd = document.getElementById('btn-open-add-modal');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        editingItemContext = null;
        document.getElementById('modal-treatment-title').textContent = 'Tambah Treatment Baru';
        document.getElementById('form-treatment').reset();
        document.getElementById('t-category').disabled = false;
        openModal('modal-treatment');
      });
    }

    // Reset default data
    const btnReset = document.getElementById('btn-reset-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('PERINGATAN: Reset seluruh menu & harga ke default pabrik? Semua perubahan kustom akan hilang.')) {
          resetTreatmentsData();
          renderStats();
          renderTreatmentsList();
          showToast('Data katalog telah direset ke default.');
        }
      });
    }

    // Order pill filter
    const orderPillBar = document.getElementById('order-pill-bar');
    if (orderPillBar) {
      orderPillBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.admin-pill');
        if (!pill) return;
        orderPillBar.querySelectorAll('.admin-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentOrderFilter = pill.dataset.ostatus || 'all';
        renderOrdersList();
      });
    }

    // Order search
    const orderSearch = document.getElementById('order-search-input');
    if (orderSearch) {
      orderSearch.addEventListener('input', (e) => {
        currentOrderSearch = e.target.value.toLowerCase().trim();
        renderOrdersList();
      });
    }

    // Order date range filter
    const orderDateBar = document.getElementById('order-date-bar');
    if (orderDateBar) {
      orderDateBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.admin-pill');
        if (!pill) return;
        orderDateBar.querySelectorAll('.admin-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentOrderDateFilter = pill.dataset.datefilter || 'all';
        renderOrdersList();
      });
    }

    // Clear all orders
    const btnClearOrders = document.getElementById('btn-clear-orders');
    if (btnClearOrders) {
      btnClearOrders.addEventListener('click', () => {
        if (confirm('Hapus SEMUA data pesanan? Tindakan ini tidak bisa dibatalkan.')) {
          localStorage.removeItem(BOOKINGS_KEY);
          renderOrdersList();
          updateOrdersBadge();
          showToast('Semua pesanan telah dihapus.');
        }
      });
    }

    // Export CSV
    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => exportOrdersCSV());
    }

    // Article search
    const artSearch = document.getElementById('article-search-input');
    if (artSearch) {
      artSearch.addEventListener('input', (e) => {
        currentArticleSearch = e.target.value.toLowerCase().trim();
        renderArticlesList();
      });
    }

    // Article pill category filter
    const artPillBar = document.getElementById('article-pill-bar');
    if (artPillBar) {
      artPillBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.admin-pill');
        if (!pill) return;
        artPillBar.querySelectorAll('.admin-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentArticleCategory = pill.dataset.acat || 'All';
        renderArticlesList();
      });
    }

    // Add article button
    const btnAddArt = document.getElementById('btn-open-add-article-modal');
    if (btnAddArt) {
      btnAddArt.addEventListener('click', () => {
        editingArticleContext = null;
        document.getElementById('modal-article-title').textContent = 'Tambah Artikel Baru';
        document.getElementById('form-article').reset();
        document.getElementById('art-date').value = new Date().toISOString().slice(0, 10);
        openModal('modal-article');
      });
    }
  }

  /* ── Render Treatments List ──────────────────────────────────────────────── */
  function renderTreatmentsList() {
    const container = document.getElementById('admin-treatments-list');
    if (!container) return;

    const data    = getActiveTreatmentsData();
    const frag    = document.createDocumentFragment();
    const catKeys = currentCategoryFilter === 'All' ? Object.keys(data) : [currentCategoryFilter];
    let foundAny  = false;

    catKeys.forEach(cat => {
      const items = data[cat] || [];
      items.forEach((t, index) => {
        if (currentSearchQuery) {
          const matchName = (t.name || '').toLowerCase().includes(currentSearchQuery);
          const matchDesc = (t.desc_id || t.desc || '').toLowerCase().includes(currentSearchQuery);
          if (!matchName && !matchDesc) return;
        }

        foundAny = true;
        const card = document.createElement('div');
        card.className = 'admin-item-card';

        const svgIcon = (typeof getTreatmentSvgIcon === 'function')
          ? getTreatmentSvgIcon(t.icon || 'leaf')
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20"/></svg>';

        const badgeHtml = (t.badge_id || t.badge)
          ? `<span class="item-badge-tag">${esc(t.badge_id || t.badge)}</span>`
          : '';

        let priceDisplay = '';
        if (t.dur60 || t.dur90) {
          priceDisplay = `
            ${t.dur60 ? `<span class="price-tag">60m: <strong>${esc(t.dur60)}</strong></span>` : ''}
            ${t.dur90 ? `<span class="price-tag">90m: <strong>${esc(t.dur90)}</strong></span>` : ''}
          `;
        } else if (t.price) {
          const durLabel = t.dur_id || t.dur || '';
          priceDisplay = `<span class="price-tag">${esc(durLabel)}: <strong>${esc(t.price)}</strong></span>`;
        }

        const descText = t.desc_id || t.desc_en || t.desc || 'Tidak ada deskripsi.';

        card.innerHTML = `
          <div class="item-left">
            <div class="item-icon-box" aria-hidden="true">${svgIcon}</div>
            <div class="item-details">
              <div class="item-name-row">
                <span class="item-name">${esc(t.name)}</span>
                <span class="item-cat-tag">${esc(cat)}</span>
                ${badgeHtml}
              </div>
              <p class="item-desc">${esc(descText)}</p>
            </div>
          </div>
          <div class="item-prices">
            ${priceDisplay}
          </div>
          <div class="item-actions">
            <button type="button" class="btn-action edit js-edit-item" data-cat="${esc(cat)}" data-index="${index}">Edit</button>
            <button type="button" class="btn-action delete js-delete-item" data-cat="${esc(cat)}" data-index="${index}" data-name="${esc(t.name)}">Hapus</button>
          </div>
        `;

        frag.appendChild(card);
      });
    });

    if (!foundAny) {
      container.innerHTML = `
        <div style="background:var(--admin-white);border:1px dashed var(--admin-border);border-radius:8px;padding:48px;text-align:center;color:var(--admin-text-mid);">
          <p style="font-size:15px;margin-bottom:8px;">Tidak ada menu treatment ditemukan.</p>
          <button type="button" class="btn-nav-action primary" id="btn-empty-add" style="margin-top:12px;">+ Tambah Menu Treatment</button>
        </div>
      `;
      document.getElementById('btn-empty-add')?.addEventListener('click', () => {
        document.getElementById('btn-open-add-modal')?.click();
      });
      return;
    }

    container.innerHTML = '';
    container.appendChild(frag);

    container.querySelectorAll('.js-edit-item').forEach(btn => {
      btn.addEventListener('click', () => openEditTreatment(btn.dataset.cat, parseInt(btn.dataset.index, 10)));
    });

    container.querySelectorAll('.js-delete-item').forEach(btn => {
      btn.addEventListener('click', () => confirmDeleteTreatment(btn.dataset.cat, parseInt(btn.dataset.index, 10), btn.dataset.name));
    });
  }

  /* ── Add & Edit Treatment ─────────────────────────────────────────────────── */
  function openEditTreatment(cat, index) {
    const data = getActiveTreatmentsData();
    const item = (data[cat] || [])[index];
    if (!item) return;

    editingItemContext = { category: cat, index };

    document.getElementById('modal-treatment-title').textContent = `Edit Treatment — ${item.name}`;

    const catSelect = document.getElementById('t-category');
    catSelect.value    = cat;
    catSelect.disabled = true;

    document.getElementById('t-name').value  = item.name || '';
    document.getElementById('t-desc').value  = item.desc_id || item.desc || '';
    document.getElementById('t-tag').value   = item.badge_id || item.badge || '';

    // Price / duration
    const durInput = document.getElementById('t-dur');
    const priceInput = document.getElementById('t-price');
    if (cat === 'Packages') {
      durInput.value   = item.dur_id || item.dur || '90 menit';
      priceInput.value = item.price || '';
    } else if (item.dur60) {
      durInput.value   = item.dur_id || item.dur || (item.dur90 ? '60 / 90 menit' : '60 menit');
      priceInput.value = item.dur60;
    } else if (item.price) {
      durInput.value   = item.dur_id || item.dur || '';
      priceInput.value = item.price;
    } else {
      durInput.value   = '60 menit';
      priceInput.value = '';
    }

    openModal('modal-treatment');
  }

  function confirmDeleteTreatment(cat, index, name) {
    if (confirm(`Apakah Anda yakin ingin menghapus treatment "${name}"?`)) {
      const data = getActiveTreatmentsData();
      if (data[cat]) {
        data[cat].splice(index, 1);
        saveTreatmentsData(data);
        renderStats();
        renderTreatmentsList();
        showToast(`Treatment "${name}" berhasil dihapus.`);
      }
    }
  }

  function initModals() {
    const formTreatment = document.getElementById('form-treatment');

    if (formTreatment) {
      formTreatment.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat   = editingItemContext ? editingItemContext.category : document.getElementById('t-category').value;
        const name  = document.getElementById('t-name').value.trim();
        const desc  = document.getElementById('t-desc').value.trim();
        const badge = document.getElementById('t-tag').value.trim();
        const price = document.getElementById('t-price').value.trim();
        const dur   = document.getElementById('t-dur').value.trim();

        if (!name || !price) {
          alert('Nama dan harga treatment wajib diisi.');
          return;
        }

        const data = getActiveTreatmentsData();
        if (!data[cat]) data[cat] = [];

        const priceFormatted = price.startsWith('Rp') ? price : `Rp ${price}`;
        const existingItem   = editingItemContext ? data[cat][editingItemContext.index] : null;

        const newItem = {
          id:       existingItem?.id || ('t_' + Date.now()),
          name,
          desc_id:  desc,
          desc_en:  existingItem?.desc_en || desc,
          icon:     existingItem?.icon || 'leaf',
          badge_id: badge || null,
          badge_en: existingItem?.badge_en || badge || null,
          dur60:    null,
          dur90:    null,
          price:    null,
          dur_id:   null,
          dur_en:   null,
        };

        // Massage/Perawatan uses dur60/dur90; Packages use fixed price+dur
        if (cat === 'Packages') {
          newItem.price  = priceFormatted;
          newItem.dur_id = dur || '90 menit';
          newItem.dur_en = dur.includes('min') ? dur : `${dur.replace(/[^0-9]/g, '')} min`;
          delete newItem.dur60;
          delete newItem.dur90;
        } else {
          newItem.dur60 = priceFormatted;
          newItem.dur90 = existingItem ? (existingItem.dur90 || null) : null;
          delete newItem.price;
          delete newItem.dur_id;
          delete newItem.dur_en;
        }

        if (editingItemContext) {
          data[editingItemContext.category][editingItemContext.index] = newItem;
          showToast(`Treatment "${name}" berhasil diperbarui.`);
        } else {
          data[cat].push(newItem);
          showToast(`Treatment "${name}" berhasil ditambahkan.`);
        }

        localStorage.setItem('cridevispa_treatments_updated', new Date().toISOString());
        saveTreatmentsData(data);
        closeModal('modal-treatment');
        formTreatment.reset();
        editingItemContext = null;
        renderStats();
        renderTreatmentsList();
      });
    }

    // Form Article handler
    const formArticle = document.getElementById('form-article');
    if (formArticle) {
      formArticle.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleId = document.getElementById('art-title-id').value.trim();
        const titleEn = document.getElementById('art-title-en').value.trim();
        const category = document.getElementById('art-category').value;
        const date = document.getElementById('art-date').value;
        const image = document.getElementById('art-image').value;
        const slug = document.getElementById('art-slug').value.trim() || 'manfaat-pijat-bali.html';
        const excerptId = document.getElementById('art-excerpt-id').value.trim();
        const excerptEn = document.getElementById('art-excerpt-en').value.trim();

        if (!titleId || !titleEn) {
          alert('Judul artikel wajib diisi dalam kedua bahasa.');
          return;
        }

        const articles = typeof getActiveArticlesData === 'function' ? getActiveArticlesData() : [];
        if (editingArticleContext) {
          const idx = articles.findIndex(a => a.id === editingArticleContext.id);
          if (idx !== -1) {
            articles[idx] = {
              ...articles[idx],
              title_id: titleId,
              title_en: titleEn,
              category,
              date,
              image,
              slug,
              excerpt_id: excerptId,
              excerpt_en: excerptEn,
            };
            showToast(`Artikel "${titleId}" berhasil diperbarui.`);
          }
        } else {
          articles.unshift({
            id: 'art_' + Date.now(),
            slug,
            title_id: titleId,
            title_en: titleEn,
            category,
            excerpt_id: excerptId,
            excerpt_en: excerptEn,
            image,
            date: date || new Date().toISOString().slice(0, 10),
            author: 'CrideviSPA Team',
            published: true,
          });
          showToast(`Artikel "${titleId}" berhasil ditambahkan.`);
        }

        if (typeof saveArticlesData === 'function') saveArticlesData(articles);
        closeModal('modal-article');
        formArticle.reset();
        editingArticleContext = null;
        renderArticlesList();
        updateArticlesBadge();
      });
    }

    // Modal close delegation
    document.querySelectorAll('.js-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.admin-modal');
        if (modal) modal.classList.add('hidden');
      });
    });
  }

  /* ── Orders Management ───────────────────────────────────────────────────── */
  function getBookings() {
    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveBookings(bookings) {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings:', e);
    }
  }

  function updateOrderStatus(bookingId, newStatus) {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return;
    bookings[idx].status = newStatus;
    saveBookings(bookings);
    renderOrdersList();
    updateOrdersBadge();
  }

  function deleteOrder(bookingId) {
    const bookings = getBookings().filter(b => b.id !== bookingId);
    saveBookings(bookings);
    renderOrdersList();
    updateOrdersBadge();
    showToast('Pesanan dihapus.');
  }

  function updateOrdersBadge() {
    const badge = document.getElementById('tab-orders-badge');
    if (!badge) return;
    const newCount = getBookings().filter(b => b.status === 'new').length;
    if (newCount > 0) {
      badge.textContent = newCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function renderOrdersList() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    const all     = getBookings();
    let filtered  = all;

    // Status filter
    if (currentOrderFilter !== 'all') {
      filtered = filtered.filter(b => b.status === currentOrderFilter);
    }

    // Date range filter
    if (currentOrderDateFilter !== 'all') {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      
      if (currentOrderDateFilter === 'today') {
        filtered = filtered.filter(b => {
          const bDate = b.date || (b.timestamp ? b.timestamp.slice(0, 10) : '');
          return bDate === todayStr;
        });
      } else if (currentOrderDateFilter === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        filtered = filtered.filter(b => {
          const t = new Date(b.timestamp || b.date);
          return t >= sevenDaysAgo;
        });
      } else if (currentOrderDateFilter === 'month') {
        const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        filtered = filtered.filter(b => {
          const bDate = b.date || (b.timestamp ? b.timestamp.slice(0, 10) : '');
          return bDate.startsWith(curMonth);
        });
      }
    }

    // Search filter
    if (currentOrderSearch) {
      filtered = filtered.filter(b =>
        (b.name  || '').toLowerCase().includes(currentOrderSearch) ||
        (b.phone || '').toLowerCase().includes(currentOrderSearch)
      );
    }

    // Update stats
    const elTotal     = document.getElementById('order-stat-total');
    const elNew       = document.getElementById('order-stat-new');
    const elConfirmed = document.getElementById('order-stat-confirmed');
    const elDone      = document.getElementById('order-stat-done');
    if (elTotal)     elTotal.textContent     = all.length;
    if (elNew)       elNew.textContent       = all.filter(b => b.status === 'new').length;
    if (elConfirmed) elConfirmed.textContent = all.filter(b => b.status === 'confirmed').length;
    if (elDone)      elDone.textContent      = all.filter(b => b.status === 'done').length;

    // Revenue stats
    const totalRevenue = all
      .filter(b => b.status === 'done')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const avgRevenue = all.filter(b => b.status === 'done').length > 0
      ? Math.round(totalRevenue / all.filter(b => b.status === 'done').length)
      : 0;

    const elRevenue = document.getElementById('order-stat-revenue');
    const elAvg     = document.getElementById('order-stat-avg');
    if (elRevenue) elRevenue.textContent = 'Rp ' + totalRevenue.toLocaleString('id-ID');
    if (elAvg)     elAvg.textContent     = 'Rp ' + avgRevenue.toLocaleString('id-ID');

    // Render mini revenue chart
    renderRevenueChart(all);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background:var(--admin-white);border:1px dashed var(--admin-border);border-radius:8px;padding:60px;text-align:center;color:var(--admin-text-mid);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;display:block;opacity:.4;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <p style="font-size:15px;font-weight:500;">${all.length === 0 ? 'Belum ada pesanan masuk.' : 'Tidak ada pesanan yang cocok dengan filter.'}</p>
          <p style="font-size:13px;margin-top:6px;opacity:.7;">Pesanan dari customer akan muncul di sini setelah mereka mengisi form booking.</p>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach(booking => {
      const card = document.createElement('div');
      card.className = 'order-card';

      const statusMap = {
        new:       { label: 'Baru',         cls: 'status-new' },
        confirmed: { label: 'Dikonfirmasi', cls: 'status-confirmed' },
        done:      { label: 'Selesai',      cls: 'status-done' },
      };
      const s = statusMap[booking.status] || statusMap.new;

      const treatmentRows = (booking.treatments || []).map(t =>
        `<div class="order-treatment-row"><span>${esc(t.name)}</span><span class="order-dur">${esc(t.dur)}</span><span class="order-price">${esc(t.price)}</span></div>`
      ).join('');

      const dateStr = booking.date
        ? new Date(booking.date + 'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
        : '—';

      const timeAgo = _timeAgo(booking.timestamp);
      const waPhone = (booking.phone || '').replace(/[^0-9]/g, '');
      const customerPhone = waPhone
        ? (waPhone.startsWith('0') ? '62' + waPhone.slice(1) : waPhone)
        : null;

      // Build WhatsApp confirmation template message
      const waMsg = _buildWaMessage(booking, dateStr);
      const waLinkCustomer = customerPhone
        ? `https://wa.me/${customerPhone}?text=${encodeURIComponent(waMsg)}`
        : '#';

      // Action buttons based on status
      let actionBtns = '';
      if (booking.status === 'new') {
        actionBtns = `
          <a href="${esc(waLinkCustomer)}" class="btn-order-wa" target="_blank" rel="noopener noreferrer" data-id="${esc(booking.id)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Konfirmasi via WA
          </a>
          <button type="button" class="btn-order-action js-confirm-order" data-id="${esc(booking.id)}">Tandai Dikonfirmasi</button>
          <button type="button" class="btn-order-delete js-delete-order" data-id="${esc(booking.id)}">Hapus</button>
        `;
      } else if (booking.status === 'confirmed') {
        actionBtns = `
          <button type="button" class="btn-order-action done js-done-order" data-id="${esc(booking.id)}">Tandai Selesai</button>
          <button type="button" class="btn-order-delete js-delete-order" data-id="${esc(booking.id)}">Hapus</button>
        `;
      } else {
        actionBtns = `
          <button type="button" class="btn-order-delete js-delete-order" data-id="${esc(booking.id)}">Hapus</button>
        `;
      }

      card.innerHTML = `
        <div class="order-card-header">
          <div class="order-card-meta">
            <span class="order-id">${esc(booking.id)}</span>
            <span class="order-time">${esc(timeAgo)}</span>
          </div>
          <span class="order-status-badge ${s.cls}">${s.label}</span>
        </div>
        <div class="order-card-body">
          <div class="order-customer">
            <div class="order-customer-name">${esc(booking.name || '—')}</div>
            <div class="order-customer-sub">
              📞 ${esc(booking.phone || '—')}
              ${booking.email ? ` &nbsp;·&nbsp; ✉️ ${esc(booking.email)}` : ''}
            </div>
          </div>
          <div class="order-schedule">
            <span>📅 ${dateStr}</span>
            <span>🕐 ${esc(booking.time || '—')} WITA</span>
          </div>
          <div class="order-treatments">
            ${treatmentRows}
          </div>
          ${booking.message ? `<div class="order-message">💬 ${esc(booking.message)}</div>` : ''}
        </div>
        <div class="order-card-footer">
          <div class="order-total">
            Total: <strong>${esc(booking.totalFormatted || ('Rp ' + (booking.totalPrice || 0).toLocaleString('id-ID')))}</strong>
          </div>
          <div class="order-actions">
            ${actionBtns}
          </div>
        </div>
      `;
      frag.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(frag);

    // Attach action listeners
    container.querySelectorAll('.js-confirm-order').forEach(btn => {
      btn.addEventListener('click', () => {
        updateOrderStatus(btn.dataset.id, 'confirmed');
        showToast('Pesanan ditandai sebagai Dikonfirmasi.');
      });
    });
    container.querySelectorAll('.js-done-order').forEach(btn => {
      btn.addEventListener('click', () => {
        updateOrderStatus(btn.dataset.id, 'done');
        showToast('Pesanan ditandai sebagai Selesai.');
      });
    });
    container.querySelectorAll('.js-delete-order').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Hapus pesanan ini?')) deleteOrder(btn.dataset.id);
      });
    });

    // Mark 'new' orders as seen after admin opens panel
    container.querySelectorAll('.js-confirm-order').forEach(btn => btn.dataset.seen = 'true');
  }

  /* ── Time Ago Helper ─────────────────────────────────────────────────────── */
  function _timeAgo(isoString) {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)    return 'Baru saja';
    if (mins < 60)   return `${mins} menit lalu`;
    if (hours < 24)  return `${hours} jam lalu`;
    return `${days} hari lalu`;
  }

  /* ── WhatsApp Message Builder ────────────────────────────────────────────── */
  function _buildWaMessage(booking, dateStr) {
    const treatments = (booking.treatments || []).map(t =>
      `  • ${t.name} (${t.dur}) — ${t.price}`
    ).join('\n');

    const total = booking.totalFormatted ||
      ('Rp ' + (booking.totalPrice || 0).toLocaleString('id-ID'));

    return [
      `Halo ${booking.name || 'Kak'} 👋`,
      ``,
      `Terima kasih telah memesan layanan *CrideviSPA*! 🌸`,
      ``,
      `Berikut detail pesanan Anda:`,
      `📅 Tanggal  : ${dateStr}`,
      `🕐 Waktu   : ${booking.time || '—'} WITA`,
      `📍 Lokasi  : ${booking.address || 'Sesuai kesepakatan'}`,
      ``,
      `🛎 Treatment:`,
      treatments,
      ``,
      `💰 Total   : *${total}*`,
      ``,
      `Pesanan Anda telah *dikonfirmasi* ✅`,
      `Terapis kami akan segera menghubungi Anda.`,
      ``,
      `Jika ada pertanyaan silakan balas pesan ini.`,
      ``,
      `Salam hangat,`,
      `*Tim CrideviSPA* 🌿`,
    ].join('\n');
  }

  /* ── Export Orders CSV ───────────────────────────────────────────────────── */
  function exportOrdersCSV() {
    const bookings = getBookings();
    if (bookings.length === 0) {
      showToast('Tidak ada data pesanan untuk diekspor.');
      return;
    }

    const statusLabel = { new: 'Baru', confirmed: 'Dikonfirmasi', done: 'Selesai' };

    const header = [
      'ID Pesanan', 'Status', 'Nama Customer', 'Telepon', 'Email',
      'Tanggal Layanan', 'Waktu', 'Treatment', 'Total (Rp)', 'Catatan', 'Waktu Booking'
    ];

    const rows = bookings.map(b => {
      const treatments = (b.treatments || []).map(t => `${t.name} (${t.dur})`).join(' | ');
      const dateStr = b.date
        ? new Date(b.date + 'T00:00:00').toLocaleDateString('id-ID')
        : '—';
      const bookingTime = b.timestamp
        ? new Date(b.timestamp).toLocaleString('id-ID')
        : '—';
      return [
        b.id || '',
        statusLabel[b.status] || b.status || '',
        b.name || '',
        b.phone || '',
        b.email || '',
        dateStr,
        b.time ? (b.time + ' WITA') : '—',
        treatments,
        b.totalPrice || 0,
        b.message || '',
        bookingTime
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const now  = new Date().toISOString().slice(0, 10);
    a.href     = url;
    a.download = `cridevispa_pesanan_${now}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${bookings.length} pesanan berhasil diekspor ke CSV.`);
  }

  /* ── Revenue Chart (Canvas-based mini bar chart) ─────────────────────────── */
  function renderRevenueChart(bookings) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;

    const done = bookings.filter(b => b.status === 'done' && b.timestamp);
    if (done.length === 0) {
      canvas.style.display = 'none';
      const noChart = document.getElementById('revenue-chart-empty');
      if (noChart) noChart.style.display = 'block';
      return;
    }
    canvas.style.display = 'block';
    const noChart = document.getElementById('revenue-chart-empty');
    if (noChart) noChart.style.display = 'none';

    // Aggregate revenue per month (last 6 months)
    const monthMap = {};
    done.forEach(b => {
      const d   = new Date(b.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + (b.totalPrice || 0);
    });

    // Build ordered last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      months.push({ key, label, value: monthMap[key] || 0 });
    }

    const maxVal = Math.max(...months.map(m => m.value), 1);
    const dpr    = window.devicePixelRatio || 1;
    const W      = canvas.offsetWidth  || 400;
    const H      = canvas.offsetHeight || 120;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const barCount   = months.length;
    const padX       = 8;
    const padBottom  = 30;
    const padTop     = 10;
    const availW     = W - padX * 2;
    const barW       = Math.floor(availW / barCount) - 6;
    const chartH     = H - padBottom - padTop;
    const gold       = '#B8965A';
    const goldLight  = 'rgba(184,150,90,0.18)';

    months.forEach((m, i) => {
      const x      = padX + i * (availW / barCount);
      const barH   = m.value > 0 ? Math.max(4, Math.round((m.value / maxVal) * chartH)) : 3;
      const y      = padTop + chartH - barH;

      // Background track
      ctx.fillStyle = goldLight;
      ctx.beginPath();
      ctx.roundRect(x, padTop, barW, chartH, [3, 3, 0, 0]);
      ctx.fill();

      // Bar
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, gold);
      grad.addColorStop(1, 'rgba(184,150,90,0.5)');
      ctx.fillStyle = m.value > 0 ? grad : goldLight;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle  = '#9A9088';
      ctx.font       = `500 10px Inter, sans-serif`;
      ctx.textAlign  = 'center';
      ctx.fillText(m.label, x + barW / 2, H - 8);
    });
  }

  /* ── Articles Management ─────────────────────────────────────────────────── */
  function updateArticlesBadge() {
    const badge = document.getElementById('tab-articles-badge');
    if (!badge) return;
    const articles = typeof getActiveArticlesData === 'function' ? getActiveArticlesData() : [];
    badge.textContent = articles.length;
  }

  function renderArticlesList() {
    const container = document.getElementById('admin-articles-list');
    if (!container) return;

    const articles = typeof getActiveArticlesData === 'function' ? getActiveArticlesData() : [];
    let filtered = articles;

    // Category filter
    if (currentArticleCategory !== 'All') {
      filtered = filtered.filter(a => a.category === currentArticleCategory);
    }

    // Search query
    if (currentArticleSearch) {
      filtered = filtered.filter(a =>
        (a.title_id || '').toLowerCase().includes(currentArticleSearch) ||
        (a.title_en || '').toLowerCase().includes(currentArticleSearch) ||
        (a.excerpt_id || '').toLowerCase().includes(currentArticleSearch)
      );
    }

    // Update stats
    const elCount = document.getElementById('stat-articles-count');
    const elPub   = document.getElementById('stat-articles-published');
    if (elCount) elCount.textContent = articles.length;
    if (elPub)   elPub.textContent   = `${articles.filter(a => a.published !== false).length} Publik`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background:var(--admin-white);border:1px dashed var(--admin-border);border-radius:8px;padding:50px;text-align:center;color:var(--admin-text-mid);grid-column:1/-1;">
          <p style="font-size:15px;margin-bottom:8px;">Tidak ada artikel ditemukan.</p>
          <button type="button" class="btn-nav-action primary" id="btn-empty-add-art" style="margin-top:12px;">+ Tambah Artikel</button>
        </div>
      `;
      document.getElementById('btn-empty-add-art')?.addEventListener('click', () => {
        document.getElementById('btn-open-add-article-modal')?.click();
      });
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach(art => {
      const card = document.createElement('div');
      card.className = 'admin-article-card';

      const dateFormatted = art.date
        ? new Date(art.date + 'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
        : '—';

      card.innerHTML = `
        <div class="art-thumb-wrap">
          <img src="${esc(art.image || '../assets/massage_service.png')}" alt="${esc(art.title_id)}" class="art-thumb-img">
          <span class="art-cat-badge">${esc(art.category || 'Article')}</span>
        </div>
        <div class="art-card-body">
          <div class="art-meta-row">
            <span class="art-date">📅 ${esc(dateFormatted)}</span>
            <span class="art-author">✍️ ${esc(art.author || 'CrideviSPA')}</span>
          </div>
          <h4 class="art-title">${esc(art.title_id || art.title_en)}</h4>
          <p class="art-excerpt">${esc(art.excerpt_id || art.excerpt_en || '')}</p>
        </div>
        <div class="art-card-footer">
          <a href="../artikel/${esc(art.slug || 'manfaat-pijat-bali.html')}" target="_blank" class="btn-action" style="text-decoration:none;font-size:12px;">
            Lihat ↗
          </a>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn-action edit js-edit-art" data-id="${esc(art.id)}">Edit</button>
            <button type="button" class="btn-action delete js-delete-art" data-id="${esc(art.id)}" data-title="${esc(art.title_id)}">Hapus</button>
          </div>
        </div>
      `;
      frag.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(frag);

    container.querySelectorAll('.js-edit-art').forEach(btn => {
      btn.addEventListener('click', () => openEditArticle(btn.dataset.id));
    });

    container.querySelectorAll('.js-delete-art').forEach(btn => {
      btn.addEventListener('click', () => confirmDeleteArticle(btn.dataset.id, btn.dataset.title));
    });
  }

  function openEditArticle(artId) {
    const articles = typeof getActiveArticlesData === 'function' ? getActiveArticlesData() : [];
    const art = articles.find(a => a.id === artId);
    if (!art) return;

    editingArticleContext = { id: artId };

    document.getElementById('modal-article-title').textContent = `Edit Artikel — ${art.title_id}`;
    document.getElementById('art-title-id').value   = art.title_id || '';
    document.getElementById('art-title-en').value   = art.title_en || '';
    document.getElementById('art-category').value   = art.category || 'Wellness & Health';
    document.getElementById('art-date').value       = art.date || '';
    document.getElementById('art-image').value      = art.image || '../assets/massage_service.png';
    document.getElementById('art-slug').value       = art.slug || 'manfaat-pijat-bali.html';
    document.getElementById('art-excerpt-id').value = art.excerpt_id || '';
    document.getElementById('art-excerpt-en').value = art.excerpt_en || '';

    openModal('modal-article');
  }

  function confirmDeleteArticle(artId, title) {
    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) {
      let articles = typeof getActiveArticlesData === 'function' ? getActiveArticlesData() : [];
      articles = articles.filter(a => a.id !== artId);
      if (typeof saveArticlesData === 'function') saveArticlesData(articles);
      renderArticlesList();
      updateArticlesBadge();
      showToast(`Artikel "${title}" berhasil dihapus.`);
    }
  }

  /* ── Audio Chime & Order Watcher ─────────────────────────────────────────── */
  function playNotificationChime() {
    try {
      if (!_audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) _audioCtx = new AudioContext();
      }
      if (!_audioCtx) return;

      if (_audioCtx.state === 'suspended') {
        _audioCtx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc  = _audioCtx.createOscillator();
        const gain = _audioCtx.createGain();

        const startTime = _audioCtx.currentTime + idx * 0.12;
        const stopTime  = startTime + 0.35;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

        osc.connect(gain);
        gain.connect(_audioCtx.destination);

        osc.start(startTime);
        osc.stop(stopTime);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function initOrderWatcher() {
    const current = getBookings().length;
    _lastKnownOrderCount = current;

    // Check periodically every 10 seconds for new customer orders
    setInterval(() => {
      const updated = getBookings();
      if (_lastKnownOrderCount >= 0 && updated.length > _lastKnownOrderCount) {
        const newOrdersCount = updated.length - _lastKnownOrderCount;
        playNotificationChime();
        showToast(`🔔 Ada ${newOrdersCount} pesanan baru masuk!`);

        // Browser push notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          const latest = updated[0];
          new Notification('CrideviSPA — Pesanan Baru!', {
            body: `${latest.name || 'Customer'} baru saja memesan: ${latest.totalFormatted || ''}`,
            icon: '../assets/cridevispa_logo.png'
          });
        }

        updateOrdersBadge();
        const panelOrders = document.getElementById('panel-orders');
        if (panelOrders && panelOrders.style.display !== 'none') {
          renderOrdersList();
        }
      }
      _lastKnownOrderCount = updated.length;
    }, 10000);

    // Also watch localStorage storage event from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === BOOKINGS_KEY) {
        const updated = getBookings();
        updateOrdersBadge();
        const panelOrders = document.getElementById('panel-orders');
        if (panelOrders && panelOrders.style.display !== 'none') {
          renderOrdersList();
        }
      }
    });
  }

  /* ── Modal Helpers ───────────────────────────────────────────────────────── */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  }

  /* ── Toast Notification ──────────────────────────────────────────────────── */
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    // Use textContent (not innerHTML) to prevent XSS in toast messages
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

})();

