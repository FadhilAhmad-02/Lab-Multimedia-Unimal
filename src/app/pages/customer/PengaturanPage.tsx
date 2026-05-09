import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Lock, Bell, Palette, Globe, Shield, Trash2,
  ChevronRight, Check, Eye, EyeOff, Sun, Moon, Monitor,
  Mail, Phone, MessageSquare, AlertTriangle, Save,
  ToggleLeft, ToggleRight, LogOut, ChevronLeft,
} from "lucide-react";
import { v } from "../../components/pageUtils";
import { Link, useNavigate } from "react-router";

/* ── Types ─────────────────────────────────────────────── */
type SectionId =
  | "akun"
  | "keamanan"
  | "notifikasi"
  | "tampilan"
  | "bahasa"
  | "privasi"
  | "hapus";

/* ── Sections config ────────────────────────────────────── */
const SECTIONS: { id: SectionId; label: string; desc: string; Icon: typeof User; danger?: boolean }[] = [
  { id: "akun",       label: "Informasi Akun",       desc: "Nama, email, dan foto profil",       Icon: User     },
  { id: "keamanan",   label: "Keamanan & Password",  desc: "Ganti password dan sesi aktif",      Icon: Lock     },
  { id: "notifikasi", label: "Notifikasi",            desc: "Preferensi email, WA, dan browser",  Icon: Bell     },
  { id: "tampilan",   label: "Tampilan",              desc: "Tema, warna, dan mode gelap",         Icon: Palette  },
  { id: "bahasa",     label: "Bahasa & Regional",    desc: "Bahasa antarmuka dan zona waktu",     Icon: Globe    },
  { id: "privasi",    label: "Privasi & Data",        desc: "Visibilitas akun dan data kamu",     Icon: Shield   },
  { id: "hapus",      label: "Hapus Akun",            desc: "Nonaktifkan atau hapus akun",        Icon: Trash2,  danger: true },
];

/* ── Helper ─────────────────────────────────────────────── */
function SaveBtn({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300"
      style={{ background: saved ? "#10B981" : "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
    >
      {saved ? <><Check size={14} /> Tersimpan!</> : <><Save size={14} /> Simpan</>}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
    >
      <h3
        className="font-['Poppins',sans-serif] font-bold mb-5"
        style={{ fontSize: "1rem", color: v("--c-text") }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
      {children}
    </label>
  );
}

function InputBase({ type = "text", value, onChange, placeholder, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
      style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
      onFocus={e => (e.currentTarget.style.borderColor = "var(--c-primary)")}
      onBlur={e => (e.currentTarget.style.borderColor = "var(--c-border)")}
      {...rest}
    />
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export function PengaturanPage() {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen theme-aware" style={{ background: v("--c-bg") }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          <Link to="/" style={{ color: v("--c-text-sec") }}>Beranda</Link>
          <ChevronRight size={12} />
          {activeSection ? (
            <>
              <button onClick={() => setActiveSection(null)} style={{ color: v("--c-text-sec") }}>Pengaturan</button>
              <ChevronRight size={12} />
              <span style={{ color: v("--c-accent") }}>{SECTIONS.find(s => s.id === activeSection)?.label}</span>
            </>
          ) : (
            <span style={{ color: v("--c-accent") }}>Pengaturan</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── List View ── */}
          {!activeSection && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Page header */}
              <div className="mb-8">
                <h1
                  className="font-['Poppins',sans-serif] font-bold"
                  style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: v("--c-text") }}
                >
                  Pengaturan
                </h1>
                <p className="text-sm mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  Kelola preferensi dan keamanan akunmu
                </p>
              </div>

              {/* User mini card */}
              <div
                className="flex items-center gap-4 p-5 rounded-2xl mb-6"
                style={{ background: "var(--c-gradient)", boxShadow: "0 8px 32px rgba(46,125,50,0.2)" }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white font-['Poppins',sans-serif]">Budi Santoso</p>
                  <p className="text-sm text-white/70 font-['Inter',sans-serif]">budi@email.com · Silver Member</p>
                </div>
                <Link
                  to="/profil"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontFamily: "'Inter',sans-serif" }}
                >
                  Lihat Profil
                </Link>
              </div>

              {/* Section list */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
              >
                {SECTIONS.map(({ id, label, desc, Icon, danger }, idx) => (
                  <motion.button
                    key={id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveSection(id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-150"
                    style={{
                      borderBottom: idx < SECTIONS.length - 1 ? `1px solid ${v("--c-border")}` : "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(46,125,50,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: danger ? "rgba(220,38,38,0.08)" : "rgba(46,125,50,0.08)",
                      }}
                    >
                      <Icon size={17} style={{ color: danger ? "#DC2626" : v("--c-primary") }} />
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: danger ? "#DC2626" : v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                      >
                        {label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {desc}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: v("--c-text-sec"), flexShrink: 0 }} />
                  </motion.button>
                ))}
              </div>

              {/* Logout button */}
              <button
                onClick={() => { localStorage.removeItem("ma_role"); navigate("/login"); }}
                className="flex items-center gap-3 w-full mt-4 px-5 py-4 rounded-2xl text-sm font-semibold text-left transition-all"
                style={{
                  background: v("--c-card"),
                  border: `1px solid ${v("--c-border")}`,
                  color: "#DC2626",
                  fontFamily: "'Inter',sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = v("--c-card"))}
              >
                <LogOut size={17} style={{ color: "#DC2626" }} /> Keluar dari Akun
              </button>
            </motion.div>
          )}

          {/* ── Detail Sections ── */}
          {activeSection && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Back + title */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setActiveSection(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text-sec") }}
                  onMouseEnter={e => (e.currentTarget.style.background = v("--c-bg-sec"))}
                  onMouseLeave={e => (e.currentTarget.style.background = v("--c-card"))}
                >
                  <ChevronLeft size={18} />
                </button>
                <div>
                  <h1
                    className="font-['Poppins',sans-serif] font-bold"
                    style={{ fontSize: "clamp(1.2rem, 2vw, 1.5rem)", color: v("--c-text") }}
                  >
                    {SECTIONS.find(s => s.id === activeSection)?.label}
                  </h1>
                  <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    {SECTIONS.find(s => s.id === activeSection)?.desc}
                  </p>
                </div>
              </div>

              {/* Section content */}
              {activeSection === "akun"       && <SectionAkun />}
              {activeSection === "keamanan"   && <SectionKeamanan />}
              {activeSection === "notifikasi" && <SectionNotifikasi />}
              {activeSection === "tampilan"   && <SectionTampilan />}
              {activeSection === "bahasa"     && <SectionBahasa />}
              {activeSection === "privasi"    && <SectionPrivasi />}
              {activeSection === "hapus"      && <SectionHapusAkun onBack={() => setActiveSection(null)} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION: INFORMASI AKUN
══════════════════════════════════════════════════════════ */
function SectionAkun() {
  const [name,  setName]  = useState("Budi Santoso");
  const [email, setEmail] = useState("budi@email.com");
  const [phone, setPhone] = useState("081234567890");
  const [saved, setSaved] = useState(false);
  const handle = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Foto Profil">
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
            style={{ background: "var(--c-gradient-r)" }}
          >
            B
          </div>
          <div>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold mb-2"
              style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
            >
              Ganti Foto
            </button>
            <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Format: JPG, PNG. Maks 2MB.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Data Diri">
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>Nama Lengkap</FieldLabel>
            <InputBase value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap" />
          </div>
          <div>
            <FieldLabel>Alamat Email</FieldLabel>
            <InputBase type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domain.com" />
          </div>
          <div>
            <FieldLabel>Nomor HP / WhatsApp</FieldLabel>
            <InputBase type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <SaveBtn saved={saved} onClick={handle} />
        </div>
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION: KEAMANAN & PASSWORD
══════════════════════════════════════════════════════════ */
function SectionKeamanan() {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [show, setShow] = useState({ old: false, new: false, conf: false });
  const [saved, setSaved] = useState(false);
  const handle = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const strength = newPwd.length >= 12 ? 3 : newPwd.length >= 8 ? 2 : newPwd.length > 0 ? 1 : 0;
  const strLabel = ["", "Lemah", "Sedang", "Kuat"][strength];
  const strColor = ["", "#DC2626", "#D97706", "#16A34A"][strength];

  const ACTIVE_SESSIONS = [
    { device: "Chrome · Windows 11", location: "Lhokseumawe, Aceh", time: "Aktif sekarang", current: true },
    { device: "Safari · iPhone 14", location: "Medan, Sumatera Utara", time: "2 jam lalu", current: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Ganti Password">
        <div className="flex flex-col gap-4">
          {([
            { label: "Password Lama",           val: oldPwd,  set: setOldPwd,  showKey: "old"  as const },
            { label: "Password Baru",            val: newPwd,  set: setNewPwd,  showKey: "new"  as const },
            { label: "Konfirmasi Password Baru", val: confPwd, set: setConfPwd, showKey: "conf" as const },
          ]).map(({ label, val, set, showKey }) => (
            <div key={label}>
              <FieldLabel>{label}</FieldLabel>
              <div className="relative">
                <input
                  type={show[showKey] ? "text" : "password"}
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--c-primary)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--c-border)")}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: v("--c-text-sec") }}
                >
                  {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {newPwd && (
            <div>
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ background: strength >= i ? strColor : v("--c-border") }} />
                ))}
              </div>
              <p className="text-xs font-semibold" style={{ color: strColor, fontFamily: "'Inter',sans-serif" }}>
                Kekuatan: {strLabel}
              </p>
            </div>
          )}
          {confPwd && confPwd !== newPwd && (
            <p className="text-xs" style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}>
              ✕ Konfirmasi password tidak cocok
            </p>
          )}
          <SaveBtn saved={saved} onClick={handle} />
        </div>
      </SectionCard>

      {/* Sesi Aktif */}
      <SectionCard title="Sesi Login Aktif">
        <div className="flex flex-col gap-3">
          {ACTIVE_SESSIONS.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 p-4 rounded-xl"
              style={{ background: v("--c-bg-sec"), border: `1px solid ${s.current ? "var(--c-primary)" : v("--c-border")}` }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                  {s.device}
                  {s.current && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-md text-xs font-bold"
                      style={{ background: "rgba(46,125,50,0.12)", color: v("--c-primary") }}>
                      Ini
                    </span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  {s.location} · {s.time}
                </p>
              </div>
              {!s.current && (
                <button
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.15)", fontFamily: "'Inter',sans-serif" }}
                >
                  Keluar
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION: NOTIFIKASI
══════════════════════════════════════════════════════════ */
function SectionNotifikasi() {
  const [saved, setSaved] = useState(false);
  const handle = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const [notifs, setNotifs] = useState({
    statusPesanan:  true,
    pesananSelesai: true,
    promo:          false,
    newsletter:     false,
    whatsapp:       true,
    browser:        true,
    email:          true,
  });
  const toggle = (k: keyof typeof notifs) => setNotifs(p => ({ ...p, [k]: !p[k] }));

  const GROUPS: {
    title: string;
    items: { key: keyof typeof notifs; label: string; desc: string; Icon: typeof Bell }[];
  }[] = [
    {
      title: "Pesanan",
      items: [
        { key: "statusPesanan",  label: "Update Status Pesanan",  desc: "Notifikasi setiap perubahan status pesanan",  Icon: MessageSquare },
        { key: "pesananSelesai", label: "Pesanan Selesai",         desc: "Beritahu saat pesanan siap diambil/dikirim", Icon: Check         },
      ],
    },
    {
      title: "Promosi",
      items: [
        { key: "promo",      label: "Penawaran & Diskon",  desc: "Promo eksklusif dan flash sale",            Icon: Bell },
        { key: "newsletter", label: "Newsletter Bulanan",  desc: "Tips desain dan update layanan",            Icon: Mail },
      ],
    },
    {
      title: "Saluran Notifikasi",
      items: [
        { key: "email",    label: "Email",               desc: "Kirim via alamat email terdaftar",       Icon: Mail        },
        { key: "whatsapp", label: "WhatsApp",             desc: "Kirim via pesan WhatsApp",               Icon: Phone       },
        { key: "browser",  label: "Push Notification",   desc: "Notifikasi langsung di browser",         Icon: Bell        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {GROUPS.map(({ title, items }) => (
        <SectionCard key={title} title={title}>
          <div className="flex flex-col gap-3">
            {items.map(({ key, label, desc, Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 p-4 rounded-xl transition-all"
                style={{
                  background: notifs[key] ? "rgba(46,125,50,0.06)" : v("--c-bg-sec"),
                  border: `1px solid ${notifs[key] ? "rgba(46,125,50,0.18)" : v("--c-border")}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: notifs[key] ? "rgba(46,125,50,0.12)" : v("--c-card") }}>
                    <Icon size={15} style={{ color: notifs[key] ? v("--c-primary") : v("--c-text-sec") }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                    <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{desc}</p>
                  </div>
                </div>
                <button onClick={() => toggle(key)} className="flex-shrink-0">
                  {notifs[key]
                    ? <ToggleRight size={32} fill="var(--c-primary)" color="var(--c-primary)" />
                    : <ToggleLeft  size={32} style={{ color: v("--c-text-sec") }} />
                  }
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
      <SaveBtn saved={saved} onClick={handle} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION: TAMPILAN
══════════════════════════════════════════════════════════ */
function SectionTampilan() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [accent, setAccent] = useState<"green" | "blue" | "purple">("green");
  const [fontSize, setFontSize] = useState<"kecil" | "normal" | "besar">("normal");
  const [saved, setSaved] = useState(false);
  const handle = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const THEMES: { key: "light" | "dark" | "system"; label: string; Icon: typeof Sun }[] = [
    { key: "light",  label: "Terang", Icon: Sun     },
    { key: "dark",   label: "Gelap",  Icon: Moon    },
    { key: "system", label: "Sistem", Icon: Monitor },
  ];

  const ACCENTS = [
    { key: "green"  as const, color: "#2E7D32", label: "Hijau (Default)" },
    { key: "blue"   as const, color: "#1565C0", label: "Biru"            },
    { key: "purple" as const, color: "#6A1B9A", label: "Ungu"            },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tema */}
      <SectionCard title="Mode Tampilan">
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ key, label, Icon }) => {
            const active = theme === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 border-2"
                style={{
                  background: active ? "rgba(46,125,50,0.08)" : v("--c-bg-sec"),
                  borderColor: active ? "var(--c-primary)" : "transparent",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: active ? "var(--c-gradient-r)" : v("--c-card") }}>
                  <Icon size={18} style={{ color: active ? "#fff" : v("--c-text-sec") }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: active ? v("--c-primary") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  {label}
                </span>
                {active && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--c-gradient-r)" }}>
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Warna Aksen */}
      <SectionCard title="Warna Aksen">
        <div className="flex flex-col gap-3">
          {ACCENTS.map(({ key, color, label }) => {
            const active = accent === key;
            return (
              <button
                key={key}
                onClick={() => setAccent(key)}
                className="flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{
                  background: active ? "rgba(46,125,50,0.06)" : v("--c-bg-sec"),
                  border: `1.5px solid ${active ? color : v("--c-border")}`,
                }}
              >
                <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ background: color }} />
                <span className="text-sm font-medium flex-1 text-left" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                  {label}
                </span>
                {active && <Check size={16} style={{ color: "var(--c-primary)" }} />}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Ukuran Font */}
      <SectionCard title="Ukuran Teks">
        <div className="flex gap-3">
          {(["kecil", "normal", "besar"] as const).map(size => {
            const active = fontSize === size;
            return (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className="flex-1 py-3 rounded-xl capitalize text-sm font-semibold transition-all border-2"
                style={{
                  background: active ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                  color: active ? "#fff" : v("--c-text-sec"),
                  borderColor: active ? "transparent" : v("--c-border"),
                  fontFamily: "'Inter',sans-serif",
                  fontSize: size === "kecil" ? "0.75rem" : size === "besar" ? "0.95rem" : "0.875rem",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SaveBtn saved={saved} onClick={handle} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION: BAHASA & REGIONAL
══════════════════════════════════════════════════════════ */
function SectionBahasa() {
  const [lang, setLang] = useState("id");
  const [tz, setTz] = useState("WIB");
  const [currency, setCurrency] = useState("IDR");
  const [saved, setSaved] = useState(false);
  const handle = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <SectionCard title="Preferensi Regional">
      <div className="flex flex-col gap-5">
        {/* Bahasa */}
        <div>
          <FieldLabel>Bahasa Antarmuka</FieldLabel>
          <div className="flex flex-col gap-2">
            {[
              { val: "id", label: "Bahasa Indonesia 🇮🇩" },
              { val: "en", label: "English 🇬🇧" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setLang(val)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: lang === val ? "rgba(46,125,50,0.08)" : v("--c-bg-sec"),
                  border: `1.5px solid ${lang === val ? "var(--c-primary)" : v("--c-border")}`,
                  color: v("--c-text"),
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {label}
                {lang === val && <Check size={15} style={{ color: "var(--c-primary)" }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Zona Waktu */}
        <div>
          <FieldLabel>Zona Waktu</FieldLabel>
          <select
            value={tz}
            onChange={e => setTz(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
          >
            <option value="WIB">WIB — Waktu Indonesia Barat (GMT+7)</option>
            <option value="WITA">WITA — Waktu Indonesia Tengah (GMT+8)</option>
            <option value="WIT">WIT — Waktu Indonesia Timur (GMT+9)</option>
          </select>
        </div>

        {/* Format Mata Uang */}
        <div>
          <FieldLabel>Format Mata Uang</FieldLabel>
          <div className="flex gap-3">
            {["IDR", "USD"].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all border-2"
                style={{
                  background: currency === c ? "var(--c-gradient-r)" : v("--c-bg-sec"),
                  color: currency === c ? "#fff" : v("--c-text-sec"),
                  borderColor: currency === c ? "transparent" : v("--c-border"),
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <SaveBtn saved={saved} onClick={handle} />
      </div>
    </SectionCard>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION: PRIVASI & DATA
══════════════════════════════════════════════════════════ */
function SectionPrivasi() {
  const [saved, setSaved] = useState(false);
  const handle = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const [opts, setOpts] = useState({
    showOrder:     true,
    showActivity:  false,
    analytics:     true,
    thirdParty:    false,
  });
  const toggle = (k: keyof typeof opts) => setOpts(p => ({ ...p, [k]: !p[k] }));

  const ITEMS: { key: keyof typeof opts; label: string; desc: string }[] = [
    { key: "showOrder",    label: "Tampilkan Riwayat Pesanan",   desc: "Izinkan admin melihat riwayat lengkap pesananmu"      },
    { key: "showActivity", label: "Tampilkan Status Aktif",      desc: "Orang lain dapat melihat kapan kamu terakhir aktif"    },
    { key: "analytics",   label: "Kirim Data Analitik",          desc: "Bantu kami meningkatkan layanan dengan data anonim"    },
    { key: "thirdParty",  label: "Berbagi Data ke Pihak Ketiga", desc: "Izinkan berbagi data ke mitra terpercaya"              },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Visibilitas & Data">
        <div className="flex flex-col gap-3">
          {ITEMS.map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 p-4 rounded-xl"
              style={{
                background: opts[key] ? "rgba(46,125,50,0.05)" : v("--c-bg-sec"),
                border: `1px solid ${opts[key] ? "rgba(46,125,50,0.15)" : v("--c-border")}`,
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{desc}</p>
              </div>
              <button onClick={() => toggle(key)} className="flex-shrink-0">
                {opts[key]
                  ? <ToggleRight size={32} fill="var(--c-primary)" color="var(--c-primary)" />
                  : <ToggleLeft  size={32} style={{ color: v("--c-text-sec") }} />
                }
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Unduh Data */}
      <SectionCard title="Data Pribadi">
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Kamu berhak mengunduh salinan semua data pribadimu yang tersimpan di platform kami.
          </p>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold self-start"
            style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
          >
            Unduh Data Saya
          </button>
        </div>
      </SectionCard>

      <SaveBtn saved={saved} onClick={handle} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION: HAPUS AKUN
══════════════════════════════════════════════════════════ */
function SectionHapusAkun({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);

  const CONSEQUENCES = [
    "Semua data pesanan dan riwayat transaksi akan dihapus permanen",
    "Akses ke layanan Malikussaleh Advertising akan dicabut",
    "Poin dan reward yang belum digunakan akan hangus",
    "Akun tidak dapat dipulihkan setelah penghapusan",
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Warning banner */}
      <div
        className="flex items-start gap-4 p-5 rounded-2xl"
        style={{ background: "rgba(220,38,38,0.06)", border: "1.5px solid rgba(220,38,38,0.2)" }}
      >
        <AlertTriangle size={22} style={{ color: "#DC2626", flexShrink: 0 }} className="mt-0.5" />
        <div>
          <p className="font-bold text-sm" style={{ color: "#DC2626", fontFamily: "'Poppins',sans-serif" }}>
            Tindakan Ini Tidak Dapat Dibatalkan
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#B91C1C", fontFamily: "'Inter',sans-serif" }}>
            Menghapus akun akan menghapus semua data kamu secara permanen dari sistem kami. Pastikan kamu sudah mempertimbangkannya.
          </p>
        </div>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <SectionCard title="Konsekuensi Penghapusan">
            <ul className="flex flex-col gap-3">
              {CONSEQUENCES.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(220,38,38,0.1)" }}>
                    <span style={{ color: "#DC2626", fontSize: "0.65rem", fontWeight: 700 }}>✕</span>
                  </div>
                  {c}
                </li>
              ))}
            </ul>

            {/* Agree checkbox */}
            <div
              className="flex items-start gap-3 mt-5 p-4 rounded-xl cursor-pointer"
              style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}
              onClick={() => setAgreed(!agreed)}
            >
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                style={{ borderColor: agreed ? "#DC2626" : v("--c-border"), background: agreed ? "#DC2626" : "transparent" }}
              >
                {agreed && <Check size={11} className="text-white" />}
              </div>
              <p className="text-sm" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                Saya memahami dan menerima konsekuensi penghapusan akun secara permanen.
              </p>
            </div>
          </SectionCard>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
            >
              Batal
            </button>
            <button
              onClick={() => agreed && setStep(2)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: agreed ? "#DC2626" : v("--c-bg-sec"),
                color: agreed ? "#fff" : v("--c-text-sec"),
                fontFamily: "'Inter',sans-serif",
                cursor: agreed ? "pointer" : "not-allowed",
              }}
            >
              Lanjutkan
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SectionCard title="Konfirmasi Penghapusan">
            <div className="flex flex-col gap-4">
              <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Untuk mengonfirmasi, ketik{" "}
                <span className="font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", fontFamily: "'JetBrains Mono',monospace" }}>
                  HAPUS AKUN SAYA
                </span>{" "}
                di bawah ini:
              </p>
              <input
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="HAPUS AKUN SAYA"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: v("--c-bg-sec"),
                  border: `1.5px solid ${confirm === "HAPUS AKUN SAYA" ? "#DC2626" : v("--c-border")}`,
                  color: v("--c-text"),
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                >
                  Kembali
                </button>
                <button
                  disabled={confirm !== "HAPUS AKUN SAYA"}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: confirm === "HAPUS AKUN SAYA" ? "#DC2626" : v("--c-bg-sec"),
                    color: confirm === "HAPUS AKUN SAYA" ? "#fff" : v("--c-text-sec"),
                    fontFamily: "'Inter',sans-serif",
                    cursor: confirm === "HAPUS AKUN SAYA" ? "pointer" : "not-allowed",
                  }}
                >
                  Hapus Akun Sekarang
                </button>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}
    </div>
  );
}
