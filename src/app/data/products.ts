/* ══════════════════════════════════════════════════════════════
   SHARED PRODUCT CATALOG — digunakan oleh ProdukPage,
   ProdukDetailPage, dan CheckoutPage
══════════════════════════════════════════════════════════════ */

export type ProductCategory =
  | "Kantor & Imigrasi"
  | "Promosi & Marketing"
  | "Souvenir"
  | "Kemasan & Branding"
  | "Undangan & Acara";

export type CheckoutCategory =
  | "banner" | "cetak" | "souvenir" | "packaging" | "undangan" | "finishing";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  description: string;
  longDesc: string;
  minPrice: string;
  unit: string;
  stock: number;
  highlight?: boolean;
  checkoutCat: CheckoutCategory;
  checkoutProductId: string;
}

/* ── Shared image URLs ───────────────────────────────────────── */
export const IMG_CARD      = "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_BANNER    = "https://images.unsplash.com/photo-1698319298199-b81a54ced28a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_PACKAGING = "https://images.unsplash.com/photo-1746422029285-e81d6650f17f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_SOUVENIR  = "https://images.unsplash.com/photo-1759563874678-844afcc582b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_MUG       = "https://images.unsplash.com/photo-1763627719014-0ea46e97a5d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_WEDDING   = "https://images.unsplash.com/photo-1739909198159-a834175bd911?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_PORTFOLIO = "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_EQUIP     = "https://images.unsplash.com/photo-1630327722923-5ebd594ddda9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
export const IMG_KAOS      = "https://images.unsplash.com/photo-1503341504253-dff4815485f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export const PRODUCTS: Product[] = [
  /* ── Kantor & Imigrasi ── */
  {
    id: "kartu-nama",
    name: "Kartu Nama",
    category: "Kantor & Imigrasi",
    image: IMG_CARD,
    description: "Kartu nama profesional dengan berbagai pilihan kertas premium.",
    longDesc: "Kartu nama profesional kami dicetak dengan kualitas tinggi menggunakan teknologi offset dan digital printing. Tersedia pilihan bahan Art Carton 260gsm, Ivory 230gsm, atau Soft Touch. Finishing meliputi laminasi glossy, doff, dan spot UV untuk kesan premium.",
    minPrice: "Rp 35.000",
    unit: "/ 100 lembar",
    stock: 250,
    highlight: true,
    checkoutCat: "cetak",
    checkoutProductId: "c2",
  },
  {
    id: "brosur",
    name: "Brosur / Leaflet",
    category: "Kantor & Imigrasi",
    image: IMG_PORTFOLIO,
    description: "Brosur dan leaflet full-color berkualitas tinggi untuk promosi bisnis.",
    longDesc: "Brosur dan leaflet full-color dengan kualitas cetak 1200 DPI. Tersedia dalam ukuran A4, A5, hingga DL (1/3 A4). Pilihan bahan Art Paper 100-150gsm dengan finishing laminasi atau tanpa finishing sesuai kebutuhan.",
    minPrice: "Rp 250.000",
    unit: "/ 100 lembar",
    stock: 180,
    checkoutCat: "cetak",
    checkoutProductId: "c1",
  },
  {
    id: "poster",
    name: "Poster",
    category: "Kantor & Imigrasi",
    image: IMG_CARD,
    description: "Poster promosi dengan warna cerah dan tajam, ukuran A4 hingga A0.",
    longDesc: "Poster promosi dan informasi dicetak dengan warna vivid dan tajam menggunakan teknologi digital printing resolusi tinggi. Tersedia ukuran A4 hingga A0. Bahan Art Paper 150gsm atau Sticker Vinyl untuk poster outdoor.",
    minPrice: "Rp 15.000",
    unit: "/ lembar",
    stock: 320,
    checkoutCat: "cetak",
    checkoutProductId: "c3",
  },
  {
    id: "stiker",
    name: "Stiker Custom",
    category: "Kantor & Imigrasi",
    image: IMG_PACKAGING,
    description: "Stiker vinyl tahan air untuk branding produk dan promosi.",
    longDesc: "Stiker vinyl berkualitas tinggi tahan air, tahan sinar UV, dan tahan lama. Cocok untuk branding produk, stiker motor, laptop, dan promosi. Bisa cetak per lembar atau per potong (cutting). Pilihan bahan vinyl matte, glossy, atau transparan.",
    minPrice: "Rp 5.000",
    unit: "/ lembar",
    stock: 450,
    checkoutCat: "cetak",
    checkoutProductId: "c1",
  },

  /* ── Promosi & Marketing ── */
  {
    id: "spanduk",
    name: "Spanduk",
    category: "Promosi & Marketing",
    image: IMG_BANNER,
    description: "Spanduk outdoor/indoor berkualitas tinggi dengan bahan flexi korea.",
    longDesc: "Spanduk outdoor/indoor berkualitas tinggi dicetak dengan teknologi eco-solvent printing. Bahan Flexi Korea 440gsm tahan cuaca, warna vivid, dan tahan lama. Tersedia berbagai ukuran custom dengan finishing mata ayam dan tali.",
    minPrice: "Rp 20.000",
    unit: "/ m²",
    stock: 120,
    highlight: true,
    checkoutCat: "banner",
    checkoutProductId: "b2",
  },
  {
    id: "x-banner",
    name: "X-Banner",
    category: "Promosi & Marketing",
    image: IMG_BANNER,
    description: "X-banner siap pakai dengan rangka gratis, ukuran standar atau custom.",
    longDesc: "X-banner siap pakai untuk event, pameran, dan promosi toko. Termasuk rangka aluminium gratis. Tersedia ukuran standar 60×160cm atau 80×180cm. Bahan vinyl 340gsm dengan printing full color berkualitas tinggi.",
    minPrice: "Rp 45.000",
    unit: "/ pcs",
    stock: 85,
    checkoutCat: "banner",
    checkoutProductId: "b3",
  },
  {
    id: "roll-banner",
    name: "Roll Up Banner",
    category: "Promosi & Marketing",
    image: IMG_BANNER,
    description: "Roll-up banner premium untuk pameran dan event, mudah dipasang.",
    longDesc: "Roll-up banner premium dengan rangka stainless steel atau aluminium berkualitas. Mudah dipasang, ringkas saat disimpan, dan tahan lama. Dilengkapi tas/kantong penyimpanan. Ukuran 85×200cm atau custom. Material vinyl 340gsm atau premium 440gsm.",
    minPrice: "Rp 250.000",
    unit: "/ pcs",
    stock: 65,
    checkoutCat: "banner",
    checkoutProductId: "b1",
  },
  {
    id: "backdrop",
    name: "Backdrop",
    category: "Promosi & Marketing",
    image: IMG_BANNER,
    description: "Backdrop foto dan event dengan ukuran custom, material kain atau flexi.",
    longDesc: "Backdrop foto dan event dengan ukuran custom sesuai kebutuhan. Tersedia material kain (sublimasi) untuk tampilan premium, atau flexi korea untuk harga terjangkau. Finishing rapi dengan jahitan tepi dan kantong tiang.",
    minPrice: "Rp 150.000",
    unit: "/ m²",
    stock: 95,
    checkoutCat: "banner",
    checkoutProductId: "b1",
  },

  /* ── Souvenir ── */
  {
    id: "mug",
    name: "Mug Custom",
    category: "Souvenir",
    image: IMG_MUG,
    description: "Mug ceramic sublimasi dengan desain custom, cocok untuk souvenir.",
    longDesc: "Mug ceramic dengan coating sublimasi berkualitas tinggi. Desain full color, tahan dicuci, tidak mudah pudar. Kapasitas 11oz (330ml) atau 15oz (450ml). Cocok untuk souvenir pernikahan, ulang tahun, merchandise perusahaan, dan hadiah.",
    minPrice: "Rp 25.000",
    unit: "/ pcs",
    stock: 200,
    highlight: true,
    checkoutCat: "souvenir",
    checkoutProductId: "s1",
  },
  {
    id: "kaos",
    name: "Kaos / T-Shirt",
    category: "Souvenir",
    image: IMG_KAOS,
    description: "Kaos custom DTF atau sablon dengan bahan combed 24s/30s.",
    longDesc: "Kaos custom menggunakan teknologi DTF (Direct to Film) atau sablon manual. Bahan Cotton Combed 24s (reguler) atau 30s (premium). Tersedia berbagai warna. Ukuran S hingga XXXL. Cocok untuk seragam, souvenir event, dan merchandise.",
    minPrice: "Rp 45.000",
    unit: "/ pcs",
    stock: 350,
    checkoutCat: "souvenir",
    checkoutProductId: "s1",
  },
  {
    id: "topi",
    name: "Topi Bordir",
    category: "Souvenir",
    image: IMG_SOUVENIR,
    description: "Topi baseball dengan bordir logo dan nama custom.",
    longDesc: "Topi baseball dengan bordir logo dan nama custom menggunakan mesin bordir komputer. Hasil bordir rapi, tebal, dan tahan lama. Bahan twill cotton atau ripstop. Tersedia dalam pilihan warna hitam, putih, merah, navy, dan abu-abu.",
    minPrice: "Rp 35.000",
    unit: "/ pcs",
    stock: 140,
    checkoutCat: "souvenir",
    checkoutProductId: "s3",
  },
  {
    id: "gantungan",
    name: "Gantungan Kunci",
    category: "Souvenir",
    image: IMG_SOUVENIR,
    description: "Gantungan kunci akrilik custom dengan foto/desain sesuai keinginan.",
    longDesc: "Gantungan kunci akrilik bening berkualitas dengan cetak full color. Tersedia bentuk standar (oval, kotak, hati) atau custom cutting. Ukuran 5cm, 6cm, atau 7cm. Cocok untuk souvenir pernikahan, ulang tahun, dan merchandise. Min. order 50 pcs.",
    minPrice: "Rp 8.000",
    unit: "/ pcs",
    stock: 280,
    checkoutCat: "souvenir",
    checkoutProductId: "s2",
  },

  /* ── Kemasan & Branding ── */
  {
    id: "paper-bag",
    name: "Paper Bag",
    category: "Kemasan & Branding",
    image: IMG_PACKAGING,
    description: "Paper bag premium dengan pilihan material, custom desain dan logo.",
    longDesc: "Paper bag premium dengan pilihan bahan kraft natural, art paper laminasi, atau coated board. Full color printing dengan finishing laminasi glossy atau doff. Tali PP, cotton, atau pita. Tersedia ukuran S, M, L, dan XL atau custom sesuai kebutuhan.",
    minPrice: "Rp 3.500",
    unit: "/ pcs",
    stock: 420,
    highlight: true,
    checkoutCat: "packaging",
    checkoutProductId: "p1",
  },
  {
    id: "box-kemasan",
    name: "Box Kemasan",
    category: "Kemasan & Branding",
    image: IMG_PACKAGING,
    description: "Box kemasan produk custom dengan desain dan full-color printing.",
    longDesc: "Box kemasan produk dengan bahan Ivory 230gsm, Art Carton 260gsm, atau Corrugated Board. Ukuran dan bentuk custom sesuai produk Anda. Full color printing dengan finishing laminasi, spot UV, atau embossing. Cocok untuk FMCG, makanan, dan retail.",
    minPrice: "Rp 5.000",
    unit: "/ pcs",
    stock: 310,
    checkoutCat: "packaging",
    checkoutProductId: "p2",
  },
  {
    id: "label",
    name: "Label Produk",
    category: "Kemasan & Branding",
    image: IMG_CARD,
    description: "Label stiker produk dengan desain profesional untuk UMKM.",
    longDesc: "Label stiker produk dicetak dengan kualitas tinggi pada bahan vinyl glossy, matte, atau transparan. Tahan air dan tahan minyak, cocok untuk produk makanan dan minuman. Tersedia bentuk standar atau custom die-cut. Min. order 100 lembar.",
    minPrice: "Rp 500",
    unit: "/ lembar",
    stock: 500,
    checkoutCat: "packaging",
    checkoutProductId: "p3",
  },
  {
    id: "sleeve-cup",
    name: "Sleeve Cup",
    category: "Kemasan & Branding",
    image: IMG_PACKAGING,
    description: "Sleeve cup paper untuk minuman dengan full-color printing.",
    longDesc: "Sleeve cup paper untuk gelas minuman ukuran 12oz, 16oz, atau 22oz. Bahan craft paper food grade dengan full color printing. Cocok untuk cafe, kedai kopi, dan bisnis minuman. Min. order 100 pcs untuk 1 desain.",
    minPrice: "Rp 1.500",
    unit: "/ pcs",
    stock: 380,
    checkoutCat: "packaging",
    checkoutProductId: "p1",
  },

  /* ── Undangan & Acara ── */
  {
    id: "undangan-nik",
    name: "Undangan Pernikahan",
    category: "Undangan & Acara",
    image: IMG_WEDDING,
    description: "Undangan pernikahan premium dengan desain elegan dan eksklusif.",
    longDesc: "Undangan pernikahan premium dengan pilihan desain elegan yang bisa dikustomisasi. Tersedia berbagai pilihan: soft cover (Art Carton 260gsm), hard cover, hingga undangan eksklusif dengan amplop linen. Finishing bisa disertai hot foil, embossing, atau spot UV.",
    minPrice: "Rp 3.500",
    unit: "/ pcs",
    stock: 175,
    highlight: true,
    checkoutCat: "undangan",
    checkoutProductId: "u1",
  },
  {
    id: "undangan-ul",
    name: "Undangan Ulang Tahun",
    category: "Undangan & Acara",
    image: IMG_WEDDING,
    description: "Undangan ulang tahun anak hingga dewasa dengan desain colorful.",
    longDesc: "Undangan ulang tahun anak-anak hingga dewasa dengan desain colorful dan menarik. Tersedia dalam format lipat 4 (A4→A5), lipat 2 (A5→A6), atau kartu standar. Bahan Art Carton 260gsm dengan laminating glossy. Min. order 50 pcs.",
    minPrice: "Rp 2.000",
    unit: "/ pcs",
    stock: 220,
    checkoutCat: "undangan",
    checkoutProductId: "u2",
  },
  {
    id: "sertifikat",
    name: "Sertifikat",
    category: "Undangan & Acara",
    image: IMG_PORTFOLIO,
    description: "Sertifikat event dan pelatihan dengan desain profesional.",
    longDesc: "Sertifikat event, pelatihan, dan penghargaan dengan desain profesional dan bahan kertas premium. Pilihan bahan Concorde 120gsm, Ivory 230gsm, atau Art Paper 150gsm. Tersedia dengan atau tanpa map sertifikat. Bisa disertai stempel emboss atau hot foil.",
    minPrice: "Rp 5.000",
    unit: "/ lembar",
    stock: 190,
    checkoutCat: "finishing",
    checkoutProductId: "f1",
  },
  {
    id: "id-card",
    name: "ID Card / Name Tag",
    category: "Undangan & Acara",
    image: IMG_EQUIP,
    description: "ID card dan name tag acara dengan laminasi, lubang gantung, dan lanyard.",
    longDesc: "ID card dan name tag acara dicetak full color dengan laminasi glossy atau doff. Bahan PVC atau Art Carton. Tersedia ukuran standar kartu nama (9×5.5cm) atau A6 (10×15cm). Dilengkapi lubang gantung dan bisa disertai lanyard atau clip pin.",
    minPrice: "Rp 3.000",
    unit: "/ pcs",
    stock: 260,
    checkoutCat: "finishing",
    checkoutProductId: "f2",
  },
];

/* ── Category list for filter ────────────────────────────── */
export const CATEGORIES = [
  "Semua",
  "Kantor & Imigrasi",
  "Promosi & Marketing",
  "Souvenir",
  "Kemasan & Branding",
  "Undangan & Acara",
] as const;

/* ── Spec options per checkout category ──────────────────── */
export interface SpecOptions {
  materials: string[];
  finishings: string[];
  sizes: { label: string; id: string; multiplier: number }[];
  unit: string;
  basePrice: number;
  priceNote: string;
}

export const SPEC_OPTIONS: Record<CheckoutCategory, SpecOptions> = {
  banner: {
    materials:  ["Flexi Korea 440gsm", "Flexi China 340gsm", "Vinyl Premium", "Backlit Film"],
    finishings: ["Standard (Mata Ayam)", "Laminasi Glossy", "Laminasi Doff", "Waterproof"],
    sizes: [
      { label: "60×160 cm",  id: "60x160",  multiplier: 0.96 },
      { label: "100×200 cm", id: "100x200", multiplier: 2.0  },
      { label: "150×300 cm", id: "150x300", multiplier: 4.5  },
      { label: "200×400 cm", id: "200x400", multiplier: 8.0  },
      { label: "Custom",     id: "custom",  multiplier: 1.0  },
    ],
    unit: "m²",
    basePrice: 20000,
    priceNote: "Harga per m² × jumlah lembar",
  },
  cetak: {
    materials:  ["Art Paper 150gsm", "Art Carton 260gsm", "Ivory 230gsm", "Concorde 120gsm"],
    finishings: ["Tanpa Finishing", "Laminasi Glossy", "Laminasi Doff", "Spot UV"],
    sizes: [
      { label: "A6 (10×15 cm)", id: "a6", multiplier: 1.0 },
      { label: "A5 (15×21 cm)", id: "a5", multiplier: 1.5 },
      { label: "A4 (21×30 cm)", id: "a4", multiplier: 2.0 },
      { label: "A3 (30×42 cm)", id: "a3", multiplier: 3.5 },
      { label: "Custom",        id: "custom", multiplier: 1.0 },
    ],
    unit: "lembar",
    basePrice: 800,
    priceNote: "Harga per lembar berdasarkan ukuran",
  },
  souvenir: {
    materials:  ["Material Standar", "Material Premium"],
    finishings: ["Tanpa Finishing", "Packaging Bubble Wrap", "Packaging Box"],
    sizes: [{ label: "Standar", id: "std", multiplier: 1.0 }],
    unit: "pcs",
    basePrice: 25000,
    priceNote: "Harga per pcs",
  },
  packaging: {
    materials:  ["Kraft Paper Natural", "Art Paper Laminasi", "Coated Board", "Corrugated Board"],
    finishings: ["Tanpa Finishing", "Laminasi Glossy", "Laminasi Doff", "Spot UV + Embossing"],
    sizes: [
      { label: "Small (10×10 cm)",  id: "s", multiplier: 1.0 },
      { label: "Medium (20×20 cm)", id: "m", multiplier: 1.5 },
      { label: "Large (30×30 cm)",  id: "l", multiplier: 2.0 },
      { label: "Custom",            id: "custom", multiplier: 1.0 },
    ],
    unit: "pcs",
    basePrice: 3500,
    priceNote: "Harga per pcs berdasarkan ukuran",
  },
  undangan: {
    materials:  ["Art Carton 260gsm", "Ivory 230gsm", "Linen Premium", "Hard Cover"],
    finishings: ["Laminasi Glossy", "Laminasi Doff", "Hot Foil", "Embossing"],
    sizes: [
      { label: "Standar (10×21 cm)", id: "std", multiplier: 1.0 },
      { label: "Square (15×15 cm)",  id: "sqr", multiplier: 1.3 },
      { label: "Custom",             id: "custom", multiplier: 1.0 },
    ],
    unit: "pcs",
    basePrice: 3500,
    priceNote: "Harga per pcs",
  },
  finishing: {
    materials:  ["Art Carton 260gsm", "Art Paper 150gsm", "PVC Card", "Sticker Vinyl"],
    finishings: ["Laminasi Glossy", "Laminasi Doff", "Hot Foil Emas", "Spot UV"],
    sizes: [
      { label: "A6 (10×15 cm)", id: "a6", multiplier: 1.0 },
      { label: "A4 (21×30 cm)", id: "a4", multiplier: 2.0 },
      { label: "Custom",        id: "custom", multiplier: 1.0 },
    ],
    unit: "lembar",
    basePrice: 3000,
    priceNote: "Harga per lembar",
  },
};

/* ── Helper: look up product by slug ─────────────────────── */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.id === slug);
}

/* ── Helper: get gallery images for a product ────────────── */
export function getProductGallery(product: Product): string[] {
  return [product.image, IMG_PORTFOLIO, IMG_PACKAGING, product.image];
}