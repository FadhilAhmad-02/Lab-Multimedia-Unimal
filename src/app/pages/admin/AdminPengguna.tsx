import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Eye, X, Send, UserX, Plus, Star,
  BarChart2, Clock, CheckCircle,
} from "lucide-react";
import { v } from "../../components/pageUtils";

const CUSTOMERS = [
  { id: 1, name: "Siti Rahayu", email: "siti@email.com", phone: "081234567890", orders: 12, total: "Rp 4.200.000", points: 420, status: "Aktif", joined: "Jan 2024", ref: "SITI24", avatar: "S" },
  { id: 2, name: "Ahmad Fauzi", email: "ahmad@email.com", phone: "082345678901", orders: 8, total: "Rp 2.800.000", points: 280, status: "Aktif", joined: "Mar 2024", ref: "AHMAD24", avatar: "A" },
  { id: 3, name: "Dewi Fatimah", email: "dewi@email.com", phone: "083456789012", orders: 5, total: "Rp 1.500.000", points: 150, status: "Nonaktif", joined: "Jun 2024", ref: "DEWI24", avatar: "D" },
  { id: 4, name: "Budi Santoso", email: "budi@email.com", phone: "084567890123", orders: 21, total: "Rp 8.700.000", points: 870, status: "Aktif", joined: "Sep 2023", ref: "BUDI23", avatar: "B" },
  { id: 5, name: "Rizky Pratama", email: "rizky@email.com", phone: "085678901234", orders: 3, total: "Rp 890.000", points: 89, status: "Aktif", joined: "Dec 2024", ref: "RIZKY24", avatar: "R" },
];

const OPERATORS = [
  { id: 1, name: "Ahmad Operator", email: "ahmad.op@company.com", handled: 87, completed: 82, avgTime: "2.3 jam", status: "Aktif", avatar: "A" },
  { id: 2, name: "Budi Operator", email: "budi.op@company.com", handled: 65, completed: 61, avgTime: "2.8 jam", status: "Aktif", avatar: "B" },
  { id: 3, name: "Citra Operator", email: "citra.op@company.com", handled: 43, completed: 40, avgTime: "3.1 jam", status: "Cuti", avatar: "C" },
];

const BROADCAST_HISTORY = [
  { id: 1, title: "Promo Flash Sale Akhir Bulan", target: "Semua Customer", recipients: 142, date: "22 Feb 2026" },
  { id: 2, title: "Pengingat Pesanan Belum Dibayar", target: "Customer Aktif", recipients: 18, date: "20 Feb 2026" },
  { id: 3, title: "Selamat Datang Member Baru!", target: "Member Baru", recipients: 7, date: "18 Feb 2026" },
];

const TABS = ["Customer", "Operator", "Broadcast"];

export function AdminPengguna() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof CUSTOMERS[0] | null>(null);
  const [selectedOp, setSelectedOp] = useState<typeof OPERATORS[0] | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const filteredCustomers = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>Manajemen Pengguna</h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Kelola customer, operator, dan broadcast notifikasi</p>
        </div>
        {activeTab === 1 && (
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
            <Plus size={14} /> Tambah Operator
          </button>
        )}
        {activeTab === 2 && (
          <button onClick={() => setShowBroadcast(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
            <Send size={14} /> Kirim Broadcast
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: activeTab === i ? v("--c-card") : "transparent", color: activeTab === i ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB: CUSTOMER */}
      {activeTab === 0 && (
        <div>
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari customer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none max-w-md" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                    {["Customer", "Email", "HP", "Pesanan", "Total Belanja", "Poin", "Status", "Aksi"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c, i) => (
                    <tr key={c.id} className="hover:opacity-90 cursor-pointer transition-all" onClick={() => setSelectedUser(c)}
                      style={{ borderBottom: i < filteredCustomers.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#1E3A5F,#F97316)" }}>{c.avatar}</div>
                          <span className="text-sm font-medium whitespace-nowrap" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{c.email}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{c.phone}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-center" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.orders}</td>
                      <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.total}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star size={11} style={{ color: "#EAB308" }} />
                          <span className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.points}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: c.status === "Aktif" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)", color: c.status === "Aktif" ? "#10B981" : "#EF4444", fontFamily: "'Inter',sans-serif" }}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }} onClick={e => { e.stopPropagation(); setSelectedUser(c); }}><Eye size={12} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }} onClick={e => e.stopPropagation()}><UserX size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OPERATOR */}
      {activeTab === 1 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OPERATORS.map((op, i) => (
            <motion.div key={op.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedOp(op)} className="rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white"
                  style={{ background: "var(--c-gradient-r)", fontSize: "1.2rem" }}>{op.avatar}</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{op.name}</p>
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{op.email}</p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: op.status === "Aktif" ? "rgba(16,185,129,0.12)" : "rgba(234,179,8,0.12)", color: op.status === "Aktif" ? "#10B981" : "#EAB308", fontFamily: "'Inter',sans-serif" }}>{op.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Ditangani", value: op.handled, icon: <BarChart2 size={14} /> },
                  { label: "Selesai", value: op.completed, icon: <CheckCircle size={14} /> },
                  { label: "Avg Waktu", value: op.avgTime, icon: <Clock size={14} /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="p-2 rounded-xl" style={{ background: v("--c-bg-sec") }}>
                    <div className="flex justify-center mb-1" style={{ color: v("--c-primary") }}>{icon}</div>
                    <p className="font-bold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{value}</p>
                    <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* TAB: BROADCAST */}
      {activeTab === 2 && (
        <div className="space-y-5">
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Riwayat Broadcast</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                  {["Judul", "Target", "Penerima", "Tanggal"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BROADCAST_HISTORY.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: i < BROADCAST_HISTORY.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                    <td className="px-4 py-3 text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{b.title}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{b.target}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-center" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{b.recipients}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} />
            <motion.div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col overflow-hidden"
              style={{ background: v("--c-card"), borderLeft: `1px solid ${v("--c-border")}` }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Detail Customer</h2>
                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
                    style={{ background: "linear-gradient(135deg,#1E3A5F,#F97316)" }}>{selectedUser.avatar}</div>
                  <h3 className="font-bold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{selectedUser.name}</h3>
                  <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{selectedUser.email}</p>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold mt-2 inline-block" style={{ background: selectedUser.status === "Aktif" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)", color: selectedUser.status === "Aktif" ? "#10B981" : "#EF4444" }}>{selectedUser.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Pesanan", value: selectedUser.orders },
                    { label: "Poin", value: selectedUser.points },
                    { label: "Bergabung", value: selectedUser.joined },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-xl" style={{ background: v("--c-bg-sec") }}>
                      <p className="font-bold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{value}</p>
                      <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>KODE REFERRAL</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold flex-1" style={{ color: v("--c-primary"), fontFamily: "'JetBrains Mono',monospace" }}>{selectedUser.ref}</code>
                    <button className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}>Salin</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>TOTAL BELANJA</p>
                  <p className="font-bold text-xl" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{selectedUser.total}</p>
                </div>
              </div>
              <div className="p-5 flex gap-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                  <Send size={13} className="inline mr-1.5" /> Kirim Notifikasi
                </button>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                  <UserX size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcast && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBroadcast(false)} />
            <motion.div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[480px]"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Kirim Broadcast</h2>
                <button onClick={() => setShowBroadcast(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Target Penerima</label>
                  <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                    <option>Semua Customer</option>
                    <option>Customer Aktif</option>
                    <option>Custom (filter)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Judul Pesan</label>
                  <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" placeholder="Judul broadcast..." style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Isi Pesan</label>
                  <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" placeholder="Tulis pesan di sini..." style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowBroadcast(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Batal</button>
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                    <Send size={13} /> Kirim Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}