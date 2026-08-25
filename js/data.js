/**
 * data.js — Treatment Price List CrideviSPA
 * ============================================================
 * Bilingual treatment catalog (ID / EN).
 * getAllTreatments() and getTreatmentsByCategory() respect
 * the active language via currentLang (set by i18n.js).
 * ============================================================
 */

const DEFAULT_TREATMENTS_DATA = Object.freeze({
  Massage: [
    {
      id: 'msg_1',
      name: 'Balinese Massage',
      desc_id: 'Teknik pijat tradisional Bali yang menggunakan tekanan ritmikal dan minyak aromaterapi untuk melemaskan otot dan menenangkan pikiran.',
      desc_en: 'Traditional Balinese massage using rhythmic pressure and aromatic oils to loosen muscles and calm the mind.',
      icon: 'leaf',
      dur60: 'Rp 250.000',
      dur90: 'Rp 350.000'
    },
    {
      id: 'msg_2',
      name: 'Four Hand Massage',
      desc_id: 'Dua terapis bekerja secara harmonis bersamaan untuk memberikan pengalaman relaksasi mendalam yang tak tertandingi.',
      desc_en: 'Two therapists work in perfect synchrony to deliver an unrivalled deep-relaxation experience.',
      icon: 'hands',
      dur60: 'Rp 450.000',
      dur90: 'Rp 600.000'
    },
    {
      id: 'msg_3',
      name: 'Aromatherapy Massage',
      desc_id: 'Pijat lembut menggunakan minyak esensial pilihan untuk menenangkan sistem saraf dan meningkatkan kesejahteraan emosional.',
      desc_en: 'Gentle massage with curated essential oils to calm the nervous system and elevate emotional well-being.',
      icon: 'flower',
      dur60: 'Rp 350.000',
      dur90: 'Rp 530.000'
    },
    {
      id: 'msg_4',
      name: 'Hot Stone Massage',
      desc_id: 'Batu basalt vulkanik yang dipanaskan ditempatkan pada titik energi utama, mencairkan ketegangan fisik dan stres kronis.',
      desc_en: 'Heated volcanic basalt stones are placed on key energy points, melting away physical tension and chronic stress.',
      icon: 'stones',
      dur60: 'Rp 350.000',
      dur90: 'Rp 530.000'
    },
    {
      id: 'msg_5',
      name: 'Deep Tissue Massage',
      desc_id: 'Tekanan dalam yang ditargetkan pada lapisan otot yang lebih dalam. Sempurna untuk pemulihan aktif dan melepaskan ketegangan struktural.',
      desc_en: 'Deep targeted pressure on deeper muscle layers. Perfect for active recovery and releasing structural tension.',
      icon: 'muscle',
      dur60: 'Rp 350.000',
      dur90: 'Rp 530.000'
    },
  ],

  Foot: [
    {
      id: 'foot_1',
      name: 'Foot Massage',
      desc_id: 'Terapi refleksologi yang memetakan titik tekanan pada kaki untuk merangsang kesehatan organ internal dan meningkatkan sirkulasi.',
      desc_en: 'Reflexology therapy mapping pressure points on the feet to stimulate internal organ health and improve circulation.',
      icon: 'foot',
      dur60: 'Rp 250.000',
      dur90: null
    },
  ],

  Facial: [
    {
      id: 'fac_1',
      name: 'Facial',
      desc_id: 'Perawatan kulit intensif menggunakan bahan-bahan botanikal organik untuk membersihkan, memperkenalkan dan mengencangkan kulit wajah.',
      desc_en: 'Intensive skincare treatment using organic botanical ingredients to cleanse, nourish and firm the skin.',
      icon: 'facial',
      dur60: 'Rp 250.000',
      dur90: null
    },
  ],

  Ear: [
    {
      id: 'ear_1',
      name: 'Ear Candle',
      desc_id: 'Perawatan termal menggunakan lilin lebah untuk mengeluarkan kotoran telinga secara lembut, meredakan tekanan sinus dan menenangkan pikiran.',
      desc_en: 'Thermal treatment using beeswax candles to gently draw out ear debris, relieve sinus pressure and calm the mind.',
      icon: 'candle',
      dur60: 'Rp 100.000',
      dur90: null
    },
  ],

  Body: [
    {
      id: 'body_1',
      name: 'Body Scrub & Body Mask',
      desc_id: 'Eksfoliasi kaya menggunakan rempah-rempah Bali pilihan, diikuti masker tubuh mineral untuk mengeluarkan racun dan menghaluskan tekstur kulit.',
      desc_en: 'Rich exfoliation using curated Balinese spices, followed by a mineral body mask to detoxify and smooth skin texture.',
      icon: 'body',
      dur60: 'Rp 270.000',
      dur90: null
    },
  ],

  Packages: [
    {
      id: 'pkg_1',
      name:    'Balinese Massage + Body Scrub + Body Mask',
      desc_id: 'Paket signature kami. Kombinasi Balinese Massage menenangkan dengan scrub rempah Bali dan masker tubuh mineral untuk mengangkat sel kulit mati serta menutrisi kulit secara mendalam.',
      desc_en: 'Our signature package. A soothing Balinese Massage combined with traditional Balinese spice scrub and mineral body mask to exfoliate and deeply nourish the skin.',
      icon:    'crown',
      dur_id:  '90 menit',
      dur_en:  '90 min',
      price:   'Rp 450.000',
      badge_id: 'Populer',
      badge_en: 'Popular',
    },
    {
      id: 'pkg_2',
      name:    'Balinese Massage + Body Scrub + Facial',
      desc_id: 'Paket wellness lengkap. Kombinasi sempurna pijat Bali, scrub tubuh rempah aromatik, dan perawatan facial untuk kesegaran total tubuh dan wajah.',
      desc_en: 'Complete wellness package. The perfect trio of Balinese massage, aromatic spice scrub, and refreshing facial treatment for total body and skin rejuvenation.',
      icon:    'crown',
      dur_id:  '120 menit',
      dur_en:  '120 min',
      price:   'Rp 600.000',
      badge_id: 'Terbaik',
      badge_en: 'Best Value',
    },
  ],
});

/* ─── Language helper ─────────────────────────────────────── */
function _dataLang() {
  return (typeof currentLang !== 'undefined' ? currentLang : 'en');
}

/* ─── Duration string helper ──────────────────────────────── */
function _durStr(minutes) {
  return _dataLang() === 'id' ? `${minutes} menit` : `${minutes} min`;
}

/* ─── Build a treatment row object ───────────────────────── */
function _makeRow(t, cat, durKey, priceKey) {
  const lang = _dataLang();
  return {
    id:       t.id,
    name:     t.name,
    desc:     lang === 'id' ? t.desc_id : t.desc_en,
    icon:     t.icon,
    category: cat,
    dur:      t[`dur_${lang}`] || t[durKey] || '',
    price:    t[priceKey]    || t.price || '',
    badge:    t[`badge_${lang}`] || t.badge || null,
  };
}

const STORAGE_KEY = 'cridevispa_treatments_data';

function getActiveTreatmentsData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('Could not read treatments from localStorage, using defaults.', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_TREATMENTS_DATA));
}

function saveTreatmentsData(newData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return true;
  } catch (e) {
    console.error('Failed to save treatments data to localStorage', e);
    return false;
  }
}

function resetTreatmentsData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to reset treatments data', e);
    return false;
  }
}

function getAllTreatments() {
  const data = getActiveTreatmentsData();
  const rows = [];
  const categoryOrder = ['Massage', 'Foot', 'Facial', 'Ear', 'Body'];

  for (const cat of categoryOrder) {
    const items = data[cat] || [];
    for (const t of items) {
      if (t.dur60 && t.dur90) {
        rows.push({ ...t, category: cat, dur: _durStr(60),  price: t.dur60, desc: _dataLang() === 'id' ? t.desc_id : t.desc_en });
        rows.push({ ...t, category: cat, dur: _durStr(90),  price: t.dur90, desc: _dataLang() === 'id' ? t.desc_id : t.desc_en });
      } else if (t.dur30) {
        rows.push({ ...t, category: cat, dur: _durStr(30),  price: t.dur30, desc: _dataLang() === 'id' ? t.desc_id : t.desc_en });
      } else if (t.dur60) {
        rows.push({ ...t, category: cat, dur: _durStr(60),  price: t.dur60, desc: _dataLang() === 'id' ? t.desc_id : t.desc_en });
      } else if (t.price && (t.dur_id || t.dur_en || t.dur)) {
        const lang = _dataLang();
        rows.push({
          ...t,
          category: cat,
          dur:   t[`dur_${lang}`] || t.dur || '',
          price: t.price,
          badge: t[`badge_${lang}`] || t.badge || null,
          desc:  lang === 'id' ? t.desc_id : t.desc_en,
        });
      }
    }
  }

  for (const t of (data.Packages || [])) {
    const lang = _dataLang();
    rows.push({
      ...t,
      category: 'Packages',
      dur:   t[`dur_${lang}`] || t.dur || '',
      price: t.price,
      badge: t[`badge_${lang}`] || t.badge || null,
      desc:  lang === 'id' ? t.desc_id : t.desc_en,
    });
  }

  return rows;
}

function getTreatmentsByCategory(cat) {
  if (cat === 'All') return getAllTreatments();

  const data = getActiveTreatmentsData();
  const items = data[cat];
  if (!items) return [];

  const lang = _dataLang();

  if (cat === 'Packages') {
    return items.map(t => ({
      ...t,
      category: 'Packages',
      dur:   t[`dur_${lang}`] || t.dur || '',
      price: t.price,
      badge: t[`badge_${lang}`] || t.badge || null,
      desc:  lang === 'id' ? t.desc_id : t.desc_en,
    }));
  }

  const rows = [];
  for (const t of items) {
    const desc = lang === 'id' ? t.desc_id : t.desc_en;
    if (t.dur30) rows.push({ ...t, category: cat, dur: _durStr(30), price: t.dur30, desc });
    if (t.dur60) rows.push({ ...t, category: cat, dur: _durStr(60), price: t.dur60, desc });
    if (t.dur90) rows.push({ ...t, category: cat, dur: _durStr(90), price: t.dur90, desc });
    if (t.price && (t.dur_id || t.dur_en)) {
      rows.push({
        ...t, category: cat,
        dur:   t[`dur_${lang}`] || t.dur || '',
        price: t.price,
        badge: t[`badge_${lang}`] || t.badge || null,
        desc,
      });
    }
  }
  return rows;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARTICLES & BLOG DATA SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */
const DEFAULT_ARTICLES_DATA = Object.freeze([
  {
    id: 'art_1',
    slug: 'manfaat-pijat-bali.html',
    title_id: '5 Manfaat Terbukti Pijat Tradisional Bali untuk Meredakan Stres',
    title_en: '5 Proven Benefits of Balinese Massage for Stress Relief',
    category: 'Wellness & Health',
    excerpt_id: 'Pijat tradisional Bali bukan sekadar relaksasi biasa. Ketahui bagaimana teknik akupresur dan aromaterapi menenangkan sistem saraf Anda.',
    excerpt_en: 'Traditional Balinese massage is far more than simple pampering. Learn how its unique acupressure and aromatherapy soothe your nervous system.',
    image: '../assets/massage_service.png',
    date: '2026-08-16',
    author: 'CrideviSPA Team',
    published: true,
  },
  {
    id: 'art_2',
    slug: 'manfaat-pijat-bali.html',
    title_id: 'Mengapa Facial Rutin Sangat Penting di Iklim Tropis Bali',
    title_en: 'Why Regular Facials are Essential in Bali\'s Tropical Climate',
    category: 'Skincare Guide',
    excerpt_id: 'Kelembapan pulau dan paparan sinar matahari memerlukan ritual perawatan kulit khusus. Simak bagaimana facial botanikal mengembalikan keseimbangan kulit.',
    excerpt_en: 'Island humidity and sun exposure require specialized organic skincare rituals. Here is how botanical facials restore your skin balance.',
    image: '../assets/facial_service.png',
    date: '2026-08-10',
    author: 'CrideviSPA Team',
    published: true,
  }
]);

const ARTICLES_STORAGE_KEY = 'cridevispa_articles_data';

function getActiveArticlesData() {
  try {
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read articles from localStorage, using defaults.', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_ARTICLES_DATA));
}

function saveArticlesData(newData) {
  try {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(newData));
    return true;
  } catch (e) {
    console.error('Failed to save articles to localStorage', e);
    return false;
  }
}

function resetArticlesData() {
  try {
    localStorage.removeItem(ARTICLES_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to reset articles', e);
    return false;
  }
}
