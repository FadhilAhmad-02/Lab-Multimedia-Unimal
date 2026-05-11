import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, ShoppingBag, Package, Users, DollarSign,
  BarChart2, Settings, ChevronLeft, ChevronRight, Bell,
  Menu, X, Printer, LogOut, User, ChevronDown,
  ShoppingCart, CreditCard, CheckCircle, Boxes,
} from "lucide-react";
import { v } from "./pageUtils";

const MENU = [
  { path: "/admin",            label: "Dashboard",    Icon: LayoutDashboard, end: true },
  { path: "/admin/pesanan",    label: "Pesanan",      Icon: ShoppingBag },
  { path: "/admin/produk",     label: "Produk",       Icon: Package },
  { path: "/admin/perangkat", label: "Perangkat",   Icon: Boxes },
  { path: "/admin/pengguna",   label: "Pengguna",     Icon: Users },
  { path: "/admin/keuangan",   label: "Keuangan",     Icon: DollarSign },
  { path: "/admin/laporan",    label: "Laporan",      Icon: BarChart2 },
  { path: "/admin/pengaturan", label: "Pengaturan",   Icon: Settings },
];

const SIDEBAR_BG = "#1B5E20";   /* deep green sidebar */

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumb = MENU.find(m => location.pathname.startsWith(m.path) && m.path !== "/admin") || MENU[0];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 mb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--c-gradient-r)" }}>
          <Printer size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm font-['Poppins',sans-serif]">Admin Panel</p>
            <p className="text-white/40 text-xs font-['Inter',sans-serif]">Malikussaleh Adv.</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/40 hover:text-white"><X size={16} /></button>
        )}
      </div>

      {/* Menu label */}
      {!collapsed && <p className="px-5 text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter',sans-serif" }}>NAVIGASI</p>}

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {MENU.map(({ path, label, Icon, end }) => (
          <NavLink key={path} to={path} end={end} onClick={() => onClose?.()}>
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive ? "rgba(46,125,50,0.18)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--c-accent)" : "3px solid transparent",
                }}
                onMouseEnter={e => !isActive && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={e => !isActive && ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <Icon size={16} style={{ color: isActive ? "var(--c-accent)" : "rgba(255,255,255,0.5)", flexShrink: 0 }} />
                {!collapsed && (
                  <span className="text-sm font-medium font-['Inter',sans-serif]" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.55)" }}>
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--c-gradient-r)" }}>
            <User size={12} className="text-white" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold font-['Poppins',sans-serif] truncate">Super Admin</p>
                <p className="text-white/35 text-xs font-['Inter',sans-serif]">admin</p>
              </div>
              <button onClick={() => navigate("/login")} className="text-white/35 hover:text-red-400 transition-colors">
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: v("--c-bg") }}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col flex-shrink-0 relative overflow-hidden"
        style={{ background: SIDEBAR_BG }}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-md"
          style={{ background: "var(--c-accent)", color: "#fff" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col" style={{ background: SIDEBAR_BG }} initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 h-14 flex-shrink-0 z-30" style={{ background: v("--c-card"), borderBottom: `1px solid ${v("--c-border")}` }}>
          <button onClick={() => setMobileOpen(true)} className="md:hidden" style={{ color: v("--c-text-sec") }}><Menu size={20} /></button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
            <span>Admin</span>
            <ChevronRight size={12} />
            <span style={{ color: v("--c-text") }}>{breadcrumb.label}</span>
          </div>

          <div className="flex-1" />

          {/* Notif */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
              <Bell size={15} style={{ color: v("--c-text-sec") }} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: "#EF4444" }}>8</span>
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <div className="p-4" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                    <p className="font-semibold text-sm" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>Notifikasi</p>
                  </div>
                  {([
                    { Icon: ShoppingCart, text: "Pesanan baru dari Budi Santoso",      color: "var(--c-primary)" },
                    { Icon: CreditCard,   text: "Pembayaran dikonfirmasi #ORD-042",     color: "#10B981" },
                    { Icon: CheckCircle,  text: "Pesanan #ORD-039 selesai diproduksi",  color: "#10B981" },
                  ] as const).map(({ Icon: NIcon, text, color }, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3" style={{ borderBottom: `1px solid ${v("--c-border")}` }}>
                      <NIcon size={14} className="flex-shrink-0 mt-0.5" style={{ color }} aria-hidden="true" />
                      <p className="text-xs" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{text}</p>
                    </div>
                  ))}
                  <div className="p-3 text-center">
                    <button className="text-xs font-semibold" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Lihat Semua Notifikasi</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--c-gradient-r)" }}>
                <User size={14} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium" style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}>Super Admin</span>
              <ChevronDown size={14} style={{ color: v("--c-text-sec") }} />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-11 w-44 rounded-xl shadow-xl z-50" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                  <button onClick={() => navigate("/login")} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-xl" style={{ fontFamily: "'Inter',sans-serif" }}>
                    <LogOut size={14} /> Keluar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: v("--c-bg") }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}