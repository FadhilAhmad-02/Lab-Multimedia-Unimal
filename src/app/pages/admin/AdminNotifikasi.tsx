import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, ShoppingBag, CreditCard, CheckCircle, XCircle,
  AlertTriangle, Inbox, Trash2, Check, Search, Filter,
  Settings, UserPlus, RefreshCw, Mail
} from "lucide-react";
import { v } from "../../components/pageUtils";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "pesanan" | "sistem" | "keuangan" | "pengguna";
  read: boolean;
  color: string;
  icon: any;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Pesanan Baru Masuk",
    description: "Siti Rahayu memesan Banner Vinyl 100×200 dengan total belanja Rp 240.000.",
    time: "Baru saja",
    category: "pesanan",
    read: false,
    color: "#2E7D32", // deep green
    icon: ShoppingBag,
  },
  {
    id: "notif-2",
    title: "Pembayaran Dikonfirmasi",
    description: "Pembayaran untuk pesanan #ORD-2025-0048 telah dikonfirmasi via QRIS.",
    time: "5 menit lalu",
    category: "keuangan",
    read: false,
    color: "#10B981", // emerald
    icon: CreditCard,
  },
  {
    id: "notif-3",
    title: "Stok Bahan Cetak Menipis",
    description: "Bahan Cetak Flexi Korea 440g tersisa 2 roll. Segera lakukan restock.",
    time: "2 jam lalu",
    category: "sistem",
    read: false,
    color: "#EF4444", // red
    icon: AlertTriangle,
  },
  {
    id: "notif-4",
    title: "Pendaftaran Pengguna Baru",
    description: "Customer baru bernama Budi Santoso (budi@email.com) telah terdaftar.",
    time: "5 jam lalu",
    category: "pengguna",
    read: true,
    color: "#3B6FD4", // primary blue
    icon: UserPlus,
  },
  {
    id: "notif-5",
    title: "Backup Database Sukses",
    description: "Sistem berhasil melakukan backup database otomatis harian.",
    time: "Hari ini, 02:00 WIB",
    category: "sistem",
    read: true,
    color: "#10B981", // emerald
    icon: Settings,
  },
  {
    id: "notif-6",
    title: "Pesanan #ORD-2025-0039 Dibatalkan",
    description: "Pesanan dibatalkan oleh customer Ahmad Fauzi karena kesalahan ukuran.",
    time: "Kemarin",
    category: "pesanan",
    read: true,
    color: "#EF4444", // red
    icon: XCircle,
  },
  {
    id: "notif-7",
    title: "SMTP Email Masalah Koneksi",
    description: "Gagal mengirim email notifikasi test SMTP. Silakan periksa kembali pengaturan.",
    time: "2 hari lalu",
    category: "sistem",
    read: true,
    color: "#F97316", // orange
    icon: Mail,
  },
  {
    id: "notif-8",
    title: "Laporan Keuangan Bulanan Ready",
    description: "Laporan keuangan bulan Januari 2026 telah digenerate otomatis.",
    time: "3 hari lalu",
    category: "keuangan",
    read: true,
    color: "#7C3AED", // purple
    icon: CreditCard,
  }
];

export function AdminNotifikasi() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "belum-dibaca" | "pesanan" | "sistem" | "keuangan">("semua");

  // Read toggle handlers
  const handleToggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete handlers
  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua notifikasi?")) {
      setNotifications([]);
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    // Search filter
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category / Read Status filter
    if (!matchesSearch) return false;
    if (filterType === "semua") return true;
    if (filterType === "belum-dibaca") return !n.read;
    return n.category === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-5 md:p-7 space-y-6" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", color: v("--c-text") }}>
            Notifikasi Admin
          </h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Terdapat {unreadCount} notifikasi baru yang belum dibaca
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                borderColor: v("--c-border"),
                color: v("--c-text"),
                fontFamily: "'Inter',sans-serif"
              }}
            >
              <Check size={14} /> Tandai Semua Dibaca
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer hover:opacity-90"
              style={{
                background: "linear-gradient(to right, #EF4444, #C22A2A)",
                fontFamily: "'Inter',sans-serif"
              }}
            >
              <Trash2 size={14} /> Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
            <Search size={15} />
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
              fontFamily: "'Inter',sans-serif"
            }}
          />
        </div>

        {/* Filters */}
        <div className="md:col-span-2 flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {([
            { value: "semua", label: "Semua" },
            { value: "belum-dibaca", label: `Belum Dibaca (${unreadCount})` },
            { value: "pesanan", label: "Pesanan" },
            { value: "sistem", label: "Sistem" },
            { value: "keuangan", label: "Keuangan" }
          ] as const).map(({ value, label }) => {
            const isActive = filterType === value;
            return (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border"
                style={{
                  background: isActive ? "rgba(46,125,50,0.12)" : v("--c-card"),
                  color: isActive ? "var(--c-accent)" : v("--c-text-sec"),
                  borderColor: isActive ? "var(--c-accent)" : v("--c-border"),
                  fontFamily: "'Inter',sans-serif"
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: v("--c-card"), borderColor: v("--c-border") }}>
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y" style={{ borderColor: v("--c-border") }}>
              {filteredNotifications.map((notif, index) => {
                const IconComponent = notif.icon;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="p-4 md:p-5 flex gap-4 items-start transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      background: notif.read ? "transparent" : "rgba(46,125,50,0.03)"
                    }}
                  >
                    {/* Status marker */}
                    <div className="pt-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full transition-all"
                        style={{
                          background: notif.read ? "transparent" : "var(--c-accent)",
                          boxShadow: notif.read ? "none" : "0 0 8px var(--c-accent)"
                        }}
                      />
                    </div>

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: notif.color + "15",
                        color: notif.color
                      }}
                    >
                      <IconComponent size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <h3
                          className="text-sm font-semibold truncate"
                          style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                        >
                          {notif.title}
                        </h3>
                        <span className="text-[10px] whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          {notif.time}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-1.5 leading-relaxed"
                        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                      >
                        {notif.description}
                      </p>
                      
                      {/* Sub-actions */}
                      <div className="flex gap-4 mt-3">
                        <button
                          onClick={() => handleToggleRead(notif.id)}
                          className="text-[10px] font-semibold cursor-pointer hover:underline flex items-center gap-1"
                          style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
                        >
                          {notif.read ? "Tandai Belum Dibaca" : "Tandai Dibaca"}
                        </button>
                      </div>
                    </div>

                    {/* Action - Delete Button */}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 rounded-lg cursor-pointer transition-all hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: v("--c-bg-sec") }}>
                <Bell size={24} style={{ color: v("--c-text-sec") }} />
              </div>
              <h3 className="font-bold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                Tidak Ada Notifikasi
              </h3>
              <p className="text-xs mt-1 max-w-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Semua notifikasi telah dihapus atau tidak cocok dengan filter pencarian Anda.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
