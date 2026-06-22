import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, FileText, Layout, Settings2, Upload,
  Eye, EyeOff, Plus, ToggleLeft, ToggleRight, Save,
  Edit2, Trash2, X,
} from "lucide-react";
import { v } from "../../components/pageUtils";

const TABS = [
  { label: "Info Toko", Icon: Store },
  { label: "Halaman Statis", Icon: FileText },
  { label: "Template Desain", Icon: Layout },
  { label: "Sistem", Icon: Settings2 },
];

const STATIC_PAGES = [
  { slug: "tentang-kami", title: "Tentang Kami", lastEdit: "20 Feb 2026" },
  { slug: "faq", title: "FAQ", lastEdit: "15 Feb 2026" },
  { slug: "syarat-ketentuan", title: "Syarat & Ketentuan", lastEdit: "10 Jan 2026" },
  { slug: "kebijakan-privasi", title: "Kebijakan Privasi", lastEdit: "10 Jan 2026" },
];

const TEMPLATES = [
  { id: 1, name: "Kartu Nama Modern", category: "Kartu Nama", image: "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?w=300&q=80", link: "https://example.com/kartu-nama", active: true },
  { id: 2, name: "Banner Promosi Bold", category: "Banner", image: "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?w=300&q=80", link: "https://example.com/banner-promosi", active: true },
  { id: 3, name: "Brosur Trifold", category: "Brosur", image: "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?w=300&q=80", link: "https://example.com/brosur-trifold", active: false },
];

export function AdminPengaturan() {
  const [activeTab, setActiveTab] = useState(0);
  const [maintenance, setMaintenance] = useState(false);
  const [showMidtransKey, setShowMidtransKey] = useState(false);
  const [templates, setTemplates] = useState(TEMPLATES);
  const [saved, setSaved] = useState(false);

  // States for Template CRUD Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Kartu Nama");
  const [formImage, setFormImage] = useState("");
  const [formLink, setFormLink] = useState("");

  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingTemplateId(null);
    setFormName("");
    setFormCategory("Kartu Nama");
    setFormImage("");
    setFormLink("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: typeof TEMPLATES[0]) => {
    setModalMode("edit");
    setEditingTemplateId(t.id);
    setFormName(t.name);
    setFormCategory(t.category);
    setFormImage(t.image);
    setFormLink(t.link || "");
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim() || !formImage.trim() || !formLink.trim()) {
      alert("Semua field harus diisi!");
      return;
    }

    if (modalMode === "create") {
      const newTemplate = {
        id: Date.now(),
        name: formName,
        category: formCategory,
        image: formImage,
        link: formLink,
        active: true,
      };
      setTemplates(prev => [...prev, newTemplate]);
    } else {
      setTemplates(prev =>
        prev.map(t =>
          t.id === editingTemplateId
            ? { ...t, name: formName, category: formCategory, image: formImage, link: formLink }
            : t
        )
      );
    }
    setIsModalOpen(false);
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus template ini?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleViewTemplate = (link: string) => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      alert("Link template tidak tersedia!");
    }
  };

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

            </div>
          )}

          {/* HALAMAN STATIS */}
          {activeTab === 1 && (
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
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
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
                          className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: t.active ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                          {t.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <div className="flex gap-1.5 ml-auto">
                          <button onClick={() => handleViewTemplate(t.link || "")} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105" style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4" }} title="Lihat Template"><Eye size={12} /></button>
                          <button onClick={() => handleOpenEdit(t)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105" style={{ background: "rgba(249,115,22,0.1)", color: "#F97316" }} title="Edit Template"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteTemplate(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }} title="Hapus Template"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* SISTEM */}
          {activeTab === 3 && (
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

      {/* CRUD Modal for Template Desain */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl p-6 overflow-hidden shadow-2xl border"
              style={{
                background: v("--c-card"),
                borderColor: v("--c-border"),
                color: v("--c-text")
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-semibold font-['Poppins',sans-serif] mb-5">
                {modalMode === "create" ? "Upload Template Baru" : "Edit Detail Template"}
              </h3>

              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Nama Template
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Contoh: Kartu Nama Modern"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    placeholder="Contoh: Kartu Nama, Banner, Brosur"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Image URL Template
                  </label>
                  <input
                    type="url"
                    required
                    value={formImage}
                    onChange={e => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Link untuk Mengakses Template
                  </label>
                  <input
                    type="url"
                    required
                    value={formLink}
                    onChange={e => setFormLink(e.target.value)}
                    placeholder="https://figma.com/... atau link lainnya"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border"
                    style={{
                      borderColor: v("--c-border"),
                      color: v("--c-text-sec"),
                      fontFamily: "'Inter',sans-serif"
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                    style={{
                      background: "linear-gradient(to right,#1E3A5F,#F97316)",
                      fontFamily: "'Inter',sans-serif"
                    }}
                  >
                    {modalMode === "create" ? "Upload Template" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}