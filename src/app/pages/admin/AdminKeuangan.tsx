import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle, X, XCircle, ZoomIn, Tag, Plus,
  Clock, Zap, Trash2, Pencil,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { v } from "../../components/pageUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Voucher {
  code: string;
  type: "Persen" | "Nominal";
  discount: string;
  used: number;
  maxUse: number;
  expires: string;
  active: boolean;
}

interface FlashSale {
  id: number;
  name: string;
  products: string[];
  startDate: string;
  endDate: string;
  status: "Aktif" | "Akan Datang" | "Selesai";
}

// ─── Static data ─────────────────────────────────────────────────────────────

const REVENUE_DATA = [
  { date: "18 Feb", amount: 3200000 },
  { date: "19 Feb", amount: 4500000 },
  { date: "20 Feb", amount: 2800000 },
  { date: "21 Feb", amount: 5100000 },
  { date: "22 Feb", amount: 3900000 },
  { date: "23 Feb", amount: 6200000 },
  { date: "24 Feb", amount: 4200000 },
];

const PENDING_PAYMENTS = [
  { id: "ORD-2025-0048", customer: "Siti Rahayu", amount: "Rp 240.000", uploadedAt: "24 Feb 2026, 09:32", proof: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" },
  { id: "ORD-2025-0039", customer: "Fitri Yanti", amount: "Rp 275.000", uploadedAt: "20 Feb 2026, 14:20", proof: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" },
  { id: "ORD-2025-0035", customer: "Rahman Halim", amount: "Rp 520.000", uploadedAt: "19 Feb 2026, 11:05", proof: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" },
];

const INITIAL_VOUCHERS: Voucher[] = [
  { code: "SALE30", type: "Persen", discount: "30%", used: 45, maxUse: 100, expires: "28 Feb 2026", active: true },
  { code: "GRATIS20K", type: "Nominal", discount: "Rp 20.000", used: 12, maxUse: 50, expires: "15 Mar 2026", active: true },
  { code: "WELCOME10", type: "Persen", discount: "10%", used: 50, maxUse: 50, expires: "31 Jan 2026", active: false },
];

const INITIAL_FLASH_SALES: FlashSale[] = [
  { id: 1, name: "Flash Sale Weekend", products: ["Stiker Vinyl A4", "Brosur A5"], startDate: "22 Feb 2026", endDate: "24 Feb 2026", status: "Aktif" },
  { id: 2, name: "Flash Sale Akhir Bulan", products: ["Kartu Nama UV", "Mug Custom"], startDate: "28 Feb 2026", endDate: "28 Feb 2026", status: "Akan Datang" },
];

const REFUNDS = [
  { id: "ORD-2025-0032", customer: "Dimas P.", product: "Mug Custom", amount: "Rp 250.000", status: "Menunggu", account: "BCA 1234567890" },
  { id: "ORD-2025-0028", customer: "Nurul H.", product: "Banner Vinyl", amount: "Rp 180.000", status: "Diproses", account: "Mandiri 0987654321" },
  { id: "ORD-2025-0021", customer: "Budi S.", product: "Paper Bag", amount: "Rp 350.000", status: "Selesai", account: "BNI 1122334455" },
];

const TABS = ["Laporan Pendapatan", "Konfirmasi Manual", "Voucher & Promo", "Refund"];
const PERIODS = ["Hari Ini", "Minggu Ini", "Bulan Ini", "Custom"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateDisplay(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function toInputDate(display: string): string {
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", Mei: "05", Jun: "06",
    Jul: "07", Agu: "08", Sep: "09", Okt: "10", Nov: "11", Des: "12",
  };
  const parts = display.split(" ");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${months[parts[1]] ?? "01"}-${parts[0].padStart(2, "0")}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <p className="text-xs font-semibold mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
        Rp {(payload[0].value / 1000000).toFixed(1)} Jt
      </p>
    </div>
  );
};

// ─── Voucher Modal ────────────────────────────────────────────────────────────

interface VoucherModalProps {
  initial?: Voucher;
  onSave: (v: Voucher) => void;
  onClose: () => void;
}

function VoucherModal({ initial, onSave, onClose }: VoucherModalProps) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<"Persen" | "Nominal">(initial?.type ?? "Persen");
  const [discountRaw, setDiscountRaw] = useState(() => {
    if (!initial) return "";
    return initial.discount.replace(/[^0-9]/g, "");
  });
  const [maxUse, setMaxUse] = useState(String(initial?.maxUse ?? ""));
  const [expires, setExpires] = useState(initial ? toInputDate(initial.expires) : "");

  function handleSave() {
    if (!code.trim() || !discountRaw) return;
    const discount = type === "Persen"
      ? `${discountRaw}%`
      : `Rp ${parseInt(discountRaw).toLocaleString("id-ID")}`;
    onSave({
      code: code.trim().toUpperCase(),
      type,
      discount,
      used: initial?.used ?? 0,
      maxUse: parseInt(maxUse) || 100,
      expires: expires ? formatDateDisplay(expires) : "—",
      active: initial?.active ?? true,
    });
  }

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
          {[
            { label: "Kode Voucher", node: (
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: PROMO30"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
            )},
            { label: "Jenis Diskon", node: (
              <select value={type} onChange={e => setType(e.target.value as "Persen" | "Nominal")}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                <option value="Persen">Persentase (%)</option>
                <option value="Nominal">Nominal (Rp)</option>
              </select>
            )},
            { label: "Nilai Diskon", node: (
              <input value={discountRaw} onChange={e => setDiscountRaw(e.target.value)} type="number"
                placeholder={type === "Persen" ? "Contoh: 30" : "Contoh: 20000"}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
            )},
            { label: "Maksimum Penggunaan", node: (
              <input value={maxUse} onChange={e => setMaxUse(e.target.value)} type="number"
                placeholder="Contoh: 100"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
            )},
            { label: "Tanggal Berlaku Hingga", node: (
              <input value={expires} onChange={e => setExpires(e.target.value)} type="date"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
            )},
          ].map(({ label, node }) => (
            <div key={label}>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</label>
              {node}
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Batal
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
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
  initial?: FlashSale;
  onSave: (fs: Omit<FlashSale, "id">) => void;
  onClose: () => void;
}

function FlashSaleModal({ initial, onSave, onClose }: FlashSaleModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [productsRaw, setProductsRaw] = useState(initial?.products.join(", ") ?? "");
  const [startDate, setStartDate] = useState(initial ? toInputDate(initial.startDate) : "");
  const [endDate, setEndDate] = useState(initial ? toInputDate(initial.endDate) : "");
  const [status, setStatus] = useState<FlashSale["status"]>(initial?.status ?? "Akan Datang");

  function handleSave() {
    if (!name.trim() || !productsRaw.trim() || !startDate || !endDate) return;
    onSave({
      name: name.trim(),
      products: productsRaw.split(",").map(s => s.trim()).filter(Boolean),
      startDate: formatDateDisplay(startDate),
      endDate: formatDateDisplay(endDate),
      status,
    });
  }

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
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden md:w-[500px]"
        style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
            {initial ? "Edit Flash Sale" : "Buat Flash Sale"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nama Flash Sale</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Contoh: Flash Sale Akhir Bulan"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Produk <span style={{ fontWeight: 400 }}>(pisahkan dengan koma)</span></label>
            <input value={productsRaw} onChange={e => setProductsRaw(e.target.value)}
              placeholder="Contoh: Stiker Vinyl A4, Brosur A5"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tanggal Selesai</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as FlashSale["status"])}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Batal
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
              {initial ? "Simpan Perubahan" : "Buat Flash Sale"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
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
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState("Minggu Ini");
  const [previewProof, setPreviewProof] = useState<string | null>(null);

  // Voucher state
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [voucherModal, setVoucherModal] = useState<{ open: boolean; editIdx: number | null }>({ open: false, editIdx: null });

  // Flash Sale state
  const [flashSales, setFlashSales] = useState<FlashSale[]>(INITIAL_FLASH_SALES);
  const [flashSaleModal, setFlashSaleModal] = useState<{ open: boolean; editIdx: number | null }>({ open: false, editIdx: null });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; message: string; onConfirm: () => void }>({
    open: false, message: "", onConfirm: () => {},
  });

  const totalRevenue = REVENUE_DATA.reduce((s, d) => s + d.amount, 0);

  // ── Voucher handlers ──────────────────────────────────────────────────────

  function openNewVoucher() {
    setVoucherModal({ open: true, editIdx: null });
  }

  function openEditVoucher(idx: number) {
    setVoucherModal({ open: true, editIdx: idx });
  }

  function closeVoucherModal() {
    setVoucherModal({ open: false, editIdx: null });
  }

  function handleSaveVoucher(saved: Voucher) {
    setVouchers(prev => {
      if (voucherModal.editIdx !== null) {
        return prev.map((v, i) => i === voucherModal.editIdx ? saved : v);
      }
      return [...prev, saved];
    });
    closeVoucherModal();
  }

  function handleToggleVoucher(idx: number) {
    setVouchers(prev => prev.map((v, i) => i === idx ? { ...v, active: !v.active } : v));
  }

  function handleDeleteVoucher(idx: number) {
    setConfirmDialog({
      open: true,
      message: `Hapus voucher "${vouchers[idx].code}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => {
        setVouchers(prev => prev.filter((_, i) => i !== idx));
        setConfirmDialog(d => ({ ...d, open: false }));
      },
    });
  }

  // ── Flash Sale handlers ───────────────────────────────────────────────────

  function openNewFlashSale() {
    setFlashSaleModal({ open: true, editIdx: null });
  }

  function openEditFlashSale(idx: number) {
    setFlashSaleModal({ open: true, editIdx: idx });
  }

  function closeFlashSaleModal() {
    setFlashSaleModal({ open: false, editIdx: null });
  }

  function handleSaveFlashSale(saved: Omit<FlashSale, "id">) {
    setFlashSales(prev => {
      if (flashSaleModal.editIdx !== null) {
        return prev.map((fs, i) => i === flashSaleModal.editIdx ? { ...saved, id: fs.id } : fs);
      }
      return [...prev, { ...saved, id: Date.now() }];
    });
    closeFlashSaleModal();
  }

  function handleDeleteFlashSale(idx: number) {
    setConfirmDialog({
      open: true,
      message: `Hapus flash sale "${flashSales[idx].name}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => {
        setFlashSales(prev => prev.filter((_, i) => i !== idx));
        setConfirmDialog(d => ({ ...d, open: false }));
      },
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 className="font-['Poppins',sans-serif] font-bold"
          style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>
          Manajemen Keuangan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          Laporan pendapatan, konfirmasi bayar, voucher & refund
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
            {t === "Konfirmasi Manual" && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "#EF4444", color: "#fff" }}>
                {PENDING_PAYMENTS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 0: Laporan Pendapatan ── */}
      {activeTab === 0 && (
        <div className="space-y-5">
          <div className="flex gap-2 flex-wrap">
            {PERIODS.map(p => (
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
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Total Pendapatan", value: `Rp ${(totalRevenue / 1000000).toFixed(1)} Jt`, color: "#10B981" },
              { label: "Jumlah Transaksi", value: "47", color: "#3B6FD4" },
              { label: "Rata-rata Nilai Pesanan", value: "Rp 621.000", color: "#F97316" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <p className="text-xs mb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                <p className="font-bold" style={{ color, fontFamily: "'Poppins',sans-serif", fontSize: "1.4rem" }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Trend Pendapatan</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={val => `${(val / 1000000).toFixed(0)}Jt`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#3B6FD4" strokeWidth={2.5} dot={{ fill: "#3B6FD4", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Breakdown per Metode Pembayaran</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                  {["Metode", "Transaksi", "Total", "Persentase"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { method: "Transfer Manual", tx: 16, total: "Rp 12.400.000", pct: "35%" },
                  { method: "QRIS", tx: 13, total: "Rp 9.800.000", pct: "28%" },
                  { method: "Virtual Account", tx: 10, total: "Rp 7.700.000", pct: "22%" },
                  { method: "GoPay / OVO", tx: 8, total: "Rp 5.600.000", pct: "15%" },
                ].map((row, i, arr) => (
                  <tr key={row.method} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                    <td className="px-4 py-3 text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{row.method}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{row.tx}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{row.total}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: v("--c-bg-sec") }}>
                          <div className="h-full rounded-full"
                            style={{ width: row.pct, background: "linear-gradient(to right,#1E3A5F,#F97316)" }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{row.pct}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 1: Konfirmasi Manual ── */}
      {activeTab === 1 && (
        <div className="space-y-4">
          {PENDING_PAYMENTS.length === 0 ? (
            <div className="text-center py-16" style={{ color: v("--c-text-sec") }}>
              <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p style={{ fontFamily: "'Inter',sans-serif" }}>Tidak ada konfirmasi pembayaran yang menunggu</p>
            </div>
          ) : PENDING_PAYMENTS.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <img src={p.proof} alt="Bukti Transfer"
                    className="w-24 h-24 rounded-xl object-cover"
                    style={{ border: `1px solid ${v("--c-border")}` }} />
                  <button onClick={() => setPreviewProof(p.proof)}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 hover:opacity-100 transition-all">
                    <ZoomIn size={18} className="text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-mono font-semibold text-sm" style={{ color: v("--c-primary") }}>{p.id}</p>
                      <p className="font-semibold mt-0.5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{p.customer}</p>
                    </div>
                    <p className="font-bold text-lg" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>{p.amount}</p>
                  </div>
                  <p className="text-xs mb-4" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Diunggah: {p.uploadedAt}</p>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                      <CheckCircle size={14} /> Konfirmasi Valid
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
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

      {/* ── TAB 2: Voucher & Promo ── */}
      {activeTab === 2 && (
        <div className="space-y-5">
          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={openNewVoucher}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
              <Plus size={14} /> Buat Voucher Baru
            </button>
            <button onClick={openNewFlashSale}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-card"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
              <Zap size={14} /> Buat Flash Sale
            </button>
          </div>

          {/* Voucher cards */}
          {vouchers.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <Tag size={32} className="mx-auto mb-3 opacity-30" style={{ color: v("--c-text-sec") }} />
              <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Belum ada voucher. Buat voucher pertamamu.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map((vc, i) => (
                <motion.div key={vc.code} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${v("--c-border")}`, opacity: vc.active ? 1 : 0.6 }}>
                  {/* Ticket header */}
                  <div className="p-5" style={{ background: vc.active ? "linear-gradient(135deg,#1E3A5F,#3B6FD4)" : "#64748B" }}>
                    <div className="flex items-center justify-between mb-3">
                      <Tag size={16} className="text-white/70" />
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontFamily: "'Inter',sans-serif" }}>
                        {vc.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="font-bold text-white text-2xl font-mono">{vc.code}</p>
                    <p className="text-white/80 text-sm mt-1" style={{ fontFamily: "'Inter',sans-serif" }}>Diskon {vc.discount}</p>
                  </div>

                  {/* Ticket body */}
                  <div className="p-4" style={{ background: v("--c-card"), borderTop: `2px dashed ${v("--c-border")}` }}>
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Terpakai</span>
                      <span style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{vc.used}/{vc.maxUse}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: v("--c-bg-sec") }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.round(vc.used / vc.maxUse * 100)}%`, background: vc.active ? "#F97316" : "#94A3B8" }} />
                    </div>
                    <p className="text-xs mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      Berlaku hingga {vc.expires}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => openEditVoucher(i)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => handleToggleVoucher(i)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: vc.active ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.1)",
                          color: vc.active ? "#EF4444" : "#10B981",
                          fontFamily: "'Inter',sans-serif",
                        }}>
                        {vc.active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button onClick={() => handleDeleteVoucher(i)}
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
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: "#F97316" }} />
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Flash Sale</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(249,115,22,0.1)", color: "#F97316", fontFamily: "'Inter',sans-serif" }}>
                  {flashSales.length}
                </span>
              </div>
            </div>

            {flashSales.length === 0 ? (
              <div className="p-10 text-center">
                <Zap size={32} className="mx-auto mb-3 opacity-30" style={{ color: v("--c-text-sec") }} />
                <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Belum ada flash sale. Buat flash sale baru dengan tombol di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                      {["Nama Flash Sale", "Produk", "Mulai", "Selesai", "Status", "Aksi"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flashSales.map((fs, i) => (
                      <tr key={fs.id} style={{ borderBottom: i < flashSales.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                        <td className="px-4 py-3 text-sm font-medium"
                          style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{fs.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {fs.products.map(prod => (
                              <span key={prod} className="px-2 py-0.5 rounded-full text-xs"
                                style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                                {prod}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{fs.startDate}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{fs.endDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{
                            background: fs.status === "Aktif"
                              ? "rgba(239,68,68,0.12)"
                              : fs.status === "Selesai"
                                ? "rgba(16,185,129,0.12)"
                                : "rgba(234,179,8,0.12)",
                            color: fs.status === "Aktif" ? "#EF4444" : fs.status === "Selesai" ? "#10B981" : "#EAB308",
                            fontFamily: "'Inter',sans-serif",
                          }}>
                            {fs.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditFlashSale(i)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                              <Pencil size={11} /> Edit
                            </button>
                            <button onClick={() => handleDeleteFlashSale(i)}
                              className="p-1.5 rounded-lg"
                              style={{ background: "rgba(239,68,68,0.07)", color: "#EF4444" }}
                              title="Hapus flash sale">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Refund ── */}
      {activeTab === 3 && (
        <div className="space-y-4">
          {REFUNDS.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <div className="flex-1">
                <p className="font-mono font-semibold text-sm" style={{ color: v("--c-primary") }}>{r.id}</p>
                <p className="font-medium mt-0.5" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                  {r.customer} — {r.product}
                </p>
                <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Rekening: {r.account}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>{r.amount}</p>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{
                  background: r.status === "Selesai" ? "rgba(16,185,129,0.12)" : r.status === "Diproses" ? "rgba(59,111,212,0.12)" : "rgba(234,179,8,0.12)",
                  color: r.status === "Selesai" ? "#10B981" : r.status === "Diproses" ? "#3B6FD4" : "#EAB308",
                  fontFamily: "'Inter',sans-serif",
                }}>
                  {r.status}
                </span>
              </div>
              {r.status !== "Selesai" && (
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                    <Clock size={12} className="inline mr-1" /> Proses Refund
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Lightbox proof ── */}
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
              style={{ background: "rgba(255,255,255,0.2)" }}
              onClick={() => setPreviewProof(null)}>
              <X size={18} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voucher Modal ── */}
      <AnimatePresence>
        {voucherModal.open && (
          <VoucherModal
            initial={voucherModal.editIdx !== null ? vouchers[voucherModal.editIdx] : undefined}
            onSave={handleSaveVoucher}
            onClose={closeVoucherModal}
          />
        )}
      </AnimatePresence>

      {/* ── Flash Sale Modal ── */}
      <AnimatePresence>
        {flashSaleModal.open && (
          <FlashSaleModal
            initial={flashSaleModal.editIdx !== null ? flashSales[flashSaleModal.editIdx] : undefined}
            onSave={handleSaveFlashSale}
            onClose={closeFlashSaleModal}
          />
        )}
      </AnimatePresence>

      {/* ── Confirm Dialog ── */}
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