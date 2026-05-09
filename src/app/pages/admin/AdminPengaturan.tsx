import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, Image, FileText, Layout, Settings2, Upload,
  Eye, EyeOff, Plus, ToggleLeft, ToggleRight, Save,
  GripVertical, Edit2, Trash2, Send, X,
} from "lucide-react";
import { v } from "../../components/pageUtils";

const TABS = [
  { label: "Info Toko", Icon: Store },
  { label: "Banner", Icon: Image },
  { label: "Halaman Statis", Icon: FileText },
  { label: "Template Desain", Icon: Layout },
  { label: "Sistem", Icon: Settings2 },
];

const BANNERS = [
  { id: 1, title: "Flash Sale Weekend", subtitle: "Diskon hingga 30%!", active: true, image: "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?w=400&q=80" },
  { id: 2, title: "Promo Member Baru", subtitle: "Daftar & hemat 10%", active: true, image: "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?w=400&q=80" },
  { id: 3, title: "Layanan Desain Gratis", subtitle: "Konsultasi tanpa biaya", active: false, image: "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?w=400&q=80" },
];

const STATIC_PAGES = [
  { slug: "tentang-kami", title: "Tentang Kami", lastEdit: "20 Feb 2026" },
  { slug: "faq", title: "FAQ", lastEdit: "15 Feb 2026" },
  { slug: "syarat-ketentuan", title: "Syarat & Ketentuan", lastEdit: "10 Jan 2026" },
  { slug: "kebijakan-privasi", title: "Kebijakan Privasi", lastEdit: "10 Jan 2026" },
];

const TEMPLATES = [
  { id: 1, name: "Kartu Nama Modern", category: "Kartu Nama", image: "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?w=300&q=80", active: true },
  { id: 2, name: "Banner Promosi Bold", category: "Banner", image: "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?w=300&q=80", active: true },
  { id: 3, name: "Brosur Trifold", category: "Brosur", image: "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?w=300&q=80", active: false },
];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function AdminPengaturan() {
  const [activeTab, setActiveTab] = useState(0);
  const [maintenance, setMaintenance] = useState(false);
  const [showMidtransKey, setShowMidtransKey] = useState(false);
  const [banners, setBanners] = useState(BANNERS);
  const [templates, setTemplates] = useState(TEMPLATES);
  const [jamBuka, setJamBuka] = useState(DAYS.map(() => ({ active: true, buka: "08:00", tutup: "17:00" })));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>Pengaturan</h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Konfigurasi toko dan sistem</p>
        </div>
        <motion.button onClick={handleSave} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: saved ? "#10B981" : "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif", transition: "background 300ms" }}>
          {saved ? "✓ Tersimpan!" : <><Save size={14} /> Simpan Perubahan</>}
        </motion.button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="hidden md:flex flex-col gap-1 w-44 flex-shrink-0">
          {TABS.map(({ label, Icon }, i) => (
            <button key={label} onClick={() => setActiveTab(i)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
              style={{ background: activeTab === i ? "rgba(59,111,212,0.1)" : "transparent", color: activeTab === i ? "#3B6FD4" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif", border: activeTab === i ? "1px solid rgba(59,111,212,0.2)" : "1px solid transparent" }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden gap-1 overflow-x-auto mb-4 w-full">
          {TABS.map(({ label, Icon }, i) => (
            <button key={label} onClick={() => setActiveTab(i)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
              style={{ background: activeTab === i ? "rgba(59,111,212,0.1)" : v("--c-card"), color: activeTab === i ? "#3B6FD4" : v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* INFO TOKO */}
          {activeTab === 0 && (
            <div className="space-y-5">
              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Identitas Toko</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { label: "Nama Toko", val: "Malikussaleh Advertising" },
                    { label: "Tagline", val: "Percetakan Premium Universitas Malikussaleh" },
                    { label: "Email", val: "malikussaleh.adv@unimal.ac.id" },
                    { label: "Nomor WhatsApp", val: "081234567890" },
                    { label: "Alamat", val: "Kampus Bukit Indah, Lhokseumawe, Aceh" },
                  ].map(({ label, val }) => (
                    <div key={label} className={label === "Tagline" || label === "Alamat" ? "sm:col-span-2" : ""}>
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</label>
                      {label === "Alamat" ? (
                        <textarea defaultValue={val} rows={2} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                      ) : (
                        <input defaultValue={val} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Logo Toko</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1E3A5F,#F97316)" }}>
                        <span className="text-white text-xl font-bold">M</span>
                      </div>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                        <Upload size={12} /> Ganti Logo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Jam Operasional</h2>
                <div className="space-y-3">
                  {DAYS.map((day, i) => (
                    <div key={day} className="flex items-center gap-4">
                      <button onClick={() => setJamBuka(prev => prev.map((d, idx) => idx === i ? { ...d, active: !d.active } : d))} className="flex items-center gap-2 min-w-[110px]">
                        {jamBuka[i].active ? <ToggleRight size={20} style={{ color: "#10B981" }} /> : <ToggleLeft size={20} style={{ color: v("--c-text-sec") }} />}
                        <span className="text-sm" style={{ color: jamBuka[i].active ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{day}</span>
                      </button>
                      {jamBuka[i].active ? (
                        <div className="flex items-center gap-2">
                          <input type="time" value={jamBuka[i].buka} onChange={e => setJamBuka(prev => prev.map((d, idx) => idx === i ? { ...d, buka: e.target.value } : d))}
                            className="px-3 py-1.5 rounded-lg text-sm outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                          <span className="text-xs" style={{ color: v("--c-text-sec") }}>—</span>
                          <input type="time" value={jamBuka[i].tutup} onChange={e => setJamBuka(prev => prev.map((d, idx) => idx === i ? { ...d, tutup: e.target.value } : d))}
                            className="px-3 py-1.5 rounded-lg text-sm outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Tutup</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BANNER */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
                  <Plus size={14} /> Tambah Banner
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {banners.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                    <div className="relative">
                      <img src={b.image} alt={b.title} className="w-full h-32 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: b.active ? "rgba(16,185,129,0.9)" : "rgba(100,116,139,0.8)", color: "#fff" }}>{b.active ? "Aktif" : "Nonaktif"}</span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <GripVertical size={14} className="text-white opacity-70 cursor-grab" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{b.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{b.subtitle}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => setBanners(prev => prev.map(bnn => bnn.id === b.id ? { ...bnn, active: !bnn.active } : bnn))}
                          className="flex items-center gap-1.5 text-xs font-medium" style={{ color: b.active ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          {b.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {b.active ? "Aktif" : "Nonaktif"}
                        </button>
                        <div className="flex gap-1.5 ml-auto">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4" }}><Edit2 size={12} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* HALAMAN STATIS */}
          {activeTab === 2 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              {STATIC_PAGES.map((p, i) => (
                <div key={p.slug} className="flex items-center justify-between p-5" style={{ borderBottom: i < STATIC_PAGES.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                  <div>
                    <p className="font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{p.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Terakhir diedit: {p.lastEdit}</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                    <Edit2 size={12} /> Edit
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TEMPLATE DESAIN */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
                  <Plus size={14} /> Upload Template
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                    <img src={t.image} alt={t.name} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{t.name}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>{t.category}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => setTemplates(prev => prev.map(tp => tp.id === t.id ? { ...tp, active: !tp.active } : tp))}
                          className="flex items-center gap-1 text-xs" style={{ color: t.active ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          {t.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <div className="flex gap-1.5 ml-auto">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4" }}><Eye size={12} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* SISTEM */}
          {activeTab === 4 && (
            <div className="space-y-5">
              {/* Mode Maintenance */}
              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Mode Maintenance</h2>
                    <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Aktifkan untuk menutup sementara akses pelanggan</p>
                  </div>
                  <button onClick={() => setMaintenance(!maintenance)} className="flex items-center gap-2">
                    {maintenance ? <ToggleRight size={36} style={{ color: "#EF4444" }} /> : <ToggleLeft size={36} style={{ color: v("--c-text-sec") }} />}
                    <span className="text-sm font-semibold" style={{ color: maintenance ? "#EF4444" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{maintenance ? "Aktif" : "Nonaktif"}</span>
                  </button>
                </div>
                {maintenance && (
                  <div>
                    <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Pesan Maintenance</label>
                    <textarea rows={3} defaultValue="Website sedang dalam pemeliharaan. Kami akan segera kembali. Terima kasih atas pengertian Anda." className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                  </div>
                )}
              </div>

              {/* API Integrasi */}
              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Integrasi API</h2>
                <div className="space-y-4">
                  {[
                    { label: "Midtrans Server Key", val: "SB-Mid-server-xxxxxxxxxxxxxxxxxxxx", secret: true },
                    { label: "Midtrans Client Key", val: "SB-Mid-client-xxxxxxxxxxxxxxxxxxxx", secret: true },
                    { label: "Raja Ongkir API Key", val: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", secret: true },
                    { label: "Cloudinary Cloud Name", val: "malikussaleh-adv", secret: false },
                  ].map(({ label, val, secret }) => (
                    <div key={label}>
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</label>
                      <div className="relative">
                        <input type={secret && !showMidtransKey ? "password" : "text"} defaultValue={val} readOnly className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none font-mono" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'JetBrains Mono',monospace" }} />
                        {secret && (
                          <button onClick={() => setShowMidtransKey(!showMidtransKey)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
                            {showMidtransKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifikasi Email */}
              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Konfigurasi Email SMTP</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {["SMTP Host", "SMTP Port", "Email Pengirim", "Password"].map(l => (
                    <div key={l}>
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{l}</label>
                      <input type={l === "Password" ? "password" : "text"} placeholder={l} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                  <Send size={13} /> Kirim Email Test
                </button>
              </div>

              {/* Backup */}
              <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div>
                  <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Backup Database</h2>
                  <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Backup terakhir: 23 Feb 2026, 02:00 WIB</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#10B981", fontFamily: "'Inter',sans-serif" }}>
                  Backup Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}