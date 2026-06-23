import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle, X, XCircle, ZoomIn, Tag, Plus,
  Clock, Zap, Loader2, RefreshCw,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { v } from "../../components/pageUtils";
import { useAuth } from "../../hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingPayment {
  id: number;
  user: { fullName: string; phoneNumber: string };
  totalPrice: number;
  createdAt: string;
  items: { product: { name: string }; quantity: number; price: number }[];
  // proofUrl belum ada di schema — tampilkan placeholder
}

interface Voucher {
  id: number;
  code: string;
  type: "percentage" | "nominal";
  discount: number;
  usedCount: number;
  maxUse: number;
  expiresAt: string;
  active: boolean;
}

interface FlashSale {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "ended";
  products: { product: { id: number; name: string } }[];
}

interface RevenueData {
  chartData: { date: string; amount: number }[];
  totalRevenue: number;
  totalTransactions: number;
  avgOrder: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = (import.meta.env.VITE_API_URL ?? "http://localhost:3001") + "/api";

async function apiFetch<T>(
  path: string,
  authHeader: Record<string, string>,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeader },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Terjadi kesalahan");
  }
  return res.json();
}

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const PERIOD_MAP: Record<string, string> = {
  "Hari Ini": "today",
  "Minggu Ini": "week",
  "Bulan Ini": "month",
};

const TABS = ["Laporan Pendapatan", "Konfirmasi Manual", "Voucher & Promo"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-xl"
      style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <p className="text-xs font-semibold mb-1"
        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
      <p className="text-sm font-bold"
        style={{ color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
        {formatRp(payload[0].value)}
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminKeuangan() {
  const { authHeader } = useAuth();
  const authHeaderRef = useRef(authHeader);
  useEffect(() => { authHeaderRef.current = authHeader; }, [authHeader]);
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState("Minggu Ini");

  // Revenue
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Pending payments
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [previewProof, setPreviewProof] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Voucher
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    code: "", type: "percentage", discount: "", maxUse: "", expiresAt: "",
  });
  const [voucherSubmitting, setVoucherSubmitting] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);

  // Flash sale
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [flashLoading, setFlashLoading] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [flashForm, setFlashForm] = useState({
    name: "", startDate: "", endDate: "",
  });
  const [flashSubmitting, setFlashSubmitting] = useState(false);
  const [flashError, setFlashError] = useState<string | null>(null);

  // ── Fetchers ────────────────────────────────────────────────────────────────

  const fetchRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const data = await apiFetch<RevenueData>(
        `/orders/revenue?period=${PERIOD_MAP[period] ?? "week"}`,
        authHeaderRef.current
      );
      setRevenue(data);
    } catch {
      setRevenue(null);
    } finally {
      setRevenueLoading(false);
    }
  }, [period]);

  const fetchPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      const data = await apiFetch<PendingPayment[]>("/orders/pending-payment", authHeaderRef.current);
      setPendingPayments(data);
    } catch {
      setPendingPayments([]);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchVouchers = useCallback(async () => {
    setVoucherLoading(true);
    try {
      const data = await apiFetch<Voucher[]>("/promo/vouchers", authHeaderRef.current);
      setVouchers(data);
    } catch {
      setVouchers([]);
    } finally {
      setVoucherLoading(false);
    }
  }, []);

  const fetchFlashSales = useCallback(async () => {
    setFlashLoading(true);
    try {
      const data = await apiFetch<FlashSale[]>("/promo/flash-sales", authHeaderRef.current);
      setFlashSales(data);
    } catch {
      setFlashSales([]);
    } finally {
      setFlashLoading(false);
    }
  }, []);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 0) fetchRevenue();
  }, [activeTab, fetchRevenue]);

  useEffect(() => {
    if (activeTab === 1) fetchPending();
  }, [activeTab, fetchPending]);

  useEffect(() => {
    if (activeTab === 2) {
      fetchVouchers();
      fetchFlashSales();
    }
  }, [activeTab, fetchVouchers, fetchFlashSales]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleConfirm = async (id: number) => {
    setActionLoading(id);
    try {
      await apiFetch(`/orders/${id}/confirm-payment`, authHeaderRef.current, { method: "PATCH" });
      setPendingPayments(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Tolak pembayaran ini?")) return;
    setActionLoading(id);
    try {
      await apiFetch(`/orders/${id}/reject-payment`, authHeaderRef.current, { method: "PATCH" });
      setPendingPayments(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVoucher = async (vc: Voucher) => {
    try {
      const updated = await apiFetch<Voucher>(
        `/promo/vouchers/${vc.id}/toggle`, authHeaderRef.current, { method: "PATCH" }
      );
      setVouchers(prev => prev.map(v => v.id === vc.id ? updated : v));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateVoucher = async () => {
    setVoucherError(null);
    if (!voucherForm.code || !voucherForm.discount || !voucherForm.maxUse || !voucherForm.expiresAt) {
      setVoucherError("Semua field wajib diisi");
      return;
    }
    setVoucherSubmitting(true);
    try {
      if (editVoucher) {
        const updated = await apiFetch<Voucher>(
          `/promo/vouchers/${editVoucher.id}`,
          authHeaderRef.current,
          {
            method: "PATCH",
            body: JSON.stringify({
              type: voucherForm.type,
              discount: Number(voucherForm.discount),
              maxUse: Number(voucherForm.maxUse),
              expiresAt: voucherForm.expiresAt,
            }),
          }
        );
        setVouchers(prev => prev.map(v => v.id === editVoucher.id ? updated : v));
      } else {
        const created = await apiFetch<Voucher>("/promo/vouchers", authHeaderRef.current, {
          method: "POST",
          body: JSON.stringify({
            code: voucherForm.code,
            type: voucherForm.type,
            discount: Number(voucherForm.discount),
            maxUse: Number(voucherForm.maxUse),
            expiresAt: voucherForm.expiresAt,
          }),
        });
        setVouchers(prev => [created, ...prev]);
      }
      setShowVoucherModal(false);
      setEditVoucher(null);
      setVoucherForm({ code: "", type: "percentage", discount: "", maxUse: "", expiresAt: "" });
    } catch (e: any) {
      setVoucherError(e.message);
    } finally {
      setVoucherSubmitting(false);
    }
  };

  const openEditVoucher = (vc: Voucher) => {
    setEditVoucher(vc);
    setVoucherForm({
      code: vc.code,
      type: vc.type,
      discount: String(vc.discount),
      maxUse: String(vc.maxUse),
      expiresAt: vc.expiresAt.split("T")[0],
    });
    setShowVoucherModal(true);
  };

  const handleCreateFlashSale = async () => {
    setFlashError(null);
    if (!flashForm.name || !flashForm.startDate || !flashForm.endDate) {
      setFlashError("Semua field wajib diisi");
      return;
    }
    setFlashSubmitting(true);
    try {
      const created = await apiFetch<FlashSale>("/promo/flash-sales", authHeaderRef.current, {
        method: "POST",
        body: JSON.stringify(flashForm),
      });
      setFlashSales(prev => [created, ...prev]);
      setShowFlashModal(false);
      setFlashForm({ name: "", startDate: "", endDate: "" });
    } catch (e: any) {
      setFlashError(e.message);
    } finally {
      setFlashSubmitting(false);
    }
  };

  // ── Input helper ─────────────────────────────────────────────────────────────

  const inputStyle = {
    background: v("--c-bg-sec"),
    border: `1px solid ${v("--c-border")}`,
    color: v("--c-text"),
    fontFamily: "'Inter',sans-serif",
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 className="font-['Poppins',sans-serif] font-bold"
          style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>
          Manajemen Keuangan
        </h1>
        <p className="text-sm mt-0.5"
          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          Laporan pendapatan, konfirmasi bayar, & voucher
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 overflow-x-auto"
        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, width: "fit-content" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: activeTab === i ? v("--c-card") : "transparent",
              color: activeTab === i ? v("--c-text") : v("--c-text-sec"),
              fontFamily: "'Inter',sans-serif",
            }}>
            {t}
            {t === "Konfirmasi Manual" && pendingPayments.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "#EF4444", color: "#fff" }}>
                {pendingPayments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: LAPORAN PENDAPATAN ─────────────────────────────────────────── */}
      {activeTab === 0 && (
        <div className="space-y-5">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(PERIOD_MAP).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: period === p ? "linear-gradient(to right,#1E3A5F,#F97316)" : v("--c-card"),
                  color: period === p ? "#fff" : v("--c-text-sec"),
                  border: `1px solid ${period === p ? "transparent" : v("--c-border")}`,
                  fontFamily: "'Inter',sans-serif",
                }}>
                {p}
              </button>
            ))}
            <button onClick={fetchRevenue} className="px-3 py-2 rounded-xl"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text-sec") }}>
              <RefreshCw size={14} className={revenueLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {revenueLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: v("--c-text-sec") }} />
            </div>
          ) : revenue ? (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Pendapatan", value: formatRp(revenue.totalRevenue), color: "#10B981" },
                  { label: "Jumlah Transaksi", value: String(revenue.totalTransactions), color: "#3B6FD4" },
                  { label: "Rata-rata Nilai Pesanan", value: formatRp(revenue.avgOrder), color: "#F97316" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-2xl p-5"
                    style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                    <p className="text-xs mb-1"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                    <p className="font-bold"
                      style={{ color, fontFamily: "'Poppins',sans-serif", fontSize: "1.4rem" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-5"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-4"
                  style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Trend Pendapatan</h2>
                {revenue.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={revenue.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }}
                        tickFormatter={val => `${(val / 1_000_000).toFixed(0)}Jt`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="amount" stroke="#3B6FD4"
                        strokeWidth={2.5} dot={{ fill: "#3B6FD4", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-sm" style={{ color: v("--c-text-sec") }}>
                    Belum ada data pendapatan pada periode ini
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-sm" style={{ color: v("--c-text-sec") }}>
              Gagal memuat laporan
            </p>
          )}
        </div>
      )}

      {/* ─── TAB: KONFIRMASI MANUAL ──────────────────────────────────────────── */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={fetchPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text-sec") }}>
              <RefreshCw size={12} className={pendingLoading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {pendingLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: v("--c-text-sec") }} />
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-16" style={{ color: v("--c-text-sec") }}>
              <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p style={{ fontFamily: "'Inter',sans-serif" }}>
                Tidak ada konfirmasi pembayaran yang menunggu
              </p>
            </div>
          ) : pendingPayments.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Proof placeholder — schema belum punya proofUrl */}
                <div className="relative w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                  <Tag size={24} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
                  <span className="absolute bottom-1 text-[9px]"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Bukti Transfer</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-mono font-semibold text-sm"
                        style={{ color: v("--c-primary") }}>ORD-{String(p.id).padStart(4, "0")}</p>
                      <p className="font-semibold mt-0.5"
                        style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                        {p.user.fullName}
                      </p>
                      <p className="text-xs mt-0.5"
                        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {p.user.phoneNumber}
                      </p>
                    </div>
                    <p className="font-bold text-lg"
                      style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                      {formatRp(p.totalPrice)}
                    </p>
                  </div>
                  <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Dipesan: {formatDate(p.createdAt)}
                  </p>
                  <p className="text-xs mb-4" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    {p.items.map(it => `${it.product.name} x${it.quantity}`).join(", ")}
                  </p>
                  <div className="flex gap-3">
                    <button
                      disabled={actionLoading === p.id}
                      onClick={() => handleConfirm(p.id)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                      {actionLoading === p.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <CheckCircle size={14} />}
                      Konfirmasi Valid
                    </button>
                    <button
                      disabled={actionLoading === p.id}
                      onClick={() => handleReject(p.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                      <XCircle size={14} /> Tolak
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── TAB: VOUCHER & PROMO ────────────────────────────────────────────── */}
      {activeTab === 2 && (
        <div className="space-y-5">
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => { setEditVoucher(null); setVoucherForm({ code: "", type: "percentage", discount: "", maxUse: "", expiresAt: "" }); setShowVoucherModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
              <Plus size={14} /> Buat Voucher Baru
            </button>
            <button onClick={() => setShowFlashModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-card"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
              <Zap size={14} /> Buat Flash Sale
            </button>
          </div>

          {/* Voucher cards */}
          {voucherLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: v("--c-text-sec") }} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.length === 0 ? (
                <p className="text-sm col-span-3 text-center py-8"
                  style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Belum ada voucher
                </p>
              ) : vouchers.map((vc, i) => (
                <motion.div key={vc.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${v("--c-border")}`, opacity: vc.active ? 1 : 0.6 }}>
                  <div className="p-5"
                    style={{ background: vc.active ? "linear-gradient(135deg,#1E3A5F,#3B6FD4)" : "#64748B" }}>
                    <div className="flex items-center justify-between mb-3">
                      <Tag size={16} className="text-white/70" />
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontFamily: "'Inter',sans-serif" }}>
                        {vc.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="font-bold text-white text-2xl font-mono">{vc.code}</p>
                    <p className="text-white/80 text-sm mt-1" style={{ fontFamily: "'Inter',sans-serif" }}>
                      Diskon {vc.type === "percentage" ? `${vc.discount}%` : formatRp(vc.discount)}
                    </p>
                  </div>
                  <div className="p-4" style={{ background: v("--c-card"), borderTop: `2px dashed ${v("--c-border")}` }}>
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Terpakai</span>
                      <span style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{vc.usedCount}/{vc.maxUse}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: v("--c-bg-sec") }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.min((vc.usedCount / vc.maxUse) * 100, 100)}%`, background: vc.active ? "#F97316" : "#94A3B8" }} />
                    </div>
                    <p className="text-xs mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      Berlaku hingga {formatDate(vc.expiresAt)}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => openEditVoucher(vc)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                        Edit
                      </button>
                      <button onClick={() => handleToggleVoucher(vc)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: vc.active ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.1)", color: vc.active ? "#EF4444" : "#10B981", fontFamily: "'Inter',sans-serif" }}>
                        {vc.active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Flash Sale table */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <Zap size={16} style={{ color: "#F97316" }} />
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Flash Sale</h2>
            </div>
            {flashLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={22} className="animate-spin" style={{ color: v("--c-text-sec") }} />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                    {["Nama Flash Sale", "Produk", "Mulai", "Selesai", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flashSales.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      Belum ada flash sale
                    </td></tr>
                  ) : flashSales.map((fs, i) => {
                    const statusColor = fs.status === "active"
                      ? { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Aktif" }
                      : fs.status === "upcoming"
                      ? { bg: "rgba(234,179,8,0.12)", text: "#EAB308", label: "Akan Datang" }
                      : { bg: "rgba(100,116,139,0.12)", text: "#64748B", label: "Selesai" };
                    return (
                      <tr key={fs.id} style={{ borderBottom: i < flashSales.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                        <td className="px-4 py-3 text-sm font-medium"
                          style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{fs.name}</td>
                        <td className="px-4 py-3 text-xs"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          {fs.products.map(p => p.product.name).join(", ") || "-"}
                        </td>
                        <td className="px-4 py-3 text-xs"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{formatDate(fs.startDate)}</td>
                        <td className="px-4 py-3 text-xs"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{formatDate(fs.endDate)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: statusColor.bg, color: statusColor.text, fontFamily: "'Inter',sans-serif" }}>
                            {statusColor.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── LIGHTBOX ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewProof && (
          <motion.div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreviewProof(null)}>
            <motion.img src={previewProof} alt="Bukti Transfer" className="max-w-full max-h-[80vh] rounded-2xl object-contain"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()} />
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <X size={18} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── VOUCHER MODAL ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showVoucherModal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowVoucherModal(false)} />
            <motion.div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[480px]"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                  {editVoucher ? "Edit Voucher" : "Buat Voucher Baru"}
                </h2>
                <button onClick={() => setShowVoucherModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {!editVoucher && (
                  <div>
                    <label className="text-xs font-semibold block mb-1.5"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Kode Voucher</label>
                    <input type="text" placeholder="Contoh: PROMO30"
                      value={voucherForm.code}
                      onChange={e => setVoucherForm(f => ({ ...f, code: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold block mb-1.5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Jenis Diskon</label>
                  <select value={voucherForm.type}
                    onChange={e => setVoucherForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                    <option value="percentage">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Nilai Diskon ({voucherForm.type === "percentage" ? "%" : "Rp"})
                  </label>
                  <input type="number" placeholder={voucherForm.type === "percentage" ? "Contoh: 30" : "Contoh: 20000"}
                    value={voucherForm.discount}
                    onChange={e => setVoucherForm(f => ({ ...f, discount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Maksimum Penggunaan</label>
                  <input type="number" placeholder="Contoh: 100"
                    value={voucherForm.maxUse}
                    onChange={e => setVoucherForm(f => ({ ...f, maxUse: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Berlaku Hingga</label>
                  <input type="date"
                    value={voucherForm.expiresAt}
                    onChange={e => setVoucherForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                {voucherError && (
                  <p className="text-xs text-red-500" style={{ fontFamily: "'Inter',sans-serif" }}>{voucherError}</p>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setShowVoucherModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Batal
                  </button>
                  <button onClick={handleCreateVoucher} disabled={voucherSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
                    {voucherSubmitting && <Loader2 size={14} className="animate-spin" />}
                    {editVoucher ? "Simpan Perubahan" : "Buat Voucher"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── FLASH SALE MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFlashModal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFlashModal(false)} />
            <motion.div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[440px]"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Buat Flash Sale</h2>
                <button onClick={() => setShowFlashModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nama Flash Sale</label>
                  <input type="text" placeholder="Contoh: Flash Sale Weekend"
                    value={flashForm.name}
                    onChange={e => setFlashForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tanggal Mulai</label>
                  <input type="datetime-local"
                    value={flashForm.startDate}
                    onChange={e => setFlashForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tanggal Selesai</label>
                  <input type="datetime-local"
                    value={flashForm.endDate}
                    onChange={e => setFlashForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                {flashError && (
                  <p className="text-xs text-red-500" style={{ fontFamily: "'Inter',sans-serif" }}>{flashError}</p>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setShowFlashModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Batal
                  </button>
                  <button onClick={handleCreateFlashSale} disabled={flashSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "linear-gradient(to right,#F97316,#EF4444)", fontFamily: "'Inter',sans-serif" }}>
                    {flashSubmitting && <Loader2 size={14} className="animate-spin" />}
                    Buat Flash Sale
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