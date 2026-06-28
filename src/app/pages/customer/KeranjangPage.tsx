import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight,
  Tag, Lock, ChevronRight, X, RefreshCw,
} from "lucide-react";
import { v } from "../../components/pageUtils";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const API_BASE       = "/api";
const CART_KEY       = "malikuss_cart";       // localStorage key item keranjang
const VOUCHER_KEY    = "malikuss_voucher";    // localStorage key voucher aktif

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;          // unik per baris keranjang (bisa productId + config)
  productId: number;
  name: string;
  spec: string;        // ringkasan konfigurasi: "Flexi Korea · Glossy · 2 pcs"
  price: number;       // harga per satuan (sudah termasuk extraPrice konfigurasi)
  qty: number;
  image: string | null;
  checked: boolean;
}

export interface AppliedVoucher {
  code: string;
  type: "percentage" | "nominal";
  discountValue: number;   // persen (1-100) atau nominal (Rp)
  discountAmount: number;  // nilai Rp yang didiskon dari subtotal saat ini
}

interface VoucherFromApi {
  id: number;
  code: string;
  type: "percentage" | "nominal";
  discount: number;
  maxUse: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(VOUCHER_KEY);
}

export function getAppliedVoucher(): AppliedVoucher | null {
  try {
    const raw = localStorage.getItem(VOUCHER_KEY);
    return raw ? (JSON.parse(raw) as AppliedVoucher) : null;
  } catch {
    return null;
  }
}

function saveVoucher(v: AppliedVoucher | null) {
  if (v) localStorage.setItem(VOUCHER_KEY, JSON.stringify(v));
  else localStorage.removeItem(VOUCHER_KEY);
}

// ─── Hitung diskon ────────────────────────────────────────────────────────────

function calcDiscount(voucher: VoucherFromApi, subtotal: number): number {
  if (voucher.type === "percentage") {
    return Math.round(subtotal * (voucher.discount / 100));
  }
  return Math.min(voucher.discount, subtotal); // nominal tidak melebihi subtotal
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export function KeranjangPage() {
  const navigate = useNavigate();

  const [items, setItems]           = useState<CartItem[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherMsg, setVoucherMsg]  = useState("");
  const [voucherState, setVoucherState] = useState<"" | "ok" | "err">("");
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // ── Load dari localStorage saat mount ──
  useEffect(() => {
    const saved = getCart();
    // Fallback demo items jika keranjang kosong (hapus saat production)
    setItems(saved.length > 0 ? saved : []);

    const savedVoucher = getAppliedVoucher();
    if (savedVoucher) {
      setAppliedVoucher(savedVoucher);
      setVoucherCode(savedVoucher.code);
      setVoucherState("ok");
      setVoucherMsg(`Voucher "${savedVoucher.code}" aktif — Diskon Rp ${savedVoucher.discountAmount.toLocaleString("id-ID")}`);
    }
  }, []);

  // ── Sync ke localStorage setiap kali items berubah ──
  useEffect(() => {
    if (items.length > 0) saveCart(items);
  }, [items]);

  // ── Kalkulasi ──
  const checked  = items.filter(i => i.checked);
  const subtotal = checked.reduce((s, i) => s + i.price * i.qty, 0);

  // Recalculate diskon saat subtotal berubah (qty/item checked berubah)
  const discount = appliedVoucher
    ? appliedVoucher.type === "percentage"
      ? Math.round(subtotal * (appliedVoucher.discountValue / 100))
      : Math.min(appliedVoucher.discountValue, subtotal)
    : 0;

  const total = subtotal - discount;

  // ── Item actions ──
  const updateQty = (id: string, delta: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const toggleCheck = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));

  const removeItem = (id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      if (next.length === 0) saveCart([]);
      return next;
    });
  };

  const removeAll = () => {
    setItems([]);
    saveCart([]);
    setAppliedVoucher(null);
    saveVoucher(null);
    setVoucherCode("");
    setVoucherMsg("");
    setVoucherState("");
  };

  const toggleAll = (checked: boolean) =>
    setItems(prev => prev.map(i => ({ ...i, checked })));

  // ── Validasi voucher ke API ──
  const applyVoucher = useCallback(async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    setCheckingVoucher(true);
    setVoucherMsg("");
    setVoucherState("");

    try {
      const res = await fetch(`${API_BASE}/promo/vouchers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });

      if (!res.ok) throw new Error(`Gagal mengambil data voucher (${res.status})`);

      const json = await res.json();
      // Backend mengembalikan array langsung atau { data: [...] }
      const list: VoucherFromApi[] = Array.isArray(json) ? json : (json.data ?? []);

      const found = list.find(v => v.code.toUpperCase() === code);

      if (!found) {
        setVoucherMsg("Kode voucher tidak ditemukan.");
        setVoucherState("err");
        setAppliedVoucher(null);
        saveVoucher(null);
        return;
      }

      if (!found.active) {
        setVoucherMsg("Voucher ini sudah tidak aktif.");
        setVoucherState("err");
        setAppliedVoucher(null);
        saveVoucher(null);
        return;
      }

      if (new Date(found.expiresAt) < new Date()) {
        setVoucherMsg("Voucher sudah kedaluwarsa.");
        setVoucherState("err");
        setAppliedVoucher(null);
        saveVoucher(null);
        return;
      }

      if (found.usedCount >= found.maxUse) {
        setVoucherMsg("Kuota voucher sudah habis.");
        setVoucherState("err");
        setAppliedVoucher(null);
        saveVoucher(null);
        return;
      }

      if (subtotal === 0) {
        setVoucherMsg("Pilih produk terlebih dahulu sebelum memakai voucher.");
        setVoucherState("err");
        return;
      }

      const discountAmount = calcDiscount(found, subtotal);
      const applied: AppliedVoucher = {
        code: found.code,
        type: found.type,
        discountValue: found.discount,
        discountAmount,
      };

      setAppliedVoucher(applied);
      saveVoucher(applied);
      setVoucherState("ok");

      const label = found.type === "percentage"
        ? `${found.discount}% (Rp ${discountAmount.toLocaleString("id-ID")})`
        : `Rp ${discountAmount.toLocaleString("id-ID")}`;
      setVoucherMsg(`Yeay! Diskon ${label} berhasil diterapkan.`);

    } catch (err: any) {
      setVoucherMsg(err.message ?? "Gagal memvalidasi voucher.");
      setVoucherState("err");
    } finally {
      setCheckingVoucher(false);
    }
  }, [voucherCode, subtotal]);

  const removeVoucher = () => {
    setAppliedVoucher(null);
    saveVoucher(null);
    setVoucherCode("");
    setVoucherMsg("");
    setVoucherState("");
  };

  // ── Checkout ──
  const goToCheckout = () => {
    // Simpan state akhir sebelum navigasi
    saveCart(items);
    if (appliedVoucher) {
      // Update discountAmount dengan subtotal terkini
      const updated: AppliedVoucher = { ...appliedVoucher, discountAmount: discount };
      saveVoucher(updated);
    }
    navigate("/checkout");
  };

  // ── Empty state ──
  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5" style={{ background: v("--c-bg") }}>
      <div
        className="w-32 h-32 rounded-3xl flex items-center justify-center"
        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}
      >
        <ShoppingBag size={48} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
      </div>
      <div className="text-center">
        <h2
          className="font-['Poppins',sans-serif] font-bold text-xl mb-2"
          style={{ color: v("--c-text") }}
        >
          Keranjang kamu masih kosong
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
        >
          Yuk mulai belanja dan temukan produk cetak impianmu!
        </p>
        <Link
          to="/produk"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white"
          style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
        >
          Mulai Belanja <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );

  const allChecked = items.length > 0 && items.every(i => i.checked);
  const someChecked = items.some(i => i.checked);

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
        <h1
          className="font-['Poppins',sans-serif] font-bold mb-8 mt-2"
          style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: v("--c-text") }}
        >
          Keranjang Belanja ({items.length} item)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ─ Kiri: Daftar item ─ */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Select all bar */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={e => toggleAll(e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: v("--c-primary") }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                >
                  Pilih Semua ({items.length} item)
                </span>
              </label>
              <button
                onClick={removeAll}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "#EF4444", fontFamily: "'Inter',sans-serif" }}
              >
                <Trash2 size={12} /> Hapus Semua
              </button>
            </div>

            {/* Item cards */}
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl p-4 flex gap-4"
                  style={{
                    background: v("--c-card"),
                    border: `1px solid ${item.checked ? v("--c-primary") : v("--c-border")}`,
                    opacity: item.checked ? 1 : 0.6,
                    transition: "border-color 0.2s, opacity 0.2s",
                  }}
                >
                  {/* Checkbox */}
                  <div className="flex items-start pt-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4"
                      style={{ accentColor: v("--c-primary") }}
                    />
                  </div>

                  {/* Gambar */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-20 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: v("--c-bg-sec") }}
                    >
                      <ShoppingBag size={20} style={{ color: v("--c-text-sec"), opacity: 0.4 }} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm mb-0.5 truncate"
                      style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-xs mb-3"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                    >
                      {item.spec}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {/* Qty control */}
                      <div
                        className="flex items-center rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${v("--c-border")}` }}
                      >
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="w-9 text-center text-sm font-semibold"
                          style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Harga */}
                      <div className="text-right">
                        <p
                          className="font-bold text-sm"
                          style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}
                        >
                          Rp {(item.price * item.qty).toLocaleString("id-ID")}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                        >
                          Rp {item.price.toLocaleString("id-ID")}/satuan
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hapus */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 self-start mt-1 transition-colors"
                    style={{ color: "#EF444466" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#EF444466")}
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ─ Kanan: Ringkasan ─ */}
          <div className="lg:sticky lg:top-20 flex flex-col gap-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
            >
              <h3
                className="font-['Poppins',sans-serif] font-bold mb-5"
                style={{ color: v("--c-text") }}
              >
                Ringkasan Pesanan
              </h3>

              {/* ── Voucher input ── */}
              {appliedVoucher ? (
                /* Voucher sudah dipakai — tampil badge */
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-5"
                  style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <div className="flex items-center gap-2">
                    <Tag size={13} color="#10B981" />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {appliedVoucher.code}
                    </span>
                  </div>
                  <button onClick={removeVoucher} className="text-red-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* Input kode voucher */
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: v("--c-text-sec") }}
                    />
                    <input
                      value={voucherCode}
                      onChange={e => {
                        setVoucherCode(e.target.value);
                        if (voucherState) { setVoucherMsg(""); setVoucherState(""); }
                      }}
                      onKeyDown={e => e.key === "Enter" && applyVoucher()}
                      placeholder="Kode voucher"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none uppercase"
                      style={{
                        background: v("--c-bg-sec"),
                        border: `1px solid ${voucherState === "err" ? "#EF4444" : v("--c-border")}`,
                        color: v("--c-text"),
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                  <button
                    onClick={applyVoucher}
                    disabled={checkingVoucher || !voucherCode.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 flex items-center gap-1.5 transition-opacity"
                    style={{
                      background: "var(--c-gradient-r)",
                      fontFamily: "'Inter',sans-serif",
                      opacity: checkingVoucher || !voucherCode.trim() ? 0.5 : 1,
                    }}
                  >
                    {checkingVoucher
                      ? <RefreshCw size={13} className="animate-spin" />
                      : "Pakai"
                    }
                  </button>
                </div>
              )}

              {/* Pesan voucher */}
              <AnimatePresence>
                {voucherMsg && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs mb-4 px-3 py-2 rounded-lg"
                    style={{
                      color:      voucherState === "ok" ? "#10B981" : "#EF4444",
                      background: voucherState === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    {voucherMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Price breakdown */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Subtotal ({checked.length} item dipilih)
                  </span>
                  <span style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Ongkir</span>
                  <span style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Dihitung saat checkout
                  </span>
                </div>

                <AnimatePresence>
                  {discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-between text-sm"
                    >
                      <span style={{ color: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                        Diskon Voucher
                        {appliedVoucher?.type === "percentage" && ` (${appliedVoucher.discountValue}%)`}
                      </span>
                      <span style={{ color: "#10B981", fontFamily: "'Poppins',sans-serif" }}>
                        -Rp {discount.toLocaleString("id-ID")}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Total */}
              <div
                className="flex justify-between items-center py-3 mb-4"
                style={{ borderTop: `2px solid ${v("--c-border")}` }}
              >
                <span
                  className="font-bold"
                  style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                >
                  Total
                </span>
                <span
                  className="font-bold text-xl"
                  style={{ color: v("--c-primary"), fontFamily: "'Poppins',sans-serif" }}
                >
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Tombol checkout */}
              <button
                onClick={goToCheckout}
                disabled={!someChecked}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white mb-3 transition-opacity"
                style={{
                  background: "var(--c-gradient-r)",
                  fontFamily: "'Inter',sans-serif",
                  opacity: someChecked ? 1 : 0.4,
                  cursor: someChecked ? "pointer" : "not-allowed",
                }}
              >
                Lanjut ke Checkout <ArrowRight size={15} />
              </button>

              {!someChecked && (
                <p
                  className="text-xs text-center mb-3"
                  style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                >
                  Pilih minimal 1 item untuk melanjutkan
                </p>
              )}

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2">
                <Lock size={12} style={{ color: v("--c-text-sec") }} />
                <p
                  className="text-xs text-center"
                  style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                >
                  Pembayaran 100% Aman & Terenkripsi
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}