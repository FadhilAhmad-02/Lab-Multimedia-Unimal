import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, CheckCircle, Clock, Package, Truck, Star, Upload, MessageCircle, X } from "lucide-react";
import { v } from "../../components/pageUtils";

const TIMELINE = [
  { status: "Pesanan Diterima",  date: "20 Feb 2025, 09:15", note: "Pesanan Anda telah kami terima.", done: true },
  { status: "Verifikasi File",   date: "20 Feb 2025, 10:30", note: "File desain sedang diverifikasi tim kami.", done: true },
  { status: "Sedang Dicetak",   date: "21 Feb 2025, 08:00", note: "Produksi dimulai — mesin cetak aktif.", done: true, photos: ["https://images.unsplash.com/photo-1706895040634-62055892cbbb?w=120", "https://images.unsplash.com/photo-1630327722923-5ebd594ddda9?w=120"] },
  { status: "Finishing",         date: "22 Feb 2025, 14:00", note: "Proses laminasi dan pemotongan.", done: false, active: true },
  { status: "QC & Packing",     date: null, note: null, done: false },
  { status: "Siap Dikirim",     date: null, note: null, done: false },
];

export function PesananDetailPage() {
  const { id = "ORD-2025-0042" } = useParams();
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatMsg, setChatMsg]     = useState("");
  const [messages, setMessages]   = useState([
    { from: "operator", text: "Halo! Pesanan Anda sedang dalam proses produksi.", time: "21 Feb, 09:00" },
    { from: "customer", text: "Baik, terima kasih infonya!", time: "21 Feb, 09:05" },
    { from: "operator", text: "File desain sudah kami terima dan valid. Proses cetak dimulai hari ini.", time: "21 Feb, 10:30" },
  ]);
  const [uploadFile, setUploadFile] = useState<string | null>(null);

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { from: "customer", text: chatMsg, time: "Baru saja" }]);
    setChatMsg("");
    setTimeout(() => setMessages(m => [...m, { from: "operator", text: "Pesan Anda sudah diterima. Kami akan segera merespons.", time: "Baru saja" }]), 1500);
  };

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-5 md:px-10 py-4 flex items-center gap-4" style={{ background: v("--c-card"), borderBottom: `1px solid ${v("--c-border")}` }}>
        <Link to="/pesanan" className="flex items-center gap-1 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <ChevronLeft size={16} /> Kembali
        </Link>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)", fontFamily: "'Inter',sans-serif" }}>Diproses</span>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 grid md:grid-cols-5 gap-8">
        {/* Timeline */}
        <div className="md:col-span-2">
          <h2 className="font-['Poppins',sans-serif] font-bold mb-6" style={{ color: v("--c-text") }}>Progres Pesanan</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: v("--c-border") }} />
            <div className="flex flex-col gap-0">
              {TIMELINE.map(({ status, date, note, done, active, photos }, i) => (
                <div key={status} className="flex gap-4 pb-7 relative">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: done ? "#10B981" : active ? "var(--c-gradient-r)" : v("--c-bg-sec"), border: !done && !active ? `2px solid ${v("--c-border")}` : "none" }}>
                    {done ? <CheckCircle size={14} className="text-white" /> : active ? <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> : <div className="w-2.5 h-2.5 rounded-full" style={{ background: v("--c-border") }} />}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-sm" style={{ color: done || active ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{status}</p>
                    {date && <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{date}</p>}
                    {note && <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>{note}</p>}
                    {photos && (
                      <div className="flex gap-2 mt-2">
                        {photos.map((p, pi) => (
                          <img key={pi} src={p} alt="Progres" className="w-14 h-10 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail & Actions */}
        <div className="md:col-span-3 flex flex-col gap-5">
          {/* Product info */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Detail Produk</h3>
            <div className="flex gap-3">
              <img src="https://images.unsplash.com/photo-1698319298199-b81a54ced28a?w=100" alt="" className="w-16 h-12 rounded-xl object-cover" />
              <div>
                <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Banner Vinyl Premium 60×160</p>
                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Flexi Korea · Laminasi Glossy · 2 pcs</p>
                <p className="font-bold mt-1" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>Rp 128.000</p>
              </div>
            </div>
          </div>

          {/* File desain */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>File Desain</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(46,125,50,0.1)" }}>
                <Package size={16} style={{ color: v("--c-primary") }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>banner_60x160_final.pdf</p>
                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>2.4 MB · Diunggah 20 Feb 2025</p>
              </div>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: v("--c-gradient-r"), color: "#fff", fontFamily: "'Inter',sans-serif" }}>Download</button>
            </div>
          </div>

          {/* Pengiriman */}
          <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-3" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Info Pengiriman</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>JNE Reguler</p>
                <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Resi: JNE001234567890</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
                <Truck size={13} /> Lacak
              </button>
            </div>
          </div>

          {/* Aksi */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <h3 className="font-semibold mb-1" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Aksi</h3>
            <button className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white w-full justify-center" style={{ background: "#10B981", fontFamily: "'Inter',sans-serif" }}>
              <CheckCircle size={15} /> Konfirmasi Penerimaan
            </button>
            <button className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold w-full justify-center" style={{ border: `1.5px solid #EF4444`, color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
              Ajukan Komplain
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-40" style={{ background: "var(--c-gradient-r)" }}>
        <MessageCircle size={22} className="text-white" />
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed bottom-6 right-6 w-80 h-96 rounded-2xl flex flex-col shadow-2xl z-50 overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--c-gradient-r)", }}>
              <p className="font-semibold text-sm text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>Chat Operator</p>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "customer" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] px-3 py-2 rounded-xl" style={{ background: msg.from === "customer" ? "var(--c-gradient-r)" : v("--c-bg-sec") }}>
                    <p className="text-xs" style={{ color: msg.from === "customer" ? "#fff" : v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{msg.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: msg.from === "customer" ? "rgba(255,255,255,0.6)" : v("--c-text-sec"), fontSize: "10px", fontFamily: "'Inter',sans-serif" }}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 flex gap-2" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Tulis pesan..." className="flex-1 px-3 py-2 rounded-xl text-xs outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
              <button onClick={sendMessage} className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "var(--c-gradient-r)" }}>
                <MessageCircle size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}