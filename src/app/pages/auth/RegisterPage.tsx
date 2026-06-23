import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Phone, Lock, Eye, EyeOff, Printer, Gift } from "lucide-react";
import { v } from "../../components/pageUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: "Lemah", color: "#EF4444" };
    if (score <= 2) return { level: 2, label: "Sedang", color: "#F59E0B" };
    return { level: score >= 3 ? 3 : 2, label: score >= 3 ? "Kuat" : "Sedang", color: score >= 3 ? "#10B981" : "#F59E0B" };
  };
  const { level, label, color } = getStrength();
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i <= level ? color : v("--c-border") }} />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color, fontFamily: "'Inter',sans-serif" }}>
        Keamanan password: {label}
      </p>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, icon: Icon, extra, ...rest }: any) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
        <input
          type={isPassword && showPwd ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value.trimStart())}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: v("--c-bg-sec"),
            border: `1.5px solid ${v("--c-border")}`,
            color: v("--c-text"),
            fontFamily: "'Inter',sans-serif",
            paddingRight: isPassword ? "44px" : "16px",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-primary)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = v("--c-border"))}
          {...rest}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {extra}
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", referral: "" });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (form.name.trim().length < 3) return setError("Nama minimal 3 karakter");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) return setError("Format email tidak valid");

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(form.phone)) return setError("Nomor HP tidak valid (10-15 digit angka)");

    if (form.referral && form.referral.length < 5) return setError("Kode referral minimal 5 karakter");

    const strongPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/;
    if (!strongPassword.test(form.password)) return setError("Password harus mengandung huruf besar, angka, dan simbol");

    if (form.password !== form.confirmPassword) return setError("Konfirmasi password tidak cocok");

    if (!agree) return setError("Anda harus menyetujui syarat & ketentuan");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim(),
          phoneNumber: form.phone,
          password: form.password,
          referralCode: form.referral || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registrasi gagal. Coba lagi.");
        return;
      }

      // Simpan token & arahkan ke home
      localStorage.setItem("ma_token", data.token);
      localStorage.setItem("ma_role", data.user.role);
      localStorage.setItem("ma_user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a2010 0%, #1B5E20 60%, #0a2010 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--c-accent), transparent)", filter: "blur(55px)" }}
        />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--c-gradient-r)" }}>
            <Printer size={18} className="text-white" />
          </div>
          <span className="font-['Poppins',sans-serif] font-bold text-white text-lg">
            Malikussaleh <span style={{ color: "var(--c-accent)" }}>Advertising</span>
          </span>
        </div>

        <div className="relative">
          <p className="font-['Poppins',sans-serif] font-bold text-white text-4xl mb-4 leading-tight">
            Bergabung &<br />
            <span style={{ background: "var(--c-gradient-r)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Mulai Cetak!
            </span>
          </p>
          <p className="text-white/55 text-sm mb-10" style={{ fontFamily: "'Inter',sans-serif", lineHeight: 1.8 }}>
            Daftar gratis dan nikmati layanan cetak premium dengan konsultasi desain gratis untuk member baru.
          </p>
          <div className="flex flex-col gap-3">
            {["Konsultasi desain gratis untuk member baru", "Diskon 10% untuk pesanan pertama", "Lacak pesanan real-time"].map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(46,125,50,0.2)" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--c-accent)" }} />
                </div>
                <span className="text-white/70 text-sm" style={{ fontFamily: "'Inter',sans-serif" }}>
                  {t}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="relative text-white/20 text-xs" style={{ fontFamily: "'Inter',sans-serif" }}>
          © 2025 Malikussaleh Advertising
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto" style={{ background: v("--c-bg") }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px] py-4">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--c-gradient-r)" }}>
              <Printer size={15} className="text-white" />
            </div>
            <span className="font-['Poppins',sans-serif] font-bold" style={{ color: v("--c-text") }}>
              Malikussaleh <span style={{ color: "var(--c-accent)" }}>Advertising</span>
            </span>
          </div>

          <h1 className="font-['Poppins',sans-serif] font-bold mb-1" style={{ fontSize: "1.7rem", color: v("--c-text") }}>
            Buat Akun Baru
          </h1>
          <p className="text-sm mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Isi data berikut untuk membuat akun
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <InputField label="Nama Lengkap" value={form.name} onChange={set("name")} placeholder="Nama lengkap Anda" icon={User} />
            <InputField label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} placeholder="nama@email.com" icon={Mail} />
            <InputField
              label="Nomor HP"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="081234567890"
              icon={Phone}
              inputMode="numeric"
              maxLength={15}
            />
            <InputField
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 karakter"
              icon={Lock}
              extra={<PasswordStrength password={form.password} />}
            />
            <InputField
              label="Konfirmasi Password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Ulangi password"
              icon={Lock}
            />

            {/* Referral (optional) */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Kode Referral <span style={{ color: v("--c-text-sec") }}>(opsional)</span>
              </label>
              <div className="relative">
                <Gift size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
                <input
                  type="text"
                  value={form.referral}
                  onChange={(e) => set("referral")(e.target.value)}
                  placeholder="KODE-REFERRAL"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all uppercase"
                  style={{
                    background: v("--c-bg-sec"),
                    border: `1.5px solid ${v("--c-border")}`,
                    color: v("--c-text"),
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.1em",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = v("--c-border"))}
                />
              </div>
            </div>

            {/* Agree */}
            <label className="flex items-start gap-3 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded flex-shrink-0"
                style={{ accentColor: "var(--c-primary)" }}
              />
              <span className="text-xs leading-relaxed" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                Dengan mendaftar, saya menyetujui{" "}
                <a href="#" className="font-semibold" style={{ color: v("--c-primary") }}>
                  Syarat & Ketentuan
                </a>{" "}
                dan{" "}
                <a href="#" className="font-semibold" style={{ color: v("--c-primary") }}>
                  Kebijakan Privasi
                </a>{" "}
                Malikussaleh Advertising.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "#FEF2F2", color: "#DC2626", fontFamily: "'Inter',sans-serif", border: "1px solid #FECACA" }}
              >
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !agree}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mt-1"
              style={{
                background: !agree || loading ? "rgba(46,125,50,0.4)" : "var(--c-gradient-r)",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </motion.button>
          </form>

          <p className="text-center mt-5 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold" style={{ color: v("--c-primary") }}>
              Masuk di sini
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}