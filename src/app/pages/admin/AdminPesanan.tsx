import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, Download, Eye, UserCheck, X, Ban, Flag,
  ChevronLeft, ChevronRight, Calendar, ChevronDown,
} from "lucide-react";
import { v } from "../../components/pageUtils";

const ALL_ORDERS = [
  { id: "ORD-2025-0048", customer: "Siti Rahayu", product: "Banner Vinyl 100×200", total: "Rp 240.000", status: "Menunggu Bayar", payment: "Transfer Manual", operator: "-", date: "24 Feb 2026", flagged: false },
  { id: "ORD-2025-0047", customer: "Ahmad Fauzi", product: "Kartu Nama UV (500pcs)", total: "Rp 175.000", status: "Diproses", payment: "QRIS", operator: "Ahmad Op.", date: "24 Feb 2026", flagged: false },
  { id: "ORD-2025-0046", customer: "Dewi Fatimah", product: "Undangan Pernikahan (200)", total: "Rp 1.200.000", status: "Diproses", payment: "Transfer Manual", operator: "Ahmad Op.", date: "23 Feb 2026", flagged: true },
  { id: "ORD-2025-0045", customer: "Budi Santoso", product: "Mug Custom (10pcs)", total: "Rp 350.000", status: "Dikirim", payment: "GoPay", operator: "Budi Op.", date: "23 Feb 2026", flagged: false },
  { id: "ORD-2025-0044", customer: "Rizky Pratama", product: "Spanduk 3×1m", total: "Rp 180.000", status: "Selesai", payment: "Virtual Account", operator: "Budi Op.", date: "22 Feb 2026", flagged: false },
  { id: "ORD-2025-0043", customer: "Nurul Hidayah", product: "Brosur A5 (300pcs)", total: "Rp 420.000", status: "Selesai", payment: "QRIS", operator: "Ahmad Op.", date: "22 Feb 2026", flagged: false },
  { id: "ORD-2025-0042", customer: "Muhammad Iqbal", product: "Banner Vinyl 60×160", total: "Rp 120.000", status: "Dibatalkan", payment: "Transfer Manual", operator: "-", date: "21 Feb 2026", flagged: false },
  { id: "ORD-2025-0041", customer: "Raisa Andriani", product: "Paper Bag Kraft (100)", total: "Rp 350.000", status: "Diproses", payment: "OVO", operator: "Budi Op.", date: "21 Feb 2026", flagged: false },
  { id: "ORD-2025-0040", customer: "Dimas Prayoga", product: "X-Banner 60×160", total: "Rp 95.000", status: "Selesai", payment: "GoPay", operator: "Ahmad Op.", date: "20 Feb 2026", flagged: false },
  { id: "ORD-2025-0039", customer: "Fitri Yanti", product: "Stiker Vinyl A3 (50)", total: "Rp 275.000", status: "Menunggu Bayar", payment: "Transfer Manual", operator: "-", date: "20 Feb 2026", flagged: true },
];

const STATUS_COLOR: Record<string, string> = {
  "Menunggu Bayar": "#EAB308",
  "Diproses": "var(--c-primary)",
  "Dikirim": "#7C3AED",
  "Selesai": "#10B981",
  "Dibatalkan": "#EF4444",
};

const STATUS_LIST = ["Semua", "Menunggu Bayar", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
const PAYMENT_LIST = ["Semua", "Transfer Manual", "QRIS", "Virtual Account", "GoPay", "OVO"];

export function AdminPesanan() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("Semua");
  const [selectedOrder, setSelectedOrder] = useState<typeof ALL_ORDERS[0] | null>(null);
  const [page, setPage] = useState(1);
  const [flagged, setFlagged] = useState(ALL_ORDERS.map(o => o.flagged));

  const filtered = ALL_ORDERS.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || o.status === statusFilter;
    const matchPayment = paymentFilter === "Semua" || o.payment === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const PER_PAGE = 8;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>Manajemen Pesanan</h1>
        <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Kelola semua pesanan customer dari sini</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nomor pesanan, customer, produk..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
        </div>
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: showFilter ? "rgba(46,125,50,0.1)" : v("--c-card"), color: showFilter ? "var(--c-primary)" : v("--c-text-sec"), border: `1px solid ${showFilter ? "var(--c-primary)" : v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
          <Filter size={14} /> Filter
        </button>
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: v("--c-card"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
            <Download size={14} /> Export <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl mb-4" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_LIST.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{ background: statusFilter === s ? "rgba(46,125,50,0.15)" : v("--c-bg-sec"), color: statusFilter === s ? "var(--c-primary)" : v("--c-text-sec"), border: `1px solid ${statusFilter === s ? "var(--c-primary)" : v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Pembayaran</label>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENT_LIST.map(p => (
                    <button key={p} onClick={() => setPaymentFilter(p)} className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{ background: paymentFilter === p ? "rgba(249,168,37,0.12)" : v("--c-bg-sec"), color: paymentFilter === p ? "var(--c-accent)" : v("--c-text-sec"), border: `1px solid ${paymentFilter === p ? "var(--c-accent)" : v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Rentang Tanggal</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                    <Calendar size={13} style={{ color: v("--c-text-sec") }} />
                    <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Pilih tanggal</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                  Terapkan
                </button>
                <button onClick={() => { setStatusFilter("Semua"); setPaymentFilter("Semua"); }} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <span className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{filtered.length} pesanan ditemukan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                {["No. Pesanan", "Customer", "Produk", "Total", "Status", "Pembayaran", "Operator", "Tanggal", "Aksi"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: i < paged.length - 1 ? `1px solid ${v("--c-border")}` : "none", background: flagged[ALL_ORDERS.indexOf(o)] ? "rgba(239,68,68,0.04)" : "transparent" }}
                  className="hover:bg-opacity-50 transition-all">
                  <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: v("--c-primary") }}>{o.id}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{o.customer}</td>
                  <td className="px-4 py-3 text-xs max-w-[140px] truncate" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{o.product}</td>
                  <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{o.total}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: STATUS_COLOR[o.status] + "20", color: STATUS_COLOR[o.status], fontFamily: "'Inter',sans-serif" }}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{o.payment}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{o.operator}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{o.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedOrder(o)} title="Lihat Detail" className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}><Eye size={12} /></button>
                      <button title="Assign Operator" className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}><UserCheck size={12} /></button>
                      <button onClick={() => { const idx = ALL_ORDERS.indexOf(o); setFlagged(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; }); }} title="Flag" className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: flagged[ALL_ORDERS.indexOf(o)] ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)", color: "#EF4444" }}><Flag size={12} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
          <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}` }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                style={{ background: page === p ? "var(--c-gradient-r)" : v("--c-bg-sec"), color: page === p ? "#fff" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}` }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} />
            <motion.div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl flex flex-col overflow-hidden"
              style={{ background: v("--c-card"), borderLeft: `1px solid ${v("--c-border")}` }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <div>
                  <h2 className="font-semibold font-mono" style={{ color: v("--c-text") }}>{selectedOrder.id}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 inline-block" style={{ background: STATUS_COLOR[selectedOrder.status] + "20", color: STATUS_COLOR[selectedOrder.status], fontFamily: "'Inter',sans-serif" }}>{selectedOrder.status}</span>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {[
                  { label: "Customer", value: selectedOrder.customer },
                  { label: "Produk", value: selectedOrder.product },
                  { label: "Total", value: selectedOrder.total },
                  { label: "Metode Pembayaran", value: selectedOrder.payment },
                  { label: "Operator", value: selectedOrder.operator },
                  { label: "Tanggal", value: selectedOrder.date },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                    <span className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</span>
                    <span className="text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{value}</span>
                  </div>
                ))}

                <div className="p-4 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>LOG AUDIT</p>
                  {[
                    { action: "Pesanan dibuat", by: "System", time: "24 Feb 2026, 09:15" },
                    { action: "Pembayaran diunggah", by: selectedOrder.customer, time: "24 Feb 2026, 09:32" },
                    { action: "Pembayaran dikonfirmasi", by: "Admin", time: "24 Feb 2026, 10:05" },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-3 text-xs mb-3 last:mb-0">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: v("--c-primary") }} />
                      <div>
                        <p style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{log.action}</p>
                        <p style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>oleh {log.by} · {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 flex gap-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>Assign Operator</button>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                  <Ban size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}