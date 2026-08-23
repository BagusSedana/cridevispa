/**
 * i18n.js — Multilingual Translation System (ID | EN)
 * ====================================================
 * Default language: EN
 * Persisted via localStorage.
 * ====================================================
 */

const TRANSLATIONS = {
  id: {
    // Header & Navigation
    nav_home: "Beranda",
    nav_treatments: "Treatment",
    nav_location: "Lokasi",
    nav_articles: "Artikel",
    nav_book: "Reservasi",
    nav_mobile_articles: "Artikel &amp; Blog",
    nav_mobile_wa: "Reservasi via WhatsApp",

    // Hero Section
    hero_eyebrow: "Home Service Massage<br><span class=\"hero-eyebrow-sub\">Denpasar, Bali</span>",
    hero_title: "Traditional Care,<br><em>Modern Touch</em>",
    hero_sub: "Relax &nbsp;·&nbsp; Renew &nbsp;·&nbsp; Rejuvenate",
    hero_book: "Reservasi Sekarang",
    hero_treatments: "Lihat Treatment",
    hero_scroll: "Scroll",

    // Intro Section
    intro_label: "Tentang CrideviSPA",
    intro_title: "Pengalaman Spa Premium<br><em>Langsung ke Lokasi Anda</em>",
    intro_body: "Kami menghadirkan layanan massage profesional berkualitas tinggi langsung ke rumah, hotel, atau villa Anda. Terapis bersertifikat kami menggabungkan teknik tradisional Bali dengan pendekatan modern untuk memberikan relaksasi mendalam yang memulihkan tubuh dan menenangkan pikiran.",

    // Split Section
    split_label: "Keunggulan Kami",
    split_title: "Kenyamanan Spa<br><em>Tanpa Meninggalkan Rumah</em>",
    split_desc: "Tidak perlu keluar rumah. Terapis profesional kami hadir ke lokasi Anda lengkap dengan peralatan terbaik. Jadwal fleksibel setiap hari, pukul 07:00 hingga 23:00, untuk menyesuaikan rutinitas Anda.",
    split_btn: "Lihat Menu Treatment",

    // Why Us Section
    why_label: "Mengapa CrideviSPA",
    why_title: "Standar Profesional<br><em>Setiap Kunjungan</em>",
    why_desc: "Kami berkomitmen memberikan pengalaman terbaik dengan terapis terlatih, produk premium, dan layanan yang tepat waktu.",
    why_1_title: "Terapis Bersertifikat",
    why_1_desc: "Semua terapis kami telah melalui pelatihan intensif dan memiliki sertifikasi resmi untuk memastikan kualitas terbaik.",
    why_2_title: "Layanan ke Lokasi Anda",
    why_2_desc: "Kami datang ke rumah, hotel, atau villa Anda di Denpasar dan sekitarnya dengan seluruh perlengkapan profesional.",
    why_3_title: "Buka Setiap Hari",
    why_3_desc: "Tersedia 07:00 – 23:00 tanpa libur, dengan jadwal fleksibel yang menyesuaikan waktu dan kebutuhan Anda.",
    why_4_title: "Produk Berkualitas",
    why_4_desc: "Menggunakan minyak esensial dan produk perawatan pilihan yang aman untuk semua jenis kulit.",
    why_5_title: "Privasi Terjaga",
    why_5_desc: "Terapis kami terlatih menjaga etika profesional dan kerahasiaan klien di setiap sesi.",
    why_6_title: "Harga Transparan",
    why_6_desc: "Tidak ada biaya tersembunyi. Harga tertera adalah harga yang Anda bayar, mulai dari Rp 100.000.",

    // Featured Treatments Section
    feat_label: "Treatment",
    feat_title: "Pilihan Treatment<br><em>Terpilih untuk Anda</em>",
    see_all: "Semua Treatment",
    card_massage_title: "Body Massage",
    card_massage_desc: "Balinese, Four Hand, Aromatherapy, Hot Stone, dan Deep Tissue. Teknik pilihan untuk setiap kebutuhan.",
    card_massage_price: "Mulai Rp 250.000",
    card_facial_title: "Facial &amp; Body Care",
    card_facial_desc: "Facial, Ear Candle, Body Scrub &amp; Body Mask untuk kulit yang lebih sehat dan bercahaya.",
    card_facial_price: "Mulai Rp 100.000",
    card_pkg_title: "Package Treatment",
    card_pkg_desc: "Kombinasi treatment terbaik. Balinese Massage dengan Body Scrub &amp; Body Mask.",
    card_pkg_price: "Mulai Rp 450.000",

    // Banner Section
    banner_pre: "Home Service Massage",
    banner_title: "Relaksasi Premium<br><em>di Kenyamanan Rumah Anda</em>",
    banner_sub: "Kami membawa pengalaman spa berkualitas langsung ke pintu Anda — di Denpasar dan sekitarnya.",
    banner_btn: "Reservasi Sekarang",

    // Price List Section
    price_label: "Price List",
    price_title: "Harga Jelas,<br><em>Tanpa Biaya Tersembunyi</em>",
    full_pricelist: "Lihat Price List Lengkap",

    // Testimonials
    testi_label: "Testimoni &amp; Ulasan Tamu",
    testi_title: "Kata Mereka yang Telah Merasakan",

    // Process / How It Works
    process_label: "Prosedur &amp; Kemudahan",
    process_title: "4 Langkah Mudah<br><em>Layanan Home Service Spa</em>",
    step1_title: "Reservasi via WhatsApp",
    step1_desc: "Pilih treatment favorit Anda dan tentukan jam &amp; lokasi (Rumah, Hotel, atau Villa).",
    step2_title: "Terapis Datang Tepat Waktu",
    step2_desc: "Terapis bersertifikat kami hadir lengkap membawa peralatan spa, handuk bersih, dan minyak esensial pilihan.",
    step3_title: "Sesi Pijat &amp; Relaksasi",
    step3_desc: "Nikmati pijatan profesional dengan musik aromaterapi tenang di ruang pribadi Anda.",
    step4_title: "Segar &amp; Pembayaran Mudah",
    step4_desc: "Tubuh kembali bugar. Pembayaran dapat dilakukan tunai atau transfer tanpa biaya tersembunyi.",

    // FAQ
    faq_label: "Pertanyaan Umum",
    faq_title: "Hal yang Sering Ditanyakan",
    faq_sub: "Semua informasi penting sebelum sesi pertama Anda. Butuh bantuan? Hubungi kami via WhatsApp kapan saja.",
    faq_badge: "Tanya via WhatsApp",
    faq1_q: "Apakah saya perlu menyiapkan matras atau handuk sendiri?",
    faq1_a: "Tidak perlu. Terapis CrideviSPA membawa seluruh kelengkapan sendiri termasuk matras empuk portabel, alas higienis sekali pakai, handuk bersih, dan minyak aromaterapi esensial.",
    faq2_q: "Area mana saja yang dijangkau oleh layanan CrideviSPA?",
    faq2_a: "Kami melayani seluruh area Denpasar, Seminyak, Canggu, Kuta, Sanur, Nusa Dua, Kerobokan, dan Ubud. Terapis siap datang langsung ke rumah, villa, maupun kamar hotel Anda.",
    faq3_q: "Berapa jam sebelum treatment sebaiknya saya melakukan booking?",
    faq3_a: "Disarankan untuk memesan 1-2 jam sebelumnya agar kami dapat menyiapkan terapis terbaik dan memperhitungkan waktu perjalanan ke lokasi Anda tepat waktu.",
    faq4_q: "Bagaimana metode pembayarannya?",
    faq4_a: "Pembayaran sangat fleksibel. Anda dapat membayar secara Tunai (Cash) setelah sesi treatment selesai atau melalui Transfer Bank / QRIS.",

    // CTA & Floating WA
    cta_label: "Mulai Relaksasi Anda",
    cta_title: "Siap untuk Sesi<br><em>Pemulihan Anda?</em>",
    cta_sub: "Hubungi kami dan kami akan segera menjadwalkan sesi yang sesuai dengan waktu dan kebutuhan Anda.",
    cta_hours: "Buka Setiap Hari &nbsp;·&nbsp; 07:00 – 23:00 &nbsp;·&nbsp; Denpasar &amp; Sekitarnya",
    cta_btn: "Pilih Treatment & Reservasi",
    wa_float: "Reservasi via WhatsApp",

    // Treatments Page
    tp_title: "Daftar Treatment",
    tp_loc_link: "Lihat Detail Lokasi",
    tp_ready_text: "Siap memesan treatment Anda?",
    tp_book_btn: "Lanjut ke Form Reservasi",

    // Location Detail Page
    loc_heading: "Treatment &amp; Harga",
    loc_sidebar_book: "Pilih Treatment",
    loc_hours_label: "Jam Operasional",
    loc_hours_val: "07:00 – 23:00, Setiap Hari",
    loc_area_label: "Area Layanan",
    loc_area_val: "Denpasar &amp; Sekitarnya",
    loc_contact_label: "Kontak",
    loc_sidebar_note: "Reservasi via WhatsApp dianjurkan untuk memastikan ketersediaan jadwal yang Anda inginkan.",
    loc_about_heading: "Tentang CrideviSPA",
    loc_about_body: "CrideviSPA adalah layanan home service massage profesional yang hadir untuk memberikan pengalaman spa premium langsung di kenyamanan rumah, hotel, atau villa Anda. Dengan terapis bersertifikat yang berpengalaman, kami menawarkan berbagai pilihan treatment — dari pijat tradisional Bali, aromaterapi, hot stone, four hand massage, facial, hingga body scrub. Buka setiap hari mulai pukul 07:00 hingga 23:00, kami siap melayani Anda kapan pun Anda membutuhkan relaksasi.",
    loc_hours_heading: "Jam Operasional",
    loc_hours_daily: "Setiap Hari",
    loc_hours_last: "Pemesanan Terakhir",
    loc_map_heading: "Temukan Kami",
    loc_map_link: "Buka di Google Maps",
    bc_home: "&larr; Kembali ke Beranda",

    // Booking View
    book_title: "Formulir Reservasi",
    book_sub_text: "Pemesanan untuk area Denpasar, Bali &nbsp;",
    book_change_loc: "Ganti lokasi",
    book_loc_label: "Lokasi:",
    book_treatments_label: "Treatment Dipilih:",
    book_add_btn: "+ Tambah treatment lain",
    book_date_time_label: "Tanggal &amp; Jam Pilihan:",
    book_time_placeholder: "Pilih jam...",
    book_fname_label: "Nama depan:",
    book_lname_label: "Nama belakang:",
    book_phone_label: "No. WhatsApp / HP:",
    book_email_label: "Email:",
    book_note: "Catatan: Jam yang dipilih bersifat permintaan. Pemesanan Anda akan segera dikonfirmasi oleh tim reservasi kami.",
    book_msg_label: "Alamat Lengkap / Catatan Tambahan:",
    book_submit_btn: "Kirim Permintaan Reservasi"
  },

  en: {
    // Header & Navigation
    nav_home: "Home",
    nav_treatments: "Treatments",
    nav_location: "Location",
    nav_articles: "Articles",
    nav_book: "Book Now",
    nav_mobile_articles: "Articles &amp; Blog",
    nav_mobile_wa: "Book via WhatsApp",

    // Hero Section
    hero_eyebrow: "Home Service Massage<br><span class=\"hero-eyebrow-sub\">Denpasar, Bali</span>",
    hero_title: "Traditional Care,<br><em>Modern Touch</em>",
    hero_sub: "Relax &nbsp;·&nbsp; Renew &nbsp;·&nbsp; Rejuvenate",
    hero_book: "Book Now",
    hero_treatments: "View Treatments",
    hero_scroll: "Scroll",

    // Intro Section
    intro_label: "About CrideviSPA",
    intro_title: "Premium Spa Experience<br><em>Delivered to Your Location</em>",
    intro_body: "We deliver professional high-quality massage services straight to your home, hotel, or villa. Our certified therapists blend traditional Balinese techniques with a modern approach to provide deep relaxation that restores your body and calms your mind.",

    // Split Section
    split_label: "Our Advantage",
    split_title: "Spa Comfort<br><em>Without Leaving Home</em>",
    split_desc: "No need to travel anywhere. Our professional therapists arrive at your doorstep equipped with premium tools and supplies. Flexible schedules every day, 07:00 to 23:00, tailored to your routine.",
    split_btn: "View Treatments",

    // Why Us Section
    why_label: "Why CrideviSPA",
    why_title: "Professional Standard<br><em>Every Single Visit</em>",
    why_desc: "We are committed to delivering the best experience with trained therapists, premium products, and punctual on-time service.",
    why_1_title: "Certified Therapists",
    why_1_desc: "All our therapists undergo intensive training and hold official certification to ensure top-quality treatment.",
    why_2_title: "On-Location Service",
    why_2_desc: "We come to your home, hotel, or villa in Denpasar and surrounding areas with full professional equipment.",
    why_3_title: "Open Every Day",
    why_3_desc: "Available 07:00 – 23:00 daily, no holidays, with flexible scheduling to suit your timing.",
    why_4_title: "Premium Products",
    why_4_desc: "We use selected essential oils and skincare products that are safe and gentle for all skin types.",
    why_5_title: "Guaranteed Privacy",
    why_5_desc: "Our therapists are professionally trained in ethics and client confidentiality throughout every session.",
    why_6_title: "Transparent Pricing",
    why_6_desc: "No hidden charges. The listed price is what you pay — starting from IDR 100,000.",

    // Featured Treatments Section
    feat_label: "Treatments",
    feat_title: "Featured Treatments<br><em>Curated for You</em>",
    see_all: "All Treatments",
    card_massage_title: "Body Massage",
    card_massage_desc: "Balinese, Four Hand, Aromatherapy, Hot Stone, and Deep Tissue. Expert techniques for every need.",
    card_massage_price: "From IDR 250,000",
    card_facial_title: "Facial &amp; Body Care",
    card_facial_desc: "Facial, Ear Candle, Body Scrub &amp; Body Mask for healthier, more radiant skin.",
    card_facial_price: "From IDR 100,000",
    card_pkg_title: "Package Treatment",
    card_pkg_desc: "The perfect combination. Balinese Massage with Body Scrub &amp; Body Mask.",
    card_pkg_price: "From IDR 450,000",

    // Banner Section
    banner_pre: "Home Service Massage",
    banner_title: "Premium Relaxation<br><em>In the Comfort of Your Place</em>",
    banner_sub: "We bring a luxury spa experience straight to your door — in Denpasar, Seminyak, Canggu &amp; beyond.",
    banner_btn: "Book Now",

    // Price List Section
    price_label: "Price List",
    price_title: "Clear Pricing,<br><em>No Hidden Fees</em>",
    full_pricelist: "View Full Price List",

    // Testimonials
    testi_label: "Testimonials &amp; Guest Reviews",
    testi_title: "What Our Guests Say",

    // Process / How It Works
    process_label: "How It Works",
    process_title: "4 Simple Steps<br><em>Home Service Spa Experience</em>",
    step1_title: "Reserve via WhatsApp",
    step1_desc: "Choose your preferred treatment and set your time &amp; location (Home, Hotel, or Villa).",
    step2_title: "Punctual Therapist Arrival",
    step2_desc: "Your certified therapist arrives with clean towels, fresh linen, and essential oils ready to go.",
    step3_title: "Massage &amp; Relaxation",
    step3_desc: "Enjoy professional massage with calming aromatherapy in your own private space.",
    step4_title: "Refreshed &amp; Easy Payment",
    step4_desc: "Feel fully restored. Pay by cash or bank transfer — no hidden charges whatsoever.",

    // FAQ
    faq_label: "FAQ",
    faq_title: "Frequently Asked Questions",
    faq_sub: "Everything you need to know before your first session. Can't find an answer? Reach us on WhatsApp anytime.",
    faq_badge: "Ask via WhatsApp",
    faq1_q: "Do I need to prepare a mattress or towels?",
    faq1_a: "No need to worry. CrideviSPA therapists bring everything needed: clean towels, fresh linens, and essential oils.",
    faq2_q: "Which areas in Bali do you serve?",
    faq2_a: "We cover Denpasar, Seminyak, Canggu, Kuta, Sanur, Nusa Dua, Kerobokan, and Ubud. Therapists come directly to your home, villa, or hotel room.",
    faq3_q: "How far in advance should I book?",
    faq3_a: "We recommend booking 1–2 hours ahead so we can assign the best therapist and ensure punctual arrival at your location.",
    faq4_q: "What payment methods are accepted?",
    faq4_a: "Payment is fully flexible — Cash after the session, or Bank Transfer / QRIS. No hidden fees, ever.",

    // CTA & Floating WA
    cta_label: "Begin Your Relaxation",
    cta_title: "Ready for Your<br><em>Recovery Session?</em>",
    cta_sub: "Contact us now and we will promptly schedule a session perfectly tailored to your time and preferences.",
    cta_hours: "Open Daily &nbsp;·&nbsp; 07:00 – 23:00 &nbsp;·&nbsp; Denpasar &amp; Surrounding Areas",
    cta_btn: "Choose Treatment & Book",
    wa_float: "Book via WhatsApp",

    // Treatments Page
    tp_title: "Treatments",
    tp_loc_link: "View Location Details",
    tp_ready_text: "Ready to book your spa treatment?",
    tp_book_btn: "Proceed to Booking",

    // Location Detail Page
    loc_heading: "Treatments &amp; Pricing",
    loc_sidebar_book: "Select Treatment",
    loc_hours_label: "Operating Hours",
    loc_hours_val: "07:00 – 23:00, Daily",
    loc_area_label: "Service Area",
    loc_area_val: "Denpasar &amp; Surrounding Bali Areas",
    loc_contact_label: "Contact",
    loc_sidebar_note: "WhatsApp reservation is recommended to secure your preferred therapist and schedule.",
    loc_about_heading: "About CrideviSPA",
    loc_about_body: "CrideviSPA is a premier on-demand home service massage provider delivering five-star spa experiences directly to your home, hotel room, or private villa in Bali. With certified and seasoned therapists, we offer a comprehensive menu — from traditional Balinese massage and aromatherapy to hot stone, four hand massage, revitalizing facials, and herbal body scrubs. Open daily from 07:00 to 23:00.",
    loc_hours_heading: "Operating Hours",
    loc_hours_daily: "Every Day",
    loc_hours_last: "Last Booking Order",
    loc_map_heading: "Find Us",
    loc_map_link: "Open in Google Maps",
    bc_home: "&larr; Back to Home",

    // Booking View
    book_title: "Book an Appointment",
    book_sub_text: "Booking for Denpasar, Bali &nbsp;",
    book_change_loc: "Change location",
    book_loc_label: "Location:",
    book_treatments_label: "Selected Treatments:",
    book_add_btn: "+ Add another treatment",
    book_date_time_label: "Preferred Date &amp; Time:",
    book_time_placeholder: "Select time...",
    book_fname_label: "First name:",
    book_lname_label: "Last name:",
    book_phone_label: "Phone / WhatsApp:",
    book_email_label: "Email:",
    book_note: "Please note: selected times are a request only. Your booking will be confirmed promptly by our reservations team.",
    book_msg_label: "Address / Special Requests:",
    book_submit_btn: "Submit Booking Request"
  }
};

// Default: EN (as requested)
let currentLang = localStorage.getItem('cridevispa_lang') || 'en';

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('cridevispa_lang', lang);

  // Update HTML lang attribute
  document.documentElement.lang = lang === 'id' ? 'id' : 'en';

  // Active state on all lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Translate all [data-i18n] elements
  const dict = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Notify components of language change
  window.dispatchEvent(new CustomEvent('cridevispa_lang_change', { detail: { lang } }));
}

// Initialize: wait for full DOM. Works with defer scripts.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setLanguage(currentLang));
} else {
  setLanguage(currentLang);
}
