import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Download, Calendar, TrendingUp, Users, Package, Clock, ChevronDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { v } from "../../components/pageUtils";

// ── Konstanta ────────────────────────────────────────────────
const TABS = ["Penjualan", "Operator", "Customer", "Operasional"];

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const HOURS = ["06", "08", "10", "12", "14", "16", "18", "20", "22", "00", "02", "04"];

const PERIOD_OPTIONS = [
  { label: "Bulan Ini",    value: "bulan_ini" },
  { label: "7 Hari",       value: "7hari" },
  { label: "30 Hari",      value: "30hari" },
  { label: "3 Bulan",      value: "3bulan" },
  { label: "Tahun Ini",    value: "tahun_ini" },
];

const API_BASE = "http://localhost:3001/api/laporan";

// ── Types ────────────────────────────────────────────────────
interface PenjualanItem {
  product: string;
  category: string;
  qty: number;
  revenue: number;
  persen: number;
}

interface PenjualanData {
  kpi: { totalTransaksi: number; totalPendapatan: number; totalPcs: number; avgPesanan: number };
  penjualanData: PenjualanItem[];
  maxRevenue: number;
}

interface OperatorItem {
  name: string;
  handled: number;
  onTime: number;
  late: number;
  avgTime: number;
}

interface CustomerData {
  customerMonthly: { month: string; baru: number }[];
  pieCustomer: { name: string; value: number; color: string }[];
  topCustomers: { rank: number; name: string; orders: number; total: string; clv: string }[];
}

interface OperasionalData {
  produksiStages: { stage: string; avgHours: number }[];
  heatmap: number[][];
}

// ── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <p className="text-xs font-semibold mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
        {label ?? payload[0]?.payload?.name}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color || "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
          {typeof p.value === "number" && p.value > 10000
            ? `Rp ${(p.value / 1000000).toFixed(1)} Jt`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Loading Skeleton ─────────────────────────────────────────
const Skeleton = ({ h = "h-48" }: { h?: string }) => (
  <div className={`rounded-2xl ${h} animate-pulse`} style={{ background: v("--c-bg-sec") }} />
);

// ── Main Component ───────────────────────────────────────────
export function AdminLaporan() {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState("bulan_ini");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  // Data state per tab
  const [penjualan, setPenjualan] = useState<PenjualanData | null>(null);
  const [operator, setOperator] = useState<{ operatorPerf: OperatorItem[] } | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [operasional, setOperasional] = useState<OperasionalData | null>(null);

  // Loading & error state
  const [loading, setLoading] = useState<Record<number, boolean>>({ 0: false, 1: false, 2: false, 3: false });
  const [error, setError] = useState<Record<number, string | null>>({ 0: null, 1: null, 2: null, 3: null });

  const fetchTab = useCallback(async (tab: number, p: string) => {
    const endpoints = ["penjualan", "operator", "customer", "operasional"];
    const setters = [setPenjualan, setOperator, setCustomer, setOperasional] as const;

    setLoading(prev => ({ ...prev, [tab]: true }));
    setError(prev => ({ ...prev, [tab]: null }));

    try {
      const res = await fetch(`${API_BASE}/${endpoints[tab]}?period=${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      (setters[tab] as any)(data);
    } catch (err: any) {
      setError(prev => ({ ...prev, [tab]: err.message ?? "Gagal memuat data" }));
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, []);

  // Fetch saat tab atau period berubah
  useEffect(() => {
    fetchTab(activeTab, period);
  }, [activeTab, period, fetchTab]);

  const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label ?? "Bulan Ini";
  const isLoading = loading[activeTab];
  const tabError = error[activeTab];

  // ── Render error ────────────────────────────────────────────
  const ErrorBox = ({ msg }: { msg: string }) => (
    <div className="rounded-2xl p-8 text-center" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <p className="text-sm" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>⚠️ {msg}</p>
      <button onClick={() => fetchTab(activeTab, period)} className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
        style={{ background: "#3B6FD4" }}>Coba Lagi</button>
    </div>
  );

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>
            Laporan & Analitik
          </h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Analisis mendalam performa bisnis Anda
          </p>
        </div>
        <div className="flex gap-2">
          {/* Period selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ background: v("--c-card"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}
            >
              <Calendar size={14} /> {periodLabel} <ChevronDown size={12} />
            </button>
            {showPeriodMenu && (
              <div className="absolute right-0 mt-1 rounded-xl shadow-xl z-10 overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, minWidth: 140 }}>
                {PERIOD_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => { setPeriod(opt.value); setShowPeriodMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
                    style={{ color: period === opt.value ? "#3B6FD4" : v("--c-text"), fontFamily: "'Inter',sans-serif", fontWeight: period === opt.value ? 600 : 400 }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto w-fit" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{ background: activeTab === i ? v("--c-card") : "transparent", color: activeTab === i ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Error global */}
      {tabError && <ErrorBox msg={tabError} />}

      {/* ── TAB: PENJUALAN ──────────────────────────────────── */}
      {activeTab === 0 && !tabError && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid sm:grid-cols-4 gap-4">
            {isLoading
              ? [1,2,3,4].map(i => <Skeleton key={i} h="h-24" />)
              : penjualan
                ? [
                    { label: "Total Transaksi",  value: penjualan.kpi.totalTransaksi.toString(), Icon: Package,    color: "#3B6FD4" },
                    { label: "Total Pendapatan",  value: `Rp ${(penjualan.kpi.totalPendapatan / 1000000).toFixed(1)} Jt`, Icon: TrendingUp, color: "#10B981" },
                    { label: "Produk Terjual",    value: `${penjualan.kpi.totalPcs.toLocaleString("id-ID")} pcs`,  Icon: Package,    color: "#F97316" },
                    { label: "Rata-rata Pesanan", value: `Rp ${(penjualan.kpi.avgPesanan / 1000).toFixed(0)}K`,    Icon: TrendingUp, color: "#7C3AED" },
                  ].map(({ label, value, Icon, color }) => (
                    <div key={label} className="rounded-2xl p-4" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={15} style={{ color }} />
                        <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</span>
                      </div>
                      <p className="font-bold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif", fontSize: "1.25rem" }}>{value}</p>
                    </div>
                  ))
                : null}
          </div>

          {/* Grafik */}
          {isLoading
            ? <div className="grid lg:grid-cols-2 gap-5"><Skeleton /><Skeleton /></div>
            : penjualan && (
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Penjualan per Produk (Qty)</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={penjualan.penjualanData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} />
                      <YAxis dataKey="product" type="category" tick={{ fontSize: 9, fill: "#64748B" }} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="qty" fill="#3B6FD4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Pendapatan per Produk</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={penjualan.penjualanData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} tickFormatter={val => `${(val / 1000000).toFixed(0)}Jt`} />
                      <YAxis dataKey="product" type="category" tick={{ fontSize: 9, fill: "#64748B" }} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" fill="#F97316" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          {/* Tabel detail */}
          {isLoading
            ? <Skeleton h="h-64" />
            : penjualan && (
              <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                  <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Detail Penjualan per Produk</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                        {["Produk", "Kategori", "Qty Terjual", "Total Pendapatan", "% dari Total"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {penjualan.penjualanData.map((row, i) => (
                        <tr key={row.product} style={{ borderBottom: i < penjualan.penjualanData.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{row.product}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec") }}>{row.category}</td>
                          <td className="px-4 py-3 text-sm text-center font-semibold" style={{ color: v("--c-text") }}>{row.qty}</td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: v("--c-text") }}>Rp {row.revenue.toLocaleString("id-ID")}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: v("--c-bg-sec"), minWidth: 40 }}>
                                <div className="h-full rounded-full" style={{ width: `${row.persen}%`, background: "linear-gradient(to right,#1E3A5F,#F97316)" }} />
                              </div>
                              <span className="text-xs" style={{ color: v("--c-text-sec") }}>{row.persen}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* ── TAB: OPERATOR ────────────────────────────────────── */}
      {activeTab === 1 && !tabError && (
        <div className="space-y-5">
          {isLoading
            ? <Skeleton h="h-64" />
            : operator && (
              <>
                <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                    <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Performa Operator</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                          {["Nama", "Pesanan Ditangani", "Tepat Waktu", "Terlambat", "% Tepat Waktu", "Avg Waktu"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {operator.operatorPerf.map((op, i) => (
                          <tr key={op.name} style={{ borderBottom: i < operator.operatorPerf.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: v("--c-text") }}>{op.name}</td>
                            <td className="px-4 py-3 text-sm text-center font-bold" style={{ color: v("--c-text") }}>{op.handled}</td>
                            <td className="px-4 py-3 text-sm text-center" style={{ color: "#10B981" }}>{op.onTime}</td>
                            <td className="px-4 py-3 text-sm text-center" style={{ color: "#EF4444" }}>{op.late}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full" style={{ background: v("--c-bg-sec"), minWidth: 50 }}>
                                  <div className="h-full rounded-full" style={{ width: `${Math.round((op.onTime / (op.handled || 1)) * 100)}%`, background: "#10B981" }} />
                                </div>
                                <span className="text-xs font-semibold" style={{ color: "#10B981" }}>
                                  {Math.round((op.onTime / (op.handled || 1)) * 100)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: v("--c-text-sec") }}>{op.avgTime} jam</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Scatter: Volume vs Avg Waktu */}
                <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Volume vs Rata-rata Waktu Pengerjaan</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                      <XAxis dataKey="x" name="Volume" tick={{ fontSize: 11, fill: "#64748B" }}
                        label={{ value: "Volume Pesanan", position: "bottom", fontSize: 11, fill: "#64748B" }} />
                      <YAxis dataKey="y" name="Avg Waktu" tick={{ fontSize: 11, fill: "#64748B" }}
                        label={{ value: "Avg (jam)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748B" }} />
                      <ZAxis range={[100, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter
                        data={operator.operatorPerf.map(op => ({ x: op.handled, y: op.avgTime, name: op.name }))}
                        fill="#F97316"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
        </div>
      )}

      {/* ── TAB: CUSTOMER ────────────────────────────────────── */}
      {activeTab === 2 && !tabError && (
        <div className="space-y-5">
          {isLoading
            ? <div className="grid lg:grid-cols-2 gap-5"><Skeleton /><Skeleton /></div>
            : customer && (
              <>
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                    <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Akuisisi Customer Baru per Bulan</h2>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={customer.customerMonthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="baru" stroke="#F97316" strokeWidth={2.5} dot={{ r: 4, fill: "#F97316" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                    <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Customer Baru vs Kembali</h2>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="55%" height={160}>
                        <PieChart>
                          <Pie data={customer.pieCustomer} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                            {customer.pieCustomer.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {customer.pieCustomer.map(({ name, value, color }) => (
                          <div key={name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                            <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                              {name}: <strong style={{ color: v("--c-text") }}>{value}%</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 5 Customer */}
                <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                    <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Top 5 Customer</h2>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                        {["#", "Nama", "Total Pesanan", "Total Belanja", "Estimated CLV"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customer.topCustomers.map((c, i) => (
                        <tr key={c.rank} style={{ borderBottom: i < customer.topCustomers.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                          <td className="px-4 py-3">
                            <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold"
                              style={{ background: i < 3 ? "linear-gradient(135deg,#F97316,#FACC15)" : v("--c-bg-sec"), color: i < 3 ? "#fff" : v("--c-text-sec") }}>
                              {c.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: v("--c-text") }}>{c.name}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: v("--c-text-sec") }}>{c.orders}</td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: v("--c-text") }}>{c.total}</td>
                          <td className="px-4 py-3 text-sm font-bold" style={{ color: "#10B981" }}>{c.clv}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
        </div>
      )}

      {/* ── TAB: OPERASIONAL ─────────────────────────────────── */}
      {activeTab === 3 && !tabError && (
        <div className="space-y-5">
          {isLoading
            ? <><Skeleton /><Skeleton /></>
            : operasional && (
              <>
                {/* Rata-rata waktu per tahap */}
                <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Rata-rata Waktu per Tahap Produksi</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={operasional.produksiStages}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                      <XAxis dataKey="stage" tick={{ fontSize: 9, fill: "#64748B" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} label={{ value: "Jam", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748B" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgHours" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Heatmap */}
                <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Heatmap Pesanan per Jam × Hari</h2>
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 mb-2 pl-10">
                      {HOURS.map(h => (
                        <div key={h} className="text-center flex-1 min-w-[28px] text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</div>
                      ))}
                    </div>
                    {operasional.heatmap.map((row, dayIdx) => (
                      <div key={dayIdx} className="flex items-center gap-2 mb-1.5">
                        <span className="w-8 text-xs text-right" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{DAYS[dayIdx]}</span>
                        <div className="flex gap-2 flex-1">
                          {row.map((val, hIdx) => {
                            const maxVal = Math.max(...operasional.heatmap.flat(), 1);
                            return (
                              <div key={hIdx} className="flex-1 min-w-[28px] h-7 rounded"
                                title={`${DAYS[dayIdx]} ${HOURS[hIdx]}:00 — ${val} pesanan`}
                                style={{
                                  background: val === 0 ? v("--c-bg-sec") : `rgba(59,111,212,${Math.min(0.9, val / maxVal)})`,
                                  border: `1px solid ${v("--c-border")}`
                                }} />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-4 pl-10">
                      <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Rendah</span>
                      <div className="flex gap-1">
                        {[0.1, 0.25, 0.4, 0.6, 0.8, 1].map(opacity => (
                          <div key={opacity} className="w-6 h-4 rounded" style={{ background: `rgba(59,111,212,${opacity})` }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tinggi</span>
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>
      )}
    </div>
  );
}