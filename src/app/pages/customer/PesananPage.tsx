import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { ShoppingBag, Clock, ChevronRight, RotateCcw, Star, Truck, Eye } from "lucide-react";
import { v } from "../../components/pageUtils";

const TABS = ["Semua", "Menunggu Bayar", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];

const ORDERS = [
  { id: "ORD-2025-0042", date: "24 Feb 2025", status: "DIPROSES",       statusLabel: "Diproses",       statusColor: "var(--c-primary)", product: "Banner Vinyl 60×160 (2pcs)", total: 128000, image: "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?w=120" },
  { id: "ORD-2025-0039", date: "20 Feb 2025", status: "SELESAI",        statusLabel: "Selesai",        statusColor: "#10B981", product: "Kartu Nama UV (100 lembar)", total: 35000, image: "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?w=120" },
  { id: "ORD-2025-0036", date: "15 Feb 2025", status: "MENUNGGU_BAYAR", statusLabel: "Menunggu Bayar", statusColor: "#F59E0B", product: "Mug Custom (5pcs)", total: 125000, image: "https://images.unsplash.com/photo-1763627719014-0ea46e97a5d5?w=120", deadline: 7200 },
  { id: "ORD-2025-0033", date: "10 Feb 2025", status: "DIKIRIM",        statusLabel: "Dikirim",        statusColor: "#8B5CF6", product: "Paper Bag Premium (50pcs)", total: 175000, image: "https://images.unsplash.com/photo-1746422029285-e81d6650f17f?w=120" },
  { id: "ORD-2025-0030", date: "5 Feb 2025",  status: "DIBATALKAN",     statusLabel: "Dibatalkan",     statusColor: "#EF4444", product: "Undangan Pernikahan (200pcs)", total: 1000000, image: "https://images.unsplash.com/photo-1739909198159-a834175bd911?w=120" },
];

function CountdownTimer({ seconds }: { seconds: number }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <span className="font-['JetBrains_Mono',monospace] font-bold text-sm" style={{ color: "#EF4444" }}>
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function OrderActions({ status }: { status: string }) {
  switch (status) {
    case "MENUNGGU_BAYAR": return (
      <div className="flex items-center gap-3">
        <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Bayar sebelum: <CountdownTimer seconds={7200} /></p>
        <Link to="/checkout" className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>Bayar Sekarang</Link>
      </div>
    );
    case "DIPROSES": return (
      <Link to="/pesanan/ORD-2025-0042" className="flex items-center gap-1 text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
        <Eye size={13} /> Lihat Progres
      </Link>
    );
    case "DIKIRIM": return (
      <Link to="/pesanan/ORD-2025-0033" className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#8B5CF6", fontFamily: "'Inter',sans-serif" }}>
        <Truck size={13} /> Lacak Pesanan
      </Link>
    );
    case "SELESAI": return (
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#F59E0B", fontFamily: "'Inter',sans-serif" }}>
          <Star size={13} /> Nilai Produk
        </button>
        <Link to="/produk" className="flex items-center gap-1 text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
          <RotateCcw size={13} /> Pesan Lagi
        </Link>
      </div>
    );
    case "DIBATALKAN": return (
      <Link to="/produk" className="flex items-center gap-1 text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
        <RotateCcw size={13} /> Pesan Lagi
      </Link>
    );
    default: return null;
  }
}

export function PesananPage() {
  const [activeTab, setActiveTab] = useState(0);

  const filtered = activeTab === 0 ? ORDERS : ORDERS.filter(o => {
    const tabMap: Record<number, string> = { 1: "MENUNGGU_BAYAR", 2: "DIPROSES", 3: "DIKIRIM", 4: "SELESAI", 5: "DIBATALKAN" };
    return o.status === tabMap[activeTab];
  });

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-4xl mx-auto px-5 md:px-10 pt-8 pb-20">
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          <span style={{ color: v("--c-accent") }}>Pesanan Saya</span>
        </div>

        <h1 className="font-['Poppins',sans-serif] font-bold mb-6" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: v("--c-text") }}>Pesanan Saya</h1>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all" style={{ background: activeTab === i ? "var(--c-gradient-r)" : v("--c-bg-sec"), color: activeTab === i ? "#fff" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif", border: activeTab === i ? "none" : `1px solid ${v("--c-border")}` }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Orders */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: v("--c-bg-sec") }}>
                <ShoppingBag size={32} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
              </div>
              <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Tidak ada pesanan</p>
              <Link to="/produk" className="text-sm font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Mulai Belanja →</Link>
            </motion.div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              {filtered.map((order) => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${v("--c-border")}`, background: v("--c-bg-sec") }}>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-mono font-bold" style={{ color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }}>{order.id}</p>
                      <span className="hidden sm:block text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{order.date}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${order.statusColor}15`, color: order.statusColor, fontFamily: "'Inter',sans-serif" }}>
                      {order.statusLabel}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex gap-4 px-5 py-4">
                    <img src={order.image} alt={order.product} className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{order.product}</p>
                      <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Malikussaleh Advertising</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                    <div>
                      <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Total Pembayaran</p>
                      <p className="font-bold text-sm" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>Rp {order.total.toLocaleString("id-ID")}</p>
                    </div>
                    <OrderActions status={order.status} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
