import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Edit2, Trash2, Search, X, ToggleLeft, ToggleRight,
  Upload, GripVertical, AlertTriangle,
  Printer, Flag, Gift, Package, Mail, Layers, Star,
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

const PRODUCTS = [
  { id: 1, name: "Banner Vinyl Premium", category: "Spanduk & Banner", price: "Rp 20.000/m²", active: true, featured: true, image: "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?w=400&q=80" },
  { id: 2, name: "Kartu Nama Laminasi UV", category: "Cetak Digital", price: "Rp 35.000/100", active: true, featured: true, image: "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?w=400&q=80" },
  { id: 3, name: "Mug Custom Sublimasi", category: "Souvenir", price: "Rp 25.000/pcs", active: true, featured: false, image: "https://images.unsplash.com/photo-1763627719014-0ea46e97a5d5?w=400&q=80" },
  { id: 4, name: "Paper Bag Premium", category: "Packaging", price: "Rp 3.500/pcs", active: false, featured: false, image: "https://images.unsplash.com/photo-1746422029285-e81d6650f17f?w=400&q=80" },
  { id: 5, name: "Undangan Pernikahan Hard Cover", category: "Undangan", price: "Rp 5.000/pcs", active: true, featured: true, image: "https://images.unsplash.com/photo-1739909198159-a834175bd911?w=400&q=80" },
  { id: 6, name: "Spanduk Kain", category: "Spanduk & Banner", price: "Rp 15.000/m²", active: true, featured: false, image: "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?w=400&q=80" },
];

const CATEGORIES = [
  { id: 1, Icon: Printer, name: "Cetak Digital",    slug: "cetak-digital",  count: 12, active: true  },
  { id: 2, Icon: Flag,    name: "Spanduk & Banner", slug: "spanduk-banner", count: 8,  active: true  },
  { id: 3, Icon: Gift,    name: "Souvenir",         slug: "souvenir",       count: 15, active: true  },
  { id: 4, Icon: Package, name: "Packaging",        slug: "packaging",      count: 10, active: true  },
  { id: 5, Icon: Mail,    name: "Undangan",         slug: "undangan",       count: 6,  active: false },
  { id: 6, Icon: Layers,  name: "Finishing",        slug: "finishing",      count: 4,  active: true  },
];

const MATERIALS = [
  { id: 1, name: "Flexi Korea", satuan: "m²", stok: 120, threshold: 50, alert: false },
  { id: 2, name: "Flexi China", satuan: "m²", stok: 34, threshold: 50, alert: true },
  { id: 3, name: "Vinyl", satuan: "m²", stok: 28, threshold: 40, alert: true },
  { id: 4, name: "Art Paper 150gsm", satuan: "lembar", stok: 800, threshold: 200, alert: false },
  { id: 5, name: "Ivory 230gsm", satuan: "lembar", stok: 145, threshold: 100, alert: false },
  { id: 6, name: "Tinta Sublimasi", satuan: "botol", stok: 5, threshold: 10, alert: true },
];

const TABS = ["Produk", "Kategori", "Bahan Baku"];

export function AdminProduk() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState(PRODUCTS);
  const [cats, setCats] = useState(CATEGORIES);

  const toggleActive = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>Manajemen Produk</h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Kelola produk, kategori, dan bahan baku</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
          <Plus size={15} /> Tambah Produk
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: activeTab === i ? v("--c-card") : "transparent", color: activeTab === i ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif", boxShadow: activeTab === i ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB: PRODUK */}
      {activeTab === 0 && (
        <div>
          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div className="relative">
                  <ImageWithFallback src={p.image} alt={p.name} className="w-full h-40 object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontFamily: "'Inter',sans-serif" }}>{p.category}</span>
                    {p.featured && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--c-gradient-r)", color: "#fff", fontFamily: "'Inter',sans-serif" }}><Star size={10} aria-hidden="true" /> Unggulan</span>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{p.name}</h3>
                  <p className="text-sm font-bold mb-3" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Mulai {p.price}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(p.id)} className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                        style={{ color: p.active ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {p.active ? <ToggleRight size={18} style={{ color: "#10B981" }} /> : <ToggleLeft size={18} />}
                        {p.active ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}><Edit2 size={13} /></button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: KATEGORI */}
      {activeTab === 1 && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>
              <Plus size={14} /> Tambah Kategori
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                  {["", "Ikon", "Nama Kategori", "Slug", "Jml Produk", "Status", "Aksi"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cats.map((cat, i) => (
                  <tr key={cat.id} style={{ borderBottom: i < cats.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                    <td className="px-4 py-3"><GripVertical size={14} style={{ color: v("--c-text-sec") }} className="cursor-grab" /></td>
                    <td className="px-4 py-3"><cat.Icon size={18} style={{ color: v("--c-primary") }} aria-hidden="true" /></td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{cat.name}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: v("--c-text-sec") }}>{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{cat.count}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setCats(prev => prev.map(c => c.id === cat.id ? { ...c, active: !c.active } : c))}
                        className="flex items-center gap-1.5 text-xs font-medium" style={{ color: cat.active ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {cat.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {cat.active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)" }}><Edit2 size={12} /></button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BAHAN BAKU */}
      {activeTab === 2 && (
        <div>
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                  {["Nama Bahan", "Satuan", "Stok Saat Ini", "Threshold Alert", "Status", "Aksi"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATERIALS.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i < MATERIALS.length - 1 ? `1px solid ${v("--c-border")}` : "none", background: m.alert ? "rgba(234,179,8,0.05)" : "transparent" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {m.alert && <AlertTriangle size={13} style={{ color: "#EAB308" }} />}
                        <span className="text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{m.satuan}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold`} style={{ color: m.alert ? "#EAB308" : "#10B981", fontFamily: "'Inter',sans-serif" }}>{m.stok}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: v("--c-bg-sec"), minWidth: 60 }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (m.stok / (m.threshold * 2)) * 100)}%`, background: m.alert ? "#EAB308" : "#10B981" }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{m.threshold} {m.satuan}</td>
                    <td className="px-4 py-3">
                      {m.alert
                        ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(234,179,8,0.15)", color: "#EAB308", fontFamily: "'Inter',sans-serif" }}>⚠ Hampir Habis</span>
                        : <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", fontFamily: "'Inter',sans-serif" }}>✓ Aman</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)", fontFamily: "'Inter',sans-serif" }}>+ Stok</button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>- Stok</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} />
            <motion.div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden flex flex-col md:w-[640px] md:max-h-[85vh]"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Tambah Produk Baru</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec") }}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Nama Produk *</label>
                  <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} placeholder="Nama produk" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Kategori *</label>
                  <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                    {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Foto Produk (hanya Admin)</label>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: v("--c-border"), background: v("--c-bg-sec") }}>
                    <Upload size={24} className="mx-auto mb-2" style={{ color: v("--c-text-sec") }} />
                    <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Drag & drop foto produk di sini</p>
                    <p className="text-xs mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>PNG, JPG, WebP maks 5MB</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Deskripsi</label>
                  <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} placeholder="Deskripsi produk..." />
                </div>
              </div>
              <div className="p-5 flex gap-3" style={{ borderTop: `1px solid ${v("--c-border")}` }}>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Batal</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}>Simpan Produk</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}