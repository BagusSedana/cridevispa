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
  const PIN_STORAGE_KEY    = 'cridevispa_admin_pin';
  const SESSION_AUTH_KEY   = 'cridevispa_admin_auth';
  const BOOKINGS_KEY       = 'cridevispa_bookings';
  const DEFAULT_PIN        = '1234';
  // Rate-limit: max 10 failed PIN attempts before 30s lockout
  const MAX_ATTEMPTS       = 10;
  const LOCKOUT_MS         = 30_000;

  let currentCategoryFilter = 'All';
  let currentSearchQuery    = '';
  let currentOrderFilter    = 'all';
  let currentOrderSearch    = '';
  let editingItemContext    = null;
  let _pinAttempts          = 0;
  let _lockoutUntil         = 0;

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

  /* ── Auth Helpers ────────────────────────────────────────────────────────── */
  function getAdminPin() {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  }

  function setAdminPin(newPin) {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
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
      authForm.addEventListener('submit', (e) => {
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

        if (enteredPin === getAdminPin()) {
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
      formChangePin.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPin  = document.getElementById('pin-old').value.trim();
        const newPin  = document.getElementById('pin-new').value.trim();
        const confPin = document.getElementById('pin-confirm').value.trim();

        if (oldPin !== getAdminPin()) {
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

        setAdminPin(newPin);
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
      document.getElementById('panel-menu').style.display   = which === 'menu'   ? '' : 'none';
      document.getElementById('panel-orders').style.display = which === 'orders' ? '' : 'none';

      if (which === 'orders') {
        renderOrdersList();
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
    const dur60 = document.getElementById('t-dur');
    const price = document.getElementById('t-price');
    if (item.dur60) {
      dur60.value  = '60';
      price.value  = item.dur60;
    } else if (item.price) {
      dur60.value  = item.dur_id || item.dur || '';
      price.value  = item.price;
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
        const cat   = document.getElementById('t-category').value;
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

        const newItem = {
          id:       editingItemContext
            ? (data[cat][editingItemContext.index]?.id || ('t_' + Date.now()))
            : ('t_' + Date.now()),
          name,
          desc_id:  desc,
          desc_en:  desc,
          icon:     editingItemContext ? (data[cat][editingItemContext.index]?.icon || 'leaf') : 'leaf',
          badge_id: badge || null,
          badge_en: badge || null,
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
          newItem.dur_en = dur || '90 min';
          delete newItem.dur60;
          delete newItem.dur90;
        } else {
          newItem.dur60 = priceFormatted;
          newItem.dur90 = null;
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
      const waLink  = waPhone
        ? `https://wa.me/${waPhone.startsWith('0') ? '62' + waPhone.slice(1) : waPhone}`
        : '#';

      // Action buttons based on status
      let actionBtns = '';
      if (booking.status === 'new') {
        actionBtns = `
          <a href="${esc(waLink)}" class="btn-order-wa" target="_blank" rel="noopener noreferrer" data-id="${esc(booking.id)}">
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
