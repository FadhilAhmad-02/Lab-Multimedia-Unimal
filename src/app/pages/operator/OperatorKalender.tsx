import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X, Sliders, Lock, Unlock } from "lucide-react";
import { v } from "../../components/pageUtils";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

interface DayData {
  orders: number;
  maxOrders: number;
  blocked: boolean;
  blockReason?: string;
}

function buildDayMap(year: number, month: number): Record<number, DayData> {
  const map: Record<number, DayData> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const base = Math.floor(Math.random() * 10);
    map[d] = { orders: base, maxOrders: 10, blocked: false };
  }
  // hardcode a few
  map[3]  = { orders: 9, maxOrders: 10, blocked: false };
  map[10] = { orders: 0, maxOrders: 10, blocked: true, blockReason: "Libur Nasional" };
  map[17] = { orders: 5, maxOrders: 10, blocked: false };
  return map;
}

const SAMPLE_ORDERS: Record<number, { id: string; customer: string; product: string; status: string }[]> = {
  3:  [{ id: "ORD-0048", customer: "Siti Rahayu",  product: "Banner Vinyl 100×200", status: "Diproses" }],
  17: [{ id: "ORD-0042", customer: "Ahmad Fauzi",  product: "Kartu Nama UV 500pcs", status: "Finishing" }, { id: "ORD-0041", customer: "Dewi Fatimah", product: "Undangan Pernikahan", status: "Pracetak" }],
};

function capacityColor(orders: number, max: number, blocked: boolean) {
  if (blocked) return "#9CA3AF";
  const pct = orders / max;
  if (pct < 0.5)  return "#10B981";
  if (pct < 0.85) return "#F59E0B";
  return "#EF4444";
}

export function OperatorKalender() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [dayMap, setDayMap]       = useState<Record<number, DayData>>(() => buildDayMap(today.getFullYear(), today.getMonth()));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [panelOpen,   setPanelOpen]   = useState(false);

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setDayMap(buildDayMap(viewMonth === 0 ? viewYear - 1 : viewYear, viewMonth === 0 ? 11 : viewMonth - 1));
    setPanelOpen(false);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setDayMap(buildDayMap(viewMonth === 11 ? viewYear + 1 : viewYear, viewMonth === 11 ? 0 : viewMonth + 1));
    setPanelOpen(false);
  };

  const openPanel = (day: number) => {
    setSelectedDay(day);
    setPanelOpen(true);
  };

  const toggleBlock = (day: number) => {
    setDayMap(prev => ({
      ...prev,
      [day]: { ...prev[day], blocked: !prev[day].blocked, blockReason: prev[day].blocked ? undefined : "Diblokir operator" },
    }));
  };

  const changeMax = (day: number, val: number) => {
    setDayMap(prev => ({ ...prev, [day]: { ...prev[day], maxOrders: Math.max(1, Math.min(20, val)) } }));
  };

  const selData   = selectedDay ? dayMap[selectedDay] : null;
  const selOrders = selectedDay ? (SAMPLE_ORDERS[selectedDay] || []) : [];

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="p-5 md:p-7 theme-aware" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", color: v("--c-text") }}>
            Kalender Produksi
          </h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Atur kapasitas dan jadwal produksi harian
          </p>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.92 }} onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <ChevronLeft size={16} style={{ color: v("--c-text-sec") }} />
          </motion.button>
          <span className="font-['Poppins',sans-serif] font-bold" style={{ color: v("--c-text"), minWidth: 160, textAlign: "center" }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <motion.button whileTap={{ scale: 0.92 }} onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <ChevronRight size={16} style={{ color: v("--c-text-sec") }} />
          </motion.button>
          <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(59,111,212,0.12)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
            Hari Ini
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        {[
          { color: "#10B981", label: "< 50% kapasitas" },
          { color: "#F59E0B", label: "50–85% kapasitas" },
          { color: "#EF4444", label: "> 85% / penuh" },
          { color: "#9CA3AF", label: "Diblokir" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const data = dayMap[day] || { orders: 0, maxOrders: 10, blocked: false };
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              const color = capacityColor(data.orders, data.maxOrders, data.blocked);
              const pct = data.orders / data.maxOrders;

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openPanel(day)}
                  className="rounded-xl p-2 cursor-pointer transition-all duration-200 min-h-[70px] flex flex-col"
                  style={{
                    background: selectedDay === day ? `${color}20` : v("--c-card"),
                    border: selectedDay === day ? `2px solid ${color}` : `1px solid ${v("--c-border")}`,
                    opacity: data.blocked ? 0.7 : 1,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{
                      color: isToday ? "var(--c-primary)" : v("--c-text"),
                      fontFamily: "'Poppins',sans-serif",
                      background: isToday ? "rgba(46,125,50,0.12)" : "transparent",
                      borderRadius: 6, padding: isToday ? "1px 5px" : 0,
                    }}>{day}</span>
                    {data.blocked && <span className="text-xs" style={{ color: "#9CA3AF" }}>🔒</span>}
                  </div>

                  {!data.blocked && (
                    <>
                      <div className="w-full h-1.5 rounded-full overflow-hidden mt-auto mb-1" style={{ background: v("--c-bg-sec") }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, pct * 100)}%`, background: color }} />
                      </div>
                      <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {data.orders}/{data.maxOrders}
                      </span>
                    </>
                  )}
                  {data.blocked && (
                    <p className="text-xs mt-auto" style={{ color: "#9CA3AF", fontFamily: "'Inter',sans-serif", fontSize: 10 }}>
                      {data.blockReason || "Diblokir"}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {panelOpen && selectedDay && selData && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="w-72 flex-shrink-0 rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, height: "fit-content", position: "sticky", top: 80 }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <p className="font-bold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                  {selectedDay} {MONTHS[viewMonth]} {viewYear}
                </p>
                <button onClick={() => setPanelOpen(false)} style={{ color: v("--c-text-sec") }}><X size={16} /></button>
              </div>

              {/* Orders list */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Pesanan Terjadwal ({selOrders.length})
                </p>
                {selOrders.length === 0 ? (
                  <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tidak ada pesanan</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selOrders.map(o => (
                      <div key={o.id} className="rounded-xl p-3" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                        <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{o.id}</p>
                        <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{o.customer} — {o.product}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block"
                          style={{ background: "rgba(59,111,212,0.12)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Capacity slider */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Maks. Pesanan
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={1} max={20}
                    value={selData.maxOrders}
                    onChange={e => changeMax(selectedDay, parseInt(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: "var(--c-primary)" }}
                  />
                  <span className="text-sm font-bold w-6 text-center" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                    {selData.maxOrders}
                  </span>
                </div>
              </div>

              {/* Block toggle */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Blokir Hari Ini
                </p>
                <button
                  onClick={() => toggleBlock(selectedDay)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: selData.blocked ? "rgba(239,68,68,0.1)" : v("--c-bg-sec"),
                    border: `1px solid ${selData.blocked ? "#EF4444" : v("--c-border")}`,
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: selData.blocked ? "#EF4444" : v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                    {selData.blocked ? "Hari Diblokir" : "Blokir Hari Ini"}
                  </span>
                  {selData.blocked ? <Lock size={15} style={{ color: "#EF4444" }} /> : <Unlock size={15} style={{ color: v("--c-text-sec") }} />}
                </button>
                {selData.blocked && (
                  <p className="text-xs mt-1.5" style={{ color: "#9CA3AF", fontFamily: "'Inter',sans-serif" }}>
                    Alasan: {selData.blockReason || "Tidak ada alasan"}
                  </p>
                )}
              </div>

              <button
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
              >
                Simpan Perubahan
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}