import type { Lang } from '@/lib/i18n'

/** All public-site copy. Ported from the legacy js/i18n.js; trust facts per phase-3 spec. "{min}" = starting price from the DB. */
const id = {
  nav: { home: 'Beranda', treatments: 'Treatment', location: 'Lokasi', articles: 'Artikel', book: 'Booking', menu: 'Menu', language: 'Bahasa' },
  hero: { book: 'Booking via WhatsApp' },
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
    empty: 'Daftar treatment sedang tidak tersedia. Silakan hubungi kami via WhatsApp.',
    pageTitle: 'Treatment & Harga',
    pageDesc: 'Menu lengkap pijat, refleksi, facial, body scrub dan paket CrideviSPA dengan harga transparan.',
  },
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
  /** Home page in the legacy (pre-Next.js) layout. Text from js/i18n.js; facts aligned with the trust/process copy above. */
  legacy: {
    book: 'Reservasi',
    waFloat: 'Reservasi via WhatsApp',
    hero: { eyebrow: 'Home Service Massage', eyebrowSub: 'Denpasar, Bali', title: 'Traditional Care,', titleEm: 'Modern Touch', book: 'Reservasi Sekarang', treatments: 'Lihat Treatment' },
    intro: { label: 'Tentang CrideviSPA', title: 'Pengalaman Spa Premium', titleEm: 'Langsung ke Lokasi Anda', body: 'Kami menghadirkan layanan massage profesional langsung ke rumah, hotel, atau villa Anda. Terapis bersertifikat kami menggabungkan teknik tradisional Bali dengan pendekatan modern untuk memberikan relaksasi mendalam yang memulihkan tubuh dan menenangkan pikiran.' },
    split: { label: 'Keunggulan Kami', title: 'Kenyamanan Spa', titleEm: 'Tanpa Meninggalkan Rumah', desc: 'Tidak perlu keluar rumah. Terapis kami hadir ke lokasi Anda lengkap dengan peralatan. Buka setiap hari pukul 07:00 hingga 23:00 untuk menyesuaikan rutinitas Anda.', btn: 'Lihat Menu Treatment' },
    trust: { label: 'Mengapa CrideviSPA', title: 'Standar Profesional', titleEm: 'Setiap Kunjungan', desc: 'Terapis bersertifikat, peralatan lengkap dibawa ke lokasi Anda, dan harga yang jelas sejak awal.' },
    featured: { label: 'Treatment', title: 'Pilihan Treatment', titleEm: 'Terpilih untuk Anda', seeAll: 'Semua Treatment', from: 'Mulai {price}', massage: 'Body Massage', care: 'Facial & Body Care', packages: 'Package Treatment', massageCat: 'Massage', careCat: 'Treatment', packagesCat: 'Paket' },
    banner: { pre: 'Home Service Massage', title: 'Relaksasi Premium', titleEm: 'di Kenyamanan Rumah Anda', sub: 'Kami membawa pengalaman spa langsung ke pintu Anda — di Denpasar dan sekitarnya.', btn: 'Reservasi Sekarang' },
    priceList: { label: 'Price List', title: 'Harga Jelas,', titleEm: 'Tanpa Biaya Tersembunyi', full: 'Lihat Price List Lengkap' },
    reviews: { label: 'Testimoni & Ulasan Tamu', title: 'Kata Mereka yang Telah Merasakan' },
    process: { label: 'Prosedur & Kemudahan', title: '4 Langkah Mudah', titleEm: 'Layanan Home Service Spa' },
    faq: { title: 'Hal yang Sering Ditanyakan', sub: 'Semua informasi penting sebelum sesi pertama Anda. Butuh bantuan? Hubungi kami via WhatsApp.' },
    cta: { label: 'Mulai Relaksasi Anda', title: 'Siap untuk Sesi', titleEm: 'Pemulihan Anda?', hours: 'Buka Setiap Hari · 07:00 – 23:00 · Denpasar & Sekitarnya', btn: 'Pilih Treatment & Reservasi' },
    footer: { nav: 'Halaman', home: 'Beranda', treatments: 'Treatment & Harga', location: 'Lokasi & Jam Buka', articles: 'Artikel & Blog', wa: 'Reservasi WhatsApp', contact: 'Kontak', desc: 'Layanan home service massage profesional langsung ke lokasi Anda di Denpasar dan sekitarnya.', hours: '07:00 – 23:00, setiap hari', rights: 'Hak cipta dilindungi.' },
    articlesMobile: 'Artikel & Blog',
    treatmentsPage: { title: 'Daftar Treatment', locLink: 'Lihat Detail Lokasi', ready: 'Siap memesan treatment Anda?', book: 'Lanjut ke Form Reservasi', bookAction: 'Reservasi' },
    locationPage: { back: '← Kembali ke Beranda', heading: 'Treatment & Harga', pick: 'Pilih Treatment', hoursLabel: 'Jam Operasional', hoursVal: '07:00 – 23:00, Setiap Hari', areaLabel: 'Area Layanan', areaVal: 'Denpasar & Sekitarnya', contactLabel: 'Kontak', note: 'Reservasi via WhatsApp dianjurkan untuk memastikan ketersediaan jadwal yang Anda inginkan.', hoursHeading: 'Jam Operasional', daily: 'Setiap Hari', last: 'Pemesanan Terakhir', mapHeading: 'Temukan Kami' },
  },
} as const

type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly Widen<U>[] : { [K in keyof T]: Widen<T[K]> }
export type Copy = Widen<typeof id>

const en: Copy = {
  nav: { home: 'Home', treatments: 'Treatments', location: 'Location', articles: 'Articles', book: 'Book', menu: 'Menu', language: 'Language' },
  hero: { book: 'Book via WhatsApp' },
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
    empty: 'The treatment menu is unavailable right now. Please contact us on WhatsApp.',
    pageTitle: 'Treatments & Prices',
    pageDesc: 'Full CrideviSPA menu of massages, reflexology, facials, body scrubs and packages with transparent prices.',
  },
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
  legacy: {
    book: 'Book Now',
    waFloat: 'Book via WhatsApp',
    hero: { eyebrow: 'Home Service Massage', eyebrowSub: 'Denpasar, Bali', title: 'Traditional Care,', titleEm: 'Modern Touch', book: 'Book Now', treatments: 'View Treatments' },
    intro: { label: 'About CrideviSPA', title: 'Premium Spa Experience', titleEm: 'Delivered to Your Location', body: 'We deliver professional massage services straight to your home, hotel, or villa. Our certified therapists blend traditional Balinese techniques with a modern approach to provide deep relaxation that restores your body and calms your mind.' },
    split: { label: 'Our Advantage', title: 'Spa Comfort', titleEm: 'Without Leaving Home', desc: 'No need to travel anywhere. Our therapists arrive at your door with everything needed. Open every day, 07:00 to 23:00, to suit your routine.', btn: 'View Treatments' },
    trust: { label: 'Why CrideviSPA', title: 'Professional Standard', titleEm: 'Every Single Visit', desc: 'Certified therapists, full equipment brought to your location, and clear prices from the start.' },
    featured: { label: 'Treatments', title: 'Featured Treatments', titleEm: 'Curated for You', seeAll: 'All Treatments', from: 'From {price}', massage: 'Body Massage', care: 'Facial & Body Care', packages: 'Package Treatment', massageCat: 'Massage', careCat: 'Treatment', packagesCat: 'Package' },
    banner: { pre: 'Home Service Massage', title: 'Premium Relaxation', titleEm: 'In the Comfort of Your Place', sub: 'We bring the spa experience straight to your door — in Denpasar and surrounding areas.', btn: 'Book Now' },
    priceList: { label: 'Price List', title: 'Clear Pricing,', titleEm: 'No Hidden Fees', full: 'View Full Price List' },
    reviews: { label: 'Testimonials & Guest Reviews', title: 'What Our Guests Say' },
    process: { label: 'How It Works', title: '4 Simple Steps', titleEm: 'Home Service Spa Experience' },
    faq: { title: 'Frequently Asked Questions', sub: 'Everything you need to know before your first session. Can’t find an answer? Reach us on WhatsApp.' },
    cta: { label: 'Begin Your Relaxation', title: 'Ready for Your', titleEm: 'Recovery Session?', hours: 'Open Daily · 07:00 – 23:00 · Denpasar & Surrounding Areas', btn: 'Choose Treatment & Book' },
    footer: { nav: 'Navigation', home: 'Home', treatments: 'Treatments & Pricing', location: 'Location & Hours', articles: 'Articles & Blog', wa: 'Book via WhatsApp', contact: 'Contact', desc: 'Professional home service massage delivered straight to your location in Denpasar and beyond.', hours: '07:00 – 23:00, daily', rights: 'All rights reserved.' },
    articlesMobile: 'Articles & Blog',
    treatmentsPage: { title: 'Treatments', locLink: 'View Location Details', ready: 'Ready to book your spa treatment?', book: 'Continue to Booking Form', bookAction: 'Book appointment' },
    locationPage: { back: '← Back to Home', heading: 'Treatments & Pricing', pick: 'Choose Treatment', hoursLabel: 'Operating Hours', hoursVal: '07:00 – 23:00, Daily', areaLabel: 'Service Area', areaVal: 'Denpasar & Surrounding Areas', contactLabel: 'Contact', note: 'Booking via WhatsApp is recommended to secure your preferred schedule.', hoursHeading: 'Operating Hours', daily: 'Every Day', last: 'Last Booking Order', mapHeading: 'Find Us' },
  },
}

export const COPY: Record<Lang, Copy> = { id, en }
export const t = (lang: Lang): Copy => COPY[lang]

/** Replace the "{min}" placeholder with a formatted price; drop it cleanly when unknown. */
export function withMin(text: string, min: string | null): string {
  return min ? text.replace('{min}', min) : text.replace(/\s*[·,]?\s*(mulai |from )?\{min\}/i, '').trim()
}
