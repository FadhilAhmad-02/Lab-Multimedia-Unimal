import { motion } from "motion/react";
import { Layers, MessageCircle, ArrowRight } from "lucide-react";
import { OutlineFillButton } from "./ui/outline-fill-button";

export const v = (varName: string): string => `var(${varName})`;
export const cs = (...classes: string[]) => classes.filter(Boolean).join(" ");

export function Section({
  children,
  bg = "var(--c-bg)",
  className = "",
  id = "",
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cs(
        "py-20 md:py-28 transition-colors duration-300 theme-aware",
        className
      )}
      style={{ background: bg }}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  light = false,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  light?: boolean;
  align?: "center" | "left";
}) {
  return (
    <div className={`mb-14 ${align === "center" ? "text-center" : ""}`}>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
        style={{
          background: light ? "rgba(46,125,50,0.08)" : "rgba(46,125,50,0.12)",
          color: v("--c-primary"),
          border: `1px solid ${
            light ? "rgba(46,125,50,0.15)" : "rgba(46,125,50,0.2)"
          }`,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Layers size={12} />
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-['Poppins',sans-serif] font-bold"
        style={{
          fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
          lineHeight: 1.2,
          color: light ? "#0F172A" : v("--c-text"),
        }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 max-w-xl mx-auto text-base"
          style={{
            color: v("--c-text-sec"),
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.8,
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export function BtnPrimary({
  children,
  href = "#",
  className = "",
  onClick,
  type,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  if (type) {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={cs(
          "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white",
          "min-h-[44px] shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer",
          className
        )}
        style={{
          background: v("--c-gradient-r"),
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {children}
      </motion.button>
    );
  }
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cs(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white",
        "min-h-[44px] shadow-md hover:shadow-lg transition-shadow duration-200",
        className
      )}
      style={{
        background: v("--c-gradient-r"),
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </motion.a>
  );
}

export function BtnSecondary({
  children,
  href = "#",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cs(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm",
        "min-h-[44px] transition-all duration-200",
        className
      )}
      style={{
        border: `1.5px solid ${v("--c-primary")}`,
        color: v("--c-primary"),
        fontFamily: "'Inter', sans-serif",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "rgba(46,125,50,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </motion.a>
  );
}

/* ── CTA Section (Butuh Paket Custom?) ──────────────────────────── */
export function CTASection() {
  return (
    <section
      className="py-16 md:py-20 transition-colors duration-300 theme-aware"
      style={{ background: "var(--c-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #F9A825 100%)",
          }}
        >
          {/* SVG cross-pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter',sans-serif" }}
            >
              Butuh Paket Custom?
            </p>

            <h2
              className="font-['Poppins',sans-serif] font-bold text-white mb-4"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", lineHeight: 1.15 }}
            >
              Konsultasi Gratis{" "}
              <span
                style={{
                  background: "linear-gradient(to right, #FDD835, #FFB300)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                dengan Tim Kami
              </span>
            </h2>

            <p
              className="mb-8 max-w-lg mx-auto text-sm"
              style={{
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.85,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Diskusikan kebutuhan Anda dan dapatkan penawaran terbaik sesuai budget!
            </p>

            <OutlineFillButton
              direction="up"
              duration={0.35}
              baseBackground="#2E7D32"
              fillBackground="linear-gradient(to right, #FDD835, #FFB300)"
              borderValue="none"
              textColor="#ffffff"
              filledTextColor="#1B5E20"
              onClick={() =>
                window.open(
                  "https://wa.me/081234567890?text=Halo, saya ingin konsultasi paket jasa/sewa",
                  "_blank",
                )
              }
            >
              <MessageCircle size={16} />
              Hubungi via WhatsApp
              <ArrowRight size={14} />
            </OutlineFillButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}