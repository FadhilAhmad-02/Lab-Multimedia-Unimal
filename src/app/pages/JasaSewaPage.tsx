import { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronRight, Camera, Plane, Clock, Check, Star,
  Shield, Zap, Package, MessageCircle, ArrowRight
} from "lucide-react";
import { v, Section, CTASection } from "../components/pageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

/* ── Data Services ────────────────────────────────────────────── */
interface Service {
  id: string;
  type: "photography" | "drone";
  name: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  features: string[];
  popular?: boolean;
}

const SERVICES: Service[] = [
  {
    id: "foto-product",
    type: "photography",
    name: "Jasa Fotografi Produk",
    description: "Dokumentasi produk profesional untuk katalog dan e-commerce dengan lighting studio.",
    price: "Mulai Rp 500.000",
    duration: "2-4 jam",
    image: "product photography studio lighting",
    features: [
      "10-20 foto produk edited",
      "Studio lighting profesional",
      "Background putih/custom",
      "Retouching & color grading",
      "High resolution (300dpi)",
    ],
    popular: true,
  },
  {
    id: "foto-event",
    type: "photography",
    name: "Jasa Fotografi Event",
    description: "Dokumentasi acara seminar, workshop, pernikahan, dan event corporate.",
    price: "Mulai Rp 1.500.000",
    duration: "Full day",
    image: "event photography corporate seminar",
    features: [
      "100+ foto edited",
      "2 fotografer profesional",
      "Raw files included",
      "Same day preview",
      "Online gallery",
    ],
  },
  {
    id: "foto-wisuda",
    type: "photography",
    name: "Jasa Fotografi Wisuda",
    description: "Paket dokumentasi wisuda lengkap dengan foto studio dan outdoor.",
    price: "Mulai Rp 350.000",
    duration: "1-2 jam",
    image: "graduation photography university outdoor",
    features: [
      "15-30 foto edited",
      "Indoor & outdoor session",
      "Cetak foto 4R (5 lembar)",
      "Digital files HD",
      "Frame kayu gratis",
    ],
    popular: true,
  },
  {
    id: "sewa-drone-dji-mavic",
    type: "drone",
    name: "Sewa Drone DJI Mavic 3 Enterprise",
    description: "Sewa drone profesional untuk aerial photography, videography, dan pemetaan.",
    price: "Rp 500.000 / hari",
    duration: "Per hari",
    image: "dji mavic 3 enterprise drone professional",
    features: [
      "Drone + remote controller",
      "3 baterai (45 menit/baterai)",
      "Memory card 128GB",
      "Tas carrying case",
      "Panduan operasional",
    ],
    popular: true,
  },
  {
    id: "sewa-drone-dji-inspire",
    type: "drone",
    name: "Sewa Drone DJI Inspire 3",
    description: "Sewa drone cinema-grade untuk produksi video berkualitas tinggi.",
    price: "Rp 1.200.000 / hari",
    duration: "Per hari",
    image: "dji inspire 3 professional cinema drone",
    features: [
      "Drone + dual remote (pilot & kamera)",
      "6 baterai TB51",
      "Gimbal camera 8K",
      "ND filter set",
      "Asuransi equipment",
    ],
  },
  {
    id: "paket-aerial-video",
    type: "drone",
    name: "Paket Aerial Photography & Video",
    description: "Jasa drone lengkap dengan operator profesional dan editing.",
    price: "Mulai Rp 2.500.000",
    duration: "Half day",
    image: "aerial photography videography professional drone",
    features: [
      "Pilot + kamera operator",
      "2-3 lokasi shooting",
      "Video 4K edited (3-5 menit)",
      "20+ foto aerial edited",
      "Color grading profesional",
    ],
  },
];

/* ── Hero ─────────────────────────────────────────────────────── */
function JasaSewaHero() {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden" style={{ minHeight: 340 }}>
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #F9A825 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 flex flex-col items-center text-center">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xs mb-6"
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter',sans-serif" }}
        >
          <a href="/" style={{ color: "rgba(255,255,255,0.5)" }}>
            Home
          </a>
          <ChevronRight size={12} />
          <span style={{ color: "#FFD54F" }}>Jasa & Sewa</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          <Camera size={12} />
          Layanan Profesional
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
        >
          Jasa Fotografi &{" "}
          <span
            style={{
              background: "linear-gradient(to right, #FDD835, #FFB300)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Sewa Drone
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-5 max-w-2xl text-base"
          style={{
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.8,
            fontFamily: "'Inter',sans-serif",
          }}
        >
          Layanan fotografi profesional dan sewa drone untuk kebutuhan dokumentasi,
          promosi, dan produksi konten berkualitas tinggi.
        </motion.p>
      </div>
    </section>
  );
}

/* ── Service Card ─────────────────────────────────────────────── */
function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.type === "photography" ? Camera : Plane;
  const typeLabel = service.type === "photography" ? "Jasa Fotografi" : "Sewa Drone";
  const typeColor = service.type === "photography" ? "#2E7D32" : "#F9A825";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: v("--c-card"),
        border: service.popular
          ? `1.5px solid ${v("--c-primary")}40`
          : `1px solid ${v("--c-border")}`,
        boxShadow: service.popular ? v("--c-shadow-hover") : v("--c-shadow-card"),
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          query={service.image}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {service.popular && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1"
            style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
          >
            <Star size={12} fill="#fff" />
            Populer
          </span>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-2"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent)" }}
        >
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: typeColor, fontFamily: "'Inter',sans-serif" }}
          >
            <Icon size={12} />
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-['Poppins',sans-serif] font-bold mb-2" style={{ color: v("--c-text") }}>
          {service.name}
        </h3>
        <p
          className="text-xs mb-4 flex-1"
          style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}
        >
          {service.description}
        </p>

        {/* Features */}
        <ul className="mb-4 space-y-1.5">
          {service.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />
              <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Price & Duration */}
        <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
          <div>
            <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Harga
            </p>
            <p
              className="font-['Poppins',sans-serif] font-bold"
              style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {service.price}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Durasi
            </p>
            <p className="text-xs font-semibold flex items-center gap-1 justify-end" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
              <Clock size={12} />
              {service.duration}
            </p>
          </div>
        </div>

        {/* CTA */}
        <a
          href={`https://wa.me/081234567890?text=Halo, saya ingin memesan ${service.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
        >
          <MessageCircle size={14} /> Pesan Sekarang
        </a>
      </div>
    </motion.div>
  );
}

/* ── Filter Tabs ──────────────────────────────────────────────── */
function FilterTabs({ active, onChange }: { active: string; onChange: (type: string) => void }) {
  const tabs = [
    { id: "all", label: "Semua Layanan" },
    { id: "photography", label: "Jasa Fotografi", icon: Camera },
    { id: "drone", label: "Sewa Drone", icon: Plane },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(tab.id)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
          style={{
            background: active === tab.id ? v("--c-gradient-r") : v("--c-bg-sec"),
            color: active === tab.id ? "#fff" : v("--c-text-sec"),
            border: active === tab.id ? "none" : `1px solid ${v("--c-border")}`,
            fontFamily: "'Inter',sans-serif",
            boxShadow: active === tab.id ? "0 4px 15px rgba(46,125,50,0.25)" : "none",
          }}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
}

/* ── Why Choose Us ────────────────────────────────────────────── */
function WhyChooseUs() {
  const reasons = [
    {
      Icon: Shield,
      title: "Peralatan Profesional",
      desc: "Camera & drone terbaru dengan kualitas terbaik di kelasnya.",
    },
    {
      Icon: Zap,
      title: "Tim Berpengalaman",
      desc: "Fotografer & pilot drone bersertifikat dengan portofolio lengkap.",
    },
    {
      Icon: Package,
      title: "Harga Kompetitif",
      desc: "Paket lengkap dengan harga terjangkau dan transparan.",
    },
    {
      Icon: Clock,
      title: "Pengerjaan Cepat",
      desc: "Hasil foto/video dikirim maksimal 3-5 hari kerja.",
    },
  ];

  return (
    <Section bg="var(--c-bg-sec)">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
            style={{
              background: "rgba(30,58,95,0.08)",
              color: v("--c-primary"),
              border: `1px solid rgba(30,58,95,0.15)`,
              fontFamily: "'Inter',sans-serif",
            }}
          >
            Keunggulan Kami
          </p>
          <h2
            className="font-['Poppins',sans-serif] font-bold"
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              lineHeight: 1.2,
              color: v("--c-text"),
            }}
          >
            Mengapa Pilih{" "}
            <span
              style={{
                background: v("--c-gradient-r"),
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Layanan Kami?
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 text-center"
              style={{
                background: v("--c-card"),
                border: `1px solid ${v("--c-border")}`,
                boxShadow: v("--c-shadow-card"),
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: v("--c-gradient-r") }}
              >
                <Icon size={22} className="text-white" />
              </div>
              <h4
                className="font-['Poppins',sans-serif] font-bold mb-2"
                style={{ color: v("--c-text") }}
              >
                {title}
              </h4>
              <p
                className="text-sm"
                style={{
                  color: v("--c-text-sec"),
                  lineHeight: 1.7,
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ── Main Export ──────────────────────────────────────────────── */
export function JasaSewaPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredServices = SERVICES.filter(
    (s) => activeFilter === "all" || s.type === activeFilter
  );

  return (
    <div style={{ color: v("--c-text") }}>
      <JasaSewaHero />

      <Section>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredServices.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>
      </Section>

      <WhyChooseUs />
      <CTASection />
    </div>
  );
}