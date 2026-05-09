import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, X, ZoomIn, ChevronLeft, ChevronRight,
  Image as ImageIcon, Trash2, ChevronRight as BreadcrumbArrow, Lock,
  Camera, Search, ShoppingBag,
} from "lucide-react";
import { v, CTASection } from "../components/pageUtils";

/* ── Role helper ─────────────────────────────────────────────── */
function useRole() {
  const role = localStorage.getItem("ma_role") ?? "customer";
  const isStaff = role === "operator" || role === "admin";
  return { role, isStaff };
}

/* ── Default sample portfolio images ─────────────────────────── */
const SAMPLE_IMAGES = [
  {
    id: "s1",
    url: "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwcG9ydGZvbGlvJTIwcHJpbnQlMjBicmFuZGluZ3xlbnwxfHx8fDE3NzE5MjI3OTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Desain Branding",
    isDefault: true,
  },
  {
    id: "s2",
    url: "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNhcmQlMjBkZXNpZ24lMjBwcmludCUyMG1vY2t1cHxlbnwxfHx8fDE3NzE5MjI3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Kartu Nama Premium",
    isDefault: true,
  },
  {
    id: "s3",
    url: "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5uZXIlMjBwcmludGluZyUyMGxhcmdlJTIwZm9ybWF0JTIwc2lnbmFnZXxlbnwxfHx8fDE3NzE5MjI3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Spanduk & Banner",
    isDefault: true,
  },
  {
    id: "s4",
    url: "https://images.unsplash.com/photo-1746422029285-e81d6650f17f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWNrYWdpbmclMjBib3glMjBkZXNpZ24lMjBicmFuZGluZyUyMHByZW1pdW18ZW58MXx8fHwxNzcxOTIyNzk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Kemasan Premium",
    isDefault: true,
  },
  {
    id: "s5",
    url: "https://images.unsplash.com/photo-1763627719014-0ea46e97a5d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBtZXJjaGFuZGlzZSUyMHNvdXZlbmlyJTIwbXVnJTIwcHJpbnR8ZW58MXx8fHwxNzcxOTIyNzk3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Souvenir Custom",
    isDefault: true,
  },
  {
    id: "s6",
    url: "https://images.unsplash.com/photo-1739909198159-a834175bd911?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwaW52aXRhdGlvbiUyMHByaW50aW5nJTIwZWxlZ2FudCUyMGRlc2lnbnxlbnwxfHx8fDE3NzE5MjI3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Undangan Eksklusif",
    isDefault: true,
  },
  {
    id: "s7",
    url: "https://images.unsplash.com/photo-1581508512961-0e3b9524db40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwcmVtaXVtJTIwcHJpbnRpbmclMjBwcmVzcyUyMG1hY2hpbmVyeXxlbnwxfHx8fDE3NzE4MTQ2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Mesin Cetak Premium",
    isDefault: true,
  },
  {
    id: "s8",
    url: "https://images.unsplash.com/photo-1759563874678-844afcc582b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V2ZW5pciUyMGdpZnQlMjBwYWNrYWdpbmclMjBlbGVnYW50JTIwbHV4dXJ5fGVufDF8fHx8MTc3MTgxNDYyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Gift & Souvenir",
    isDefault: true,
  },
];

interface GalleryImage {
  id: string;
  url: string;
  label: string;
  isDefault?: boolean;
}

/* ── Lightbox ─────────────────────────────────────────────────── */
function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[index];
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {/* Prev */}
      {index > 0 && (
        <button
          className="absolute left-4 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next */}
      {index < images.length - 1 && (
        <button
          className="absolute right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={index}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-4xl max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.url}
          alt={img.label}
          className="max-w-full max-h-[80vh] object-contain rounded-xl"
          style={{ boxShadow: "0 0 60px rgba(0,0,0,0.6)" }}
        />
        <p
          className="text-center mt-3 text-sm text-white/70"
          style={{ fontFamily: "'Inter',sans-serif" }}
        >
          {img.label}
          <span className="ml-3 text-white/40">
            {index + 1} / {images.length}
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ── Upload Zone ─────────────────────────────────────────────── */
function UploadZone({
  onFiles,
  isDragging,
  onDragEnter,
  onDragLeave,
}: {
  onFiles: (files: FileList) => void;
  isDragging: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragLeave();
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragEnter(); }}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
      style={{
        border: `2px dashed ${isDragging ? v("--c-primary") : v("--c-border")}`,
        background: isDragging ? "rgba(46,125,50,0.06)" : v("--c-bg-sec"),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />

      <motion.div
        animate={{ scale: isDragging ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{
          background: isDragging ? v("--c-gradient-r") : v("--c-card"),
          border: `1px solid ${v("--c-border")}`,
        }}
      >
        <Upload
          size={24}
          style={{ color: isDragging ? "#fff" : v("--c-primary") }}
        />
      </motion.div>

      <p
        className="font-semibold mb-1"
        style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
      >
        {isDragging ? "Lepaskan untuk Upload" : "Upload Gambar Portfolio"}
      </p>
      <p
        className="text-sm"
        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
      >
        Drag & drop gambar ke sini, atau{" "}
        <span style={{ color: v("--c-primary"), fontWeight: 600 }}>
          klik untuk memilih file
        </span>
      </p>
      <p
        className="text-xs mt-2"
        style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
      >
        Mendukung: JPG, PNG, GIF, WebP — Bisa upload banyak file sekaligus
      </p>
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────────────── */
export function PortfolioPage() {
  const [images, setImages]           = useState<GalleryImage[]>(SAMPLE_IMAGES);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const { isStaff } = useRole();

  const handleFiles = useCallback((files: FileList) => {
    const newImages: GalleryImage[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      newImages.push({
        id: `upload-${Date.now()}-${Math.random()}`,
        url,
        label: file.name.replace(/\.[^.]+$/, ""),
        isDefault: false,
      });
    });
    setImages((prev) => [...newImages, ...prev]);
  }, []);

  const deleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (lightboxIdx !== null) setLightboxIdx(null);
  };

  const openLightbox = (index: number) => setLightboxIdx(index);
  const closeLightbox = () => setLightboxIdx(null);
  const prevLightbox = () =>
    setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  const nextLightbox = () =>
    setLightboxIdx((i) =>
      i !== null && i < images.length - 1 ? i + 1 : i
    );

  return (
    <div style={{ color: v("--c-text") }}>
      {/* Hero */}
      <section
        className="relative pt-28 pb-16 overflow-hidden"
        style={{ minHeight: 340 }}
      >
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
        <div className="relative max-w-7xl mx-auto px-5 md:px-10 text-center">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-xs mb-6"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            <a href="/" style={{ color: "rgba(255,255,255,0.5)" }}>Home</a>
            <BreadcrumbArrow size={12} />
            <span style={{ color: v("--c-accent") }}>Portfolio</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-['Poppins',sans-serif] font-bold text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", lineHeight: 1.1 }}
          >
            Galeri{" "}
            <span
              style={{
                background: "linear-gradient(to right, #FDD835, #FFB300)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Portfolio
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 max-w-xl mx-auto text-base"
            style={{
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              fontFamily: "'Inter',sans-serif",
            }}
          >
            Kumpulan karya terbaik kami — dari desain branding, cetak banner,
            packaging premium, hingga souvenir eksklusif.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center gap-10"
          >
            <div className="text-center">
              <p
                className="font-['Poppins',sans-serif] font-bold text-2xl"
                style={{
                  background: "var(--c-gradient-r)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {images.length}
              </p>
              <p className="text-xs text-white/55" style={{ fontFamily: "'Inter',sans-serif" }}>
                Total Karya
              </p>
            </div>
            <div className="text-center">
              <p
                className="font-['Poppins',sans-serif] font-bold text-2xl"
                style={{
                  background: "var(--c-gradient-r)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {images.filter((i) => !i.isDefault).length}
              </p>
              <p className="text-xs text-white/55" style={{ fontFamily: "'Inter',sans-serif" }}>
                Baru Diupload
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section
        className="py-16 theme-aware"
        style={{ background: v("--c-bg") }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          {/* Upload area — operator / admin only */}
          {isStaff ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-3xl p-6 md:p-8"
            style={{
              background: v("--c-card"),
              border: `1px solid ${v("--c-border")}`,
              boxShadow: v("--c-shadow-card"),
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: v("--c-gradient-r") }}
              >
                <ImageIcon size={16} className="text-white" />
              </div>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                >
                  Upload Karya Portfolio
                </p>
                <p
                  className="text-xs"
                  style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                >
                  Area khusus operator — tambahkan gambar hasil karya terbaru
                </p>
              </div>
            </div>

            <UploadZone
              onFiles={handleFiles}
              isDragging={isDragging}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            />
          </motion.div>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-2xl px-6 py-4 flex items-center gap-3"
            style={{
              background: "rgba(46,125,50,0.07)",
              border: "1.5px solid rgba(46,125,50,0.18)",
            }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(46,125,50,0.12)" }}>
              <Lock size={14} style={{ color: v("--c-primary") }} />
            </div>
            <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
              Upload gambar hanya tersedia untuk <span style={{ color: v("--c-primary"), fontWeight: 600 }}>Operator</span> dan <span style={{ color: v("--c-primary"), fontWeight: 600 }}>Admin</span>. Anda dapat menikmati galeri karya terbaik kami di bawah.
            </p>
          </motion.div>
          )}

          {/* Gallery header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="font-['Poppins',sans-serif] font-bold"
                style={{
                  fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                  color: v("--c-text"),
                }}
              >
                Semua Karya{" "}
                <span
                  style={{
                    background: v("--c-gradient-r"),
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ({images.length})
                </span>
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
              >
                Klik gambar untuk melihat lebih besar
              </p>
            </div>
          </div>

          {/* Gallery grid */}
          {images.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}
              >
                <ImageIcon size={30} style={{ color: v("--c-text-sec") }} />
              </div>
              <p
                className="font-semibold mb-1"
                style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
              >
                Belum ada gambar
              </p>
              <p
                className="text-sm"
                style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
              >
                Upload gambar portfolio pertama Anda di atas
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4"
              style={{ columnGap: "1rem" }}
            >
              <AnimatePresence>
                {images.map((img, i) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.3, delay: i < 12 ? (i % 4) * 0.06 : 0 }}
                    className="relative group mb-4 break-inside-avoid rounded-xl overflow-hidden cursor-pointer"
                    style={{
                      boxShadow: v("--c-shadow-card"),
                      border: `1px solid ${v("--c-border")}`,
                    }}
                    onClick={() => openLightbox(i)}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ display: "block" }}
                    />

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent)",
                      }}
                    >
                      {/* Delete button — staff only */}
                      <div className="flex justify-end">
                        {isStaff && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(img.id);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(239,68,68,0.85)", color: "#fff" }}
                          title="Hapus gambar"
                        >
                          <Trash2 size={13} />
                        </motion.button>
                        )}
                      </div>

                      {/* Label & zoom */}
                      <div className="flex items-end justify-between">
                        <p
                          className="text-white text-xs font-medium flex-1 mr-2"
                          style={{ fontFamily: "'Inter',sans-serif", lineHeight: 1.4 }}
                        >
                          {img.label}
                          {!img.isDefault && (
                            <span
                              className="block text-white/60 text-xs mt-0.5"
                              style={{ fontFamily: "'Inter',sans-serif" }}
                            >
                              Baru diupload
                            </span>
                          )}
                        </p>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.15)" }}
                        >
                          <ZoomIn size={13} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid md:grid-cols-3 gap-5"
          >
            {(isStaff ? [
              { Icon: Camera,     title: "Upload Mudah",   desc: "Drag & drop atau klik tombol upload untuk menambahkan gambar portfolio baru." },
              { Icon: Search,     title: "Lihat Detail",   desc: "Klik gambar manapun untuk melihat tampilan penuh dengan navigasi antar foto." },
              { Icon: Trash2,     title: "Kelola Galeri",  desc: "Arahkan kursor ke gambar dan klik ikon hapus merah untuk menghapus foto." },
            ] : [
              { Icon: ImageIcon,  title: "Galeri Karya",   desc: "Temukan inspirasi dari berbagai karya cetak premium yang telah kami selesaikan." },
              { Icon: Search,     title: "Lihat Detail",   desc: "Klik gambar manapun untuk melihat tampilan penuh dengan navigasi antar foto." },
              { Icon: ShoppingBag,title: "Pesan Sekarang", desc: "Tertarik? Langsung pesan produk serupa melalui halaman katalog kami." },
            ] as const).map(({ Icon: TipIcon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl p-5 text-center"
                style={{
                  background: v("--c-card"),
                  border: `1px solid ${v("--c-border")}`,
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--c-gradient-r)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  <TipIcon size={20} className="text-white" aria-hidden="true" />
                </div>
                <p
                  className="font-semibold mb-1 text-sm"
                  style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                >
                  {title}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: v("--c-text-sec"),
                    lineHeight: 1.7,
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <CTASection />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            images={images}
            index={lightboxIdx}
            onClose={closeLightbox}
            onPrev={prevLightbox}
            onNext={nextLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}