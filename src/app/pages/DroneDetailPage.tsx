import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronRight, ArrowLeft, Plane, Check, Package, 
  Zap, Shield, Info
} from "lucide-react";
import { v, Section } from "../components/pageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DRONES } from "./PerangkatPage";

/* ── Mock Data Spesifikasi ────────────────────────────────────── */
interface DroneSpec {
  category: string;
  items: { label: string; value: string }[];
}

function getDroneSpecs(slug: string): DroneSpec[] {
  // Data berbeda untuk tiap drone
  if (slug === "dji-mavic-3-enterprise") {
    return [
      {
        category: "Spesifikasi Teknis",
        items: [
          { label: "Dimensi (Folded)", value: "221×96.3×90.3 mm" },
          { label: "Berat", value: "920 g" },
          { label: "Max Flight Time", value: "45 menit" },
          { label: "Max Speed", value: "21 m/s" },
        ],
      },
      {
        category: "Camera & Gimbal",
        items: [
          { label: "Sensor", value: "4/3 CMOS, 20MP" },
          { label: "Video Resolution", value: "5.1K @ 50fps" },
          { label: "Gimbal Range", value: "-135° to 45°" },
          { label: "Zoom", value: "Hybrid 56x zoom" },
        ],
      },
      {
        category: "Fitur Unggulan",
        items: [
          { label: "RTK Module", value: "✓ Tersedia" },
          { label: "Thermal Camera", value: "✓ Optional" },
          { label: "Obstacle Sensing", value: "✓ Omnidirectional" },
          { label: "IP Rating", value: "IP54" },
        ],
      },
    ];
  } else {
    // DJI Inspire 3
    return [
      {
        category: "Spesifikasi Teknis",
        items: [
          { label: "Dimensi", value: "605×605×185 mm" },
          { label: "Berat", value: "4260 g (dengan ProRes)" },
          { label: "Max Flight Time", value: "28 menit" },
          { label: "Max Speed", value: "31 m/s" },
        ],
      },
      {
        category: "Camera & Gimbal",
        items: [
          { label: "Sensor", value: "Full-Frame 8K" },
          { label: "Video Resolution", value: "8K @ 75fps" },
          { label: "Gimbal Range", value: "360° Pan Rotation" },
          { label: "Dynamic Range", value: "14+ stops" },
        ],
      },
      {
        category: "Fitur Unggulan",
        items: [
          { label: "ProRes RAW", value: "✓ Tersedia" },
          { label: "Waypoint 3.0", value: "✓ Tersedia" },
          { label: "Spotlight Pro", value: "✓ Tersedia" },
          { label: "Dual Operator", value: "✓ Supported" },
        ],
      },
    ];
  }
}

/* ── Hero ─────────────────────────────────────────────────────── */
function DroneDetailHero({ drone }: { drone: typeof DRONES[0] }) {
  const navigate = useNavigate();

  return (
    <section className="relative pt-28 pb-16 overflow-hidden" style={{ minHeight: 340 }}>
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(135deg, #F57F17 0%, #F9A825 50%, #FBC02D 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/perangkat")}
          className="flex items-center gap-2 text-sm mb-6 px-4 py-2 rounded-xl transition-all duration-300"
          style={{
            color: "rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Perangkat
        </motion.button>

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
          <a href="/perangkat" style={{ color: "rgba(255,255,255,0.5)" }}>
            Perangkat
          </a>
          <ChevronRight size={12} />
          <span style={{ color: "#fff" }}>Detail Drone</span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: v("--c-card"),
              border: `1px solid rgba(255,255,255,0.1)`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <ImageWithFallback
              query={drone.image}
              alt={drone.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </motion.div>

          {/* Content */}
          <div>
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
              <Plane size={12} />
              {drone.id}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-['Poppins',sans-serif] font-bold text-white mb-5"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", lineHeight: 1.2 }}
            >
              {drone.name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Check, label: "Siap Terbang", color: "#66BB6A" },
                { icon: Shield, label: "Fully Insured", color: "#fff" },
                { icon: Zap, label: "Professional Grade", color: "#42A5F5" },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: badge.color,
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  <badge.icon size={16} />
                  {badge.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Specifications ───────────────────────────────────────────── */
function SpecificationsSection({ specs }: { specs: DroneSpec[] }) {
  return (
    <Section>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: v("--c-bg-sec"),
              color: v("--c-primary"),
              fontFamily: "'Inter',sans-serif",
            }}
          >
            <Info size={12} />
            Spesifikasi Lengkap
          </div>
          <h2
            className="font-['Poppins',sans-serif] font-bold text-3xl md:text-4xl"
            style={{ color: v("--c-text") }}
          >
            Detail{" "}
            <span
              style={{
                background: v("--c-gradient-r"),
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Spesifikasi
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {specs.map((spec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl p-6"
              style={{
                background: v("--c-card"),
                border: `1px solid ${v("--c-border")}`,
                boxShadow: v("--c-shadow-card"),
              }}
            >
              <h3
                className="font-['Poppins',sans-serif] font-semibold text-lg mb-4 pb-3"
                style={{
                  color: v("--c-text"),
                  borderBottom: `2px solid ${v("--c-border")}`,
                }}
              >
                {spec.category}
              </h3>
              <div className="space-y-3">
                {spec.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <span
                      className="text-sm"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-semibold text-right"
                      style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, #F9A825, #FFD54F)",
            color: "#fff",
          }}
        >
          <Plane size={40} className="mx-auto mb-4 opacity-90" />
          <h3 className="font-['Poppins',sans-serif] font-semibold text-xl mb-2">
            Drone Profesional untuk Aerial Photography & Videography
          </h3>
          <p className="text-sm opacity-90" style={{ fontFamily: "'Inter',sans-serif" }}>
            Drone ini dilengkapi dengan pilot bersertifikat dan asuransi penuh untuk memastikan
            hasil foto dan video aerial terbaik untuk proyek Anda.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export function DroneDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const drone = DRONES.find((d) => d.slug === slug);

  if (!drone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: v("--c-bg") }}>
        <div className="text-center">
          <Plane size={64} style={{ color: v("--c-text-sec"), margin: "0 auto 16px" }} />
          <h2 className="font-['Poppins',sans-serif] font-bold text-2xl mb-2" style={{ color: v("--c-text") }}>
            Drone Tidak Ditemukan
          </h2>
          <p className="text-sm mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Drone yang Anda cari tidak ada dalam sistem.
          </p>
          <button
            onClick={() => navigate("/perangkat")}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: v("--c-gradient-r") }}
          >
            Kembali ke Perangkat
          </button>
        </div>
      </div>
    );
  }

  const specs = getDroneSpecs(slug || "");

  return (
    <>
      <DroneDetailHero drone={drone} />
      <SpecificationsSection specs={specs} />
    </>
  );
}
