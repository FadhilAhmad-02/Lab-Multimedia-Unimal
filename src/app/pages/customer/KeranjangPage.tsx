import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Lock, ChevronRight } from "lucide-react";
import { v } from "../../components/pageUtils";

const IMG_BANNER = "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5uZXIlMjBwcmludGluZyUyMGxhcmdlJTIwZm9ybWF0JTIwc2lnbmFnZXxlbnwxfHx8fDE3NzE5MjI3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_CARD  = "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNhcmQlMjBkZXNpZ24lMjBwcmludCUyMG1vY2t1cHxlbnwxfHx8fDE3NzE5MjI3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080";

const INIT_CART = [
  { id: "c1", name: "Banner Vinyl Premium 60×160", spec: "Flexi Korea · Laminasi Glossy · 2 pcs", price: 128000, qty: 2, image: IMG_BANNER, checked: true },
  { id: "c2", name: "Kartu Nama Laminasi UV (100 lembar)", spec: "Art Paper 260gr · Spot UV · 3 set", price: 35000, qty: 3, image: IMG_CARD, checked: true },
];

export function KeranjangPage() {
  const [items, setItems] = useState(INIT_CART);
  const [voucher, setVoucher]   = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState("");
  const [voucherState, setVoucherState] = useState<"" | "ok" | "err">("");

  const checked = items.filter(i => i.checked);
  const subtotal = checked.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal - discount;

  const updateQty = (id: string, delta: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const toggleCheck = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const applyVoucher = () => {
    if (voucher.toUpperCase() === "MALIKUSS10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setVoucherMsg(`Yeay! Diskon 10% (Rp ${disc.toLocaleString("id-ID")}) berhasil diterapkan.`);
      setVoucherState("ok");
    } else {
      setDiscount(0);
      setVoucherMsg("Kode voucher tidak valid atau sudah kedaluwarsa.");
      setVoucherState("err");
    }
  };

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5" style={{ background: v("--c-bg") }}>
      <div className="w-32 h-32 rounded-3xl flex items-center justify-center" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
        <ShoppingBag size={48} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
      </div>
      <div className="text-center">
        <h2 className="font-['Poppins',sans-serif] font-bold text-xl mb-2" style={{ color: v("--c-text") }}>Keranjang kamu masih kosong</h2>
        <p className="text-sm mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Yuk mulai belanja dan temukan produk cetak impianmu!</p>
        <Link to="/produk" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
          Mulai Belanja <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          <span style={{ color: v("--c-accent") }}>Keranjang</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-10 pb-20">
        <h1 className="font-['Poppins',sans-serif] font-bold mb-8 mt-2" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: v("--c-text") }}>
          Keranjang Belanja ({items.length} item)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Select all */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={items.every(i => i.checked)} onChange={e => setItems(prev => prev.map(i => ({ ...i, checked: e.target.checked })))} className="w-4 h-4" style={{ accentColor: v("--c-primary") }} />
                <span className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Pilih Semua ({items.length} item)</span>
              </label>
              <button onClick={() => setItems([])} className="flex items-center gap-1 text-xs text-red-500" style={{ fontFamily: "'Inter',sans-serif" }}>
                <Trash2 size={12} /> Hapus Semua
              </button>
            </div>

            <AnimatePresence>
              {items.map((item) => (
                <motion.div key={item.id} layout exit={{ x: 100, opacity: 0 }} transition={{ duration: 0.3 }}
                  className="rounded-2xl p-4 flex gap-4" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
                >
                  <div className="flex items-center">
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} className="w-4 h-4" style={{ accentColor: v("--c-primary") }} />
                  </div>
                  <img src={item.image} alt={item.name} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-0.5 truncate" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{item.name}</p>
                    <p className="text-xs mb-3" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{item.spec}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${v("--c-border")}` }}>
                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><Minus size={12} /></button>
                        <span className="w-9 text-center text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><Plus size={12} /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>
                          Rp {(item.price * item.qty).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          Rp {item.price.toLocaleString("id-ID")}/satuan
                        </p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="flex-shrink-0 self-start text-red-400 hover:text-red-500 transition-colors mt-1">
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 flex flex-col gap-4">
            <div className="rounded-2xl p-5" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              <h3 className="font-['Poppins',sans-serif] font-bold mb-5" style={{ color: v("--c-text") }}>Ringkasan Pesanan</h3>

              {/* Voucher */}
              <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
                  <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Kode voucher" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none uppercase" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'JetBrains Mono', monospace" }} />
                </div>
                <button onClick={applyVoucher} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                  Pakai
                </button>
              </div>
              {voucherMsg && (
                <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ color: voucherState === "ok" ? "#10B981" : "#EF4444", background: voucherState === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", fontFamily: "'Inter',sans-serif" }}>
                  {voucherMsg}
                </p>
              )}

              {/* Price breakdown */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Subtotal ({checked.length} item)</span>
                  <span style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Ongkir</span>
                  <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Dihitung saat checkout</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>Diskon Voucher</span>
                    <span style={{ color: "#10B981", fontFamily: "'Poppins',sans-serif" }}>-Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-3 mb-4" style={{ borderTop: `2px solid ${v("--c-border")}` }}>
                <span className="font-bold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Total</span>
                <span className="font-bold text-xl" style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}>Rp {total.toLocaleString("id-ID")}</span>
              </div>

              <Link to="/checkout" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white mb-3" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
                Lanjut ke Checkout <ArrowRight size={15} />
              </Link>

              <div className="flex items-center justify-center gap-2">
                <Lock size={12} style={{ color: v("--c-text-sec") }} />
                <p className="text-xs text-center" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Pembayaran 100% Aman & Terenkripsi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}