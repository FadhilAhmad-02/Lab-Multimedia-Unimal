import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, CheckCircle, Package, Truck,
  MessageCircle, X, Upload, AlertCircle,
  RefreshCw, ExternalLink, ImageIcon, Send,
  ShoppingBag, CreditCard, Clock,
} from "lucide-react";
import { v } from "../../components/pageUtils";

// ─── Konstanta & config ───────────────────────────────────────────────────────

const API_BASE = "/api";

/** Urutan resmi semua stage produksi */
const STAGE_ORDER = [
  "verifikasi_file",
  "pracetak",
  "sedang_dicetak",
  "finishing",
  "qc",
  "siap_kirim",
] as const;

type ProductionStage = (typeof STAGE_ORDER)[number];

const STAGE_LABEL: Record<ProductionStage, string> = {
  verifikasi_file: "Verifikasi File Desain",
  pracetak:        "Pracetak",
  sedang_dicetak:  "Sedang Dicetak",
  finishing:       "Finishing",
  qc:              "QC & Packing",
  siap_kirim:      "Siap Dikirim",
};

const STAGE_NOTE: Record<ProductionStage, string> = {
  verifikasi_file: "Tim kami sedang memeriksa file desain Anda.",
  pracetak:        "Persiapan mesin dan bahan baku.",
  sedang_dicetak:  "Produksi berjalan — mesin cetak aktif.",
  finishing:       "Proses laminasi, pemotongan, dan finishing.",
  qc:              "Pemeriksaan kualitas dan pengemasan.",
  siap_kirim:      "Produk siap dikirim atau diambil.",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Menunggu",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  processing: { label: "Diproses",   color: "var(--c-primary)", bg: "rgba(46,125,50,0.1)" },
  completed:  { label: "Selesai",    color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  cancelled:  { label: "Dibatalkan", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  unpaid:   { label: "Belum Bayar",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  paid:     { label: "Lunas",        color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  rejected: { label: "Bukti Ditolak",color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageLog {
  id: number;
  stage: ProductionStage;
  startAt: string;
  endAt: string | null;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    category: string;
    image: string | null;
  };
}

interface Order {
  id: number;
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "rejected";
  notes: string | null;
  createdAt: string;
  confirmedAt: string | null;
  dueAt: string | null;
  items: OrderItem[];
  stageLogs: StageLog[];
  operator?: { id: number; fullName: string } | null;
}

interface TimelineEntry {
  key: string;
  label: string;
  note: string;
  date: string | null;
  done: boolean;
  active: boolean;
}

interface ChatMessage {
  from: "customer" | "operator";
  text: string;
  time: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token") ?? sessionStorage.getItem("token") ?? "";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatOrderId(id: number) {
  return `ORD-${String(id).padStart(8, "0")}`;
}

function extractResi(notes: string | null): { kurir: string; resi: string } | null {
  if (!notes) return null;
  const match = notes.match(/\[RESI:([^:]+):([^\]]+)\]/);
  if (!match) return null;
  return { kurir: match[1]!, resi: match[2]! };
}

/**
 * Bangun daftar timeline dari stageLogs order.
 * Entry pertama selalu "Pesanan Diterima" dari createdAt.
 */
function buildTimeline(order: Order): TimelineEntry[] {
  const logMap = new Map<ProductionStage, StageLog>();
  for (const log of order.stageLogs) {
    // Jika ada duplikat stage, ambil yang terbaru
    if (!logMap.has(log.stage) || new Date(log.startAt) > new Date(logMap.get(log.stage)!.startAt)) {
      logMap.set(log.stage, log);
    }
  }

  // Entry awal: pesanan diterima
  const entries: TimelineEntry[] = [
    {
      key: "order_received",
      label: "Pesanan Diterima",
      note: "Pesanan Anda telah masuk ke sistem kami.",
      date: formatDate(order.createdAt),
      done: true,
      active: false,
    },
  ];

  // Stage produksi
  for (const stage of STAGE_ORDER) {
    const log = logMap.get(stage);
    const done   = !!log?.endAt;
    const active = !!log && !log.endAt;

    entries.push({
      key: stage,
      label: STAGE_LABEL[stage],
      note: STAGE_NOTE[stage],
      date: log ? formatDate(log.startAt) : null,
      done,
      active,
    });
  }

  return entries;
}

// ─── Komponen kecil ───────────────────────────────────────────────────────────

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ""}`}
      style={{ background: v("--c-border"), ...style }}
    />
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: v("--c-bg") }}>
      {/* Sticky header skeleton */}
      <div className="sticky top-0 z-30 px-5 md:px-10 py-4 flex items-center gap-4" style={{ background: v("--c-card"), borderBottom: `1px solid ${v("--c-border")}` }}>
        <Skeleton className="w-20 h-5" />
        <Skeleton className="flex-1 h-5 max-w-xs" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 grid md:grid-cols-5 gap-8 animate-pulse">
        <div className="md:col-span-2 flex flex-col gap-4">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="flex gap-4">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-3 flex flex-col gap-5">
          {[1,2,3].map(n => (
            <div key={n} className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-14 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Upload Bukti Bayar ───────────────────────────────────────────────────────

function PaymentProofUploader({ orderId, onSuccess }: { orderId: number; onSuccess: () => void }) {
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setError("Hanya file gambar atau PDF yang diizinkan.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }
    setError(null);
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("proof", file);
      const res = await fetch(`${API_BASE}/customer/orders/${orderId}/payment-proof`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? `Upload gagal (${res.status})`);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Upload gagal.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
        Upload Bukti Pembayaran
      </h3>

      {/* Drop area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl cursor-pointer transition-all"
        style={{
          border: `2px dashed ${file ? v("--c-primary") : v("--c-border")}`,
          background: file ? "rgba(46,125,50,0.04)" : v("--c-bg-sec"),
          minHeight: 100,
        }}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
        ) : file ? (
          <div className="flex items-center gap-2">
            <ImageIcon size={20} style={{ color: v("--c-primary") }} />
            <span className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
              {file.name}
            </span>
          </div>
        ) : (
          <>
            <Upload size={22} style={{ color: v("--c-text-sec") }} />
            <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
              Klik untuk pilih file
            </p>
            <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              JPG, PNG, atau PDF · Maks 5 MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <p className="text-xs mt-2" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>{error}</p>
      )}

      {file && (
        <button
          onClick={upload}
          disabled={uploading}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity"
          style={{ background: "var(--c-gradient-r)", opacity: uploading ? 0.6 : 1, fontFamily: "'Inter',sans-serif" }}
        >
          {uploading ? (
            <><RefreshCw size={14} className="animate-spin" /> Mengupload...</>
          ) : (
            <><Upload size={14} /> Kirim Bukti Bayar</>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ onClose, operatorName }: { onClose: () => void; operatorName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "operator", text: `Halo! Saya ${operatorName}, operator yang menangani pesanan Anda. Ada yang bisa saya bantu?`, time: "Baru saja" },
  ]);
  const [input, setInput]     = useState("");
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setMessages(m => [...m, { from: "customer", text: input, time: now }]);
    setInput("");
    // Simulasi balasan operator
    // TODO: ganti dengan WebSocket / polling endpoint saat tersedia
    setTimeout(() => {
      setMessages(m => [...m, {
        from: "operator",
        text: "Pesan Anda sudah kami terima. Kami akan segera merespons.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-80 rounded-2xl flex flex-col shadow-2xl z-50 overflow-hidden"
      style={{
        background: v("--c-card"),
        border: `1px solid ${v("--c-border")}`,
        height: "min(420px, 70vh)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "var(--c-gradient-r)" }}>
        <div>
          <p className="font-bold text-sm text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>Chat Operator</p>
          <p className="text-xs text-white/70" style={{ fontFamily: "'Inter',sans-serif" }}>{operatorName}</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "customer" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] px-3 py-2 rounded-2xl"
              style={{
                background: msg.from === "customer" ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                borderBottomRightRadius: msg.from === "customer" ? 4 : undefined,
                borderBottomLeftRadius:  msg.from === "operator" ? 4 : undefined,
              }}
            >
              <p className="text-xs leading-relaxed" style={{ color: msg.from === "customer" ? "#fff" : v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                {msg.text}
              </p>
              <p className="text-right mt-0.5" style={{ color: msg.from === "customer" ? "rgba(255,255,255,0.55)" : v("--c-text-sec"), fontSize: 10, fontFamily: "'Inter',sans-serif" }}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Tulis pesan..."
          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
          style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-opacity"
          style={{ background: "var(--c-gradient-r)", opacity: input.trim() ? 1 : 0.4 }}
        >
          <Send size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PesananDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder]         = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [chatOpen, setChatOpen]   = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmDone, setConfirmDone] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${API_BASE}/customer/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) throw new Error("Pesanan tidak ditemukan.");
      if (res.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(`Gagal memuat pesanan (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error("Respons server tidak valid.");
      setOrder(json.data);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const confirmReceived = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API_BASE}/customer/orders/${order.id}/confirm-received`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Gagal mengonfirmasi.");
      setConfirmDone(true);
      // Refresh data
      await fetchOrder();
    } catch (err: any) {
      alert(err.message ?? "Gagal mengonfirmasi penerimaan.");
    } finally {
      setConfirming(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) return <DetailSkeleton />;

  // ── Error ──────────────────────────────────────────────────
  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-5" style={{ background: v("--c-bg") }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
        <AlertCircle size={28} color="#EF4444" />
      </div>
      <div className="text-center">
        <p className="font-bold text-lg mb-1" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
          {error ?? "Pesanan tidak ditemukan"}
        </p>
        <p className="text-sm mb-5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          Silakan kembali ke daftar pesanan.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={fetchOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: v("--c-bg-sec"), color: v("--c-text"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}
          >
            <RefreshCw size={14} /> Coba Lagi
          </button>
          <Link
            to="/pesanan"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
          >
            <ChevronLeft size={14} /> Kembali
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Data turunan ───────────────────────────────────────────
  const timeline   = buildTimeline(order);
  const resi       = extractResi(order.notes);
  const statusCfg  = STATUS_CONFIG[order.status]  ?? { label: order.status,  color: v("--c-text-sec"), bg: v("--c-bg-sec") };
  const paymentCfg = PAYMENT_CONFIG[order.paymentStatus] ?? { label: order.paymentStatus, color: v("--c-text-sec"), bg: v("--c-bg-sec") };
  const operatorName = order.operator?.fullName ?? "Operator";

  // Apakah sudah bisa konfirmasi terima? (status completed, belum confirmedAt)
  const canConfirm = order.status === "completed" && !order.confirmedAt && !confirmDone;

  // Perlu upload bukti bayar? (unpaid atau rejected)
  const needPaymentProof = order.paymentStatus === "unpaid" || order.paymentStatus === "rejected";

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>

      {/* ── Sticky Header ─────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-5 md:px-10 py-4 flex items-center gap-4"
        style={{ background: v("--c-card"), borderBottom: `1px solid ${v("--c-border")}` }}
      >
        <Link
          to="/pesanan"
          className="flex items-center gap-1 text-sm flex-shrink-0"
          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
        >
          <ChevronLeft size={16} /> Kembali
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }}>
            {formatOrderId(order.id)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: paymentCfg.bg, color: paymentCfg.color, fontFamily: "'Inter',sans-serif" }}
          >
            {paymentCfg.label}
          </span>
          <span
            className="hidden sm:block px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: statusCfg.bg, color: statusCfg.color, fontFamily: "'Inter',sans-serif" }}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 grid md:grid-cols-5 gap-8">

        {/* ─ Kolom kiri: Timeline ─ */}
        <div className="md:col-span-2">
          <h2 className="font-['Poppins',sans-serif] font-bold mb-6" style={{ color: v("--c-text") }}>
            Progres Pesanan
          </h2>

          {/* Estimasi selesai */}
          {order.dueAt && order.status === "processing" && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-5 text-xs"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontFamily: "'Inter',sans-serif" }}
            >
              <Clock size={13} color="#F59E0B" className="flex-shrink-0" />
              <span style={{ color: v("--c-text-sec") }}>
                Estimasi selesai:{" "}
                <strong style={{ color: "#F59E0B" }}>
                  {new Date(order.dueAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </strong>
              </span>
            </div>
          )}

          {/* Timeline entries */}
          <div className="relative">
            {/* Garis vertikal */}
            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: v("--c-border") }} />

            <div className="flex flex-col">
              {timeline.map(({ key, label, note, date, done, active }) => (
                <div key={key} className="flex gap-4 pb-7 relative">
                  {/* Dot */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10"
                    style={{
                      background: done
                        ? "#10B981"
                        : active
                        ? "var(--c-gradient-r)"
                        : v("--c-bg-sec"),
                      border: !done && !active ? `2px solid ${v("--c-border")}` : "none",
                    }}
                  >
                    {done ? (
                      <CheckCircle size={14} className="text-white" />
                    ) : active ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: v("--c-border") }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p
                      className="font-semibold text-sm"
                      style={{
                        color: done || active ? v("--c-text") : v("--c-text-sec"),
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {label}
                      {active && (
                        <span
                          className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}
                        >
                          Sedang berlangsung
                        </span>
                      )}
                    </p>
                    {date && (
                      <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {date}
                      </p>
                    )}
                    {(done || active) && (
                      <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
                        {note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─ Kolom kanan: Detail & Aksi ─ */}
        <div className="md:col-span-3 flex flex-col gap-5">

          {/* Detail Produk */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
              Detail Produk
            </h3>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-16 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: v("--c-bg-sec") }}
                    >
                      <ShoppingBag size={16} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                      {item.product.name}
                    </p>
                    <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      {item.product.category} · {item.quantity} pcs
                    </p>
                    <p className="font-bold text-sm mt-0.5" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between mt-4 pt-3"
              style={{ borderTop: `1px solid ${v("--c-border")}` }}
            >
              <span className="text-sm font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Total Pembayaran
              </span>
              <span className="font-bold text-lg" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                Rp {order.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Upload Bukti Bayar — tampil jika belum/ditolak */}
          {needPaymentProof && (
            <>
              {order.paymentStatus === "rejected" && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <AlertCircle size={15} color="#EF4444" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
                    Bukti pembayaran sebelumnya ditolak oleh tim kami. Silakan upload ulang bukti yang jelas dan sesuai.
                  </p>
                </div>
              )}
              <PaymentProofUploader orderId={order.id} onSuccess={fetchOrder} />
            </>
          )}

          {/* Info Pengiriman — tampil jika ada resi */}
          {resi && (
            <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                Info Pengiriman
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                    {resi.kurir} Reguler
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Resi: {resi.resi}
                  </p>
                </div>
                <a
                  href={`https://cekresi.com/?noresi=${resi.resi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", fontFamily: "'Inter',sans-serif" }}
                >
                  <Truck size={12} /> Lacak <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}

          {/* Info Operator */}
          {order.operator && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                style={{ background: "var(--c-gradient-r)" }}
              >
                {order.operator.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Operator yang menangani
                </p>
                <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                  {order.operator.fullName}
                </p>
              </div>
              <button
                onClick={() => setChatOpen(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
              >
                <MessageCircle size={12} /> Chat
              </button>
            </div>
          )}

          {/* Aksi utama */}
          {(canConfirm || order.status === "processing") && (
            <div
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
            >
              <h3 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                Aksi
              </h3>

              {canConfirm && (
                <button
                  onClick={confirmReceived}
                  disabled={confirming}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white w-full justify-center transition-opacity"
                  style={{ background: "#10B981", opacity: confirming ? 0.6 : 1, fontFamily: "'Inter',sans-serif" }}
                >
                  {confirming ? (
                    <><RefreshCw size={14} className="animate-spin" /> Mengonfirmasi...</>
                  ) : (
                    <><CheckCircle size={15} /> Konfirmasi Penerimaan</>
                  )}
                </button>
              )}

              <button
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold w-full justify-center"
                style={{ border: `1.5px solid #EF4444`, color: "#EF4444", fontFamily: "'Inter',sans-serif" }}
              >
                Ajukan Komplain
              </button>
            </div>
          )}

          {/* Sudah dikonfirmasi */}
          {order.confirmedAt && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <CheckCircle size={18} color="#10B981" className="flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#10B981", fontFamily: "'Poppins',sans-serif" }}>
                  Penerimaan Dikonfirmasi
                </p>
                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  {formatDate(order.confirmedAt)}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Floating Chat Button ─────────────────────────── */}
      {order.operator && (
        <button
          onClick={() => setChatOpen(prev => !prev)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-40 transition-transform active:scale-95"
          style={{ background: "var(--c-gradient-r)" }}
        >
          <AnimatePresence mode="wait">
            {chatOpen ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={22} className="text-white" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle size={22} className="text-white" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* ── Chat Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && order.operator && (
          <ChatPanel onClose={() => setChatOpen(false)} operatorName={operatorName} />
        )}
      </AnimatePresence>

    </div>
  );
}