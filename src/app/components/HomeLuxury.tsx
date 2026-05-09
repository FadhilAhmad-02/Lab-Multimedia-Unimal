import { motion, AnimatePresence } from "motion/react";
import {
  Plus, MessageCircle, ArrowRight,
  Zap, Award, Sparkles, Shield, Timer, Package, Layers, Star,
} from "lucide-react";
import imgBusiness from "figma:asset/dd4907e3dbe031b472b21dfeb4cd7eba6b24cca7.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { OutlineFillButton } from "./ui/outline-fill-button";

/* ── Image Constants ─────────────────────────────────────────── */
const IMG_HERO      = "https://images.unsplash.com/photo-1581508512961-0e3b9524db40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwcmVtaXVtJTIwcHJpbnRpbmclMjBwcmVzcyUyMG1hY2hpbmVyeXxlbnwxfHx8fDE3NzE4MTQ2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_EQUIP     = "https://images.unsplash.com/photo-1630327722923-5ebd594ddda9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmludGluZyUyMGVxdWlwbWVudCUyMGRpZ2l0YWwlMjBvZmZzZXQlMjBtYWNoaW5lcnl8ZW58MXx8fHwxNzcxODE0NjI1fDA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_SOUVENIR  = "https://images.unsplash.com/photo-1759563874678-844afcc582b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V2ZW5pciUyMGdpZnQlMjBwYWNrYWdpbmclMjBlbGVnYW50JTIwbHV4dXJ5fGVufDF8fHx8MTc3MTgxNDYyM3ww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_BANNER    = "https://images.unsplash.com/photo-1693031630177-b897fb9d7154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5uZXIlMjBwcmludGluZyUyMGxhcmdlJTIwZm9ybWF0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MTgxNDYyNHww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_CARD      = "https://images.unsplash.com/photo-1760804876161-ba0337e998fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMGNhcmQlMjBsdXh1cnklMjBicmFuZGluZ3xlbnwxfHx8fDE3NzE4MTQ2MjF8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_PACKAGING = "https://images.unsplash.com/photo-1751991713869-7e5ae07db1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwcHJpbnQlMjBkZXNpZ24lMjBwYWNrYWdpbmclMjBnb2xkfGVufDF8fHx8MTc3MTgxNDYyMHww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_OFFICE    = "https://images.unsplash.com/photo-1771270759486-1f7703945072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVnYW50JTIwb2ZmaWNlJTIwd29ya3NwYWNlJTIwZGFya3xlbnwxfHx8fDE3NzE4MTQ2MjB8MA&ixlib=rb-4.1.0&q=80&w=1080";

/* ── Data ─────────────────────────────────────────────────────── */
const HERO_TEXTS = [
  "lancar tanpa hambatan!",
  "nggak ribet lagi!",
  "selalu mudah dan cepat!",
  "beres dalam seketika!",
];

const STATS = [
  { value: "500+", label: "Pelanggan Puas" },
  { value: "50+",  label: "Jenis Produk" },
  { value: "24/7", label: "Siap Melayani" },
];

const PRODUCTS = [
  { id: "souvenir", label: "Souvenir",    img: IMG_SOUVENIR,  desc: "Souvenir eksklusif untuk setiap momen spesial. Dari gantungan kunci, mug custom, hingga merchandise branded yang meninggalkan kesan tak terlupakan." },
  { id: "tulis",    label: "Alat Tulis",  img: IMG_CARD,      desc: "Stationery profesional berkualitas tinggi. Kartu nama, kop surat, amplop branded, hingga company profile yang membangun citra bisnis Anda." },
  { id: "promosi",  label: "Promosi",     img: IMG_BANNER,    desc: "Materi promosi impactful yang menarik perhatian. Brosur, flyer, poster, banner, spanduk, dan x-banner untuk kebutuhan marketing Anda." },
  { id: "packing",  label: "Packing",     img: IMG_PACKAGING, desc: "Kemasan premium yang meningkatkan nilai produk Anda. Dari packaging box, paper bag, label produk, hingga sleeve cup yang elegan." },
];

const WHY_US = [
  { Icon: Award,    title: "Kualitas Cetak Premium",   desc: "Hasil cetakan jernih, tajam, dan tahan lama. Cocok untuk kebutuhan pribadi maupun bisnis skala besar." },
  { Icon: Timer,    title: "Proses Cepat & On-Time",   desc: "Pesananmu selesai sesuai deadline, bahkan untuk kebutuhan mendadak dengan layanan kilat kami." },
  { Icon: Zap,      title: "Harga Kompetitif",         desc: "Dapatkan kualitas premium tanpa harus merogoh kantong terlalu dalam. Harga terbaik, hasil terbaik." },
  { Icon: Shield,   title: "Garansi Kepuasan",         desc: "Jika hasil cetak tidak sesuai standar kami, kami berkomitmen untuk merevisi atau cetak ulang tanpa biaya." },
  { Icon: Sparkles, title: "Konsultasi Desain Gratis", desc: "Belum punya desain? Tim kreatif kami siap membantu mewujudkan ide Anda menjadi desain yang memukau." },
  { Icon: Package,  title: "Pilihan Lengkap",          desc: "Dari kartu nama hingga spanduk besar, semua kebutuhan cetak tersedia di satu tempat yang mudah dijangkau." },
];

const TESTIMONIALS = [
  { quote: "Cetakannya bagus banget, hasilnya sesuai ekspektasi bahkan lebih! Bakal repeat order lagi.", name: "Sergio Schumm",     role: "Marketing Manager", rating: 5, initial: "S" },
  { quote: "Pesanan selesai tepat waktu, padahal saya pesan mepet deadline. Terima kasih banyak!",      name: "Michael Saylor",   role: "Business Owner",    rating: 5, initial: "M" },
  { quote: "Pelayanannya ramah dan cepat, bikin urusan cetak jadi gampang dan nggak ribet sama sekali.", name: "Chin Changpeng", role: "Creative Director",  rating: 5, initial: "C" },
  { quote: "Desain dibantu sampai jadi, hasil cetakannya rapi dan terlihat sangat profesional banget.",  name: "Sam Altman",       role: "Entrepreneur",      rating: 5, initial: "Sa" },
];

const FAQ_ITEMS = [
  { q: "Bisa cetak jenis apa saja di sini?",                                            a: "Kami melayani berbagai jenis cetak: undangan, brosur, banner, kartu nama, spanduk, packaging, stiker, dan masih banyak lagi. Hubungi kami untuk info lengkap." },
  { q: "Berapa lama proses cetaknya biasanya?",                                          a: "Proses cetak standar 2–3 hari kerja. Tersedia layanan kilat 1 hari kerja untuk kebutuhan urgent (biaya tambahan berlaku)." },
  { q: "Apakah bisa cetak cepat / kilat kalau butuh urgent?",                            a: "Tentu! Kami memiliki layanan cetak kilat. Hubungi kami via WhatsApp untuk konfirmasi ketersediaan dan estimasi waktu." },
  { q: "File apa saja yang bisa dipakai untuk cetak?",                                   a: "Kami menerima file PDF, AI, CDR (CorelDRAW), PSD, dan format lainnya. Untuk hasil terbaik, kami rekomendasikan PDF atau AI dengan resolusi minimal 300 dpi." },
  { q: "Bisa bantu kalau saya belum punya desain?",                                      a: "Ya! Kami menyediakan layanan desain gratis untuk pembelian minimum tertentu. Tim desainer kami siap membantu mewujudkan ide Anda." },
  { q: "Ada minimal jumlah order, atau bisa cetak satuan?",                              a: "Bisa cetak satuan untuk beberapa produk. Untuk produk tertentu ada minimum order—silakan tanyakan langsung via WhatsApp." },
  { q: "Apakah harga sudah termasuk finishing (laminating, jilid, potong)?",             a: "Harga dasar belum termasuk finishing. Biaya finishing akan diinformasikan sesuai kebutuhan dan jenis finishing yang dipilih." },
  { q: "Kalau ada kesalahan cetak, apakah bisa direvisi atau dicetak ulang?",            a: "Jika kesalahan dari pihak kami, kami bertanggung jawab penuh untuk cetak ulang tanpa biaya tambahan." },
  { q: "Bisa pesan secara online atau harus datang langsung?",                           a: "Bisa pesan online via WhatsApp! File desain bisa dikirim digital, dan hasil cetak bisa dikirim ke alamat Anda di seluruh Indonesia." },
  { q: "Kalau sering order, apakah ada harga khusus pelanggan tetap?",                   a: "Ya! Pelanggan tetap mendapatkan harga spesial dan prioritas antrian. Hubungi kami untuk info program loyalitas." },
];

/* ── Helper ──────────────────────────────────────────────────── */
const v  = (varName: string): string => `var(${varName})`;
const cs = (...classes: string[]) => classes.filter(Boolean).join(" ");

/* ── Reusable Section ────────────────────────────────────────── */
function Section({ children, bg = "var(--c-bg)", className = "", id = "" }: {
  children: React.ReactNode; bg?: string; className?: string; id?: string;
}) {
  return (
    <section
      id={id}
      className={cs("py-20 md:py-28 transition-colors duration-300 theme-aware", className)}
      style={{ background: bg }}
    >
      {children}
    </section>
  );
}

/* ── Section Header ──────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, subtitle, light = false }: {
  eyebrow: string; title: React.ReactNode; subtitle?: string; light?: boolean;
}) {
  return (
    <div className="text-center mb-14">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
        style={{
          background: light ? "rgba(46,125,50,0.08)" : "rgba(46,125,50,0.12)",
          color: v("--c-primary"),
          border: `1px solid ${light ? "rgba(46,125,50,0.15)" : "rgba(46,125,50,0.2)"}`,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Layers size={12} />
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-['Poppins',sans-serif] font-bold"
        style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", lineHeight: 1.2, color: light ? "#1B1B1B" : v("--c-text") }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 max-w-xl mx-auto text-base"
          style={{ color: v("--c-text-sec"), fontFamily: "'Inter', sans-serif", lineHeight: 1.8 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ── Gradient Button ─────────────────────────────────────────── */
function BtnPrimary({ children, href = "#", className = "" }: {
  children: React.ReactNode; href?: string; className?: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cs(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white",
        "min-h-[44px] shadow-md hover:shadow-lg transition-shadow duration-200",
        className
      )}
      style={{ background: v("--c-gradient-r"), fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </motion.a>
  );
}

function BtnSecondary({ children, href = "#", className = "" }: {
  children: React.ReactNode; href?: string; className?: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cs(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm",
        "min-h-[44px] transition-all duration-200",
        className
      )}
      style={{
        border: `1.5px solid ${v("--c-primary")}`,
        color: v("--c-primary"),
        fontFamily: "'Inter', sans-serif",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(46,125,50,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </motion.a>
  );
}

/* ── Hero Section ────────────────────────────────────────────── */
function HeroSection() {
  const [textIdx, setTextIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTextIdx((i) => (i + 1) % HERO_TEXTS.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={IMG_HERO} alt="Hero" className="w-full h-full object-cover" style={{ filter: "brightness(0.28) saturate(0.7)" }} />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(10,32,16,0.96) 0%, rgba(27,94,32,0.65) 55%, rgba(249,168,37,0.12) 100%)" }}
        />
      </div>

      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--c-primary), transparent)", filter: "blur(80px)" }} />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--c-accent), transparent)", filter: "blur(60px)" }} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-28 pb-20 w-full">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'Inter',sans-serif",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Percetakan Premium Universitas Malikussaleh
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 1.1 }}
        >
          Solusi Praktis Biar
          <br />
          Percetakanmu
        </motion.h1>

        {/* Rotating text */}
        <div className="mt-3 h-14 md:h-16 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIdx}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="font-['Poppins',sans-serif] font-bold"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 3.2rem)",
                lineHeight: 1.2,
                background: "var(--c-gradient-r)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {HERO_TEXTS[textIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-7 max-w-lg text-base"
          style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
        >
          Pas buat kamu yang pengen satset meski waktu mepet. Proses secepat kilat dengan kualitas cetakan premium yang terjamin.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <OutlineFillButton
            direction="up"
            duration={0.35}
            baseBackground="#2E7D32"
            fillBackground="linear-gradient(to right, #FDD835, #FFB300)"
            borderValue="none"
            textColor="#ffffff"
            filledTextColor="#1B5E20"
            onClick={() => window.open("https://wa.me/081234567890", "_blank")}
          >
            <MessageCircle size={16} /> Pesan Sekarang
          </OutlineFillButton>
          <motion.a
            href="/produk"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm min-h-[44px] transition-all duration-200"
            style={{
              border: "1.5px solid rgba(255,255,255,0.35)",
              color: "#fff",
              fontFamily: "'Inter',sans-serif",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            Lihat Layanan <ArrowRight size={14} />
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-16 flex flex-wrap gap-10 justify-center"
        >
          {STATS.map((s) => (
            <div key={s.value} className="text-center">
              <p
                className="font-['Poppins',sans-serif] font-bold"
                style={{ fontSize: "2rem", lineHeight: 1, background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                {s.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)" }} />
      </motion.div>
    </section>
  );
}

/* ── About Section ───────────────────────────────────────────── */
function AboutSection() {
  return (
    <Section bg="var(--c-bg-sec)">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ background: "rgba(46,125,50,0.08)", color: v("--c-primary"), border: `1px solid rgba(46,125,50,0.15)`, fontFamily: "'Inter',sans-serif" }}
            >
              <Layers size={11} /> Tentang Kami
            </p>
            <h2
              className="font-['Poppins',sans-serif] font-bold"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.2, color: v("--c-text") }}
            >
              Mitra Cetak Terpercaya untuk{" "}
              <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Setiap Kebutuhan
              </span>
            </h2>
            <p className="mt-5 text-base" style={{ color: v("--c-text-sec"), lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>
              Malikussaleh Advertising hadir sebagai solusi lengkap untuk segala kebutuhan cetak custom kamu. Kami siap membantu mewujudkan ide kreatif menjadi produk cetak berkualitas tinggi.
            </p>
            <p className="mt-3 text-base" style={{ color: v("--c-text-sec"), lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>
              Dengan tim profesional berdedikasi, kami berkomitmen menghadirkan hasil terbaik yang melampaui ekspektasi Anda.
            </p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <BtnPrimary href="https://wa.me/081234567890">
                <MessageCircle size={15} /> Konsultasi Gratis
              </BtnPrimary>
              <BtnSecondary href="/produk">
                Lihat Layanan <ArrowRight size={14} />
              </BtnSecondary>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: v("--c-shadow-hover"), border: `1px solid ${v("--c-border")}` }}
            >
              <ImageWithFallback src={IMG_OFFICE} alt="About" className="w-full h-80 object-cover" />
            </div>
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -bottom-5 -left-5 rounded-2xl px-5 py-4 shadow-lg"
              style={{ background: v("--c-gradient-r") }}
            >
              <p className="text-white/90 text-xs font-semibold tracking-widest" style={{ fontFamily: "'Inter',sans-serif" }}>KUALITAS TERBUKTI</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ── Products Section ────────────────────────────────────────── */
function ProductsSection() {
  const [active, setActive] = useState("souvenir");
  const product = PRODUCTS.find((p) => p.id === active) ?? PRODUCTS[0];

  return (
    <Section id="produk">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="Layanan Kami"
          title={<>Cetak Apapun <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>yang Kamu Mau</span></>}
          subtitle="Kami menyediakan solusi cetak lengkap dengan kualitas premium untuk setiap kebutuhan Anda."
        />

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {PRODUCTS.map((p) => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActive(p.id)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 min-h-[40px]"
              style={{
                background: active === p.id ? v("--c-gradient-r") : v("--c-bg-sec"),
                color: active === p.id ? "#fff" : v("--c-text-sec"),
                border: active === p.id ? "none" : `1px solid ${v("--c-border")}`,
                fontFamily: "'Inter',sans-serif",
                boxShadow: active === p.id ? "0 4px 15px rgba(46,125,50,0.25)" : "none",
              }}
            >
              {p.label}
            </motion.button>
          ))}
        </div>

        {/* Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid md:grid-cols-2 gap-10 items-center mb-14"
          >
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: v("--c-shadow-hover"), border: `1px solid ${v("--c-border")}` }}>
              <ImageWithFallback src={product.img} alt={product.label} className="w-full h-72 object-cover" />
            </div>
            <div>
              <h3 className="font-['Poppins',sans-serif] font-bold text-2xl" style={{ color: v("--c-text") }}>{product.label}</h3>
              <div className="mt-2 w-12 h-1 rounded-full" style={{ background: v("--c-gradient-r") }} />
              <p className="mt-5 text-base" style={{ color: v("--c-text-sec"), lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}>{product.desc}</p>
              <BtnPrimary href="https://wa.me/081234567890" className="mt-8">
                <MessageCircle size={15} /> Tanya & Pesan
              </BtnPrimary>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActive(p.id)}
              whileHover={{ y: -4 }}
              className="cursor-pointer rounded-xl overflow-hidden transition-all duration-300 group"
              style={{
                border: active === p.id ? `2px solid ${v("--c-primary")}` : `1px solid ${v("--c-border")}`,
                boxShadow: active === p.id ? v("--c-shadow-hover") : v("--c-shadow-card"),
              }}
            >
              <div className="relative h-40">
                <ImageWithFallback src={p.img} alt={p.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-107" />
                <div className="absolute inset-0 flex items-end p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)" }}>
                  <p className="text-xs font-semibold tracking-wider text-white" style={{ fontFamily: "'Inter',sans-serif" }}>{p.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ── Equipment Section ───────────────────────────────────────── */
function EquipmentSection() {
  const cards = [
    { title: "Cetak Digital HD", desc: "Resolusi 1200 dpi untuk detail sempurna di setiap produk cetak.", Icon: Zap },
    { title: "Finishing Premium", desc: "Laminasi doff/glossy, emboss, spot UV, foil gold & silver.",   Icon: Sparkles },
    { title: "Quality Control",  desc: "Setiap produk melewati pemeriksaan ketat sebelum dikirimkan.",   Icon: Shield },
  ];

  return (
    <Section bg="var(--c-bg-sec)">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="Infrastruktur"
          title={<>Peralatan Produksi <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lengkap</span></>}
        />
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 rounded-2xl overflow-hidden relative"
            style={{ minHeight: 340, border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-hover") }}
          >
            <ImageWithFallback src={IMG_EQUIP} alt="Equipment" className="w-full h-full object-cover" style={{ minHeight: 340 }} />
            <div className="absolute inset-0 flex flex-col justify-end p-8" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent)" }}>
              <p className="font-['Poppins',sans-serif] font-bold text-white text-xl">Teknologi Cetak Terkini</p>
              <p className="mt-2 text-sm text-white/75" style={{ fontFamily: "'Inter',sans-serif", lineHeight: 1.7 }}>
                Mesin cetak digital & offset terbaru untuk hasil presisi dan konsisten di setiap produksi.
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col gap-5">
            {cards.map(({ title, desc, Icon }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3, boxShadow: v("--c-shadow-hover") as string }}
                className="rounded-xl p-5 flex-1 transition-all duration-200"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: v("--c-gradient-r") }}>
                  <Icon size={16} className="text-white" />
                </div>
                <p className="font-semibold text-sm mb-1.5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{title}</p>
                <p className="text-sm" style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ── Why Us Section ──────────────────────────────────────────── */
function WhyUsSection() {
  return (
    <Section>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-2 gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ background: "rgba(46,125,50,0.08)", color: v("--c-primary"), border: `1px solid rgba(46,125,50,0.15)`, fontFamily: "'Inter',sans-serif" }}
            >
              <Layers size={11} /> Keunggulan Kami
            </p>
            <h2
              className="font-['Poppins',sans-serif] font-bold"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.2, color: v("--c-text") }}
            >
              Mengapa Pilih{" "}
              <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Malikussaleh Advertising?
              </span>
            </h2>
            <p className="mt-4 text-base" style={{ color: v("--c-text-sec"), lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}>
              Kami bukan sekadar tempat cetak biasa — kami adalah mitra strategis yang membantu bisnis dan individu tampil lebih profesional.
            </p>

            <div className="mt-9 flex flex-col gap-5">
              {WHY_US.map(({ Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: v("--c-gradient-r") }}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{title}</p>
                    <p className="mt-1 text-sm" style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mt-8 md:mt-16"
          >
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-hover"), aspectRatio: "16/9" }}
            >
              <ImageWithFallback src={imgBusiness} alt="Profile" className="w-full h-full object-cover" style={{ filter: "brightness(0.55) saturate(0.7)" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: v("--c-gradient-r"), boxShadow: "0 0 40px rgba(46,125,50,0.4)" }}
                >
                  <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                    <path d="M1 1.5L17 11L1 20.5V1.5Z" fill="white" />
                  </svg>
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <p className="text-xs text-white/60" style={{ fontFamily: "'Inter',sans-serif", letterSpacing: "0.1em" }}>VIDEO PROFIL — SEGERA HADIR</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ── Testimonials ────────────────────────────────────────────── */
function TestimonialsSection() {
  return (
    <Section bg="var(--c-bg-sec)">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="Apa Kata Mereka"
          title={<>Kepuasan <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pelanggan Kami</span></>}
          subtitle="Ribuan pelanggan telah mempercayakan kebutuhan cetak mereka kepada kami."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: v("--c-shadow-hover") as string }}
              className="rounded-2xl p-6 flex flex-col transition-all duration-300"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={12} fill={v("--c-accent")} style={{ color: v("--c-accent") }} />
                ))}
              </div>
              <p className="text-3xl leading-none mb-2" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif", opacity: 0.3 }}>"</p>
              <p className="flex-1 text-sm italic" style={{ color: v("--c-text-sec"), lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}>{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                  style={{ background: v("--c-gradient-r"), fontFamily: "'Poppins',sans-serif" }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: v("--c-accent"), fontFamily: "'Inter',sans-serif" }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ── FAQ Section ────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section>
      <div className="max-w-3xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="FAQ"
          title={<>Pertanyaan yang <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sering Diajukan</span></>}
          subtitle="Temukan jawaban untuk pertanyaan umum tentang layanan percetakan kami."
        />

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{
                border: open === i ? `1.5px solid ${v("--c-primary")}` : `1px solid ${v("--c-border")}`,
                background: v("--c-card"),
                boxShadow: open === i ? v("--c-shadow-hover") : v("--c-shadow-card"),
              }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: open === i ? v("--c-primary") : v("--c-text"), fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}
                >
                  {item.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: open === i ? v("--c-gradient-r") : v("--c-bg-sec"), color: open === i ? "#fff" : v("--c-text-sec") }}
                >
                  <Plus size={14} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm" style={{ color: v("--c-text-sec"), lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ── CTA Section ─────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: v("--c-gradient") } as CSSProperties}>
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(40%, -40%)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(-40%, 40%)" }} />

      <div className="relative max-w-3xl mx-auto px-5 md:px-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white/80 text-sm font-medium tracking-widest uppercase mb-4"
          style={{ fontFamily: "'Inter',sans-serif" }}
        >
          Siap untuk memulai?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.2 }}
        >
          Wujudkan Ide Cetak Anda Sekarang
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-white/75 text-base"
          style={{ lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
        >
          Hubungi kami via WhatsApp dan dapatkan konsultasi desain gratis. Tim kami siap membantu kapan saja.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-9 flex flex-wrap gap-4 justify-center"
        >
          <motion.a
            href="https://wa.me/081234567890"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm min-h-[44px]"
            style={{ background: "#25D366", color: "#fff", fontFamily: "'Inter',sans-serif", boxShadow: "0 4px 20px rgba(37,211,102,0.35)" }}
          >
            <MessageCircle size={16} /> WhatsApp: 081234567890
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main Export ─────────────────────────────────────────────── */
export function HomeLuxury() {
  return (
    <div style={{ color: v("--c-text") }}>
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <EquipmentSection />
      <WhyUsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}