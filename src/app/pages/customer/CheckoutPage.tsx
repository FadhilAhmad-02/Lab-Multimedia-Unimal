import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router";
import {
  ShoppingBag, Truck, CreditCard, CheckCircle, ChevronRight, ChevronLeft,
  Plus, Minus, MapPin, Copy, Upload, Clock, AlertCircle, X, Check,
  Package, Smartphone, Wallet, Building2, Landmark, Flag, Gift, Mail, Layers, Printer,
  Pencil, Ruler, Image as ImageIcon, FileText as FileIcon,
} from "lucide-react";
import { v } from "../../components/pageUtils";

/* ══════════════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════════════ */

const PROD_CATEGORIES = [
  { id: "banner",    label: "Spanduk & Banner", Icon: Flag,    color: "#7C3AED" },
  { id: "cetak",    label: "Cetak Digital",    Icon: Printer,  color: "var(--c-primary)" },
  { id: "souvenir", label: "Souvenir",         Icon: Gift,     color: "#DB2777" },
  { id: "packaging",label: "Packaging",        Icon: Package,  color: "#047857" },
  { id: "undangan", label: "Undangan",         Icon: Mail,     color: "#B45309" },
  { id: "finishing",label: "Finishing",        Icon: Layers,   color: "#DC2626" },
];

type ProductItem = { id: string; name: string; basePrice: number; unit: string };
type SizeItem    = { id: string; label: string; multiplier: number };

const PRODUCTS_MAP: Record<string, ProductItem[]> = {
  banner:    [
    { id: "b1", name: "Banner Vinyl Premium",       basePrice: 20000, unit: "m²" },
    { id: "b2", name: "Spanduk Kain",               basePrice: 15000, unit: "m²" },
    { id: "b3", name: "X-Banner 60×160 cm",         basePrice: 85000, unit: "pcs" },
  ],
  cetak:    [
    { id: "c1", name: "Brosur A5",                  basePrice: 800,   unit: "lbr" },
    { id: "c2", name: "Kartu Nama Laminasi UV",      basePrice: 350,   unit: "lbr" },
    { id: "c3", name: "Poster A3",                  basePrice: 1500,  unit: "lbr" },
  ],
  souvenir: [
    { id: "s1", name: "Mug Custom Sublimasi",        basePrice: 25000, unit: "pcs" },
    { id: "s2", name: "Tumbler Custom",              basePrice: 45000, unit: "pcs" },
    { id: "s3", name: "Topi Custom Bordir",          basePrice: 35000, unit: "pcs" },
  ],
  packaging:[
    { id: "p1", name: "Paper Bag Kraft",             basePrice: 3500,  unit: "pcs" },
    { id: "p2", name: "Box Kemasan Custom",          basePrice: 5000,  unit: "pcs" },
    { id: "p3", name: "Label / Stiker Produk",       basePrice: 1200,  unit: "pcs" },
  ],
  undangan: [
    { id: "u1", name: "Undangan Pernikahan Hard Cover", basePrice: 5000, unit: "pcs" },
    { id: "u2", name: "Undangan Digital Print",         basePrice: 2500, unit: "pcs" },
  ],
  finishing:[
    { id: "f1", name: "Laminasi Glossy / Doff",     basePrice: 3000,  unit: "lbr" },
    { id: "f2", name: "Spot UV",                    basePrice: 4500,  unit: "lbr" },
  ],
};

const SIZES_MAP: Record<string, SizeItem[]> = {
  banner:    [
    { id: "60x160",  label: "60×160 cm",   multiplier: 0.96 },
    { id: "100x200", label: "100×200 cm",  multiplier: 2.0 },
    { id: "150x300", label: "150×300 cm",  multiplier: 4.5 },
    { id: "200x400", label: "200×400 cm",  multiplier: 8.0 },
    { id: "custom",  label: "Custom",       multiplier: 1.0 },
  ],
  cetak:    [
    { id: "a6", label: "A6 (10×15 cm)", multiplier: 1.0 },
    { id: "a5", label: "A5 (15×21 cm)", multiplier: 1.5 },
    { id: "a4", label: "A4 (21×30 cm)", multiplier: 2.0 },
    { id: "a3", label: "A3 (30×42 cm)", multiplier: 3.5 },
    { id: "custom", label: "Custom",    multiplier: 1.0 },
  ],
  souvenir: [{ id: "std", label: "Standar",               multiplier: 1.0 }],
  packaging:[
    { id: "s", label: "Small (10×10 cm)", multiplier: 1.0 },
    { id: "m", label: "Medium (20×20 cm)",multiplier: 1.5 },
    { id: "l", label: "Large (30×30 cm)", multiplier: 2.0 },
  ],
  undangan: [
    { id: "std", label: "Standar (10×21 cm)",  multiplier: 1.0 },
    { id: "sqr", label: "Square (15×15 cm)",   multiplier: 1.3 },
  ],
  finishing:[
    { id: "a4", label: "A4", multiplier: 1.0 },
    { id: "a3", label: "A3", multiplier: 1.8 },
  ],
};

const ADDRESSES = [
  { id: "a1", name: "Rumah Utama", detail: "Jl. Merdeka No. 12, Lhokseumawe, Aceh Utara 24300", default: true },
  { id: "a2", name: "Kantor",      detail: "Jl. Veteran No. 5, Banda Aceh, Aceh 23111",          default: false },
];

const COURIERS = [
  { id: "jne",    name: "JNE Reguler",   days: "2–3 hari",   price: 15000 },
  { id: "jt",     name: "J&T Express",   days: "1–2 hari",   price: 18000 },
  { id: "sicepat",name: "SiCepat",       days: "1 hari",     price: 22000 },
  { id: "toko",   name: "Kurir Toko",    days: "1–3 hari",   price: 10000 },
  { id: "pickup", name: "Ambil Sendiri", days: "Kapan saja", price: 0 },
];

const PAYMENT_METHODS = [
  { id: "qris",       group: "auto",   label: "QRIS",                  Icon: Smartphone, desc: "Scan & bayar dengan app apapun",      color: "var(--c-primary)" },
  { id: "gopay",      group: "auto",   label: "GoPay",                 Icon: Wallet,     desc: "Bayar langsung via GoPay",            color: "#00AA5B" },
  { id: "ovo",        group: "auto",   label: "OVO",                   Icon: Wallet,     desc: "Bayar langsung via OVO",              color: "#4C3494" },
  { id: "va_bca",     group: "auto",   label: "Virtual Account BCA",   Icon: Building2,  desc: "Transfer ke nomor virtual BCA",       color: "#1E5FA8" },
  { id: "va_bni",     group: "auto",   label: "Virtual Account BNI",   Icon: Landmark,   desc: "Transfer ke nomor virtual BNI",       color: "#F77F00" },
  { id: "tf_bca",     group: "manual", label: "Transfer BCA",          Icon: Building2,  desc: "Nomor Rek: 8230-111-222-333",         color: "#1E5FA8" },
  { id: "tf_mandiri", group: "manual", label: "Transfer Mandiri",      Icon: Landmark,   desc: "Nomor Rek: 1380-555-666-777",         color: "var(--c-primary)" },
];

const CHECKOUT_STEPS = ["Spesifikasi", "Pengiriman", "Pembayaran", "Proses Bayar"];
const STEP_ICONS     = [Package, Truck, CreditCard, Smartphone];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */

function fmt(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }
function getProducts(cat: string): ProductItem[] { return PRODUCTS_MAP[cat] ?? []; }
function getSizes(cat: string): SizeItem[]        { return SIZES_MAP[cat]    ?? []; }

/* ══════════════════════════════════════════════════════════════
   PREFILL TYPE (data passed from ProdukDetailPage)
══════════════════════════════════════════════════════════════ */

interface Prefill {
  productId:         string;
  productName:       string;
  productImage:      string;
  category:          string;
  description:       string;
  checkoutCat:       string;
  checkoutProductId: string;
  material:          string;
  finishing:         string;
  sizeLabel:         string;
  sizeId:            string;
  customW:           number;
  customH:           number;
  designMode:        "own" | "request";
  uploadedFile:      string | null;
  qty:               number;
  unit:              string;
  estimatedPrice:    number;
  specsDisplay:      string;
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT PREVIEW CARD
   Shown at top of Step 0 when arriving from ProdukDetailPage
══════════════════════════════════════════════════════════════ */

function ProductPreviewCard({ prefill, onEdit }: { prefill: Prefill; onEdit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden mb-5"
      style={{ border: "2px solid rgba(46,125,50,0.3)", boxShadow: "0 4px 20px rgba(46,125,50,0.12)", background: v("--c-card") }}
    >
      {/* Header strip */}
      <div className="px-5 py-2.5 flex items-center justify-between" style={{ background: "var(--c-gradient-r)" }}>
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-white" />
          <span className="text-xs font-bold text-white" style={{ fontFamily: "'Inter',sans-serif" }}>Produk Dipilih</span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontFamily: "'Inter',sans-serif" }}
        >
          <Pencil size={10} /> Ubah Produk
        </button>
      </div>

      {/* Product info */}
      <div className="p-5">
        <div className="flex gap-4">
          <img
            src={prefill.productImage}
            alt={prefill.productName}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            onError={e => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/80x80/e8f5e9/2E7D32?text=P"; }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1"
                  style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
                >
                  {prefill.category}
                </span>
                <h3 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "1rem", color: v("--c-text") }}>
                  {prefill.productName}
                </h3>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Estimasi</p>
                <p className="font-['Poppins',sans-serif] font-bold" style={{ color: v("--c-primary"), fontSize: "1.1rem" }}>
                  {fmt(prefill.estimatedPrice)}
                </p>
              </div>
            </div>
            <p className="text-xs mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
              {prefill.description}
            </p>

            {/* Spec chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { Icon: Layers,   label: prefill.material },
                { Icon: FileIcon, label: prefill.finishing },
                { Icon: Ruler,    label: prefill.sizeLabel },
                { Icon: Package,  label: `${prefill.qty} ${prefill.unit}` },
                { Icon: ImageIcon,label: prefill.designMode === "own" ? "File Sendiri" : "Dibantu Desain" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                >
                  <Icon size={10} style={{ color: v("--c-primary") }} /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FAKE QR CODE
══════════════════════════════════════════════════════════════ */

function QRCode({ size = 180 }: { size?: number }) {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,1,1],
    [0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],
    [1,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0,0,1,0,1,0],
    [0,0,1,1,0,1,0,0,0,1,0,0,1,1,0,1,1,0,1,0,0],
    [1,0,1,0,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,0,0,1,0,1,0,1,0],
    [1,0,0,0,0,0,1,1,1,0,0,1,0,1,1,0,1,0,0,1,1],
    [1,1,1,1,1,1,1,0,1,1,0,0,1,0,1,1,0,1,1,0,1],
  ];
  const cell = size / 21;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" rx={8} />
      {pattern.map((row, ri) => row.map((on, ci) =>
        on ? <rect key={`${ri}-${ci}`} x={ci*cell} y={ri*cell} width={cell-0.5} height={cell-0.5} fill="#0F172A" rx={1} /> : null
      ))}
    </svg>
  );
}

/* ── Payment countdown ──────────────────────────────────────── */
function PaymentCountdown({ minutes = 15 }: { minutes?: number }) {
  const [secs, setSecs] = useState(minutes * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(secs / 60).toString().padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  const expired = secs === 0;
  return (
    <div className="flex items-center gap-2">
      <Clock size={14} style={{ color: expired ? "#EF4444" : "var(--c-accent)" }} />
      <span className="font-['JetBrains_Mono',monospace] font-bold text-lg" style={{ color: expired ? "#EF4444" : "var(--c-accent)" }}>
        {mm}:{ss}
      </span>
      <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
        {expired ? "Waktu habis" : "tersisa"}
      </span>
    </div>
  );
}

/* ── Copy button ─────────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
      style={{ background: copied ? "rgba(16,185,129,0.1)" : "rgba(46,125,50,0.1)", color: copied ? "#10B981" : "var(--c-primary)", fontFamily: "'Inter',sans-serif" }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Tersalin!" : "Salin"}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   ORDER DATA TYPE
══════════════════════════════════════════════════════════════ */

interface OrderData {
  category:  string;
  productId: string;
  sizeId:    string;
  qty:       number;
  customW:   number;
  customH:   number;
  notes:     string;
  addressId: string;
  courierId: string;
  paymentId: string;
}

const DEFAULT_ORDER: OrderData = {
  category: "", productId: "", sizeId: "", qty: 1,
  customW: 0, customH: 0, notes: "",
  addressId: "a1", courierId: "jne",
  paymentId: "",
};

/* ══════════════════════════════════════════════════════════════
   STEP 0 — SPESIFIKASI
══════════════════════════════════════════════════════════════ */

function StepSpesifikasi({
  onNext, orderData, setOrderData, prefill,
}: {
  onNext: () => void;
  orderData: OrderData;
  setOrderData: (d: Partial<OrderData>) => void;
  prefill: Prefill | null;
}) {
  const products = getProducts(orderData.category);
  const sizes    = getSizes(orderData.category);
  const selProd  = products.find(p => p.id === orderData.productId) ?? null;
  const selSize  = sizes.find(s => s.id === orderData.sizeId) ?? null;

  const canContinue = prefill
    ? true
    : orderData.category !== "" && orderData.productId !== "" && orderData.sizeId !== "" && orderData.qty >= 1;

  const unitPrice     = selProd ? selProd.basePrice * (selSize?.multiplier ?? 1) : 0;
  const estimatePrice = prefill ? prefill.estimatedPrice : unitPrice * orderData.qty;

  return (
    <div className="flex flex-col gap-7">

      {/* ── PRE-FILLED MODE ── */}
      {prefill ? (
        <div
          className="rounded-2xl p-5"
          style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
        >
          <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>
            Konfirmasi Jumlah & Catatan
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Jumlah ({prefill.unit})
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1.5px solid ${v("--c-border")}` }}>
                  <button onClick={() => setOrderData({ qty: Math.max(1, orderData.qty - 1) })}
                    className="w-11 h-11 flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                    <Minus size={15} />
                  </button>
                  <div className="w-14 h-11 flex items-center justify-center font-['Poppins',sans-serif] font-bold"
                    style={{ color: v("--c-text"), background: v("--c-card") }}>
                    {orderData.qty}
                  </div>
                  <button onClick={() => setOrderData({ qty: orderData.qty + 1 })}
                    className="w-11 h-11 flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                    <Plus size={15} />
                  </button>
                </div>
                <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Min. 1 {prefill.unit}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Catatan Tambahan (opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Misal: Tolong tambahkan logo perusahaan di pojok kanan bawah…"
                className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                value={orderData.notes}
                onChange={e => setOrderData({ notes: e.target.value })}
              />
            </div>
          </div>

          {/* Price summary */}
          <div
            className="mt-4 p-4 rounded-2xl"
            style={{ background: "rgba(46,125,50,0.06)", border: "1.5px solid rgba(46,125,50,0.18)" }}
          >
            <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Estimasi Total</p>
            <p className="font-['Poppins',sans-serif] font-bold text-2xl" style={{ color: v("--c-primary") }}>
              {fmt(prefill.estimatedPrice)}
            </p>
            <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              {prefill.productName} · {prefill.specsDisplay} · {orderData.qty}×
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── NORMAL FLOW ── */}

          {/* 1. Kategori */}
          <div>
            <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>
              1. Pilih Jenis Produk
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROD_CATEGORIES.map(cat => {
                const active = orderData.category === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setOrderData({ category: cat.id, productId: "", sizeId: "", qty: 1 })}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 font-semibold text-sm"
                    style={{
                      borderColor: active ? cat.color : v("--c-border"),
                      background: active ? `${cat.color}18` : v("--c-card"),
                      color: active ? cat.color : v("--c-text-sec"),
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    <cat.Icon size={18} aria-hidden="true" />
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 2. Produk */}
          <AnimatePresence>
            {orderData.category !== "" && products.length > 0 && (
              <motion.div key="products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>
                  2. Pilih Produk
                </h3>
                <div className="flex flex-col gap-2">
                  {products.map(p => {
                    const active = orderData.productId === p.id;
                    return (
                      <label
                        key={p.id}
                        className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
                        style={{
                          borderColor: active ? v("--c-primary") : v("--c-border"),
                          background: active ? "rgba(46,125,50,0.06)" : v("--c-card"),
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="product"
                            checked={active}
                            onChange={() => setOrderData({ productId: p.id, sizeId: "", qty: 1 })}
                            style={{ accentColor: v("--c-primary") }}
                          />
                          <span className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                            {p.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                          ab {fmt(p.basePrice)}/{p.unit}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Ukuran */}
          <AnimatePresence>
            {orderData.productId !== "" && sizes.length > 0 && (
              <motion.div key="sizes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>
                  3. Pilih Ukuran
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(sz => {
                    const active = orderData.sizeId === sz.id;
                    return (
                      <motion.button
                        key={sz.id}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setOrderData({ sizeId: sz.id })}
                        className="px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200"
                        style={{
                          borderColor: active ? v("--c-primary") : v("--c-border"),
                          background: active ? "rgba(46,125,50,0.08)" : v("--c-card"),
                          color: active ? v("--c-primary") : v("--c-text-sec"),
                          fontFamily: "'Inter',sans-serif",
                        }}
                      >
                        {sz.label}
                      </motion.button>
                    );
                  })}
                </div>
                {orderData.sizeId === "custom" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-3 flex-wrap">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Lebar (cm)</label>
                      <input type="number" min={1} placeholder="120"
                        className="w-24 px-3 py-2.5 rounded-xl outline-none text-sm"
                        style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text") }}
                        value={orderData.customW || ""}
                        onChange={e => setOrderData({ customW: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <X size={14} className="mt-5 flex-shrink-0" style={{ color: v("--c-text-sec") }} />
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tinggi (cm)</label>
                      <input type="number" min={1} placeholder="200"
                        className="w-24 px-3 py-2.5 rounded-xl outline-none text-sm"
                        style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text") }}
                        value={orderData.customH || ""}
                        onChange={e => setOrderData({ customH: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    {orderData.customW > 0 && orderData.customH > 0 && (
                      <span className="mt-5 text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                        = {((orderData.customW * orderData.customH) / 10000).toFixed(2)} m²
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. Jumlah */}
          <AnimatePresence>
            {orderData.sizeId !== "" && (
              <motion.div key="qty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>
                  4. Jumlah Pesanan
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1.5px solid ${v("--c-border")}` }}>
                    <button onClick={() => setOrderData({ qty: Math.max(1, orderData.qty - 1) })}
                      className="w-11 h-11 flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                      <Minus size={15} />
                    </button>
                    <div className="w-14 h-11 flex items-center justify-center font-['Poppins',sans-serif] font-bold"
                      style={{ color: v("--c-text"), background: v("--c-card") }}>
                      {orderData.qty}
                    </div>
                    <button onClick={() => setOrderData({ qty: orderData.qty + 1 })}
                      className="w-11 h-11 flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Min. 1 {selProd?.unit ?? "pcs"}
                  </span>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Catatan (opsional)
                  </label>
                  <textarea rows={3} placeholder="Misal: Tolong tambahkan logo perusahaan di pojok kanan bawah…"
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                    style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                    value={orderData.notes}
                    onChange={e => setOrderData({ notes: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price preview */}
          <AnimatePresence>
            {estimatePrice > 0 && (
              <motion.div key="price" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl"
                style={{ background: "rgba(46,125,50,0.06)", border: "1.5px solid rgba(46,125,50,0.18)" }}>
                <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Estimasi Harga</p>
                <p className="font-['Poppins',sans-serif] font-bold text-2xl" style={{ color: v("--c-primary") }}>{fmt(estimatePrice)}</p>
                <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  {selProd?.name} · {selSize?.label} · {orderData.qty}×
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <button
        disabled={!canContinue}
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-200"
        style={{
          background: canContinue ? "var(--c-gradient-r)" : v("--c-border"),
          fontFamily: "'Inter',sans-serif",
          cursor: canContinue ? "pointer" : "not-allowed",
          boxShadow: canContinue ? "0 8px 25px rgba(46,125,50,0.3)" : "none",
        }}
      >
        Lanjut ke Pengiriman <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 1 — PENGIRIMAN
══════════════════════════════════════════════════════════════ */

function StepPengiriman({
  onNext, onBack, orderData, setOrderData,
}: {
  onNext: () => void; onBack: () => void;
  orderData: OrderData; setOrderData: (d: Partial<OrderData>) => void;
}) {
  const canContinue = orderData.addressId !== "" && orderData.courierId !== "";
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>Alamat Pengiriman</h3>
        <div className="flex flex-col gap-3 mb-3">
          {ADDRESSES.map(addr => {
            const active = orderData.addressId === addr.id;
            return (
              <label key={addr.id} className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                style={{ border: `${active ? "2px" : "1px"} solid ${active ? v("--c-primary") : v("--c-border")}`, background: active ? "rgba(46,125,50,0.05)" : v("--c-card") }}>
                <input type="radio" checked={active} onChange={() => setOrderData({ addressId: addr.id })} style={{ accentColor: v("--c-primary"), marginTop: 2 }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={13} style={{ color: v("--c-primary") }} />
                    <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{addr.name}</p>
                    {addr.default && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Utama</span>}
                  </div>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>{addr.detail}</p>
                </div>
              </label>
            );
          })}
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
          <Plus size={14} /> Tambah Alamat Baru
        </button>
      </div>

      <div>
        <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>Metode Pengiriman</h3>
        <div className="flex flex-col gap-2">
          {COURIERS.map(c => {
            const active = orderData.courierId === c.id;
            return (
              <label key={c.id} className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                style={{ border: `${active ? "2px" : "1px"} solid ${active ? v("--c-primary") : v("--c-border")}`, background: active ? "rgba(46,125,50,0.05)" : v("--c-card") }}>
                <input type="radio" checked={active} onChange={() => setOrderData({ courierId: c.id })} style={{ accentColor: v("--c-primary") }} />
                <Truck size={15} style={{ color: active ? v("--c-primary") : v("--c-text-sec") }} />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Estimasi {c.days}</p>
                </div>
                <span className="font-bold text-sm" style={{ color: c.price === 0 ? "#10B981" : v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                  {c.price === 0 ? "GRATIS" : fmt(c.price)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2"
          style={{ border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
          <ChevronLeft size={14} /> Kembali
        </button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext} disabled={!canContinue}
          className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: canContinue ? "var(--c-gradient-r)" : v("--c-border"), fontFamily: "'Inter',sans-serif" }}>
          Pilih Pembayaran <ChevronRight size={14} />
        </motion.button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 2 — METODE PEMBAYARAN
══════════════════════════════════════════════════════════════ */

function StepPilihPembayaran({
  onNext, onBack, orderData, setOrderData,
}: {
  onNext: () => void; onBack: () => void;
  orderData: OrderData; setOrderData: (d: Partial<OrderData>) => void;
}) {
  const autoMethods   = PAYMENT_METHODS.filter(p => p.group === "auto");
  const manualMethods = PAYMENT_METHODS.filter(p => p.group === "manual");

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Bayar Otomatis (Instan)</p>
        <div className="flex flex-col gap-2">
          {autoMethods.map(pm => {
            const active = orderData.paymentId === pm.id;
            return (
              <label key={pm.id} className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ border: `${active ? "2px" : "1px"} solid ${active ? pm.color : v("--c-border")}`, background: active ? `${pm.color}12` : v("--c-card") }}>
                <input type="radio" name="payment" checked={active} onChange={() => setOrderData({ paymentId: pm.id })} style={{ accentColor: pm.color }} />
                <pm.Icon size={22} style={{ color: pm.color, flexShrink: 0 }} aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{pm.label}</p>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{pm.desc}</p>
                </div>
                {active && <Check size={16} style={{ color: pm.color }} />}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Transfer Manual</p>
        <div className="flex flex-col gap-2">
          {manualMethods.map(pm => {
            const active = orderData.paymentId === pm.id;
            return (
              <label key={pm.id} className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ border: `${active ? "2px" : "1px"} solid ${active ? pm.color : v("--c-border")}`, background: active ? `${pm.color}12` : v("--c-card") }}>
                <input type="radio" name="payment" checked={active} onChange={() => setOrderData({ paymentId: pm.id })} style={{ accentColor: pm.color }} />
                <pm.Icon size={22} style={{ color: pm.color, flexShrink: 0 }} aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{pm.label}</p>
                  <p className="text-xs font-mono" style={{ color: v("--c-text-sec") }}>{pm.desc}</p>
                </div>
                {active && <Check size={16} style={{ color: pm.color }} />}
              </label>
            );
          })}
        </div>
        <p className="text-xs mt-3 p-3 rounded-xl" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          Transfer manual membutuhkan konfirmasi dari tim kami (maks. 2×24 jam kerja).
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2"
          style={{ border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
          <ChevronLeft size={14} /> Kembali
        </button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext} disabled={orderData.paymentId === ""}
          className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: orderData.paymentId !== "" ? "var(--c-gradient-r)" : v("--c-border"), fontFamily: "'Inter',sans-serif" }}>
          Lanjut Bayar <ChevronRight size={14} />
        </motion.button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 3 — PROSES BAYAR
══════════════════════════════════════════════════════════════ */

function StepProsesBayar({
  onSuccess, onBack, orderData, total,
}: {
  onSuccess: () => void; onBack: () => void;
  orderData: OrderData; total: number;
}) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1800));
    onSuccess();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadFile(file);
  };

  const ConfirmBtn = ({ disabled = false, label = "Saya Sudah Bayar", color = "var(--c-gradient-r)" }) => (
    <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={disabled || confirming}
      className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
      style={{ background: disabled ? v("--c-border") : color, fontFamily: "'Inter',sans-serif", cursor: disabled ? "not-allowed" : "pointer" }}>
      {confirming
        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memverifikasi...</>
        : <><Check size={15} /> {label}</>}
    </motion.button>
  );

  const BackBtn = () => (
    <button onClick={onBack} className="w-full text-sm text-center" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
      ← Ganti metode pembayaran
    </button>
  );

  const OrderBadge = () => (
    <div className="text-center mb-2">
      <span className="px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", fontFamily: "'Inter',sans-serif" }}>
        Pesanan dibuat — #ORD-2025-0049
      </span>
    </div>
  );

  /* QRIS */
  if (orderData.paymentId === "qris") return (
    <div className="flex flex-col items-center gap-6">
      <OrderBadge />
      <div className="text-center">
        <h3 className="font-['Poppins',sans-serif] font-bold mb-1" style={{ color: v("--c-text"), fontSize: "1.3rem" }}>Scan QR Code untuk Membayar</h3>
        <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Gunakan app apapun (GoPay, OVO, DANA, dll.)</p>
      </div>
      <div className="p-6 rounded-3xl flex flex-col items-center gap-4" style={{ background: v("--c-card"), border: "2px solid rgba(46,125,50,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <QRCode size={200} />
        <div className="text-center">
          <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Total Pembayaran</p>
          <p className="font-['Poppins',sans-serif] font-bold text-3xl" style={{ color: v("--c-primary") }}>{fmt(total)}</p>
        </div>
        <div className="w-full p-3 rounded-xl flex items-center justify-between" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
          <div className="flex items-center gap-2"><AlertCircle size={14} style={{ color: "var(--c-accent)" }} /><span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Batas waktu:</span></div>
          <PaymentCountdown minutes={15} />
        </div>
      </div>
      {["Buka app e-wallet atau m-banking", "Pilih menu \"Scan QR\" atau \"QRIS\"", "Arahkan kamera ke QR di atas", "Masukkan nominal & konfirmasi"].map((s, i) => (
        <div key={i} className="flex items-center gap-3 w-full">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "var(--c-gradient-r)" }}>{i + 1}</span>
          <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{s}</p>
        </div>
      ))}
      <ConfirmBtn color="#25D366" />
      <BackBtn />
    </div>
  );

  /* GoPay / OVO */
  if (orderData.paymentId === "gopay" || orderData.paymentId === "ovo") {
    const isGopay = orderData.paymentId === "gopay";
    const bg = isGopay ? "#00AA5B" : "#4C3494";
    const label = isGopay ? "GoPay" : "OVO";
    return (
      <div className="flex flex-col items-center gap-6">
        <OrderBadge />
        <div className="w-full p-6 rounded-3xl flex flex-col items-center gap-5" style={{ background: v("--c-card"), border: `2px solid ${bg}30` }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: `${bg}15`, border: `3px solid ${bg}` }}>
            {isGopay ? "💚" : "💜"}
          </div>
          <div className="text-center">
            <p className="text-sm mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Total Pembayaran</p>
            <p className="font-['Poppins',sans-serif] font-bold text-3xl" style={{ color: v("--c-primary") }}>{fmt(total)}</p>
          </div>
          <div className="w-full flex items-center justify-between p-3 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
            <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Batas waktu:</span>
            <PaymentCountdown minutes={10} />
          </div>
          <ConfirmBtn label={`Bayar dengan ${label} →`} color={bg} />
        </div>
        <BackBtn />
      </div>
    );
  }

  /* Virtual Account */
  if (orderData.paymentId === "va_bca" || orderData.paymentId === "va_bni") {
    const isBCA  = orderData.paymentId === "va_bca";
    const bank   = isBCA ? "BCA"  : "BNI";
    const vaNum  = isBCA ? "8230-9999-1234-5678" : "8888-0001-2345-6789";
    const color  = isBCA ? "#1E5FA8" : "#F77F00";
    return (
      <div className="flex flex-col gap-5">
        <OrderBadge />
        <h3 className="font-['Poppins',sans-serif] font-bold text-center" style={{ color: v("--c-text"), fontSize: "1.2rem" }}>Transfer ke Virtual Account {bank}</h3>
        <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: v("--c-card"), border: `2px solid ${color}30` }}>
          <div className="p-4 rounded-2xl" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
            <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nomor VA {bank}</p>
            <div className="flex items-center justify-between gap-3">
              <p className="font-['JetBrains_Mono',monospace] font-bold text-xl" style={{ color }}>{vaNum}</p>
              <CopyBtn text={vaNum.replace(/-/g, "")} />
            </div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
            <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Jumlah Transfer (tepat)</p>
            <div className="flex items-center justify-between gap-3">
              <p className="font-['Poppins',sans-serif] font-bold text-2xl" style={{ color: v("--c-primary") }}>{fmt(total)}</p>
              <CopyBtn text={String(total)} />
            </div>
            <p className="text-xs mt-1" style={{ color: "#F97316", fontFamily: "'Inter',sans-serif" }}>Transfer TEPAT sesuai nominal di atas</p>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
            <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Batas waktu:</span>
            <PaymentCountdown minutes={60} />
          </div>
        </div>
        {[`Buka m-banking atau ATM ${bank}`, "Pilih Transfer → Virtual Account", `Masukkan VA: ${vaNum}`, `Masukkan nominal tepat: ${fmt(total)}`, "Konfirmasi & selesaikan"].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: color }}>{i + 1}</span>
            <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{s}</p>
          </div>
        ))}
        <ConfirmBtn />
        <BackBtn />
      </div>
    );
  }

  /* Transfer Manual */
  const manualMap: Record<string, { bank: string; norek: string; color: string }> = {
    tf_bca:     { bank: "BCA",     norek: "8230-111-222-333", color: "#1E5FA8" },
    tf_mandiri: { bank: "Mandiri", norek: "1380-555-666-777", color: "var(--c-primary)" },
  };
  const info = manualMap[orderData.paymentId] ?? manualMap["tf_bca"];

  return (
    <div className="flex flex-col gap-5">
      <OrderBadge />
      <h3 className="font-['Poppins',sans-serif] font-bold text-center" style={{ color: v("--c-text"), fontSize: "1.2rem" }}>
        Transfer Manual ke {info.bank}
      </h3>
      <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: v("--c-card"), border: `2px solid ${info.color}30` }}>
        <div className="p-4 rounded-2xl" style={{ background: `${info.color}10`, border: `1px solid ${info.color}30` }}>
          <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nomor Rekening {info.bank}</p>
          <div className="flex items-center justify-between">
            <p className="font-['JetBrains_Mono',monospace] font-bold text-lg" style={{ color: info.color }}>{info.norek}</p>
            <CopyBtn text={info.norek.replace(/-/g, "")} />
          </div>
          <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>a.n. PT Malikussaleh Advertising</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
          <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nominal Transfer</p>
          <div className="flex items-center justify-between">
            <p className="font-['Poppins',sans-serif] font-bold text-2xl" style={{ color: v("--c-primary") }}>{fmt(total)}</p>
            <CopyBtn text={String(total)} />
          </div>
        </div>
      </div>

      {/* Upload bukti */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
          Upload Bukti Transfer <span style={{ color: "#EF4444" }}>*</span>
        </p>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="rounded-2xl border-2 border-dashed p-6 text-center transition-all"
          style={{ borderColor: dragOver ? v("--c-primary") : v("--c-border"), background: dragOver ? "rgba(46,125,50,0.04)" : v("--c-card") }}
        >
          {uploadFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}><Check size={18} style={{ color: "#10B981" }} /></div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{uploadFile.name}</p>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{(uploadFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => setUploadFile(null)} style={{ color: v("--c-text-sec") }}><X size={16} /></button>
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto mb-2" style={{ color: v("--c-text-sec") }} />
              <p className="text-sm font-semibold mb-1" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Drag & drop bukti transfer</p>
              <p className="text-xs mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>JPG, PNG, atau PDF (maks 5MB)</p>
              <label className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
                Pilih File
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) setUploadFile(f); }} />
              </label>
            </>
          )}
        </div>
      </div>

      <ConfirmBtn disabled={!uploadFile} label="Kirim Bukti Transfer" />
      <BackBtn />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN CHECKOUT PAGE
══════════════════════════════════════════════════════════════ */

export function CheckoutPage() {
  const location = useLocation();
  const prefill  = (location.state as { prefill?: Prefill } | null)?.prefill ?? null;

  const [step,    setStep]    = useState(0);
  const [success, setSuccess] = useState(false);

  const [orderData, setOrderDataState] = useState<OrderData>(() => {
    if (prefill) {
      return {
        ...DEFAULT_ORDER,
        category:  prefill.checkoutCat,
        productId: prefill.checkoutProductId,
        sizeId:    prefill.sizeId,
        customW:   prefill.customW,
        customH:   prefill.customH,
        qty:       prefill.qty,
      };
    }
    return { ...DEFAULT_ORDER };
  });

  const setOrderData = (partial: Partial<OrderData>) =>
    setOrderDataState(prev => ({ ...prev, ...partial }));

  /* Totals */
  const products       = getProducts(orderData.category);
  const sizes          = getSizes(orderData.category);
  const selectedProd   = products.find(p => p.id === orderData.productId) ?? null;
  const selectedSize   = sizes.find(s => s.id === orderData.sizeId) ?? null;
  const selectedCour   = COURIERS.find(c => c.id === orderData.courierId) ?? null;
  const selectedPay    = PAYMENT_METHODS.find(p => p.id === orderData.paymentId) ?? null;

  const prodTotal  = prefill
    ? prefill.estimatedPrice
    : selectedProd ? selectedProd.basePrice * (selectedSize?.multiplier ?? 1) * orderData.qty : 0;
  const ongkir     = selectedCour?.price ?? 0;
  const grandTotal = prodTotal + ongkir;

  /* SUCCESS */
  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center gap-6 theme-aware" style={{ background: v("--c-bg") }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
        className="w-32 h-32 rounded-full flex items-center justify-center relative"
        style={{ background: "rgba(16,185,129,0.1)", border: "4px solid #10B981" }}>
        <CheckCircle size={60} style={{ color: "#10B981" }} />
        <motion.div className="absolute inset-0 rounded-full" animate={{ scale: [1, 1.5, 1.8], opacity: [0.4, 0.2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }} style={{ border: "2px solid #10B981" }} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h1 className="font-['Poppins',sans-serif] font-bold text-3xl mb-2" style={{ color: v("--c-text") }}>Pesanan Berhasil!</h1>
        <p className="text-sm mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          {selectedPay?.group === "manual"
            ? "Tim kami akan memverifikasi pembayaran Anda dalam 1×24 jam."
            : "Pembayaran dikonfirmasi. Tim kami segera memproses pesanan Anda."}
        </p>
        <div className="inline-block px-6 py-4 rounded-2xl mb-6" style={{ background: "rgba(46,125,50,0.08)", border: "1.5px solid rgba(46,125,50,0.2)" }}>
          <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nomor Pesanan</p>
          <p className="font-['JetBrains_Mono',monospace] font-bold text-xl" style={{ color: v("--c-primary") }}>ORD-2025-0049</p>
        </div>
        <div className="text-left rounded-2xl p-4 mb-6 max-w-sm mx-auto" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          {[
            ["Produk",     prefill?.productName ?? selectedProd?.name ?? "-"],
            ["Ukuran",     prefill?.sizeLabel   ?? selectedSize?.label ?? "-"],
            ["Qty",        `${orderData.qty}×`],
            ["Pengiriman", selectedCour?.name   ?? "-"],
            ["Pembayaran", selectedPay?.label   ?? "-"],
            ["Total",      fmt(grandTotal)],
          ].map(([k, val]) => (
            <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{k}</span>
              <span className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pesanan" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm text-white"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
            <ShoppingBag size={15} /> Lihat Pesanan Saya
          </Link>
          <Link to="/produk" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl font-semibold text-sm"
            style={{ border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
            Lanjut Belanja
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-24 pb-20">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          {prefill && (
            <>
              <Link to="/produk" style={{ color: v("--c-text-sec") }}>Produk</Link>
              <ChevronRight size={12} />
              <Link to={`/produk/${prefill.productId}`} style={{ color: v("--c-text-sec") }}>{prefill.productName}</Link>
              <ChevronRight size={12} />
            </>
          )}
          <span style={{ color: v("--c-accent") }}>Checkout</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pb-2">
          {CHECKOUT_STEPS.map((s, i) => {
            const Icon  = STEP_ICONS[i];
            const done   = i < step;
            const active = i === step;
            return (
              <div key={s} className="flex items-center flex-shrink-0">
                <div className={`flex flex-col items-center transition-all duration-300 ${i <= step ? "opacity-100" : "opacity-35"}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-300"
                    style={{
                      background: done ? "#10B981" : active ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                      border: done || active ? "none" : `2px solid ${v("--c-border")}`,
                      boxShadow: active ? "0 4px 15px rgba(46,125,50,0.35)" : "none",
                    }}>
                    {done ? <Check size={16} className="text-white" /> : <Icon size={15} style={{ color: active ? "#fff" : v("--c-text-sec") }} />}
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap"
                    style={{ color: active ? v("--c-accent") : done ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    {s}
                  </span>
                </div>
                {i < CHECKOUT_STEPS.length - 1 && (
                  <div className="w-10 md:w-16 h-0.5 mx-1 mb-5 transition-all duration-300 flex-shrink-0"
                    style={{ background: i < step ? "#10B981" : v("--c-border") }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Form */}
          <div className="md:col-span-2">

            {/* Product preview card (step 0, arrived from product detail) */}
            {step === 0 && prefill && (
              <ProductPreviewCard prefill={prefill} onEdit={() => window.history.back()} />
            )}

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                <div className="rounded-3xl p-6 md:p-8" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  {step === 0 && <StepSpesifikasi onNext={() => setStep(1)} orderData={orderData} setOrderData={setOrderData} prefill={prefill} />}
                  {step === 1 && <StepPengiriman  onNext={() => setStep(2)} onBack={() => setStep(0)} orderData={orderData} setOrderData={setOrderData} />}
                  {step === 2 && <StepPilihPembayaran onNext={() => setStep(3)} onBack={() => setStep(1)} orderData={orderData} setOrderData={setOrderData} />}
                  {step === 3 && <StepProsesBayar onSuccess={() => setSuccess(true)} onBack={() => setStep(2)} orderData={orderData} total={grandTotal} />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="md:sticky md:top-24 flex flex-col gap-3">
            <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <h3 className="font-['Poppins',sans-serif] font-bold mb-5" style={{ color: v("--c-text") }}>Ringkasan</h3>

              {/* Product in sidebar */}
              {prefill ? (
                <div className="flex gap-3 mb-4 pb-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                  <img
                    src={prefill.productImage}
                    alt={prefill.productName}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/56x56/e8f5e9/2E7D32?text=P"; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{prefill.productName}</p>
                    <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{prefill.sizeLabel} · {orderData.qty} {prefill.unit}</p>
                    <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{prefill.material}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>{fmt(prefill.estimatedPrice)}</p>
                  </div>
                </div>
              ) : selectedProd ? (
                <div className="flex gap-3 mb-4 pb-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                  <div className="w-12 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(46,125,50,0.08)" }}>
                    {(() => { const cat = PROD_CATEGORIES.find(c => c.id === orderData.category); const CatIcon = cat?.Icon ?? Package; return <CatIcon size={20} style={{ color: cat?.color ?? v("--c-primary") }} aria-hidden="true" />; })()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{selectedProd.name}</p>
                    {selectedSize && <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{selectedSize.label} · {orderData.qty}×</p>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package size={32} className="mx-auto mb-2" style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Pilih produk untuk melihat ringkasan</p>
                </div>
              )}

              {/* Price breakdown */}
              {(prefill || selectedProd) && (
                <>
                  <div className="flex flex-col gap-2 mb-4">
                    {[["Subtotal", fmt(prodTotal)], ["Ongkir", ongkir === 0 && selectedCour ? "GRATIS" : selectedCour ? fmt(ongkir) : "—"]].map(([l, val]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{l}</span>
                        <span style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3" style={{ borderTop: `2px solid ${v("--c-border")}` }}>
                    <span className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Total</span>
                    <span className="font-bold text-xl" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                      {grandTotal > 0 ? fmt(grandTotal) : "—"}
                    </span>
                  </div>
                  {selectedPay && (
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                      <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        Bayar via: <strong style={{ color: v("--c-text") }}>{selectedPay.label}</strong>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle size={14} style={{ color: "#10B981" }} />
              <p className="text-xs font-semibold" style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>Pembayaran 100% Aman</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
