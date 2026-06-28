import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  ShoppingBag, ChevronRight, RotateCcw, Star,
  Truck, Eye, AlertCircle, RefreshCw, CreditCard,
} from "lucide-react";
import { v } from "../../components/pageUtils";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const API_BASE = "/api";

const TABS = [
  "Semua",
  "Menunggu Bayar",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
];

/**
 * Mapping tab index → filter yang dikirim ke backend.
 * Backend endpoint: GET /api/customer/orders?status=...&paymentStatus=...
 *
 * Logika:
 *  - "Menunggu Bayar" = order.paymentStatus === "unpaid" (belum bayar, bisa pending/processing)
 *  - "Diproses"       = status === "processing" && paymentStatus === "paid"
 *  - "Dikirim"        = status === "completed" yang sudah ada resi (kita pakai status completed + filter resi di FE)
 *  - "Selesai"        = status === "completed" && confirmed oleh customer
 *  - "Dibatalkan"     = status === "cancelled"
 *
 * Karena backend hanya punya 4 status order (pending/processing/completed/cancelled)
 * + paymentStatus (unpaid/paid/rejected), kita filter di FE setelah fetch "Semua".
 */
const TAB_FILTER: Record<number, (o: Order) => boolean> = {
  0: () => true,
  1: (o) => o.paymentStatus === "unpaid" && o.status !== "cancelled",
  2: (o) => o.status === "processing" && o.paymentStatus === "paid",
  3: (o) => o.status === "completed" && !!extractResi(o.notes),
  4: (o) => o.status === "completed" && !extractResi(o.notes),
  5: (o) => o.status === "cancelled",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: "Menunggu",    color: "#F59E0B" },
  processing: { label: "Diproses",    color: "var(--c-primary)" },
  completed:  { label: "Selesai",     color: "#10B981" },
  cancelled:  { label: "Dibatalkan",  color: "#EF4444" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unpaid:   { label: "Belum Bayar", color: "#F59E0B" },
  paid:     { label: "Lunas",       color: "#10B981" },
  rejected: { label: "Ditolak",     color: "#EF4444" },
};

// ─── Tipe data ────────────────────────────────────────────────────────────────

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    category: string;
    image: string | null;
  };
}

interface Order {
  id: number;
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "rejected";
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface ApiResponse {
  success: boolean;
  data: Order[];
  total?: number;
  page?: number;
  totalPages?: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Ambil info resi dari field notes: format [RESI:JNE:1234567] */
function extractResi(notes: string | null): { kurir: string; resi: string } | null {
  if (!notes) return null;
  const match = notes.match(/\[RESI:([^:]+):([^\]]+)\]/);
  if (!match) return null;
  return { kurir: match[1]!, resi: match[2]! };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatOrderId(id: number) {
  return `ORD-${String(id).padStart(8, "0")}`;
}

function getToken() {
  return localStorage.getItem("token") ?? sessionStorage.getItem("token") ?? "";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: v("--c-bg-sec") }}>
        <div className="h-3 w-32 rounded-full" style={{ background: v("--c-border") }} />
        <div className="h-5 w-20 rounded-full" style={{ background: v("--c-border") }} />
      </div>
      <div className="flex gap-4 px-5 py-4">
        <div className="w-16 h-12 rounded-xl flex-shrink-0" style={{ background: v("--c-border") }} />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="h-3 w-3/4 rounded-full" style={{ background: v("--c-border") }} />
          <div className="h-2.5 w-1/2 rounded-full" style={{ background: v("--c-border") }} />
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
        <div className="h-4 w-24 rounded-full" style={{ background: v("--c-border") }} />
        <div className="h-7 w-28 rounded-xl" style={{ background: v("--c-border") }} />
      </div>
    </div>
  );
}

// ─── OrderActions ─────────────────────────────────────────────────────────────

function OrderActions({ order }: { order: Order }) {
  const resi = extractResi(order.notes);

  // Belum bayar
  if (order.paymentStatus === "unpaid" && order.status !== "cancelled") {
    return (
      <Link
        to={`/checkout/payment/${order.id}`}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
        style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
      >
        <CreditCard size={13} /> Bayar Sekarang
      </Link>
    );
  }

  // Sedang diproses
  if (order.status === "processing") {
    return (
      <Link
        to={`/pesanan/${order.id}`}
        className="flex items-center gap-1 text-xs font-semibold"
        style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
      >
        <Eye size={13} /> Lihat Progres
      </Link>
    );
  }

  // Selesai & ada resi → bisa lacak
  if (order.status === "completed" && resi) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to={`/pesanan/${order.id}`}
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: "#8B5CF6", fontFamily: "'Inter',sans-serif" }}
        >
          <Truck size={13} /> Lacak Pesanan
        </Link>
      </div>
    );
  }

  // Selesai (tidak ada resi = pickup / sudah diterima)
  if (order.status === "completed") {
    return (
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: "#F59E0B", fontFamily: "'Inter',sans-serif" }}
        >
          <Star size={13} /> Nilai Produk
        </button>
        <Link
          to="/produk"
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
        >
          <RotateCcw size={13} /> Pesan Lagi
        </Link>
      </div>
    );
  }

  // Dibatalkan
  if (order.status === "cancelled") {
    return (
      <Link
        to="/produk"
        className="flex items-center gap-1 text-xs font-semibold"
        style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
      >
        <RotateCcw size={13} /> Pesan Lagi
      </Link>
    );
  }

  return null;
}

// ─── Badge status ─────────────────────────────────────────────────────────────

function StatusBadge({ order }: { order: Order }) {
  // Prioritas: paymentStatus unpaid/rejected tampil duluan
  if (order.paymentStatus === "unpaid" && order.status !== "cancelled") {
    const cfg = PAYMENT_STATUS_CONFIG["unpaid"]!;
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${cfg.color}18`, color: cfg.color, fontFamily: "'Inter',sans-serif" }}>
        {cfg.label}
      </span>
    );
  }
  if (order.paymentStatus === "rejected") {
    const cfg = PAYMENT_STATUS_CONFIG["rejected"]!;
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${cfg.color}18`, color: cfg.color, fontFamily: "'Inter',sans-serif" }}>
        Bukti Bayar Ditolak
      </span>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: v("--c-text-sec") };
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${cfg.color}18`, color: cfg.color, fontFamily: "'Inter',sans-serif" }}>
      {cfg.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PesananPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  // Fetch semua pesanan sekali, filter di client per tab
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/customer/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (!res.ok) {
        throw new Error(`Gagal memuat pesanan (${res.status})`);
      }
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error("Respons server tidak valid.");
      setOrders(json.data);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(TAB_FILTER[activeTab] ?? (() => true));

  // Hitung badge count per tab
  const tabCounts = TABS.map((_, i) =>
    orders.filter(TAB_FILTER[i] ?? (() => true)).length
  );

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-4xl mx-auto px-5 md:px-10 pt-8 pb-20">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          <span style={{ color: v("--c-accent") }}>Pesanan Saya</span>
        </div>

        <h1
          className="font-['Poppins',sans-serif] font-bold mb-6"
          style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: v("--c-text") }}
        >
          Pesanan Saya
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map((tab, i) => {
            const count = tabCounts[i] ?? 0;
            const isActive = activeTab === i;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: isActive ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                  color: isActive ? "#fff" : v("--c-text-sec"),
                  fontFamily: "'Inter',sans-serif",
                  border: isActive ? "none" : `1px solid ${v("--c-border")}`,
                }}
              >
                {tab}
                {/* Badge count — hanya tampil jika ada isi dan bukan tab Semua */}
                {i > 0 && !loading && count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-bold leading-none"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : v("--c-border"),
                      color: isActive ? "#fff" : v("--c-text"),
                      fontSize: "10px",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={18} color="#EF4444" className="flex-shrink-0" />
            <p className="text-sm flex-1" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>{error}</p>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}
            >
              <RefreshCw size={12} /> Coba lagi
            </button>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">

          {/* Loading skeletons */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              {[1, 2, 3].map(n => <OrderSkeleton key={n} />)}
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: v("--c-bg-sec") }}
              >
                <ShoppingBag size={32} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
              </div>
              <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                {activeTab === 0 ? "Belum ada pesanan" : `Tidak ada pesanan di tab ini`}
              </p>
              <Link
                to="/produk"
                className="text-sm font-semibold"
                style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
              >
                Mulai Belanja →
              </Link>
            </motion.div>
          )}

          {/* Order list */}
          {!loading && !error && filtered.length > 0 && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              {filtered.map((order) => {
                const firstItem = order.items[0];
                const productName = firstItem?.product.name ?? "—";
                const extraItems  = order.items.length - 1;
                const productImage = firstItem?.product.image ?? null;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: v("--c-card"),
                      border: `1px solid ${v("--c-border")}`,
                      boxShadow: v("--c-shadow-card"),
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{ borderBottom: `1px solid ${v("--c-border")}`, background: v("--c-bg-sec") }}
                    >
                      <div className="flex items-center gap-3">
                        <p
                          className="text-xs font-bold"
                          style={{ color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {formatOrderId(order.id)}
                        </p>
                        <span
                          className="hidden sm:block text-xs"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                        >
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <StatusBadge order={order} />
                    </div>

                    {/* Body */}
                    <div className="flex gap-4 px-5 py-4">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-16 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-16 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{ background: v("--c-bg-sec") }}
                        >
                          <ShoppingBag size={18} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                        >
                          {productName}
                          {extraItems > 0 && (
                            <span style={{ color: v("--c-text-sec") }}> +{extraItems} item lainnya</span>
                          )}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                        >
                          Malikussaleh Advertising
                        </p>
                        {/* Rejected payment note */}
                        {order.paymentStatus === "rejected" && (
                          <p
                            className="text-xs mt-1 font-medium"
                            style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}
                          >
                            Bukti pembayaran ditolak — upload ulang
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{ borderTop: `1px solid ${v("--c-border")}` }}
                    >
                      <div>
                        <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          Total Pembayaran
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}
                        >
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <OrderActions order={order} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}