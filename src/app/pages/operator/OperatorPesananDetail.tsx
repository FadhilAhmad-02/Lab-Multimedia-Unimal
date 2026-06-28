import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, CheckSquare, Square, Upload, X, Phone, Send, AlertTriangle, Truck, Loader2 } from "lucide-react";
import { v } from "../../components/pageUtils";
import { useAuth } from "../../hooks/useAuth";

const API = "/api/operator";

const STAGE_ORDER = ["VERIFIKASI_FILE","PRACETAK","SEDANG_DICETAK","FINISHING","QC","SIAP_KIRIM"] as const;
type StageKey = typeof STAGE_ORDER[number];

const STAGE_LABELS: Record<StageKey, string> = {
  VERIFIKASI_FILE: "Verifikasi File",
  PRACETAK:        "Pracetak",
  SEDANG_DICETAK:  "Sedang Dicetak",
  FINISHING:       "Finishing",
  QC:              "QC & Packing",
  SIAP_KIRIM:      "Siap Dikirim",
};

const PRISMA_TO_KEY: Record<string, StageKey> = {
  verifikasi_file: "VERIFIKASI_FILE",
  pracetak:        "PRACETAK",
  sedang_dicetak:  "SEDANG_DICETAK",
  finishing:       "FINISHING",
  qc:              "QC",
  siap_kirim:      "SIAP_KIRIM",
};

const CHECKLIST_ITEMS = [
  "Resolusi minimal 300dpi untuk cetak",
  "Ukuran sesuai spesifikasi pesanan",
  "Format file benar (AI/CDR/PDF/PNG)",
  "Mode warna CMYK",
  "Bleed/safe area terpenuhi",
];

const QUICK_REPLIES = [
  "File desain Anda sudah kami terima",
  "Pesanan sedang dicetak",
  "Estimasi selesai besok",
  "Mohon cek kembali file desain",
];

interface OrderDetail {
  id: number;
  status: string;
  totalPrice: number;
  notes: string | null;
  dueAt: string | null;
  urgent: boolean;
  currentStage: string | null;
  nextStage: string | null;
  stageLogs: { id: number; stage: string; startAt: string; endAt: string | null }[];
  user: { fullName: string; phoneNumber: string };
  items: { quantity: number; price: number; product: { name: string; category: string; image: string | null } }[];
}

export function OperatorPesananDetail() {
  const { id } = useParams<{ id: string }>();
  const { authHeader } = useAuth();

  const [order, setOrder]           = useState<OrderDetail | null>(null);
  const [loading, setLoading]       = useState(true);
  const [checklist, setChecklist]   = useState<number[]>([]);
  const [urgent, setUrgent]         = useState(false);
  const [resi, setResi]             = useState("");
  const [kurir, setKurir]           = useState("JNE");
  const [photos, setPhotos]         = useState<string[]>([]);
  const [chatMsg, setChatMsg]       = useState("");
  const [messages, setMessages]     = useState([
    { from: "customer", text: "Kapan pesanan saya selesai?", time: "09:15" },
    { from: "operator", text: "Sedang dalam proses, estimasi besok.", time: "09:20" },
  ]);
  const [confirmModal, setConfirmModal] = useState<StageKey | null>(null);
  const [stageSaving, setStageSaving]   = useState(false);
  const [resiSaving, setResiSaving]     = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/pesanan/${id}`, { headers: authHeader })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setOrder(j.data);
          setUrgent(j.data.urgent);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleCheck = (i: number) =>
    setChecklist(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
  const allChecked = checklist.length === CHECKLIST_ITEMS.length;

  // Hitung steps dari data order
  const buildSteps = () => {
    if (!order) return STAGE_ORDER.map(k => ({ key: k, label: STAGE_LABELS[k], done: false, active: false }));
    const currentKey = order.currentStage ? PRISMA_TO_KEY[order.currentStage] : null;
    const currentIdx = currentKey ? STAGE_ORDER.indexOf(currentKey) : -1;
    return STAGE_ORDER.map((k, i) => ({
      key: k,
      label: STAGE_LABELS[k],
      done:   i < currentIdx,
      active: i === currentIdx,
    }));
  };
  const steps   = buildSteps();
  const nextKey = order?.nextStage ? PRISMA_TO_KEY[order.nextStage] : null;

  const advanceStage = async (key: StageKey) => {
    setStageSaving(true);
    try {
      const res  = await fetch(`${API}/pesanan/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ stage: key }),
      });
      const json = await res.json();
      if (json.success) setOrder(json.data);
      else alert(json.message);
    } finally {
      setStageSaving(false);
      setConfirmModal(null);
    }
  };

  const toggleUrgent = async () => {
    const newVal = !urgent;
    setUrgent(newVal);
    await fetch(`${API}/pesanan/${id}/urgent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ urgent: newVal }),
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id) return;
    const fd = new FormData();
    Array.from(e.target.files).forEach(f => fd.append("photos", f));
    const res  = await fetch(`${API}/pesanan/${id}/photos`, { method: "POST", headers: authHeader, body: fd });
    const json = await res.json();
    if (json.success) setPhotos(p => [...p, ...json.data.urls].slice(0, 10));
  };

  const handleSaveResi = async () => {
    if (!resi.trim()) return;
    setResiSaving(true);
    try {
      const res  = await fetch(`${API}/pesanan/${id}/resi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ kurir, resi }),
      });
      const json = await res.json();
      if (json.success) { setOrder(json.data); alert("Resi berhasil disimpan"); }
      else alert(json.message);
    } finally {
      setResiSaving(false);
    }
  };

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { from: "operator", text: chatMsg, time: "Baru saja" }]);
    setChatMsg("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: v("--c-bg") }}>
      <Loader2 className="animate-spin" size={32} style={{ color: v("--c-text-sec") }} />
    </div>
  );
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: v("--c-bg") }}>
      <p style={{ color: v("--c-text-sec") }}>Pesanan tidak ditemukan</p>
    </div>
  );

  const spec = order.items[0];

  return (
    <div className="min-h-screen" style={{ background: v("--c-bg") }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 sticky top-0 z-20" style={{ background: v("--c-card"), borderBottom: `1px solid ${v("--c-border")}` }}>
        <Link to="/operator" className="flex items-center gap-1 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <ChevronLeft size={16} /> Kembali
        </Link>
        <div className="flex-1">
          <p className="font-bold font-mono" style={{ color: v("--c-text"), fontFamily: "'JetBrains Mono',monospace" }}>#{order.id}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs font-semibold" style={{ color: urgent ? "#EF4444" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            <AlertTriangle size={13} className="inline mr-1" />Urgent
          </span>
          <div onClick={toggleUrgent} className="w-10 h-5 rounded-full relative transition-all cursor-pointer" style={{ background: urgent ? "#EF4444" : v("--c-bg-sec") }}>
            <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm" style={{ left: urgent ? "1.25rem" : "2px" }} />
          </div>
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* Left */}
        <div className="flex flex-col gap-5">
          {/* Customer */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Info Customer</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{order.user.fullName}</p>
                <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{order.user.phoneNumber}</p>
              </div>
              <a href={`https://wa.me/${order.user.phoneNumber.replace(/\D/g,"")}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#25D366", fontFamily: "'Inter',sans-serif" }}>
                <Phone size={14} /> WA
              </a>
            </div>
          </div>

          {/* Spesifikasi */}
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="px-5 py-3" style={{ borderBottom: `1px solid ${v("--c-border")}`, background: v("--c-bg-sec") }}>
              <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Spesifikasi Pesanan</p>
            </div>
            {[
              ["Produk",   spec?.product?.name ?? "—"],
              ["Kategori", spec?.product?.category ?? "—"],
              ["Qty",      `${spec?.quantity ?? 0} pcs`],
              ["Harga",    `Rp ${(spec?.price ?? 0).toLocaleString("id-ID")}`],
              ["Total",    `Rp ${order.totalPrice.toLocaleString("id-ID")}`],
              ["Status",   order.status],
              ["Catatan",  order.notes ?? "—"],
            ].map(([k, val]) => (
              <div key={k} className="flex px-5 py-2.5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <span className="w-24 text-xs flex-shrink-0" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{k}</span>
                <span className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Resi */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Input Nomor Resi</h3>
            <div className="flex gap-2 mb-3">
              <select value={kurir} onChange={e => setKurir(e.target.value)} className="rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                {["JNE","J&T","SiCepat","Kurir Toko"].map(k => <option key={k}>{k}</option>)}
              </select>
              <input value={resi} onChange={e => setResi(e.target.value)} placeholder="Nomor resi..."
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'JetBrains Mono',monospace" }} />
            </div>
            <button onClick={handleSaveResi} disabled={resiSaving || !resi.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
              {resiSaving ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
              Simpan & Update ke "Siap Kirim"
            </button>
          </div>

          {/* Upload foto */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Upload Foto Progres</h3>
            <label className="flex flex-col items-center gap-2 py-5 rounded-xl cursor-pointer mb-3"
              style={{ border: `2px dashed ${v("--c-border")}`, background: v("--c-bg-sec") }}>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              <Upload size={20} style={{ color: v("--c-text-sec") }} />
              <p className="text-xs text-center" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Upload foto progres produksi<br /><span style={{ color: v("--c-primary") }}>Klik atau drag & drop</span>
              </p>
            </label>
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p} alt="" className="w-full h-14 object-cover rounded-lg" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, pi) => pi !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "#EF4444", color: "#fff" }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="px-5 py-3" style={{ borderBottom: `1px solid ${v("--c-border")}`, background: "var(--c-gradient-r)" }}>
              <p className="font-semibold text-sm text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>Chat dengan Customer</p>
            </div>
            <div className="h-48 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "operator" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%] px-3 py-2 rounded-xl" style={{ background: msg.from === "operator" ? "var(--c-gradient-r)" : v("--c-bg-sec") }}>
                    <p className="text-xs" style={{ color: msg.from === "operator" ? "#fff" : v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{msg.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: msg.from === "operator" ? "rgba(255,255,255,0.6)" : v("--c-text-sec"), fontSize: "10px" }}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-2 flex gap-1 overflow-x-auto">
              {QUICK_REPLIES.map(qr => (
                <button key={qr} onClick={() => setChatMsg(qr)} className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs"
                  style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                  {qr}
                </button>
              ))}
            </div>
            <div className="p-3 flex gap-2" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Tulis pesan..." className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
              <button onClick={sendMessage} className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "var(--c-gradient-r)" }}>
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          {/* File checklist */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Verifikasi File</h3>
              <span className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>{checklist.length}/{CHECKLIST_ITEMS.length}</span>
            </div>
            <div className="h-1.5 rounded-full mb-4" style={{ background: v("--c-bg-sec") }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(checklist.length / CHECKLIST_ITEMS.length) * 100}%`, background: allChecked ? "#10B981" : "var(--c-gradient-r)" }} />
            </div>
            {CHECKLIST_ITEMS.map((item, i) => (
              <button key={i} onClick={() => toggleCheck(i)} className="flex items-center gap-3 py-2.5 w-full text-left"
                style={{ borderBottom: i < CHECKLIST_ITEMS.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                {checklist.includes(i)
                  ? <CheckSquare size={16} style={{ color: "#10B981", flexShrink: 0 }} />
                  : <Square size={16} style={{ color: v("--c-text-sec"), flexShrink: 0 }} />}
                <span className="text-sm" style={{ color: checklist.includes(i) ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{item}</span>
              </button>
            ))}
            <div className="flex gap-2 mt-4">
              <button disabled={!allChecked} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: allChecked ? "#10B981" : "rgba(16,185,129,0.3)", fontFamily: "'Inter',sans-serif", cursor: allChecked ? "pointer" : "not-allowed" }}>
                ✓ File Valid
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ border: "1.5px solid #EF4444", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                Tolak File
              </button>
            </div>
          </div>

          {/* Status produksi */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Update Status Produksi</h3>
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: v("--c-border"), zIndex: 0 }} />
              {steps.map(({ key, label, done, active }) => (
                <button key={key} onClick={() => !done && !active && nextKey === key ? setConfirmModal(key) : undefined}
                  className="flex items-center gap-4 py-2.5 relative z-10 text-left">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? "#10B981" : active ? "var(--c-gradient-r)" : v("--c-bg-sec"), border: !done && !active ? `2px solid ${v("--c-border")}` : "none" }}>
                    {done ? <span className="text-white text-xs">✓</span> : active ? <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> : null}
                  </div>
                  <span className="text-sm font-medium" style={{ color: done || active ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</span>
                  {nextKey === key && !done && !active && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Selanjutnya</span>
                  )}
                </button>
              ))}
            </div>
            {nextKey && (
              <button onClick={() => setConfirmModal(nextKey)} disabled={stageSaving}
                className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                {stageSaving && <Loader2 size={14} className="animate-spin" />}
                Lanjutkan ke: {STAGE_LABELS[nextKey]} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmModal(null)}>
            <div className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-80 rounded-2xl p-6" style={{ background: v("--c-card") }} onClick={e => e.stopPropagation()}>
              <h3 className="font-bold mb-2" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Konfirmasi Update</h3>
              <p className="text-sm mb-5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Pindahkan status ke "{STAGE_LABELS[confirmModal]}"?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Batal</button>
                <button onClick={() => advanceStage(confirmModal)} disabled={stageSaving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                  {stageSaving && <Loader2 size={13} className="animate-spin" />}
                  Konfirmasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}