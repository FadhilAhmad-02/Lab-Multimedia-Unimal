import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { Clock, AlertTriangle, Filter, ArrowUpDown, CheckCircle, Loader2 } from "lucide-react";
import { v } from "../../components/pageUtils";
import { useAuth } from "../../hooks/useAuth";

const API = "/api/operator";

interface OrderItem { product: { name: string; category: string } }
interface QueueOrder {
  id: number;
  user: { fullName: string };
  items: OrderItem[];
  dueAt: string | null;
  createdAt: string;
  notes: string | null;
  countdownMs: number | null;
  urgent: boolean;
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  "Spanduk & Banner": { bg: "rgba(46,125,50,0.12)",  color: "var(--c-primary)" },
  "Cetak Digital":    { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
  "Undangan":         { bg: "rgba(234,179,8,0.12)",  color: "#EAB308" },
  "Packaging":        { bg: "rgba(124,58,237,0.12)", color: "#7C3AED" },
  "Souvenir":         { bg: "rgba(249,168,37,0.12)", color: "var(--c-accent)" },
};

function CountdownBadge({ ms }: { ms: number }) {
  const hours   = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const veryUrgent = hours < 3;
  const urgent     = hours < 24;
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
      style={{ background: veryUrgent ? "rgba(239,68,68,0.12)" : urgent ? "rgba(234,179,8,0.12)" : "rgba(16,185,129,0.1)" }}>
      <Clock size={11} style={{ color: veryUrgent ? "#EF4444" : urgent ? "#EAB308" : "#10B981" }} />
      <span className="text-xs font-bold" style={{ color: veryUrgent ? "#EF4444" : urgent ? "#EAB308" : "#10B981", fontFamily: "'JetBrains Mono',monospace" }}>
        {hours}j {minutes}m lagi
      </span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const FILTERS = ["Semua", "Urgent", "Spanduk & Banner", "Cetak Digital", "Undangan", "Packaging"];

export function OperatorAntrian() {
  const { authHeader } = useAuth();
  const [queue, setQueue]       = useState<QueueOrder[]>([]);
  const [loading, setLoading]   = useState(true);
  const [takingIds, setTaking]  = useState<number[]>([]);
  const [filter, setFilter]     = useState("Semua");
  const [sort, setSort]         = useState("fifo");

  const fetchQueue = () => {
    setLoading(true);
    fetch(`${API}/antrian?sort=${sort}&filter=${encodeURIComponent(filter)}`, { headers: authHeader })
      .then(r => r.json())
      .then(j => j.success && setQueue(j.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, [filter, sort]);

  const handleTake = async (id: number) => {
    setTaking(prev => [...prev, id]);
    try {
      const res  = await fetch(`${API}/antrian/${id}/ambil`, { method: "POST", headers: authHeader });
      const json = await res.json();
      if (json.success) {
        setTimeout(() => setQueue(prev => prev.filter(q => q.id !== id)), 500);
      } else {
        alert(json.message);
        setTaking(prev => prev.filter(x => x !== id));
      }
    } catch {
      setTaking(prev => prev.filter(x => x !== id));
    }
  };

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", color: v("--c-text") }}>Antrian Pesanan</h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{queue.length} pesanan menunggu diambil</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={14} style={{ color: "#EF4444" }} />
          <span className="text-sm font-semibold" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
            {queue.filter(q => q.urgent).length} Urgent
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: v("--c-text-sec") }} />
          <span className="text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Filter:</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{ background: filter === f ? "var(--c-gradient-r)" : v("--c-card"), color: filter === f ? "#fff" : v("--c-text-sec"), border: `1px solid ${filter === f ? "transparent" : v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
              {f === "Urgent" && "⚡ "}{f}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <ArrowUpDown size={14} style={{ color: v("--c-text-sec") }} />
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            <option value="fifo">FIFO (Default)</option>
            <option value="deadline">Deadline Terdekat</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: v("--c-text-sec") }} /></div>
        ) : (
          <AnimatePresence>
            {queue.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 rounded-2xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <CheckCircle size={40} className="mx-auto mb-3" style={{ color: v("--c-text-sec"), opacity: 0.3 }} />
                <p className="font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Poppins',sans-serif" }}>Tidak ada antrian</p>
                <p className="text-sm mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Semua pesanan sudah diambil</p>
              </motion.div>
            ) : queue.map(q => {
              const isTaking  = takingIds.includes(q.id);
              const category  = q.items[0]?.product?.category ?? "";
              const typeStyle = TYPE_COLORS[category] ?? { bg: "rgba(100,116,139,0.1)", color: "#64748B" };

              return (
                <motion.div key={q.id}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: isTaking ? 0 : 1, x: isTaking ? 200 : 0 }}
                  exit={{ opacity: 0, x: 200 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: v("--c-card"), border: `2px solid ${q.urgent ? "rgba(239,68,68,0.4)" : v("--c-border")}` }}>
                  {q.urgent && <div className="h-1.5" style={{ background: "linear-gradient(to right,#EF4444,var(--c-accent))" }} />}
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <p className="font-mono font-bold text-sm" style={{ color: v("--c-primary") }}>#{q.id}</p>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: typeStyle.bg, color: typeStyle.color, fontFamily: "'Inter',sans-serif" }}>{category || "Umum"}</span>
                        {q.urgent && (
                          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                            ⚡ URGENT
                          </motion.span>
                        )}
                      </div>
                      {q.countdownMs !== null && <CountdownBadge ms={q.countdownMs} />}
                    </div>

                    {/* Info */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-5">
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Customer</p>
                        <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{q.user.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Produk</p>
                        <p className="font-medium text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{q.items[0]?.product?.name ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Deadline</p>
                        <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{q.dueAt ? formatDate(q.dueAt) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Masuk</p>
                        <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{formatDate(q.createdAt)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <motion.button onClick={() => handleTake(q.id)} whileTap={{ scale: 0.97 }} disabled={isTaking}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
                        {isTaking ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengambil...</> : "✓ Ambil Pesanan"}
                      </motion.button>
                      <Link to={`/operator/pesanan/${q.id}`} className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                        Detail
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}