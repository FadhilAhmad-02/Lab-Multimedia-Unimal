import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { NavLink, Link, useLocation, useNavigate } from "react-router";
import {
  Sun, Moon, Menu, X, MessageCircle, ShoppingCart, LogIn,
  User, ShoppingBag, LogOut, ChevronDown, Settings,
} from "lucide-react";
import { v } from "./pageUtils";
import { OutlineFillButton } from "./ui/outline-fill-button";
import logoImg from "figma:asset/96ba032e79ced81c434670f79a081ab5567b7ae9.png";

const NAV_LINKS = [
  { label: "Beranda",   path: "/" },
  { label: "Produk",    path: "/produk" },
  { label: "Jasa & Sewa", path: "/jasa-sewa" },
  { label: "Perangkat", path: "/perangkat" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Profile",   path: "/profile" },
];

/* ── Role helper ──────────────────────────────────────────────────
   Cart is only rendered for the "customer" role.
   The role is persisted to localStorage under the key "ma_role".
───────────────────────────────────────────────────────────────── */
function useUserRole() {
  const [role, setRole] = useState<string>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("ma_role") ?? "guest")
      : "guest"
  );

  useEffect(() => {
    const sync = () => setRole(localStorage.getItem("ma_role") ?? "guest");
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return role;
}

/* ── Theme Toggle ─────────────────────────────────────────────── */
function ThemeToggle({ forceLight = false }: { forceLight?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div
        className="w-9 h-9 rounded-full"
        style={{ background: v("--c-bg-sec") }}
      />
    );

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
      style={{
        background: forceLight ? "rgba(255,255,255,0.12)" : v("--c-bg-sec"),
        border: `1px solid ${forceLight ? "rgba(255,255,255,0.25)" : v("--c-border")}`,
        transition: "all 300ms",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ y: -16, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 16, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.22 }}
          >
            {/* Sun uses the accent colour from the active theme */}
            <Sun size={15} style={{ color: "var(--c-accent)" }} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -16, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 16, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.22 }}
          >
            {/* Moon uses white on transparent hero, primary colour otherwise */}
            <Moon size={15} style={{ color: forceLight ? "#fff" : "var(--c-primary)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── App Navbar ───────────────────────────────────────────────── */
export function AppNavbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location  = useLocation();
  const isHome    = location.pathname === "/";
  const userRole  = useUserRole();
  const dropRef   = useRef<HTMLDivElement>(null);
  const navigate  = useNavigate();

  const showCart     = userRole === "customer";
  const isLoggedIn   = userRole === "customer";
  const showScrolled = !isHome || scrolled;

  useEffect(() => {
    setScrolled(window.scrollY > 64);
    const fn = () => setScrolled(window.scrollY > 64);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ma_role");
    window.dispatchEvent(new Event("storage"));
    setDropdownOpen(false);
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: showScrolled ? v("--c-nav-glass") : "transparent",
          backdropFilter: showScrolled ? "blur(14px)" : "none",
          borderBottom: showScrolled
            ? `1px solid ${v("--c-border")}`
            : "none",
          transition: "background 300ms, backdrop-filter 300ms, border 300ms",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img
                src={logoImg}
                alt="Malikussaleh Advertising"
                className="w-16 h-16 object-contain"
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {NAV_LINKS.map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/"}
                  className="text-sm font-medium transition-colors duration-200"
                  style={({ isActive }) => ({
                    color: isActive
                      ? v("--c-accent")
                      : showScrolled
                      ? v("--c-text-sec")
                      : "rgba(255,255,255,0.85)",
                    fontFamily: "'Inter',sans-serif",
                    fontWeight: isActive ? "600" : "500",
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle forceLight={!showScrolled} />

            {/* Cart — only rendered when role === "customer" */}
            {showCart && (
              <Link to="/keranjang" aria-label="Keranjang belanja">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    background: showScrolled ? v("--c-bg-sec") : "rgba(255,255,255,0.12)",
                    border: `1px solid ${showScrolled ? v("--c-border") : "rgba(255,255,255,0.25)"}`,
                  }}
                >
                  <ShoppingCart
                    size={15}
                    style={{ color: showScrolled ? v("--c-text-sec") : "rgba(255,255,255,0.8)" }}
                  />
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: v("--c-accent") }}
                    aria-label="2 item di keranjang"
                  >
                    2
                  </span>
                </motion.div>
              </Link>
            )}

            {/* USER AVATAR DROPDOWN (logged-in customer) */}
            {isLoggedIn ? (
              <div className="relative hidden md:block" ref={dropRef}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer"
                  style={{
                    background: showScrolled ? v("--c-bg-sec") : "rgba(255,255,255,0.12)",
                    border: `1px solid ${showScrolled ? v("--c-border") : "rgba(255,255,255,0.25)"}`,
                  }}
                >
                  {/* Avatar circle */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "var(--c-gradient-r)" }}
                  >
                    B
                  </div>
                  <span
                    className="text-xs font-semibold hidden lg:block"
                    style={{ color: showScrolled ? v("--c-text") : "#fff", fontFamily: "'Inter',sans-serif" }}
                  >
                    Budi
                  </span>
                  <ChevronDown
                    size={13}
                    style={{
                      color: showScrolled ? v("--c-text-sec") : "rgba(255,255,255,0.7)",
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </motion.button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: v("--c-card"),
                        border: `1px solid ${v("--c-border")}`,
                        boxShadow: v("--c-shadow-hover"),
                      }}
                    >
                      {/* User info header */}
                      <div
                        className="px-4 py-3 flex items-center gap-3"
                        style={{ borderBottom: `1px solid ${v("--c-border")}` }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: "var(--c-gradient-r)" }}
                        >
                          B
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Budi Santoso</p>
                          <p className="text-xs truncate" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>budi@email.com</p>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        {[
                          { Icon: User,        label: "Profil Saya",      to: "/profil"      },
                          { Icon: ShoppingBag, label: "Pesanan Saya",     to: "/pesanan"     },
                          { Icon: Settings,    label: "Pengaturan",       to: "/pengaturan"  },
                        ].map(({ Icon, label, to }) => (
                          <Link
                            key={label}
                            to={to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-opacity-60"
                            style={{
                              color: v("--c-text"),
                              fontFamily: "'Inter',sans-serif",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(46,125,50,0.07)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <Icon size={15} style={{ color: v("--c-primary") }} />
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div style={{ borderTop: `1px solid ${v("--c-border")}` }} className="py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-all duration-150"
                          style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.06)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <LogOut size={15} style={{ color: "#DC2626" }} />
                          Keluar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Login button — only shown when NOT logged in */
              <OutlineFillButton
                direction="up"
                duration={0.3}
                baseBackground="#2E7D32"
                fillBackground="linear-gradient(to right, #FDD835, #FFB300)"
                borderValue="none"
                textColor="#ffffff"
                filledTextColor="#1B5E20"
                contentClassName="px-3 py-1.5 font-semibold text-xs"
                className="hidden md:inline-flex"
                onClick={() => navigate("/login")}
              >
                <LogIn size={13} aria-hidden="true" /> Masuk
              </OutlineFillButton>
            )}

            {/* Hamburger (mobile) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl"
              style={{
                color: showScrolled ? v("--c-text") : "#fff",
                background: "transparent",
              }}
            >
              <Menu size={20} />
            </motion.button>
          </div>
        </div>

        {/* Gradient accent line */}
        <div className="h-px" style={{ background: v("--c-gradient-r") }} />
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi"
              className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                background: v("--c-card"),
                borderRight: `1px solid ${v("--c-border")}`,
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: `1px solid ${v("--c-border")}` }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={logoImg}
                    alt="Malikussaleh Advertising"
                    className="w-9 h-9 object-contain"
                  />
                  <span
                    className="font-['Poppins',sans-serif] font-bold text-sm"
                    style={{ color: v("--c-text") }}
                  >
                    Menu
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  aria-label="Tutup menu"
                  style={{ color: v("--c-text-sec") }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Mobile user info (if logged in) */}
              {isLoggedIn && (
                <div
                  className="flex items-center gap-3 px-4 py-3 mx-4 mt-4 rounded-2xl"
                  style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--c-gradient-r)" }}
                  >
                    B
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Budi Santoso</p>
                    <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Silver Member</p>
                  </div>
                </div>
              )}

              {/* Drawer nav links */}
              <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map(({ label, path }, i) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={path === "/"}
                    onClick={() => setMobileOpen(false)}
                  >
                    {({ isActive }) => (
                      <motion.span
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                        style={{
                          color: isActive ? v("--c-primary") : v("--c-text"),
                          background: isActive ? v("--c-bg-sec") : "transparent",
                          fontFamily: "'Inter',sans-serif",
                          fontWeight: isActive ? "600" : "500",
                        }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </NavLink>
                ))}

                {/* Mobile profil link (if logged in) */}
                {isLoggedIn && (
                  <>
                    <div className="h-px my-2" style={{ background: v("--c-border") }} />
                    {[
                      { Icon: User,        label: "Profil Saya",  to: "/profil"  },
                      { Icon: ShoppingBag, label: "Pesanan Saya", to: "/pesanan" },
                    ].map(({ Icon, label, to }, i) => (
                      <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}>
                        {({ isActive }) => (
                          <motion.span
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: (NAV_LINKS.length + i) * 0.07 }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                            style={{
                              color: isActive ? v("--c-primary") : v("--c-text"),
                              background: isActive ? v("--c-bg-sec") : "transparent",
                              fontFamily: "'Inter',sans-serif",
                            }}
                          >
                            <Icon size={14} style={{ color: isActive ? v("--c-accent") : v("--c-text-sec") }} />
                            {label}
                          </motion.span>
                        )}
                      </NavLink>
                    ))}
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left"
                      style={{ color: "#DC2626", fontFamily: "'Inter',sans-serif" }}
                    >
                      <LogOut size={14} style={{ color: "#DC2626" }} /> Keluar
                    </button>
                  </>
                )}
              </nav>

              <div className="mt-auto p-4">
                {isLoggedIn ? (
                  <Link
                    to="/profil"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold text-sm text-white min-h-[44px]"
                    style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter', sans-serif" }}
                  >
                    <User size={15} aria-hidden="true" /> Lihat Profil Saya
                  </Link>
                ) : (
                  <a
                    href="https://wa.me/081234567890"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold text-sm text-white min-h-[44px]"
                    style={{ background: "var(--c-gradient-r)", fontFamily: "'Inter', sans-serif" }}
                  >
                    <MessageCircle size={15} aria-hidden="true" /> Hubungi Kami
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}