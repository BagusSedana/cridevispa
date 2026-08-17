/**
 * admin.js — Admin Dashboard Controller — CrideviSPA
 * ============================================================
 * Handles PIN Authentication, CRUD operations for Treatment menus,
 * dynamic price setting, export/import JSON backups, and stats.
 * ============================================================
 */

(function () {
  'use strict';

  const PIN_STORAGE_KEY = 'cridevispa_admin_pin';
  const SESSION_AUTH_KEY = 'cridevispa_admin_auth';
  const DEFAULT_PIN = '1234';

  let currentCategoryFilter = 'All';
  let currentSearchQuery = '';
  let editingItemContext = null; // { category, index }

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
    } else {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    }
  }

  /* ── Initialization ──────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initToolbar();
    initModals();
    initBackupTools();
    
    if (isAuthenticated()) {
      showDashboard();
    }
  });

  /* ── Authentication Flow ─────────────────────────────────────────────────── */
  function initAuth() {
    const authOverlay = document.getElementById('auth-overlay');
    const authForm = document.getElementById('auth-form');
    const pinInput = document.getElementById('admin-pin-input');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('btn-logout');
    const changePinBtn = document.getElementById('btn-change-pin-modal');

    if (authForm && pinInput) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPin = pinInput.value.trim();
        const validPin = getAdminPin();

        if (enteredPin === validPin) {
          setAuthenticated(true);
          authError.textContent = '';
          pinInput.value = '';
          showDashboard();
          showToast('Login berhasil. Selamat datang, Admin!');
        } else {
          authError.textContent = 'PIN salah. Silakan coba lagi.';
          pinInput.value = '';
          pinInput.focus();
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        setAuthenticated(false);
        authOverlay.classList.remove('hidden');
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
        const oldPin = document.getElementById('pin-old').value.trim();
        const newPin = document.getElementById('pin-new').value.trim();
        const confPin = document.getElementById('pin-confirm').value.trim();

        if (oldPin !== getAdminPin()) {
          alert('PIN lama tidak sesuai.');
          return;
        }
        if (newPin.length < 4) {
          alert('PIN baru minimal harus 4 digit angka.');
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
  }

  /* ── Stats Calculation ───────────────────────────────────────────────────── */
  function renderStats() {
    const data = getActiveTreatmentsData();
    const categories = Object.keys(data);
    let totalItems = 0;

    categories.forEach(cat => {
      totalItems += (data[cat] || []).length;
    });

    const elTotal = document.getElementById('stat-total-treatments');
    const elCats = document.getElementById('stat-total-categories');
    
    if (elTotal) elTotal.textContent = totalItems;
    if (elCats) elCats.textContent = categories.length;
  }

  /* ── Toolbar & Filter Flow ───────────────────────────────────────────────── */
  function initToolbar() {
    const pillBar = document.getElementById('admin-pill-bar');
    if (pillBar) {
      pillBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.admin-pill');
        if (!pill) return;
        pillBar.querySelectorAll('.admin-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategoryFilter = pill.dataset.cat;
        renderTreatmentsList();
      });
    }

    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        renderTreatmentsList();
      });
    }

    const btnAdd = document.getElementById('btn-add-treatment');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        editingItemContext = null;
        document.getElementById('modal-treatment-title').textContent = 'Tambah Treatment Baru';
        document.getElementById('form-treatment').reset();
        document.getElementById('t-category').disabled = false;
        _toggleDurationInputs('Massage');
        openModal('modal-treatment');
      });
    }
  }

  /* ── Render List of Treatments ───────────────────────────────────────────── */
  function renderTreatmentsList() {
    const container = document.getElementById('admin-treatments-list');
    if (!container) return;

    const data = getActiveTreatmentsData();
    const frag = document.createDocumentFragment();

    const categoryKeys = currentCategoryFilter === 'All'
      ? Object.keys(data)
      : [currentCategoryFilter];

    let foundAny = false;

    categoryKeys.forEach(cat => {
      const items = data[cat] || [];
      items.forEach((t, index) => {
        // Search filter
        if (currentSearchQuery) {
          const matchName = (t.name || '').toLowerCase().includes(currentSearchQuery);
          const matchDesc = (t.desc || '').toLowerCase().includes(currentSearchQuery);
          if (!matchName && !matchDesc) return;
        }

        foundAny = true;
        const card = document.createElement('div');
        card.className = 'admin-item-card';

        const svgIcon = (typeof getTreatmentSvgIcon === 'function')
          ? getTreatmentSvgIcon(t.icon || 'leaf')
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20"/></svg>';

        const badgeHtml = t.badge
          ? `<span class="item-badge-tag">${esc(t.badge)}</span>`
          : '';

        let priceDisplay = '';
        if (t.dur60 || t.dur90) {
          priceDisplay = `
            ${t.dur60 ? `<span class="price-tag">60m: <strong>${esc(t.dur60)}</strong></span>` : ''}
            ${t.dur90 ? `<span class="price-tag">90m: <strong>${esc(t.dur90)}</strong></span>` : ''}
          `;
        } else if (t.price && t.dur) {
          priceDisplay = `<span class="price-tag">${esc(t.dur)}: <strong>${esc(t.price)}</strong></span>`;
        }

        card.innerHTML = `
          <div class="item-left">
            <div class="item-icon-box" aria-hidden="true">${svgIcon}</div>
            <div class="item-details">
              <div class="item-name-row">
                <span class="item-name">${esc(t.name)}</span>
                <span class="item-cat-tag">${esc(cat)}</span>
                ${badgeHtml}
              </div>
              <p class="item-desc">${esc(t.desc || 'Tidak ada deskripsi.')}</p>
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
        document.getElementById('btn-add-treatment')?.click();
      });
      return;
    }

    container.innerHTML = '';
    container.appendChild(frag);

    // Attach actions
    container.querySelectorAll('.js-edit-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        const idx = parseInt(btn.dataset.index, 10);
        openEditTreatment(cat, idx);
      });
    });

    container.querySelectorAll('.js-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        const idx = parseInt(btn.dataset.index, 10);
        const name = btn.dataset.name;
        confirmDeleteTreatment(cat, idx, name);
      });
    });
  }

  /* ── Add & Edit Treatment Flow ───────────────────────────────────────────── */
  function openEditTreatment(cat, index) {
    const data = getActiveTreatmentsData();
    const item = (data[cat] || [])[index];
    if (!item) return;

    editingItemContext = { category: cat, index: index };
    document.getElementById('modal-treatment-title').textContent = `Edit Treatment — ${item.name}`;

    const catSelect = document.getElementById('t-category');
    catSelect.value = cat;
    catSelect.disabled = true; // category locked during edit

    document.getElementById('t-name').value = item.name || '';
    document.getElementById('t-desc').value = item.desc || '';
    document.getElementById('t-icon').value = item.icon || 'leaf';
    document.getElementById('t-badge').value = item.badge || '';

    _toggleDurationInputs(cat);

    if (cat === 'Packages') {
      document.getElementById('t-custom-dur').value = item.dur || '90 menit';
      document.getElementById('t-custom-price').value = item.price || '';
    } else {
      document.getElementById('t-price-60').value = item.dur60 || '';
      document.getElementById('t-price-90').value = item.dur90 || '';
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
    const catSelect = document.getElementById('t-category');

    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        _toggleDurationInputs(e.target.value);
      });
    }

    if (formTreatment) {
      formTreatment.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('t-category').value;
        const name = document.getElementById('t-name').value.trim();
        const desc = document.getElementById('t-desc').value.trim();
        const icon = document.getElementById('t-icon').value;
        const badge = document.getElementById('t-badge').value.trim();

        if (!name) {
          alert('Nama treatment wajib diisi.');
          return;
        }

        const data = getActiveTreatmentsData();
        if (!data[cat]) data[cat] = [];

        let newItem = {
          id: editingItemContext ? (data[cat][editingItemContext.index].id || ('t_' + Date.now())) : ('t_' + Date.now()),
          name,
          desc,
          icon,
          badge: badge || null
        };

        if (cat === 'Packages') {
          const dur = document.getElementById('t-custom-dur').value.trim() || '90 menit';
          const price = document.getElementById('t-custom-price').value.trim();
          if (!price) {
            alert('Harga paket wajib diisi.');
            return;
          }
          newItem.dur = dur;
          newItem.price = price.startsWith('Rp') ? price : `Rp ${price}`;
        } else {
          const p60 = document.getElementById('t-price-60').value.trim();
          const p90 = document.getElementById('t-price-90').value.trim();

          if (!p60 && !p90) {
            alert('Silakan isi minimal salah satu harga durasi (60 menit / 90 menit).');
            return;
          }

          newItem.dur60 = p60 ? (p60.startsWith('Rp') ? p60 : `Rp ${p60}`) : null;
          newItem.dur90 = p90 ? (p90.startsWith('Rp') ? p90 : `Rp ${p90}`) : null;
        }

        if (editingItemContext) {
          data[editingItemContext.category][editingItemContext.index] = newItem;
          showToast(`Treatment "${name}" berhasil diperbarui.`);
        } else {
          data[cat].push(newItem);
          showToast(`Treatment "${name}" berhasil ditambahkan.`);
        }

        saveTreatmentsData(data);
        closeModal('modal-treatment');
        formTreatment.reset();
        editingItemContext = null;
        renderStats();
        renderTreatmentsList();
      });
    }

    // Modal Close delegation
    document.querySelectorAll('.js-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.admin-modal');
        if (modal) modal.classList.add('hidden');
      });
    });
  }

  function _toggleDurationInputs(cat) {
    const dualWrap = document.getElementById('wrap-dual-prices');
    const singleWrap = document.getElementById('wrap-single-price');

    if (cat === 'Packages') {
      if (dualWrap) dualWrap.style.display = 'none';
      if (singleWrap) singleWrap.style.display = 'grid';
    } else {
      if (dualWrap) dualWrap.style.display = 'grid';
      if (singleWrap) singleWrap.style.display = 'none';
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  }

  /* ── Backup, Export, Import & Reset Flow ──────────────────────────────────── */
  function initBackupTools() {
    const btnExport = document.getElementById('btn-export-json');
    const btnImport = document.getElementById('btn-import-json');
    const fileInput = document.getElementById('import-file-input');
    const btnReset = document.getElementById('btn-reset-default');

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const data = getActiveTreatmentsData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cridevispa_treatments_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('File backup data (.JSON) berhasil diunduh.');
      });
    }

    if (btnImport && fileInput) {
      btnImport.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (typeof parsed === 'object' && parsed.Massage) {
              saveTreatmentsData(parsed);
              renderStats();
              renderTreatmentsList();
              showToast('Data backup JSON berhasil diimpor!');
            } else {
              alert('Format file JSON tidak valid untuk katalog CrideviSPA.');
            }
          } catch (err) {
            alert('Gagal membaca file JSON: ' + err.message);
          }
          fileInput.value = '';
        };
        reader.readAsText(file);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh menu & harga kembali ke default pabrik? Semua perubahan kustom Anda akan diganti.')) {
          resetTreatmentsData();
          renderStats();
          renderTreatmentsList();
          showToast('Data katalog telah direset ke default.');
        }
      });
    }
  }

  /* ── Toast Notification Helper ────────────────────────────────────────────── */
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
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ── Security: HTML escaper ─────────────────────────────────────────────── */
  function esc(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

})();
