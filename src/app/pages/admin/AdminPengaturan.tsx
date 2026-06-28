import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, FileText, Layout, Settings2, Upload,
  Eye, EyeOff, Plus, ToggleLeft, ToggleRight, Save,
  Edit2, Trash2, X, Loader2,
} from "lucide-react";
import { v } from "../../components/pageUtils";

const API = "/api/pengaturan";
const getToken = () => localStorage.getItem("token") || "";
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Types ───────────────────────────────────────────────────────────────────
interface Setting { [key: string]: string }
interface StaticPage { id: number; slug: string; title: string; active: boolean; updatedAt: string }
interface DesignTemplate { id: number; name: string; category: string; image: string; link: string; active: boolean }

const TABS = [
  { label: "Info Toko",        Icon: Store },
  { label: "Halaman Statis",   Icon: FileText },
  { label: "Template Desain",  Icon: Layout },
  { label: "Sistem",           Icon: Settings2 },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

// ─────────────────────────────────────────────────────────────────────────────
export function AdminPengaturan() {
  const [activeTab, setActiveTab]           = useState(0);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [showMidtransKey, setShowMidtransKey] = useState(false);
  const logoInputRef                        = useRef<HTMLInputElement>(null);

  // ── Settings (Info Toko + Sistem) ──────────────────────────────────────────
  const [settings, setSettings]             = useState<Setting>({});
  const [settingsLoading, setSettingsLoading] = useState(true);

  // ── Static Pages ───────────────────────────────────────────────────────────
  const [staticPages, setStaticPages]       = useState<StaticPage[]>([]);
  const [editingPage, setEditingPage]       = useState<StaticPage | null>(null);
  const [pageContent, setPageContent]       = useState("");
  const [pageTitle, setPageTitle]           = useState("");
  const [pageModalOpen, setPageModalOpen]   = useState(false);

  // ── Templates ──────────────────────────────────────────────────────────────
  const [templates, setTemplates]           = useState<DesignTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [modalMode, setModalMode]           = useState<"create" | "edit">("create");
  const [editingTplId, setEditingTplId]     = useState<number | null>(null);
  const [formName, setFormName]             = useState("");
  const [formCategory, setFormCategory]     = useState("Kartu Nama");
  const [formImage, setFormImage]           = useState("");
  const [formLink, setFormLink]             = useState("");
  const [tplSaving, setTplSaving]           = useState(false);

  // ─── Fetch all settings ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/settings`, { headers: authHeader() });
        const json = await res.json();
        if (json.success) setSettings(json.data);
      } finally {
        setSettingsLoading(false);
      }
    };
    load();
  }, []);

  // ─── Fetch static pages ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 1) return;
    fetch(`${API}/static-pages`, { headers: authHeader() })
      .then(r => r.json())
      .then(j => j.success && setStaticPages(j.data));
  }, [activeTab]);

  // ─── Fetch templates ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 2) return;
    setTemplatesLoading(true);
    fetch(`${API}/templates`, { headers: authHeader() })
      .then(r => r.json())
      .then(j => j.success && setTemplates(j.data))
      .finally(() => setTemplatesLoading(false));
  }, [activeTab]);

  // ─── Helper: update setting field locally ─────────────────────────────────
  const setSetting = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  // ─── Save all settings (Info Toko / Sistem / Payment) ─────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert(json.message || "Gagal menyimpan");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  // ─── Logo upload ──────────────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("logo", file);
    const res = await fetch(`${API}/settings/logo`, {
      method: "POST",
      headers: authHeader(),
      body: fd,
    });
    const json = await res.json();
    if (json.success) setSetting("store_logo", json.data.url);
    else alert(json.message);
  };

  // ─── Static page edit ─────────────────────────────────────────────────────
  const openPageEdit = async (page: StaticPage) => {
    const res  = await fetch(`${API}/static-pages/${page.slug}`, { headers: authHeader() });
    const json = await res.json();
    if (json.success) {
      setEditingPage(json.data);
      setPageTitle(json.data.title);
      setPageContent(json.data.content);
      setPageModalOpen(true);
    }
  };

  const savePageEdit = async () => {
    if (!editingPage) return;
    const res = await fetch(`${API}/static-pages/${editingPage.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ title: pageTitle, content: pageContent }),
    });
    const json = await res.json();
    if (json.success) {
      setStaticPages(prev =>
        prev.map(p => p.slug === editingPage.slug ? { ...p, title: pageTitle, updatedAt: new Date().toISOString() } : p)
      );
      setPageModalOpen(false);
    } else {
      alert(json.message);
    }
  };

  // ─── Template CRUD ────────────────────────────────────────────────────────
  const openCreate = () => {
    setModalMode("create"); setEditingTplId(null);
    setFormName(""); setFormCategory("Kartu Nama"); setFormImage(""); setFormLink("");
    setIsModalOpen(true);
  };

  const openEdit = (t: DesignTemplate) => {
    setModalMode("edit"); setEditingTplId(t.id);
    setFormName(t.name); setFormCategory(t.category); setFormImage(t.image); setFormLink(t.link);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTplSaving(true);
    try {
      const url    = modalMode === "create" ? `${API}/templates` : `${API}/templates/${editingTplId}`;
      const method = modalMode === "create" ? "POST" : "PUT";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ name: formName, category: formCategory, image: formImage, link: formLink }),
      });
      const json = await res.json();
      if (json.success) {
        if (modalMode === "create") {
          setTemplates(prev => [json.data, ...prev]);
        } else {
          setTemplates(prev => prev.map(t => t.id === editingTplId ? json.data : t));
        }
        setIsModalOpen(false);
      } else {
        alert(json.message);
      }
    } finally {
      setTplSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Hapus template ini?")) return;
    const res  = await fetch(`${API}/templates/${id}`, { method: "DELETE", headers: authHeader() });
    const json = await res.json();
    if (json.success) setTemplates(prev => prev.filter(t => t.id !== id));
    else alert(json.message);
  };

  const handleToggleTemplate = async (id: number) => {
    const res  = await fetch(`${API}/templates/${id}/toggle`, { method: "PATCH", headers: authHeader() });
    const json = await res.json();
    if (json.success) setTemplates(prev => prev.map(t => t.id === id ? json.data : t));
  };

  // ─── Backup ───────────────────────────────────────────────────────────────
  const [backing, setBacking] = useState(false);
  const handleBackup = async () => {
    setBacking(true);
    try {
      const res  = await fetch(`${API}/backup`, { method: "POST", headers: authHeader() });
      const json = await res.json();
      if (json.success) {
        setSetting("last_backup_at", json.data.createdAt);
        alert(`Backup berhasil!\nFile: ${json.data.filename}`);
      } else {
        alert(json.message);
      }
    } finally {
      setBacking(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // INPUT helper
  const Inp = ({ label, k, type = "text", full = false }: { label: string; k: string; type?: string; full?: boolean }) => (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{label}</label>
      <input
        type={type}
        value={settings[k] ?? ""}
        onChange={e => setSetting(k, e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
      />
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>Pengaturan</h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Konfigurasi toko dan sistem</p>
        </div>
        <motion.button onClick={handleSave} whileTap={{ scale: 0.97 }} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: saved ? "#10B981" : "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif", transition: "background 300ms" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? "✓ Tersimpan!" : <><Save size={14} /> Simpan Perubahan</>}
        </motion.button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col gap-1 w-44 flex-shrink-0">
          {TABS.map(({ label, Icon }, i) => (
            <button key={label} onClick={() => setActiveTab(i)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
              style={{ background: activeTab === i ? "rgba(59,111,212,0.1)" : "transparent", color: activeTab === i ? "#3B6FD4" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif", border: activeTab === i ? "1px solid rgba(59,111,212,0.2)" : "1px solid transparent" }}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden gap-1 overflow-x-auto mb-4 w-full">
          {TABS.map(({ label, Icon }, i) => (
            <button key={label} onClick={() => setActiveTab(i)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
              style={{ background: activeTab === i ? "rgba(59,111,212,0.1)" : v("--c-card"), color: activeTab === i ? "#3B6FD4" : v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">

          {/* ═══ INFO TOKO ═══ */}
          {activeTab === 0 && (
            <div className="space-y-5">
              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Identitas Toko</h2>
                {settingsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin" style={{ color: v("--c-text-sec") }} /></div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Inp label="Nama Toko"       k="store_name" />
                    <Inp label="Email"           k="store_email" type="email" />
                    <Inp label="Nomor WhatsApp"  k="store_whatsapp" />
                    <Inp label="Tagline"         k="store_tagline" full />
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Alamat</label>
                      <textarea rows={2} value={settings["store_address"] ?? ""} onChange={e => setSetting("store_address", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                    </div>
                  </div>
                )}

                {/* Logo */}
                <div className="mt-5">
                  <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Logo Toko</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1E3A5F,#F97316)" }}>
                      {settings["store_logo"]
                        ? <img src={settings["store_logo"]} alt="logo" className="w-full h-full object-contain" />
                        : <span className="text-white text-xl font-bold">M</span>}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    <button onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: v("--c-bg-sec"), color: v("--c-text-sec"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                      <Upload size={12} /> Ganti Logo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ HALAMAN STATIS ═══ */}
          {activeTab === 1 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
              {staticPages.length === 0
                ? <div className="p-8 text-center text-sm" style={{ color: v("--c-text-sec") }}><Loader2 className="animate-spin mx-auto mb-2" size={20} />Memuat halaman...</div>
                : staticPages.map((p, i) => (
                  <div key={p.slug} className="flex items-center justify-between p-5"
                    style={{ borderBottom: i < staticPages.length - 1 ? `1px solid ${v("--c-border")}` : "none" }}>
                    <div>
                      <p className="font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{p.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Terakhir diedit: {fmtDate(p.updatedAt)}</p>
                    </div>
                    <button onClick={() => openPageEdit(p)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                ))
              }
            </div>
          )}

          {/* ═══ TEMPLATE DESAIN ═══ */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)", fontFamily: "'Inter',sans-serif" }}>
                  <Plus size={14} /> Upload Template
                </button>
              </div>

              {templatesLoading
                ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" style={{ color: v("--c-text-sec") }} /></div>
                : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                        <img src={t.image} alt={t.name} className="w-full h-36 object-cover" />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{t.name}</p>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4", fontFamily: "'Inter',sans-serif" }}>{t.category}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button onClick={() => handleToggleTemplate(t.id)} className="flex items-center gap-1 text-xs"
                              style={{ color: t.active ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                              {t.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                              <span>{t.active ? "Aktif" : "Nonaktif"}</span>
                            </button>
                            <div className="flex gap-1.5 ml-auto">
                              <button onClick={() => window.open(t.link, "_blank")}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                style={{ background: "rgba(59,111,212,0.1)", color: "#3B6FD4" }} title="Lihat">
                                <Eye size={12} />
                              </button>
                              <button onClick={() => openEdit(t)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                style={{ background: "rgba(249,115,22,0.1)", color: "#F97316" }} title="Edit">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => handleDeleteTemplate(t.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }} title="Hapus">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* ═══ SISTEM ═══ */}
          {activeTab === 3 && (
            <div className="space-y-5">
              {/* Midtrans */}
              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <h2 className="font-semibold mb-4" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Konfigurasi Midtrans</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Server Key</label>
                    <div className="relative">
                      <input type={showMidtransKey ? "text" : "password"} value={settings["midtrans_server_key"] ?? ""}
                        onChange={e => setSetting("midtrans_server_key", e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none"
                        style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                      <button onClick={() => setShowMidtransKey(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
                        {showMidtransKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Client Key</label>
                    <input type="text" value={settings["midtrans_client_key"] ?? ""}
                      onChange={e => setSetting("midtrans_client_key", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="midtrans-prod" checked={settings["midtrans_is_production"] === "true"}
                      onChange={e => setSetting("midtrans_is_production", e.target.checked ? "true" : "false")} className="w-4 h-4 accent-blue-600" />
                    <label htmlFor="midtrans-prod" className="text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Mode Production (centang jika sudah live)</label>
                  </div>
                </div>
              </div>

              {/* Maintenance */}
              <div className="rounded-2xl p-6" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Mode Maintenance</h2>
                    <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Aktifkan untuk menutup sementara akses pelanggan</p>
                  </div>
                  <button onClick={() => setSetting("maintenance_mode", settings["maintenance_mode"] === "true" ? "false" : "true")}
                    className="flex items-center gap-2">
                    {settings["maintenance_mode"] === "true"
                      ? <ToggleRight size={36} style={{ color: "#EF4444" }} />
                      : <ToggleLeft size={36} style={{ color: v("--c-text-sec") }} />}
                    <span className="text-sm font-semibold"
                      style={{ color: settings["maintenance_mode"] === "true" ? "#EF4444" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      {settings["maintenance_mode"] === "true" ? "Aktif" : "Nonaktif"}
                    </span>
                  </button>
                </div>
                {settings["maintenance_mode"] === "true" && (
                  <div>
                    <label className="text-xs font-semibold block mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Pesan Maintenance</label>
                    <textarea rows={3} value={settings["maintenance_message"] ?? ""}
                      onChange={e => setSetting("maintenance_message", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
                  </div>
                )}
              </div>

              {/* Backup */}
              <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div>
                  <h2 className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Backup Database</h2>
                  <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    {settings["last_backup_at"]
                      ? `Backup terakhir: ${fmtDate(settings["last_backup_at"])}`
                      : "Belum ada backup"}
                  </p>
                </div>
                <button onClick={handleBackup} disabled={backing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#10B981", fontFamily: "'Inter',sans-serif", opacity: backing ? 0.7 : 1 }}>
                  {backing ? <Loader2 size={14} className="animate-spin" /> : null}
                  {backing ? "Memproses..." : "Backup Sekarang"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ═══ MODAL: Edit Static Page ═══ */}
      <AnimatePresence>
        {pageModalOpen && editingPage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPageModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl border"
              style={{ background: v("--c-card"), borderColor: v("--c-border") }}>
              <button onClick={() => setPageModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-xl" style={{ color: v("--c-text-sec") }}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Edit: {editingPage.title}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec") }}>Judul</label>
                  <input value={pageTitle} onChange={e => setPageTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text") }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec") }}>Konten (HTML)</label>
                  <textarea rows={10} value={pageContent} onChange={e => setPageContent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-y font-mono"
                    style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text") }} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setPageModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold border"
                    style={{ borderColor: v("--c-border"), color: v("--c-text-sec") }}>Batal</button>
                  <button onClick={savePageEdit} className="px-5 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)" }}>Simpan</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL: Create / Edit Template ═══ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl border"
              style={{ background: v("--c-card"), borderColor: v("--c-border") }}>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-xl" style={{ color: v("--c-text-sec") }}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-5" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                {modalMode === "create" ? "Upload Template Baru" : "Edit Detail Template"}
              </h3>
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                {[
                  { label: "Nama Template", val: formName, set: setFormName, ph: "Kartu Nama Modern", type: "text" },
                  { label: "Kategori",      val: formCategory, set: setFormCategory, ph: "Kartu Nama, Banner, Brosur", type: "text" },
                  { label: "Image URL",     val: formImage, set: setFormImage, ph: "https://images.unsplash.com/...", type: "url" },
                  { label: "Link Template", val: formLink, set: setFormLink, ph: "https://figma.com/...", type: "url" },
                ].map(({ label, val, set, ph, type }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec") }}>{label}</label>
                    <input type={type} required value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text") }} />
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold border"
                    style={{ borderColor: v("--c-border"), color: v("--c-text-sec") }}>Batal</button>
                  <button type="submit" disabled={tplSaving} className="px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2"
                    style={{ background: "linear-gradient(to right,#1E3A5F,#F97316)" }}>
                    {tplSaving && <Loader2 size={12} className="animate-spin" />}
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