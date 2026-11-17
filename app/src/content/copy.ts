import type { Lang } from '@/lib/i18n'

/** All public-site copy. Ported from the legacy js/i18n.js; trust facts per phase-3 spec. "{min}" = starting price from the DB. */
const id = {
  nav: { home: 'Beranda', treatments: 'Treatment', location: 'Lokasi', articles: 'Artikel', book: 'Booking', menu: 'Menu', language: 'Bahasa' },
  hero: {
    eyebrow: 'Home service spa · Denpasar, Bali',
    title: 'Spa villa terbaik,',
    titleEm: 'datang ke Anda',
    sub: 'Relax · Renew · Rejuvenate',
    price: 'Mulai {min} · harga transparan',
    book: 'Booking via WhatsApp',
    prices: 'Lihat harga',
  },
  trust: {
    label: 'Kenapa CrideviSPA',
    title: 'Standar profesional di setiap kunjungan',
    items: [
      { title: 'Terapis bersertifikat', desc: 'Terlatih secara intensif dan menjaga etika serta privasi Anda di setiap sesi.' },
      { title: 'Datang ke lokasi Anda', desc: 'Rumah, hotel, atau villa di Denpasar dan sekitarnya.' },
      { title: 'Peralatan dibawa terapis', desc: 'Matras portabel, handuk bersih, dan minyak aromaterapi — Anda cukup siapkan ruang.' },
      { title: 'Buka setiap hari', desc: '07:00–23:00, booking terakhir pukul 22:00.' },
      { title: 'Harga transparan', desc: 'Harga tertera adalah harga yang Anda bayar, mulai {min}.' },
      { title: 'Booking lewat WhatsApp', desc: 'Cukup chat dalam Bahasa Indonesia atau English.' },
    ],
  },
  treatments: {
    label: 'Treatment & Harga',
    title: 'Pilihan treatment untuk Anda',
    all: 'Semua',
    seeAll: 'Lihat semua treatment',
    pick: 'Pilih',
    more: '+{n} pilihan lainnya',
    empty: 'Daftar treatment sedang tidak tersedia. Silakan hubungi kami via WhatsApp.',
    pageTitle: 'Treatment & Harga',
    pageDesc: 'Menu lengkap pijat, refleksi, facial, body scrub dan paket CrideviSPA dengan harga transparan.',
  },
  reviews: { label: 'Ulasan Tamu', title: 'Kata mereka yang telah merasakan' },
  process: {
    label: 'Cara Booking',
    title: '4 langkah mudah',
    steps: [
      { title: 'Reservasi via WhatsApp', desc: 'Pilih treatment, lalu tentukan jam dan lokasi (rumah, hotel, atau villa).' },
      { title: 'Terapis datang', desc: 'Terapis bersertifikat hadir membawa peralatan spa, handuk bersih, dan minyak esensial.' },
      { title: 'Sesi pijat & relaksasi', desc: 'Nikmati pijatan profesional dengan aromaterapi di ruang pribadi Anda.' },
      { title: 'Bayar dengan mudah', desc: 'Tunai setelah sesi, atau transfer bank / QRIS. Tanpa biaya tersembunyi.' },
    ],
  },
  area: {
    label: 'Area Layanan',
    title: 'Denpasar & sekitarnya',
    desc: 'Kami melayani Denpasar, Seminyak, Canggu, Kuta, Sanur, Nusa Dua, Kerobokan, dan Ubud — langsung ke rumah, villa, maupun kamar hotel Anda.',
    hoursLabel: 'Jam Operasional',
    hours: '07:00 – 23:00, setiap hari',
    lastBooking: 'Booking terakhir 22:00',
    more: 'Lihat lokasi & kontak',
  },
  faq: {
    label: 'Pertanyaan Umum',
    title: 'Hal yang sering ditanyakan',
    items: [
      { q: 'Apakah saya perlu menyiapkan matras atau handuk sendiri?', a: 'Tidak perlu. Terapis CrideviSPA membawa seluruh kelengkapan sendiri, termasuk matras portabel, alas higienis sekali pakai, handuk bersih, dan minyak aromaterapi.' },
      { q: 'Area mana saja yang dijangkau CrideviSPA?', a: 'Seluruh Denpasar, Seminyak, Canggu, Kuta, Sanur, Nusa Dua, Kerobokan, dan Ubud. Terapis datang langsung ke rumah, villa, maupun kamar hotel Anda.' },
      { q: 'Berapa jam sebelumnya sebaiknya saya booking?', a: 'Disarankan 1–2 jam sebelumnya agar kami dapat menyiapkan terapis dan memperhitungkan waktu perjalanan ke lokasi Anda.' },
      { q: 'Bagaimana cara pembayarannya?', a: 'Tunai setelah sesi selesai, atau transfer bank / QRIS.' },
    ],
    ask: 'Tanya via WhatsApp',
  },
  articles: { label: 'Jurnal', title: 'Artikel terbaru', all: 'Semua artikel', pageTitle: 'Artikel Wellness', pageDesc: 'Tips pijat, perawatan kulit dan relaksasi dari CrideviSPA, Bali.', empty: 'Belum ada artikel.', back: 'Semua artikel', onlyOther: 'Artikel ini baru tersedia dalam bahasa Inggris.', ctaTitle: 'Rasakan langsung di villa Anda' },
  cta: { title: 'Siap untuk sesi relaksasi Anda?', desc: 'Hubungi kami dan kami jadwalkan sesi yang sesuai dengan waktu dan kebutuhan Anda.', book: 'Booking via WhatsApp', pick: 'Pilih treatment' },
  footer: { tagline: 'Home service massage · Denpasar, Bali', contact: 'Kontak', explore: 'Jelajahi', rights: 'Hak cipta dilindungi.' },
  booking: {
    title: 'Formulir Booking', desc: 'Pilih treatment, isi data Anda, lalu lanjutkan ke WhatsApp untuk konfirmasi.', selected: 'Treatment dipilih', total: 'Total perkiraan',
    name: 'Nama', phone: 'No. WhatsApp / HP', email: 'Email (opsional)', date: 'Tanggal', time: 'Jam (07:00–22:00 WITA)', message: 'Alamat lengkap / catatan',
    submit: 'Lanjut ke WhatsApp', sending: 'Memproses…', pickOne: 'Pilih minimal 1 treatment.', invalid: 'Mohon periksa kembali isian Anda.',
    note: 'Jam yang dipilih bersifat permintaan dan akan dikonfirmasi tim kami via WhatsApp.',
  },
  location: {
    title: 'Lokasi & Kontak', desc: 'Area layanan, jam operasional dan kontak CrideviSPA di Denpasar, Bali.', about: 'Tentang CrideviSPA',
    aboutBody: 'CrideviSPA adalah layanan home service massage profesional yang menghadirkan pengalaman spa premium langsung di rumah, hotel, atau villa Anda. Dengan terapis bersertifikat, kami menawarkan pijat tradisional Bali, aromaterapi, hot stone, four hand massage, facial, hingga body scrub.',
    address: 'Alamat', contact: 'Kontak', map: 'Buka di Google Maps',
  },
} as const

type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly Widen<U>[] : { [K in keyof T]: Widen<T[K]> }
export type Copy = Widen<typeof id>

const en: Copy = {
  nav: { home: 'Home', treatments: 'Treatments', location: 'Location', articles: 'Articles', book: 'Book', menu: 'Menu', language: 'Language' },
  hero: {
    eyebrow: 'Home service spa · Denpasar, Bali',
    title: 'Bali’s finest villa spa,',
    titleEm: 'brought to you',
    sub: 'Relax · Renew · Rejuvenate',
    price: 'From {min} · transparent pricing',
    book: 'Book via WhatsApp',
    prices: 'See prices',
  },
  trust: {
    label: 'Why CrideviSPA',
    title: 'Professional standards on every visit',
    items: [
      { title: 'Certified therapists', desc: 'Intensively trained, respecting your privacy and professional ethics in every session.' },
      { title: 'We come to you', desc: 'Your home, hotel or villa in Denpasar and surrounding areas.' },
      { title: 'Everything brought along', desc: 'Portable mattress, clean towels and aromatherapy oils — you just provide the space.' },
      { title: 'Open every day', desc: '07:00–23:00, last booking at 22:00.' },
      { title: 'Transparent prices', desc: 'The price you see is the price you pay, from {min}.' },
      { title: 'Book on WhatsApp', desc: 'Just chat with us in English or Bahasa Indonesia.' },
    ],
  },
  treatments: {
    label: 'Treatments & Prices',
    title: 'Treatments chosen for you',
    all: 'All',
    seeAll: 'See all treatments',
    pick: 'Select',
    more: '+{n} more options',
    empty: 'The treatment menu is unavailable right now. Please contact us on WhatsApp.',
    pageTitle: 'Treatments & Prices',
    pageDesc: 'Full CrideviSPA menu of massages, reflexology, facials, body scrubs and packages with transparent prices.',
  },
  reviews: { label: 'Guest Reviews', title: 'What our guests say' },
  process: {
    label: 'How to Book',
    title: '4 simple steps',
    steps: [
      { title: 'Reserve on WhatsApp', desc: 'Choose your treatment, then set the time and place (home, hotel or villa).' },
      { title: 'Your therapist arrives', desc: 'A certified therapist arrives with spa equipment, clean towels and essential oils.' },
      { title: 'Massage & relaxation', desc: 'Enjoy a professional massage with calming aromatherapy in your own private space.' },
      { title: 'Easy payment', desc: 'Cash after the session, or bank transfer / QRIS. No hidden fees.' },
    ],
  },
  area: {
    label: 'Service Area',
    title: 'Denpasar & surrounding areas',
    desc: 'We cover Denpasar, Seminyak, Canggu, Kuta, Sanur, Nusa Dua, Kerobokan and Ubud — directly to your home, villa or hotel room.',
    hoursLabel: 'Opening Hours',
    hours: '07:00 – 23:00, daily',
    lastBooking: 'Last booking 22:00',
    more: 'See location & contact',
  },
  faq: {
    label: 'FAQ',
    title: 'Frequently asked questions',
    items: [
      { q: 'Do I need to prepare a mattress or towels?', a: 'No need. CrideviSPA therapists bring everything: a portable mattress, single-use hygienic covers, clean towels and essential oils.' },
      { q: 'Which areas do you serve?', a: 'All of Denpasar, Seminyak, Canggu, Kuta, Sanur, Nusa Dua, Kerobokan and Ubud. Therapists come directly to your home, villa or hotel room.' },
      { q: 'How far in advance should I book?', a: 'We recommend 1–2 hours ahead so we can assign a therapist and allow for travel time to your location.' },
      { q: 'What payment methods are accepted?', a: 'Cash after the session, or bank transfer / QRIS.' },
    ],
    ask: 'Ask on WhatsApp',
  },
  articles: { label: 'Journal', title: 'Latest articles', all: 'All articles', pageTitle: 'Wellness Articles', pageDesc: 'Massage, skincare and relaxation tips from CrideviSPA, Bali.', empty: 'No articles yet.', back: 'All articles', onlyOther: 'This article is only available in Indonesian for now.', ctaTitle: 'Experience it at your villa' },
  cta: { title: 'Ready for your relaxation session?', desc: 'Contact us and we will schedule a session that fits your time and needs.', book: 'Book via WhatsApp', pick: 'Choose a treatment' },
  footer: { tagline: 'Home service massage · Denpasar, Bali', contact: 'Contact', explore: 'Explore', rights: 'All rights reserved.' },
  booking: {
    title: 'Booking Form', desc: 'Choose your treatments, fill in your details, then continue on WhatsApp to confirm.', selected: 'Selected treatments', total: 'Estimated total',
    name: 'Name', phone: 'Phone / WhatsApp', email: 'Email (optional)', date: 'Date', time: 'Time (07:00–22:00 WITA)', message: 'Full address / notes',
    submit: 'Continue on WhatsApp', sending: 'Sending…', pickOne: 'Please choose at least 1 treatment.', invalid: 'Please check your details.',
    note: 'Your selected time is a request and will be confirmed by our team on WhatsApp.',
  },
  location: {
    title: 'Location & Contact', desc: 'Service area, opening hours and contact details for CrideviSPA in Denpasar, Bali.', about: 'About CrideviSPA',
    aboutBody: 'CrideviSPA is a professional home service massage provider bringing a premium spa experience to your home, hotel room or private villa. With certified therapists, we offer traditional Balinese massage, aromatherapy, hot stone, four hand massage, facials and body scrubs.',
    address: 'Address', contact: 'Contact', map: 'Open in Google Maps',
  },
}

export const COPY: Record<Lang, Copy> = { id, en }
export const t = (lang: Lang): Copy => COPY[lang]

/** Replace the "{min}" placeholder with a formatted price; drop it cleanly when unknown. */
export function withMin(text: string, min: string | null): string {
  return min ? text.replace('{min}', min) : text.replace(/\s*[·,]?\s*(mulai |from )?\{min\}/i, '').trim()
}
