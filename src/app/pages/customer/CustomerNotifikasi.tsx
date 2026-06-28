// pages/customer/CustomerNotifikasi.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Halaman notifikasi khusus customer — disambungkan ke backend.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import {
  Bell, ShoppingBag, CreditCard, AlertTriangle,
  Mail, Trash2, Check, Search, Loader2, ArrowLeft, RefreshCw,
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";

// ─── Category → visual config ─────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { color: string; Icon: any; label: string }> = {
  pesanan:   { color: "#2E7D32", Icon: ShoppingBag, label: "Pesanan" },
  keuangan:  { color: "#7C3AED", Icon: CreditCard,  label: "Pembayaran" },
  sistem:    { color: "#EF4444", Icon: AlertTriangle, label: "Sistem" },
  broadcast: { color: "#3B6FD4", Icon: Mail,         label: "Info" },
};

const DEFAULT_CONFIG = { color: "#10B981", Icon: Bell, label: "Lainnya" };

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? DEFAULT_CONFIG;
}

function formatRelativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} jam lalu`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Kemarin";
  if (diffD < 7) return `${diffD} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function CustomerNotifikasi() {
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    searchQuery,
    filterType,
    setSearchQuery,
    setFilterType,
    refresh,
    handleToggleRead,
    handleMarkAllRead,
    handleDelete,
  } = useNotifications("customer");

  const FILTERS = [
    { value: "semua",        label: "Semua" },
    { value: "belum-dibaca", label: `Belum Dibaca (${unreadCount})` },
    { value: "pesanan",      label: "Pesanan" },
    { value: "keuangan",     label: "Pembayaran" },
    { value: "broadcast",    label: "Info & Promo" },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: v("--c-border"), color: v("--c-text-sec") }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1
            className="font-bold"
            style={{ fontSize: "clamp(1.1rem,2vw,1.4rem)", color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
          >
            Notifikasi
          </h1>
          {user && (
            <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Halo, {user.fullName} — {unreadCount > 0 ? `${unreadCount} belum dibaca` : "semua sudah dibaca"}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2.5 rounded-xl border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: v("--c-border"), color: v("--c-text-sec") }}
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: v("--c-border"), color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
          >
            <Check size={12} /> Baca Semua
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Cari notifikasi..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border"
          style={{
            background: v("--c-card"),
            borderColor: v("--c-border"),
            color: v("--c-text"),
            fontFamily: "'Inter',sans-serif",
          }}
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map(({ value, label }) => {
          const isActive = filterType === value;
          return (
            <button
              key={value}
              onClick={() => setFilterType(value)}
              className="px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border"
              style={{
                background: isActive ? "var(--c-accent)" : v("--c-card"),
                color: isActive ? "#fff" : v("--c-text-sec"),
                borderColor: isActive ? "var(--c-accent)" : v("--c-border"),
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
          Gagal memuat. <button onClick={refresh} className="underline font-semibold cursor-pointer">Coba lagi</button>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: v("--c-card"), borderColor: v("--c-border") }}>
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <Loader2 size={22} className="animate-spin" style={{ color: v("--c-text-sec") }} />
            <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Memuat notifikasi...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              <div className="divide-y" style={{ borderColor: v("--c-border") }}>
                {notifications.map((notif, index) => {
                  const { color, Icon, label } = getCategoryConfig(notif.category);
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18, delay: Math.min(index * 0.025, 0.25) }}
                      className="p-4 flex gap-3 items-start transition-all"
                      style={{
                        background: notif.read ? "transparent" : "rgba(46,125,50,0.04)",
                      }}
                    >
                      {/* Unread dot */}
                      <div className="pt-2 flex-shrink-0">
                        <div
                          className="w-2 h-2 rounded-full transition-all"
                          style={{
                            background: notif.read ? "transparent" : "var(--c-accent)",
                            boxShadow: notif.read ? "none" : "0 0 6px var(--c-accent)",
                          }}
                        />
                      </div>

                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: color + "15", color }}
                      >
                        <Icon size={16} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Category chip */}
                        <span
                          className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-1"
                          style={{
                            background: color + "15",
                            color,
                            fontFamily: "'Inter',sans-serif",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </span>

                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="text-sm font-semibold leading-snug"
                            style={{
                              color: v("--c-text"),
                              fontFamily: "'Poppins',sans-serif",
                              fontWeight: notif.read ? 500 : 700,
                            }}
                          >
                            {notif.title}
                          </h3>
                          <span
                            className="text-[10px] whitespace-nowrap flex-shrink-0"
                            style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                          >
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>

                        <p
                          className="text-xs mt-1 leading-relaxed"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                        >
                          {notif.description}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-4 mt-2.5">
                          {!notif.read && (
                            <button
                              onClick={() => handleToggleRead(notif.id)}
                              className="text-[10px] font-semibold cursor-pointer hover:underline"
                              style={{ color: "var(--c-primary)", fontFamily: "'Inter',sans-serif" }}
                            >
                              Tandai Dibaca
                            </button>
                          )}
                          {notif.orderId && (
                            <Link
                              to={`/pesanan/${notif.orderId}`}
                              className="text-[10px] font-semibold hover:underline"
                              style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                            >
                              Lihat Pesanan →
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 rounded-lg cursor-pointer transition-all hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0"
                        style={{ color: v("--c-text-sec") }}
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: v("--c-bg-sec") }}
                >
                  <Bell size={22} style={{ color: v("--c-text-sec") }} />
                </div>
                <div>
                  <h3
                    className="font-bold text-sm"
                    style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                  >
                    Tidak Ada Notifikasi
                  </h3>
                  <p
                    className="text-xs mt-1"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                  >
                    {filterType === "semua"
                      ? "Kamu belum punya notifikasi saat ini."
                      : "Tidak ada notifikasi yang cocok dengan filter ini."}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}