import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, ShoppingBag, MapPin, Settings, Camera, Plus, Trash2, Edit2,
  ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, Download,
  RefreshCw, Eye, EyeOff, Lock, Bell, BellOff, Mail, Phone,
  Package, Ruler, Layers, Star, Calendar, Home, Briefcase,
  Check, Save, Shield, ToggleLeft, ToggleRight, Printer
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { Link } from "react-router";

/* ── Types ───────────────────────────────────────────────── */
type OrderStatus = "pending" | "proses" | "selesai" | "dibatalkan";
type TabId = "pesanan" | "alamat" | "pengaturan";

interface OrderSpec {
  ukuran: string;
  qty: number;
  bahan: string;
  finishing: string;
}

interface Order {
  id: string;
  product: string;
  spec: OrderSpec;
  status: OrderStatus;
  date: string;
  total: number;
  image: string;
}

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  detail: string;
  city: string;
  province: string;
  zip: string;
  isDefault: boolean;
  type: "rumah" | "kantor" | "lainnya";
}

/* ── Mock Data ───────────────────────────────────────────── */
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-0042",
    product: "Brosur A4 Full Color",
    spec: { ukuran: "A4 (210×297mm)", qty: 500, bahan: "Art Paper 150gsm", finishing: "Laminating Doff" },
    status: "selesai",
    date: "24 Feb 2025",
    total: 350_000,
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=60&h=60&fit=crop",
  },
  {
    id: "ORD-0043",
    product: "Banner Roll-up 60×160cm",
    spec: { ukuran: "60×160cm", qty: 2, bahan: "Frontline 340gsm", finishing: "Grommets + Tiang" },
    status: "proses",
    date: "01 Mar 2025",
    total: 320_000,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=60&h=60&fit=crop",
  },
  {
    id: "ORD-0044",
    product: "Kartu Nama Soft-touch",
    spec: { ukuran: "9×5.5cm (standar)", qty: 200, bahan: "Art Carton 260gsm", finishing: "Soft-touch Laminating" },
    status: "pending",
    date: "05 Mar 2025",
    total: 125_000,
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&h=60&fit=crop",
  },
  {
    id: "ORD-0038",
    product: "Spanduk Outdoor 3×1m",
    spec: { ukuran: "300×100cm", qty: 1, bahan: "MMT Flexi 440gsm", finishing: "Rope + Mata Ayam" },
    status: "selesai",
    date: "10 Jan 2025",
    total: 85_000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop",
  },
  {
    id: "ORD-0035",
    product: "Undangan Digital Print",
    spec: { ukuran: "A5 (148×210mm)", qty: 300, bahan: "Concorde 120gsm", finishing: "Tanpa Finishing" },
    status: "dibatalkan",
    date: "20 Des 2024",
    total: 210_000,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=60&h=60&fit=crop",
  },
];

const MOCK_ADDRESSES: Address[] = [
  {
    id: "a1",
    label: "Rumah Utama",
    name: "Budi Santoso",
    phone: "081234567890",
    detail: "Jl. Merdeka No. 12, Kel. Banda Sakti",
    city: "Lhokseumawe",
    province: "Aceh",
    zip: "24300",
    isDefault: true,
    type: "rumah",
  },
  {
    id: "a2",
    label: "Kantor",
    name: "Budi Santoso",
    phone: "081234567890",
    detail: "Jl. Veteran No. 5, Kel. Kuta Alam",
    city: "Banda Aceh",
    province: "Aceh",
    zip: "23111",
    isDefault: false,
    type: "kantor",
  },
];

/* ── Status Config ───────────────────────────────────────── */
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; Icon: typeof CheckCircle }> = {
  selesai:    { label: "Selesai",    color: "#16A34A", bg: "rgba(22,163,74,0.1)",    Icon: CheckCircle  },
  proses:     { label: "Diproses",   color: "#D97706", bg: "rgba(217,119,6,0.1)",    Icon: Clock        },
  pending:    { label: "Menunggu",   color: "#2563EB", bg: "rgba(37,99,235,0.1)",    Icon: AlertCircle  },
  dibatalkan: { label: "Dibatalkan", color: "#DC2626", bg: "rgba(220,38,38,0.1)",    Icon: XCircle      },
};

const FILTER_TABS: { key: OrderStatus | "semua"; label: string }[] = [
  { key: "semua",     label: "Semua"     },
  { key: "proses",    label: "Diproses"  },
  { key: "pending",   label: "Menunggu"  },
  { key: "selesai",   label: "Selesai"   },
  { key: "dibatalkan",label: "Dibatalkan"},
];

/* ── Helper ──────────────────────────────────────────────── */
const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export function CustomerProfilPage() {
  const [activeTab, setActiveTab] = useState<TabId>("pesanan");

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-24">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-xs mb-6"
          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
        >
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          <span style={{ color: v("--c-accent") }}>Profil Saya</span>
        </div>

        {/* ── Avatar & Info Card ── */}
        <AvatarCard />

        {/* ── Tab Nav ── */}
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "pesanan"    && <PesananTab    key="pesanan"    />}
          {activeTab === "alamat"     && <AlamatTab     key="alamat"     />}
          {activeTab === "pengaturan" && <PengaturanTab key="pengaturan" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AVATAR & INFO CARD
═══════════════════════════════════════════════════════════ */
function AvatarCard() {
  const stats = [
    { label: "Total Pesanan",  value: "12",          Icon: ShoppingBag },
    { label: "Sedang Proses",  value: "2",           Icon: Clock       },
    { label: "Selesai",        value: "9",           Icon: CheckCircle },
    { label: "Bergabung",      value: "Jan 2024",    Icon: Calendar    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl mb-6 overflow-hidden"
      style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
    >
      {/* Banner strip */}
      <div className="h-28 relative" style={{ background: "var(--c-gradient)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.08) 20px,rgba(255,255,255,0.08) 40px)" }}
        />
      </div>

      {/* Avatar + identity */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl"
              style={{ background: "var(--c-gradient-r)", borderColor: v("--c-card") }}
            >
              B
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: v("--c-gradient-r") }}
              title="Ganti foto profil"
            >
              <Camera size={13} className="text-white" />
            </button>
          </div>

          {/* Name + badge */}
          <div className="flex-1 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="font-['Poppins',sans-serif] font-bold"
                style={{ fontSize: "1.35rem", color: v("--c-text"), lineHeight: 1.2 }}
              >
                Budi Santoso
              </h1>
              {/* Member badge */}
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(249,168,37,0.15)", color: "#B7791F", border: "1px solid rgba(249,168,37,0.35)", fontFamily: "'Inter',sans-serif" }}
              >
                <Star size={11} fill="#F9A825" color="#F9A825" /> Silver Member
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              budi@email.com &nbsp;·&nbsp; 081234567890
            </p>
          </div>
        </div>

        {/* Activity stats */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5"
          style={{ borderTop: `1px solid ${v("--c-border")}` }}
        >
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="text-center">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: "rgba(46,125,50,0.1)" }}
              >
                <Icon size={16} style={{ color: v("--c-primary") }} />
              </div>
              <p
                className="font-['Poppins',sans-serif] font-bold"
                style={{ fontSize: "1.1rem", color: v("--c-text"), lineHeight: 1.2 }}
              >
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB NAVIGATION
═══════════════════════════════════════════════════════════ */
const NAV_TABS: { id: TabId; label: string; Icon: typeof ShoppingBag }[] = [
  { id: "pesanan",    label: "Pesanan Saya",      Icon: ShoppingBag },
  { id: "alamat",     label: "Alamat Pengiriman", Icon: MapPin      },
  { id: "pengaturan", label: "Pengaturan Akun",   Icon: Settings    },
];

function TabNav({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (t: TabId) => void }) {
  return (
    <div
      className="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto"
      style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}
    >
      {NAV_TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-[140px]"
            style={{
              background: active ? v("--c-card") : "transparent",
              color: active ? v("--c-primary") : v("--c-text-sec"),
              boxShadow: active ? v("--c-shadow-card") : "none",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            <Icon size={15} style={{ color: active ? v("--c-accent") : v("--c-text-sec") }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1 — PESANAN SAYA
═══════════════════════════════════════════════════════════ */
function PesananTab() {
  const [filter, setFilter] = useState<OrderStatus | "semua">("semua");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reordered, setReordered] = useState<string | null>(null);

  const filtered = filter === "semua" ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);

  const handleReorder = (id: string) => {
    setReordered(id);
    setTimeout(() => setReordered(null), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map(({ key, label }) => {
          const active = filter === key;
          const count = key === "semua" ? MOCK_ORDERS.length : MOCK_ORDERS.filter(o => o.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: active ? "var(--c-gradient-r)" : v("--c-card"),
                color: active ? "#fff" : v("--c-text-sec"),
                border: `1px solid ${active ? "transparent" : v("--c-border")}`,
                fontFamily: "'Inter',sans-serif",
                boxShadow: active ? "0 4px 12px rgba(46,125,50,0.25)" : "none",
              }}
            >
              {label}
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: active ? "rgba(255,255,255,0.25)" : v("--c-bg-sec"), color: active ? "#fff" : v("--c-text-sec") }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const isExpanded = expandedId === order.id;
            const isReordered = reordered === order.id;

            return (
              <motion.div
                key={order.id}
                layout
                className="rounded-2xl overflow-hidden"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
              >
                {/* Order header row */}
                <div className="flex items-start gap-4 p-5">
                  {/* Product image */}
                  <img
                    src={order.image}
                    alt={order.product}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/56x56/e8f5e9/2E7D32?text=Produk"; }}
                  />

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold tracking-wider"
                        style={{ color: v("--c-primary"), fontFamily: "'JetBrains Mono',monospace" }}
                      >
                        #{order.id}
                      </span>
                      {/* Status badge */}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: cfg.bg, color: cfg.color, fontFamily: "'Inter',sans-serif" }}
                      >
                        <cfg.Icon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <p
                      className="font-semibold text-sm mb-0.5 truncate"
                      style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                    >
                      {order.product}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {order.date}</span>
                      <span className="font-semibold" style={{ color: v("--c-primary") }}>{fmt(order.total)}</span>
                    </div>
                  </div>

                  {/* Toggle detail */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}
                  >
                    <ChevronRight size={14} style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                </div>

                {/* Spec + Actions (expandable) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                        {/* Spesifikasi cetak */}
                        <p
                          className="text-xs font-bold uppercase tracking-widest mt-4 mb-3"
                          style={{ color: v("--c-accent"), fontFamily: "'Inter',sans-serif" }}
                        >
                          Spesifikasi Cetak
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                          {[
                            { Icon: Ruler,   label: "Ukuran",    val: order.spec.ukuran    },
                            { Icon: Package, label: "Qty",       val: `${order.spec.qty} pcs` },
                            { Icon: Layers,  label: "Bahan",     val: order.spec.bahan     },
                            { Icon: Printer, label: "Finishing", val: order.spec.finishing  },
                          ].map(({ Icon, label, val }) => (
                            <div
                              key={label}
                              className="rounded-xl p-3"
                              style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <Icon size={12} style={{ color: v("--c-primary") }} />
                                <span className="text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</span>
                              </div>
                              <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{val}</p>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/pesanan/${order.id}`}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white"
                            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif", boxShadow: "0 3px 10px rgba(46,125,50,0.25)" }}
                          >
                            <Eye size={13} /> Detail Pesanan
                          </a>
                          <button
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: v("--c-card"),
                              border: `1.5px solid ${v("--c-primary")}`,
                              color: v("--c-primary"),
                              fontFamily: "'Inter',sans-serif",
                            }}
                          >
                            <Download size={13} /> Invoice
                          </button>
                          {order.status === "selesai" && (
                            <button
                              onClick={() => handleReorder(order.id)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                              style={{
                                background: isReordered ? "#10B981" : "rgba(249,168,37,0.12)",
                                border: `1.5px solid ${isReordered ? "#10B981" : v("--c-accent")}`,
                                color: isReordered ? "#fff" : "#B7791F",
                                fontFamily: "'Inter',sans-serif",
                              }}
                            >
                              {isReordered ? <><Check size={13} /> Ditambahkan!</> : <><RefreshCw size={13} /> Re-order</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — ALAMAT PENGIRIMAN
═══════════════════════════════════════════════════════════ */
function AlamatTab() {
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Address>>({
    label: "", name: "", phone: "", detail: "", city: "", province: "Aceh", zip: "", type: "rumah"
  });

  const PROVINCES = ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Bali"];

  const TypeIcon = { rumah: Home, kantor: Briefcase, lainnya: MapPin };

  const setDefault = (id: string) =>
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));

  const deleteAddr = (id: string) =>
    setAddresses(prev => prev.filter(a => a.id !== id));

  const startEdit = (addr: Address) => {
    setForm(addr);
    setEditId(addr.id);
    setShowForm(true);
  };

  const saveForm = () => {
    if (editId) {
      setAddresses(prev => prev.map(a => a.id === editId ? { ...a, ...form } as Address : a));
    } else {
      setAddresses(prev => [
        ...prev,
        { ...form, id: `a${Date.now()}`, isDefault: prev.length === 0 } as Address
      ]);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ label: "", name: "", phone: "", detail: "", city: "", province: "Aceh", zip: "", type: "rumah" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Address list */}
      <div className="flex flex-col gap-3 mb-4">
        {addresses.map(addr => {
          const Icon = TypeIcon[addr.type] ?? MapPin;
          return (
            <motion.div
              key={addr.id}
              layout
              className="rounded-2xl p-5"
              style={{
                background: v("--c-card"),
                border: `1px solid ${addr.isDefault ? "var(--c-primary)" : v("--c-border")}`,
                boxShadow: addr.isDefault ? "0 0 0 2px rgba(46,125,50,0.12)" : v("--c-shadow-card"),
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: addr.isDefault ? "var(--c-gradient-r)" : v("--c-bg-sec") }}
                >
                  <Icon size={16} style={{ color: addr.isDefault ? "#fff" : v("--c-text-sec") }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                      {addr.label}
                    </p>
                    {addr.isDefault && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: "rgba(46,125,50,0.12)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
                      >
                        Utama
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                    >
                      {addr.type.charAt(0).toUpperCase() + addr.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{addr.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{addr.phone}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    {addr.detail}, {addr.city}, {addr.province} {addr.zip}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => startEdit(addr)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}
                    >
                      <Edit2 size={11} /> Ubah
                    </button>
                    {!addr.isDefault && (
                      <>
                        <button
                          onClick={() => setDefault(addr.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "rgba(46,125,50,0.08)", color: v("--c-primary"), border: `1px solid rgba(46,125,50,0.2)`, fontFamily: "'Inter',sans-serif" }}
                        >
                          <Check size={11} /> Set Utama
                        </button>
                        <button
                          onClick={() => deleteAddr(addr.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "rgba(220,38,38,0.06)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.15)", fontFamily: "'Inter',sans-serif" }}
                        >
                          <Trash2 size={11} /> Hapus
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add address button */}
      {!showForm && (
        <button
          onClick={() => { setShowForm(true); setEditId(null); }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold w-full justify-center transition-all"
          style={{
            background: v("--c-card"),
            border: `2px dashed ${v("--c-primary")}`,
            color: v("--c-primary"),
            fontFamily: "'Inter',sans-serif",
          }}
        >
          <Plus size={15} /> Tambah Alamat Baru
        </button>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl p-6 mt-2"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
          >
            <h3
              className="font-['Poppins',sans-serif] font-bold mb-5"
              style={{ color: v("--c-text") }}
            >
              {editId ? "Ubah Alamat" : "Tambah Alamat Baru"}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Label */}
              <FormField label="Label Alamat" placeholder="mis. Rumah Utama">
                <input
                  value={form.label ?? ""}
                  onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  placeholder="mis. Rumah Utama"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                />
              </FormField>

              {/* Tipe */}
              <FormField label="Tipe Alamat" placeholder="">
                <div className="flex gap-2">
                  {(["rumah","kantor","lainnya"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(p => ({ ...p, type: t }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all"
                      style={{
                        background: form.type === t ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                        color: form.type === t ? "#fff" : v("--c-text-sec"),
                        border: `1px solid ${form.type === t ? "transparent" : v("--c-border")}`,
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Nama penerima */}
              <FormField label="Nama Penerima" placeholder="">
                <input
                  value={form.name ?? ""}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nama lengkap penerima"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                />
              </FormField>

              {/* Nomor HP */}
              <FormField label="Nomor HP" placeholder="">
                <input
                  value={form.phone ?? ""}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                />
              </FormField>

              {/* Provinsi */}
              <FormField label="Provinsi" placeholder="">
                <select
                  value={form.province ?? ""}
                  onChange={e => setForm(p => ({ ...p, province: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                >
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </FormField>

              {/* Kota */}
              <FormField label="Kota / Kabupaten" placeholder="">
                <input
                  value={form.city ?? ""}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  placeholder="mis. Lhokseumawe"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                />
              </FormField>

              {/* Kode Pos */}
              <FormField label="Kode Pos" placeholder="">
                <input
                  value={form.zip ?? ""}
                  onChange={e => setForm(p => ({ ...p, zip: e.target.value }))}
                  placeholder="5 digit kode pos"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                />
              </FormField>

              {/* Detail Alamat */}
              <FormField label="Alamat Lengkap" placeholder="" className="sm:col-span-2">
                <textarea
                  value={form.detail ?? ""}
                  onChange={e => setForm(p => ({ ...p, detail: e.target.value }))}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                />
              </FormField>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={saveForm}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
              >
                <Save size={14} /> Simpan Alamat
              </button>
              <button
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold"
                style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 3 — PENGATURAN AKUN
═══════════════════════════════════════════════════════════ */
function PengaturanTab() {
  /* — Data Diri — */
  const [name,    setName]    = useState("Budi Santoso");
  const [email,   setEmail]   = useState("budi@email.com");
  const [phone,   setPhone]   = useState("081234567890");
  const [bio,     setBio]     = useState("Pelanggan setia Malikussaleh Advertising sejak 2024.");
  const [savedProfile, setSavedProfile] = useState(false);

  const handleSaveProfile = () => { setSavedProfile(true); setTimeout(() => setSavedProfile(false), 2500); };

  /* — Password — */
  const [oldPwd,     setOldPwd]     = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showOld,    setShowOld]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [savedPwd,   setSavedPwd]   = useState(false);

  const pwdStrength = newPwd.length >= 12 ? 3 : newPwd.length >= 8 ? 2 : newPwd.length > 0 ? 1 : 0;
  const pwdLabel    = ["", "Lemah", "Sedang", "Kuat"][pwdStrength];
  const pwdColor    = ["", "#DC2626", "#D97706", "#16A34A"][pwdStrength];
  const handleSavePwd = () => { setSavedPwd(true); setTimeout(() => setSavedPwd(false), 2500); };

  /* — Notifikasi — */
  const [notifs, setNotifs] = useState({
    statusPesanan: true,
    promoEmail:    false,
    whatsapp:      true,
    newsletter:    false,
    browser:       true,
  });
  const [savedNotif, setSavedNotif] = useState(false);
  const handleSaveNotif = () => { setSavedNotif(true); setTimeout(() => setSavedNotif(false), 2500); };

  const toggle = (key: keyof typeof notifs) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const NOTIF_ITEMS: { key: keyof typeof notifs; label: string; desc: string; Icon: typeof Bell }[] = [
    { key: "statusPesanan", label: "Update Status Pesanan",    desc: "Notifikasi saat status pesanan berubah",          Icon: ShoppingBag },
    { key: "whatsapp",      label: "WhatsApp Notification",    desc: "Kirim notifikasi via pesan WhatsApp",             Icon: Phone       },
    { key: "promoEmail",    label: "Promo & Penawaran Email",  desc: "Informasi diskon dan penawaran spesial via email", Icon: Mail        },
    { key: "newsletter",    label: "Newsletter Bulanan",       desc: "Tips desain dan update layanan terbaru",          Icon: Bell        },
    { key: "browser",       label: "Notifikasi Browser",       desc: "Push notification di browser Anda",               Icon: BellOff     },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      {/* ─── Data Diri ─── */}
      <SettingCard icon={<User size={16} className="text-white" />} title="Data Diri">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Nama Lengkap",   val: name,  set: setName,  type: "text",  placeholder: "Nama lengkap" },
            { label: "Alamat Email",   val: email, set: setEmail, type: "email", placeholder: "email@domain.com" },
            { label: "Nomor HP / WA",  val: phone, set: setPhone, type: "tel",   placeholder: "08xxxxxxxxxx" },
          ].map(({ label, val, set, type, placeholder }) => (
            <FormField key={label} label={label} placeholder={placeholder}>
              <input
                type={type}
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
              />
            </FormField>
          ))}
          <FormField label="Bio Singkat" placeholder="" className="sm:col-span-2">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
            />
          </FormField>
        </div>
        <button
          onClick={handleSaveProfile}
          className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: savedProfile ? "#10B981" : "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
        >
          {savedProfile ? <><Check size={14} /> Tersimpan!</> : <><Save size={14} /> Simpan Data Diri</>}
        </button>
      </SettingCard>

      {/* ─── Keamanan Password ─── */}
      <SettingCard icon={<Shield size={16} className="text-white" />} title="Keamanan Password">
        <div className="flex flex-col gap-4">
          {[
            { label: "Password Lama",               val: oldPwd,     set: setOldPwd,     show: showOld,  setShow: setShowOld  },
            { label: "Password Baru",               val: newPwd,     set: setNewPwd,     show: showNew,  setShow: setShowNew  },
            { label: "Konfirmasi Password Baru",    val: confirmPwd, set: setConfirmPwd, show: showConf, setShow: setShowConf },
          ].map(({ label, val, set, show, setShow }) => (
            <FormField key={label} label={label} placeholder="">
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ color: v("--c-text-sec") }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </FormField>
          ))}

          {/* Strength bar */}
          {newPwd && (
            <div>
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ background: pwdStrength >= i ? pwdColor : v("--c-border") }}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold" style={{ color: pwdColor, fontFamily: "'Inter',sans-serif" }}>
                Kekuatan Password: {pwdLabel}
              </p>
            </div>
          )}

          {confirmPwd && confirmPwd !== newPwd && (
            <p className="text-xs" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>
              Password konfirmasi tidak cocok
            </p>
          )}

          <button
            onClick={handleSavePwd}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white mt-1"
            style={{ background: savedPwd ? "#10B981" : "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
          >
            {savedPwd ? <><Check size={14} /> Password Diperbarui!</> : <><Lock size={14} /> Perbarui Password</>}
          </button>
        </div>
      </SettingCard>

      {/* ─── Preferensi Notifikasi ─── */}
      <SettingCard icon={<Bell size={16} className="text-white" />} title="Preferensi Notifikasi">
        <div className="flex flex-col gap-3">
          {NOTIF_ITEMS.map(({ key, label, desc, Icon }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 p-4 rounded-xl transition-all"
              style={{ background: notifs[key] ? "rgba(46,125,50,0.06)" : v("--c-bg-sec"), border: `1px solid ${notifs[key] ? "rgba(46,125,50,0.2)" : v("--c-border")}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: notifs[key] ? "rgba(46,125,50,0.12)" : v("--c-card") }}
                >
                  <Icon size={15} style={{ color: notifs[key] ? v("--c-primary") : v("--c-text-sec") }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{desc}</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => toggle(key)}
                className="flex-shrink-0 transition-all duration-200"
                style={{ color: notifs[key] ? v("--c-primary") : v("--c-text-sec") }}
              >
                {notifs[key]
                  ? <ToggleRight size={32} fill="var(--c-primary)" color="var(--c-primary)" />
                  : <ToggleLeft  size={32} />
                }
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveNotif}
          className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: savedNotif ? "#10B981" : "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
        >
          {savedNotif ? <><Check size={14} /> Preferensi Disimpan!</> : <><Save size={14} /> Simpan Preferensi</>}
        </button>
      </SettingCard>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════════════════════ */
function SettingCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--c-gradient-r)" }}>
          {icon}
        </div>
        <h3 className="font-['Poppins',sans-serif] font-bold" style={{ color: v("--c-text") }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  placeholder: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        className="text-xs font-semibold block mb-1.5"
        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
