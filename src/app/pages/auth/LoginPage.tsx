import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Mail, Lock, Eye, EyeOff, CheckCircle2,
  Zap, Shield, Award,
} from "lucide-react";
import { v } from "../../components/pageUtils";
import logoImg from "figma:asset/cfad863fc3fac009c98531916297fd32e15715b6.png";

const FEATURES = [
  { Icon: Zap,    text: "Proses cetak cepat & on-time" },
  { Icon: Shield, text: "Garansi kepuasan 100%" },
  { Icon: Award,  text: "Kualitas premium terpercaya" },
];

export function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate                = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    // Mock role-based redirect
    if (email.includes("admin")) {
      localStorage.setItem("ma_role", "admin");
      navigate("/admin");
    } else if (email.includes("operator")) {
      localStorage.setItem("ma_role", "operator");
      navigate("/operator");
    } else if (email === "" || password === "") {
      setError("Email dan password tidak boleh kosong.");
      setLoading(false);
    } else {
      localStorage.setItem("ma_role", "customer");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[520px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B5E20 0%, #0a2010 50%, #1B5E20 100%)" }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--c-accent), transparent)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15" style={{ background: "radial-gradient(circle, var(--c-primary), transparent)", filter: "blur(50px)" }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <img
            src={logoImg}
            alt="Malikussaleh Advertising"
            className="w-64 h-64 object-contain drop-shadow-lg"
          />
        </div>

        {/* Center content */}
        <div className="relative">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-['Poppins',sans-serif] font-bold text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", lineHeight: 1.2 }}
          >
            Solusi Cetak
            <br />
            <span style={{ background: "var(--c-gradient-r)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Premium Aceh
            </span>
          </motion.p>
          <p className="text-white/60 text-base mb-10" style={{ fontFamily: "'Inter',sans-serif", lineHeight: 1.8 }}>
            Universitas Malikussaleh — tempat cetak terpercaya untuk semua kebutuhan bisnis dan personal Anda.
          </p>

          {/* Features */}
          <div className="flex flex-col gap-4">
            {FEATURES.map(({ Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(46,125,50,0.2)" }}>
                  <Icon size={15} style={{ color: "var(--c-accent)" }} />
                </div>
                <span className="text-white/80 text-sm" style={{ fontFamily: "'Inter',sans-serif" }}>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-white/25 text-xs" style={{ fontFamily: "'Inter',sans-serif" }}>© 2025 Malikussaleh Advertising</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12" style={{ background: v("--c-bg") }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src={logoImg}
              alt="Malikussaleh Advertising"
              className="w-24 h-24 object-contain"
            />
          </div>

          <h1 className="font-['Poppins',sans-serif] font-bold mb-2" style={{ fontSize: "1.75rem", color: v("--c-text") }}>
            Selamat Datang Kembali 👋
          </h1>
          <p className="text-sm mb-8" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Masuk ke akun Malikussaleh Advertising Anda
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--c-primary)")}
                  onBlur={e => (e.currentTarget.style.borderColor = v("--c-border"))}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: v("--c-bg-sec"), border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--c-primary)")}
                  onBlur={e => (e.currentTarget.style.borderColor = v("--c-border"))}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "var(--c-primary)" }} />
                <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Ingat saya</span>
              </label>
              <a href="#" className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Lupa password?</a>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626", fontFamily: "'Inter',sans-serif", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mt-1"
              style={{ background: loading ? "rgba(46,125,50,0.5)" : "var(--c-gradient-r)", fontFamily: "'Inter',sans-serif" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : "Masuk"}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: v("--c-border") }} />
              <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>atau masuk dengan</span>
              <div className="flex-1 h-px" style={{ background: v("--c-border") }} />
            </div>

            {/* Google */}
            <button type="button" className="w-full py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200" style={{ border: `1.5px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif", background: v("--c-bg-sec") }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--c-primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = v("--c-border"))}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Masuk dengan Google
            </button>
          </form>

          {/* Register link */}
          <p className="text-center mt-6 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold" style={{ color: v("--c-primary") }}>Daftar sekarang</Link>
          </p>

          {/* Demo links */}
          <div className="mt-8 p-4 rounded-xl" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
            <p className="text-xs font-semibold mb-2" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Demo Akses Cepat:</p>
            <div className="flex flex-wrap gap-2">
              {[{ label: "Customer", email: "customer@demo.com" }, { label: "Operator", email: "operator@demo.com" }, { label: "Admin", email: "admin@demo.com" }].map(({ label, email: e }) => (
                <button key={label} onClick={() => { setEmail(e); setPassword("demo123"); }} className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: v("--c-card"), color: v("--c-primary"), border: `1px solid ${v("--c-border")}`, fontFamily: "'Inter',sans-serif" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}