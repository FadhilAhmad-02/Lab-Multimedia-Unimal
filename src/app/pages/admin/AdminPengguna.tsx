import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Eye, X, Send, UserX, UserCheck, Plus, Star,
  BarChart2, Clock, CheckCircle, ShieldCheck, Shield,
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { useAuth } from "../../hooks/useAuth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/pengguna";

// ── TYPES ────────────────────────────────────────────────────────
type UserRole = "customer" | "operator" | "admin";

type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  orders: number;
  total: string;
  totalRaw: number;
  points: number;
  status: "Aktif" | "Nonaktif";
  joined: string;
  ref: string;
  avatar: string;
};

const BROADCAST_HISTORY = [
  { id: 1, title: "Promo Flash Sale Akhir Bulan", target: "Semua Customer", recipients: 142, date: "22 Feb 2026" },
  { id: 2, title: "Pengingat Pesanan Belum Dibayar", target: "Customer Aktif", recipients: 18, date: "20 Feb 2026" },
  { id: 3, title: "Selamat Datang Member Baru!", target: "Member Baru", recipients: 7, date: "18 Feb 2026" },
];

const TABS = ["Customer", "Operator", "Broadcast"];

const ROLE_COLOR: Record<UserRole, { bg: string; text: string }> = {
  customer: { bg: "rgba(234,179,8,0.12)", text: "#EAB308" },
  operator: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6" },
  admin:    { bg: "rgba(168,85,247,0.12)", text: "#A855F7" },
};

// ── COMPONENT ───────────────────────────────────────────────────
export function AdminPengguna() {
  
  const { authHeader } = useAuth();

  const [activeTab, setActiveTab]       = useState(0);
  const [search, setSearch]             = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [loading, setLoading]           = useState(true);
  const [allUsers, setAllUsers]         = useState<UserRow[]>([]);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showAddStaff, setShowAddStaff]   = useState(false);
  const [actionId, setActionId]           = useState<number | null>(null);

  // ── FETCH ALL USERS ───────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/api/users`, { headers: authHeader });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();

      // Backend `getUsers` mengembalikan array user langsung (res.json(formattedUsers)),
      // bukan { users: [...] } — jadi kita pakai `data` langsung di sini.
      const mapped: UserRow[] = data.map((u: any) => ({
        id:       u.id,
        name:     u.fullName,
        email:    u.email,
        phone:    u.phoneNumber || "-",
        role:     u.role as UserRole,
        orders:   u.orders || 0,
        totalRaw: u.total || 0,
        total:    new Intl.NumberFormat("id-ID", {
          style: "currency", currency: "IDR", maximumFractionDigits: 0,
        }).format(u.total || 0),
        points:   u.points || 0,
        status:   u.status === "active" ? "Aktif" : "Nonaktif",
        joined:   new Date(u.createdAt).toLocaleDateString("id-ID", {
          month: "short", year: "numeric",
        }),
        ref:      `USR${String(u.id).padStart(4, "0")}`,
        avatar:   u.avatar || u.fullName?.charAt(0).toUpperCase() || "U",
      }));

      setAllUsers(mapped);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── DERIVED LISTS ─────────────────────────────────────────────
  const customers = allUsers.filter(u => u.role === "customer");
  const operators = allUsers.filter(u => u.role === "operator" || u.role === "admin");

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOperators = operators.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── BLOCK / UNBLOCK ───────────────────────────────────────────
  const toggleStatus = async (user: UserRow) => {
    try {
      setActionId(user.id);
      const newStatus = user.status === "Aktif" ? "blocked" : "active";
      const res = await fetch(`${API}/api/admin/users/${user.id}/status`, {
        method:  "PATCH",
        headers: authHeader,
        body:    JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal update status");
      await fetchUsers();
      // Update drawer jika sedang dibuka
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus === "active" ? "Aktif" : "Nonaktif" } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  // ── CHANGE ROLE ───────────────────────────────────────────────
  const changeRole = async (user: UserRow, role: UserRole) => {
    try {
      setActionId(user.id);
      const res = await fetch(`${API}/api/admin/users/${user.id}/role`, {
        method:  "PATCH",
        headers: authHeader,
        body:    JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Gagal update role");
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold"
            style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>
            Manajemen Pengguna
          </h1>
          <p className="text-sm mt-0.5"
            style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Kelola customer, operator, dan broadcast notifikasi
          </p>
        </div>
        {activeTab === 1 && (
          <button
            onClick={() => setShowAddStaff(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
            <Plus size={14} /> Tambah Operator
          </button>
        )}
        {activeTab === 2 && (
          <button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
            <Send size={14} /> Kirim Broadcast
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit"
        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => { setActiveTab(i); setSearch(""); }}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === i ? v("--c-card") : "transparent",
              color: activeTab === i ? v("--c-text") : v("--c-text-sec"),
              fontFamily: "'Inter',sans-serif",
            }}>
            {t}
            {i === 0 && customers.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "rgba(46,125,50,0.15)", color: "var(--c-primary)" }}>
                {customers.length}
              </span>
            )}
            {i === 1 && operators.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>
                {operators.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: CUSTOMER ─────────────────────────────────────── */}
      {activeTab === 0 && (
        <div>
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: v("--c-text-sec") }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari customer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none max-w-md"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                    {["Customer", "Email", "HP", "Pesanan", "Total Belanja", "Poin", "Status", "Aksi"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm"
                        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm"
                        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        Tidak ada customer ditemukan
                      </td>
                    </tr>
                  ) : filteredCustomers.map((c, i) => (
                    <tr key={c.id} className="hover:opacity-90 cursor-pointer transition-all"
                      onClick={() => setSelectedUser(c)}
                      style={{ borderBottom: i < filteredCustomers.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#1E3A5F,#F97316)" }}>
                            {c.avatar}
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap"
                            style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.name}</span>
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
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: c.status === "Aktif" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                            color: c.status === "Aktif" ? "#10B981" : "#EF4444",
                            fontFamily: "'Inter',sans-serif",
                          }}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}
                            onClick={e => { e.stopPropagation(); setSelectedUser(c); }}>
                            <Eye size={12} />
                          </button>
                          <button
                            disabled={actionId === c.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
                            style={{ background: c.status === "Aktif" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", color: c.status === "Aktif" ? "#EF4444" : "#10B981" }}
                            title={c.status === "Aktif" ? "Blokir" : "Aktifkan"}
                            onClick={e => { e.stopPropagation(); toggleStatus(c); }}>
                            {c.status === "Aktif" ? <UserX size={12} /> : <UserCheck size={12} />}
                          </button>
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

      {/* ── TAB: OPERATOR ─────────────────────────────────────── */}
      {activeTab === 1 && (
        <div>
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: v("--c-text-sec") }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari operator atau admin..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none max-w-md"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
          </div>

          {loading ? (
            <div className="text-center py-16 text-sm" style={{ color: v("--c-text-sec") }}>Memuat data...</div>
          ) : filteredOperators.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: v("--c-text-sec") }}>Belum ada operator atau admin</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOperators.map((op, i) => (
                <motion.div key={op.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-5 transition-all hover:-translate-y-1"
                  style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>

                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white"
                      style={{ background: "var(--c-gradient-r)", fontSize: "1.2rem" }}>
                      {op.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{op.name}</p>
                      <p className="text-xs truncate" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{op.email}</p>
                    </div>
                    {/* Role badge */}
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{ background: ROLE_COLOR[op.role].bg, color: ROLE_COLOR[op.role].text, fontFamily: "'Inter',sans-serif" }}>
                      {op.role === "admin" ? "Admin" : "Operator"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    {[
                      { label: "Pesanan", value: op.orders, icon: <BarChart2 size={14} /> },
                      { label: "Poin",    value: op.points, icon: <CheckCircle size={14} /> },
                      { label: "Bergabung", value: op.joined, icon: <Clock size={14} /> },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="p-2 rounded-xl" style={{ background: v("--c-bg-sec") }}>
                        <div className="flex justify-center mb-1" style={{ color: v("--c-primary") }}>{icon}</div>
                        <p className="font-bold text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{value}</p>
                        <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: op.status === "Aktif" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                        color: op.status === "Aktif" ? "#10B981" : "#EF4444",
                        fontFamily: "'Inter',sans-serif",
                      }}>{op.status}</span>

                    <div className="flex gap-1 ml-auto">
                      {/* Toggle role operator ↔ admin */}
                      <button
                        disabled={actionId === op.id}
                        title={op.role === "admin" ? "Jadikan Operator" : "Jadikan Admin"}
                        onClick={() => changeRole(op, op.role === "admin" ? "operator" : "admin")}
                        className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
                        style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }}>
                        {op.role === "admin" ? <Shield size={12} /> : <ShieldCheck size={12} />}
                      </button>
                      {/* Blokir / Aktifkan */}
                      <button
                        disabled={actionId === op.id}
                        title={op.status === "Aktif" ? "Blokir" : "Aktifkan"}
                        onClick={() => toggleStatus(op)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
                        style={{ background: op.status === "Aktif" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", color: op.status === "Aktif" ? "#EF4444" : "#10B981" }}>
                        {op.status === "Aktif" ? <UserX size={12} /> : <UserCheck size={12} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: BROADCAST ────────────────────────────────────── */}
      {activeTab === 2 && (
        <div className="space-y-5">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Riwayat Broadcast</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                  {["Judul", "Target", "Penerima", "Tanggal"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
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

      {/* ── CUSTOMER DETAIL DRAWER ────────────────────────────── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)} />
            <motion.div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col overflow-hidden"
              style={{ background: v("--c-card"), borderLeft: `1px solid ${v("--c-border")}` }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}>

              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Detail Customer</h2>
                <button onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
                    style={{ background: "linear-gradient(135deg,#1E3A5F,#F97316)" }}>
                    {selectedUser.avatar}
                  </div>
                  <h3 className="font-bold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{selectedUser.name}</h3>
                  <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{selectedUser.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: selectedUser.status === "Aktif" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                        color: selectedUser.status === "Aktif" ? "#10B981" : "#EF4444",
                      }}>{selectedUser.status}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: ROLE_COLOR[selectedUser.role].bg, color: ROLE_COLOR[selectedUser.role].text }}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Pesanan", value: selectedUser.orders },
                    { label: "Poin",    value: selectedUser.points },
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
                    <code className="text-sm font-bold flex-1"
                      style={{ color: "var(--c-primary)", fontFamily: "'JetBrains Mono',monospace" }}>
                      {selectedUser.ref}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedUser.ref)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                      style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}>
                      Salin
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>TOTAL BELANJA</p>
                  <p className="font-bold text-xl" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{selectedUser.total}</p>
                </div>
              </div>

              <div className="p-5 flex gap-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                  <Send size={13} className="inline mr-1.5" /> Kirim Notifikasi
                </button>
                <button
                  disabled={actionId === selectedUser.id}
                  onClick={() => toggleStatus(selectedUser)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{
                    background: selectedUser.status === "Aktif" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                    color: selectedUser.status === "Aktif" ? "#EF4444" : "#10B981",
                    fontFamily: "'Inter',sans-serif",
                  }}>
                  {selectedUser.status === "Aktif" ? <UserX size={14} /> : <UserCheck size={14} />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── BROADCAST MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {showBroadcast && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBroadcast(false)} />
            <motion.div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[480px]"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Kirim Broadcast</h2>
                <button onClick={() => setShowBroadcast(false)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Target Penerima</label>
                  <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                    <option>Semua Customer</option>
                    <option>Customer Aktif</option>
                    <option>Custom (filter)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Judul Pesan</label>
                  <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" placeholder="Judul broadcast..."
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Isi Pesan</label>
                  <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" placeholder="Tulis pesan di sini..."
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowBroadcast(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Batal</button>
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                    <Send size={13} /> Kirim Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── ADD STAFF MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {showAddStaff && <AddStaffModal authHeader={authHeader} onClose={() => setShowAddStaff(false)} onSuccess={fetchUsers} />}
      </AnimatePresence>
    </div>
  );
}

// ── ADD STAFF MODAL ──────────────────────────────────────────────
function AddStaffModal({
  authHeader,
  onClose,
  onSuccess,
}: {
  authHeader: HeadersInit;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

  const [form, setForm] = useState({
    fullName: "", email: "", phoneNumber: "", password: "", role: "operator",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!form.fullName || !form.email || !form.phoneNumber || !form.password) {
      setError("Semua field wajib diisi"); return;
    }
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API}/api/admin/users`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Gagal membuat akun"); return; }
      onSuccess();
      onClose();
    } catch {
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />
      <motion.div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[440px]"
        style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Tambah Staff</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          {error && (
            <div className="px-4 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>{error}</div>
          )}
          {(["fullName", "email", "phoneNumber", "password"] as const).map(field => (
            <div key={field}>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                {{ fullName: "Nama Lengkap", email: "Email", phoneNumber: "Nomor HP", password: "Password" }[field]}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Role</label>
            <div className="flex gap-2">
              {(["operator", "admin"] as const).map(r => (
                <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: form.role === r ? ROLE_COLOR[r].bg : v("--c-bg-sec"),
                    color: form.role === r ? ROLE_COLOR[r].text : v("--c-text-sec"),
                    border: `1px solid ${form.role === r ? ROLE_COLOR[r].text : v("--c-border")}`,
                    fontFamily: "'Inter',sans-serif",
                  }}>
                  {r === "admin" ? "Admin" : "Operator"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Batal</button>
            <button onClick={submit} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
              {loading ? "Menyimpan..." : "Buat Akun"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}