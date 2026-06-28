import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  ChevronRight, Camera, Plane, Clock, Check, Star,
  Shield, Zap, Package, MessageCircle, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { v, Section, CTASection } from "../components/pageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: number;
  title: string;
  description: string;
  features: string[] | string;   // Json di Prisma — bisa array atau string JSON
  duration: string;
  price: number;
  image: string | null;
  category: string;              // "photography" | "drone" | dll
  featured: boolean;
  active: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse features dari Json Prisma — bisa array, JSON string, atau string biasa */
function parseFeatures(raw: string[] | string | unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return [raw]; }
  }
  return [];
}

/** Tentukan type dari field category */
function resolveType(category: string): "photography" | "drone" | "other" {
  const c = category.toLowerCase();
  if (c.includes("foto") || c.includes("photo") || c.includes("photography")) return "photography";
  if (c.includes("drone") || c.includes("uav") || c.includes("aerial"))       return "drone";
  return "other";
}

/** Format harga dari integer (Prisma) ke "Rp 500.000" */
function formatPrice(price: number, category: string): string {
  const t = resolveType(category);
  const formatted = `Rp ${price.toLocaleString("id-ID")}`;
  if (t === "drone") return `${formatted} / hari`;
  return `Mulai ${formatted}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
      <div className="h-48" style={{ background: v("--c-border") }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 rounded w-3/4" style={{ background: v("--c-border") }} />
        <div className="h-3 rounded w-full"  style={{ background: v("--c-border") }} />
        <div className="h-3 rounded w-5/6"   style={{ background: v("--c-border") }} />
        <div className="h-8 rounded-xl mt-3" style={{ background: v("--c-border") }} />
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function JasaSewaHero({ total }: { total: number }) {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden" style={{ minHeight: 340 }}>
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #F9A825 100%)" }}
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
          <a href="/" style={{ color: "rgba(255,255,255,0.5)" }}>Home</a>
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
          <Camera size={12} /> Layanan Profesional
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
        >
          Jasa Fotografi &{" "}
          <span style={{ background: "linear-gradient(to right, #FDD835, #FFB300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Sewa Drone
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-5 max-w-2xl text-base"
          style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
        >
          Layanan fotografi profesional dan sewa drone untuk kebutuhan dokumentasi,
          promosi, dan produksi konten berkualitas tinggi.
        </motion.p>

        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", fontFamily: "'Inter',sans-serif" }}
          >
            <Camera size={13} /> {total} layanan tersedia
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  index,
  waNumber,
}: {
  service: Service;
  index: number;
  waNumber: string;
}) {
  const type      = resolveType(service.category);
  const Icon      = type === "photography" ? Camera : Plane;
  const typeLabel = type === "photography" ? "Jasa Fotografi" : type === "drone" ? "Sewa Drone" : service.category;
  const typeColor = type === "photography" ? "#2E7D32" : "#F9A825";
  const features  = parseFeatures(service.features);
  const priceStr  = formatPrice(service.price, service.category);

  const waMsg = encodeURIComponent(`Halo, saya ingin memesan ${service.title}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: v("--c-card"),
        border: service.featured
          ? `1.5px solid ${v("--c-primary")}40`
          : `1px solid ${v("--c-border")}`,
        boxShadow: service.featured ? v("--c-shadow-hover") : v("--c-shadow-card"),
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={service.image ?? "/images/placeholder.png"}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {service.featured && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1"
            style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
          >
            <Star size={12} fill="#fff" /> Populer
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
            <Icon size={12} /> {typeLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-['Poppins',sans-serif] font-bold mb-2" style={{ color: v("--c-text") }}>
          {service.title}
        </h3>
        <p
          className="text-xs mb-4 flex-1"
          style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}
        >
          {service.description}
        </p>

        {/* Features */}
        {features.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                <span className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Price & Duration */}
        <div
          className="flex items-center justify-between mb-4 pb-4"
          style={{ borderBottom: `1px solid ${v("--c-border")}` }}
        >
          <div>
            <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Harga
            </p>
            <p
              className="font-['Poppins',sans-serif] font-bold"
              style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {priceStr}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Durasi
            </p>
            <p
              className="text-xs font-semibold flex items-center gap-1 justify-end"
              style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
            >
              <Clock size={12} /> {service.duration}
            </p>
          </div>
        </div>

        {/* CTA — nomor WA dari settings */}
        <a
          href={`https://wa.me/${waNumber}?text=${waMsg}`}
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

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: string;
  onChange: (type: string) => void;
  counts: { all: number; photography: number; drone: number };
}) {
  const tabs = [
    { id: "all",         label: `Semua (${counts.all})`,              icon: undefined  },
    { id: "photography", label: `Jasa Fotografi (${counts.photography})`, icon: Camera },
    { id: "drone",       label: `Sewa Drone (${counts.drone})`,        icon: Plane  },
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
            color:      active === tab.id ? "#fff" : v("--c-text-sec"),
            border:     active === tab.id ? "none" : `1px solid ${v("--c-border")}`,
            fontFamily: "'Inter',sans-serif",
            boxShadow:  active === tab.id ? "0 4px 15px rgba(46,125,50,0.25)" : "none",
          }}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────

function WhyChooseUs() {
  const reasons = [
    { Icon: Shield,  title: "Peralatan Profesional", desc: "Camera & drone terbaru dengan kualitas terbaik di kelasnya."         },
    { Icon: Zap,     title: "Tim Berpengalaman",     desc: "Fotografer & pilot drone bersertifikat dengan portofolio lengkap."   },
    { Icon: Package, title: "Harga Kompetitif",      desc: "Paket lengkap dengan harga terjangkau dan transparan."               },
    { Icon: Clock,   title: "Pengerjaan Cepat",      desc: "Hasil foto/video dikirim maksimal 3-5 hari kerja."                   },
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
            style={{ background: "rgba(46,125,50,0.08)", color: v("--c-primary"), border: `1px solid rgba(46,125,50,0.15)`, fontFamily: "'Inter',sans-serif" }}
          >
            Keunggulan Kami
          </p>
          <h2
            className="font-['Poppins',sans-serif] font-bold"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.2, color: v("--c-text") }}
          >
            Mengapa Pilih{" "}
            <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
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
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: v("--c-gradient-r") }}>
                <Icon size={22} className="text-white" />
              </div>
              <h4 className="font-['Poppins',sans-serif] font-bold mb-2" style={{ color: v("--c-text") }}>
                {title}
              </h4>
              <p className="text-sm" style={{ color: v("--c-text-sec"), lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function JasaSewaPage() {
  const [services,     setServices]     = useState<Service[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [waNumber,     setWaNumber]     = useState("081234567890");

  // Fetch services dari /api/services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/services`);
      if (!res.ok) throw new Error(`Gagal memuat layanan (${res.status})`);
      const json = await res.json();
      const list: Service[] = Array.isArray(json) ? json : (json.data ?? []);
      setServices(list.filter(s => s.active !== false));
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch WA number dari settings
  useEffect(() => {
    fetch(`${API_BASE}/pengaturan/settings`)
      .then(r => r.json())
      .then((d: any) => {
        const wa = d?.data?.store_whatsapp;
        if (wa) setWaNumber(wa.replace(/\D/g, ""));
      })
      .catch(() => {}); // fail silently, fallback ada
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // Hitung counts per type untuk label filter
  const counts = {
    all:         services.length,
    photography: services.filter(s => resolveType(s.category) === "photography").length,
    drone:       services.filter(s => resolveType(s.category) === "drone").length,
  };

  // Filter
  const filtered = services.filter(s => {
    if (activeFilter === "all") return true;
    return resolveType(s.category) === activeFilter;
  });

  return (
    <div style={{ color: v("--c-text") }}>
      <JasaSewaHero total={services.length} />

      <Section>
        <div className="max-w-7xl mx-auto px-5 md:px-10">

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                <AlertCircle size={28} color="#EF4444" />
              </div>
              <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{error}</p>
              <button
                onClick={fetchServices}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
              >
                <RefreshCw size={14} /> Coba Lagi
              </button>
            </div>
          )}

          {!error && (
            <>
              <FilterTabs active={activeFilter} onChange={setActiveFilter} counts={counts} />

              {/* Loading skeleton */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 rounded-2xl mb-16" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <p className="text-3xl mb-3">📂</p>
                  <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>
                    Belum ada layanan
                  </p>
                  <p className="text-sm mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                    Layanan akan ditampilkan setelah ditambahkan oleh admin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {filtered.map((service, i) => (
                    <ServiceCard key={service.id} service={service} index={i} waNumber={waNumber} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      <WhyChooseUs />
      <CTASection />
    </div>
  );
}