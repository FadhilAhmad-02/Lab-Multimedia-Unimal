import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight, ChevronLeft, Settings, Plane,
  AlertCircle, RefreshCw, Layers,
} from "lucide-react";
import { v, Section, CTASection } from "../components/pageUtils";
import Slider from "react-slick";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Device {
  id: number;
  name: string;
  type: string;       // "mesin" | "drone" | atau kategori lain
  image: string | null;
  description: string | null;
  brand: string | null;
  model: string | null;
  active: boolean;
  serialNumber?: string | null;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SliderSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <div className="h-52" style={{ background: v("--c-border") }} />
          <div className="p-4 flex flex-col gap-2">
            <div className="h-3.5 rounded w-4/5" style={{ background: v("--c-border") }} />
            <div className="h-3 rounded w-3/5" style={{ background: v("--c-border") }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Device Card ─────────────────────────────────────────────────────────────
function DeviceCard({ device, index, codePrefix }: { device: Device; index: number; codePrefix: string }) {
  const imgRef = useRef<HTMLImageElement | HTMLDivElement>(null);
  const code = `${codePrefix}${String(device.id).padStart(3, "0")}`;

  return (
    <div className="px-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: (index % 4) * 0.06 }}
        whileHover={{ y: -8 }}
        className="rounded-2xl overflow-hidden cursor-default transition-all duration-300 group"
        style={{
          background: v("--c-card"),
          border: `1px solid ${v("--c-border")}`,
          boxShadow: v("--c-shadow-card"),
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 220 }}>
          <ImageWithFallback
            src={device.image ?? "/images/placeholder.png"}
            alt={device.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            style={{ filter: "grayscale(100%)", transition: "filter 0.4s ease, transform 0.5s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0%)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.filter = "grayscale(100%)"; }}
          />
          {/* Code badge */}
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.55)", color: "#FFD54F", fontFamily: "'JetBrains Mono',monospace" }}
          >
            {code}
          </div>
          {/* Brand badge */}
          {device.brand && (
            <div
              className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md"
              style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", fontFamily: "'Inter',sans-serif" }}
            >
              {device.brand}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className="font-['Poppins',sans-serif] font-semibold text-sm line-clamp-2"
            style={{ color: v("--c-text"), minHeight: 38, lineHeight: 1.45 }}
          >
            {device.name}
          </h3>
          {device.model && (
            <p className="text-xs mt-1 font-mono" style={{ color: v("--c-text-sec") }}>{device.model}</p>
          )}
          {device.description && (
            <p className="text-xs mt-2 line-clamp-2" style={{ color: v("--c-text-sec"), lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
              {device.description}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Device Slider ────────────────────────────────────────────────────────────
function DeviceSlider({ devices, codePrefix }: { devices: Device[]; codePrefix: string }) {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: devices.length > 4,
    speed: 500,
    slidesToShow: Math.min(4, devices.length),
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3200,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, devices.length) } },
      { breakpoint: 768,  settings: { slidesToShow: Math.min(2, devices.length) } },
      { breakpoint: 480,  settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="relative">
      {/* Nav buttons */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), boxShadow: v("--c-shadow-card") }}
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: v("--c-gradient-r"), color: "#fff", boxShadow: v("--c-shadow-card") }}
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <Slider ref={sliderRef} {...settings}>
        {devices.map((device, i) => (
          <DeviceCard key={device.id} device={device} index={i} codePrefix={codePrefix} />
        ))}
      </Slider>
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────
function DeviceSection({
  icon, iconBg, title, highlight, subtitle, devices, codePrefix, loading,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  highlight: string;
  subtitle: string;
  devices: Device[];
  codePrefix: string;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <div>
          <h2 className="font-['Poppins',sans-serif] font-bold text-2xl md:text-3xl" style={{ color: v("--c-text") }}>
            {title}{" "}
            <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {highlight}
            </span>
          </h2>
          <p className="text-sm mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            {loading ? "Memuat data..." : subtitle}
          </p>
        </div>
      </div>

      {loading ? (
        <SliderSkeleton />
      ) : devices.length > 0 ? (
        <DeviceSlider devices={devices} codePrefix={codePrefix} />
      ) : (
        <div className="text-center py-16 rounded-2xl" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
          <p className="text-3xl mb-3">📦</p>
          <p className="font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Belum ada perangkat</p>
          <p className="text-sm mt-1" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Data akan ditampilkan setelah ditambahkan oleh admin.</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function PerangkatHero({ total }: { total: number }) {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden" style={{ minHeight: 320 }}>
      <div className="absolute inset-0">
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #F9A825 100%)" }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FDD835, transparent)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs mb-6"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif" }}
        >
          <a href="/" style={{ color: "rgba(255,255,255,0.45)" }}>Home</a>
          <ChevronRight size={12} />
          <span style={{ color: "#FDD835" }}>Perangkat</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)", fontFamily: "'Inter',sans-serif" }}
        >
          <Settings size={12} /> Perangkat Produksi
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="font-['Poppins',sans-serif] font-bold text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
        >
          Perangkat{" "}
          <span style={{ background: "linear-gradient(to right, #FDD835, #FFB300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Produksi Kami
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="mt-5 max-w-2xl text-base"
          style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8, fontFamily: "'Inter',sans-serif" }}
        >
          Daftar lengkap mesin produksi dan drone profesional yang tersedia
          di Malikussaleh Advertising untuk menghasilkan produk berkualitas tinggi.
        </motion.p>

        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", fontFamily: "'Inter',sans-serif" }}
          >
            <Layers size={13} /> {total} perangkat terdaftar
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function PerangkatPage() {
  const [devices, setDevices]   = useState<Device[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/devices");
      if (!res.ok) throw new Error(`Gagal memuat perangkat (${res.status})`);
      const json = await res.json();
      const raw: Device[] = Array.isArray(json) ? json : (json.data ?? []);
      setDevices(raw.filter(d => d.active !== false));
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  // Pisahkan berdasarkan type — fallback: semua masuk "mesin" jika tidak ada field type
  const mesin = devices.filter(d => {
    const t = (d.type ?? "").toLowerCase();
    return t === "mesin" || t === "machine" || t === "" || !d.type;
  });
  const drone = devices.filter(d => {
    const t = (d.type ?? "").toLowerCase();
    return t === "drone" || t === "uav";
  });

  return (
    <>
      <PerangkatHero total={devices.length} />

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
                onClick={fetchDevices}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
              >
                <RefreshCw size={14} /> Coba Lagi
              </button>
            </div>
          )}

          {!error && (
            <>
              {/* Mesin */}
              <DeviceSection
                icon={<Settings size={22} color="#fff" />}
                iconBg="linear-gradient(135deg, #2E7D32, #66BB6A)"
                title="Perangkat Mesin Produksi"
                highlight="Lengkap"
                subtitle={`${mesin.length} mesin profesional untuk berbagai kebutuhan produksi`}
                devices={mesin}
                codePrefix="M"
                loading={loading}
              />

              {/* Drone */}
              <DeviceSection
                icon={<Plane size={22} color="#fff" />}
                iconBg="linear-gradient(135deg, #F9A825, #FFD54F)"
                title="Perangkat"
                highlight="Drone"
                subtitle={`${drone.length} drone profesional untuk aerial photography & videography`}
                devices={drone}
                codePrefix="D"
                loading={loading}
              />
            </>
          )}

        </div>
      </Section>

      <CTASection />
    </>
  );
}