import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle, X, XCircle, ZoomIn, Tag, Plus,
  Clock, Zap, Loader2, RefreshCw, Trash2, Pencil,
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

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

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

// ─── Voucher Modal ────────────────────────────────────────────────────────────

interface VoucherModalProps {
  initial?: Voucher;
  onSave: (data: { code: string; type: string; discount: string; maxUse: string; expiresAt: string }) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
}

function VoucherModal({ initial, onSave, onClose, submitting, error }: VoucherModalProps) {
  const [code, setCode]           = useState(initial?.code ?? "");
  const [type, setType]           = useState(initial?.type ?? "percentage");
  const [discount, setDiscount]   = useState(initial ? String(initial.discount) : "");
  const [maxUse, setMaxUse]       = useState(initial ? String(initial.maxUse) : "");
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ? initial.expiresAt.split("T")[0] : "");

  const inputStyle = {
    background: v("--c-bg-sec"),
    border: `1px solid ${v("--c-border")}`,
    color: v("--c-text"),
    fontFamily: "'Inter',sans-serif",
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />
      <motion.div
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[480px]"
        style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
            {initial ? "Edit Voucher" : "Buat Voucher Baru"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {!initial && (
            <div>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Kode Voucher</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: PROMO30"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold block mb-1.5"
              style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Jenis Diskon</label>
            <select value={type} onChange={e => setType(e.target.value as "percentage" | "nominal")}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
              <option value="percentage">Persentase (%)</option>
              <option value="nominal">Nominal (Rp)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5"
              style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Nilai Diskon ({type === "percentage" ? "%" : "Rp"})
            </label>
            <input value={discount} onChange={e => setDiscount(e.target.value)} type="number"
              placeholder={type === "percentage" ? "Contoh: 30" : "Contoh: 20000"}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5"
              style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Maksimum Penggunaan</label>
            <input value={maxUse} onChange={e => setMaxUse(e.target.value)} type="number"
              placeholder="Contoh: 100"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5"
              style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Berlaku Hingga</label>
            <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} type="date"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Inter',sans-serif" }}>{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Batal
            </button>
            <button
              onClick={() => onSave({ code, type, discount, maxUse, expiresAt })}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {initial ? "Simpan Perubahan" : "Buat Voucher"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Flash Sale Modal ─────────────────────────────────────────────────────────

interface FlashSaleModalProps {
  onSave: (data: { name: string; startDate: string; endDate: string }) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
}

function FlashSaleModal({ onSave, onClose, submitting, error }: FlashSaleModalProps) {
  const [name, setName]           = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  const inputStyle = {
    background: v("--c-bg-sec"),
    border: `1px solid ${v("--c-border")}`,
    color: v("--c-text"),
    fontFamily: "'Inter',sans-serif",
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />
      <motion.div
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[440px]"
        style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Buat Flash Sale</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5"
              style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nama Flash Sale</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Contoh: Flash Sale Weekend"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tanggal Mulai</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tanggal Selesai</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          </div>
          {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Inter',sans-serif" }}>{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Batal
            </button>
            <button
              onClick={() => onSave({ name, startDate, endDate })}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(to right,#F97316,#EF4444)", fontFamily: "'Inter',sans-serif" }}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Buat Flash Sale
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel} />
      <motion.div
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[360px]"
        style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Konfirmasi Hapus</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Batal
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
              Hapus
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminKeuangan() {
  const { authHeader } = useAuth();
  const authHeaderRef  = useRef(authHeader);
  useEffect(() => { authHeaderRef.current = authHeader; }, [authHeader]);

  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod]       = useState("Minggu Ini");

  // Revenue
  const [revenue, setRevenue]             = useState<RevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Pending payments
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [pendingLoading, setPendingLoading]   = useState(false);
  const [previewProof, setPreviewProof]       = useState<string | null>(null);
  const [actionLoading, setActionLoading]     = useState<number | null>(null);

  // Vouchers
  const [vouchers, setVouchers]               = useState<Voucher[]>([]);
  const [voucherLoading, setVoucherLoading]   = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editVoucher, setEditVoucher]         = useState<Voucher | null>(null);
  const [voucherSubmitting, setVoucherSubmitting] = useState(false);
  const [voucherError, setVoucherError]       = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog]     = useState<{ open: boolean; message: string; onConfirm: () => void }>({
    open: false, message: "", onConfirm: () => {},
  });

  // Flash sales
  const [flashSales, setFlashSales]           = useState<FlashSale[]>([]);
  const [flashLoading, setFlashLoading]       = useState(false);
  const [showFlashModal, setShowFlashModal]   = useState(false);
  const [flashSubmitting, setFlashSubmitting] = useState(false);
  const [flashError, setFlashError]           = useState<string | null>(null);

  // ── Fetchers ──────────────────────────────────────────────────────────────

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

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => { if (activeTab === 0) fetchRevenue(); }, [activeTab, fetchRevenue]);
  useEffect(() => { if (activeTab === 1) fetchPending(); }, [activeTab, fetchPending]);
  useEffect(() => {
    if (activeTab === 2) { fetchVouchers(); fetchFlashSales(); }
  }, [activeTab, fetchVouchers, fetchFlashSales]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleConfirm = async (id: number) => {
    setActionLoading(id);
    try {
      await apiFetch(`/orders/${id}/confirm-payment`, authHeaderRef.current, { method: "PATCH" });
      setPendingPayments(prev => prev.filter(p => p.id !== id));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Tolak pembayaran ini?")) return;
    setActionLoading(id);
    try {
      await apiFetch(`/orders/${id}/reject-payment`, authHeaderRef.current, { method: "PATCH" });
      setPendingPayments(prev => prev.filter(p => p.id !== id));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const handleToggleVoucher = async (vc: Voucher) => {
    try {
      const updated = await apiFetch<Voucher>(
        `/promo/vouchers/${vc.id}/toggle`, authHeaderRef.current, { method: "PATCH" }
      );
      setVouchers(prev => prev.map(v => v.id === vc.id ? updated : v));
    } catch (e: any) { alert(e.message); }
  };

  const handleSaveVoucher = async (form: { code: string; type: string; discount: string; maxUse: string; expiresAt: string }) => {
    setVoucherError(null);
    if (!form.discount || !form.maxUse || !form.expiresAt || (!editVoucher && !form.code)) {
      setVoucherError("Semua field wajib diisi"); return;
    }
    setVoucherSubmitting(true);
    try {
      if (editVoucher) {
        const updated = await apiFetch<Voucher>(`/promo/vouchers/${editVoucher.id}`, authHeaderRef.current, {
          method: "PATCH",
          body: JSON.stringify({ type: form.type, discount: Number(form.discount), maxUse: Number(form.maxUse), expiresAt: form.expiresAt }),
        });
        setVouchers(prev => prev.map(v => v.id === editVoucher.id ? updated : v));
      } else {
        const created = await apiFetch<Voucher>("/promo/vouchers", authHeaderRef.current, {
          method: "POST",
          body: JSON.stringify({ code: form.code, type: form.type, discount: Number(form.discount), maxUse: Number(form.maxUse), expiresAt: form.expiresAt }),
        });
        setVouchers(prev => [created, ...prev]);
      }
      setShowVoucherModal(false);
      setEditVoucher(null);
    } catch (e: any) {
      setVoucherError(e.message);
    } finally {
      setVoucherSubmitting(false);
    }
  };

  const handleDeleteVoucher = (vc: Voucher) => {
    setConfirmDialog({
      open: true,
      message: `Hapus voucher "${vc.code}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setVouchers(prev => prev.filter(v => v.id !== vc.id));
        setConfirmDialog(d => ({ ...d, open: false }));
      },
    });
  };

  const handleSaveFlashSale = async (form: { name: string; startDate: string; endDate: string }) => {
    setFlashError(null);
    if (!form.name || !form.startDate || !form.endDate) {
      setFlashError("Semua field wajib diisi"); return;
    }
    setFlashSubmitting(true);
    try {
      const created = await apiFetch<FlashSale>("/promo/flash-sales", authHeaderRef.current, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setFlashSales(prev => [created, ...prev]);
      setShowFlashModal(false);
    } catch (e: any) {
      setFlashError(e.message);
    } finally {
      setFlashSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 className="font-['Poppins',sans-serif] font-bold"
          style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>
          Manajemen Keuangan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
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

      {/* ── TAB 0: Laporan Pendapatan ─────────────────────────────────────────── */}
      {activeTab === 0 && (
        <div className="space-y-5">
          <div className="flex gap-2 flex-wrap items-center">
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
                  { label: "Total Pendapatan",        value: formatRp(revenue.totalRevenue),    color: "#10B981" },
                  { label: "Jumlah Transaksi",         value: String(revenue.totalTransactions), color: "#3B6FD4" },
                  { label: "Rata-rata Nilai Pesanan",  value: formatRp(revenue.avgOrder),        color: "#F97316" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-2xl p-5"
                    style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                    <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                    <p className="font-bold" style={{ color, fontFamily: "'Poppins',sans-serif", fontSize: "1.4rem" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-5"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Trend Pendapatan</h2>
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

      {/* ── TAB 1: Konfirmasi Manual ──────────────────────────────────────────── */}
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
              <p style={{ fontFamily: "'Inter',sans-serif" }}>Tidak ada konfirmasi pembayaran yang menunggu</p>
            </div>
          ) : pendingPayments.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Proof placeholder — proofUrl belum ada di schema */}
                <div className="relative w-24 h-24 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                  <Tag size={24} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
                  <span className="text-[9px] mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Bukti Transfer</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-mono font-semibold text-sm" style={{ color: v("--c-primary") }}>
                        ORD-{String(p.id).padStart(4, "0")}
                      </p>
                      <p className="font-semibold mt-0.5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                        {p.user.fullName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {p.user.phoneNumber}
                      </p>
                    </div>
                    <p className="font-bold text-lg" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
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
                    <button disabled={actionLoading === p.id} onClick={() => handleConfirm(p.id)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                      {actionLoading === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Konfirmasi Valid
                    </button>
                    <button disabled={actionLoading === p.id} onClick={() => handleReject(p.id)}
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

      {/* ── TAB 2: Voucher & Promo ────────────────────────────────────────────── */}
      {activeTab === 2 && (
        <div className="space-y-5">
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => { setEditVoucher(null); setVoucherError(null); setShowVoucherModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
              <Plus size={14} /> Buat Voucher Baru
            </button>
            <button onClick={() => { setFlashError(null); setShowFlashModal(true); }}
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
          ) : vouchers.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <Tag size={32} className="mx-auto mb-3 opacity-30" style={{ color: v("--c-text-sec") }} />
              <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Belum ada voucher.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map((vc, i) => (
                <motion.div key={vc.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${v("--c-border")}`, opacity: vc.active ? 1 : 0.6 }}>
                  <div className="p-5" style={{ background: vc.active ? "linear-gradient(135deg,#1E3A5F,#3B6FD4)" : "#64748B" }}>
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
                      <button onClick={() => { setEditVoucher(vc); setVoucherError(null); setShowVoucherModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => handleToggleVoucher(vc)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: vc.active ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.1)", color: vc.active ? "#EF4444" : "#10B981", fontFamily: "'Inter',sans-serif" }}>
                        {vc.active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button onClick={() => handleDeleteVoucher(vc)}
                        className="px-2.5 py-1.5 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.07)", color: "#EF4444" }}
                        title="Hapus voucher">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Flash Sale table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <Zap size={16} style={{ color: "#F97316" }} />
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Flash Sale</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(249,115,22,0.1)", color: "#F97316", fontFamily: "'Inter',sans-serif" }}>
                {flashSales.length}
              </span>
            </div>
            {flashLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={22} className="animate-spin" style={{ color: v("--c-text-sec") }} />
              </div>
            ) : flashSales.length === 0 ? (
              <div className="p-10 text-center">
                <Zap size={32} className="mx-auto mb-3 opacity-30" style={{ color: v("--c-text-sec") }} />
                <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Belum ada flash sale.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {flashSales.map((fs, i) => {
                      const sc = fs.status === "active"
                        ? { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Aktif" }
                        : fs.status === "upcoming"
                        ? { bg: "rgba(234,179,8,0.12)", text: "#EAB308", label: "Akan Datang" }
                        : { bg: "rgba(100,116,139,0.12)", text: "#64748B", label: "Selesai" };
                      return (
                        <tr key={fs.id} style={{ borderBottom: i < flashSales.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{fs.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {fs.products.map(p => (
                                <span key={p.product.id} className="px-2 py-0.5 rounded-full text-xs"
                                  style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                                  {p.product.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{formatDate(fs.startDate)}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{formatDate(fs.endDate)}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: sc.bg, color: sc.text, fontFamily: "'Inter',sans-serif" }}>
                              {sc.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewProof && (
          <motion.div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreviewProof(null)}>
            <motion.img src={previewProof} alt="Bukti Transfer"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()} />
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }} onClick={() => setPreviewProof(null)}>
              <X size={18} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voucher Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showVoucherModal && (
          <VoucherModal
            initial={editVoucher ?? undefined}
            onSave={handleSaveVoucher}
            onClose={() => { setShowVoucherModal(false); setEditVoucher(null); }}
            submitting={voucherSubmitting}
            error={voucherError}
          />
        )}
      </AnimatePresence>

      {/* ── Flash Sale Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFlashModal && (
          <FlashSaleModal
            onSave={handleSaveFlashSale}
            onClose={() => setShowFlashModal(false)}
            submitting={flashSubmitting}
            error={flashError}
          />
        )}
      </AnimatePresence>

      {/* ── Confirm Dialog ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDialog.open && (
          <ConfirmDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(d => ({ ...d, open: false }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}