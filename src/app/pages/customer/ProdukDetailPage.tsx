import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, Heart, Minus, Plus, Upload, ShoppingCart, MessageCircle,
  ChevronRight, Clock, Truck, ZoomIn, ArrowRight, Check,
  Ruler, Layers, Package, FileText, Info,
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import {
  getProductBySlug, getProductGallery, SPEC_OPTIONS, PRODUCTS,
} from "../../data/products";

const REVIEWS = [
  { name: "Budi S.",   rating: 5, text: "Warna vivid, hasil sangat memuaskan!",                      date: "20 Feb 2025" },
  { name: "Siti R.",   rating: 5, text: "Cepat dan berkualitas tinggi.",                              date: "18 Feb 2025" },
  { name: "Ahmad F.",  rating: 4, text: "Bagus, sedikit lebih lama dari estimasi tapi hasil oke.",    date: "15 Feb 2025" },
];

const TABS = ["Deskripsi", "Spesifikasi", "Panduan File", "Ulasan"];

export function ProdukDetailPage() {
  const { slug }    = useParams<{ slug: string }>();
  const navigate    = useNavigate();

  /* ── Lookup product ──────────────────────────────────────── */
  const product = slug ? getProductBySlug(slug) : undefined;

  // Fallback: if slug not found, use first product
  const prod    = product ?? PRODUCTS[0];
  const specs   = SPEC_OPTIONS[prod.checkoutCat];
  const gallery = getProductGallery(prod);

  /* ── State ───────────────────────────────────────────────── */
  const [mainImg,     setMainImg]     = useState(0);
  const [activeTab,   setActiveTab]   = useState(0);
  const [material,    setMaterial]    = useState(specs.materials[0]);
  const [finishing,   setFinishing]   = useState(specs.finishings[0]);
  const [sizeMode,    setSizeMode]    = useState<"standard" | "custom">("standard");
  const [selectedSz,  setSelectedSz]  = useState(specs.sizes[0]);
  const [customW,     setCustomW]     = useState("100");
  const [customH,     setCustomH]     = useState("200");
  const [qty,         setQty]         = useState(1);
  const [designMode,  setDesignMode]  = useState<"own" | "request">("own");
  const [uploadedFile,setUploaded]    = useState<string | null>(null);
  const [wishlist,    setWishlist]    = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  /* ── Price calc ──────────────────────────────────────────── */
  const matIdx     = specs.materials.indexOf(material);
  const matMults   = [1, 0.85, 1.2, 1.4, 1.1, 1.0];
  const finMults   = [1, 1.1, 1.12, 1.25, 1.15, 1.0];
  const matMult    = matMults[matIdx] ?? 1;
  const finMult    = finMults[specs.finishings.indexOf(finishing)] ?? 1;

  const area = sizeMode === "standard"
    ? selectedSz.multiplier
    : (parseInt(customW) / 100) * (parseInt(customH) / 100);

  const designFee   = designMode === "request" ? 50_000 : 0;
  const totalPrice  = Math.round(specs.basePrice * matMult * finMult * area * qty) + designFee;

  const selectedSizeLabel = sizeMode === "standard"
    ? selectedSz.label
    : `${customW}×${customH} cm`;

  /* ── Actions ─────────────────────────────────────────────── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setUploaded(e.target.files[0].name);
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handlePesan = () => {
    navigate("/checkout", {
      state: {
        prefill: {
          /* Product identity */
          productId:   prod.id,
          productName: prod.name,
          productImage: prod.image,
          category:    prod.category,
          description: prod.description,
          /* Checkout mapping */
          checkoutCat:       prod.checkoutCat,
          checkoutProductId: prod.checkoutProductId,
          /* Selected specs */
          material,
          finishing,
          sizeLabel:  selectedSizeLabel,
          sizeId:     sizeMode === "standard" ? selectedSz.id : "custom",
          customW:    parseInt(customW) || 0,
          customH:    parseInt(customH) || 0,
          designMode,
          uploadedFile,
          qty,
          unit:         specs.unit,
          estimatedPrice: totalPrice,
          specsDisplay: `${material} · ${finishing} · ${selectedSizeLabel}`,
        },
      },
    });
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div style={{ color: v("--c-text"), background: v("--c-bg") }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-24 pb-2">
        <div className="flex items-center gap-2 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          <Link to="/produk" style={{ color: v("--c-text-sec") }}>Produk</Link>
          <ChevronRight size={12} />
          <span style={{ color: v("--c-accent") }}>{prod.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 pb-20">
        {/* ── Top section: gallery + config ── */}
        <div className="grid md:grid-cols-2 gap-10 pt-4 mb-14">

          {/* Gallery */}
          <div>
            <div
              className="relative rounded-2xl overflow-hidden mb-3 group"
              style={{ border: `1px solid ${v("--c-border")}` }}
            >
              <ImageWithFallback
                src={gallery[mainImg]}
                alt={prod.name}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ aspectRatio: "4/3" }}
              />
              <button
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
              >
                <ZoomIn size={16} />
              </button>
              {prod.highlight && (
                <span
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold"
                  style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
                >
                  TERLARIS
                </span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  className="flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden transition-all"
                  style={{ border: `2px solid ${i === mainImg ? v("--c-primary") : v("--c-border")}` }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Product description chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { Icon: Ruler,   label: "Ukuran Custom" },
                { Icon: Layers,  label: "Multi-Finishing" },
                { Icon: Package, label: `Min. 1 ${specs.unit}` },
                { Icon: Clock,   label: "2–3 Hari Kerja" },
                { Icon: Truck,   label: "Antar ke Lokasi" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(46,125,50,0.08)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
                >
                  <Icon size={11} /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Product info + configurator */}
          <div>
            {/* Category badge */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
            >
              {prod.category}
            </span>

            {/* Title + wishlist */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1
                className="font-['Poppins',sans-serif] font-bold"
                style={{ fontSize: "clamp(1.3rem, 2vw, 1.75rem)", color: v("--c-text") }}
              >
                {prod.name}
              </h1>
              <button
                onClick={() => setWishlist(!wishlist)}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: `1px solid ${v("--c-border")}`, background: v("--c-bg-sec") }}
              >
                <Heart size={16} style={{ color: wishlist ? "#EF4444" : v("--c-text-sec"), fill: wishlist ? "#EF4444" : "none" }} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} fill="#F59E0B" style={{ color: "#F59E0B" }} />
              ))}
              <span className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                4.9 (324 ulasan)
              </span>
            </div>

            {/* Short description */}
            <p
              className="text-sm mb-4"
              style={{ color: v("--c-text-sec"), lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
            >
              {prod.description}
            </p>

            <div className="h-px mb-4" style={{ background: v("--c-border") }} />

            {/* Dynamic price */}
            <div className="mb-5">
              <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Estimasi Total Harga
              </p>
              <p
                className="font-['Poppins',sans-serif] font-bold"
                style={{ fontSize: "2rem", color: v("--c-primary") }}
              >
                Rp {totalPrice.toLocaleString("id-ID")}
              </p>
              <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                {specs.priceNote} — dihitung otomatis
              </p>
            </div>

            {/* ── Configurator card ── */}
            <div
              className="rounded-2xl p-5 flex flex-col gap-5"
              style={{ border: `1px solid ${v("--c-border")}`, background: v("--c-card") }}
            >
              {/* Bahan */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Pilih Bahan
                </p>
                <div className="flex flex-wrap gap-2">
                  {specs.materials.map(m => (
                    <button
                      key={m}
                      onClick={() => setMaterial(m)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: material === m ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                        color: material === m ? "#fff" : v("--c-text-sec"),
                        border: `1px solid ${material === m ? "transparent" : v("--c-border")}`,
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finishing */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Finishing
                </p>
                <div className="flex flex-wrap gap-2">
                  {specs.finishings.map(f => (
                    <button
                      key={f}
                      onClick={() => setFinishing(f)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: finishing === f ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                        color: finishing === f ? "#fff" : v("--c-text-sec"),
                        border: `1px solid ${finishing === f ? "transparent" : v("--c-border")}`,
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ukuran */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Ukuran
                </p>
                <div className="flex gap-1 mb-3 p-1 rounded-xl" style={{ background: v("--c-bg-sec") }}>
                  {(["standard", "custom"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSizeMode(mode)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                      style={{
                        background: sizeMode === mode ? "var(--c-gradient-r)" : "transparent",
                        color: sizeMode === mode ? "#fff" : v("--c-text-sec"),
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {mode === "standard" ? "Standar" : "Custom"}
                    </button>
                  ))}
                </div>
                {sizeMode === "standard" ? (
                  <div className="flex flex-wrap gap-2">
                    {specs.sizes.filter(s => s.id !== "custom").map(sz => (
                      <button
                        key={sz.id}
                        onClick={() => setSelectedSz(sz)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: selectedSz.id === sz.id ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                          color: selectedSz.id === sz.id ? "#fff" : v("--c-text-sec"),
                          border: `1px solid ${selectedSz.id === sz.id ? "transparent" : v("--c-border")}`,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Lebar (cm)</label>
                      <input
                        type="number"
                        value={customW}
                        onChange={e => setCustomW(e.target.value)}
                        className="w-24 py-2 px-3 rounded-xl outline-none text-sm text-center"
                        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                    <span className="mt-5" style={{ color: v("--c-text-sec") }}>×</span>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tinggi (cm)</label>
                      <input
                        type="number"
                        value={customH}
                        onChange={e => setCustomH(e.target.value)}
                        className="w-24 py-2 px-3 rounded-xl outline-none text-sm text-center"
                        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                    <span className="text-xs mt-5 font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
                      {parseInt(customW) > 0 && parseInt(customH) > 0
                        ? `${((parseInt(customW) * parseInt(customH)) / 10000).toFixed(2)} m²`
                        : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Qty */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Jumlah
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${v("--c-border")}` }}>
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center"
                      style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 h-9 text-center text-sm font-semibold outline-none"
                      style={{ background: v("--c-card"), color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                    />
                    <button
                      onClick={() => setQty(q => q + 1)}
                      className="w-9 h-9 flex items-center justify-center"
                      style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Min. 1 {specs.unit}
                  </span>
                </div>
              </div>

              {/* Design option */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  File Desain
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {([
                    ["own",     "Punya desain sendiri", "Gratis"],
                    ["request", "Butuh bantuan desain", "+Rp 50.000"],
                  ] as const).map(([mode, label, sub]) => (
                    <button
                      key={mode}
                      onClick={() => setDesignMode(mode)}
                      className="px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        border: `${designMode === mode ? "2px" : "1px"} solid ${designMode === mode ? v("--c-primary") : v("--c-border")}`,
                        background: designMode === mode ? `${v("--c-primary")}15` : v("--c-bg-sec"),
                      }}
                    >
                      <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                      <p className="text-xs" style={{ color: designMode === mode ? v("--c-primary") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{sub}</p>
                    </button>
                  ))}
                </div>
                {designMode === "own" && (
                  <label
                    className="flex flex-col items-center gap-2 py-4 rounded-xl cursor-pointer transition-all"
                    style={{ border: `2px dashed ${v("--c-border")}`, background: v("--c-bg-sec") }}
                  >
                    <input type="file" accept=".ai,.cdr,.pdf,.png,.jpg,.psd" onChange={handleFileUpload} className="hidden" />
                    <Upload size={20} style={{ color: v("--c-text-sec") }} />
                    {uploadedFile ? (
                      <p className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
                        <Check size={12} className="inline mr-1" /> {uploadedFile}
                      </p>
                    ) : (
                      <p className="text-xs text-center" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        Upload AI, CDR, PDF, PNG, JPG<br />
                        <span style={{ color: v("--c-primary") }}>Klik untuk pilih file</span>
                      </p>
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Estimasi info row */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <Clock size={14} style={{ color: v("--c-primary"), marginTop: 1 }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Estimasi</p>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>2–3 hari kerja</p>
                </div>
              </div>
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Ketersediaan</p>
                  <p className="text-xs" style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>Tersedia</p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  border: `1.5px solid ${addedToCart ? "#10B981" : v("--c-primary")}`,
                  color: addedToCart ? "#10B981" : v("--c-primary"),
                  fontFamily: "'Inter',sans-serif",
                  background: addedToCart ? "rgba(16,185,129,0.06)" : "transparent",
                }}
              >
                {addedToCart ? <><Check size={15} /> Ditambahkan!</> : <><ShoppingCart size={15} /> Keranjang</>}
              </button>
              <button
                onClick={handlePesan}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
                style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
              >
                Pesan Sekarang <ArrowRight size={14} />
              </button>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/081234567890?text=Halo, saya ingin memesan ${prod.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl text-xs font-semibold text-white"
              style={{ background: "#25D366", fontFamily: "'Inter',sans-serif", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}
            >
              <MessageCircle size={14} /> Tanya dulu via WhatsApp
            </a>
          </div>
        </div>

        {/* ── Tabs section ── */}
        <div>
          <div className="flex gap-0 mb-6 rounded-xl overflow-hidden" style={{ background: v("--c-bg-sec") }}>
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="flex-1 py-3 text-sm font-semibold transition-all"
                style={{
                  background: activeTab === i ? "var(--c-gradient-r)" : "transparent",
                  color: activeTab === i ? "#fff" : v("--c-text-sec"),
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Deskripsi */}
              {activeTab === 0 && (
                <div>
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 2 }}
                  >
                    {prod.longDesc}
                  </p>
                  {/* Related products */}
                  <div>
                    <p className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                      Produk Terkait
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {PRODUCTS.filter(p => p.category === prod.category && p.id !== prod.id).slice(0, 4).map(related => (
                        <Link
                          key={related.id}
                          to={`/produk/${related.id}`}
                          className="flex-shrink-0 rounded-xl overflow-hidden group"
                          style={{ width: 140, border: `1px solid ${v("--c-border")}`, background: v("--c-card") }}
                        >
                          <img src={related.image} alt={related.name} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" style={{ height: 80 }} />
                          <div className="p-2">
                            <p className="text-xs font-semibold truncate" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{related.name}</p>
                            <p className="text-xs" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>{related.minPrice}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Spesifikasi */}
              {activeTab === 1 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${v("--c-border")}` }}>
                  {[
                    ["Bahan Tersedia",  specs.materials.join(", ")],
                    ["Pilihan Finishing", specs.finishings.join(", ")],
                    ["Resolusi Cetak",  "1200 × 600 dpi"],
                    ["Mode Warna",      "CMYK"],
                    ["Format File",     "AI, CDR, PDF, PNG (min. 300dpi)"],
                    ["Bleed Area",      "3mm setiap sisi"],
                    ["Min. Order",      `1 ${specs.unit}`],
                    ["Estimasi Proses", "2–3 hari kerja"],
                  ].map(([key, val], i) => (
                    <div
                      key={key}
                      className="flex items-start"
                      style={{ borderBottom: i < 7 ? `1px solid ${v("--c-border")}` : "none", background: i % 2 === 0 ? "transparent" : v("--c-bg-sec") }}
                    >
                      <div className="px-5 py-3 w-40 flex-shrink-0">
                        <span className="text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{key}</span>
                      </div>
                      <div className="px-5 py-3 flex-1" style={{ borderLeft: `1px solid ${v("--c-border")}` }}>
                        <span className="text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Panduan File */}
              {activeTab === 2 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { point: "Resolusi minimal 300dpi",          tip: "Pastikan file resolusi cukup untuk hasil cetak tajam dan tidak blur." },
                    { point: "Mode warna harus CMYK",            tip: "Warna RGB akan otomatis dikonversi dan bisa berubah. Gunakan CMYK dari awal." },
                    { point: "Sertakan bleed 3mm tiap sisi",     tip: "Area bleed mencegah garis putih di tepi hasil cetak setelah dipotong." },
                    { point: "Font harus di-convert ke outline",  tip: "Simpan semua teks sebagai curve/outline agar tidak ada masalah font hilang." },
                    { point: "Format terbaik: PDF atau AI",       tip: "Format vector AI/CDR paling direkomendasikan. PNG/JPG minimal 300dpi." },
                    { point: "Cek nama file sebelum upload",      tip: "Gunakan nama file yang jelas, mis: 'BannerPromo_60x160_v2.pdf'." },
                  ].map(({ point, tip }) => (
                    <div key={point} className="rounded-xl p-4" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                      <div className="flex items-start gap-2 mb-1">
                        <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                        <p className="text-sm font-semibold" style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>{point}</p>
                      </div>
                      <p className="text-xs pl-5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Ulasan */}
              {activeTab === 3 && (
                <div>
                  <div
                    className="flex items-center gap-6 mb-6 p-5 rounded-2xl"
                    style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
                  >
                    <div className="text-center">
                      <p className="font-['Poppins',sans-serif] font-bold text-4xl" style={{ color: v("--c-primary") }}>4.9</p>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="#F59E0B" style={{ color: "#F59E0B" }} />)}
                      </div>
                      <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>324 ulasan</p>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3].map(n => (
                        <div key={n} className="flex items-center gap-2 mb-1">
                          <span className="text-xs w-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{n}</span>
                          <div className="flex-1 h-2 rounded-full" style={{ background: v("--c-bg-sec") }}>
                            <div className="h-2 rounded-full" style={{ width: n === 5 ? "78%" : n === 4 ? "16%" : "6%", background: "#F59E0B" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {REVIEWS.map((r, i) => (
                      <div key={i} className="rounded-xl p-4" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ background: "var(--c-gradient-r)" }}>
                              {r.name[0]}
                            </div>
                            <span className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{r.name}</span>
                          </div>
                          <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: r.rating }).map((_, si) => <Star key={si} size={10} fill="#F59E0B" style={{ color: "#F59E0B" }} />)}
                        </div>
                        <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}