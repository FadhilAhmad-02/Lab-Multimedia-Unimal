import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronRight, ArrowLeft, Settings, Check,
  Package, Zap, Shield, Info, Loader2, AlertCircle,
} from "lucide-react";
import { v, Section } from "../components/pageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Device {
  id: number;
  name: string;
  type: string;
  image: string | null;
  description: string | null;
  brand: string | null;
  model: string | null;
  active: boolean;
  serialNumber?: string | null;
  // Field spesifikasi opsional — jika backend mengirim
  specifications?: Record<string, string> | null;
  stats?: { label: string; value: string; icon?: string }[] | null;
}

interface MachineSpec {
  category: string;
  items: { label: string; value: string }[];
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Buat kode device (mis. "M001", "D002") dari type & id,
 * konsisten dengan DeviceCard di PerangkatPage
 */
function deviceCode(device: Device): string {
  const t = (device.type ?? "").toLowerCase();
  const prefix = t === "drone" || t === "uav" ? "D" : "M";
  return `${prefix}${String(device.id).padStart(3, "0")}`;
}

/**
 * Konversi device.specifications (Record<string,string> dari DB)
 * ke format MachineSpec[] untuk ditampilkan.
 * Jika tidak ada data dari DB, gunakan fallback generik.
 */
function buildSpecs(device: Device): MachineSpec[] {
  // Jika backend mengirim field specifications sebagai JSON
  if (device.specifications && Object.keys(device.specifications).length > 0) {
    // Kelompokkan per kategori jika key mengandung prefix "kat_X:"
    // Contoh key: "Teknis:Dimensi" → kategori "Teknis", label "Dimensi"
    // Atau flat → semua masuk satu kartu "Spesifikasi"
    const grouped: Record<string, { label: string; value: string }[]> = {};
    for (const [key, value] of Object.entries(device.specifications)) {
      const [cat, label] = key.includes(":") ? key.split(":") : ["Spesifikasi", key];
      if (!grouped[cat!]) grouped[cat!] = [];
      grouped[cat!]!.push({ label: label!.trim(), value });
    }
    return Object.entries(grouped).map(([category, items]) => ({ category, items }));
  }

  // Fallback: tampilkan data yang ada dari field Device itu sendiri
  const infoItems: { label: string; value: string }[] = [];
  if (device.brand)        infoItems.push({ label: "Brand",         value: device.brand });
  if (device.model)        infoItems.push({ label: "Model",         value: device.model });
  if (device.serialNumber) infoItems.push({ label: "Serial Number", value: device.serialNumber });
  infoItems.push({ label: "Tipe",   value: device.type || "—" });
  infoItems.push({ label: "Status", value: device.active ? "Aktif & Siap Digunakan" : "Tidak Aktif" });

  return [
    {
      category: "Informasi Perangkat",
      items: infoItems.length > 0 ? infoItems : [{ label: "Kode", value: deviceCode(device) }],
    },
    {
      category: "Kapasitas & Performa",
      items: [
        { label: "Kecepatan Maksimal", value: "—" },
        { label: "Resolusi",           value: "—" },
        { label: "Lebar Kerja",        value: "—" },
        { label: "Material Support",   value: "—" },
      ],
    },
    {
      category: "Fitur Unggulan",
      items: [
        { label: "Daya Listrik",          value: "220V / 50Hz" },
        { label: "Digital Control Panel", value: "✓ Tersedia"  },
        { label: "Safety Sensor",         value: "✓ Tersedia"  },
        { label: "Auto Calibration",      value: "✓ Tersedia"  },
      ],
    },
  ];
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function MesinDetailHero({ device }: { device: Device }) {
  const navigate = useNavigate();
  const code = deviceCode(device);

  return (
    <section className="relative pt-28 pb-16 overflow-hidden" style={{ minHeight: 340 }}>
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10">
        {/* Back button */}
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
          <ArrowLeft size={16} /> Kembali ke Perangkat
        </motion.button>

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
          <a href="/perangkat" style={{ color: "rgba(255,255,255,0.5)" }}>Perangkat</a>
          <ChevronRight size={12} />
          <span style={{ color: "#FFD54F" }}>{device.name}</span>
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
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <ImageWithFallback
              src={device.image ?? "/images/placeholder.png"}
              alt={device.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </motion.div>

          {/* Content */}
          <div>
            {/* Code badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              <Settings size={12} /> {code}
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-['Poppins',sans-serif] font-bold text-white mb-3"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", lineHeight: 1.2 }}
            >
              {device.name}
            </motion.h1>

            {/* Brand + Model */}
            {(device.brand || device.model) && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="text-sm mb-5"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter',sans-serif" }}
              >
                {[device.brand, device.model].filter(Boolean).join(" · ")}
              </motion.p>
            )}

            {/* Description */}
            {device.description && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22 }}
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Inter',sans-serif", lineHeight: 1.8 }}
              >
                {device.description}
              </motion.p>
            )}

            {/* Status badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Check,  label: device.active ? "Siap Digunakan" : "Tidak Aktif", color: device.active ? "#66BB6A" : "#EF4444" },
                { icon: Shield, label: "Terawat",          color: "#FFD54F" },
                { icon: Zap,    label: "High Performance", color: "#42A5F5" },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(255,255,255,0.12)", color: badge.color, fontFamily: "'Inter',sans-serif" }}
                >
                  <badge.icon size={16} /> {badge.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Specifications Section ────────────────────────────────────────────────────

function SpecificationsSection({ specs, device }: { specs: MachineSpec[]; device: Device }) {
  return (
    <Section>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: v("--c-bg-sec"), color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}
          >
            <Info size={12} /> Spesifikasi Lengkap
          </div>
          <h2
            className="font-['Poppins',sans-serif] font-bold text-3xl md:text-4xl"
            style={{ color: v("--c-text") }}
          >
            Detail{" "}
            <span style={{ background: v("--c-gradient-r"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Spesifikasi
            </span>
          </h2>
        </motion.div>

        {/* Spec cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {specs.map((spec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl p-6"
              style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, boxShadow: v("--c-shadow-card") }}
            >
              <h3
                className="font-['Poppins',sans-serif] font-semibold text-lg mb-4 pb-3"
                style={{ color: v("--c-text"), borderBottom: `2px solid ${v("--c-border")}` }}
              >
                {spec.category}
              </h3>
              <div className="space-y-3">
                {spec.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <span className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-right" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl p-8 text-center"
          style={{ background: v("--c-gradient-r"), color: "#fff" }}
        >
          <Package size={40} className="mx-auto mb-4 opacity-90" />
          <h3 className="font-['Poppins',sans-serif] font-semibold text-xl mb-2">
            Mesin Siap Digunakan untuk Produksi
          </h3>
          <p className="text-sm opacity-90" style={{ fontFamily: "'Inter',sans-serif" }}>
            {device.name} telah dikalibrasi dan dirawat secara berkala untuk memastikan performa
            optimal dalam setiap proses produksi Anda.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MesinDetailPage() {
  const { slug }    = useParams<{ slug: string }>();
  const navigate    = useNavigate();

  const [device,  setDevice]  = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    // Fetch semua devices lalu cari by id (slug = id device)
    fetch(`${API_BASE}/devices`)
      .then(r => {
        if (!r.ok) throw new Error(`Gagal memuat data (${r.status})`);
        return r.json();
      })
      .then((json: Device[] | { data: Device[] }) => {
        const list: Device[] = Array.isArray(json) ? json : (json as any).data ?? [];

        // Cari by id (slug = string id) atau by name-slug
        const found =
          list.find(d => String(d.id) === slug) ??
          list.find(d => d.name.toLowerCase().replace(/\s+/g, "-") === slug);

        if (!found) {
          setError("Perangkat tidak ditemukan.");
        } else {
          setDevice(found);
        }
        setLoading(false);
      })
      .catch((e: any) => {
        setError(e.message ?? "Gagal memuat perangkat.");
        setLoading(false);
      });
  }, [slug]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: v("--c-bg") }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: v("--c-primary") }} />
          <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Memuat perangkat…
          </p>
        </div>
      </div>
    );
  }

  // ── Error / not found ──
  if (error || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: v("--c-bg") }}>
        <div className="text-center px-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.08)" }}
          >
            <AlertCircle size={36} color="#EF4444" />
          </div>
          <h2
            className="font-['Poppins',sans-serif] font-bold text-2xl mb-2"
            style={{ color: v("--c-text") }}
          >
            {error ?? "Perangkat Tidak Ditemukan"}
          </h2>
          <p className="text-sm mb-6" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            Perangkat yang Anda cari tidak ada dalam sistem atau sudah tidak aktif.
          </p>
          <button
            onClick={() => navigate("/perangkat")}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
          >
            Kembali ke Perangkat
          </button>
        </div>
      </div>
    );
  }

  const specs = buildSpecs(device);

  return (
    <>
      <MesinDetailHero device={device} />
      <SpecificationsSection specs={specs} device={device} />
    </>
  );
}