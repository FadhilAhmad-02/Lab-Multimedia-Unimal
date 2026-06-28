import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, ShoppingBag, MapPin, Settings, Camera, Plus, Trash2,
  ChevronRight, CheckCircle, Clock, XCircle, AlertCircle,
  RefreshCw, Eye, EyeOff, Lock, Bell, Mail, Phone,
  Package, Ruler, Layers, Star, Calendar,
  Check, Save, Shield, ToggleLeft, ToggleRight, Printer
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { Link, useNavigate } from "react-router";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const API_BASE = "/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "pesanan" | "alamat" | "pengaturan";
type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; name: string; category: string; image: string | null };
}

interface Order {
  id: number;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "rejected";
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token") ?? sessionStorage.getItem("token") ?? "";
}

function fmt(n: number) { return "Rp " + n.toLocaleString("id-ID"); }

function formatOrderId(id: number) {
  return `ORD-${String(id).padStart(8, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; Icon: typeof CheckCircle }> = {
  completed:  { label: "Selesai",    color: "#16A34A", bg: "rgba(22,163,74,0.1)",  Icon: CheckCircle },
  processing: { label: "Diproses",   color: "#D97706", bg: "rgba(217,119,6,0.1)",  Icon: Clock       },
  pending:    { label: "Menunggu",   color: "#2563EB", bg: "rgba(37,99,235,0.1)",  Icon: AlertCircle },
  cancelled:  { label: "Dibatalkan", color: "#DC2626", bg: "rgba(220,38,38,0.1)",  Icon: XCircle     },
};

const FILTER_TABS: { key: OrderStatus | "semua"; label: string }[] = [
  { key: "semua",      label: "Semua"     },
  { key: "processing", label: "Diproses"  },
  { key: "pending",    label: "Menunggu"  },
  { key: "completed",  label: "Selesai"   },
  { key: "cancelled",  label: "Dibatalkan"},
];

const NAV_TABS: { id: TabId; label: string; Icon: typeof ShoppingBag }[] = [
  { id: "pesanan",    label: "Pesanan Saya",      Icon: ShoppingBag },
  { id: "alamat",     label: "Alamat Pengiriman", Icon: MapPin      },
  { id: "pengaturan", label: "Pengaturan Akun",   Icon: Settings    },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-xl ${className}`} style={{ background: v("--c-border"), ...style }} />;
}

// ─── Context: user data shared across tabs ────────────────────────────────────

// Kita pass sebagai prop agar tidak perlu Context API
interface ProfileCtx {
  user: UserProfile | null;
  orders: Order[];
  loadingUser: boolean;
  loadingOrders: boolean;
  refetchUser: () => void;
}

// ═══════════════════════════════════════════════════════════
//   MAIN PAGE
// ═══════════════════════════════════════════════════════════

export function CustomerProfilPage() {
  const [activeTab, setActiveTab] = useState<TabId>("pesanan");
  const [user,      setUser]      = useState<UserProfile | null>(null);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loadingUser,   setLoadingUser]   = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // ── Fetch profil ──
  const fetchUser = useCallback(async () => {
    setLoadingUser(true);
    const token = getToken();
    if (!token) {
      setLoadingUser(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setLoadingUser(false);
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setUser(json.data ?? json);
    } catch {
      // gagal fetch — biarkan null
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // ── Fetch pesanan ──
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const token = getToken();
    if (!token) { setLoadingOrders(false); return; }
    try {
      const res = await fetch(`${API_BASE}/customer/orders?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { setOrders([]); setLoadingOrders(false); return; }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setOrders(json.data ?? json);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchOrders();
  }, [fetchUser, fetchOrders]);

  const ctx: ProfileCtx = { user, orders, loadingUser, loadingOrders, refetchUser: fetchUser };

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          <span style={{ color: v("--c-accent") }}>Profil Saya</span>
        </div>

        {/* Avatar & Info Card */}
        <AvatarCard ctx={ctx} />

        {/* Tab Nav */}
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "pesanan"    && <PesananTab    key="pesanan"    ctx={ctx} />}
          {activeTab === "alamat"     && <AlamatTab     key="alamat"     />}
          {activeTab === "pengaturan" && <PengaturanTab key="pengaturan" ctx={ctx} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   AVATAR & INFO CARD
// ═══════════════════════════════════════════════════════════

function AvatarCard({ ctx }: { ctx: ProfileCtx }) {
  const { user, orders, loadingUser, loadingOrders, refetchUser } = ctx;

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError,     setAvatarError]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarError("Ukuran foto maks. 2 MB"); return; }
    if (!file.type.startsWith("image/")) { setAvatarError("Hanya file gambar yang diizinkan"); return; }

    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message ?? "Gagal mengunggah foto.");
      }
      refetchUser();
    } catch (err: any) {
      setAvatarError(err.message ?? "Gagal mengunggah foto.");
    } finally {
      setUploadingAvatar(false);
      // Reset input agar file yang sama bisa dipilih ulang
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const totalOrders    = orders.length;
  const onProcess      = orders.filter(o => o.status === "processing").length;
  const completed      = orders.filter(o => o.status === "completed").length;
  const joinedDate     = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })
    : "—";

  const stats = [
    { label: "Total Pesanan", value: loadingOrders ? "…" : String(totalOrders), Icon: ShoppingBag },
    { label: "Sedang Proses", value: loadingOrders ? "…" : String(onProcess),   Icon: Clock       },
    { label: "Selesai",       value: loadingOrders ? "…" : String(completed),   Icon: CheckCircle },
    { label: "Bergabung",     value: loadingUser   ? "…" : joinedDate,          Icon: Calendar    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl mb-6 overflow-hidden"
      style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
    >
      {/* Banner */}
      <div className="h-28 relative" style={{ background: "var(--c-gradient)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.08) 20px,rgba(255,255,255,0.08) 40px)" }}
        />
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-24 h-24 rounded-2xl border-4 object-cover shadow-xl"
                style={{ borderColor: v("--c-card"), opacity: uploadingAvatar ? 0.5 : 1, transition: "opacity 0.2s" }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl"
                style={{ background: "var(--c-gradient-r)", borderColor: v("--c-card"), opacity: uploadingAvatar ? 0.5 : 1, transition: "opacity 0.2s" }}
              >
                {uploadingAvatar ? <RefreshCw size={28} className="animate-spin" /> : (user ? getInitials(user.fullName) : "?")}
              </div>
            )}
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-opacity"
              style={{ background: "var(--c-gradient-r)", opacity: uploadingAvatar ? 0.6 : 1 }}
              title="Ganti foto profil"
            >
              {uploadingAvatar
                ? <RefreshCw size={12} className="text-white animate-spin" />
                : <Camera size={13} className="text-white" />
              }
            </button>
            {avatarError && (
              <p className="absolute top-full left-0 mt-1 text-xs whitespace-nowrap" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>
                {avatarError}
              </p>
            )}
          </div>

          {/* Nama + email */}
          <div className="flex-1 sm:pb-1">
            {loadingUser ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-56" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className="font-['Poppins',sans-serif] font-bold"
                    style={{ fontSize: "1.35rem", color: v("--c-text"), lineHeight: 1.2 }}
                  >
                    {user?.fullName ?? "—"}
                  </h1>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: "rgba(249,168,37,0.15)", color: "#B7791F", border: "1px solid rgba(249,168,37,0.35)", fontFamily: "'Inter',sans-serif" }}
                  >
                    <Star size={11} fill="#F9A825" color="#F9A825" /> Member
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  {user?.email ?? "—"}
                  {user?.phone ? ` · ${user.phone}` : ""}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="text-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "rgba(46,125,50,0.1)" }}>
                <Icon size={16} style={{ color: v("--c-primary") }} />
              </div>
              <p className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "1.1rem", color: v("--c-text"), lineHeight: 1.2 }}>
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
//   TAB NAVIGATION
// ═══════════════════════════════════════════════════════════

function TabNav({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (t: TabId) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
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

// ═══════════════════════════════════════════════════════════
//   TAB 1 — PESANAN SAYA
// ═══════════════════════════════════════════════════════════

function PesananTab({ ctx }: { ctx: ProfileCtx }) {
  const { orders, loadingOrders } = ctx;
  const [filter, setFilter]       = useState<OrderStatus | "semua">("semua");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = filter === "semua" ? orders : orders.filter(o => o.status === filter);

  // Count per status untuk badge
  const countOf = (key: OrderStatus | "semua") =>
    key === "semua" ? orders.length : orders.filter(o => o.status === key).length;

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
              }}
            >
              {label}
              {!loadingOrders && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: active ? "rgba(255,255,255,0.25)" : v("--c-bg-sec"), color: active ? "#fff" : v("--c-text-sec") }}
                >
                  {countOf(key)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loadingOrders && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="rounded-2xl p-5 flex gap-4 animate-pulse" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <Skeleton className="w-14 h-14 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loadingOrders && filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Tidak ada pesanan</p>
          <Link to="/produk" className="text-xs font-semibold mt-2 inline-block" style={{ color: v("--c-primary") }}>
            Mulai Belanja →
          </Link>
        </div>
      )}

      {/* Order list */}
      {!loadingOrders && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const cfg        = STATUS_CONFIG[order.status];
            const isExpanded = expandedId === order.id;
            const firstItem  = order.items[0];

            return (
              <motion.div
                key={order.id}
                layout
                className="rounded-2xl overflow-hidden"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
              >
                {/* Header row */}
                <div className="flex items-start gap-4 p-5">
                  {firstItem?.product.image ? (
                    <img
                      src={firstItem.product.image}
                      alt={firstItem.product.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/56x56/e8f5e9/2E7D32?text=P"; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: v("--c-bg-sec") }}>
                      <Package size={20} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold tracking-wider" style={{ color: v("--c-primary"), fontFamily: "'JetBrains Mono',monospace" }}>
                        {formatOrderId(order.id)}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: cfg.bg, color: cfg.color, fontFamily: "'Inter',sans-serif" }}
                      >
                        <cfg.Icon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <p className="font-semibold text-sm mb-0.5 truncate" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                      {firstItem?.product.name ?? "—"}
                      {order.items.length > 1 && (
                        <span style={{ color: v("--c-text-sec") }}> +{order.items.length - 1} lainnya</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(order.createdAt)}</span>
                      <span className="font-semibold" style={{ color: v("--c-primary") }}>{fmt(order.totalPrice)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}
                  >
                    <ChevronRight size={14} style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                  </button>
                </div>

                {/* Expandable detail */}
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
                        <p className="text-xs font-bold uppercase tracking-widest mt-4 mb-3" style={{ color: v("--c-accent"), fontFamily: "'Inter',sans-serif" }}>
                          Item Pesanan
                        </p>
                        <div className="flex flex-col gap-2 mb-4">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                              <div>
                                <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{item.product.name}</p>
                                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                                  {item.product.category} · {item.quantity} pcs · {fmt(item.price)}/satuan
                                </p>
                              </div>
                              <p className="ml-auto font-bold text-sm flex-shrink-0" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                                {fmt(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/pesanan/${order.id}`}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white"
                            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
                          >
                            <Eye size={13} /> Detail Pesanan
                          </Link>
                          {order.status === "completed" && (
                            <ReorderButton order={order} />
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

// ─── Reorder Button ───────────────────────────────────────────────────────────

function ReorderButton({ order }: { order: Order }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleReorder = async () => {
    setLoading(true);
    setError(null);
    try {
      // Tambahkan semua item dari pesanan lama ke keranjang
      const results = await Promise.allSettled(
        order.items.map(item =>
          fetch(`${API_BASE}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ productId: item.product.id, quantity: item.quantity }),
          })
        )
      );
      const allOk = results.every(r => r.status === "fulfilled" && (r.value as Response).ok);
      if (!allOk) throw new Error("Sebagian item gagal ditambahkan ke keranjang.");
      // Beritahu navbar untuk update badge
      window.dispatchEvent(new Event("cart:change"));
      setDone(true);
      setTimeout(() => navigate("/keranjang"), 800);
    } catch (err: any) {
      setError(err.message ?? "Gagal menambahkan ke keranjang.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleReorder}
        disabled={loading || done}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
        style={{
          background: done ? "rgba(16,185,129,0.12)" : "rgba(249,168,37,0.12)",
          border: `1.5px solid ${done ? "rgba(16,185,129,0.3)" : "rgba(249,168,37,0.3)"}`,
          color: done ? "#059669" : "#B7791F",
          fontFamily: "'Inter',sans-serif",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? <><RefreshCw size={13} className="animate-spin" /> Menambahkan...</>
          : done
            ? <><Check size={13} /> Masuk Keranjang!</>
            : <><RefreshCw size={13} /> Pesan Lagi</>
        }
      </button>
      {error && (
        <p className="text-xs" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>{error}</p>
      )}
    </div>
  );
}



const ADDR_KEY = "malikuss_addresses";

function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    return raw ? (JSON.parse(raw) as Address[]) : [];
  } catch { return []; }
}

function saveAddresses(list: Address[]) {
  localStorage.setItem(ADDR_KEY, JSON.stringify(list));
}

function AlamatTab() {
  const [addresses, setAddresses] = useState<Address[]>(loadAddresses);
  const [showForm, setShowForm]   = useState(false);
  const [editId,   setEditId]     = useState<string | null>(null);

  const emptyForm = (): Omit<Address, "id"> => ({
    label: "", name: "", phone: "", detail: "",
    city: "", province: "", zip: "", isDefault: false, type: "rumah",
  });

  const [form, setForm] = useState<Omit<Address, "id">>(emptyForm());

  const openNew = () => { setForm(emptyForm()); setEditId(null); setShowForm(true); };

  const openEdit = (addr: Address) => {
    const { id, ...rest } = addr;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  };

  const handleSave = () => {
    let updated: Address[];
    if (editId) {
      updated = addresses.map(a => a.id === editId ? { ...form, id: editId } : a);
    } else {
      const newAddr: Address = { ...form, id: `a${Date.now()}` };
      updated = [...addresses, newAddr];
    }
    // Pastikan hanya 1 default
    if (form.isDefault) updated = updated.map(a => ({ ...a, isDefault: a.id === (editId ?? updated[updated.length - 1]?.id) }));
    setAddresses(updated);
    saveAddresses(updated);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    saveAddresses(updated);
  };

  const setDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    saveAddresses(updated);
  };

  const TYPE_ICON: Record<Address["type"], typeof User> = { rumah: User, kantor: User, lainnya: MapPin };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-16" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <MapPin size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Belum ada alamat tersimpan</p>
        </div>
      )}

      {addresses.map(addr => (
        <div key={addr.id} className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1.5px solid ${addr.isDefault ? v("--c-primary") : v("--c-border")}`, boxShadow: v("--c-shadow-card") }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{addr.label}</p>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
                    Utama
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{addr.name} · {addr.phone}</p>
              <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
                {addr.detail}, {addr.city}, {addr.province} {addr.zip}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit(addr)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                <Settings size={13} />
              </button>
              <button onClick={() => handleDelete(addr.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          {!addr.isDefault && (
            <button onClick={() => setDefault(addr.id)} className="mt-3 text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
              Jadikan Utama
            </button>
          )}
        </div>
      ))}

      {/* Form tambah/edit */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
          >
            <h3 className="font-['Poppins',sans-serif] font-bold mb-4" style={{ color: v("--c-text") }}>
              {editId ? "Edit Alamat" : "Tambah Alamat Baru"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                { key: "label",    label: "Label (mis. Rumah, Kantor)", type: "text"  },
                { key: "name",     label: "Nama Penerima",              type: "text"  },
                { key: "phone",    label: "No. Telepon",                type: "tel"   },
                { key: "detail",   label: "Alamat Lengkap",             type: "text"  },
                { key: "city",     label: "Kota",                       type: "text"  },
                { key: "province", label: "Provinsi",                   type: "text"  },
                { key: "zip",      label: "Kode Pos",                   type: "text"  },
              ] as { key: keyof Omit<Address, "id" | "isDefault" | "type">; label: string; type: string }[]).map(({ key, label, type }) => (
                <div key={key} className={key === "detail" ? "sm:col-span-2" : ""}>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</label>
                  <input
                    type={type}
                    value={form[key] as string}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} style={{ accentColor: v("--c-primary") }} />
                  <span className="text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Jadikan alamat utama</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1.5px solid ${v("--c-border")}`, color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Batal
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                <Save size={14} /> Simpan Alamat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && (
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold self-start" style={{ border: `1.5px dashed ${v("--c-border")}`, color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
          <Plus size={15} /> Tambah Alamat Baru
        </button>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
//   TAB 3 — PENGATURAN AKUN
// ═══════════════════════════════════════════════════════════

const NOTIF_ITEMS = [
  { key: "order_update",  label: "Update Pesanan",      desc: "Status & progres produksi",    Icon: Package  },
  { key: "promo",         label: "Promo & Diskon",       desc: "Voucher dan flash sale",        Icon: Star     },
  { key: "email_notif",   label: "Notifikasi Email",     desc: "Kirim ringkasan via email",     Icon: Mail     },
  { key: "wa_notif",      label: "Notifikasi WhatsApp",  desc: "Reminder & konfirmasi via WA",  Icon: Phone    },
] as const;

type NotifKey = (typeof NOTIF_ITEMS)[number]["key"];

function PengaturanTab({ ctx }: { ctx: ProfileCtx }) {
  const { user, refetchUser } = ctx;

  // ── Profil ──
  const [name,  setName]  = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email    ?? "");
  const [phone, setPhone] = useState(user?.phone    ?? "");
  const [bio,   setBio]   = useState(user?.bio      ?? "");
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savedProfile,   setSavedProfile]   = useState(false);
  const [profileError,   setProfileError]   = useState<string | null>(null);

  // Sync ke state saat user data tiba
  useEffect(() => {
    if (user) {
      setName(user.fullName ?? "");
      setEmail(user.email   ?? "");
      setPhone(user.phone   ?? "");
      setBio(user.bio       ?? "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ fullName: name, phone, bio }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan profil.");
      setSavedProfile(true);
      refetchUser();
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (err: any) {
      setProfileError(err.message ?? "Gagal menyimpan.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password ──
  const [oldPwd,     setOldPwd]     = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showOld,    setShowOld]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [savingPwd,  setSavingPwd]  = useState(false);
  const [savedPwd,   setSavedPwd]   = useState(false);
  const [pwdError,   setPwdError]   = useState<string | null>(null);

  const pwdStrength = newPwd.length >= 8 ? (newPwd.match(/[A-Z]/) && newPwd.match(/[0-9]/) ? 3 : 2) : newPwd.length > 0 ? 1 : 0;
  const pwdColor    = ["", "#DC2626", "#D97706", "#16A34A"][pwdStrength] ?? "";
  const pwdLabel    = ["", "Lemah", "Sedang", "Kuat"][pwdStrength] ?? "";

  const handleSavePwd = async () => {
    if (newPwd !== confirmPwd) { setPwdError("Konfirmasi password tidak cocok."); return; }
    if (newPwd.length < 8)     { setPwdError("Password minimal 8 karakter.");     return; }
    setSavingPwd(true);
    setPwdError(null);
    try {
      // Endpoint ganti password — sesuaikan jika berbeda
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message ?? "Gagal mengganti password.");
      }
      setSavedPwd(true);
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setSavedPwd(false), 2500);
    } catch (err: any) {
      setPwdError(err.message ?? "Gagal mengganti password.");
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Notifikasi (sync backend) ──
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    order_update: true, promo: true, email_notif: true, wa_notif: false,
  });
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [savedNotif,   setSavedNotif]   = useState(false);
  const [notifError,   setNotifError]   = useState<string | null>(null);

  // Fetch preferensi notifikasi dari backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/notifications/preferences`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const json = await res.json();
          setNotifs(prev => ({ ...prev, ...(json.data ?? json) }));
        }
      } catch { /* pakai default */ } finally {
        setLoadingNotif(false);
      }
    })();
  }, []);

  const toggle = (key: NotifKey) => setNotifs(p => ({ ...p, [key]: !p[key] }));

  const handleSaveNotif = async () => {
    setNotifError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/notifications/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(notifs),
      });
      if (!res.ok) throw new Error("Gagal menyimpan preferensi.");
      // Simpan juga ke local sebagai cache
      localStorage.setItem("malikuss_notif", JSON.stringify(notifs));
      setSavedNotif(true);
      setTimeout(() => setSavedNotif(false), 2500);
    } catch (err: any) {
      setNotifError(err.message ?? "Gagal menyimpan preferensi.");
    }
  };

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
          {([
            { label: "Nama Lengkap",  val: name,  set: setName,  type: "text",  placeholder: "Nama lengkap" },
            { label: "Alamat Email",  val: email, set: setEmail, type: "email", placeholder: "email@domain.com", disabled: true },
            { label: "Nomor HP / WA", val: phone, set: setPhone, type: "tel",   placeholder: "08xxxxxxxxxx" },
          ] as { label: string; val: string; set: (v: string) => void; type: string; placeholder: string; disabled?: boolean }[]).map(({ label, val, set, type, placeholder, disabled }) => (
            <FormField key={label} label={label} placeholder={placeholder}>
              <input
                type={type}
                value={val}
                disabled={disabled}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: disabled ? v("--c-bg-sec") : v("--c-bg-sec"),
                  border: `1.5px solid ${v("--c-border")}`,
                  color: disabled ? v("--c-text-sec") : v("--c-text"),
                  opacity: disabled ? 0.6 : 1,
                  fontFamily: "'Inter',sans-serif",
                }}
              />
              {disabled && <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Email tidak dapat diubah</p>}
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
        {profileError && (
          <p className="text-xs mt-2" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>{profileError}</p>
        )}
        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: savedProfile ? "#10B981" : "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif", opacity: savingProfile ? 0.6 : 1 }}
        >
          {savingProfile
            ? <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</>
            : savedProfile
              ? <><Check size={14} /> Tersimpan!</>
              : <><Save size={14} /> Simpan Data Diri</>
          }
        </button>
      </SettingCard>

      {/* ─── Keamanan Password ─── */}
      <SettingCard icon={<Shield size={16} className="text-white" />} title="Keamanan Password">
        <div className="flex flex-col gap-4">
          {([
            { label: "Password Lama",            val: oldPwd,     set: setOldPwd,     show: showOld,  setShow: setShowOld  },
            { label: "Password Baru",            val: newPwd,     set: setNewPwd,     show: showNew,  setShow: setShowNew  },
            { label: "Konfirmasi Password Baru", val: confirmPwd, set: setConfirmPwd, show: showConf, setShow: setShowConf },
          ] as { label: string; val: string; set: (v: string) => void; show: boolean; setShow: (s: boolean | ((p: boolean) => boolean)) => void }[]).map(({ label, val, set, show, setShow }) => (
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
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </FormField>
          ))}

          {newPwd && (
            <div>
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ background: pwdStrength >= i ? pwdColor : v("--c-border") }} />
                ))}
              </div>
              <p className="text-xs font-semibold" style={{ color: pwdColor, fontFamily: "'Inter',sans-serif" }}>
                Kekuatan: {pwdLabel}
              </p>
            </div>
          )}

          {confirmPwd && confirmPwd !== newPwd && (
            <p className="text-xs" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>
              Konfirmasi password tidak cocok
            </p>
          )}

          {pwdError && (
            <p className="text-xs" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>{pwdError}</p>
          )}

          <button
            onClick={handleSavePwd}
            disabled={savingPwd}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white mt-1"
            style={{ background: savedPwd ? "#10B981" : "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif", opacity: savingPwd ? 0.6 : 1 }}
          >
            {savingPwd
              ? <><RefreshCw size={14} className="animate-spin" /> Memperbarui...</>
              : savedPwd
                ? <><Check size={14} /> Password Diperbarui!</>
                : <><Lock size={14} /> Perbarui Password</>
            }
          </button>
        </div>
      </SettingCard>

      {/* ─── Preferensi Notifikasi ─── */}
      <SettingCard icon={<Bell size={16} className="text-white" />} title="Preferensi Notifikasi">
        <div className="flex flex-col gap-3">
          {loadingNotif
            ? [1,2,3,4].map(n => <Skeleton key={n} className="h-16 w-full" />)
            : NOTIF_ITEMS.map(({ key, label, desc, Icon }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 p-4 rounded-xl transition-all"
              style={{
                background: notifs[key] ? "rgba(46,125,50,0.06)" : v("--c-bg-sec"),
                border: `1px solid ${notifs[key] ? "rgba(46,125,50,0.2)" : v("--c-border")}`,
              }}
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
        {notifError && (
          <p className="text-xs mt-2" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>{notifError}</p>
        )}
      </SettingCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
//   UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════

function SettingCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}>
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

function FormField({ label, children, className = "" }: { label: string; placeholder: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );
}