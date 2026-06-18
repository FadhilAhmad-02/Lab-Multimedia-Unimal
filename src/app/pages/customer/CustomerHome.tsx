import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  MessageCircle, ArrowRight, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight,
  Printer, Flag, Gift, Package, Mail, Layers, ShoppingBag, FolderOpen, CreditCard, Truck,
} from "lucide-react";
import { v, CTASection } from "../../components/pageUtils";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { OutlineFillButton } from "../../components/ui/outline-fill-button";

/* ── Images ─────────────────────────────────────────────────── */
const IMG_HERO     = "https://images.unsplash.com/photo-1706895040634-62055892cbbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwcmludGluZyUyMG1hY2hpbmUlMjBjbG9zZSUyMHVwJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcxOTI1NjUyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_CARD     = "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNhcmQlMjBkZXNpZ24lMjBwcmludCUyMG1vY2t1cHxlbnwxfHx8fDE3NzE5MjI3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_BANNER   = "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5uZXIlMjBwcmludGluZyUyMGxhcmdlJTIwZm9ybWF0JTIwc2lnbmFnZXxlbnwxfHx8fDE3NzE5MjI3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_PACK     = "https://images.unsplash.com/photo-1746422029285-e81d6650f17f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWNrYWdpbmclMjBib3glMjBkZXNpZ24lMjBicmFuZGluZyUyMHByZW1pdW18ZW58MXx8fHwxNzcxOTIyNzk0fDA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_MUG      = "https://images.unsplash.com/photo-1763627719014-0ea46e97a5d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBtZXJjaGFuZGlzZSUyMHNvdXZlbmlyJTIwbXVnJTIwcHJpbnR8ZW58MXx8fHwxNzcxOTIyNzk3fDA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_WEDDING  = "https://images.unsplash.com/photo-1739909198159-a834175bd911?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwaW52aXRhdGlvbiUyMHByaW50aW5nJTIwZWxlZ2FudCUyMGRlc2lnbnxlbnwxfHx8fDE3NzE5MjI3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_SOUVENIR = "https://images.unsplash.com/photo-1759563874678-844afcc582b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V2ZW5pciUyMGdpZnQlMjBwYWNrYWdpbmclMjBlbGVnYW50JTIwbHV4dXJ5fGVufDF8fHx8MTc3MTgxNDYyM3ww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_DESIGN   = "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwcG9ydGZvbGlvJTIwcHJpbnQlMjBicmFuZGluZ3xlbnwxfHx8fDE3NzE5MjI3OTF8MA&ixlib=rb-4.1.0&q=80&w=1080";

/* ── Data ─────────────────────────────────────────────────── */
const MARQUEE_ITEMS = ["Banner", "Spanduk", "Stiker", "Brosur", "Kartu Nama", "Backdrop", "Neon Box", "Packaging", "Undangan", "Souvenir", "Poster", "X-Banner"];

const CATEGORIES = [
  { name: "Cetak Digital",    Icon: Printer, count: 12, gradient: "linear-gradient(135deg, #2E7D32, #4CAF50)", slug: "cetak-digital" },
  { name: "Spanduk & Banner", Icon: Flag,    count: 8,  gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", slug: "spanduk-banner" },
  { name: "Souvenir",         Icon: Gift,    count: 15, gradient: "linear-gradient(135deg, #DB2777, #F472B6)", slug: "souvenir" },
  { name: "Packaging",        Icon: Package, count: 10, gradient: "linear-gradient(135deg, #047857, #34D399)", slug: "packaging" },
  { name: "Undangan",         Icon: Mail,    count: 6,  gradient: "linear-gradient(135deg, #B45309, #FCD34D)", slug: "undangan" },
  { name: "Finishing",        Icon: Layers,  count: 4,  gradient: "linear-gradient(135deg, #2E7D32, #F9A825)", slug: "finishing" },
];

const BEST_SELLERS = [
  { id: "1", slug: "banner-vinyl", name: "Banner Vinyl Premium",    price: "Rp 20.000/m²",   image: IMG_BANNER,  rating: 4.9, reviews: 324, wishlist: false },
  { id: "2", slug: "kartu-nama",   name: "Kartu Nama Laminasi UV",  price: "Rp 35.000/100",  image: IMG_CARD,    rating: 4.8, reviews: 215, wishlist: true  },
  { id: "3", slug: "mug-custom",   name: "Mug Custom Sublimasi",    price: "Rp 25.000/pcs",  image: IMG_MUG,     rating: 4.7, reviews: 189, wishlist: false },
  { id: "4", slug: "packaging-box", name: "Paper Bag Premium",      price: "Rp 3.500/pcs",   image: IMG_PACK,    rating: 4.8, reviews: 142, wishlist: false },
  { id: "5", slug: "undangan-nik", name: "Undangan Pernikahan Hard Cover", price: "Rp 5.000/pcs", image: IMG_WEDDING, rating: 4.9, reviews: 98, wishlist: true },
  { id: "6", slug: "souvenir-box", name: "Souvenir Gift Set",      price: "Rp 45.000/set",  image: IMG_SOUVENIR, rating: 4.6, reviews: 76, wishlist: false },
];

const FLASH_SALE = [
  { id: "f1", name: "Stiker Vinyl A4", price: "Rp 8.000", originalPrice: "Rp 12.000", discount: 33, image: IMG_DESIGN, stock: 45, maxStock: 100 },
  { id: "f2", name: "Brosur A5 (100pcs)", price: "Rp 180.000", originalPrice: "Rp 250.000", discount: 28, image: IMG_CARD, stock: 23, maxStock: 50 },
  { id: "f3", name: "Mug Custom", price: "Rp 18.000", originalPrice: "Rp 25.000", discount: 28, image: IMG_MUG, stock: 67, maxStock: 200 },
  { id: "f4", name: "Paper Bag Kraft", price: "Rp 2.500", originalPrice: "Rp 3.500", discount: 29, image: IMG_PACK, stock: 12, maxStock: 100 },
];

const STEPS = [
  { num: "01", Icon: ShoppingCart, title: "Pilih Produk",   desc: "Temukan produk yang sesuai kebutuhan di katalog kami" },
  { num: "02", Icon: FolderOpen,   title: "Upload Desain",  desc: "Upload file desain siap cetak atau minta bantuan tim kami" },
  { num: "03", Icon: CreditCard,   title: "Bayar",          desc: "Pilih metode pembayaran yang paling mudah untuk Anda" },
  { num: "04", Icon: Truck,        title: "Terima Pesanan", desc: "Produk dikirim langsung ke alamat Anda di seluruh Indonesia" },
];

const TESTIMONIALS = [
  { name: "Budi Santoso",    city: "Lhokseumawe", rating: 5, text: "Kualitas cetakannya luar biasa! Banner yang saya pesan terlihat sangat profesional dan warnanya vivid banget. Pasti repeat order!", avatar: "B" },
  { name: "Siti Rahayu",     city: "Banda Aceh",  rating: 5, text: "Pelayanan super cepat dan ramah. Desain dibantu sampai jadi, hasilnya melampaui ekspektasi. Highly recommended!", avatar: "S" },
  { name: "Ahmad Fauzi",     city: "Aceh Utara",  rating: 5, text: "Sudah langganan di sini lebih dari 2 tahun. Kualitas konsisten, pengiriman tepat waktu. Tim nya juga sangat profesional.", avatar: "A" },
  { name: "Dewi Fatimah",    city: "Langsa",      rating: 5, text: "Undangan pernikahan saya sangat cantik! Semua tamu memuji kualitasnya. Terima kasih Malikussaleh Advertising!", avatar: "D" },
  { name: "Rizky Pratama",   city: "Bireuen",     rating: 5, text: "Harga bersaing dengan kualitas premium. Packaging produk saya jadi jauh lebih menarik berkat bantuan tim kreatif mereka.", avatar: "R" },
];

/* ── CountdownTimer ───────────────────────────────────────── */
function useCountdown(targetHours = 6) {
  const [time, setTime] = useState({ h: targetHours, m: 59, s: 59 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-['JetBrains_Mono',monospace] font-bold text-2xl md:text-3xl text-white" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
        {String(value).padStart(2, "0")}
      </div>
      <p className="text-white/60 text-xs mt-1" style={{ fontFamily: "'Inter',sans-serif" }}>{label}</p>
    </div>
  );
}

/* ── Hero Section ─────────────────────────────────────────── */
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMG_HERO} alt="Hero" className="w-full h-full object-cover" style={{ filter: "brightness(0.25) saturate(0.6)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,32,16,0.97) 0%, rgba(27,94,32,0.7) 55%, rgba(249,168,37,0.08) 100%)" }} />
      </div>
      {/* Orbs */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full opacity-8 pointer-events-none" style={{ background: "radial-gradient(circle, var(--c-primary), transparent)", filter: "blur(80px)" }} />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-8 pointer-events-none" style={{ background: "radial-gradient(circle, var(--c-accent), transparent)", filter: "blur(60px)" }} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-24 pb-16 w-full">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7"
          style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.4)", color: "#FB923C", fontFamily: "'Inter',sans-serif" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Percetakan Terpercaya #1 di Aceh
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white max-w-3xl"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", lineHeight: 1.1 }}
        >
          Wujudkan Ide Kreatifmu{" "}
          <span style={{ background: "linear-gradient(to right, #FDD835, #FFB300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Bersama Kami
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 max-w-xl text-base"
          style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
        >
          Solusi cetak premium Universitas Malikussaleh. Dari kartu nama hingga banner besar, kami hadir dengan kualitas terjamin dan harga bersaing.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-9 flex flex-wrap gap-4">
          <OutlineFillButton
            direction="up"
            duration={0.35}
            baseBackground="#2E7D32"
            fillBackground="linear-gradient(to right, #FDD835, #FFB300)"
            borderValue="none"
            textColor="#ffffff"
            filledTextColor="#1B5E20"
            onClick={() => navigate("/produk")}
          >
            <ShoppingCart size={16} /> Pesan Sekarang
          </OutlineFillButton>
        </motion.div>

        {/* Floating stats card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-16 inline-flex flex-wrap gap-6 md:gap-10 px-6 py-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
        >
          {[["1000+", "Pesanan Selesai"], ["500+", "Pelanggan Puas"], ["5★", "Rating"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="font-['Poppins',sans-serif] font-bold text-white text-xl leading-none">{val}</p>
              <p className="text-white/50 text-xs mt-1" style={{ fontFamily: "'Inter',sans-serif" }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll bounce */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
        <div className="w-px h-12" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)" }} />
      </motion.div>
    </section>
  );
}

/* ── Marquee Banner ───────────────────────────────────────── */
function MarqueeBanner() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden py-3.5" style={{ background: "var(--c-gradient-r)" }}>
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-white font-semibold text-sm flex items-center gap-4" style={{ fontFamily: "'Inter',sans-serif" }}>
            {item}
            <span className="text-white/50">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Categories ───────────────────────────────────────────── */
function CategoriesSection() {
  return (
    <section className="py-20 theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3" style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), border: `1px solid rgba(46,125,50,0.18)`, fontFamily: "'Inter',sans-serif" }}>
            <Layers size={12} /> Layanan Kami
          </p>
          <h2 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: v("--c-text") }}>
            Semua Kebutuhan Cetak{" "}
            <span style={{ background: "linear-gradient(to right, #FDD835, #FFB300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ada di Sini</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map(({ name, Icon: CatIcon, count, gradient, slug }, i) => (
            <motion.div key={name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <Link to={`/produk?category=${slug}`} className="block rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}>
                <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: gradient }}>
                  <CatIcon size={28} className="text-white" aria-hidden="true" />
                </motion.div>
                <h3 className="font-semibold mb-1" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{name}</h3>
                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{count} produk tersedia</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Best Sellers ─────────────────────────────────────────── */
function BestSellersSection() {
  const [wishlist, setWishlist] = useState<string[]>(BEST_SELLERS.filter(p => p.wishlist).map(p => p.id));
  return (
    <section className="py-20 theme-aware" style={{ background: v("--c-bg-sec") }}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: v("--c-text") }}>Produk Terlaris</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'Inter',sans-serif" }}>🔥 Hot</span>
            </div>
            <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Produk pilihan yang paling banyak dipesan pelanggan kami</p>
          </div>
          <Link to="/produk" className="hidden md:flex items-center gap-1 text-sm font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {BEST_SELLERS.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl overflow-hidden group cursor-pointer flex flex-col" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>TERLARIS</span>
                <button onClick={() => setWishlist(w => w.includes(product.id) ? w.filter(x => x !== product.id) : [...w, product.id])} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200" style={{ background: "rgba(255,255,255,0.9)" }}>
                  <Heart size={12} style={{ color: wishlist.includes(product.id) ? "#EF4444" : "#9CA3AF", fill: wishlist.includes(product.id) ? "#EF4444" : "none" }} />
                </button>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs font-semibold mb-1 line-clamp-2 flex-1" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{product.name}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star size={10} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                  <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{product.rating} ({product.reviews})</span>
                </div>
                <p className="text-xs font-bold mb-2" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>{product.price}</p>
                <Link to={`/checkout?cat=${product.slug?.split('-')[0]}&pid=${product.slug}`} className="mt-auto w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                  <ShoppingCart size={10} /> Pesan
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Flash Sale ───────────────────────────────────────────── */
function FlashSaleSection() {
  const { h, m, s } = useCountdown(5);
  return (
    <section className="py-20 overflow-hidden" style={{ background: "#0F172A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1.5 rounded-full text-white text-sm font-bold animate-pulse" style={{ background: "#EF4444", fontFamily: "'Inter',sans-serif" }}>⚡ FLASH SALE</span>
            </div>
            <h2 className="font-['Poppins',sans-serif] font-bold text-white" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}>Penawaran Terbatas Hari Ini!</h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-white/50 text-sm" style={{ fontFamily: "'Inter',sans-serif" }}>Berakhir dalam:</p>
            <div className="flex items-center gap-2">
              <TimeBox value={h} label="JAM" />
              <span className="text-white font-bold text-2xl">:</span>
              <TimeBox value={m} label="MENIT" />
              <span className="text-white font-bold text-2xl">:</span>
              <TimeBox value={s} label="DETIK" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FLASH_SALE.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden" style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" style={{ filter: "brightness(0.8)" }} />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold" style={{ background: "#EF4444", fontFamily: "'Inter',sans-serif" }}>-{item.discount}%</span>
              </div>
              <div className="p-3">
                <p className="text-white text-xs font-semibold mb-1 line-clamp-2" style={{ fontFamily: "'Inter',sans-serif" }}>{item.name}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold" style={{ color: "var(--c-accent)", fontFamily: "'Poppins',sans-serif", fontSize: 13 }}>{item.price}</span>
                  <span className="text-white/35 text-xs line-through" style={{ fontFamily: "'Inter',sans-serif" }}>{item.originalPrice}</span>
                </div>
                {/* Stock bar */}
                <div className="mb-2">
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${(item.stock / item.maxStock) * 100}%`, background: item.stock / item.maxStock < 0.3 ? "#EF4444" : "#10B981" }} />
                  </div>
                  <p className="text-white/40 text-xs mt-1" style={{ fontFamily: "'Inter',sans-serif" }}>Sisa {item.stock} item</p>
                </div>
                <Link to="/produk/kartu-nama" className="w-full flex items-center justify-center py-2 rounded-lg text-xs font-bold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                  Beli Sekarang
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How To Order ─────────────────────────────────────────── */
function HowToOrderSection() {
  return (
    <section className="py-20 theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="text-center mb-14">
          <h2 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: v("--c-text") }}>
            Cara Mudah{" "}
            <span style={{ background: "linear-gradient(to right, #FDD835, #FFB300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Memesan</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>4 langkah mudah untuk mendapatkan produk cetak impian Anda</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: `linear-gradient(to right, ${v("--c-primary")}, ${v("--c-accent")})`, opacity: 0.3 }} />
          {STEPS.map(({ num, Icon, title, desc }, i) => (
            <motion.div key={num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center relative">
              <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 relative" style={{ background: v("--c-gradient-r") }}>
                <Icon className="text-2xl" />
                <span className="text-white/60 text-xs font-bold absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: v("--c-bg"), border: `2px solid ${v("--c-primary")}`, color: v("--c-primary"), fontFamily: "'Poppins',sans-serif", fontSize: 10 }}>{num}</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{title}</h3>
              <p className="text-xs" style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials Carousel ────────────────────────────────── */
function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const perPage = typeof window !== "undefined" && window.innerWidth >= 1024 ? 3 : 1;
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);
  const visible = TESTIMONIALS.slice(current, current + 3).length < 3
    ? [...TESTIMONIALS.slice(current), ...TESTIMONIALS.slice(0, 3 - TESTIMONIALS.slice(current).length)]
    : TESTIMONIALS.slice(current, current + 3);

  return (
    <section className="py-20 theme-aware" style={{ background: v("--c-bg-sec") }}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="text-center mb-12">
          <h2 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: v("--c-text") }}>
            Apa Kata Pelanggan Kami
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {visible.map((t, i) => (
            <motion.div key={`${current}-${i}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card"), backdropFilter: "blur(8px)" }}
            >
              <p className="text-4xl leading-none mb-3" style={{ color: v("--c-accent"), opacity: 0.4, fontFamily: "'Poppins',sans-serif" }}>"</p>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, si) => <Star key={si} size={12} fill="#F59E0B" style={{ color: "#F59E0B" }} />)}
              </div>
              <p className="text-sm italic mb-5" style={{ color: v("--c-text-sec"), lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}>{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: v("--c-gradient-r"), fontFamily: "'Poppins',sans-serif" }}>{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: v("--c-accent"), fontFamily: "'Inter',sans-serif" }}>{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${v("--c-border")}`, color: v("--c-text-sec") }}><ChevronLeft size={14} /></button>
          {TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className="w-2 h-2 rounded-full transition-all" style={{ background: i === current ? v("--c-primary") : v("--c-border") }} />)}
          <button onClick={() => setCurrent(c => (c + 1) % TESTIMONIALS.length)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${v("--c-border")}`, color: v("--c-text-sec") }}><ChevronRight size={14} /></button>
        </div>
      </div>
    </section>
  );
}

/* ── Main Export ──────────────────────────────────────────── */
export function CustomerHome() {
  return (
    <div style={{ color: v("--c-text") }}>
      <HeroSection />
      <MarqueeBanner />
      <CategoriesSection />
      <BestSellersSection />
      <FlashSaleSection />
      <HowToOrderSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}