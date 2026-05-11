import { motion } from "motion/react";
import {
  Phone, MapPin, Clock, Instagram, Youtube, Facebook,
  MessageCircle,
} from "lucide-react";
import { v } from "./pageUtils";
import logoImg from "figma:asset/cfad863fc3fac009c98531916297fd32e15715b6.png";

const FOOTER_COLS = [
  {
    title: "Kantor & Edukasi",
    items: ["Kop Surat", "Amplop Perusahaan", "Nota / Invoice", "Company Profile", "Map Folder", "Buku / Modul", "Kalender Meja", "Stempel"],
  },
  {
    title: "Kemasan & Branding",
    items: ["Packaging Box", "Paper Bag", "Label Produk", "Stiker / Hologram", "Sleeve Cup", "Kemasan Makanan", "Hang Tag", "Segel Produk"],
  },
  {
    title: "Undangan & Acara",
    items: ["Undangan Pernikahan", "Undangan Ulang Tahun", "Undangan Formal", "Sertifikat", "Tiket Acara", "ID Card / Name Tag", "Souvenir Cetak"],
  },
  {
    title: "Promosi & Marketing",
    items: ["Brosur / Leaflet", "Flyer", "Poster", "Banner & X-Banner", "Spanduk", "Kartu Nama", "Kalender", "Voucher / Kupon"],
  },
];

export function AppFooter() {
  const socials = [
    { Icon: Instagram,     href: "https://instagram.com/", label: "Instagram" },
    { Icon: Facebook,      href: "#",                      label: "Facebook" },
    { Icon: Youtube,       href: "#",                      label: "YouTube" },
    { Icon: MessageCircle, href: "https://wa.me/081234567890", label: "WhatsApp" },
  ];

  const contact = [
    { Icon: Phone,  text: "081234567890" },
    { Icon: MapPin, text: "Reuleut Tim., Kec. Muara Batu, Kab. Aceh Utara" },
    { Icon: Clock,  text: "Senin - Sabtu: Pukul 08:00-17:00 WIB" },
  ];

  return (
    <footer
      className="pt-16 pb-8 transition-colors duration-300"
      style={{ background: v("--c-footer-bg") }}
    >
      {/* Gradient line top */}
      <div className="h-px mb-16" style={{ background: v("--c-gradient-r") }} />

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div
          className="grid md:grid-cols-5 gap-12 pb-14"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src={logoImg}
                alt="Malikussaleh Advertising"
                className="w-16 h-16 object-contain"
              />
            </div>
            <p
              className="text-xs text-white/55 leading-relaxed mb-6"
              style={{ fontFamily: "'Inter',sans-serif" }}
            >
              Solusi cetak premium untuk individu dan bisnis di Aceh Utara. Universitas Malikussaleh.
            </p>

            {/* Contact */}
            <div className="flex flex-col gap-3 mb-6">
              {contact.map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-2">
                  <Icon
                    size={12}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: v("--c-accent") }}
                  />
                  <p
                    className="text-xs text-white/55"
                    style={{ fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {socials.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = v("--c-accent");
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(46,125,50,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  title={label}
                >
                  <Icon size={13} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col, ci) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.1 }}
            >
              <p
                className="text-xs font-bold mb-5 tracking-widest uppercase"
                style={{ color: v("--c-accent"), fontFamily: "'Inter',sans-serif" }}
              >
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs transition-colors duration-200"
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: "'Inter',sans-serif",
                        lineHeight: 1.6,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = v("--c-accent"))
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")
                      }
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35" style={{ fontFamily: "'Inter',sans-serif" }}>
            © 2025 Malikussaleh Advertising — All Rights Reserved
          </p>
          <p className="text-xs text-white/25 font-['Poppins',sans-serif] italic">
            Quality. Precision. Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}