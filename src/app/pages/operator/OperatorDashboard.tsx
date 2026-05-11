import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Inbox, Wrench, CheckCircle, Clock, Bell, ArrowRight, AlertTriangle, Package } from "lucide-react";
import { v } from "../../components/pageUtils";

const KPI = [
  { label: "Pesanan Masuk", value: 12, Icon: Inbox,       color: "var(--c-primary)", bg: "rgba(46,125,50,0.1)"  },
  { label: "Dikerjakan",    value: 5,  Icon: Wrench,      color: "var(--c-accent)",  bg: "rgba(249,168,37,0.1)" },
  { label: "Selesai Hari",  value: 8,  Icon: CheckCircle, color: "#10B981",          bg: "rgba(16,185,129,0.1)" },
  { label: "Terlambat",     value: 2,  Icon: Clock,       color: "#EF4444",          bg: "rgba(239,68,68,0.1)"  },
];

const NEW_ORDERS = [
  { id: "ORD-2025-0048", customer: "Siti Rahayu",   product: "Banner Vinyl 100×200", urgent: true, time: "5 mnt lalu" },
  { id: "ORD-2025-0047", customer: "Ahmad Fauzi",    product: "Kartu Nama UV (500)", urgent: false, time: "12 mnt lalu" },
  { id: "ORD-2025-0046", customer: "Dewi Fatimah",  product: "Undangan Pernikahan (200pcs)", urgent: false, time: "25 mnt lalu" },
];

const ACTIVE_ORDERS = [
  { id: "ORD-2025-0042", customer: "Budi Santoso",  product: "Banner Vinyl",      deadline: "2 jam lagi",  status: "Sedang Dicetak",  urgent: true },
  { id: "ORD-2025-0041", customer: "Rizky Pratama", product: "Paper Bag (50pcs)", deadline: "6 jam lagi",  status: "Finishing",       urgent: false },
  { id: "ORD-2025-0040", customer: "Nurul F.",       product: "Mug Custom (10)",  deadline: "1 hari lagi", status: "Verifikasi File", urgent: false },
];

export function OperatorDashboard() {
  const [takenOrders, setTakenOrders] = useState<string[]>([]);

  return (
    <div className="p-6 theme-aware" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Greeting */}
      <div className="mb-7">
        <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", color: v("--c-text") }}>
          Halo, Ahmad Operator 👋
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Senin, 24 Februari 2025
          </p>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", fontFamily: "'Inter',sans-serif" }}>
            Shift Pagi Aktif
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI.map(({ label, value, Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
            className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="font-['Poppins',sans-serif] font-bold text-3xl leading-none mb-1" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* New orders */}
        <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}`, background: "rgba(46,125,50,0.04)" }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <Package size={14} style={{ color: v("--c-primary") }} aria-hidden="true" />
              <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Pesanan Baru Masuk</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>{NEW_ORDERS.length}</span>
          </div>
          <div className="flex flex-col">
            {NEW_ORDERS.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: i < NEW_ORDERS.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-mono font-bold" style={{ color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }}>{order.id}</p>
                    {order.urgent && <span className="px-1.5 py-0.5 rounded text-xs font-bold animate-pulse" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>URGENT</span>}
                  </div>
                  <p className="text-sm font-semibold truncate" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{order.product}</p>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{order.customer} · {order.time}</p>
                </div>
                {!takenOrders.includes(order.id) ? (
                  <button onClick={() => setTakenOrders(t => [...t, order.id])} className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                    Ambil
                  </button>
                ) : (
                  <span className="text-xs font-semibold" style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>✓ Diambil</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active orders */}
        <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
            <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>⚙️ Sedang Dikerjakan</p>
            <Link to="/operator/antrian" className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
              Lihat Semua <ArrowRight size={11} className="inline" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: v("--c-bg-sec") }}>
                  {["No. Pesanan", "Customer", "Produk", "Deadline", "Status", "Aksi"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIVE_ORDERS.map((order, i) => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${v("--c-border")}`, background: order.urgent ? "rgba(239,68,68,0.03)" : "transparent" }}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono" style={{ color: v("--c-primary"), fontFamily: "'JetBrains Mono', monospace" }}>{order.id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{order.customer}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{order.product}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: order.urgent ? "#EF4444" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {order.urgent && <AlertTriangle size={11} className="inline mr-1" />}{order.deadline}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)", fontFamily: "'Inter',sans-serif" }}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/operator/pesanan/${order.id}`} className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Update →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}