import { useState } from "react";
import { motion } from "motion/react";
import { Download, Calendar, TrendingUp, Users, Package, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { v } from "../../components/pageUtils";

/* ── Mock Data ─────────────────────────────────────────────── */
const PENJUALAN_DATA = [
  { product: "Banner Vinyl", qty: 184, revenue: 3680000 },
  { product: "Kartu Nama UV", qty: 156, revenue: 5460000 },
  { product: "Mug Custom", qty: 132, revenue: 3300000 },
  { product: "Brosur A5", qty: 120, revenue: 2400000 },
  { product: "Stiker Vinyl", qty: 98, revenue: 980000 },
  { product: "Spanduk", qty: 87, revenue: 2610000 },
  { product: "Paper Bag", qty: 75, revenue: 262500 },
  { product: "Undangan", qty: 63, revenue: 1890000 },
];

const OPERATOR_PERF = [
  { name: "Ahmad Op.", handled: 87, onTime: 79, late: 8, avgTime: 2.3 },
  { name: "Budi Op.", handled: 65, onTime: 57, late: 8, avgTime: 2.8 },
  { name: "Citra Op.", handled: 43, onTime: 36, late: 7, avgTime: 3.1 },
];

const CUSTOMER_MONTHLY = [
  { month: "Sep", baru: 18 }, { month: "Okt", baru: 24 },
  { month: "Nov", baru: 31 }, { month: "Des", baru: 28 },
  { month: "Jan", baru: 35 }, { month: "Feb", baru: 14 },
];

const TOP_CUSTOMERS = [
  { rank: 1, name: "Budi Santoso", orders: 21, total: "Rp 8.700.000", clv: "Rp 15.2 Jt" },
  { rank: 2, name: "Siti Rahayu", orders: 12, total: "Rp 4.200.000", clv: "Rp 7.8 Jt" },
  { rank: 3, name: "Ahmad Fauzi", orders: 8, total: "Rp 2.800.000", clv: "Rp 5.1 Jt" },
  { rank: 4, name: "Dewi Fatimah", orders: 5, total: "Rp 1.500.000", clv: "Rp 2.7 Jt" },
  { rank: 5, name: "Rizky Pratama", orders: 3, total: "Rp 890.000", clv: "Rp 1.6 Jt" },
];

const PRODUKSI_STAGES = [
  { stage: "Verifikasi File", avgHours: 0.8 },
  { stage: "Pracetak", avgHours: 1.2 },
  { stage: "Sedang Dicetak", avgHours: 4.5 },
  { stage: "Finishing", avgHours: 2.1 },
  { stage: "QC", avgHours: 0.5 },
  { stage: "Siap Kirim", avgHours: 0.3 },
];

// 7 (days) x 24 (hours) heat map data
const HEATMAP = Array.from({ length: 7 }, () =>
  Array.from({ length: 12 }, (_, h) => Math.floor(Math.random() * 20))
);
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const HOURS = ["06", "08", "10", "12", "14", "16", "18", "20", "22", "00", "02", "04"];

const PIE_CUSTOMER = [
  { name: "Customer Baru", value: 38, color: "#F97316" },
  { name: "Customer Kembali", value: 62, color: "#3B6FD4" },
];

const SCATTER_DATA = OPERATOR_PERF.map(op => ({
  x: op.handled,
  y: op.avgTime,
  name: op.name,
}));

const TABS = ["Penjualan", "Operator", "Customer", "Operasional"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <p className="text-xs font-semibold mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label ?? payload[0]?.payload?.name}</p>
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

export function AdminLaporan() {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState("Bulan Ini");

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>Laporan & Analitik</h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Analisis mendalam performa bisnis Anda</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: v("--c-card"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
            <Calendar size={14} /> {period}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto w-fit" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{ background: activeTab === i ? v("--c-card") : "transparent", color: activeTab === i ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB: PENJUALAN */}
      {activeTab === 0 && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { label: "Total Transaksi", value: "206", Icon: Package, color: "#3B6FD4" },
              { label: "Total Pendapatan", value: "Rp 87,6 Jt", Icon: TrendingUp, color: "#10B981" },
              { label: "Produk Terjual", value: "2.847 pcs", Icon: Package, color: "#F97316" },
              { label: "Rata-rata Pesanan", value: "Rp 425K", Icon: TrendingUp, color: "#7C3AED" },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="rounded-2xl p-4" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={15} style={{ color }} />
                  <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</span>
                </div>
                <p className="font-bold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif", fontSize: "1.25rem" }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Penjualan per Produk (Qty)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={PENJUALAN_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} />
                  <YAxis dataKey="product" type="category" tick={{ fontSize: 9, fill: "#64748B" }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="qty" fill="#3B6FD4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Pendapatan per Produk</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={PENJUALAN_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} tickFormatter={v => `${(v/1000000).toFixed(0)}Jt`} />
                  <YAxis dataKey="product" type="category" tick={{ fontSize: 9, fill: "#64748B" }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#F97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                  {PENJUALAN_DATA.map((row, i) => (
                    <tr key={row.product} style={{ borderBottom: i < PENJUALAN_DATA.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{row.product}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec") }}>Cetak Digital</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold" style={{ color: v("--c-text") }}>{row.qty}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: v("--c-text") }}>Rp {row.revenue.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: v("--c-bg-sec"), minWidth: 40 }}>
                            <div className="h-full rounded-full" style={{ width: `${(row.revenue / 5460000) * 100}%`, background: "linear-gradient(to right,#1E3A5F,#F97316)" }} />
                          </div>
                          <span className="text-xs" style={{ color: v("--c-text-sec") }}>{Math.round((row.revenue / 5460000) * 100)}%</span>
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
        <div className="space-y-5">
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
                  {OPERATOR_PERF.map((op, i) => (
                    <tr key={op.name} style={{ borderBottom: i < OPERATOR_PERF.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: v("--c-text") }}>{op.name}</td>
                      <td className="px-4 py-3 text-sm text-center font-bold" style={{ color: v("--c-text") }}>{op.handled}</td>
                      <td className="px-4 py-3 text-sm text-center" style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>{op.onTime}</td>
                      <td className="px-4 py-3 text-sm text-center" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>{op.late}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: v("--c-bg-sec"), minWidth: 50 }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.round((op.onTime / op.handled) * 100)}%`, background: "#10B981" }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: "#10B981" }}>{Math.round((op.onTime / op.handled) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: v("--c-text-sec") }}>{op.avgTime} jam</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Volume vs Rata-rata Waktu Pengerjaan</h2>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="x" name="Volume" tick={{ fontSize: 11, fill: "#64748B" }} label={{ value: "Volume Pesanan", position: "bottom", fontSize: 11, fill: "#64748B" }} />
                <YAxis dataKey="y" name="Avg Waktu" tick={{ fontSize: 11, fill: "#64748B" }} label={{ value: "Avg (jam)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748B" }} />
                <ZAxis range={[100, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={SCATTER_DATA} fill="#F97316" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB: CUSTOMER */}
      {activeTab === 2 && (
        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Akuisisi Customer Baru per Bulan</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={CUSTOMER_MONTHLY}>
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
                    <Pie data={PIE_CUSTOMER} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                      {PIE_CUSTOMER.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {PIE_CUSTOMER.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                      <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{name}: <strong style={{ color: v("--c-text") }}>{value}%</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
                {TOP_CUSTOMERS.map((c, i) => (
                  <tr key={c.rank} style={{ borderBottom: i < TOP_CUSTOMERS.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                    <td className="px-4 py-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white inline-flex" style={{ background: i < 3 ? "linear-gradient(135deg,#F97316,#FACC15)" : v("--c-bg-sec"), color: i < 3 ? "#fff" : v("--c-text-sec") }}>{c.rank}</span>
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
        </div>
      )}

      {/* TAB: OPERASIONAL */}
      {activeTab === 3 && (
        <div className="space-y-5">
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Rata-rata Waktu per Tahap Produksi</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={PRODUKSI_STAGES}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="stage" tick={{ fontSize: 9, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} label={{ value: "Jam", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748B" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgHours" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Heatmap Pesanan per Jam × Hari</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-2 mb-2 pl-10">
                {HOURS.map(h => (
                  <div key={h} className="text-center flex-1 min-w-[28px] text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</div>
                ))}
              </div>
              {HEATMAP.map((row, dayIdx) => (
                <div key={dayIdx} className="flex items-center gap-2 mb-1.5">
                  <span className="w-8 text-xs text-right" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{DAYS[dayIdx]}</span>
                  <div className="flex gap-2 flex-1">
                    {row.map((val, hIdx) => (
                      <div key={hIdx} className="flex-1 min-w-[28px] h-7 rounded" title={`${DAYS[dayIdx]} ${HOURS[hIdx]}:00 — ${val} pesanan`}
                        style={{ background: val === 0 ? v("--c-bg-sec") : `rgba(59,111,212,${Math.min(0.9, val / 20)})`, border: `1px solid ${v("--c-border")}` }} />
                    ))}
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
        </div>
      )}
    </div>
  );
}
