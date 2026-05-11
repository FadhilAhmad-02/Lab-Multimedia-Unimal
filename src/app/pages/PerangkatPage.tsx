import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronRight, ChevronLeft, Settings, Plane } from "lucide-react";
import { v, Section, CTASection } from "../components/pageUtils";
import Slider from "react-slick";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Import CSS for slick-carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ── Data Mesin & Drone ───────────────────────────────────────── */
interface Machine {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const MACHINES: Machine[] = [
  {
    id: "M001",
    name: "Maxipro 350LF Label Cutting Sticker Machine with Camera",
    slug: "maxipro-label-cutting-350lf",
    image: "printing machine cutting sticker",
  },
  {
    id: "M002",
    name: "SG-RD350S Digital Creasing & Perforating Machine (A3 Electric)",
    slug: "sg-rd350s-paper-creasing",
    image: "paper creasing machine",
  },
  {
    id: "M003",
    name: "Double Head Industrial Stapler Machine (2 Head Stitching Machine)",
    slug: "maxipro-stapler-2-mata",
    image: "industrial stapler machine",
  },
  {
    id: "M004",
    name: "Innovatex Automatic Glue Book Binding Machine",
    slug: "innovatex-glue-binding",
    image: "book binding machine glue",
  },
  {
    id: "M005",
    name: "Business Card Slitter Machine (330 / 350 Series)",
    slug: "cardx-3305-slitter",
    image: "card slitter machine",
  },
  {
    id: "M006",
    name: "Champion FGK-330 Thermal Laminating Machine",
    slug: "champion-fgk330-laminating",
    image: "laminating machine industrial",
  },
  {
    id: "M007",
    name: "SENWEI SMFM-390E Automatic Thermal Laminating Machine",
    slug: "senwei-smfm390e-laminating",
    image: "professional laminating machine",
  },
  {
    id: "M008",
    name: "Epson SureColor SC-T7730D Large Format Printer",
    slug: "epson-surecolor-t7730d",
    image: "epson surecolor large format printer",
  },
  {
    id: "M009",
    name: "LIYU Maxima Large Format Eco-Solvent Printer (3.2 Meter Series)",
    slug: "liyu-maxima-dsp-30pl",
    image: "banner printing machine outdoor",
  },
  {
    id: "M010",
    name: "Canon imagePRESS V1000 Digital Production Printer",
    slug: "canon-imagepress-v1000",
    image: "canon imagepress digital press",
  },
  {
    id: "M011",
    name: "Canon imageRUNNER ADVANCE DX 4945i Multifunction Printer",
    slug: "canon-imagerunner-dx-4945i",
    image: "canon imagerunner multifunction printer",
  },
  {
    id: "M012",
    name: "Industrial Auto Feed Paper Shredder (75 Sheet Capacity Class)",
    slug: "zsa-auto-75-pencacah",
    image: "paper shredder industrial machine",
  },
  {
    id: "M013",
    name: "Mimaki UJF-6042 MkIIe UV Flatbed Printer",
    slug: "mimaki-ujf-6042mkiie",
    image: "mimaki uv flatbed printer",
  },
  {
    id: "M014",
    name: "Programmable Digital Paper Cutting Machine (460 Series)",
    slug: "innovatec-4609-digital-cutter",
    image: "digital paper cutting machine",
  },
];

interface Drone {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const DRONES: Drone[] = [
  {
    id: "D001",
    name: "DJI Mavic 3 Enterprise",
    slug: "dji-mavic-3-enterprise",
    image: "dji mavic 3 enterprise drone",
  },
  {
    id: "D002",
    name: "DJI Inspire 3",
    slug: "dji-inspire-3",
    image: "dji inspire 3 professional drone",
  },
];

/* ── Hero ─────────────────────────────────────────────────────── */
function PerangkatHero() {
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
          <span style={{ color: "#FFD54F" }}>Perangkat</span>
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
          <Settings size={12} />
          Perangkat Produksi
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-['Poppins',sans-serif] font-bold"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
        >
          <span
            style={{
              background: "linear-gradient(to right, #FDD835, #FFB300)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Perangkat
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
          Daftar lengkap mesin produksi dan drone profesional yang tersedia
          di Malikussaleh Advertising untuk menghasilkan produk berkualitas tinggi.
        </motion.p>
      </div>
    </section>
  );
}

/* ── Machine Slider ───────────────────────────────────────────── */
interface MachineSliderProps {
  items: Machine[] | Drone[];
  type: "machine" | "drone";
}

function MachineSlider({ items, type }: MachineSliderProps) {
  const sliderRef = useRef<Slider>(null);
  const navigate = useNavigate();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handlePrevious = () => {
    sliderRef.current?.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  const handleItemClick = (slug: string) => {
    if (type === "machine") {
      navigate(`/perangkat/mesin/${slug}`);
    } else {
      navigate(`/perangkat/drone/${slug}`);
    }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          onClick={handlePrevious}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
          style={{
            background: v("--c-card"),
            border: `1px solid ${v("--c-border")}`,
            color: v("--c-text"),
            boxShadow: v("--c-shadow-card"),
          }}
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
          style={{
            background: v("--c-gradient-r"),
            color: "#fff",
            boxShadow: v("--c-shadow-card"),
          }}
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slider */}
      <Slider ref={sliderRef} {...settings}>
        {items.map((item, i) => (
          <div key={item.id} className="px-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => handleItemClick(item.slug)}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{
                background: v("--c-card"),
                border: `1px solid ${v("--c-border")}`,
                boxShadow: v("--c-shadow-card"),
              }}
            >
              {/* Image with grayscale to color effect */}
              <div className="relative overflow-hidden" style={{ height: 240 }}>
                <ImageWithFallback
                  query={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                  style={{
                    filter: "grayscale(100%)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "grayscale(0%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "grayscale(100%)";
                  }}
                />

                {/* ID Badge */}
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    color: "#FFD54F",
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {item.id}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3
                  className="font-['Poppins',sans-serif] font-semibold text-sm line-clamp-2"
                  style={{ color: v("--c-text"), minHeight: 40 }}
                >
                  {item.name}
                </h3>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="mt-3 text-xs font-semibold flex items-center gap-1"
                  style={{ color: v("--c-primary") }}
                >
                  Lihat Detail
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

/* ── Main Content ─────────────────────────────────────────────── */
function PerangkatContent() {
  return (
    <Section>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Mesin Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #2E7D32, #66BB6A)",
              }}
            >
              <Settings size={24} style={{ color: "#fff" }} />
            </div>
            <div>
              <h2
                className="font-['Poppins',sans-serif] font-bold text-2xl md:text-3xl"
                style={{ color: v("--c-text") }}
              >
                Perangkat Mesin Produksi{" "}
                <span
                  style={{
                    background: v("--c-gradient-r"),
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Lengkap
                </span>
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
              >
                {MACHINES.length} mesin profesional untuk berbagai kebutuhan produksi
              </p>
            </div>
          </div>
          <MachineSlider items={MACHINES} type="machine" />
        </motion.div>

        {/* Drone Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #F9A825, #FFD54F)",
              }}
            >
              <Plane size={24} style={{ color: "#fff" }} />
            </div>
            <div>
              <h2
                className="font-['Poppins',sans-serif] font-bold text-2xl md:text-3xl"
                style={{ color: v("--c-text") }}
              >
                Perangkat{" "}
                <span
                  style={{
                    background: v("--c-gradient-r"),
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Drone
                </span>
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
              >
                {DRONES.length} drone profesional untuk aerial photography & videography
              </p>
            </div>
          </div>
          <MachineSlider items={DRONES} type="drone" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export function PerangkatPage() {
  return (
    <>
      <PerangkatHero />
      <PerangkatContent />
      <CTASection />
    </>
  );
}