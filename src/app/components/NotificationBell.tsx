// frontend/src/components/NotificationBell.tsx
// ─────────────────────────────────────────────────────────────────
// Lonceng notifikasi yang muncul di navbar / header CustomerHome.
// Klik lonceng → dropdown 5 notif terbaru.
// Klik salah satu item → navigate ke /notifikasi (CustomerNotifikasi).
// Klik "Lihat Semua" → navigate ke /notifikasi.
// ─────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, ShoppingBag, CreditCard, AlertTriangle, Mail, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { v } from "./pageUtils";
import { useNotificationPreview } from "../hooks/useNotifications";

// ─── Category → icon/color (sama dengan CustomerNotifikasi) ────
const CATEGORY_CONFIG: Record<string, { color: string; Icon: any }> = {
  pesanan:   { color: "#2E7D32", Icon: ShoppingBag },
  keuangan:  { color: "#7C3AED", Icon: CreditCard  },
  sistem:    { color: "#EF4444", Icon: AlertTriangle },
  broadcast: { color: "#3B6FD4", Icon: Mail         },
};
const DEFAULT_CONFIG = { color: "#10B981", Icon: Bell };

function getCfg(category: string) {
  return CATEGORY_CONFIG[category] ?? DEFAULT_CONFIG;
}

function formatRelativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1)  return "Baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH} jam lalu`;
  return `${Math.floor(diffH / 24)} hari lalu`;
}

// ─────────────────────────────────────────────────────────────────
export function NotificationBell() {
  const navigate = useNavigate();
  const { preview, unreadCount, loading, refresh, markRead } = useNotificationPreview();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refresh saat dropdown dibuka
  const handleToggle = () => {
    if (!open) refresh();
    setOpen(o => !o);
  };

  const handleItemClick = async (id: number, orderId: number | null) => {
    await markRead(id);
    setOpen(false);
    // Navigasi ke halaman notifikasi penuh
    navigate("/notifikasi");
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifikasi");
  };

  return (
    <div ref={ref} className="relative">
      {/* ─── Lonceng button ────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
        style={{ color: v("--c-text-sec") }}
        aria-label="Notifikasi"
      >
        <Bell size={20} />
        {/* Badge unread */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
            style={{ background: "var(--c-accent)", fontFamily: "'Inter',sans-serif" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* ─── Dropdown ──────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit ={{ opacity: 0, y: -8,  scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden shadow-xl z-50"
            style={{
              background:   v("--c-card"),
              border:       `1px solid ${v("--c-border")}`,
              boxShadow:    "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header dropdown */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: v("--c-border") }}
            >
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: v("--c-accent") }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                >
                  Notifikasi
                </span>
                {unreadCount > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: "var(--c-accent)" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              {/* Tandai semua dibaca (langsung dari dropdown) */}
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    // Panggil /me/read-all langsung
                    await fetch(
                      `${import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"}/notifications/me/read-all`,
                      { method: "PATCH", credentials: "include" }
                    );
                    refresh();
                  }}
                  className="flex items-center gap-1 text-[10px] font-semibold cursor-pointer hover:underline"
                  style={{ color: "var(--c-primary)", fontFamily: "'Inter',sans-serif" }}
                >
                  <Check size={10} /> Baca semua
                </button>
              )}
            </div>

            {/* List preview */}
            <div className="divide-y" style={{ borderColor: v("--c-border") }}>
              {loading ? (
                // Skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background: v("--c-bg-sec") }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 rounded-full animate-pulse w-3/4" style={{ background: v("--c-bg-sec") }} />
                      <div className="h-2   rounded-full animate-pulse w-full"  style={{ background: v("--c-bg-sec") }} />
                    </div>
                  </div>
                ))
              ) : preview.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={22} className="mx-auto mb-2" style={{ color: v("--c-text-sec") }} />
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Belum ada notifikasi
                  </p>
                </div>
              ) : (
                preview.map(notif => {
                  const { color, Icon } = getCfg(notif.category);
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleItemClick(notif.id, notif.orderId)}
                      className="w-full text-left p-3 flex gap-3 items-start transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ background: notif.read ? "transparent" : "rgba(46,125,50,0.04)" }}
                    >
                      {/* Unread dot */}
                      <div className="pt-1.5 flex-shrink-0">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:  notif.read ? "transparent" : "var(--c-accent)",
                            boxShadow:   notif.read ? "none" : "0 0 5px var(--c-accent)",
                          }}
                        />
                      </div>
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: color + "15", color }}
                      >
                        <Icon size={14} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{
                            color:       v("--c-text"),
                            fontFamily:  "'Poppins',sans-serif",
                            fontWeight:  notif.read ? 500 : 700,
                          }}
                        >
                          {notif.title}
                        </p>
                        <p
                          className="text-[10px] mt-0.5 line-clamp-2 leading-relaxed"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                        >
                          {notif.description}
                        </p>
                        <p
                          className="text-[9px] mt-1"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                        >
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer — Lihat Semua */}
            <button
              onClick={handleViewAll}
              className="w-full py-3 text-xs font-bold text-center border-t transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                borderColor: v("--c-border"),
                color:       "var(--c-accent)",
                fontFamily:  "'Inter',sans-serif",
              }}
            >
              Lihat Semua Notifikasi →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}