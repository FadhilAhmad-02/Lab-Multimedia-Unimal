import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, ListOrdered, Calendar, ShoppingBag,
  ChevronLeft, ChevronRight, Bell, Menu, X, Printer,
  LogOut, User, Clock,
} from "lucide-react";
import { v } from "./pageUtils";

const MENU = [
  { path: "/operator",          label: "Dashboard",   Icon: LayoutDashboard, end: true },
  { path: "/operator/antrian",  label: "Antrian",     Icon: ListOrdered },
  { path: "/operator/kalender", label: "Kalender",    Icon: Calendar },
];

const SIDEBAR_BG           = "#1B5E20";           /* deep green — matches footer */
const SIDEBAR_HOVER        = "rgba(255,255,255,0.08)";
const SIDEBAR_ACTIVE       = "rgba(46,125,50,0.22)";  /* green tint */
const SIDEBAR_ACTIVE_BORDER = "var(--c-accent)";      /* golden yellow */

export function OperatorLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 mb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--c-gradient-r)" }}>
          <Printer size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm font-['Poppins',sans-serif]">Operator</p>
            <p className="text-white/50 text-xs font-['Inter',sans-serif]">Malikussaleh Adv.</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/60 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Shift badge */}
      {!collapsed && (
        <div className="mx-3 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-xs font-['Inter',sans-serif]">Shift Pagi Aktif</span>
          </div>
          <p className="text-white/40 text-xs mt-0.5 font-['Inter',sans-serif]">{timeStr} · {dateStr.split(",")[0]}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-1">
        {MENU.map(({ path, label, Icon, end }) => (
          <NavLink key={path} to={path} end={end} onClick={() => onClose?.()}>
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? SIDEBAR_ACTIVE : "transparent",
                  borderLeft: isActive ? `3px solid ${SIDEBAR_ACTIVE_BORDER}` : "3px solid transparent",
                }}
                onMouseEnter={e => !isActive && ((e.currentTarget as HTMLElement).style.background = SIDEBAR_HOVER)}
                onMouseLeave={e => !isActive && ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <Icon size={17} style={{ color: isActive ? "var(--c-accent)" : "rgba(255,255,255,0.65)", flexShrink: 0 }} />
                {!collapsed && <span className="text-sm font-medium font-['Inter',sans-serif]" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.65)" }}>{label}</span>}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--c-gradient-r)" }}>
            <User size={12} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold font-['Poppins',sans-serif] truncate">Ahmad Operator</p>
              <p className="text-white/40 text-xs font-['Inter',sans-serif]">operator</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={() => navigate("/login")} title="Logout" className="text-white/40 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: v("--c-bg") }}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col flex-shrink-0 relative overflow-hidden"
        style={{ background: SIDEBAR_BG }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-lg"
          style={{ background: "var(--c-accent)", color: "#fff" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col" style={{ background: SIDEBAR_BG }} initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 h-14 flex-shrink-0" style={{ background: v("--c-card"), borderBottom: `1px solid ${v("--c-border")}` }}>
          <button onClick={() => setMobileOpen(true)} className="md:hidden" style={{ color: v("--c-text-sec") }}><Menu size={20} /></button>
          <div className="flex items-center gap-1.5">
            <Clock size={14} style={{ color: v("--c-text-sec") }} />
            <span className="text-sm font-['Inter',sans-serif]" style={{ color: v("--c-text-sec") }}>{timeStr}</span>
          </div>
          <div className="flex-1" />
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
            <Bell size={15} style={{ color: v("--c-text-sec") }} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: "var(--c-accent)" }}>5</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}