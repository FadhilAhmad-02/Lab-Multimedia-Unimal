import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Wallet, TrendingUp, Package, Inbox, Users, AlertTriangle,
  ArrowUp, ArrowDown, Download, RefreshCw, ShoppingBag,
  ShoppingCart, CreditCard, CheckCircle, XCircle, type LucideIcon,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { v } from "../../components/pageUtils";

/* ── Mock Data ──────────────────────────────────────────────── */
const REVENUE_30 = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  revenue: Math.floor(Math.random() * 8000000) + 2000000,
}));

const WEEKLY_ORDERS = [
  { week: "Mg 1", orders: 42 }, { week: "Mg 2", orders: 58 },
  { week: "Mg 3", orders: 35 }, { week: "Mg 4", orders: 71 },
];

const PAYMENT_DIST = [
  { name: "Transfer Manual", value: 35, color: "#2E7D32" },
  { name: "QRIS",            value: 28, color: "#F9A825" },
  { name: "Virtual Account", value: 22, color: "#7C3AED" },
  { name: "GoPay/OVO",       value: 15, color: "#10B981" },
];

const TOP_PRODUCTS = [
  { name: "Banner Vinyl",  qty: 184 },
  { name: "Kartu Nama UV", qty: 156 },
  { name: "Mug Custom",    qty: 132 },
  { name: "Brosur A5",     qty: 120 },
  { name: "Stiker Vinyl",  qty: 98  },
  { name: "Spanduk",       qty: 87  },
  { name: "Paper Bag",     qty: 75  },
  { name: "Undangan",      qty: 63  },
  { name: "Backdrop",      qty: 51  },
  { name: "X-Banner",      qty: 44  },
];

const CUSTOMER_TREND = Array.from({ length: 6 }, (_, i) => ({
  month: ["Sep", "Okt", "Nov", "Des", "Jan", "Feb"][i],
  baru: Math.floor(Math.random() * 40) + 10,
  kembali: Math.floor(Math.random() * 80) + 30,
}));

const LIVE_FEED: { Icon: LucideIcon; text: string; time: string; color: string }[] = [
  { Icon: ShoppingCart, text: "Pesanan baru dari Siti Rahayu — Banner Vinyl 100×200", time: "Baru saja",    color: "#2E7D32" },
  { Icon: CreditCard,   text: "Pembayaran dikonfirmasi #ORD-2025-0048",               time: "2 mnt lalu",  color: "#10B981" },
  { Icon: CheckCircle,  text: "Pesanan #ORD-2025-0042 selesai diproduksi",            time: "5 mnt lalu",  color: "#10B981" },
  { Icon: ShoppingCart, text: "Pesanan baru dari Ahmad Fauzi — Kartu Nama (500)",     time: "8 mnt lalu",  color: "#2E7D32" },
  { Icon: XCircle,      text: "Pesanan #ORD-2025-0039 dibatalkan oleh customer",      time: "12 mnt lalu", color: "#EF4444" },
  { Icon: CreditCard,   text: "Pembayaran dikonfirmasi #ORD-2025-0044",               time: "15 mnt lalu", color: "#10B981" },
  { Icon: ShoppingCart, text: "Pesanan baru dari Dewi Fatimah — Undangan 200pcs",     time: "20 mnt lalu", color: "#2E7D32" },
  { Icon: CheckCircle,  text: "Pesanan #ORD-2025-0040 selesai diproduksi",            time: "28 mnt lalu", color: "#10B981" },
];

const RECENT_ORDERS = [
  { id: "ORD-2025-0048", customer: "Siti Rahayu",    product: "Banner Vinyl",      total: "Rp 240.000",   status: "Menunggu Bayar" },
  { id: "ORD-2025-0047", customer: "Ahmad Fauzi",    product: "Kartu Nama UV",     total: "Rp 175.000",   status: "Diproses" },
  { id: "ORD-2025-0046", customer: "Dewi Fatimah",   product: "Undangan 200pcs",   total: "Rp 1.200.000", status: "Diproses" },
  { id: "ORD-2025-0045", customer: "Budi Santoso",   product: "Mug Custom (10)",   total: "Rp 350.000",   status: "Dikirim" },
  { id: "ORD-2025-0044", customer: "Rizky Pratama",  product: "Spanduk 3×1m",      total: "Rp 180.000",   status: "Selesai" },
];

const RECENT_CUSTOMERS = [
  { name: "Siti Rahayu",     email: "siti@email.com",   orders: 1, total: "Rp 240.000",   joined: "Hari ini" },
  { name: "Dewi Fatimah",    email: "dewi@email.com",   orders: 3, total: "Rp 2.100.000", joined: "Kemarin" },
  { name: "Rizky Pratama",   email: "rizky@email.com",  orders: 5, total: "Rp 890.000",   joined: "3 hari lalu" },
  { name: "Nurul Hidayah",   email: "nurul@email.com",  orders: 2, total: "Rp 560.000",   joined: "5 hari lalu" },
  { name: "Muhammad Iqbal",  email: "iqbal@email.com",  orders: 8, total: "Rp 3.400.000", joined: "1 mgg lalu" },
];

const STATUS_COLOR: Record<string, string> = {
  "Menunggu Bayar": "#EAB308",
  "Diproses":       "#2E7D32",
  "Dikirim":        "#7C3AED",
  "Selesai":        "#10B981",
  "Dibatalkan":     "#EF4444",
};

const KPI_CARDS = [
  { label: "Pendapatan Hari Ini",   value: "Rp 4,2 Jt", Icon: Wallet,        color: "#10B981", bg: "rgba(16,185,129,0.1)",  trend: "+12%", up: true,  path: "/admin/keuangan" },
  { label: "Pendapatan Bulan Ini",  value: "Rp 87,6 Jt", Icon: TrendingUp,   color: "#2E7D32", bg: "rgba(46,125,50,0.1)",   trend: "+8%",  up: true,  path: "/admin/laporan" },
  { label: "Total Pesanan Aktif",   value: "23",          Icon: Package,      color: "#F9A825", bg: "rgba(249,168,37,0.1)",  trend: "+5%",  up: true,  path: "/admin/pesanan" },
  { label: "Pesanan Baru Hari Ini", value: "7",           Icon: Inbox,        color: "#06B6D4", bg: "rgba(6,182,212,0.1)",   trend: "-2%",  up: false, path: "/admin/pesanan" },
  { label: "Customer Baru",         value: "14",          Icon: Users,        color: "#7C3AED", bg: "rgba(124,58,237,0.1)",  trend: "+18%", up: true,  path: "/admin/pengguna" },
  { label: "Pesanan Terlambat",     value: "3",           Icon: AlertTriangle,color: "#EF4444", bg: "rgba(239,68,68,0.1)",   trend: "-1",   up: false, path: "/admin/pesanan" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <p className="text-xs font-semibold mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
      {payload.map((p: any, idx: number) => (
        <p key={`${p.name}-${idx}`} className="text-sm font-bold" style={{ color: p.color, fontFamily: "'Inter',sans-serif" }}>
          {typeof p.value === "number" && p.value > 10000
            ? `Rp ${(p.value / 1000000).toFixed(1)} Jt`
            : p.value}
        </p>
      ))}
    </div>
  );
};

export function AdminDashboard() {
  const [, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="p-5 md:p-7 space-y-6" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", color: v("--c-text") }}>
            Dashboard Admin
          </h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Selasa, 24 Februari 2026 — Selamat datang, Super Admin!
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200"
            style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
            <Download size={14} /> Export Laporan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map(({ label, value, Icon, color, bg, trend, up, path }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <Link to={path} className="block rounded-2xl p-4 transition-all duration-200"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: up ? "#10B981" : "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                  {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {trend}
                </div>
              </div>
              <p className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "1.3rem", color: v("--c-text"), lineHeight: 1 }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Trend Pendapatan 30 Hari</h2>
            <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Update real-time setiap hari</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", fontFamily: "'Inter',sans-serif" }}>+8% bulan ini</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={REVENUE_30}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2E7D32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748B" }} tickFormatter={val => `${(val / 1000000).toFixed(0)}Jt`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Weekly Orders */}
        <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Volume Pesanan per Minggu</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_ORDERS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#F9A825" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Distribution */}
        <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Distribusi Metode Pembayaran</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie data={PAYMENT_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {PAYMENT_DIST.map((entry, i) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {PAYMENT_DIST.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{name}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top Products — defs at chart root, NOT inside <Bar> */}
        <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>10 Produk Terlaris</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TOP_PRODUCTS} layout="vertical">
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#1B5E20" />
                  <stop offset="100%" stopColor="#F9A825" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748B" }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="qty" fill="url(#prodGrad)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Trend */}
        <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Customer Baru vs Kembali</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CUSTOMER_TREND}>
              <defs>
                <linearGradient id="newCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F9A825" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F9A825" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="retCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2E7D32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="baru"    name="Customer Baru"    stroke="#F9A825" fill="url(#newCust)" strokeWidth={2} />
              <Area type="monotone" dataKey="kembali" name="Customer Kembali" stroke="#2E7D32" fill="url(#retCust)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom: Tables + Live Feed */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Orders + Customers + Alerts */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>5 Pesanan Terbaru</h2>
              <Link to="/admin/pesanan" className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Lihat Semua →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                    {["No. Pesanan", "Customer", "Produk", "Total", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((o, i) => (
                    <tr key={o.id} style={{ borderBottom: i < RECENT_ORDERS.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                      <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: v("--c-primary") }}>{o.id}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{o.customer}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{o.product}</td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{o.total}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: STATUS_COLOR[o.status] + "20", color: STATUS_COLOR[o.status], fontFamily: "'Inter',sans-serif" }}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>5 Customer Terbaru</h2>
              <Link to="/admin/pengguna" className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Lihat Semua →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                    {["Nama", "Email", "Pesanan", "Total Belanja", "Bergabung"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_CUSTOMERS.map((c, i) => (
                    <tr key={c.email} style={{ borderBottom: i < RECENT_CUSTOMERS.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "var(--c-gradient-r)" }}>
                            {c.name[0]}
                          </div>
                          <span className="text-xs font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{c.email}</td>
                      <td className="px-4 py-3 text-xs text-center font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.orders}</td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{c.total}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{c.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(234,179,8,0.15)" }}>
                <ShoppingBag size={15} style={{ color: "#EAB308" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#EAB308", fontFamily: "'Poppins',sans-serif" }}>Pesanan Menunggu</p>
                <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>5 pesanan belum diambil operator &gt;24 jam</p>
                <Link to="/admin/pesanan" className="text-xs font-semibold mt-1 inline-block" style={{ color: "#EAB308" }}>Lihat Sekarang →</Link>
              </div>
            </div>
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                <AlertTriangle size={15} style={{ color: "#EF4444" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#EF4444", fontFamily: "'Poppins',sans-serif" }}>Stok Bahan Menipis</p>
                <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Flexi Korea, Vinyl — di bawah threshold</p>
                <Link to="/admin/produk" className="text-xs font-semibold mt-1 inline-block" style={{ color: "#EF4444" }}>Lihat Stok →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, height: "fit-content" }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Aktivitas Live</h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 500 }}>
            {LIVE_FEED.map((item, i) => (
              <motion.div key={`feed-${i}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="px-4 py-3 flex items-start gap-3" style={{ borderBottom: i < LIVE_FEED.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                <item.Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color: item.color }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{item.text}</p>
                  <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
