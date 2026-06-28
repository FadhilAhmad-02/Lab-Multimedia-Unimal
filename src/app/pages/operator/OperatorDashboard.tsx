import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Inbox, Wrench, CheckCircle, Clock, ArrowRight, AlertTriangle, Package, Loader2 } from "lucide-react";
import { v } from "../../components/pageUtils";
import { useAuth } from "../../hooks/useAuth";

const API = "/api/operator";

interface KpiData {
  pesananMasuk: number;
  dikerjakan: number;
  selesaiHari: number;
  terlambat: number;
}
interface OrderSummary {
  id: number;
  user: { fullName: string };
  items: { product: { name: string } }[];
  dueAt: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 60)  return `${min} mnt lalu`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24)  return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}
function deadlineLabel(dueAt: string | null, urgent: boolean) {
  if (!dueAt) return "—";
  const diff = new Date(dueAt).getTime() - Date.now();
  if (diff < 0)  return "Terlambat";
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24)  return `${hrs} jam lagi`;
  return `${Math.floor(hrs / 24)} hari lagi`;
}
function isUrgent(o: OrderSummary) {
  return !!(o.notes?.includes("[URGENT]") || (o.dueAt && new Date(o.dueAt).getTime() - Date.now() < 24 * 3600000));
}

const KPI_META = [
  { key: "pesananMasuk", label: "Pesanan Masuk", Icon: Inbox,       color: "var(--c-primary)", bg: "rgba(46,125,50,0.1)"  },
  { key: "dikerjakan",   label: "Dikerjakan",    Icon: Wrench,      color: "var(--c-accent)",  bg: "rgba(249,168,37,0.1)" },
  { key: "selesaiHari",  label: "Selesai Hari",  Icon: CheckCircle, color: "#10B981",          bg: "rgba(16,185,129,0.1)" },
  { key: "terlambat",    label: "Terlambat",     Icon: Clock,       color: "#EF4444",          bg: "rgba(239,68,68,0.1)"  },
] as const;

export function OperatorDashboard() {
  const { authHeader } = useAuth();
  const [kpi, setKpi]                   = useState<KpiData | null>(null);
  const [pesananBaru, setPesananBaru]   = useState<OrderSummary[]>([]);
  const [pesananAktif, setPesananAktif] = useState<OrderSummary[]>([]);
  const [loading, setLoading]           = useState(true);
  const [takenIds, setTakenIds]         = useState<number[]>([]);

  useEffect(() => {
    fetch(`${API}/dashboard`, { headers: authHeader })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setKpi(j.data.kpi);
          setPesananBaru(j.data.pesananBaru);
          setPesananAktif(j.data.pesananAktif);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAmbil = async (orderId: number) => {
    setTakenIds(t => [...t, orderId]);
    try {
      await fetch(`${API}/antrian/${orderId}/ambil`, { method: "POST", headers: authHeader });
      setPesananBaru(prev => prev.filter(o => o.id !== orderId));
      // refresh KPI
      fetch(`${API}/dashboard`, { headers: authHeader })
        .then(r => r.json())
        .then(j => j.success && setKpi(j.data.kpi));
    } catch {
      setTakenIds(t => t.filter(id => id !== orderId));
    }
  };

  const stageLabel: Record<string, string> = {
    verifikasi_file: "Verifikasi File",
    pracetak:        "Pracetak",
    sedang_dicetak:  "Sedang Dicetak",
    finishing:       "Finishing",
    qc:              "QC & Packing",
    siap_kirim:      "Siap Dikirim",
  };
  function currentStage(o: OrderSummary) {
    const logs = (o as any).stageLogs as {stage: string}[] | undefined;
    if (!logs?.length) return "Menunggu";
    return stageLabel[logs[logs.length - 1].stage] ?? logs[logs.length - 1].stage;
  }

  return (
    <div className="p-6" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Greeting */}
      <div className="mb-7">
        <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", color: v("--c-text") }}>
          Halo, Operator 👋
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", fontFamily: "'Inter',sans-serif" }}>
            Shift Aktif
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_META.map(({ key, label, Icon, color, bg }) => (
          <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
            className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              {loading
                ? <div className="h-8 w-10 rounded animate-pulse" style={{ background: v("--c-bg-sec") }} />
                : <p className="font-['Poppins',sans-serif] font-bold text-3xl leading-none mb-1" style={{ color }}>{kpi?.[key] ?? 0}</p>
              }
              <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pesanan Baru */}
        <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}`, background: "rgba(46,125,50,0.04)" }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <Package size={14} style={{ color: v("--c-primary") }} />
              <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Pesanan Baru Masuk</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>{pesananBaru.length}</span>
          </div>
          <div className="flex flex-col">
            {loading
              ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" style={{ color: v("--c-text-sec") }} /></div>
              : pesananBaru.length === 0
                ? <p className="p-6 text-sm text-center" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tidak ada pesanan baru</p>
                : pesananBaru.map((order, i) => {
                    const urgent = isUrgent(order);
                    const taken  = takenIds.includes(order.id);
                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-3 px-5 py-4"
                        style={{ borderBottom: i < pesananBaru.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-mono font-bold" style={{ color: v("--c-text"), fontFamily: "'JetBrains Mono',monospace" }}>#{order.id}</p>
                            {urgent && <span className="px-1.5 py-0.5 rounded text-xs font-bold animate-pulse" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>URGENT</span>}
                          </div>
                          <p className="text-sm font-semibold truncate" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                            {order.items[0]?.product?.name ?? "—"}
                          </p>
                          <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{order.user.fullName} · {timeSince(order.createdAt)}</p>
                        </div>
                        {!taken
                          ? <button onClick={() => handleAmbil(order.id)} className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>Ambil</button>
                          : <span className="text-xs font-semibold" style={{ color: "#10B981" }}>✓ Diambil</span>
                        }
                      </motion.div>
                    );
                  })
            }
          </div>
        </div>

        {/* Pesanan Aktif */}
        <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
            <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>⚙️ Sedang Dikerjakan</p>
            <Link to="/operator/antrian" className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
              Lihat Semua <ArrowRight size={11} className="inline" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {loading
              ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" style={{ color: v("--c-text-sec") }} /></div>
              : <table className="w-full">
                  <thead>
                    <tr style={{ background: v("--c-bg-sec") }}>
                      {["No.", "Customer", "Produk", "Deadline", "Status", "Aksi"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pesananAktif.length === 0
                      ? <tr><td colSpan={6} className="px-4 py-6 text-sm text-center" style={{ color: v("--c-text-sec") }}>Tidak ada pesanan aktif</td></tr>
                      : pesananAktif.map(order => {
                          const urgent = isUrgent(order);
                          return (
                            <tr key={order.id} style={{ borderBottom: `1px solid ${v("--c-border")}`, background: urgent ? "rgba(239,68,68,0.03)" : "transparent" }}>
                              <td className="px-4 py-3"><p className="text-xs font-mono" style={{ color: v("--c-primary"), fontFamily: "'JetBrains Mono',monospace" }}>#{order.id}</p></td>
                              <td className="px-4 py-3 text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{order.user.fullName}</td>
                              <td className="px-4 py-3 text-xs" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{order.items[0]?.product?.name ?? "—"}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-semibold" style={{ color: urgent ? "#EF4444" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                                  {urgent && <AlertTriangle size={11} className="inline mr-1" />}
                                  {deadlineLabel(order.dueAt, urgent)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(46,125,50,0.1)", color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>
                                  {currentStage(order)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <Link to={`/operator/pesanan/${order.id}`} className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Update →</Link>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
            }
          </div>
        </div>
      </div>
    </div>
  );
}