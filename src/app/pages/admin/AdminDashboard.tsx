import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Wallet, TrendingUp, Package, Inbox, Users, AlertTriangle,
  ArrowUp, ArrowDown, Download, RefreshCw, ShoppingCart,
  CheckCircle, XCircle, type LucideIcon,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area,
} from "recharts";
import { v } from "../../components/pageUtils";
import { useAuth } from "../../hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = (import.meta.env.VITE_API_URL ?? "http://localhost:3001/api").replace(/\/api$/, "");

/* ── Types (cocok dengan response GET /api/dashboard) ─────────── */
type DashboardData = {
  kpi: {
    revenueToday: number;
    revenueTodayTrendPct: number | null;
    revenueThisMonth: number;
    revenueThisMonthTrendPct: number | null;
    activeOrders: number;
    newOrdersToday: number;
    newOrdersTodayTrendPct: number | null;
    newCustomersToday: number;
    newCustomersTodayTrendPct: number | null;
  };
  revenueTrend30: { day: string; revenue: number }[];
  weeklyOrders: { week: string; orders: number }[];
  topProducts: { name: string; qty: number }[];
  customerTrend: { month: string; baru: number; kembali: number }[];
  recentOrders: {
    id: number;
    customer: string;
    product: string;
    extraItems: number;
    totalPrice: number;
    status: "pending" | "processing" | "completed" | "cancelled";
  }[];
  recentCustomers: { name: string; email: string; orders: number; total: number; createdAt: string }[];
  lowStockMaterials: { name: string; stock: number; threshold: number; unit: string }[];
  liveFeed: { type: "new" | "processing" | "completed" | "cancelled"; text: string; time: string }[];
};

/* ── Static UI config (bukan data, cuma tampilan) ──────────────── */
const KPI_CONFIG: {
  key: keyof DashboardData["kpi"];
  trendKey: keyof DashboardData["kpi"] | null;
  label: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
  path: string;
  isCurrency: boolean;
}[] = [
  { key: "revenueToday", trendKey: "revenueTodayTrendPct", label: "Pendapatan Hari Ini", Icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.1)", path: "/admin/laporan", isCurrency: true },
  { key: "revenueThisMonth", trendKey: "revenueThisMonthTrendPct", label: "Pendapatan Bulan Ini", Icon: TrendingUp, color: "#2E7D32", bg: "rgba(46,125,50,0.1)", path: "/admin/laporan", isCurrency: true },
  { key: "activeOrders", trendKey: null, label: "Total Pesanan Aktif", Icon: Package, color: "#F9A825", bg: "rgba(249,168,37,0.1)", path: "/admin/pesanan", isCurrency: false },
  { key: "newOrdersToday", trendKey: "newOrdersTodayTrendPct", label: "Pesanan Baru Hari Ini", Icon: Inbox, color: "#06B6D4", bg: "rgba(6,182,212,0.1)", path: "/admin/pesanan", isCurrency: false },
  { key: "newCustomersToday", trendKey: "newCustomersTodayTrendPct", label: "Customer Baru Hari Ini", Icon: Users, color: "#7C3AED", bg: "rgba(124,58,237,0.1)", path: "/admin/pengguna", isCurrency: false },
];

const STATUS_MAP: Record<string, string> = {
  pending: "Menunggu Bayar",
  processing: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_COLOR: Record<string, string> = {
  "Menunggu Bayar": "#EAB308",
  "Diproses": "var(--c-primary)",
  "Selesai": "#10B981",
  "Dibatalkan": "#EF4444",
};

const FEED_ICON: Record<DashboardData["liveFeed"][number]["type"], { Icon: LucideIcon; color: string }> = {
  new: { Icon: ShoppingCart, color: "#2E7D32" },
  processing: { Icon: RefreshCw, color: "var(--c-primary)" },
  completed: { Icon: CheckCircle, color: "#10B981" },
  cancelled: { Icon: XCircle, color: "#EF4444" },
};

/* ── Helpers ────────────────────────────────────────────────────── */
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatCompactRupiah = (n: number) =>
  n >= 1_000_000 ? `Rp ${(n / 1_000_000).toFixed(1)} Jt` : formatRupiah(n);

const formatRelativeTime = (iso: string) => {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return `${Math.floor(diffHour / 24)} hari lalu`;
};

const formatJoined = (iso: string) => {
  const diffDay = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDay <= 0) return "Hari ini";
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return `${Math.floor(diffDay / 7)} mgg lalu`;
};

const todayLabel = new Date().toLocaleDateString("id-ID", {
  weekday: "long", day: "2-digit", month: "long", year: "numeric",
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <p className="text-xs font-semibold mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
      {payload.map((p: any, idx: number) => (
        <p key={`${p.name}-${idx}`} className="text-sm font-bold" style={{ color: p.color, fontFamily: "'Inter',sans-serif" }}>
          {typeof p.value === "number" && p.value > 10000 ? formatCompactRupiah(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Component ──────────────────────────────────────────────────── */
export function AdminDashboard() {
  const { authHeader } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`${API}/api/dashboard`, { headers: authHeader as HeadersInit });
      if (!res.ok) throw new Error("Gagal mengambil data dashboard");
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data dashboard. Coba refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authHeader]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleExportPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const today = new Date().toLocaleDateString("id-ID", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    const formatRp = (n: number) =>
      new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

    // ── Header ──
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Laporan Dashboard Admin", 14, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(today, 14, 21);
    doc.text(`Diekspor: ${new Date().toLocaleTimeString("id-ID")}`, 150, 21);
    doc.setTextColor(0, 0, 0);

    // ── KPI Summary ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Ringkasan KPI", 14, 36);
    autoTable(doc, {
      startY: 40,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Pendapatan Hari Ini",   formatRp(data.kpi.revenueToday)],
        ["Pendapatan Bulan Ini",  formatRp(data.kpi.revenueThisMonth)],
        ["Total Pesanan Aktif",   String(data.kpi.activeOrders)],
        ["Pesanan Baru Hari Ini", String(data.kpi.newOrdersToday)],
        ["Customer Baru Hari Ini",String(data.kpi.newCustomersToday)],
      ],
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { fontStyle: "bold" } },
      alternateRowStyles: { fillColor: [245, 250, 245] },
    });

    // ── Trend Pendapatan 30 Hari ──
    const afterKPI = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Trend Pendapatan 30 Hari Terakhir", 14, afterKPI);
    autoTable(doc, {
      startY: afterKPI + 4,
      head: [["Tanggal", "Pendapatan (Rp)"]],
      body: data.revenueTrend30.map(d => [d.day, formatRp(d.revenue)]),
      styles:     { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 250, 245] },
    });

    // ── Pesanan Terbaru (halaman baru) ──
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("5 Pesanan Terbaru", 14, 18);
    autoTable(doc, {
      startY: 22,
      head: [["No. Pesanan", "Customer", "Produk", "Total", "Status"]],
      body: data.recentOrders.map(o => [
        `ORD-${String(o.id).padStart(4, "0")}`,
        o.customer,
        o.product + (o.extraItems > 0 ? ` +${o.extraItems} lainnya` : ""),
        formatRp(o.totalPrice),
        { pending: "Menunggu Bayar", processing: "Diproses", completed: "Selesai", cancelled: "Dibatalkan" }[o.status] ?? o.status,
      ]),
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 250, 245] },
    });

    // ── Produk Terlaris ──
    const afterOrders = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Produk Terlaris", 14, afterOrders);
    autoTable(doc, {
      startY: afterOrders + 4,
      head: [["Produk", "Qty Terjual"]],
      body: data.topProducts.map(p => [p.name, String(p.qty)]),
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 250, 245] },
    });

    // ── Customer Terbaru ──
    const afterProducts = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("5 Customer Terbaru", 14, afterProducts);
    autoTable(doc, {
      startY: afterProducts + 4,
      head: [["Nama", "Email", "Pesanan", "Total Belanja"]],
      body: data.recentCustomers.map(c => [c.name, c.email, String(c.orders), formatRp(c.total)]),
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 250, 245] },
    });

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Halaman ${i} dari ${pageCount}`, 14, 290);
      doc.text("Dokumen ini digenerate otomatis oleh sistem", 105, 290, { align: "center" });
    }

    doc.save(`dashboard-laporan-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="p-5 md:p-7 flex items-center justify-center" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
        <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Memuat dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-5 md:p-7 flex flex-col items-center justify-center gap-3" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
        <p className="text-sm" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>{error || "Data tidak tersedia"}</p>
        <button onClick={fetchDashboard} className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-7 space-y-6" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", color: v("--c-text") }}>
            Dashboard Admin
          </h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            {todayLabel} — Selamat datang kembali!
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 disabled:opacity-60"
            style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handleExportPDF}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white disabled:opacity-50 transition-all"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPI_CONFIG.map(({ key, trendKey, label, Icon, color, bg, path, isCurrency }, i) => {
          const value = data.kpi[key] as number;
          const trend = trendKey ? (data.kpi[trendKey] as number | null) : null;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
              <Link to={path} className="block rounded-2xl p-4 transition-all duration-200"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  {trend !== null && (
                    <div className="flex items-center gap-0.5 text-xs font-semibold"
                      style={{ color: trend >= 0 ? "#10B981" : "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                      {trend >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {Math.abs(trend)}%
                    </div>
                  )}
                </div>
                <p className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "1.2rem", color: v("--c-text"), lineHeight: 1 }}>
                  {isCurrency ? formatCompactRupiah(value) : value}
                </p>
                <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Trend Pendapatan 30 Hari</h2>
            <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tidak termasuk pesanan yang dibatalkan</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.revenueTrend30}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#64748B" }} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Jt`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row 2: Volume Pesanan + Produk Terlaris + Customer Trend (3 kolom, tidak ada lagi Distribusi Pembayaran) */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Volume Pesanan / Minggu</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weeklyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#F9A825" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Produk Terlaris</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-xs text-center py-10" style={{ color: v("--c-text-sec") }}>Belum ada data penjualan</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748B" }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="qty" fill="#1B5E20" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Customer Baru vs Kembali</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.customerTrend}>
              <defs>
                <linearGradient id="newCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F9A825" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F9A825" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="retCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="baru" name="Baru" stroke="#F9A825" fill="url(#newCust)" strokeWidth={2} />
              <Area type="monotone" dataKey="kembali" name="Kembali" stroke="#2E7D32" fill="url(#retCust)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom: Tables + Live Feed */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Recent Orders */}
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>5 Pesanan Terbaru</h2>
              <Link to="/admin/pesanan" className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Lihat Semua →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                    {["No. Pesanan", "Customer", "Produk", "Total", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-xs" style={{ color: v("--c-text-sec") }}>Belum ada pesanan</td></tr>
                  ) : data.recentOrders.map((o, i) => {
                    const label = STATUS_MAP[o.status] ?? o.status;
                    return (
                      <tr key={o.id} style={{ borderBottom: i < data.recentOrders.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                        <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: v("--c-primary") }}>
                          #ORD-{String(o.id).padStart(4, "0")}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{o.customer}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          {o.product}{o.extraItems > 0 ? ` +${o.extraItems} lainnya` : ""}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{formatRupiah(o.totalPrice)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: (STATUS_COLOR[label] ?? "#888") + "20", color: STATUS_COLOR[label] ?? "#888", fontFamily: "'Inter',sans-serif" }}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
                    {["Nama", "Email", "Pesanan", "Total Belanja", "Bergabung"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentCustomers.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-xs" style={{ color: v("--c-text-sec") }}>Belum ada customer</td></tr>
                  ) : data.recentCustomers.map((c, i) => (
                    <tr key={c.email} style={{ borderBottom: i < data.recentCustomers.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
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
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{formatRupiah(c.total)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{formatJoined(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alert: Stok Bahan Menipis (satu-satunya alert yang datanya nyata) */}
          {data.lowStockMaterials.length > 0 ? (
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                <AlertTriangle size={15} style={{ color: "#EF4444" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#EF4444", fontFamily: "'Poppins',sans-serif" }}>Stok Bahan Menipis</p>
                <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  {data.lowStockMaterials.map((m) => m.name).join(", ")} — di bawah threshold
                </p>
                <Link to="/admin/inventaris" className="text-xs font-semibold mt-1 inline-block" style={{ color: "#EF4444" }}>Lihat Stok →</Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
                <CheckCircle size={15} style={{ color: "#10B981" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#10B981", fontFamily: "'Poppins',sans-serif" }}>Stok Bahan Aman</p>
                <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Semua bahan masih di atas threshold</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, height: "fit-content" }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Aktivitas Terbaru</h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 500 }}>
            {data.liveFeed.length === 0 ? (
              <p className="text-xs text-center py-10" style={{ color: v("--c-text-sec") }}>Belum ada aktivitas</p>
            ) : data.liveFeed.map((item, i) => {
              const { Icon, color } = FEED_ICON[item.type];
              return (
                <motion.div key={`feed-${i}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="px-4 py-3 flex items-start gap-3" style={{ borderBottom: i < data.liveFeed.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                  <Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color }} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{item.text}</p>
                    <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{formatRelativeTime(item.time)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}