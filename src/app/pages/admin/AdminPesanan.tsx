import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, Download, Eye, UserCheck, X, Ban,
  ChevronLeft, ChevronRight, Calendar, ChevronDown,
  FileSpreadsheet, FileText, CheckCircle2,
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { useAuth } from "../../hooks/useAuth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// ── TYPES ────────────────────────────────────────────────────────
type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: { id: number; name: string };
};

type Order = {
  id: number;
  userId: number;
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; fullName: string; email: string };
  items: OrderItem[];
};

// ── HELPERS ──────────────────────────────────────────────────────
const STATUS_MAP: Record<string, string> = {
  pending:    "Menunggu Bayar",
  processing: "Diproses",
  completed:  "Selesai",
  cancelled:  "Dibatalkan",
};

const STATUS_COLOR: Record<string, string> = {
  "Menunggu Bayar": "#EAB308",
  "Diproses":       "var(--c-primary)",
  "Selesai":        "#10B981",
  "Dibatalkan":     "#EF4444",
};

const STATUS_LIST = ["Semua", "Menunggu Bayar", "Diproses", "Selesai", "Dibatalkan"];
const PER_PAGE    = 8;

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });

// ── COMPONENT ────────────────────────────────────────────────────
export function AdminPesanan() {
  const { authHeader } = useAuth();

  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("Semua");
  const [showFilter,    setShowFilter]    = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page,          setPage]          = useState(1);
  const [flagged,       setFlagged]       = useState<Set<number>>(new Set());
  const [updatingId,    setUpdatingId]    = useState<number | null>(null);
  const [showExport,    setShowExport]    = useState(false);
  const exportRef                         = useRef<HTMLDivElement>(null);

  // ── FETCH ORDERS ─────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/api/orders`, { headers: authHeader });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Gagal mengambil pesanan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setShowExport(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── EXPORT HELPERS ───────────────────────────────────────────
  const exportRows = () =>
    filtered.map(o => ({
      "No. Pesanan":  `ORD-${String(o.id).padStart(4, "0")}`,
      "Customer":     o.user.fullName,
      "Email":        o.user.email,
      "Produk":       o.items.map(i => `${i.product.name} ×${i.quantity}`).join("; ") || "-",
      "Total":        o.totalPrice,
      "Status":       STATUS_MAP[o.status] ?? o.status,
      "Catatan":      o.notes || "-",
      "Tanggal":      formatDate(o.createdAt),
    }));

  const exportExcel = () => {
    const rows = exportRows();
    const ws   = XLSX.utils.json_to_sheet(rows);
    // Format kolom Total sebagai mata uang IDR
    rows.forEach((_, i) => {
      const cell = ws[`E${i + 2}`];
      if (cell) cell.z = '"Rp "#,##0';
    });
    ws["!cols"] = [14, 24, 28, 40, 18, 16, 24, 14].map(wch => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pesanan");
    XLSX.writeFile(wb, `laporan-pesanan-${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowExport(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Laporan Pesanan", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Diekspor: ${new Date().toLocaleDateString("id-ID")}  |  Total: ${filtered.length} pesanan`, 14, 22);

    autoTable(doc, {
      startY: 27,
      head: [["No. Pesanan", "Customer", "Produk", "Total", "Status", "Catatan", "Tanggal"]],
      body: exportRows().map(r => [
        r["No. Pesanan"], r["Customer"], r["Produk"],
        formatRupiah(r["Total"] as number), r["Status"], r["Catatan"], r["Tanggal"],
      ]),
      styles:     { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 250, 245] },
      columnStyles: { 2: { cellWidth: 50 }, 5: { cellWidth: 35 } },
    });

    doc.save(`laporan-pesanan-${new Date().toISOString().slice(0, 10)}.pdf`);
    setShowExport(false);
  };

  // ── UPDATE STATUS ────────────────────────────────────────────
  const updateStatus = async (orderId: number, status: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method:  "PATCH",
        headers: authHeader,
        body:    JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal update status");
      await fetchOrders();
      // Update drawer jika order yang sama sedang dibuka
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev =>
          prev ? { ...prev, status: status as Order["status"] } : null
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── FILTER & PAGINATION ──────────────────────────────────────
  const filtered = orders.filter(o => {
    const label       = STATUS_MAP[o.status] ?? o.status;
    const productName = o.items.map(i => i.product.name).join(", ");
    const matchSearch =
      `ORD-${String(o.id).padStart(4, "0")}`.toLowerCase().includes(search.toLowerCase()) ||
      o.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      productName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || label === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const orderId    = (o: Order) => `ORD-${String(o.id).padStart(4, "0")}`;
  const isFlagged  = (id: number) => flagged.has(id);
  const toggleFlag = (id: number) =>
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-['Poppins',sans-serif] font-bold"
          style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>
          Manajemen Pesanan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          Kelola semua pesanan customer dari sini
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nomor pesanan, customer, produk..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: showFilter ? "rgba(46,125,50,0.1)" : v("--c-card"), color: showFilter ? "var(--c-primary)" : v("--c-text-sec"), border: `1px solid ${showFilter ? "var(--c-primary)" : v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
          <Filter size={14} /> Filter
        </button>
        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExport(p => !p)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showExport ? "rgba(46,125,50,0.1)" : v("--c-card"),
              color: showExport ? "var(--c-primary)" : v("--c-text-sec"),
              border: `1px solid ${showExport ? "var(--c-primary)" : v("--c-border")}`,
              fontFamily: "'Inter',sans-serif",
            }}>
            <Download size={14} /> Export <ChevronDown size={12} style={{ transition: "transform .2s", transform: showExport ? "rotate(180deg)" : "none" }} />
          </button>
          <AnimatePresence>
            {showExport && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-20"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                <button
                  onClick={exportExcel}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors text-left"
                  style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                  <FileSpreadsheet size={14} style={{ color: "#10B981" }} />
                  Export Excel
                </button>
                <div style={{ borderTop: `1px solid ${v("--c-border")}` }} />
                <button
                  onClick={exportPDF}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors text-left"
                  style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                  <FileText size={14} style={{ color: "#EF4444" }} />
                  Export PDF
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl mb-4"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_LIST.map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: statusFilter === s ? "rgba(46,125,50,0.15)" : v("--c-bg-sec"),
                        color: statusFilter === s ? "var(--c-primary)" : v("--c-text-sec"),
                        border: `1px solid ${statusFilter === s ? "var(--c-primary)" : v("--c-border")}`,
                        fontFamily: "'Inter',sans-serif",
                      }}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Rentang Tanggal</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                  <Calendar size={13} style={{ color: v("--c-text-sec") }} />
                  <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Pilih tanggal</span>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setStatusFilter("Semua"); setPage(1); }}
                  className="px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <span className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            {loading ? "Memuat data..." : `${filtered.length} pesanan ditemukan`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                {["No. Pesanan", "Customer", "Produk", "Total", "Status", "Catatan", "Tanggal", "Aksi"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Memuat pesanan...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Tidak ada pesanan ditemukan
                  </td>
                </tr>
              ) : paged.map((o, i) => {
                const label       = STATUS_MAP[o.status] ?? o.status;
                const color       = STATUS_COLOR[label] ?? "#888";
                const productName = o.items.map(it => it.product.name).join(", ") || "-";
                return (
                  <motion.tr key={o.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{
                      borderBottom: i < paged.length - 1 ? `1px solid ${v("--c-border")}` : "none",
                      background: isFlagged(o.id) ? "rgba(239,68,68,0.04)" : "transparent",
                    }}
                    className="transition-all">
                    <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: "var(--c-primary)" }}>
                      {orderId(o)}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                      {o.user.fullName}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[140px] truncate" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      {productName}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                      {formatRupiah(o.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: color + "20", color, fontFamily: "'Inter',sans-serif" }}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[120px] truncate" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      {o.notes || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedOrder(o)} title="Lihat Detail"
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}>
                          <Eye size={12} />
                        </button>
                        <button
                          title="Tandai / Batal Tandai"
                          onClick={() => toggleFlag(o.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: isFlagged(o.id) ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.1)",
                            color: isFlagged(o.id) ? "#EF4444" : "#10B981",
                          }}>
                          <UserCheck size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
          <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}` }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: page === p ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                  color: page === p ? "#fff" : v("--c-text-sec"),
                  fontFamily: "'Inter',sans-serif",
                }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
              style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}` }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── DETAIL DRAWER ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (() => {
          const label = STATUS_MAP[selectedOrder.status] ?? selectedOrder.status;
          const color = STATUS_COLOR[label] ?? "#888";
          return (
            <>
              <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)} />
              <motion.div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl flex flex-col overflow-hidden"
                style={{ background: v("--c-card"), borderLeft: `1px solid ${v("--c-border")}` }}
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}>

                {/* Drawer Header */}
                <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                  <div>
                    <h2 className="font-semibold font-mono" style={{ color: v("--c-text") }}>{orderId(selectedOrder)}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 inline-block"
                      style={{ background: color + "20", color, fontFamily: "'Inter',sans-serif" }}>
                      {label}
                    </span>
                  </div>
                  <button onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}>
                    <X size={16} />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {[
                    { label: "Customer", value: selectedOrder.user.fullName },
                    { label: "Email",    value: selectedOrder.user.email },
                    { label: "Total",    value: formatRupiah(selectedOrder.totalPrice) },
                    { label: "Catatan", value: selectedOrder.notes || "-" },
                    { label: "Tanggal", value: formatDate(selectedOrder.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-3"
                      style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                      <span className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</span>
                      <span className="text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{value}</span>
                    </div>
                  ))}

                  {/* Item List */}
                  <div className="p-4 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>ITEM PESANAN</p>
                    {selectedOrder.items.length === 0 ? (
                      <p className="text-xs" style={{ color: v("--c-text-sec") }}>Tidak ada item</p>
                    ) : selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2"
                        style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                        <div>
                          <p className="text-xs font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{item.product.name}</p>
                          <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>×{item.quantity}</p>
                        </div>
                        <p className="text-xs font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Update Status */}
                  <div className="p-4 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>UPDATE STATUS</p>
                    <div className="flex flex-wrap gap-2">
                      {(["pending", "processing", "completed", "cancelled"] as const).map(s => (
                        <button key={s}
                          disabled={selectedOrder.status === s || updatingId === selectedOrder.id}
                          onClick={() => updateStatus(selectedOrder.id, s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                          style={{
                            background: selectedOrder.status === s ? (STATUS_COLOR[STATUS_MAP[s]] ?? "#888") + "25" : v("--c-card"),
                            color: STATUS_COLOR[STATUS_MAP[s]] ?? "#888",
                            border: `1px solid ${selectedOrder.status === s ? STATUS_COLOR[STATUS_MAP[s]] : v("--c-border")}`,
                            fontFamily: "'Inter',sans-serif",
                          }}>
                          {STATUS_MAP[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-5 space-y-2" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                  {/* Status hint */}
                  {selectedOrder.status === "pending" && (
                    <p className="text-xs text-center pb-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      Proses pesanan terlebih dahulu sebelum menyelesaikannya
                    </p>
                  )}
                  {selectedOrder.status === "completed" && (
                    <p className="text-xs text-center pb-1" style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                      ✓ Pesanan ini telah selesai
                    </p>
                  )}
                  {selectedOrder.status === "cancelled" && (
                    <p className="text-xs text-center pb-1" style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                      Pesanan ini telah dibatalkan
                    </p>
                  )}
                  <div className="flex gap-2">
                    {/* Proses */}
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "processing")}
                      disabled={
                        selectedOrder.status !== "pending" ||
                        updatingId === selectedOrder.id
                      }
                      title={selectedOrder.status !== "pending" ? "Hanya pesanan Menunggu Bayar yang bisa diproses" : undefined}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                      style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                      {updatingId === selectedOrder.id && selectedOrder.status === "pending"
                        ? "Memproses..." : "Proses"}
                    </button>

                    {/* Selesai — hanya aktif saat processing */}
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "completed")}
                      disabled={
                        selectedOrder.status !== "processing" ||
                        updatingId === selectedOrder.id
                      }
                      title={selectedOrder.status !== "processing" ? "Proses pesanan terlebih dahulu" : "Tandai sebagai selesai"}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all"
                      style={{
                        background: selectedOrder.status === "processing"
                          ? "rgba(16,185,129,0.15)" : v("--c-bg-sec"),
                        color: "#10B981",
                        border: `1px solid ${selectedOrder.status === "processing" ? "#10B981" : v("--c-border")}`,
                        fontFamily: "'Inter',sans-serif",
                      }}>
                      <CheckCircle2 size={14} />
                      {updatingId === selectedOrder.id && selectedOrder.status === "processing"
                        ? "Menyimpan..." : "Selesai"}
                    </button>

                    {/* Batalkan */}
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "cancelled")}
                      disabled={
                        selectedOrder.status === "cancelled" ||
                        selectedOrder.status === "completed" ||
                        updatingId === selectedOrder.id
                      }
                      title="Batalkan pesanan"
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>
                      <Ban size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}