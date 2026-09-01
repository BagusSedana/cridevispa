/**
 * config.js — SPA Configuration
 * =============================================
 * Edit file ini untuk mengubah info spa.
 * JANGAN hardcode nomor WA / email di file lain!
 * =============================================
 */
const SPA_CONFIG = Object.freeze({
  name:      'CrideviSPA',
  tagline:   'Home Service Massage · Denpasar, Bali',
  slogan:    'Relax \u2022 Renew \u2022 Rejuvenate',

  // --- Branding ---
  brand: {
    colorGold:  '#C9A96E',
    colorDark:  '#1C1A16',
    colorCream: '#FAF7F0',
  },

  // --- Lokasi ---
  location: {
    area:    'Padangsambian Kelod',
    city:    'Denpasar Barat, Bali',
    country: 'Indonesia',
    full:    'Jl. Gunung Payung II No 26, Padangsambian Kelod, Denpasar Barat, Bali',
    mapsUrl: 'https://maps.google.com/?q=Jl+Gunung+Payung+II+No+26+Padangsambian+Kelod+Denpasar+Barat+Bali',
  },

  // --- Kontak (EDIT DI SINI) ---
  contact: {
    // Format: country code + nomor tanpa 0 di depan
    waNumber: '6285812429650',
    email:    'info@cridevispa.com',
    instagram:'https://instagram.com/cridevispa',
  },

  // --- Jam Buka ---
  hours: {
    open:        '07:00',
    close:       '23:00',
    lastBooking: '22:00',
    label:       'Open Daily 07:00\u201323:00',
  },

  // --- WA Message Templates ---
  waMessages: {
    reservation: 'Halo CrideviSPA, saya ingin reservasi home service massage.',
    priceList:   'Halo CrideviSPA, boleh minta info harga dan jadwal?',
  },
});

/**
 * Helpers — WA link builder
 * @param {'reservation'|'priceList'} msgKey
 */
function buildWaLink(msgKey) {
  const msg = SPA_CONFIG.waMessages[msgKey] || SPA_CONFIG.waMessages.reservation;
  return `https://wa.me/${SPA_CONFIG.contact.waNumber}?text=${encodeURIComponent(msg)}`;
}
