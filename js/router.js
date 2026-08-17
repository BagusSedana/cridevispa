/**
 * router.js — SPA View Router
 * =========================================
 * Handles switching between views with no
 * page reload. Exposes a single showView().
 * =========================================
 */

/** @type {string} */
let _currentView = 'home-view';

/** @type {string|null} */
let _previousView = null;

/** All valid view IDs in this SPA */
const VALID_VIEWS = new Set(['home-view', 'treatments-page-view', 'location-detail-view', 'booking-view']);

/**
 * Navigate to a view by ID.
 * @param {string} viewId
 */
function showView(viewId) {
  if (!VALID_VIEWS.has(viewId)) {
    console.warn('[Router] Unknown viewId:', viewId);
    return;
  }

  const target = document.getElementById(viewId);
  if (!target) {
    console.warn('[Router] DOM element not found for viewId:', viewId);
    return;
  }

  // Hide current
  const current = document.getElementById(_currentView);
  if (current && current !== target) {
    current.classList.remove('active');
  }

  // Show next
  _previousView = _currentView;
  _currentView  = viewId;
  target.classList.add('active');

  // Scroll to top (smooth only for non-home to avoid jarring effect)
  if (viewId === 'home-view') {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _updateHeaderStyle();
}

/** Keep header transparent on home hero, solid elsewhere */
function _updateHeaderStyle() {
  const header = document.getElementById('main-header');
  if (!header) return;
  if (_currentView === 'home-view' && window.scrollY < 40) {
    header.classList.remove('scrolled');
  } else {
    header.classList.add('scrolled');
  }
}

/** @returns {string} Current view ID */
function getCurrentView() {
  return _currentView;
}

/** @returns {string|null} Previous view ID */
function getPreviousView() {
  return _previousView;
}

// Expose header updater for scroll listener
window._updateHeaderStyle = _updateHeaderStyle;
