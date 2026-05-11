import { createBrowserRouter } from "react-router";

/* ── Layouts ─────────────────────────────────────────────────── */
import { Layout }          from "./components/Layout";
import { AuthLayout }      from "./components/AuthLayout";
import { AdminLayout }     from "./components/AdminLayout";
import { OperatorLayout }  from "./components/OperatorLayout";

/* ── Public / Customer Pages ─────────────────────────────────── */
import { CustomerHome }       from "./pages/customer/CustomerHome";
import { ProdukDetailPage }   from "./pages/customer/ProdukDetailPage";
import { KeranjangPage }      from "./pages/customer/KeranjangPage";
import { CheckoutPage }       from "./pages/customer/CheckoutPage";
import { PesananPage }        from "./pages/customer/PesananPage";
import { PesananDetailPage }  from "./pages/customer/PesananDetailPage";
import { CustomerProfilPage } from "./pages/customer/CustomerProfilPage";
import { PengaturanPage }     from "./pages/customer/PengaturanPage";

/* ── Existing public pages ───────────────────────────────────── */
import { ProfilePage }   from "./pages/ProfilePage";
import { ProdukPage }    from "./pages/ProdukPage";
import { JasaSewaPage }  from "./pages/JasaSewaPage";
import { PerangkatPage } from "./pages/PerangkatPage";
import { MesinDetailPage } from "./pages/MesinDetailPage";
import { DroneDetailPage } from "./pages/DroneDetailPage";
import { PortfolioPage } from "./pages/PortfolioPage";

/* ── Auth Pages ──────────────────────────────────────────────── */
import { LoginPage }    from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

/* ── Operator Pages ──────────────────────────────────────────── */
import { OperatorDashboard }     from "./pages/operator/OperatorDashboard";
import { OperatorAntrian }       from "./pages/operator/OperatorAntrian";
import { OperatorPesananDetail } from "./pages/operator/OperatorPesananDetail";
import { OperatorKalender }      from "./pages/operator/OperatorKalender";

/* ── Admin Pages ─────────────────────────────────────────────── */
import { AdminDashboard }  from "./pages/admin/AdminDashboard";
import { AdminPesanan }    from "./pages/admin/AdminPesanan";
import { AdminProduk }     from "./pages/admin/AdminProduk";
import { AdminPengguna }   from "./pages/admin/AdminPengguna";
import { AdminKeuangan }   from "./pages/admin/AdminKeuangan";
import { AdminLaporan }    from "./pages/admin/AdminLaporan";
import { AdminPengaturan } from "./pages/admin/AdminPengaturan";
import { AdminInventaris } from "./pages/admin/AdminInventaris";

/* ── Simple 404 ──────────────────────────────────────────────── */
function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 theme-aware"
      style={{ background: "var(--c-bg)", fontFamily: "'Inter',sans-serif" }}
    >
      <div style={{ fontSize: 80 }}>🔍</div>
      <div className="text-center">
        <p
          className="font-['Poppins',sans-serif] font-bold mb-2"
          style={{ fontSize: "2rem", color: "var(--c-text)" }}
        >
          Halaman Tidak Ditemukan
        </p>
        <p className="text-base" style={{ color: "var(--c-text-sec)" }}>
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
      </div>
      <a
        href="/"
        className="px-7 py-3 rounded-xl font-semibold text-sm text-white"
        style={{ background: "linear-gradient(135deg, #1E3A5F, #3B6FD4)" }}
      >
        ← Kembali ke Beranda
      </a>
    </div>
  );
}

/* ── Router ──────────────────────────────────────────────────── */
export const router = createBrowserRouter([

  /* ─── Auth — pathless layout route (no path → no URL impact) ─ */
  {
    Component: AuthLayout,
    children: [
      { path: "/login",    Component: LoginPage },
      { path: "/register", Component: RegisterPage },
    ],
  },

  /* ─── Public / Customer (AppNavbar + AppFooter) ───────────── */
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true,          Component: CustomerHome },
      { path: "profile",      Component: ProfilePage },
      { path: "produk",       Component: ProdukPage },
      { path: "produk/:slug", Component: ProdukDetailPage },
      { path: "jasa-sewa",    Component: JasaSewaPage },
      { path: "perangkat",   Component: PerangkatPage },
      { path: "perangkat/mesin/:slug",  Component: MesinDetailPage },
      { path: "perangkat/drone/:slug",  Component: DroneDetailPage },
      { path: "portfolio",    Component: PortfolioPage },
      { path: "keranjang",    Component: KeranjangPage },
      { path: "checkout",     Component: CheckoutPage },
      { path: "pesanan",      Component: PesananPage },
      { path: "pesanan/:id",  Component: PesananDetailPage },
      { path: "profil",       Component: CustomerProfilPage },
      { path: "pengaturan",   Component: PengaturanPage },
    ],
  },

  /* ─── Operator ─────────────────────────────────────────────── */
  {
    path: "/operator",
    Component: OperatorLayout,
    children: [
      { index: true,         Component: OperatorDashboard },
      { path: "antrian",     Component: OperatorAntrian },
      { path: "pesanan/:id", Component: OperatorPesananDetail },
      { path: "kalender",    Component: OperatorKalender },
    ],
  },

  /* ─── Admin ────────────────────────────────────────────────── */
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true,        Component: AdminDashboard },
      { path: "pesanan",    Component: AdminPesanan },
      { path: "produk",     Component: AdminProduk },
      { path: "perangkat", Component: AdminInventaris },
      { path: "pengguna",   Component: AdminPengguna },
      { path: "keuangan",   Component: AdminKeuangan },
      { path: "laporan",    Component: AdminLaporan },
      { path: "pengaturan", Component: AdminPengaturan },
    ],
  },

  /* ─── 404 ──────────────────────────────────────────────────── */
  { path: "*", Component: NotFound },
]);