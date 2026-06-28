import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import {
  MapPin, Phone, Clock, Mail,
  Target, Eye, Award, Users, Zap, Shield,
  ChevronRight, MessageCircle, CheckCircle,
  Printer, Palette, Star, TrendingUp,
} from "lucide-react";
import { v, Section, SectionHeader, CTASection } from "../components/pageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OutlineFillButton } from "../components/ui/outline-fill-button";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SiteSettings {
  store_name: string;
  store_tagline: string;
  store_whatsapp: string;
  store_email: string;
  store_address: string;
  store_logo: string;
}

// ─── Hook: fetch settings ──────────────────────────────────────────────────────
function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    store_name:      "Malikussaleh Advertising",
    store_tagline:   "Percetakan & Advertising Profesional",
    store_whatsapp:  "081234567890",
    store_email:     "multimedia@unimal.ac.id",
    store_address:   "Reuleut Timur, Kec. Muara Batu, Kab. Aceh Utara, Aceh 24355",
    store_logo:      "",
  });

  useEffect(() => {
    fetch("/api/pengaturan/settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data) setSettings(prev => ({ ...prev, ...d.data }));
      })
      .catch(() => {});
  }, []);

  return settings;
}

// ─── Hook: animated counter ────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1.8) {
  const ref      = useRef<HTMLParagraphElement>(null);
  const inView   = useInView(ref, { once: true, margin: "-60px" });
  const motVal   = useMotionValue(0);
  const spring   = useSpring(motVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motVal.set(target);
  }, [inView, target, motVal]);

  useEffect(() => {
    return spring.on("change", v => setDisplay(Math.round(v)));
  }, [spring]);

  return { ref, display };
}

// ─── Images ────────────────────────────────────────────────────────────────────
const IMG_TEAM   = "https://images.unsplash.com/photo-1761818645907-8bed418b415b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_CAMPUS = "https://images.unsplash.com/photo-1633572528544-14ef28057921?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

// ─── Data ──────────────────────────────────────────────────────────────────────
const VISI_MISI = {
  visi: "Menjadi pusat layanan percetakan dan advertising terdepan di Aceh Utara yang menghasilkan produk berkualitas tinggi, inovatif, dan terjangkau bagi seluruh lapisan masyarakat.",
  misi: [
    "Menyediakan layanan cetak dengan teknologi terkini dan berkualitas tinggi.",
    "Memberikan solusi kreatif yang inovatif untuk kebutuhan desain dan branding pelanggan.",
    "Mendukung kemajuan Universitas Malikussaleh melalui layanan profesional.",
    "Membangun kemitraan jangka panjang yang saling menguntungkan.",
    "Mengembangkan SDM yang kompeten dan berdedikasi di bidang percetakan.",
  ],
};

const NILAI = [
  { Icon: Award,  title: "Kualitas",   desc: "Setiap produk diproses dengan standar kualitas tertinggi tanpa kompromi." },
  { Icon: Zap,    title: "Inovasi",    desc: "Terus berinovasi menghadirkan solusi cetak yang relevan dan modern." },
  { Icon: Users,  title: "Kolaborasi", desc: "Bekerja sama erat dengan pelanggan untuk hasil yang melampaui ekspektasi." },
  { Icon: Shield, title: "Integritas", desc: "Menjalankan bisnis dengan jujur, transparan, dan bertanggung jawab." },
];

const LAYANAN_UNGGULAN = [
  { Icon: Printer, title: "Cetak Digital",   desc: "Banner, spanduk, backdrop, sticker — resolusi tinggi & tahan cuaca." },
  { Icon: Palette, title: "Desain Grafis",   desc: "Logo, brosur, kartu nama — dikerjakan desainer berpengalaman." },
  { Icon: Star,    title: "Cetak Offset",    desc: "Buku, majalah, kalender — hasil tajam untuk volume besar." },
  { Icon: TrendingUp, title: "Branding",     desc: "Seragam, merchandise, dan identitas visual instansi & kampus." },
];

const KEUNGGULAN = [
  "Pengerjaan cepat, tepat waktu dijamin",
  "Harga transparan, tanpa biaya tersembunyi",
  "Revisi desain gratis hingga puas",
  "Layanan konsultasi gratis via WhatsApp",
  "Didukung peralatan cetak profesional",
  "Tim berpengalaman & bersertifikat",
];

// ─── Animated Stat Card ────────────────────────────────────────────────────────
function StatCard({ value, suffix, label }: { value: number | string; suffix?: string; label: string }) {
  const isNum = typeof value === "number";
  const { ref, display } = useAnimatedCounter(isNum ? value : 0);

  return (
    <div className="text-center">
      <p
        ref={ref}
        className="font-['Poppins',sans-serif] font-bold"
        style={{
          fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
          lineHeight: 1,
          background: "linear-gradient(to right, #FB923C, #FACC15)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {isNum ? display : value}{suffix ?? ""}
      </p>
      <p className="mt-1.5 text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter',sans-serif" }}>
        {label}
      </p>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function ProfileHero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative pt-28 pb-24 overflow-hidden" style={{ minHeight: 460 }}>
      {/* Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #F9A825 100%)" }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Decorative blob */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FDD835, transparent)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 flex flex-col items-center text-center">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xs mb-6"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif" }}
        >
          <a href="/" style={{ color: "rgba(255,255,255,0.45)" }}>Home</a>
          <ChevronRight size={12} />
          <span style={{ color: "#FDD835" }}>Profil</span>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)", fontFamily: "'Inter',sans-serif" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Universitas Malikussaleh · Est. 2025
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", lineHeight: 1.1 }}
        >
          Profil{" "}
          <span style={{ background: "linear-gradient(to right, #FDD835, #FFB300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {settings.store_name}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
          className="mt-5 max-w-2xl text-base"
          style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
        >
          {settings.store_tagline || "Unit usaha percetakan profesional di bawah naungan Universitas Malikussaleh yang melayani kebutuhan cetak dan advertising dengan kualitas premium."}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38 }}
          className="mt-14 grid grid-cols-3 gap-6 md:gap-20 max-w-3xl mx-auto w-full"
        >
          <StatCard value={500} suffix="+" label="Pelanggan Puas" />
          <StatCard value={50}  suffix="+" label="Jenis Produk" />
          <StatCard value="24/7"        label="Siap Melayani" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── About Section ─────────────────────────────────────────────────────────────
function AboutSection({ settings }: { settings: SiteSettings }) {
  return (
    <Section bg="var(--c-bg-sec)">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ background: "rgba(46,125,50,0.1)", color: "var(--c-primary)", border: "1px solid rgba(46,125,50,0.2)", fontFamily: "'Inter',sans-serif" }}
            >
              Tentang Kami
            </span>
            <h2 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.2, color: v("--c-text") }}>
              Mitra Cetak Terpercaya{" "}
              <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Sejak 2025
              </span>
            </h2>

            <p className="mt-5 text-base" style={{ color: v("--c-text-sec"), lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>
              <strong style={{ color: v("--c-text") }}>{settings.store_name}</strong> adalah unit usaha percetakan dan advertising yang beroperasi di bawah Universitas Malikussaleh, Aceh Utara. Hadir sebagai solusi lengkap untuk segala kebutuhan cetak custom individu maupun instansi.
            </p>
            <p className="mt-4 text-base" style={{ color: v("--c-text-sec"), lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>
              Dengan dukungan sumber daya universitas dan tim profesional berdedikasi, kami berkomitmen menghadirkan hasil cetakan berkualitas tinggi dengan harga kompetitif dan pelayanan cepat.
            </p>

            {/* Keunggulan list */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {KEUNGGULAN.map((k) => (
                <div key={k} className="flex items-start gap-2">
                  <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--c-primary)" }} />
                  <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>{k}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3 flex-wrap">
              <OutlineFillButton
                direction="up" duration={0.35}
                baseBackground="#2E7D32"
                fillBackground="linear-gradient(to right, #FDD835, #FFB300)"
                borderValue="none" textColor="#ffffff" filledTextColor="#1B5E20"
                onClick={() => window.open(`https://wa.me/${settings.store_whatsapp.replace(/\D/g, "")}`, "_blank")}
              >
                <MessageCircle size={15} /> Hubungi Kami
              </OutlineFillButton>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: v("--c-shadow-hover"), border: `1px solid ${v("--c-border")}` }}>
              <ImageWithFallback src={IMG_TEAM} alt="Tim Malikussaleh Advertising" className="w-full h-80 object-cover" />
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -bottom-5 -left-5 rounded-2xl px-5 py-4 shadow-xl"
              style={{ background: v("--c-gradient-r") }}
            >
              <p className="text-white/90 text-xs font-bold tracking-widest" style={{ fontFamily: "'Inter',sans-serif" }}>KUALITAS TERBUKTI ✓</p>
            </motion.div>
            {/* Second floating badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.55 }}
              className="absolute -top-4 -right-4 rounded-xl px-4 py-3 shadow-lg"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}
            >
              <p className="font-bold text-sm" style={{ color: "var(--c-primary)", fontFamily: "'Poppins',sans-serif" }}>⭐ 4.9/5</p>
              <p className="text-xs mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Rating Pelanggan</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── Layanan Unggulan ──────────────────────────────────────────────────────────
function LayananSection() {
  return (
    <Section>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="Layanan Kami"
          title={
            <>
              Apa yang Kami{" "}
              <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Tawarkan
              </span>
            </>
          }
          subtitle="Dari cetak digital hingga branding instansi — semua tersedia dalam satu tempat."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LAYANAN_UNGGULAN.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, boxShadow: v("--c-shadow-hover") }}
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: v("--c-gradient-r") }}>
                <Icon size={20} className="text-white" />
              </div>
              <h4 className="font-['Poppins',sans-serif] font-bold mb-2" style={{ color: v("--c-text") }}>{title}</h4>
              <p className="text-sm" style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Visi Misi ─────────────────────────────────────────────────────────────────
function VisiMisiSection() {
  return (
    <Section bg="var(--c-bg-sec)">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="Arah & Tujuan"
          title={
            <>
              Visi &{" "}
              <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Misi
              </span>
            </>
          }
        />
        <div className="grid md:grid-cols-2 gap-8">
          {/* Visi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl p-8"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: v("--c-gradient-r") }}>
                <Eye size={18} className="text-white" />
              </div>
              <h3 className="font-['Poppins',sans-serif] font-bold text-xl" style={{ color: v("--c-text") }}>Visi</h3>
            </div>
            <p className="text-base leading-relaxed italic" style={{ color: v("--c-text-sec"), lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>
              "{VISI_MISI.visi}"
            </p>
          </motion.div>

          {/* Misi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-8"
            style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: v("--c-gradient-r") }}>
                <Target size={18} className="text-white" />
              </div>
              <h3 className="font-['Poppins',sans-serif] font-bold text-xl" style={{ color: v("--c-text") }}>Misi</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {VISI_MISI.misi.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold mt-0.5"
                    style={{ background: v("--c-gradient-r"), fontSize: "0.65rem", minWidth: 20 }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm" style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── Nilai ─────────────────────────────────────────────────────────────────────
function NilaiSection() {
  return (
    <Section>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="Core Values"
          title={
            <>
              Nilai-Nilai{" "}
              <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Kami
              </span>
            </>
          }
          subtitle="Prinsip-prinsip yang menjadi fondasi setiap pekerjaan yang kami lakukan."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {NILAI.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl p-6 text-center transition-all duration-300"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: v("--c-gradient-r") }}>
                <Icon size={22} className="text-white" />
              </div>
              <h4 className="font-['Poppins',sans-serif] font-bold mb-2" style={{ color: v("--c-text") }}>{title}</h4>
              <p className="text-sm" style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Kontak ────────────────────────────────────────────────────────────────────
function KontakSection({ settings }: { settings: SiteSettings }) {
  const contacts = [
    { Icon: MapPin, label: "Alamat",               value: settings.store_address  || "Reuleut Timur, Kec. Muara Batu, Kab. Aceh Utara, Aceh 24355" },
    { Icon: Phone,  label: "Telepon / WhatsApp",    value: settings.store_whatsapp || "081234567890" },
    { Icon: Mail,   label: "Email",                 value: settings.store_email    || "multimedia@unimal.ac.id" },
    { Icon: Clock,  label: "Jam Operasional",       value: "Senin – Sabtu: 08:00 – 17:00 WIB" },
  ];

  const waClean = (settings.store_whatsapp || "081234567890").replace(/\D/g, "");

  return (
    <Section bg="var(--c-bg-sec)">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="Lokasi & Kontak"
          title={
            <>
              Temukan{" "}
              <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Kami
              </span>
            </>
          }
          subtitle="Kunjungi kami langsung atau hubungi via WhatsApp untuk konsultasi cepat."
        />

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-hover"), height: 380 }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d392.2721852546099!2d96.98813493443804!3d5.234147657683078!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3047710034914337%3A0x5ea6b645557e0e77!2sLab%20Desain%20dan%20Multimedia%20Universitas%20Malikussaleh!5e1!3m2!1sid!2sid!4v1777052968567!5m2!1sid!2sid"
              width="100%" height="100%"
              style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Malikussaleh Advertising"
            />
          </motion.div>

          {/* Contact cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {contacts.map(({ Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 rounded-xl p-4"
                style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: v("--c-gradient-r") }}>
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--c-accent)", fontFamily: "'Inter',sans-serif" }}>
                    {label}
                  </p>
                  <p className="text-sm" style={{ color: v("--c-text"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
                    {value}
                  </p>
                </div>
              </motion.div>
            ))}

            <OutlineFillButton
              direction="up" duration={0.35}
              baseBackground="#2E7D32"
              fillBackground="linear-gradient(to right, #FDD835, #FFB300)"
              borderValue="none" textColor="#ffffff" filledTextColor="#1B5E20"
              className="mt-2"
              onClick={() => window.open(`https://wa.me/${waClean}`, "_blank")}
            >
              <MessageCircle size={15} /> Chat WhatsApp Sekarang
            </OutlineFillButton>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export function ProfilePage() {
  const settings = useSettings();

  return (
    <div style={{ color: v("--c-text") }}>
      <ProfileHero   settings={settings} />
      <AboutSection  settings={settings} />
      <LayananSection />
      <VisiMisiSection />
      <NilaiSection />
      <KontakSection settings={settings} />
      <CTASection />
    </div>
  );
}