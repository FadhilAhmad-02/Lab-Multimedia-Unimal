import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, ChevronRight, Search, Filter, ArrowRight, ShoppingCart } from "lucide-react";
import { v, Section, CTASection } from "../components/pageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Link } from "react-router";
import { PRODUCTS, CATEGORIES } from "../data/products";

/* ── Product Card ───────────────────────────────────────────────── */
function ProductCard({ product, index }: { product: typeof PRODUCTS[0]; index: number }) {
  const stockStatus = product.stock > 200 ? "Stok Banyak" : product.stock > 100 ? "Stok Tersedia" : "Stok Terbatas";
  const stockColor = product.stock > 200 ? "#16A34A" : product.stock > 100 ? "#CA8A04" : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 6) * 0.07 }}
      whileHover={{ y: -6 }}
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group"
      style={{
        background: v("--c-card"),
        border: product.highlight
          ? `1.5px solid ${v("--c-primary")}40`
          : `1px solid ${v("--c-border")}`,
        boxShadow: product.highlight ? v("--c-shadow-hover") : v("--c-shadow-card"),
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.highlight && (
          <span
            className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-white text-xs font-bold"
            style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
          >
            Populer
          </span>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-2"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent)" }}
        >
          <span className="text-xs text-white/80 font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-['Poppins',sans-serif] font-bold mb-1" style={{ color: v("--c-text") }}>
          {product.name}
        </h3>
        <p
          className="text-xs flex-1 mb-4"
          style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}
        >
          {product.description}
        </p>

        {/* Stock Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{
              background: `${stockColor}15`,
              color: stockColor,
              fontFamily: "'Inter',sans-serif",
              border: `1px solid ${stockColor}30`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: stockColor }} />
            Stok: {product.stock}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Mulai dari
            </p>
            <p
              className="font-['Poppins',sans-serif] font-bold"
              style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {product.minPrice}
            </p>
            <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              {product.unit}
            </p>
          </div>
        </div>

        {/* Action — satu tombol Pesan */}
        <Link
          to={`/produk/${product.id}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
        >
          <ShoppingCart size={14} /> Pesan Sekarang
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────── */
function ProdukHero() {
  return (
    <section
      className="relative pt-28 pb-16 overflow-hidden"
      style={{ minHeight: 340 }}
    >
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #F9A825 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 text-center">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-xs mb-6"
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter',sans-serif" }}
        >
          <a href="/" style={{ color: "rgba(255,255,255,0.5)" }}>Home</a>
          <ChevronRight size={12} />
          <span style={{ color: v("--c-accent") }}>Produk</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", lineHeight: 1.1 }}
        >
          Katalog{" "}
          <span
            style={{
              background: "linear-gradient(to right, #FDD835, #FFB300)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Produk & Layanan
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-xl mx-auto text-base"
          style={{
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.8,
            fontFamily: "'Inter',sans-serif",
          }}
        >
          Temukan solusi cetak lengkap kami — dari kartu nama hingga spanduk besar,
          semua tersedia dengan kualitas premium.
        </motion.p>
      </div>
    </section>
  );
}

/* ── Main Export ─────────────────────────────────────────────────── */
export function ProdukPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ color: v("--c-text") }}>
      <ProdukHero />

      <Section>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-10"
          >
            {/* Search */}
            <div className="relative flex-1" style={{ maxWidth: 360 }}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              <Filter size={14} />
              <span>{filtered.length} produk ditemukan</span>
            </div>
          </motion.div>

          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 min-h-[36px]"
                style={{
                  background: activeCategory === cat ? v("--c-gradient-r") : v("--c-bg-sec"),
                  color: activeCategory === cat ? "#fff" : v("--c-text-sec"),
                  border: activeCategory === cat ? "none" : `1px solid ${v("--c-border")}`,
                  fontFamily: "'Inter',sans-serif",
                  boxShadow: activeCategory === cat ? "0 4px 15px rgba(46,125,50,0.25)" : "none",
                }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>

          {/* Products grid */}
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={activeCategory + search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold mb-2" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                  Produk tidak ditemukan
                </p>
                <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Coba kata kunci lain atau pilih kategori berbeda
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      <CTASection />
    </div>
  );
}