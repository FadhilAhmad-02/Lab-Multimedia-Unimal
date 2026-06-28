import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight, Search, Filter, ShoppingCart,
  AlertCircle, RefreshCw, SlidersHorizontal, X,
  Tag, Layers, ChevronDown,
} from "lucide-react";
import { v, Section, CTASection } from "../components/pageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Link } from "react-router";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  images: string[] | null;
  category: string;
  featured: boolean;
  active: boolean;
  stock?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

function getThumb(product: Product) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0]!;
  return product.image ?? "/images/placeholder.png";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <div className="h-44" style={{ background: v("--c-border") }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 rounded-lg w-3/4" style={{ background: v("--c-border") }} />
        <div className="h-3 rounded-lg w-full" style={{ background: v("--c-border") }} />
        <div className="h-3 rounded-lg w-2/3" style={{ background: v("--c-border") }} />
        <div className="h-8 rounded-xl mt-2" style={{ background: v("--c-border") }} />
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  const stock = product.stock ?? 0;
  const stockLabel = stock > 200 ? "Stok Banyak" : stock > 50 ? "Stok Tersedia" : stock > 0 ? "Stok Terbatas" : "Habis";
  const stockColor = stock > 200 ? "#16A34A" : stock > 50 ? "#CA8A04" : stock > 0 ? "#DC2626" : "#6B7280";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.06 }}
      whileHover={{ y: -6 }}
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group"
      style={{
        background: v("--c-card"),
        border: product.featured ? `1.5px solid rgba(46,125,50,0.4)` : `1px solid ${v("--c-border")}`,
        boxShadow: product.featured ? v("--c-shadow-hover") : v("--c-shadow-card"),
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44 flex-shrink-0">
        <ImageWithFallback
          src={getThumb(product)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.featured && (
          <span
            className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-white text-xs font-bold"
            style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
          >
            ⭐ Populer
          </span>
        )}
        {/* Category ribbon */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-2"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent)" }}
        >
          <span className="text-xs text-white/80 font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="font-['Poppins',sans-serif] font-bold mb-1.5 line-clamp-2"
          style={{ color: v("--c-text"), fontSize: "0.95rem" }}
        >
          {product.name}
        </h3>
        <p
          className="text-xs flex-1 mb-4 line-clamp-3"
          style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}
        >
          {product.description || "Produk berkualitas tinggi dengan pengerjaan profesional."}
        </p>

        {/* Stock */}
        {product.stock !== undefined && (
          <div className="mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: `${stockColor}18`,
                color: stockColor,
                border: `1px solid ${stockColor}30`,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: stockColor }} />
              {stockLabel}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Mulai dari
          </p>
          <p
            className="font-['Poppins',sans-serif] font-bold text-lg"
            style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {formatPrice(product.price)}
          </p>
        </div>

        {/* CTA */}
        <Link
          to={`/produk/${product.id}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
        >
          <ShoppingCart size={14} /> Pesan Sekarang
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function ProdukHero({ total }: { total: number }) {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden" style={{ minHeight: 320 }}>
      <div className="absolute inset-0">
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #F9A825 100%)" }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FDD835, transparent)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-xs mb-6"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif" }}
        >
          <a href="/" style={{ color: "rgba(255,255,255,0.45)" }}>Home</a>
          <ChevronRight size={12} />
          <span style={{ color: "#FDD835" }}>Produk</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", lineHeight: 1.1 }}
        >
          Katalog{" "}
          <span style={{ background: "linear-gradient(to right, #FDD835, #FFB300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Produk & Layanan
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-4 max-w-xl mx-auto text-base"
          style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
        >
          Temukan solusi cetak lengkap — dari kartu nama hingga spanduk besar, semua tersedia dengan kualitas premium.
        </motion.p>

        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", fontFamily: "'Inter',sans-serif" }}
          >
            <Layers size={13} /> {total} produk tersedia
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "default",   label: "Urutan Default" },
  { value: "price_asc", label: "Harga: Rendah ke Tinggi" },
  { value: "price_desc",label: "Harga: Tinggi ke Rendah" },
  { value: "name_asc",  label: "Nama A–Z" },
  { value: "featured",  label: "Produk Populer Dulu" },
];

// ─── Main Export ──────────────────────────────────────────────────────────────
export function ProdukPage() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [categories, setCategories]   = useState<string[]>(["Semua"]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort]               = useState("default");
  const [sortOpen, setSortOpen]       = useState(false);
  const [page, setPage]               = useState(1);
  const PER_PAGE = 12;
  const sortRef = useRef<HTMLDivElement>(null);

  // Fetch produk
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`Gagal memuat produk (${res.status})`);
      const json = await res.json();
      // Support { data: [...] } atau langsung array
      const raw: Product[] = Array.isArray(json) ? json : (json.data ?? []);
      const active = raw.filter(p => p.active !== false);
      setProducts(active);

      // Bangun daftar kategori unik dari data
      const cats = ["Semua", ...Array.from(new Set(active.map(p => p.category).filter(Boolean)))];
      setCategories(cats);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan saat memuat produk.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [activeCategory, sort]);

  // Filter + sort
  const filtered = products
    .filter(p => {
      const matchCat = activeCategory === "Semua" || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "name_asc")   return a.name.localeCompare(b.name, "id");
      if (sort === "featured")   return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const sortLabel  = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Urutan Default";

  return (
    <div style={{ color: v("--c-text") }}>
      <ProdukHero total={products.length} />

      <Section>
        <div className="max-w-7xl mx-auto px-5 md:px-10">

          {/* ── Toolbar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center"
          >
            {/* Search */}
            <div className="relative flex-1 w-full" style={{ maxWidth: 380 }}>
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: v("--c-text-sec") }} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
              />
              {searchInput && (
                <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Result count */}
              {!loading && (
                <p className="text-sm whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  <Filter size={13} className="inline mr-1.5" />
                  {filtered.length} produk
                </p>
              )}

              {/* Sort dropdown */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(o => !o)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
                  style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                >
                  <SlidersHorizontal size={14} />
                  <span className="hidden sm:inline">{sortLabel}</span>
                  <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: sortOpen ? "rotate(180deg)" : "none" }} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-30 min-w-[220px]"
                      style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-hover") }}
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSort(opt.value); setSortOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                          style={{
                            color: sort === opt.value ? "var(--c-primary)" : v("--c-text"),
                            background: sort === opt.value ? "rgba(46,125,50,0.07)" : "transparent",
                            fontFamily: "'Inter',sans-serif",
                            fontWeight: sort === opt.value ? 600 : 400,
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* ── Category tabs ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeCategory === cat ? v("--c-gradient-r") : v("--c-bg-sec"),
                  color: activeCategory === cat ? "#fff" : v("--c-text-sec"),
                  border: activeCategory === cat ? "none" : `1px solid ${v("--c-border")}`,
                  fontFamily: "'Inter',sans-serif",
                  boxShadow: activeCategory === cat ? "0 4px 14px rgba(46,125,50,0.25)" : "none",
                }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>

          {/* ── Content ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                <AlertCircle size={28} color="#EF4444" />
              </div>
              <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{error}</p>
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
              >
                <RefreshCw size={14} /> Coba Lagi
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {paginated.length > 0 ? (
                <motion.div
                  key={activeCategory + search + sort + page}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {paginated.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <p className="text-5xl mb-5">🔍</p>
                  <p className="text-lg font-bold mb-2" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                    Produk tidak ditemukan
                  </p>
                  <p className="text-sm mb-5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Coba kata kunci lain atau pilih kategori berbeda
                  </p>
                  <button
                    onClick={() => { setSearchInput(""); setActiveCategory("Semua"); }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
                  >
                    Reset Filter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* ── Pagination ── */}
          {!loading && !error && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mt-12 flex-wrap"
            >
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: v("--c-bg-sec"),
                  border: `1px solid ${v("--c-border")}`,
                  color: page === 1 ? v("--c-text-sec") : v("--c-text"),
                  opacity: page === 1 ? 0.5 : 1,
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: v("--c-text-sec") }}>…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: page === item ? v("--c-gradient-r") : v("--c-bg-sec"),
                        border: page === item ? "none" : `1px solid ${v("--c-border")}`,
                        color: page === item ? "#fff" : v("--c-text"),
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {item}
                    </button>
                  )
                )
              }

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: v("--c-bg-sec"),
                  border: `1px solid ${v("--c-border")}`,
                  color: page === totalPages ? v("--c-text-sec") : v("--c-text"),
                  opacity: page === totalPages ? 0.5 : 1,
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                Next →
              </button>
            </motion.div>
          )}

        </div>
      </Section>

      <CTASection />
    </div>
  );
}